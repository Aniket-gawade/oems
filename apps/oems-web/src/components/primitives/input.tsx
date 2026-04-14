import { useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

export const Input = ({ error, hint, id, label, ...inputProps }: InputProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <label className="field" htmlFor={controlId}>
      <span className="field__label">{label}</span>
      <input
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        className={`field__control${error ? " field__control--error" : ""}`}
        id={controlId}
        {...inputProps}
      />
      {hint ? <span className="field__hint" id={hintId}>{hint}</span> : null}
      {error ? (
        <span className="field__error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
};
