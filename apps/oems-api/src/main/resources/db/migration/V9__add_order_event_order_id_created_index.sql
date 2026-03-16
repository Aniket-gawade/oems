CREATE INDEX idx_order_event_order_id_created
    ON order_event (order_id, created_at);
