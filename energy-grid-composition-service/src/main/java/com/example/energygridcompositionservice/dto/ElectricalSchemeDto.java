package com.example.energygridcompositionservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// Main DTO для всей структуры
public class ElectricalSchemeDto {
    @JsonProperty("switches")  // ⬅️ Говорим Jackson: "в JSON это поле называется switches"
    private List<CircuitBreakerDto> switches;
    private String timestamp;
    private String version;

    // Constructors
    public ElectricalSchemeDto() {}

    public ElectricalSchemeDto(List<CircuitBreakerDto> switches, String timestamp, String version) {
        this.switches = switches;
        this.timestamp = timestamp;
        this.version = version;
    }

    // Getters and Setters
    public List<CircuitBreakerDto> getSwitches() {
        return switches;
    }

    public void setSwitches(List<CircuitBreakerDto> switches) {
        this.switches = switches;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return "ElectricalSchemeDto{" +
                "switches=" + switches +
                ", timestamp='" + timestamp + '\'' +
                ", version='" + version + '\'' +
                '}';
    }
}