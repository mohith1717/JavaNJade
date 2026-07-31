package com.javanjade.Backend.repository;

import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.model.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRecordRepository extends JpaRepository<TransactionRecord, Long> {

    Optional<TransactionRecord> findByTid(String tid);

    List<TransactionRecord> findAllByOrderByCreatedAtDesc();

    boolean existsByTid(String tid);

    List<TransactionRecord> findBySenderAccountIdOrderByCreatedAtDesc(String senderAccountId);

    long countBySenderAccountIdAndCreatedAtAfter(String senderAccountId, LocalDateTime after);

    long countBySenderAccountIdAndStatusAndCreatedAtAfter(String senderAccountId, TransactionStatus status, LocalDateTime after);

    @Query("select coalesce(sum(t.amount), 0) from TransactionRecord t where t.senderAccountId = :sender and t.createdAt >= :start")
    BigDecimal sumAmountBySenderSince(@Param("sender") String senderAccountId, @Param("start") LocalDateTime start);

    @Query("select avg(t.riskScore) from TransactionRecord t where t.createdAt >= :start")
    Double avgRiskSince(@Param("start") LocalDateTime start);

    long countByCreatedAtAfter(LocalDateTime after);
}
