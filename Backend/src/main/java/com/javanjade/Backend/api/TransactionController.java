package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.TransactionDecisionResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.dto.TransactionViewResponse;
import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.service.BusinessException;
import com.javanjade.Backend.service.AuditTrailQueryService;
import com.javanjade.Backend.service.TransactionPipelineService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionPipelineService transactionPipelineService;
    private final AuditTrailQueryService auditTrailQueryService;

    public TransactionController(TransactionPipelineService transactionPipelineService,
                                 AuditTrailQueryService auditTrailQueryService) {
        this.transactionPipelineService = transactionPipelineService;
        this.auditTrailQueryService = auditTrailQueryService;
    }

    @PostMapping("/process")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDecisionResponse process(@Valid @RequestBody TransactionProcessRequest request) {
        return transactionPipelineService.process(request);
    }

    @GetMapping
    public List<TransactionViewResponse> list() {
        return transactionPipelineService.listRecentTransactions();
    }

    @GetMapping("/{transactionId}")
    public TransactionViewResponse get(@PathVariable String transactionId) {
        return transactionPipelineService.getTransaction(transactionId)
                .orElseThrow(() -> new BusinessException(
                        "TRANSACTION_NOT_FOUND",
                        "No transaction found for transactionId=" + transactionId,
                        HttpStatus.NOT_FOUND));
    }

    @GetMapping("/failures")
    public List<AuditEventResponse> recentEvents() {
        return auditTrailQueryService.getRecentOperationalEvents();
    }
}
