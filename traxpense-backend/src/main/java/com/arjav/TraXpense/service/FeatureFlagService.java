package com.arjav.TraXpense.service;

import com.arjav.TraXpense.entity.FeatureFlag;
import com.arjav.TraXpense.repository.FeatureFlagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;

    public FeatureFlagService(FeatureFlagRepository featureFlagRepository) {
        this.featureFlagRepository = featureFlagRepository;
    }

    public Map<String, Boolean> getAllFeatureFlags() {
        List<FeatureFlag> flags = featureFlagRepository.findAll();
        return flags.stream()
            .collect(Collectors.toMap(FeatureFlag::getKey, FeatureFlag::isEnabled));
    }

    public boolean isFeatureEnabled(String key) {
        return featureFlagRepository.findByKey(key)
                .map(FeatureFlag::isEnabled)
                .orElseGet(() -> {
                    // Auto-register missing flag as disabled
                    FeatureFlag newFlag = new FeatureFlag(key, false);
                    featureFlagRepository.save(newFlag);
                    return false;
                });
    }

    public FeatureFlag setFeatureFlag(String key, boolean enabled) {
        FeatureFlag flag = featureFlagRepository.findByKey(key)
                .orElse(new FeatureFlag(key, false));
        flag.setEnabled(enabled);
        return featureFlagRepository.save(flag);
    }
}
