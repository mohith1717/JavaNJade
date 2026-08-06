ALTER TABLE alerts
    ADD COLUMN assigned_to VARCHAR(100) NULL AFTER risk_score,
    ADD COLUMN assigned_at DATETIME(6) NULL AFTER assigned_to,
    ADD COLUMN decision VARCHAR(30) NULL AFTER assigned_at,
    ADD COLUMN reopened_at DATETIME(6) NULL AFTER closed_at,
    ADD CONSTRAINT uq_alert_transaction UNIQUE (transaction_id);

CREATE INDEX idx_alerts_assigned_queue
    ON alerts(assigned_to, status, created_at);
