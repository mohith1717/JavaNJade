package com.hsbc.tms.service;

import com.hsbc.tms.entity.Transaction;
import com.hsbc.tms.enums.TransactionStatus;
import com.hsbc.tms.repository.TransactionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getStatus() == null) {
            transaction.setStatus(TransactionStatus.pending);
        }
        if (transaction.getTransactionTime() == null) {
            transaction.setTransactionTime(LocalDateTime.now());
        }
        return transactionRepository.save(transaction);
    }

    public Transaction updateStatus(Long transactionId, TransactionStatus status) {
        Transaction transaction = getTransactionById(transactionId);
        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    public Transaction getTransaction(Long transactionId) {
        return getTransactionById(transactionId);
    }

    public List<Transaction> fetchHistory() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionTime"));
    }

    public void deleteTransaction(Long transactionId) {
        transactionRepository.delete(getTransactionById(transactionId));
    }

    private Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    }
}
