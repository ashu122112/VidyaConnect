package com.sih.vidyaconnect.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sih.vidyaconnect.model.Session;
import com.sih.vidyaconnect.model.User;
import com.sih.vidyaconnect.repository.SessionRepository;
import com.sih.vidyaconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestBody Map<String, String> payload) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Session newSession = new Session();
        newSession.setTitle(payload.get("title"));
        newSession.setTeacher(teacher);
        newSession.setActive(true);
        sessionRepository.save(newSession);

        return ResponseEntity.ok(newSession);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveSessions() {
    	List<Session> activeSessions = sessionRepository.findByActive(true);
    	// Corrected code using HashMap
    	List<Map<String, Object>> result = activeSessions.stream()
    	    .map(session -> {
    	        Map<String, Object> sessionData = new HashMap<>();
    	        sessionData.put("id", session.getId());
    	        sessionData.put("title", session.getTitle());
    	        sessionData.put("teacherName", session.getTeacher().getEmail());
    	        return sessionData;
    	    })
    	    .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}

