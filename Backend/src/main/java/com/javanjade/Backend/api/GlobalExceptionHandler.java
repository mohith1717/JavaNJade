package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.ApiErrorResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.service.BusinessException;
import com.javanjade.Backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final AuditLogService auditLogService;

    public GlobalExceptionHandler(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(new ApiErrorResponse(exception.getCode(), exception.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception,
                                                             HttpServletRequest request) {
        String message = exception.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> {
                    if (error instanceof FieldError fieldError) {
                        return fieldError.getField() + " " + fieldError.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .orElse("Invalid request");

            if ("/api/transactions/process".equals(request.getRequestURI())) {
                Object target = exception.getBindingResult().getTarget();
                String transactionId = "UNKNOWN";
                if (target instanceof TransactionProcessRequest transactionProcessRequest
                    && transactionProcessRequest.transactionId() != null
                    && !transactionProcessRequest.transactionId().isBlank()) {
                transactionId = transactionProcessRequest.transactionId();
                }
                auditLogService.append(
                    "TRANSACTION",
                    transactionId,
                    "TRANSACTION_VALIDATION_FAILED",
                    "system",
                    "code=VALIDATION_ERROR, message=" + message);
            }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse("VALIDATION_ERROR", message, LocalDateTime.now()));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        String message = "Method " + exception.getMethod() + " is not supported for this endpoint";
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(new ApiErrorResponse("METHOD_NOT_ALLOWED", message, LocalDateTime.now()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception) {
        String message = "Content-Type is not supported: " + exception.getContentType();
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(new ApiErrorResponse("UNSUPPORTED_MEDIA_TYPE", message, LocalDateTime.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse("INTERNAL_ERROR", exception.getMessage(), LocalDateTime.now()));
    }
}
