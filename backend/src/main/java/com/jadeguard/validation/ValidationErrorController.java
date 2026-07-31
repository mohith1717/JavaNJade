package com.jadeguard.validation;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/validation-errors")
public class ValidationErrorController {

    private final ValidationErrorQueryService queryService;

    public ValidationErrorController(ValidationErrorQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping
    public List<TransactionValidationErrorEntity> getValidationErrors(
            @RequestParam(required = false) UUID transactionId,
            @RequestParam(required = false) ValidationErrorCode errorCode
    ) {
        return queryService.getValidationErrors(transactionId, errorCode);
    }

    @GetMapping("/{validationErrorId}")
    public TransactionValidationErrorEntity getValidationError(
            @PathVariable UUID validationErrorId
    ) {
        return queryService.getValidationError(validationErrorId);
    }
}
