import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@/app/providers/notification-provider";
import { DataTable, type TableColumn } from "@/components/data/data-table";
import { Button } from "@/components/primitives/button";
import { StatusBadge } from "@/components/feedback/status-badge";
import { PageFrame } from "@/pages/page-frame";

interface DashboardOrder {
  readonly id: string;
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly status: "NEW" | "REJECTED";
}

const SAMPLE_ORDERS: readonly DashboardOrder[] = [
  { id: "ord-1024", side: "BUY", status: "NEW", symbol: "AAPL" },
  { id: "ord-1025", side: "SELL", status: "REJECTED", symbol: "TSLA" }
];

export const TraderDashboardPage = () => {
  const { notify } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const columns = useMemo<readonly TableColumn<DashboardOrder>[]>(
    () => [
      { header: "Order ID", id: "id", renderCell: (row) => row.id },
      { header: "Symbol", id: "symbol", renderCell: (row) => row.symbol },
      { header: "Side", id: "side", renderCell: (row) => row.side },
      {
        header: "Status",
        id: "status",
        renderCell: (row) => <StatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <PageFrame description="Role-aware dashboard shell for trader workflows." title="Trader Dashboard">
      <div className="panel-stack">
        <section className="panel">
          <div className="panel__header">
            <h2>Recent submissions</h2>
            <Button
              onClick={() =>
                notify({
                  message: "Trader dashboard baseline actions are available.",
                  severity: "success",
                  title: "UI ready"
                })
              }
              type="button"
              variant="secondary"
            >
              Show readiness toast
            </Button>
          </div>
          <DataTable
            columns={columns}
            emptyDescription="Orders will appear here after submissions begin."
            emptyTitle="No recent submissions"
            getRowId={(row) => row.id}
            loading={loading}
            rows={SAMPLE_ORDERS}
          />
        </section>
      </div>
    </PageFrame>
  );
};
