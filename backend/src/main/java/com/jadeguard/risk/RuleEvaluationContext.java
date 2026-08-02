package com.jadeguard.risk;

import java.util.List;

import com.jadeguard.transaction.TransactionEntity;
import com.jadeguard.transaction.TransactionRouteHopEntity;

public record RuleEvaluationContext(
        TransactionEntity transaction,
        List<TransactionRouteHopEntity> route
) {
}
