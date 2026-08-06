INSERT INTO monitoring_rules (
    id,
    code,
    name,
    type,
    enabled,
    severity,
    risk_weight,
    parameters
)
SELECT
    '00000000-0000-0000-0000-000000000002',
    'ROUTE_COUNTRY_WATCHLIST',
    'Configured country in payment route',
    'HIGH_RISK_COUNTRY',
    TRUE,
    'HIGH',
    40,
    '{"countryCodes":["KP","MM"],"match":"ANY_ROUTE_HOP"}'
WHERE NOT EXISTS (
    SELECT 1
    FROM monitoring_rules
    WHERE code = 'ROUTE_COUNTRY_WATCHLIST'
);

INSERT INTO monitoring_rules (
    id,
    code,
    name,
    type,
    enabled,
    severity,
    risk_weight,
    parameters
)
SELECT
    '00000000-0000-0000-0000-000000000003',
    'EXCESSIVE_ROUTE_HOPS',
    'More than four route hops',
    'EXCESSIVE_ROUTE_HOPS',
    TRUE,
    'MEDIUM',
    15,
    '{"maximumHops":4}'
WHERE NOT EXISTS (
    SELECT 1
    FROM monitoring_rules
    WHERE code = 'EXCESSIVE_ROUTE_HOPS'
);

INSERT INTO monitoring_rules (
    id,
    code,
    name,
    type,
    enabled,
    severity,
    risk_weight,
    parameters
)
SELECT
    '00000000-0000-0000-0000-000000000004',
    'RAPID_SENDER_ACTIVITY',
    'Too many sender transactions in ten minutes',
    'RAPID_TRANSACTIONS',
    TRUE,
    'HIGH',
    25,
    '{"windowMinutes":10,"maximumTransactions":5}'
WHERE NOT EXISTS (
    SELECT 1
    FROM monitoring_rules
    WHERE code = 'RAPID_SENDER_ACTIVITY'
);

INSERT INTO monitoring_rules (
    id,
    code,
    name,
    type,
    enabled,
    severity,
    risk_weight,
    parameters
)
SELECT
    '00000000-0000-0000-0000-000000000005',
    'INR_STRUCTURING',
    'Possible split INR payments',
    'STRUCTURING',
    TRUE,
    'HIGH',
    45,
    '{"currency":"INR","windowMinutes":30,"individualMaximum":50000,"combinedThreshold":200000,"minimumTransactionCount":4,"groupBy":"SENDER"}'
WHERE NOT EXISTS (
    SELECT 1
    FROM monitoring_rules
    WHERE code = 'INR_STRUCTURING'
);
