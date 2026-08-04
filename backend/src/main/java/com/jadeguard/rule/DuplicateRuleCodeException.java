package com.jadeguard.rule;

public class DuplicateRuleCodeException extends RuntimeException {

    public DuplicateRuleCodeException(String code) {
        super("Monitoring rule code already exists: " + code);
    }
}
