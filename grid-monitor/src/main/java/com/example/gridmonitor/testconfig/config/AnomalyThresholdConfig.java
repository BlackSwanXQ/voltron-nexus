package com.example.gridmonitor.testconfig.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@Slf4j
public class AnomalyThresholdConfig {
    private double voltage;
    private double current;
    private double frequency;

    @PostConstruct
    public void init() {
        log.info("✅ 🟢 🪝🧲🚬Бин AnomalyThresholdConfig создан: voltage={}, current={}, frequency={}",
                voltage, current, frequency);
    }

}