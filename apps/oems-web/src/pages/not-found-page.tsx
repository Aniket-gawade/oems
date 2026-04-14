import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <main className="public-page">
    <section className="auth-card">
      <h1>Page not found</h1>
      <p>The URL does not map to an OEMS route.</p>
      <Link className="button button--secondary" to="/">
        Return to home
      </Link>
    </section>
  </main>
);
