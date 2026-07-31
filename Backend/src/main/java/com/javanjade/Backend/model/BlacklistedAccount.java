package com.javanjade.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "blacklisted_accounts")
public class BlacklistedAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String accountId;

    @Column(nullable = false, length = 200)
    private String reason;

    public Long getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
