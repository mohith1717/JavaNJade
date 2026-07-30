package com.javanjade.Backend.repository;

import com.javanjade.Backend.model.BlacklistedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistedAccountRepository extends JpaRepository<BlacklistedAccount, Long> {
    boolean existsByAccountId(String accountId);
}
