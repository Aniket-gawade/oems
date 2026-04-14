import { useId, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly hint?: string;
  readonly error?: string;
}

export const Select = ({ error, hint, id, label, options, ...selectProps }: SelectProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <label className="field" htmlFor={controlId}>
      <span className="field__label">{label}</span>
      <select
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        className={`field__control${error ? " field__control--error" : ""}`}
        id={controlId}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="field__hint" id={hintId}>{hint}</span> : null}
      {error ? (
        <span className="field__error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
};
