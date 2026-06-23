package com.arjav.TraXpense.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FeatureFlagService {

    private final Map<String, Boolean> hardcodedFlags = new ConcurrentHashMap<>();

    public FeatureFlagService() {
        // Define hardcoded feature flags here
        hardcodedFlags.put("import_receipt", false);
        hardcodedFlags.put("default_currency_setting", true);
    }

    public Map<String, Boolean> getAllFeatureFlags() {
        return hardcodedFlags;
    }

    public boolean isFeatureEnabled(String key) {
        return hardcodedFlags.getOrDefault(key, false);
    }
}
