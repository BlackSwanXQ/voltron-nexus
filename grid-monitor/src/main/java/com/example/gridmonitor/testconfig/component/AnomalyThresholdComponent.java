package com.example.gridmonitor.testconfig.component;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "component.anomaly.threshold")
@Getter
@Setter
@Slf4j
public class AnomalyThresholdComponent {
    private double voltage;
    private double current;
    private double frequency;

    @PostConstruct
    public void init() {
        log.info("✅ Бин AnomalyThresholdComponent создан: voltage={}, current={}, frequency={}",
                voltage, current, frequency);
    }
}