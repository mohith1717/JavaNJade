package com.jadeguard.watchlist;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventService;
import com.jadeguard.security.CurrentUserService;
import com.jadeguard.security.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WatchlistedAccountService {
    private final WatchlistedAccountRepository repository;
    private final CurrentUserService currentUserService;
    private final AuditEventService auditService;
    private final ObjectMapper objectMapper;

    public WatchlistedAccountService(WatchlistedAccountRepository repository,
            CurrentUserService currentUserService, AuditEventService auditService,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public WatchlistedAccountResponse create(WatchlistedAccountRequest request) {
        String accountId = request.accountId().trim();
        if (repository.existsByAccountId(accountId)) {
            throw new DuplicateWatchlistedAccountException(accountId);
        }
        UserEntity actor = currentUserService.requireCurrentUser();
        Instant now = Instant.now();
        var saved = repository.save(new WatchlistedAccountEntity(UUID.randomUUID(),
                accountId, request.reason().trim(), true, actor.getId(), now, now));
        var response = WatchlistedAccountResponse.from(saved);
        auditService.recordUserEvent(actor, "WATCHLISTED_ACCOUNT_CREATED",
                "WATCHLISTED_ACCOUNT", saved.getId(), null,
                objectMapper.valueToTree(response), request.reason());
        return response;
    }

    @Transactional(readOnly = true)
    public List<WatchlistedAccountResponse> list(Boolean enabled,
            String accountId) {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(e -> enabled == null || e.isEnabled() == enabled)
                .filter(e -> accountId == null
                        || e.getAccountId().equals(accountId))
                .map(WatchlistedAccountResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public WatchlistedAccountResponse get(UUID id) {
        return WatchlistedAccountResponse.from(find(id));
    }

    @Transactional
    public WatchlistedAccountResponse changeStatus(UUID id,
            WatchlistedAccountStatusRequest request) {
        var entity = find(id);
        var previous = objectMapper.valueToTree(
                WatchlistedAccountResponse.from(entity));
        entity.changeStatus(request.enabled(), Instant.now());
        var saved = repository.save(entity);
        var response = WatchlistedAccountResponse.from(saved);
        auditService.recordUserEvent(currentUserService.requireCurrentUser(),
                request.enabled() ? "WATCHLISTED_ACCOUNT_ENABLED"
                        : "WATCHLISTED_ACCOUNT_DISABLED",
                "WATCHLISTED_ACCOUNT", id, previous,
                objectMapper.valueToTree(response), request.reason());
        return response;
    }

    private WatchlistedAccountEntity find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new WatchlistedAccountNotFoundException(id));
    }
}
