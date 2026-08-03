package com.jadeguard.watchlist;

import java.time.Instant;
import java.util.UUID;

public record WatchlistedAccountResponse(UUID id, String accountId,
        String reason, boolean enabled, UUID addedBy, Instant createdAt,
        Instant updatedAt) {
    public static WatchlistedAccountResponse from(WatchlistedAccountEntity e) {
        return new WatchlistedAccountResponse(e.getId(), e.getAccountId(),
                e.getReason(), e.isEnabled(), e.getAddedBy(), e.getCreatedAt(),
                e.getUpdatedAt());
    }
}
