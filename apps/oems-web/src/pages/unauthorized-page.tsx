import { Link } from "react-router-dom";
import { PageFrame } from "@/pages/page-frame";

export const UnauthorizedPage = () => (
  <PageFrame description="You do not have permission to view this route with your current role." title="Unauthorized">
    <section className="panel">
      <p>Use a profile with the required role, or return to your allowed dashboard.</p>
      <Link className="button button--secondary" to="/">
        Go to role landing
      </Link>
    </section>
  </PageFrame>
);
