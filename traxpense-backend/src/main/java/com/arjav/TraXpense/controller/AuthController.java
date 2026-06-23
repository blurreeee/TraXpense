package com.arjav.TraXpense.controller;

import com.arjav.TraXpense.dto.ForgotPasswordDTO;
import com.arjav.TraXpense.dto.ResetPasswordDTO;
import com.arjav.TraXpense.dto.UserLoginDTO;
import com.arjav.TraXpense.dto.UserRegistrationDTO;
import com.arjav.TraXpense.dto.UserResponseDTO;
import com.arjav.TraXpense.service.FeatureFlagService;
import com.arjav.TraXpense.service.PasswordResetService;
import com.arjav.TraXpense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final FeatureFlagService featureFlagService;
    private final PasswordResetService passwordResetService;

    public AuthController(UserService userService, FeatureFlagService featureFlagService, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.featureFlagService = featureFlagService;
        this.passwordResetService = passwordResetService;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordDTO dto) {
        try {
            Map<String, String> resetData = passwordResetService.requestPasswordReset(dto.getEmail());
            if (resetData != null) {
                // Return reset data so frontend can send email via EmailJS
                Map<String, Object> response = new HashMap<>();
                response.put("message", "If an account with that email exists, a password reset link has been sent.");
                response.put("resetData", resetData);
                return ResponseEntity.ok(response);
            }
        } catch (RuntimeException e) {
            // Log internally but don't expose errors to avoid email enumeration
        }
        // Always return success to prevent email enumeration attacks
        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordDTO dto) {
        try {
            passwordResetService.resetPassword(dto.getToken(), dto.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}

