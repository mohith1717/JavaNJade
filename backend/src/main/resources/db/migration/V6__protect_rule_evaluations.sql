ALTER TABLE rule_evaluations
    ADD CONSTRAINT uq_rule_evaluation_transaction_rule
        UNIQUE (transaction_id, rule_id);

CREATE INDEX idx_rule_evaluations_transaction
    ON rule_evaluations(transaction_id, evaluated_at);
