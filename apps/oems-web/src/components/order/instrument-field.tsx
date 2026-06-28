import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useInstrument } from "@/api/hooks/use-instrument";
import { isInstrumentNotFound } from "@/api/services/instrument.service";
import type { GetInstrumentOutcome } from "@/api/services/instrument.service";
import { Input } from "@/components/primitives/input";
import { normalizeSymbol } from "@/lib/order-validation";
import type { InstrumentResponse } from "@/api/types";

interface InstrumentFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onConstraintsChange?: (instrument: InstrumentResponse | null) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

/**
 * Instrument symbol input with live API lookup on blur.
 * Reports resolved instrument constraints back to the parent via onConstraintsChange.
 */
export const InstrumentField = ({
  disabled,
  error,
  onChange,
  onConstraintsChange,
  value
}: InstrumentFieldProps) => {
  const [lookupSymbol, setLookupSymbol] = useState<string | null>(null);

  const state = useInstrument(lookupSymbol);

  const handleBlur = () => {
    const normalized = normalizeSymbol(value);
    if (normalized && normalized !== lookupSymbol) {
      setLookupSymbol(normalized);
      onConstraintsChange?.(null); // reset constraints while re-fetching
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeSymbol(event.target.value);
    onChange(normalized);
    if (lookupSymbol && normalized !== lookupSymbol) {
      setLookupSymbol(null);
      onConstraintsChange?.(null);
    }
  };

  const lookupState = useMemo<{
    readonly error?: string;
    readonly hint?: string;
    readonly instrument: InstrumentResponse | null;
  }>(() => {
    let lookupError = error;
    let hint: string | undefined;
    let instrument: InstrumentResponse | null = null;

    if (lookupSymbol && state.status === "success") {
      const result: GetInstrumentOutcome = state.data;
      if (isInstrumentNotFound(result)) {
        lookupError = `Symbol "${lookupSymbol}" was not found.`;
      } else {
        instrument = result.instrument;
        if (!instrument.tradable) {
          lookupError = `${lookupSymbol} is currently halted and not available for trading.`;
          instrument = null;
        } else {
          hint = `Qty: ${instrument.minQty}-${instrument.maxQty}; Tick: ${instrument.tickSize}`;
        }
      }
    } else if (lookupSymbol && state.status === "error") {
      lookupError = "Could not verify this symbol. Please check your connection.";
    } else if (lookupSymbol && state.status === "loading") {
      hint = "Verifying symbol...";
    }

    return { error: lookupError, hint, instrument };
  }, [error, lookupSymbol, state]);

  useEffect(() => {
    if (!lookupSymbol) {
      return;
    }

    onConstraintsChange?.(lookupState.instrument);
  }, [lookupState.instrument, lookupSymbol, onConstraintsChange]);

  return (
    <div className="instrument-field">
      <Input
        autoCapitalize="characters"
        autoComplete="off"
        disabled={disabled}
        error={lookupState.error}
        hint={lookupState.hint}
        label="Symbol"
        maxLength={12}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="e.g. AAPL"
        spellCheck={false}
        type="text"
        value={value}
      />
    </div>
  );
};
