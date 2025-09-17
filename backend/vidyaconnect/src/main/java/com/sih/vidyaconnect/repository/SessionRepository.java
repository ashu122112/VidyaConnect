package com.sih.vidyaconnect.repository;

import com.sih.vidyaconnect.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByActive(boolean active);
    List<Session> findByStatus(String status);
}
