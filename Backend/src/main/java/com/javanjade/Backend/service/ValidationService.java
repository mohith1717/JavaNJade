package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.repository.BlacklistedAccountRepository;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ValidationService {

    private static final Set<String> SUPPORTED_CURRENCIES = Set.of("INR", "USD", "EUR", "GBP", "SGD", "AED");
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("1000000.00");

    private final TransactionRecordRepository transactionRecordRepository;
    private final BlacklistedAccountRepository blacklistedAccountRepository;

    public ValidationService(TransactionRecordRepository transactionRecordRepository,
                             BlacklistedAccountRepository blacklistedAccountRepository) {
        this.transactionRecordRepository = transactionRecordRepository;
        this.blacklistedAccountRepository = blacklistedAccountRepository;
    }

    public void validate(TransactionProcessRequest request) {
        validateAccountActive(request.senderAccountId());
        validateReceiverExists(request.receiverAccountId());
        validateCurrency(request.currency());
        validateDuplicateTransaction(request.transactionId());
        validateBlacklist(request.senderAccountId(), request.receiverAccountId());
        validateDailyLimit(request.senderAccountId(), request.amount());
    }

    private void validateAccountActive(String senderAccountId) {
        if (senderAccountId.toUpperCase().startsWith("INACTIVE")) {
            throw new BusinessException("ACCOUNT_INACTIVE", "Sender account is inactive", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateReceiverExists(String receiverAccountId) {
        if (receiverAccountId.toUpperCase().startsWith("MISSING")) {
            throw new BusinessException("RECEIVER_NOT_FOUND", "Receiver account does not exist", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateCurrency(String currency) {
        if (!SUPPORTED_CURRENCIES.contains(currency.toUpperCase())) {
            throw new BusinessException("INVALID_CURRENCY", "Unsupported currency: " + currency, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateDuplicateTransaction(String tid) {
        if (transactionRecordRepository.existsByTid(tid)) {
            throw new BusinessException("DUPLICATE_TRANSACTION", "Transaction already exists for tid=" + tid,
                    HttpStatus.CONFLICT);
        }
    }

    private void validateBlacklist(String senderAccountId, String receiverAccountId) {
        if (blacklistedAccountRepository.existsByAccountId(senderAccountId)
                || blacklistedAccountRepository.existsByAccountId(receiverAccountId)) {
            throw new BusinessException("BLACKLISTED_ACCOUNT", "Sender or receiver account is blacklisted",
                    HttpStatus.FORBIDDEN);
        }
    }

    private void validateDailyLimit(String senderAccountId, BigDecimal incomingAmount) {
        BigDecimal todaySum = transactionRecordRepository.sumAmountBySenderSince(
                senderAccountId, LocalDateTime.now().toLocalDate().atStartOfDay());
        if (todaySum.add(incomingAmount).compareTo(DAILY_LIMIT) > 0) {
            throw new BusinessException("DAILY_LIMIT_EXCEEDED", "Daily transaction limit exceeded", HttpStatus.BAD_REQUEST);
        }
    }

    public long countRecentTransactionsForSender(String senderAccountId, int minutes) {
        return transactionRecordRepository.countBySenderAccountIdAndCreatedAtAfter(
                senderAccountId, LocalDateTime.now().minusMinutes(minutes));
    }

    public long countRecentDeniedForSender(String senderAccountId, int minutes) {
        return transactionRecordRepository.countBySenderAccountIdAndStatusAndCreatedAtAfter(
                senderAccountId,
                com.javanjade.Backend.model.TransactionStatus.DENIED,
                LocalDateTime.now().minusMinutes(minutes)
        );
    }

    public long countRecentPotentialStructuring(String senderAccountId, BigDecimal smallTxnThreshold, int minutes) {
        return transactionRecordRepository.findBySenderAccountIdOrderByCreatedAtDesc(senderAccountId).stream()
                .filter(txn -> txn.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(minutes)))
                .filter(txn -> txn.getAmount().compareTo(smallTxnThreshold) <= 0)
                .count();
    }

    public boolean isReceiverBlacklisted(String receiverAccountId) {
        return blacklistedAccountRepository.existsByAccountId(receiverAccountId);
    }
}
