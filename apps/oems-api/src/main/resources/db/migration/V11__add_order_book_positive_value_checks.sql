ALTER TABLE order_book
    ADD CONSTRAINT chk_order_book_quantity_positive
        CHECK (quantity > 0);

ALTER TABLE order_book
    ADD CONSTRAINT chk_order_book_notional_positive
        CHECK (notional > 0);
