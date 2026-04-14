type OrderStatus = "NEW" | "REJECTED" | "ACCEPTED" | "UNKNOWN";

interface StatusBadgeProps {
  readonly status: OrderStatus;
}

const getLabel = (status: OrderStatus): string => {
  switch (status) {
    case "NEW":
      return "New";
    case "REJECTED":
      return "Rejected";
    case "ACCEPTED":
      return "Accepted";
    default:
      return "Unknown";
  }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`status-badge status-badge--${status.toLowerCase()}`}>{getLabel(status)}</span>
);
