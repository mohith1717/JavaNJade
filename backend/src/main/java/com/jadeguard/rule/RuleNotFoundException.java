package com.jadeguard.rule;

import java.util.UUID;

public class RuleNotFoundException extends RuntimeException {

    public RuleNotFoundException(UUID ruleId) {
        super("Monitoring rule not found: " + ruleId);
    }
}
