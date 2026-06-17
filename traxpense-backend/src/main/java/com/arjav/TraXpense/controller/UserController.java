package com.arjav.TraXpense.controller;

import com.arjav.TraXpense.dto.UserResponseDTO;
import com.arjav.TraXpense.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/{userId}/theme")
    public ResponseEntity<?> updateTheme(@PathVariable Long userId, @RequestBody Map<String, Boolean> payload) {
        try {
            Boolean isDarkTheme = payload.get("isDarkTheme");
            if (isDarkTheme == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "isDarkTheme is required"));
            }
            UserResponseDTO updatedUser = userService.updateUserTheme(userId, isDarkTheme);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{userId}/username")
    public ResponseEntity<?> updateUsername(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "username is required"));
            }
            UserResponseDTO updatedUser = userService.updateUsername(userId, username);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
