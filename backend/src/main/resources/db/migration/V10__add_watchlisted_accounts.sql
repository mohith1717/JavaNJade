CREATE TABLE watchlisted_accounts (
    id CHAR(36) PRIMARY KEY,
    account_id VARCHAR(100) NOT NULL UNIQUE,
    reason VARCHAR(500) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    added_by CHAR(36) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_watchlisted_account_added_by
        FOREIGN KEY (added_by) REFERENCES users(id)
);

CREATE INDEX idx_watchlisted_accounts_enabled
    ON watchlisted_accounts(enabled);

INSERT INTO monitoring_rules (
    id, code, name, type, enabled, severity, risk_weight, parameters
)
SELECT
    '00000000-0000-0000-0000-000000000006',
    'BLACKLISTED_ACCOUNT_MATCH',
    'Sender or receiver appears on account watchlist',
    'BLACKLISTED_ACCOUNT',
    TRUE,
    'CRITICAL',
    50,
    '{}'
WHERE NOT EXISTS (
    SELECT 1 FROM monitoring_rules
    WHERE code = 'BLACKLISTED_ACCOUNT_MATCH'
);
