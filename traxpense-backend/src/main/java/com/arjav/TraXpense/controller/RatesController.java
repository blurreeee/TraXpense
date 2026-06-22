package com.arjav.TraXpense.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxies exchange rate requests to the Frankfurter API (api.frankfurter.app).
 * Avoids browser CORS issues by making the HTTP call server-side.
 *
 * Endpoint: GET /api/rates/latest?from={base}
 * Example:  GET /api/rates/latest?from=INR
 */
@RestController
@RequestMapping("/api/rates")
@CrossOrigin(origins = "*")
public class RatesController {

    private static final String FRANKFURTER_BASE = "https://api.frankfurter.app";

    private final RestTemplate restTemplate;

    public RatesController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestRates(@RequestParam(defaultValue = "INR") String from) {
        try {
            String url = FRANKFURTER_BASE + "/latest?from=" + from.toUpperCase();
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(
                Map.of("error", "Failed to fetch exchange rates: " + e.getMessage())
            );
        }
    }
}
