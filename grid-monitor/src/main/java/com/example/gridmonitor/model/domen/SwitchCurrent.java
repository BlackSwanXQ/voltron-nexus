package com.example.gridmonitor.model.domen;

import lombok.Data;

import java.time.Instant;

@Data
public class SwitchCurrent {
    private String switchId;
    private double currentAmperes;
    private Instant timestamp;
}
