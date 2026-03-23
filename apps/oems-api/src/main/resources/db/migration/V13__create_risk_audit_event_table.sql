CREATE TABLE risk_audit_event (
    id BIGINT NOT NULL AUTO_INCREMENT,
    trader_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    decision VARCHAR(8) NOT NULL,
    reject_code VARCHAR(64),
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX idx_risk_audit_event_trader_created
    ON risk_audit_event (trader_id, created_at);
