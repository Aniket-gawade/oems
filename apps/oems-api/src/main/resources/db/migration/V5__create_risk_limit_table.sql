CREATE TABLE risk_limit (
    id BIGINT NOT NULL AUTO_INCREMENT,
    trader_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32),
    max_qty DECIMAL(18,8) NOT NULL,
    max_notional DECIMAL(20,8) NOT NULL,
    price_band_pct DECIMAL(8,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_risk_limit_symbol FOREIGN KEY (symbol) REFERENCES instrument(symbol)
);
