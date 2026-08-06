package com.jadeguard.risk;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;

public interface RuleEvaluator {

    RuleType supportedType();

    RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    );
}
