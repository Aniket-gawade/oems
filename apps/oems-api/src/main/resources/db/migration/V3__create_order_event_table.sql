CREATE TABLE order_event (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id CHAR(36) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    payload JSON NOT NULL,
    trace_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_event_order FOREIGN KEY (order_id) REFERENCES order_book(id)
);
