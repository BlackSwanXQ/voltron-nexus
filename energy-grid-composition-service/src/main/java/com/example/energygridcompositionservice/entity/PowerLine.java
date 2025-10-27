package com.example.energygridcompositionservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "power_lines")
public class PowerLine extends ConnectedElement {
    @Column(name = "voltage")
    private double voltage;

    @Column(name = "length")
    private double length;

    public PowerLine(String name) {
        super(name);
    }

    public PowerLine() {
        super();
    }

    public double getVoltage() { return voltage; }
    public void setVoltage(double voltage) { this.voltage = voltage; }
    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }
}