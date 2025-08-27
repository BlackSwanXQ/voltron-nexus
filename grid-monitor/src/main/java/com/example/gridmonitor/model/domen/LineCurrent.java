package com.example.gridmonitor.model.domen;

import lombok.Data;

import java.time.Instant;

@Data
public class LineCurrent {
    private String lineId;
    private double currentAmperes;
    private Instant timestamp;
}
