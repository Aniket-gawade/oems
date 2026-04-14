import { EmptyState } from "@/components/feedback/empty-state";
import { PageFrame } from "@/pages/page-frame";

export const OpsDashboardPage = () => (
  <PageFrame description="Operations landing page and role-gated shell section." title="Ops Dashboard">
    <EmptyState
      description="Use the audit routes to inspect order events and payload traces."
      title="No active incidents"
    />
  </PageFrame>
);
