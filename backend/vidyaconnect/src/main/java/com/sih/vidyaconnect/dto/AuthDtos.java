package com.sih.vidyaconnect.dto;

import com.sih.vidyaconnect.model.Role;

public class AuthDtos {

    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String email, String password, Role role) {}
    public record JwtResponse(String token) {}

}

