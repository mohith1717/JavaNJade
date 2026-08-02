CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    role VARCHAR(30) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE INDEX idx_users_role_enabled
    ON users(role, enabled);

INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    display_name,
    role,
    enabled
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'admin1',
    'admin@jadeguard.local',
    '$2y$10$JwC3dkkym9ObL9Xv23UcHuwqkhx7rh/XLFT/r0w9fZXInK6gwFvbu',
    'JadeGuard Administrator',
    'ADMIN',
    TRUE
),
(
    '10000000-0000-0000-0000-000000000002',
    'fraud1',
    'fraud@jadeguard.local',
    '$2y$10$ktOJ1vAgMnYKm4/ko9xdI.bwLJCSk4cr6VYYrIGdZgRVT0z.31WAi',
    'Fraud Analyst One',
    'FRAUD_ANALYST',
    TRUE
),
(
    '10000000-0000-0000-0000-000000000003',
    'risk1',
    'risk@jadeguard.local',
    '$2y$10$Ez.0X0PXSGGxBOuaXDPE4e96bR4GhjE0XahrutAxvahRaag3BlCg.',
    'Risk Analyst One',
    'RISK_ANALYST',
    TRUE
);
