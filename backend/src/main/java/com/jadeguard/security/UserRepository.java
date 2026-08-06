package com.jadeguard.security;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByUsernameIgnoreCase(String username);

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    java.util.List<UserEntity> findAllByOrderByCreatedAtDesc();

    long countByRoleAndEnabledTrue(UserRole role);
}
