package com.example.gridmonitor.testconfig.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    @ConfigurationProperties(prefix = "config.anomaly.threshold")
    public AnomalyThresholdConfig anomalyThresholdConfig() {
        return new AnomalyThresholdConfig();
    }
}

