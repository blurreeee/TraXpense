package com.arjav.TraXpense.controller;
import com.arjav.TraXpense.service.FeatureFlagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
@RestController
@RequestMapping("/api/feature-flags")
@CrossOrigin(origins = "*")
public class FeatureFlagController {
    private final FeatureFlagService featureFlagService;
    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }
    @GetMapping
    public ResponseEntity<?> getAllFlags() {
        Map<String, Boolean> flags = featureFlagService.getAllFeatureFlags();
        System.out.println("Returning feature flags: " + flags);
        return ResponseEntity.ok(flags);
    }
}
