package com.example.currentflowanalyzer.dto;

import lombok.Data;
import java.util.Map;

// DTO для отправки в Kafka { "L1": 100.0, "c1": 50.0, ... }
@Data
public class CurrentMeasurementDto {
    private Map<String, Double> measurements;
}