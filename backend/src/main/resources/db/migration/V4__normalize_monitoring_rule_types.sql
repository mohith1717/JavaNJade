UPDATE monitoring_rules
SET type = 'HIGH_AMOUNT'
WHERE type = 'AMOUNT_THRESHOLD';
