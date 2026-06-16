package com.arjav.TraXpense.service;

import com.arjav.TraXpense.dto.ExtractedExpenseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiExtractionService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiExtractionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public List<ExtractedExpenseDTO> extractExpenseDataFromImage(MultipartFile imageFile) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key is not configured in application.properties.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        String prompt = "You are a financial data extractor. Look at this bank statement or payment app screenshot and extract ALL transactions visible.\n\n" +
            "IMPORTANT RULES:\n" +
            "1. Extract EVERY transaction listed, not just one.\n" +
            "2. For the 'amount' field, return ONLY the exact numeric value you see (e.g. if you see ₹264, return 264; if you see ₹530, return 530). Do NOT prepend or add any extra digits.\n" +
            "3. For 'category', classify based on merchant name (e.g., Food, Travel, Shopping, Entertainment, Utilities, Transfer).\n" +
            "4. For 'date', use YYYY-MM-DD format.\n" +
            "5. For 'merchant', use the payee/merchant name shown.\n" +
            "6. Return ONLY a valid JSON array of objects with keys: 'merchant' (string), 'amount' (number), 'date' (YYYY-MM-DD), 'category' (string).\n" +
            "7. Do NOT include markdown, backticks, or any explanation — only the raw JSON array.";

        try {
            // Encode image to base64
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";

            // Build multimodal request body
            Map<String, Object> imagePart = Map.of(
                "inline_data", Map.of(
                    "mime_type", mimeType,
                    "data", base64Image
                )
            );
            Map<String, Object> textPart = Map.of("text", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                Map.of("parts", List.of(imagePart, textPart))
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String jsonString = (String) parts.get(0).get("text");
                        // Strip markdown fences if present
                        jsonString = jsonString.replaceAll("(?s)```json\\s*", "").replaceAll("```", "").trim();
                        return objectMapper.readValue(jsonString, new TypeReference<List<ExtractedExpenseDTO>>() {});
                    }
                }
            }
            throw new RuntimeException("Failed to extract data from Gemini response");
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Gemini API: " + e.getMessage(), e);
        }
    }
}
