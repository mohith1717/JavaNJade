package com.jadeguard.rule;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "monitoring_rules")
public class MonitoringRuleEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RuleType type;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RuleSeverity severity;

    @Column(name = "risk_weight", nullable = false)
    private int riskWeight;

    @Column(nullable = false, columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode parameters;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MonitoringRuleEntity() {
    }

    public MonitoringRuleEntity(
            UUID id,
            String code,
            String name,
            RuleType type,
            boolean enabled,
            RuleSeverity severity,
            int riskWeight,
            JsonNode parameters,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.type = type;
        this.enabled = enabled;
        this.severity = severity;
        this.riskWeight = riskWeight;
        this.parameters = parameters;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public RuleType getType() { return type; }
    public boolean isEnabled() { return enabled; }
    public RuleSeverity getSeverity() { return severity; }
    public int getRiskWeight() { return riskWeight; }
    public JsonNode getParameters() { return parameters; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void replaceConfiguration(RuleRequest request, Instant updatedAt) {
        code = request.code();
        name = request.name();
        type = request.type();
        enabled = request.enabled();
        severity = request.severity();
        riskWeight = request.riskWeight();
        parameters = request.parameters();
        this.updatedAt = updatedAt;
    }

    public void changeStatus(boolean enabled, Instant updatedAt) {
        this.enabled = enabled;
        this.updatedAt = updatedAt;
    }
}
