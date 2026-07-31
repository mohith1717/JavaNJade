package com.javanjade.Backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_rules")
public class FraudRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 48)
    private RuleType type;

    @Column(nullable = false, length = 300)
    private String description;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private int riskWeight;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountThreshold;

    private Integer intThreshold;

    private Integer secondaryIntThreshold;

    @Column(length = 80)
    private String stringThreshold;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onChange() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RuleType getType() {
        return type;
    }

    public void setType(RuleType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getRiskWeight() {
        return riskWeight;
    }

    public void setRiskWeight(int riskWeight) {
        this.riskWeight = riskWeight;
    }

    public BigDecimal getAmountThreshold() {
        return amountThreshold;
    }

    public void setAmountThreshold(BigDecimal amountThreshold) {
        this.amountThreshold = amountThreshold;
    }

    public Integer getIntThreshold() {
        return intThreshold;
    }

    public void setIntThreshold(Integer intThreshold) {
        this.intThreshold = intThreshold;
    }

    public Integer getSecondaryIntThreshold() {
        return secondaryIntThreshold;
    }

    public void setSecondaryIntThreshold(Integer secondaryIntThreshold) {
        this.secondaryIntThreshold = secondaryIntThreshold;
    }

    public String getStringThreshold() {
        return stringThreshold;
    }

    public void setStringThreshold(String stringThreshold) {
        this.stringThreshold = stringThreshold;
    }
}
