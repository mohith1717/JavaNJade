package com.jadeguard.security;

import java.security.Principal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final AuditEventService auditService;
    private final ObjectMapper objectMapper;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserService userService,
            JwtService jwtService,
            AuditEventService auditService,
            ObjectMapper objectMapper
    ) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.usernameOrEmail(),
                        request.password()
                )
        );
        UserEntity user = userService.findByUsernameOrEmail(
                authentication.getName()
        );
        var loginValue = objectMapper.createObjectNode();
        loginValue.put("authenticated", true);
        loginValue.put("role", user.getRole().name());
        auditService.recordUserEvent(
                user,
                "USER_LOGIN_SUCCEEDED",
                "USER",
                user.getId(),
                null,
                loginValue,
                "User authenticated successfully"
        );
        return new LoginResponse(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationSeconds(),
                CurrentUserResponse.from(user)
        );
    }

    @GetMapping("/me")
    public CurrentUserResponse currentUser(Principal principal) {
        return CurrentUserResponse.from(
                userService.findByUsernameOrEmail(principal.getName())
        );
    }
}
