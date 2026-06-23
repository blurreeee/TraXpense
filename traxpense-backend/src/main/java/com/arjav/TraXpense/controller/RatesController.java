package com.arjav.TraXpense.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxies exchange rate requests to the ExchangeRate-API.
 * Avoids browser CORS issues by making the HTTP call server-side.
 *
 * Endpoint: GET /api/rates/latest?from={base}
 * Example:  GET /api/rates/latest?from=INR
 */
@RestController
@RequestMapping("/api/rates")
@CrossOrigin(origins = "*")
public class RatesController {

    @Value("${exchangerate.api.key}")
    private String apiKey;

    private static final String EXCHANGE_RATE_API_BASE = "https://v6.exchangerate-api.com/v6/";

    private final RestTemplate restTemplate;

    public RatesController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestRates(@RequestParam(defaultValue = "INR") String from) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalStateException("ExchangeRate-API key is not configured.");
            }
            String url = EXCHANGE_RATE_API_BASE + apiKey + "/latest/" + from.toUpperCase();
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(
                Map.of("error", "Failed to fetch exchange rates: " + e.getMessage())
            );
        }
    }
}
