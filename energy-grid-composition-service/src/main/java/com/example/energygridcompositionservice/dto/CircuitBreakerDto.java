package com.example.energygridcompositionservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// DTO для выключателя
@Getter
@Setter
public class CircuitBreakerDto {
    private String id;
    private String name;
    private Integer voltage;
    private String status;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private List<ConnectedElementDto> connectedElements;

    // Constructors
    public CircuitBreakerDto() {
    }


    @Override
    public String toString() {
        return "CircuitBreakerDto{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", voltage=" + voltage +
                ", status='" + status + '\'' +
                ", x=" + x +
                ", y=" + y +
                ", width=" + width +
                ", height=" + height +
                ", connectedElements=" + connectedElements +
                '}';
    }
}