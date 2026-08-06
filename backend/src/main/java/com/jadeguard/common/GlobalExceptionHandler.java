package com.jadeguard.common;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import com.jadeguard.rule.DuplicateRuleCodeException;
import com.jadeguard.audit.AuditEventNotFoundException;
import com.jadeguard.alert.AlertNotFoundException;
import com.jadeguard.alert.InvalidAlertTransitionException;
import com.jadeguard.alert.InvalidAlertAssigneeException;
import com.jadeguard.alert.AlertActionForbiddenException;
import com.jadeguard.risk.RiskAssessmentNotAvailableException;
import com.jadeguard.report.InvalidReportFilterException;
import com.jadeguard.rule.RuleConfigurationException;
import com.jadeguard.rule.RuleNotFoundException;
import com.jadeguard.security.DuplicateUserException;
import com.jadeguard.security.InvalidUserOperationException;
import com.jadeguard.security.UserNotFoundException;
import com.jadeguard.transaction.DuplicateTransactionException;
import com.jadeguard.transaction.TransactionNotFoundException;
import com.jadeguard.validation.ValidationErrorNotFoundException;
import com.jadeguard.watchlist.DuplicateWatchlistedAccountException;
import com.jadeguard.watchlist.WatchlistedAccountNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(
            AuthenticationException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.UNAUTHORIZED,
                "Invalid username/email or password",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler({
            TransactionNotFoundException.class,
            AlertNotFoundException.class,
            ValidationErrorNotFoundException.class,
            RuleNotFoundException.class,
            UserNotFoundException.class,
            AuditEventNotFoundException.class,
            WatchlistedAccountNotFoundException.class
    })
    public ResponseEntity<ApiError> handleNotFound(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler({
            DuplicateTransactionException.class,
            DuplicateRuleCodeException.class,
            DuplicateWatchlistedAccountException.class,
            DuplicateUserException.class
    })
    public ResponseEntity<ApiError> handleDuplicate(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidUserOperationException.class)
    public ResponseEntity<ApiError> handleInvalidUserOperation(
            InvalidUserOperationException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.CONFLICT, exception.getMessage(),
                request.getRequestURI(), Map.of());
    }

    @ExceptionHandler(RiskAssessmentNotAvailableException.class)
    public ResponseEntity<ApiError> handleAssessmentUnavailable(
            RiskAssessmentNotAvailableException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidAlertTransitionException.class)
    public ResponseEntity<ApiError> handleInvalidAlertTransition(
            InvalidAlertTransitionException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidAlertAssigneeException.class)
    public ResponseEntity<ApiError> handleInvalidAlertAssignee(
            InvalidAlertAssigneeException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(AlertActionForbiddenException.class)
    public ResponseEntity<ApiError> handleAlertActionForbidden(
            AlertActionForbiddenException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleConcurrentAlertUpdate(
            ObjectOptimisticLockingFailureException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                "Alert was changed by another user; reload it and retry",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(RuleConfigurationException.class)
    public ResponseEntity<ApiError> handleRuleConfiguration(
            RuleConfigurationException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI(),
                exception.getFieldErrors()
        );
    }

    @ExceptionHandler(InvalidReportFilterException.class)
    public ResponseEntity<ApiError> handleReportFilters(
            InvalidReportFilterException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(),
                request.getRequestURI(), exception.getFieldErrors());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(
                    fieldError.getField(),
                    fieldError.getDefaultMessage()
            );
        }

        return error(
                HttpStatus.BAD_REQUEST,
                "Request validation failed",
                request.getRequestURI(),
                fieldErrors
        );
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ApiError> handleMalformedRequest(
            Exception exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "Request contains malformed or incorrectly typed data",
                request.getRequestURI(),
                Map.of()
        );
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        return ResponseEntity.status(status).body(new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                fieldErrors
        ));
    }
}
