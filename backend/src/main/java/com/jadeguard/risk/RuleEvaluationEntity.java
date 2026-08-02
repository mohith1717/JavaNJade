package com.jadeguard.risk;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "rule_evaluations")
public class RuleEvaluationEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "transaction_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID transactionId;

    @Column(name = "rule_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID ruleId;

    @Column(nullable = false)
    private boolean triggered;

    @Column(name = "score_contribution", nullable = false)
    private int scoreContribution;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "evaluated_at", nullable = false)
    private Instant evaluatedAt;

    protected RuleEvaluationEntity() {
    }

    public RuleEvaluationEntity(
            UUID id,
            UUID transactionId,
            UUID ruleId,
            boolean triggered,
            int scoreContribution,
            String explanation,
            Instant evaluatedAt
    ) {
        this.id = id;
        this.transactionId = transactionId;
        this.ruleId = ruleId;
        this.triggered = triggered;
        this.scoreContribution = scoreContribution;
        this.explanation = explanation;
        this.evaluatedAt = evaluatedAt;
    }

    public UUID getId() { return id; }
    public UUID getTransactionId() { return transactionId; }
    public UUID getRuleId() { return ruleId; }
    public boolean isTriggered() { return triggered; }
    public int getScoreContribution() { return scoreContribution; }
    public String getExplanation() { return explanation; }
    public Instant getEvaluatedAt() { return evaluatedAt; }
}
