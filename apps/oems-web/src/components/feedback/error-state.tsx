import { Button } from "@/components/primitives/button";

interface ErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly traceId?: string;
  readonly onRetry?: () => void;
}

export const ErrorState = ({ description, onRetry, title, traceId }: ErrorStateProps) => (
  <section aria-live="assertive" className="error-state" role="alert">
    <h2 className="error-state__title">{title}</h2>
    <p className="error-state__description">{description}</p>
    {traceId ? <p className="error-state__trace">Trace ID: {traceId}</p> : null}
    {onRetry ? (
      <Button onClick={onRetry} type="button" variant="secondary">
        Retry
      </Button>
    ) : null}
  </section>
);
