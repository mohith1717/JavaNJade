package com.jadeguard.security;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditEventService auditService;
    private final ObjectMapper objectMapper;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder, AuditEventService auditService,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) {
        UserEntity user = findByUsernameOrEmail(usernameOrEmail);
        return User.withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!user.isEnabled())
                .build();
    }

    @Transactional(readOnly = true)
    public UserEntity findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameIgnoreCase(usernameOrEmail)
                .or(() -> userRepository.findByEmailIgnoreCase(
                        usernameOrEmail
                ))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found"
                ));
    }

    @Transactional(readOnly = true)
    public UserEntity findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers(UserRole role, Boolean enabled,
            String search) {
        String query = search == null ? null
                : search.trim().toLowerCase(Locale.ROOT);
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> enabled == null || user.isEnabled() == enabled)
                .filter(user -> query == null || query.isBlank()
                        || user.getUsername().toLowerCase(Locale.ROOT).contains(query)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(query)
                        || user.getDisplayName().toLowerCase(Locale.ROOT).contains(query))
                .map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID id) { return UserResponse.from(findById(id)); }

    @Transactional
    public UserResponse createUser(UserCreateRequest request, UserEntity actor) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        ensureUnique(username, email, null);
        Instant now = Instant.now();
        UserEntity saved = userRepository.save(new UserEntity(UUID.randomUUID(),
                username, email, passwordEncoder.encode(request.password()),
                request.displayName().trim(), request.role(), request.enabled(),
                now, now));
        UserResponse response = UserResponse.from(saved);
        auditService.recordUserEvent(actor, "USER_CREATED", "USER", saved.getId(),
                null, objectMapper.valueToTree(response), request.reason());
        return response;
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request,
            UserEntity actor) {
        UserEntity user = findById(id);
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (user.getId().equals(actor.getId())
                && !user.getUsername().equalsIgnoreCase(username)) {
            throw new InvalidUserOperationException(
                    "You cannot change your own username while signed in");
        }
        ensureUnique(username, email, id);
        var previous = objectMapper.valueToTree(UserResponse.from(user));
        user.updateProfile(username, email, request.displayName().trim(),
                Instant.now());
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditService.recordUserEvent(actor, "USER_UPDATED", "USER", id,
                previous, objectMapper.valueToTree(response), request.reason());
        return response;
    }

    @Transactional
    public UserResponse changeStatus(UUID id, UserStatusRequest request,
            UserEntity actor) {
        UserEntity user = findById(id);
        if (!request.enabled() && user.getId().equals(actor.getId())) {
            throw new InvalidUserOperationException(
                    "You cannot disable your own account");
        }
        protectLastAdmin(user, !request.enabled(), false);
        var previous = objectMapper.valueToTree(UserResponse.from(user));
        user.changeStatus(request.enabled(), Instant.now());
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditService.recordUserEvent(actor,
                request.enabled() ? "USER_ENABLED" : "USER_DISABLED", "USER",
                id, previous, objectMapper.valueToTree(response), request.reason());
        return response;
    }

    @Transactional
    public UserResponse changeRole(UUID id, UserRoleRequest request,
            UserEntity actor) {
        UserEntity user = findById(id);
        if (user.getId().equals(actor.getId()) && request.role() != UserRole.ADMIN) {
            throw new InvalidUserOperationException(
                    "You cannot remove your own Administrator role");
        }
        protectLastAdmin(user, false, request.role() != UserRole.ADMIN);
        var previous = objectMapper.valueToTree(UserResponse.from(user));
        user.changeRole(request.role(), Instant.now());
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditService.recordUserEvent(actor, "USER_ROLE_CHANGED", "USER", id,
                previous, objectMapper.valueToTree(response), request.reason());
        return response;
    }

    @Transactional
    public UserResponse resetPassword(UUID id, UserPasswordRequest request,
            UserEntity actor) {
        UserEntity user = findById(id);
        user.changePassword(passwordEncoder.encode(request.newPassword()),
                Instant.now());
        UserResponse response = UserResponse.from(userRepository.save(user));
        var marker = objectMapper.createObjectNode().put("passwordReset", true);
        auditService.recordUserEvent(actor, "USER_PASSWORD_RESET", "USER", id,
                null, marker, request.reason());
        return response;
    }

    private void ensureUnique(String username, String email, UUID currentId) {
        userRepository.findByUsernameIgnoreCase(username).filter(user ->
                !user.getId().equals(currentId)).ifPresent(user -> {
                    throw new DuplicateUserException("username", username);
                });
        userRepository.findByEmailIgnoreCase(email).filter(user ->
                !user.getId().equals(currentId)).ifPresent(user -> {
                    throw new DuplicateUserException("email", email);
                });
    }

    private void protectLastAdmin(UserEntity user, boolean disabling,
            boolean demoting) {
        if (user.getRole() == UserRole.ADMIN && user.isEnabled()
                && (disabling || demoting)
                && userRepository.countByRoleAndEnabledTrue(UserRole.ADMIN) <= 1) {
            throw new InvalidUserOperationException(
                    "The final enabled Administrator cannot be disabled or demoted");
        }
    }
}
