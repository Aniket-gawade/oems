CREATE TABLE idempotency_key (
    id BIGINT NOT NULL AUTO_INCREMENT,
    idem_key VARCHAR(128) NOT NULL,
    request_hash VARCHAR(128) NOT NULL,
    order_id CHAR(36),
    response_status INT NOT NULL,
    response_body JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_idempotency_key_idem_key UNIQUE (idem_key),
    CONSTRAINT fk_idempotency_key_order FOREIGN KEY (order_id) REFERENCES order_book(id)
);
