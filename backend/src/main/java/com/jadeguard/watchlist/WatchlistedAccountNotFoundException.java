package com.jadeguard.watchlist;

import java.util.UUID;
public class WatchlistedAccountNotFoundException extends RuntimeException {
    public WatchlistedAccountNotFoundException(UUID id) {
        super("Watchlisted account entry not found: " + id);
    }
}
