import { useMemo, useState } from "react";
import { DataTable, type TableColumn } from "@/components/data/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingOverlay } from "@/components/feedback/loading-overlay";
import { Skeleton } from "@/components/feedback/skeleton";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { NumberInput } from "@/components/primitives/number-input";
import { Select } from "@/components/primitives/select";
import { PageFrame } from "@/pages/page-frame";

interface DemoRow {
  readonly id: string;
  readonly name: string;
  readonly status: "NEW" | "REJECTED";
}

const DEMO_ROWS: readonly DemoRow[] = [
  { id: "1", name: "Sample New", status: "NEW" },
  { id: "2", name: "Sample Rejected", status: "REJECTED" }
];

export const ComponentDocsPage = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const columns = useMemo<readonly TableColumn<DemoRow>[]>(
    () => [
      { header: "Name", id: "name", renderCell: (row) => row.name },
      { header: "Status", id: "status", renderCell: (row) => <StatusBadge status={row.status} /> }
    ],
    []
  );

  return (
    <PageFrame description="Interactive docs route for shell primitives and states." title="Component Docs">
      <div className="panel-stack">
        <section className="panel">
          <h2>Form primitives</h2>
          <div className="form-grid">
            <Input label="Input" placeholder="Input primitive" />
            <Select
              label="Select"
              options={[
                { label: "Option A", value: "a" },
                { label: "Option B", value: "b" }
              ]}
            />
            <NumberInput label="NumberInput" min={0} step="0.1" />
            <div className="button-row">
              <Button type="button">Primary</Button>
              <Button type="button" variant="secondary">
                Secondary
              </Button>
              <Button type="button" variant="danger">
                Danger
              </Button>
            </div>
          </div>
        </section>

        <section className="panel loading-region">
          <LoadingOverlay active={showOverlay} message="Previewing overlay..." />
          <h2>States and feedback</h2>
          <div className="button-row">
            <Button onClick={() => setShowOverlay((current) => !current)} type="button" variant="ghost">
              Toggle overlay
            </Button>
          </div>
          <div className="inline-stack">
            <StatusBadge status="NEW" />
            <StatusBadge status="REJECTED" />
            <Skeleton width="40%" />
          </div>
          <EmptyState description="Empty placeholder for list responses." title="Empty state" />
          <ErrorState description="Retry action example for recoverable failures." onRetry={() => {}} title="Error state" />
        </section>

        <section className="panel">
          <h2>Table primitive</h2>
          <DataTable columns={columns} getRowId={(row) => row.id} rows={DEMO_ROWS} />
        </section>
      </div>
    </PageFrame>
  );
};
