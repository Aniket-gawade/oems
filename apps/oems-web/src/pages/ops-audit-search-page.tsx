import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { PageFrame } from "@/pages/page-frame";

export const OpsAuditSearchPage = () => {
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextOrderId = orderId.trim();
    if (!nextOrderId) {
      return;
    }

    navigate(`/ops/audit/${nextOrderId}`);
  };

  return (
    <PageFrame description="Ops-only route stub for audit journey." title="Audit Search">
      <section className="panel">
        <form className="form-inline" onSubmit={handleSubmit}>
          <Input
            label="Order ID"
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Enter order id"
            value={orderId}
          />
          <Button type="submit">Open audit</Button>
        </form>
      </section>
    </PageFrame>
  );
};
