CREATE TABLE order_book (
    id CHAR(36) NOT NULL,
    client_order_id VARCHAR(64),
    trader_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(8) NOT NULL,
    order_type VARCHAR(16) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8),
    notional DECIMAL(20,8) NOT NULL,
    status VARCHAR(16) NOT NULL,
    rejection_reason VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_book_symbol FOREIGN KEY (symbol) REFERENCES instrument(symbol)
);
