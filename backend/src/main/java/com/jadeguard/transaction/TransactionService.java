package com.jadeguard.transaction;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.jadeguard.validation.TransactionValidationErrorEntity;
import com.jadeguard.risk.RiskAssessmentService;
import com.jadeguard.validation.TransactionValidationErrorRepository;
import com.jadeguard.validation.TransactionValidationService;
import com.jadeguard.validation.ValidationErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionRouteHopRepository routeHopRepository;
    private final TransactionValidationService validationService;
    private final TransactionValidationErrorRepository validationErrorRepository;
    private final RiskAssessmentService riskAssessmentService;

    public TransactionService(
            TransactionRepository transactionRepository,
            TransactionRouteHopRepository routeHopRepository,
            TransactionValidationService validationService,
            TransactionValidationErrorRepository validationErrorRepository,
            RiskAssessmentService riskAssessmentService
    ) {
        this.transactionRepository = transactionRepository;
        this.routeHopRepository = routeHopRepository;
        this.validationService = validationService;
        this.validationErrorRepository = validationErrorRepository;
        this.riskAssessmentService = riskAssessmentService;
    }

    @Transactional
    public TransactionEntity createTransaction(TransactionRequest request) {
        if (transactionRepository.existsByExternalTransactionId(
                request.externalTransactionId()
        )) {
            throw new DuplicateTransactionException(
                    request.externalTransactionId()
            );
        }

        var transaction = new TransactionEntity(
                UUID.randomUUID(),
                request.externalTransactionId(),
                request.senderAccountId(),
                request.receiverAccountId(),
                request.amount(),
                request.currency().toUpperCase(Locale.ROOT),
                request.occurredAt(),
                ProcessingStatus.RECEIVED,
                null,
                RiskLevel.PENDING,
                Instant.now()
        );

        transactionRepository.saveAndFlush(transaction);
        transaction.markValidating();

        var validationResult = validationService.validate(
                transaction,
                request.route()
        );

        boolean routeHasDuplicateSequence = validationResult.errors().stream()
                .anyMatch(error -> error.code()
                        == ValidationErrorCode.DUPLICATE_ROUTE_SEQUENCE);

        if (!routeHasDuplicateSequence) {
            routeHopRepository.saveAll(request.route().stream()
                    .map(hop -> new TransactionRouteHopEntity(
                            UUID.randomUUID(),
                            transaction.getId(),
                            hop.sequence(),
                            hop.countryCode().toUpperCase(Locale.ROOT),
                            hop.institution()
                    ))
                    .toList());
        }

        if (validationResult.valid()) {
            transaction.markValidated();
            transactionRepository.saveAndFlush(transaction);
            return riskAssessmentService.assess(transaction);
        } else {
            transaction.markValidationFailed();
            Instant validationTime = Instant.now();
            validationErrorRepository.saveAll(
                    validationResult.errors().stream()
                            .map(error -> new TransactionValidationErrorEntity(
                                    UUID.randomUUID(),
                                    transaction.getId(),
                                    error.code(),
                                    error.field(),
                                    error.message(),
                                    validationTime
                            ))
                            .toList()
            );
        }

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionEntity> getAllTransactions(
            ProcessingStatus processingStatus
    ) {
        if (processingStatus == null) {
            return transactionRepository.findAllByOrderByOccurredAtDesc();
        }
        return transactionRepository
                .findByProcessingStatusOrderByOccurredAtDesc(processingStatus);
    }

    @Transactional(readOnly = true)
    public TransactionEntity getTransaction(UUID transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(
                        transactionId
                ));
    }

    @Transactional(readOnly = true)
    public List<TransactionRouteHopEntity> getTransactionRoute(
            UUID transactionId
    ) {
        getTransaction(transactionId);
        return routeHopRepository
                .findByTransactionIdOrderBySequenceAsc(transactionId);
    }

    @Transactional(readOnly = true)
    public List<TransactionValidationErrorEntity> getValidationErrors(
            UUID transactionId
    ) {
        getTransaction(transactionId);
        return validationErrorRepository
                .findByTransactionIdOrderByCreatedAtAsc(transactionId);
    }
}
