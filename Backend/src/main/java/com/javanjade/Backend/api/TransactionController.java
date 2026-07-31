package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.TransactionDecisionResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.dto.TransactionViewResponse;
import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.service.AuditTrailQueryService;
import com.javanjade.Backend.service.TransactionPipelineService;
import com.javanjade.Backend.service.TransactionQueryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionPipelineService transactionPipelineService;
    private final TransactionQueryService transactionQueryService;
    private final AuditTrailQueryService auditTrailQueryService;

    public TransactionController(TransactionPipelineService transactionPipelineService,
                                 TransactionQueryService transactionQueryService,
                                 AuditTrailQueryService auditTrailQueryService) {
        this.transactionPipelineService = transactionPipelineService;
        this.transactionQueryService = transactionQueryService;
        this.auditTrailQueryService = auditTrailQueryService;
    }

    @GetMapping
    public List<TransactionViewResponse> listAll() {
        return transactionQueryService.listAll();
    }

    @GetMapping("/{transactionId}")
    public TransactionViewResponse getByTransactionId(@PathVariable String transactionId) {
        return transactionQueryService.getByTransactionId(transactionId);
    }

    @GetMapping("/failures")
    public List<AuditEventResponse> listValidationFailures() {
        return auditTrailQueryService.getTransactionValidationFailures();
    }

    @PostMapping("/process")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDecisionResponse process(@Valid @RequestBody TransactionProcessRequest request) {
        return transactionPipelineService.process(request);
    }
}
