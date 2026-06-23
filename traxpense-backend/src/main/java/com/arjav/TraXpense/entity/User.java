package com.arjav.TraXpense.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean isDarkTheme = true;

    @Column(name = "default_currency", length = 10, columnDefinition = "varchar(10) default 'INR'")
    private String defaultCurrency = "INR";

    @Column(name = "username_changed_at")
    private LocalDateTime usernameChangedAt;

    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'USER'")
    private String role = "USER";

    public User() {
    }

    public User(String name, String username, String email, String password) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
