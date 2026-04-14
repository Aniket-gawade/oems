import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { DataTable, type TableColumn } from "@/components/data/data-table";
import { PageFrame } from "@/pages/page-frame";

interface AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly type: string;
}

const SAMPLE_EVENTS: readonly AuditEvent[] = [
  { id: "evt-1", timestamp: "2026-04-11T09:00:00Z", type: "ORDER_RECEIVED" },
  { id: "evt-2", timestamp: "2026-04-11T09:00:01Z", type: "ORDER_REJECTED" }
];

export const OpsAuditDetailPage = () => {
  const { orderId = "unknown" } = useParams();
  const columns = useMemo<readonly TableColumn<AuditEvent>[]>(
    () => [
      { header: "Time", id: "timestamp", renderCell: (row) => row.timestamp },
      { header: "Type", id: "type", renderCell: (row) => row.type },
      { header: "Event ID", id: "id", renderCell: (row) => row.id }
    ],
    []
  );

  return (
    <PageFrame description="Ops audit table primitive baseline." title={`Audit Detail: ${orderId}`}>
      <section className="panel">
        <DataTable columns={columns} getRowId={(row) => row.id} rows={SAMPLE_EVENTS} />
      </section>
    </PageFrame>
  );
};
