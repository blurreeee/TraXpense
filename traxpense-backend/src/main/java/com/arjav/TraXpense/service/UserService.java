package com.arjav.TraXpense.service;

import com.arjav.TraXpense.dto.UserLoginDTO;
import com.arjav.TraXpense.dto.UserRegistrationDTO;
import com.arjav.TraXpense.dto.UserResponseDTO;
import com.arjav.TraXpense.entity.User;
import com.arjav.TraXpense.repository.UserRepository;
import org.springframework.stereotype.Service;

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
}
