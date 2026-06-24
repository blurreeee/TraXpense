package com.arjav.TraXpense.service;

import com.arjav.TraXpense.entity.User;
import com.arjav.TraXpense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Generates a password reset token for the given email or username.
     * Returns reset data (link, name, email) if user found, null otherwise.
     * The caller (frontend) is responsible for sending the email via EmailJS.
     */
    public Map<String, String> requestPasswordReset(String identifier) {
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }

        if (userOpt.isEmpty()) {
            // Don't reveal whether the user exists — return null
            return null;
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        Map<String, String> resetData = new HashMap<>();
        resetData.put("resetLink", resetLink);
        resetData.put("userName", user.getName());
        resetData.put("userEmail", user.getEmail());
        return resetData;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Reset link has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(newPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
