package com.jadeguard.watchlist;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchlisted-accounts")
public class WatchlistedAccountController {
    private final WatchlistedAccountService service;
    public WatchlistedAccountController(WatchlistedAccountService service) {
        this.service = service;
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public WatchlistedAccountResponse create(
            @Valid @RequestBody WatchlistedAccountRequest request) {
        return service.create(request);
    }
    @GetMapping
    public List<WatchlistedAccountResponse> list(
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String accountId) {
        return service.list(enabled, accountId);
    }
    @GetMapping("/{id}")
    public WatchlistedAccountResponse get(@PathVariable UUID id) {
        return service.get(id);
    }
    @PatchMapping("/{id}/status")
    public WatchlistedAccountResponse changeStatus(@PathVariable UUID id,
            @Valid @RequestBody WatchlistedAccountStatusRequest request) {
        return service.changeStatus(id, request);
    }
}
