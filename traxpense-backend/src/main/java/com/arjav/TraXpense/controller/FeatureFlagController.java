package com.arjav.TraXpense.controller;

import com.arjav.TraXpense.entity.FeatureFlag;
import com.arjav.TraXpense.service.FeatureFlagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feature-flags")
@CrossOrigin(origins = "*") // Assuming standard cross-origin configuration
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Boolean>> getAllFlags() {
        return ResponseEntity.ok(featureFlagService.getAllFeatureFlags());
    }

    @GetMapping("/{key}")
    public ResponseEntity<Boolean> getFlag(@PathVariable String key) {
        return ResponseEntity.ok(featureFlagService.isFeatureEnabled(key));
    }

    @PutMapping("/{key}")
    public ResponseEntity<FeatureFlag> updateFlag(@PathVariable String key, @RequestParam boolean enabled) {
        return ResponseEntity.ok(featureFlagService.setFeatureFlag(key, enabled));
    }
}
