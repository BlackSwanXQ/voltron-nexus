package com.example.energygridcompositionservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Transformer extends ConnectedElement {
    @Column(name = "voltage")
    private double voltage;

    public Transformer(String name) {
        super(name);
    }

    public Transformer() {}

    public double getVoltage() { return voltage; }
    public void setVoltage(double voltage) { this.voltage = voltage; }
}