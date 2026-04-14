import { useState, type FormEvent } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { PageFrame } from "@/pages/page-frame";

export const OrderLookupPage = () => {
  const [orderId, setOrderId] = useState("");
  const [searchedOrderId, setSearchedOrderId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchedOrderId(orderId.trim());
  };

  return (
    <PageFrame description="Shared empty-state and form controls for order search." title="Order Lookup">
      <section className="panel">
        <form className="form-inline" onSubmit={handleSubmit}>
          <Input
            label="Order ID"
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Enter order id"
            value={orderId}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </section>
      {!searchedOrderId ? (
        <EmptyState
          description="Search by order id to view summary and status."
          title="No order selected"
        />
      ) : (
        <section className="panel">
          <p>
            Lookup submitted for <code>{searchedOrderId}</code>. Full API integration lands in Phase E/G.
          </p>
        </section>
      )}
    </PageFrame>
  );
};
