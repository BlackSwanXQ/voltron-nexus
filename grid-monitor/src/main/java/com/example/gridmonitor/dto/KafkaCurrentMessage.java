package com.example.gridmonitor.dto;

import lombok.Data;

import java.util.Map;

@Data
public class KafkaCurrentMessage {
    private Map<String, Double> measurements;
}