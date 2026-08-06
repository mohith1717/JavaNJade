-- Rename legacy ACKNOWLEDGED status to INVESTIGATING to match the current AlertStatus enum
UPDATE alert_status_history SET from_status = 'INVESTIGATING' WHERE from_status = 'ACKNOWLEDGED';
UPDATE alert_status_history SET to_status   = 'INVESTIGATING' WHERE to_status   = 'ACKNOWLEDGED';
