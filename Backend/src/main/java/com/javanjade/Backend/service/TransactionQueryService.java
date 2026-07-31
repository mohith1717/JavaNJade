package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.TransactionViewResponse;
import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TransactionQueryService {

    private final TransactionRecordRepository transactionRecordRepository;

    public TransactionQueryService(TransactionRecordRepository transactionRecordRepository) {
        this.transactionRecordRepository = transactionRecordRepository;
    }

    public List<TransactionViewResponse> listAll() {
        return transactionRecordRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public TransactionViewResponse getByTransactionId(String transactionId) {
        TransactionRecord transaction = transactionRecordRepository.findByTid(transactionId)
                .orElseThrow(() -> new BusinessException(
                        "TRANSACTION_NOT_FOUND",
                        "No transaction found for transactionId=" + transactionId,
                        HttpStatus.NOT_FOUND));
        return toResponse(transaction);
    }

    private TransactionViewResponse toResponse(TransactionRecord transaction) {
        return new TransactionViewResponse(
                transaction.getTid(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getSenderAccountId(),
                transaction.getReceiverAccountId(),
                transaction.getSenderCountry(),
                transaction.getReceiverCountry(),
                transaction.getLocation(),
                transaction.getDeviceId(),
                transaction.getCreditScore(),
                transaction.getStatus(),
                transaction.getRiskScore(),
                transaction.getPrimaryReason(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt());
    }
}
