package com.jadeguard.transaction;

import java.util.List;
import java.util.UUID;

import com.jadeguard.validation.TransactionValidationErrorEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final FundFlowService fundFlowService;

    public TransactionController(
            TransactionService transactionService,
            FundFlowService fundFlowService
    ) {
        this.transactionService = transactionService;
        this.fundFlowService = fundFlowService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionEntity createTransaction(
            @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.createTransaction(request);
    }

    @GetMapping
    public List<TransactionEntity> getAllTransactions(
            @RequestParam(required = false)
            ProcessingStatus processingStatus
    ) {
        return transactionService.getAllTransactions(processingStatus);
    }

    @GetMapping("/{transactionId}")
    public TransactionEntity getTransaction(
            @PathVariable UUID transactionId
    ) {
        return transactionService.getTransaction(transactionId);
    }

    @GetMapping("/{transactionId}/route")
    public List<TransactionRouteHopEntity> getTransactionRoute(
            @PathVariable UUID transactionId
    ) {
        return transactionService.getTransactionRoute(transactionId);
    }

    @GetMapping("/{transactionId}/fund-flow")
    public FundFlowResponse getFundFlow(
            @PathVariable UUID transactionId
    ) {
        return fundFlowService.getFundFlow(transactionId);
    }

    @GetMapping("/{transactionId}/validation-errors")
    public List<TransactionValidationErrorEntity> getValidationErrors(
            @PathVariable UUID transactionId
    ) {
        return transactionService.getValidationErrors(transactionId);
    }
}
