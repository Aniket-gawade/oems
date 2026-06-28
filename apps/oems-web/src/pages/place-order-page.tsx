import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { usePlaceOrder } from "@/api/hooks/use-order";
import { generateIdempotencyKey } from "@/api/idempotency";
import {
  isPlaceOrderAccepted,
  isPlaceOrderConflict,
  isPlaceOrderReplay,
  isPlaceOrderRejected
} from "@/api/services/order.service";
import { getErrorMessage, getRiskRejectLabel, isRiskRejectCode, mapFieldErrors } from "@/api/error";
import { parseApiError } from "@/api/error";
import type { PlaceOrderOutcome } from "@/api/services/order.service";
import type { InstrumentResponse } from "@/api/types";
import { useSubmissionHistory } from "@/app/providers/submission-history-provider";
import { useNotifications } from "@/app/providers/notification-provider";
import { runtimeConfig } from "@/config/runtime";
import { InstrumentField } from "@/components/order/instrument-field";
import { StatusBadge } from "@/components/feedback/status-badge";
import { LoadingOverlay } from "@/components/feedback/loading-overlay";
import { Button } from "@/components/primitives/button";
import { NumberInput } from "@/components/primitives/number-input";
import { Select } from "@/components/primitives/select";
import { PageFrame } from "@/pages/page-frame";
import {
  validateOrderForm,
  isValidOrderForm,
  isLargeNotional,
  calcNotional,
  formatNotional,
  normalizeSymbol,
  toOrderSide,
  toOrderType,
  type OrderValidationErrors
} from "@/lib/order-validation";

const DEFAULT_FORM = {
  symbol: "",
  side: "BUY",
  orderType: "LIMIT",
  quantity: "",
  price: ""
} as const;

