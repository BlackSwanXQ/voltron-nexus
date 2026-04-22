package com.example.energygridcompositionservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import java.util.Arrays;
import java.util.List;

@Entity
public class Busbar extends ConnectedElement {
    @Column(name = "voltage")
    private double voltage;

    public Busbar(String name) {
        super(name);
    }

    public Busbar() {
    }

    public double getVoltage() {
        return voltage;
    }

    public void setVoltage(double voltage) {
        this.voltage = voltage;
    }

}