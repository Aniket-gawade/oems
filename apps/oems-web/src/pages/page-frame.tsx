import type { ReactNode } from "react";

interface PageFrameProps {
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
}

export const PageFrame = ({ children, description, title }: PageFrameProps) => (
  <section className="page-frame">
    <header className="page-frame__header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
    {children}
  </section>
);
