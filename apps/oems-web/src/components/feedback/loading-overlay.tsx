interface LoadingOverlayProps {
  readonly active: boolean;
  readonly message?: string;
}

export const LoadingOverlay = ({ active, message = "Processing..." }: LoadingOverlayProps) => {
  if (!active) {
    return null;
  }

  return (
    <div aria-live="polite" className="loading-overlay" role="status">
      <div className="loading-overlay__spinner" />
      <p className="loading-overlay__message">{message}</p>
    </div>
  );
};
