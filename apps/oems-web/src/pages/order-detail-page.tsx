import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/feedback/skeleton";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/primitives/button";
import { PageFrame } from "@/pages/page-frame";

export const OrderDetailPage = () => {
  const { orderId = "unknown" } = useParams();
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setLoading(false), 550);
    return () => window.clearTimeout(timeoutId);
  }, [orderId]);

  return (
    <PageFrame description="Shared loading, error, and status UX foundation." title="Order Detail">
      {loading ? (
        <section className="panel">
          <Skeleton className="detail-skeleton" />
          <Skeleton className="detail-skeleton" />
          <Skeleton className="detail-skeleton" />
        </section>
      ) : showError ? (
        <ErrorState
          description="Temporary failure while loading order detail."
          onRetry={() => setShowError(false)}
          title="Order detail unavailable"
          traceId="trace-phase-c-order"
        />
      ) : (
        <section className="panel">
          <div className="panel__header">
            <h2>Order {orderId}</h2>
            <StatusBadge status="NEW" />
          </div>
          <p>Placeholder detail data for shell validation.</p>
          <Button onClick={() => setShowError(true)} type="button" variant="ghost">
            Simulate load failure
          </Button>
        </section>
      )}
    </PageFrame>
  );
};
