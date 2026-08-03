package com.jadeguard.risk;

import java.util.List;
import java.util.stream.Collectors;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import com.jadeguard.watchlist.WatchlistedAccountRepository;
import org.springframework.stereotype.Component;

@Component
public class BlacklistedAccountRuleEvaluator implements RuleEvaluator {
    private final WatchlistedAccountRepository repository;
    public BlacklistedAccountRuleEvaluator(WatchlistedAccountRepository repository) {
        this.repository = repository;
    }
    @Override public RuleType supportedType() {
        return RuleType.BLACKLISTED_ACCOUNT;
    }
    @Override
    public RuleEvaluationResult evaluate(MonitoringRuleEntity rule,
            RuleEvaluationContext context) {
        var transaction = context.transaction();
        var matches = repository.findByAccountIdInAndEnabledTrue(List.of(
                transaction.getSenderAccountId(),
                transaction.getReceiverAccountId()));
        if (matches.isEmpty()) {
            return new RuleEvaluationResult(false,
                    "Neither sender nor receiver is on the active account watchlist.");
        }
        String explanation = matches.stream().map(entry -> {
            String side = entry.getAccountId().equals(
                    transaction.getSenderAccountId()) ? "Sender" : "Receiver";
            return side + " account " + entry.getAccountId()
                    + " is on the active account watchlist: " + entry.getReason();
        }).collect(Collectors.joining(" "));
        return new RuleEvaluationResult(true, explanation);
    }
}
