package com.hsbc.tms.repository;

import com.hsbc.tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
