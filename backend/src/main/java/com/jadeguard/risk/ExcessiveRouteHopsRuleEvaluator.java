package com.jadeguard.risk;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import org.springframework.stereotype.Component;

@Component
public class ExcessiveRouteHopsRuleEvaluator implements RuleEvaluator {

    @Override
    public RuleType supportedType() {
        return RuleType.EXCESSIVE_ROUTE_HOPS;
    }

    @Override
    public RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    ) {
        int maximumHops = rule.getParameters().get("maximumHops").asInt();
        int actualHops = context.route().size();
        boolean triggered = actualHops > maximumHops;
        return new RuleEvaluationResult(
                triggered,
                "Transaction route contained " + actualHops
                        + " hops; configured maximum is " + maximumHops + "."
        );
    }
}