export const PlaceOrderPage = () => {
  const { notify } = useNotifications();
  const { addSubmission } = useSubmissionHistory();
  const { mutateAsync, isPending, reset: resetMutation } = usePlaceOrder();

  const [symbol, setSymbol] = useState<string>(DEFAULT_FORM.symbol);
  const [side, setSide] = useState<string>(DEFAULT_FORM.side);
  const [orderType, setOrderType] = useState<string>(DEFAULT_FORM.orderType);
  const [quantity, setQuantity] = useState<string>(DEFAULT_FORM.quantity);
  const [price, setPrice] = useState<string>(DEFAULT_FORM.price);
  const [instrument, setInstrument] = useState<InstrumentResponse | null>(null);

  const [fieldErrors, setFieldErrors] = useState<OrderValidationErrors>({});
  const [outcome, setOutcome] = useState<PlaceOrderOutcome | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const submitInFlightRef = useRef(false);

  const [confirmingLargeNotional, setConfirmingLargeNotional] = useState(false);
  const [qaEditedSymbol, setQaEditedSymbol] = useState("");
  const [qaDebugMode, setQaDebugMode] = useState<"none" | "replay" | "conflict">("none");

  const requiresPrice = orderType === "LIMIT";

  const notional = useMemo(
    () => (requiresPrice ? calcNotional(quantity, price) : null),
    [price, quantity, requiresPrice]
  );

  const notionalDisplay = notional !== null ? formatNotional(notional) : "N/A";

  const handleNewOrder = useCallback(() => {
    setSymbol(DEFAULT_FORM.symbol);
    setSide(DEFAULT_FORM.side);
    setOrderType(DEFAULT_FORM.orderType);
    setQuantity(DEFAULT_FORM.quantity);
    setPrice(DEFAULT_FORM.price);
    setInstrument(null);
    setFieldErrors({});
    setOutcome(null);
    setNetworkError(null);
    setConfirmingLargeNotional(false);
    setQaDebugMode("none");
    setQaEditedSymbol("");
    submitInFlightRef.current = false;
    idempotencyKeyRef.current = generateIdempotencyKey();
    resetMutation();
  }, [resetMutation]);

  const doSubmit = useCallback(
    async (isRetryWithSameKey = false, overrideSymbol?: string) => {
      if (submitInFlightRef.current) {
        return;
      }

      submitInFlightRef.current = true;
      setNetworkError(null);
      setOutcome(null);

      const effectiveSymbol = overrideSymbol ?? normalizeSymbol(symbol);

      const formValues = { symbol: effectiveSymbol, side, orderType, quantity, price };
      const errors = validateOrderForm(formValues);

      try {
        if (!isValidOrderForm(errors)) {
          setFieldErrors(errors);
          return;
        }

        setFieldErrors({});

        const result = await mutateAsync({
          payload: {
            clientOrderId: idempotencyKeyRef.current,
            symbol: effectiveSymbol,
            side: toOrderSide(side),
            orderType: toOrderType(orderType),
            quantity: Number(quantity),
            price: requiresPrice ? Number(price) : null
          },
          idempotencyKey: idempotencyKeyRef.current,
          isRetryWithSameKey
        });

        setOutcome(result);

        if (isPlaceOrderAccepted(result) || isPlaceOrderReplay(result)) {
          addSubmission(result.response);
          notify({
            title: isPlaceOrderReplay(result) ? "Order replayed" : "Order submitted",
            message: `Order ${result.response.orderId} - ${result.response.status}`,
            severity: "success"
          });
        } else if (isPlaceOrderRejected(result)) {
          notify({
            title: "Order rejected",
            message: getErrorMessage(result.code),
            severity: "warning"
          });
        }
      } catch (error) {
        const parsed = parseApiError(error);
        setNetworkError(getErrorMessage(parsed.code));
        const backendFieldErrors = mapFieldErrors(parsed);
        if (Object.keys(backendFieldErrors).length > 0) {
          setFieldErrors(backendFieldErrors as OrderValidationErrors);
        }
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [addSubmission, mutateAsync, notify, orderType, price, quantity, requiresPrice, side, symbol]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formValues = { symbol: normalizeSymbol(symbol), side, orderType, quantity, price };
    const errors = validateOrderForm(formValues);
    if (!isValidOrderForm(errors)) {
      setFieldErrors(errors);
      return;
    }

    if (requiresPrice && isLargeNotional(quantity, price) && !confirmingLargeNotional) {
      setConfirmingLargeNotional(true);
      return;
    }

    setConfirmingLargeNotional(false);
    await doSubmit();
  };

  const handleRetry = () => {
    void doSubmit(false);
  };

  const handleQaReplay = () => {
    setQaDebugMode("replay");
    void doSubmit(true);
  };

  const handleQaConflict = () => {
    setQaDebugMode("conflict");
    void doSubmit(false, qaEditedSymbol || "MSFT");
  };

  const renderOutcome = () => {
    if (!outcome) return null;

    if (isPlaceOrderAccepted(outcome) || isPlaceOrderReplay(outcome)) {
      const order = outcome.response;
      return (
        <section aria-live="polite" className="panel outcome-panel outcome-panel--success" role="status">
          <h2>{isPlaceOrderReplay(outcome) ? "Prior Order Replayed" : "Order Submitted"}</h2>
          <dl className="order-summary">
            <div className="order-summary__row">
              <dt>Order ID</dt>
              <dd>
                <Link to={`/orders/${order.orderId}`}>{order.orderId}</Link>
              </dd>
            </div>
            <div className="order-summary__row">
              <dt>Status</dt>
              <dd><StatusBadge status={order.status} /></dd>
            </div>
            <div className="order-summary__row">
              <dt>Symbol</dt>
              <dd>{order.symbol}</dd>
            </div>
            <div className="order-summary__row">
              <dt>Side</dt>
              <dd>{order.side}</dd>
            </div>
            <div className="order-summary__row">
              <dt>Qty</dt>
              <dd>{order.quantity}</dd>
            </div>
            {order.price != null && (
              <div className="order-summary__row">
                <dt>Price</dt>
                <dd>{order.price}</dd>
              </div>
            )}
          </dl>
          {isPlaceOrderReplay(outcome) && (
            <p className="outcome-panel__notice">
              This is the original outcome for idempotency key <code>{outcome.idempotencyKey}</code>.
            </p>
          )}
          <Button onClick={handleNewOrder} type="button" variant="secondary">
            Place another order
          </Button>
        </section>
      );
    }

    if (isPlaceOrderRejected(outcome)) {
      const isRisk = isRiskRejectCode(outcome.code);
      const riskLabel = getRiskRejectLabel(outcome.code);
      return (
        <section aria-live="polite" className="panel outcome-panel outcome-panel--rejected" role="alert">
          <h2>Order Rejected{riskLabel ? ` - ${riskLabel}` : ""}</h2>
          <p className="outcome-panel__message">{getErrorMessage(outcome.code)}</p>
          {isRisk && (
            <p className="outcome-panel__hint">
              {outcome.code === "RISK_MAX_QTY_EXCEEDED" &&
                "Reduce the quantity to within your allowed limit and resubmit."}
              {outcome.code === "RISK_MAX_NOTIONAL_EXCEEDED" &&
                "Adjust the price or quantity so the notional value is within your allowed limit."}
              {outcome.code === "RISK_PRICE_BAND_EXCEEDED" &&
                "Enter a price closer to the current market reference price."}
            </p>
          )}
          {outcome.traceId && (
            <p className="outcome-panel__trace">Reference: <code>{outcome.traceId}</code></p>
          )}
          <div className="outcome-panel__actions">
            <Button onClick={handleNewOrder} type="button" variant="secondary">
              Edit order
            </Button>
          </div>
        </section>
      );
    }

    if (isPlaceOrderConflict(outcome)) {
      return (
        <section aria-live="polite" className="panel outcome-panel outcome-panel--conflict" role="alert">
          <h2>Submission Key Conflict</h2>
          <p className="outcome-panel__message">{getErrorMessage("IDEMPOTENCY_CONFLICT")}</p>
          {outcome.traceId && (
            <p className="outcome-panel__trace">Reference: <code>{outcome.traceId}</code></p>
          )}
          <Button onClick={handleNewOrder} type="button" variant="secondary">
            Start a new order
          </Button>
        </section>
      );
    }

    return null;
  };

  const showForm = !outcome;

  return (
    <PageFrame
      description="Submit buy or sell orders with real-time instrument validation and risk feedback."
      title="Place Order"
    >
      <div className="panel-stack">
        {showForm && (
          <section className="panel loading-region">
            <LoadingOverlay active={isPending} message="Submitting order..." />

            {confirmingLargeNotional && (
              <div className="confirmation-banner" role="alertdialog" aria-modal="true" aria-label="Large order confirmation">
                <p>
                  <strong>Large order:</strong> Notional value is{" "}
                  <strong>{notionalDisplay}</strong>. Confirm submission?
                </p>
                <div className="confirmation-banner__actions">
                  <Button onClick={() => { setConfirmingLargeNotional(false); void doSubmit(); }} type="button">
                    Confirm
                  </Button>
                  <Button onClick={() => setConfirmingLargeNotional(false)} type="button" variant="secondary">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <form aria-label="Place order" className="form-grid" id="place-order-form" onSubmit={(e) => { void handleSubmit(e); }}>
              <InstrumentField
                disabled={isPending}
                error={fieldErrors.symbol}
                onChange={setSymbol}
                onConstraintsChange={setInstrument}
                value={symbol}
              />

              {instrument && (
                <p className="field-hint" role="status">
                  {instrument.name}; Qty: {instrument.minQty}-{instrument.maxQty}; Tick: {instrument.tickSize}
                </p>
              )}

              <Select
                disabled={isPending}
                error={fieldErrors.side}
                label="Side"
                onChange={(e) => setSide(e.target.value)}
                options={[
                  { label: "Buy", value: "BUY" },
                  { label: "Sell", value: "SELL" }
                ]}
                value={side}
              />

              <Select
                disabled={isPending}
                error={fieldErrors.orderType}
                label="Order type"
                onChange={(e) => setOrderType(e.target.value)}
                options={[
                  { label: "Limit", value: "LIMIT" },
                  { label: "Market", value: "MARKET" }
                ]}
                value={orderType}
              />

              <NumberInput
                disabled={isPending}
                error={fieldErrors.quantity}
                label="Quantity"
                min={1}
                onChange={(e) => setQuantity(e.target.value)}
                step="1"
                value={quantity}
              />

              {requiresPrice && (
                <NumberInput
                  disabled={isPending}
                  error={fieldErrors.price}
                  label="Price"
                  min={0}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  value={price}
                />
              )}

              {requiresPrice && (
                <p aria-live="polite" className="notional-preview">
                  Notional preview: <strong>{notionalDisplay}</strong>
                </p>
              )}

              {networkError && (
                <div className="form-error" role="alert">
                  <p>{networkError}</p>
                  <Button onClick={handleRetry} type="button" variant="secondary">
                    Retry
                  </Button>
                </div>
              )}

              <Button
                disabled={isPending || confirmingLargeNotional}
                form="place-order-form"
                isLoading={isPending}
                type="submit"
              >
                Submit order
              </Button>
            </form>
          </section>
        )}

        {renderOutcome()}

        {!runtimeConfig.isProductionBuild && outcome && (isPlaceOrderAccepted(outcome) || isPlaceOrderReplay(outcome)) && (
          <section className="panel qa-panel" aria-label="QA debug controls">
            <h3>QA Debug Controls <span className="qa-panel__badge">Non-production</span></h3>
            <p className="qa-panel__note">
              Current idempotency key: <code>{idempotencyKeyRef.current}</code>
            </p>
            <div className="qa-panel__actions">
              {/* F123: resubmit same key → replay */}
              <Button
                disabled={isPending}
                onClick={handleQaReplay}
                type="button"
                variant="secondary"
              >
                Resubmit same key (replay test)
              </Button>

              <div className="qa-panel__conflict-row">
                <input
                  aria-label="Override symbol for conflict test"
                  className="field__control"
                  onChange={(e) => setQaEditedSymbol(e.target.value.toUpperCase())}
                  placeholder="Different symbol (e.g. MSFT)"
                  type="text"
                  value={qaEditedSymbol}
                />
                <Button
                  disabled={isPending}
                  onClick={handleQaConflict}
                  type="button"
                  variant="secondary"
                >
                  Same key, different payload (conflict test)
                </Button>
              </div>
            </div>
            {qaDebugMode !== "none" && (
              <p className="qa-panel__mode">
                Mode: <strong>{qaDebugMode === "replay" ? "Replay" : "Conflict"}</strong>
              </p>
            )}
          </section>
        )}
      </div>
    </PageFrame>
  );
};
