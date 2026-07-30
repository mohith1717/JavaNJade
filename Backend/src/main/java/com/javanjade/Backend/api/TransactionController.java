package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.TransactionDecisionResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.service.TransactionPipelineService;
import jakarta.validation.Valid;
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

    public TransactionController(TransactionPipelineService transactionPipelineService) {
        this.transactionPipelineService = transactionPipelineService;
    }

    @PostMapping("/process")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDecisionResponse process(@Valid @RequestBody TransactionProcessRequest request) {
        return transactionPipelineService.process(request);
    }
}
