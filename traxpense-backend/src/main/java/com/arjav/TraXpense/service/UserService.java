package com.arjav.TraXpense.service;

import com.arjav.TraXpense.dto.UserLoginDTO;
import com.arjav.TraXpense.dto.UserRegistrationDTO;
import com.arjav.TraXpense.dto.UserResponseDTO;
import com.arjav.TraXpense.entity.User;
import com.arjav.TraXpense.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDTO registerUser(UserRegistrationDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User(dto.getName(), dto.getUsername(), dto.getEmail(), dto.getPassword());
        
        if ("Arjav".equalsIgnoreCase(dto.getUsername()) && "Arjav@123".equals(dto.getPassword())) {
            user.setRole("ADMIN");
        }
        
        User savedUser = userRepository.save(user);

        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO authenticate(UserLoginDTO dto) {
        String identifier = dto.getUsername();
        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(dto.getPassword())) {
                // Retroactively grant admin to Arjav
                if ("Arjav".equalsIgnoreCase(user.getUsername()) && "Arjav@123".equals(user.getPassword()) && !"ADMIN".equals(user.getRole())) {
                    user.setRole("ADMIN");
                    user = userRepository.save(user);
                }
                return new UserResponseDTO(user);
            }
        }
        throw new RuntimeException("Invalid email/username or password");
    }

    public UserResponseDTO updateUserTheme(Long userId, Boolean isDarkTheme) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsDarkTheme(isDarkTheme);
        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO updateDefaultCurrency(Long userId, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (currency == null || currency.isBlank()) {
            throw new RuntimeException("Currency code is required");
        }
        user.setDefaultCurrency(currency.trim().toUpperCase());
        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO updateUsername(Long userId, String newUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String trimmedUsername = newUsername == null ? "" : newUsername.trim();
        if (trimmedUsername.isEmpty()) {
            throw new RuntimeException("Username cannot be empty");
        }

        if (trimmedUsername.equals(user.getUsername())) {
            throw new RuntimeException("This is already your username");
        }

        if (user.getUsernameChangedAt() != null) {
            LocalDateTime nextAllowedChange = user.getUsernameChangedAt().plusDays(14);
            if (LocalDateTime.now().isBefore(nextAllowedChange)) {
                long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), nextAllowedChange) + 1;
                throw new RuntimeException(
                        "You can change your username again in " + daysRemaining + " day(s)"
                );
            }
        }

        Optional<User> existingUser = userRepository.findByUsername(trimmedUsername);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
            throw new RuntimeException("Username is already taken");
        }

        user.setUsername(trimmedUsername);
        user.setUsernameChangedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }
}
