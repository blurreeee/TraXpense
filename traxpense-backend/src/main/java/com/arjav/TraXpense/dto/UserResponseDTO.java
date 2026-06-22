package com.arjav.TraXpense.dto;

import com.arjav.TraXpense.entity.User;

import java.time.LocalDateTime;

public class UserResponseDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private Boolean isDarkTheme;
    private String defaultCurrency;
    private LocalDateTime usernameChangedAt;

    public UserResponseDTO() {}

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.isDarkTheme = user.getIsDarkTheme();
        this.defaultCurrency = user.getDefaultCurrency();
        this.usernameChangedAt = user.getUsernameChangedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getIsDarkTheme() {
        return isDarkTheme;
    }

    public void setIsDarkTheme(Boolean isDarkTheme) {
        this.isDarkTheme = isDarkTheme;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }

    public LocalDateTime getUsernameChangedAt() {
        return usernameChangedAt;
    }

    public void setUsernameChangedAt(LocalDateTime usernameChangedAt) {
        this.usernameChangedAt = usernameChangedAt;
    }
}
