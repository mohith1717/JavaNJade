package com.jadeguard.security;

public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String field, String value) {
        super("A user already exists with " + field + ": " + value);
    }
}
