package com.sih.vidyaconnect.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sih.vidyaconnect.model.Session;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByActive(boolean active);
 //   List<Session> findByStatus(String status);
}
