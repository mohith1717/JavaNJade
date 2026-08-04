CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY,
    external_transaction_id VARCHAR(100) NOT NULL UNIQUE,
    sender_account_id VARCHAR(100) NOT NULL,
    receiver_account_id VARCHAR(100) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL,
    occurred_at DATETIME(6) NOT NULL,
    processing_status VARCHAR(30) NOT NULL,
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE transaction_route_hops (
    id CHAR(36) PRIMARY KEY,
    transaction_id CHAR(36) NOT NULL,
    sequence_number INTEGER NOT NULL CHECK (sequence_number > 0),
    country_code CHAR(2) NOT NULL,
    institution VARCHAR(200),
    CONSTRAINT uq_route_hop_sequence UNIQUE (transaction_id, sequence_number),
    CONSTRAINT fk_route_hop_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE monitoring_rules (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    severity VARCHAR(20) NOT NULL,
    risk_weight INTEGER NOT NULL CHECK (risk_weight BETWEEN 0 AND 100),
    parameters JSON NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE rule_evaluations (
    id CHAR(36) PRIMARY KEY,
    transaction_id CHAR(36) NOT NULL,
    rule_id CHAR(36) NOT NULL,
    triggered BOOLEAN NOT NULL,
    score_contribution INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    evaluated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_rule_evaluation_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    CONSTRAINT fk_rule_evaluation_rule
        FOREIGN KEY (rule_id) REFERENCES monitoring_rules(id)
);

CREATE TABLE alerts (
    id CHAR(36) PRIMARY KEY,
    transaction_id CHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    primary_reason TEXT NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    resolution_notes TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    acknowledged_at DATETIME(6),
    closed_at DATETIME(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_alert_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE alert_status_history (
    id CHAR(36) PRIMARY KEY,
    alert_id CHAR(36) NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    reason TEXT,
    changed_by VARCHAR(100) NOT NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_alert_history_alert
        FOREIGN KEY (alert_id) REFERENCES alerts(id)
);

CREATE TABLE audit_events (
    id CHAR(36) PRIMARY KEY,
    actor_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    details JSON NOT NULL,
    occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE INDEX idx_transactions_sender_account
    ON transactions(sender_account_id);
CREATE INDEX idx_transactions_occurred_at
    ON transactions(occurred_at);
CREATE INDEX idx_transactions_sender_occurred
    ON transactions(sender_account_id, occurred_at);
CREATE INDEX idx_alerts_queue
    ON alerts(status, severity, created_at);
CREATE INDEX idx_audit_events_actor
    ON audit_events(actor_id);
CREATE INDEX idx_audit_events_occurred_at
    ON audit_events(occurred_at);

INSERT INTO monitoring_rules (
    id,
    code,
    name,
    type,
    enabled,
    severity,
    risk_weight,
    parameters
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'HIGH_AMOUNT_INR',
    'High-value INR transfer',
    'AMOUNT_THRESHOLD',
    TRUE,
    'HIGH',
    35,
    '{"currency": "INR", "threshold": 200000}'
);
