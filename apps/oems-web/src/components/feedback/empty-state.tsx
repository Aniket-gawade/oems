import type { ReactNode } from "react";

interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}

export const EmptyState = ({ action, description, title }: EmptyStateProps) => (
  <section aria-live="polite" className="empty-state">
    <h2 className="empty-state__title">{title}</h2>
    <p className="empty-state__description">{description}</p>
    {action ? <div className="empty-state__action">{action}</div> : null}
  </section>
);
