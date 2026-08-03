ALTER TABLE audit_events
    ADD COLUMN actor_username VARCHAR(100) NULL AFTER actor_id,
    ADD COLUMN previous_value JSON NULL AFTER entity_id,
    ADD COLUMN new_value JSON NULL AFTER previous_value,
    ADD COLUMN reason TEXT NULL AFTER new_value;

UPDATE audit_events
SET actor_username = actor_id
WHERE actor_username IS NULL;

ALTER TABLE audit_events
    MODIFY actor_username VARCHAR(100) NOT NULL;

CREATE INDEX idx_audit_events_action ON audit_events(action, occurred_at);
CREATE INDEX idx_audit_events_entity
    ON audit_events(entity_type, entity_id, occurred_at);
