CREATE INDEX idx_order_book_trader_created
    ON order_book (trader_id, created_at);
