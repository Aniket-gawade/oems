/**
 * Trader Dashboard page (F127, F128).
 * Shows session-scoped submission history from SubmissionHistoryProvider.
 * Each row links to /orders/{orderId} (F128).
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSubmissionHistory } from "@/app/providers/submission-history-provider";
import type { SubmissionRecord } from "@/app/providers/submission-history-provider";
import { DataTable, type TableColumn } from "@/components/data/data-table";
import { StatusBadge } from "@/components/feedback/status-badge";
import { PageFrame } from "@/pages/page-frame";

export const TraderDashboardPage = () => {
  const { submissions } = useSubmissionHistory();

  const columns = useMemo<readonly TableColumn<SubmissionRecord>[]>(
    () => [
      {
        header: "Order ID",
        id: "orderId",
        renderCell: (row) => (
          <Link to={`/orders/${row.orderId}`}>{row.orderId}</Link>
        )
      },
      {
        header: "Symbol",
        id: "symbol",
        renderCell: (row) => row.symbol
      },
      {
        header: "Side",
        id: "side",
        renderCell: (row) => row.side
      },
      {
        header: "Type",
        id: "orderType",
        renderCell: (row) => row.orderType
      },
      {
        header: "Qty",
        id: "quantity",
        renderCell: (row) => row.quantity
      },
      {
        header: "Price",
        id: "price",
        renderCell: (row) => (row.price != null ? row.price : "—")
      },
      {
        header: "Status",
        id: "status",
        renderCell: (row) => <StatusBadge status={row.status} />
      }
    ],
    []
  );

  return (
    <PageFrame
      description="Recent order submissions for this session. Click an order ID to view details."
      title="Trader Dashboard"
    >
      <div className="panel-stack">
        <section className="panel">
          <div className="panel__header">
            <h2>Recent submissions</h2>
          </div>
          <DataTable
            columns={columns}
            emptyDescription="Orders you submit will appear here. Navigate to Place Order to get started."
            emptyTitle="No recent submissions"
            getRowId={(row) => row.orderId}
            loading={false}
            rows={submissions}
          />
        </section>
      </div>
    </PageFrame>
  );
};
