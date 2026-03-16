ALTER TABLE order_book
    ADD CONSTRAINT chk_order_book_side
        CHECK (side IN ('BUY', 'SELL'));

ALTER TABLE order_book
    ADD CONSTRAINT chk_order_book_order_type
        CHECK (order_type IN ('MARKET', 'LIMIT'));
