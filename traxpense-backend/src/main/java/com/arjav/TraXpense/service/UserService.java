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
