package com.jadeguard.watchlist;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistedAccountRepository
        extends JpaRepository<WatchlistedAccountEntity, UUID> {
    boolean existsByAccountId(String accountId);
    Optional<WatchlistedAccountEntity> findByAccountId(String accountId);
    List<WatchlistedAccountEntity> findAllByOrderByCreatedAtDesc();
    List<WatchlistedAccountEntity> findByAccountIdInAndEnabledTrue(
            List<String> accountIds);
}
