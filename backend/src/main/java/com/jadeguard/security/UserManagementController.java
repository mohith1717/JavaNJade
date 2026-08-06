package com.jadeguard.security;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {
    private final UserService users;
    private final CurrentUserService currentUser;

    public UserManagementController(UserService users,
            CurrentUserService currentUser) {
        this.users = users;
        this.currentUser = currentUser;
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return users.createUser(request, currentUser.requireCurrentUser());
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String search) {
        return users.getUsers(role, enabled, search);
    }

    @GetMapping("/{userId}")
    public UserResponse get(@PathVariable UUID userId) { return users.getUser(userId); }

    @PutMapping("/{userId}")
    public UserResponse update(@PathVariable UUID userId,
            @Valid @RequestBody UserUpdateRequest request) {
        return users.updateUser(userId, request, currentUser.requireCurrentUser());
    }

    @PatchMapping("/{userId}/status")
    public UserResponse status(@PathVariable UUID userId,
            @Valid @RequestBody UserStatusRequest request) {
        return users.changeStatus(userId, request, currentUser.requireCurrentUser());
    }

    @PatchMapping("/{userId}/role")
    public UserResponse role(@PathVariable UUID userId,
            @Valid @RequestBody UserRoleRequest request) {
        return users.changeRole(userId, request, currentUser.requireCurrentUser());
    }

    @PatchMapping("/{userId}/password")
    public UserResponse password(@PathVariable UUID userId,
            @Valid @RequestBody UserPasswordRequest request) {
        return users.resetPassword(userId, request, currentUser.requireCurrentUser());
    }
}
