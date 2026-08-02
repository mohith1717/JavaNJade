package com.jadeguard.alert;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertStatusHistoryRepository
        extends JpaRepository<AlertStatusHistoryEntity, UUID> {

    List<AlertStatusHistoryEntity> findByAlertIdOrderByChangedAtAsc(UUID alertId);
}
