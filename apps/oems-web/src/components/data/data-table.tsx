import type { ReactNode } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Skeleton } from "@/components/feedback/skeleton";

export interface TableColumn<TRow> {
  readonly id: string;
  readonly header: string;
  readonly renderCell: (row: TRow) => ReactNode;
}

interface DataTableProps<TRow> {
  readonly columns: readonly TableColumn<TRow>[];
  readonly rows: readonly TRow[];
  readonly getRowId: (row: TRow) => string;
  readonly loading?: boolean;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

export const DataTable = <TRow,>({
  columns,
  emptyDescription = "No rows are available yet.",
  emptyTitle = "No data",
  getRowId,
  loading = false,
  rows
}: DataTableProps<TRow>) => {
  if (loading) {
    return (
      <div className="table-shell" role="status">
        <Skeleton className="table-shell__skeleton" />
        <Skeleton className="table-shell__skeleton" />
        <Skeleton className="table-shell__skeleton" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.renderCell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
