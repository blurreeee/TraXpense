package com.arjav.TraXpense.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final String EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

    @Value("${emailjs.service-id}")
    private String serviceId;

    @Value("${emailjs.template-id}")
    private String templateId;

    @Value("${emailjs.public-key}")
    private String publicKey;

    @Value("${emailjs.private-key}")
    private String privateKey;

    private final RestTemplate restTemplate;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends a password reset email via EmailJS REST API (server-side).
     * This avoids CORS issues that occur when calling EmailJS from the browser.
     */
    public void sendPasswordResetEmail(String toName, String toEmail, String resetLink) {
        Map<String, Object> templateParams = new HashMap<>();
        templateParams.put("to_name", toName);
        templateParams.put("email", toEmail);
        templateParams.put("link", resetLink);

        Map<String, Object> payload = new HashMap<>();
        payload.put("service_id", serviceId);
        payload.put("template_id", templateId);
        payload.put("user_id", publicKey);
        payload.put("accessToken", privateKey);
        payload.put("template_params", templateParams);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(EMAILJS_API_URL, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("EmailJS returned status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }
}
