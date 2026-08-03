package com.jadeguard.security;

import java.util.UUID;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + userId
                ));
    }
}
