import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly isLoading?: boolean;
}

export const Button = ({
  children,
  className,
  isLoading = false,
  variant = "primary",
  ...buttonProps
}: ButtonProps) => (
  <button
    className={`button button--${variant}${className ? ` ${className}` : ""}`}
    disabled={isLoading || buttonProps.disabled}
    {...buttonProps}
  >
    {isLoading ? <span className="button__spinner" /> : null}
    <span>{children}</span>
  </button>
);
