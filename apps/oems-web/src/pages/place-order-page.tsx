import { useMemo, useState, type FormEvent } from "react";
import { useNotifications } from "@/app/providers/notification-provider";
import { LoadingOverlay } from "@/components/feedback/loading-overlay";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { NumberInput } from "@/components/primitives/number-input";
import { Select } from "@/components/primitives/select";
import { PageFrame } from "@/pages/page-frame";

export const PlaceOrderPage = () => {
  const { notify } = useNotifications();
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("LIMIT");
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("182.50");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const requiresPrice = orderType === "LIMIT";
  const notionalPreview = useMemo(() => {
    const qty = Number(quantity);
    const px = Number(price);
    if (!Number.isFinite(qty) || !Number.isFinite(px)) {
      return "N/A";
    }

    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(qty * px);
  }, [price, quantity]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (requiresPrice && !price.trim()) {
      setFormError("Price is required for LIMIT orders.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 800);
    });

    notify({
      message: `${side} ${quantity} ${symbol} (${orderType}) submitted in mock mode.`,
      severity: "success",
      title: "Order submitted"
    });
    setSubmitting(false);
  };

  return (
    <PageFrame description="Reusable form primitives and blocking submit overlay baseline." title="Place Order">
      <section className="panel loading-region">
        <LoadingOverlay active={submitting} message="Submitting order..." />
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Symbol" onChange={(event) => setSymbol(event.target.value)} value={symbol} />
          <Select
            label="Side"
            onChange={(event) => setSide(event.target.value)}
            options={[
              { label: "Buy", value: "BUY" },
              { label: "Sell", value: "SELL" }
            ]}
            value={side}
          />
          <Select
            label="Order type"
            onChange={(event) => setOrderType(event.target.value)}
            options={[
              { label: "Limit", value: "LIMIT" },
              { label: "Market", value: "MARKET" }
            ]}
            value={orderType}
          />
          <NumberInput
            label="Quantity"
            min={1}
            onChange={(event) => setQuantity(event.target.value)}
            step="1"
            value={quantity}
          />
          {requiresPrice ? (
            <NumberInput
              label="Price"
              min={0}
              onChange={(event) => setPrice(event.target.value)}
              step="0.01"
              value={price}
            />
          ) : null}
          <p className="notional-preview">Notional preview: {notionalPreview}</p>
          {formError ? <p className="form-error">{formError}</p> : null}
          <Button isLoading={submitting} type="submit">
            Submit
          </Button>
        </form>
      </section>
    </PageFrame>
  );
};
