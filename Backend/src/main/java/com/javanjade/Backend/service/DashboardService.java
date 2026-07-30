package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.DashboardSummaryResponse;
import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.repository.FraudCaseRepository;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final TransactionRecordRepository transactionRecordRepository;
    private final FraudCaseRepository fraudCaseRepository;

    public DashboardService(TransactionRecordRepository transactionRecordRepository,
                            FraudCaseRepository fraudCaseRepository) {
        this.transactionRecordRepository = transactionRecordRepository;
        this.fraudCaseRepository = fraudCaseRepository;
    }

    public DashboardSummaryResponse summaryLast24h() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        Double avgRisk = transactionRecordRepository.avgRiskSince(since);

        return new DashboardSummaryResponse(
                transactionRecordRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByStatus(CaseStatus.OPEN),
                fraudCaseRepository.countByStatus(CaseStatus.ASSIGNED),
                fraudCaseRepository.countByStatus(CaseStatus.INVESTIGATE),
                fraudCaseRepository.countByStatus(CaseStatus.RESOLVED) + fraudCaseRepository.countByStatus(CaseStatus.CLEAN),
                fraudCaseRepository.countByPriority(CasePriority.CRITICAL),
                avgRisk == null ? 0.0 : avgRisk
        );
    }
}
