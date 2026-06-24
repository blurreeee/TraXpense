package com.arjav.TraXpense.service;

import com.arjav.TraXpense.entity.User;
import com.arjav.TraXpense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Generates a password reset token for the given email or username.
     * Sends the reset email server-side via EmailJS.
     * Returns true if a user was found and email was sent, false otherwise.
     */
    public boolean requestPasswordReset(String identifier) {
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }

        if (userOpt.isEmpty()) {
            // Don't reveal whether the user exists
            return false;
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // Send email server-side — avoids CORS issues
        emailService.sendPasswordResetEmail(user.getName(), user.getEmail(), resetLink);

        return true;
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
