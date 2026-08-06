package com.jadeguard.rule;

import java.util.Map;

public class RuleConfigurationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public RuleConfigurationException(Map<String, String> fieldErrors) {
        super("Rule configuration is invalid");
        this.fieldErrors = Map.copyOf(fieldErrors);
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
