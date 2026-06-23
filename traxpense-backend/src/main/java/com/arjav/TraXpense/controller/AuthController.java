package com.arjav.TraXpense.controller;

import com.arjav.TraXpense.dto.UserLoginDTO;
import com.arjav.TraXpense.dto.UserRegistrationDTO;
import com.arjav.TraXpense.dto.UserResponseDTO;
import com.arjav.TraXpense.service.FeatureFlagService;
import com.arjav.TraXpense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final FeatureFlagService featureFlagService;

    public AuthController(UserService userService, FeatureFlagService featureFlagService) {
        this.userService = userService;
        this.featureFlagService = featureFlagService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            UserResponseDTO response = userService.registerUser(dto);
            response.setFeatureFlags(featureFlagService.getAllFeatureFlags());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO dto) {
        try {
            UserResponseDTO response = userService.authenticate(dto);
            response.setFeatureFlags(featureFlagService.getAllFeatureFlags());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }
}
