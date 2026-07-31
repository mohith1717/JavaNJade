package com.jadeguard.transaction;

public class DuplicateTransactionException extends RuntimeException {

    public DuplicateTransactionException(String externalTransactionId) {
        super("Transaction already exists: " + externalTransactionId);
    }
}
