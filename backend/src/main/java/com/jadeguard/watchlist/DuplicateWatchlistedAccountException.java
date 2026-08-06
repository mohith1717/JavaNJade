package com.jadeguard.watchlist;

public class DuplicateWatchlistedAccountException extends RuntimeException {
    public DuplicateWatchlistedAccountException(String accountId) {
        super("Account is already present on the watchlist: " + accountId);
    }
}
