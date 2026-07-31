CREATE TABLE transaction_validation_errors (
    id CHAR(36) PRIMARY KEY,
    transaction_id CHAR(36) NOT NULL,
    error_code VARCHAR(60) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_validation_error_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_validation_errors_transaction
    ON transaction_validation_errors(transaction_id);

CREATE INDEX idx_validation_errors_code
    ON transaction_validation_errors(error_code);
