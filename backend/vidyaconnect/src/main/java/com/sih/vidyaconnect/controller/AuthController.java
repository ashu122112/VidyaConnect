package com.sih.vidyaconnect.controller;

import com.sih.vidyaconnect.dto.AuthDtos;
import com.sih.vidyaconnect.model.User;
import com.sih.vidyaconnect.repository.UserRepository;
import com.sih.vidyaconnect.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development purposes

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthDtos.LoginRequest loginRequest) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.email());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthDtos.JwtResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> saveUser(@RequestBody AuthDtos.RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User newUser = new User();
        newUser.setEmail(registerRequest.email());
        newUser.setPassword(passwordEncoder.encode(registerRequest.password()));
        newUser.setRole(registerRequest.role());
        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully!");
    }
}

