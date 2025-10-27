package com.example.energygridcompositionservice.dto;

import jakarta.persistence.Column;

public class PowerLineDto extends ConnectedElementDto {
    private double voltage;

    private double length;

    public PowerLineDto(String name) {
        super(name);
    }

    public PowerLineDto() {
        super();
    }

    public double getVoltage() { return voltage; }
    public void setVoltage(double voltage) { this.voltage = voltage; }
    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }
}