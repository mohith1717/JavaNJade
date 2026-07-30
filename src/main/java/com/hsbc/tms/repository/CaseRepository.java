package com.hsbc.tms.repository;

import com.hsbc.tms.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseRepository extends JpaRepository<Case, Long> {
}
