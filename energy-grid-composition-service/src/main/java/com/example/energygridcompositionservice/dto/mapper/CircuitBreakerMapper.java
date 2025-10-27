package com.example.energygridcompositionservice.dto.mapper;

import com.example.energygridcompositionservice.dto.CircuitBreakerDto;
import com.example.energygridcompositionservice.dto.ConnectedElementDto;
import com.example.energygridcompositionservice.entity.CircuitBreaker;
import com.example.energygridcompositionservice.entity.ConnectedElement;

import java.util.ArrayList;
import java.util.List;

public class CircuitBreakerMapper {

    public static CircuitBreakerDto toDto(CircuitBreaker circuitBreaker) {
        CircuitBreakerDto circuitBreakerDto = new CircuitBreakerDto();

        circuitBreakerDto.setId(String.valueOf(circuitBreaker.getId()));
        circuitBreakerDto.setName(circuitBreaker.getName());
        circuitBreakerDto.setHeight(circuitBreaker.getHeight());
        circuitBreakerDto.setWidth(circuitBreaker.getWidth());

        List<ConnectedElementDto> powerElement = new ArrayList<>();
        powerElement.add(ConnectedElementMapper.toDto(circuitBreaker.getElementA()));
        powerElement.add(ConnectedElementMapper.toDto(circuitBreaker.getElementB()));
        circuitBreakerDto.setConnectedElements(powerElement);

        circuitBreakerDto.setStatus(circuitBreakerDto.getStatus());
        circuitBreakerDto.setVoltage(circuitBreaker.getVoltage());
        circuitBreakerDto.setX(circuitBreaker.getX());
        circuitBreakerDto.setY(circuitBreaker.getY());
        return circuitBreakerDto;
    }

    public static CircuitBreaker toEntity(CircuitBreakerDto circuitBreakerDto) {
        CircuitBreaker circuitBreaker = new CircuitBreaker();

        circuitBreaker.setName(String.valueOf(circuitBreakerDto.getName()));
        circuitBreaker.setHeight(circuitBreakerDto.getHeight());
        circuitBreaker.setWidth(circuitBreakerDto.getWidth());
        circuitBreaker.setX(circuitBreakerDto.getX());
        circuitBreaker.setY(circuitBreakerDto.getY());
        circuitBreaker.setVoltage(circuitBreakerDto.getVoltage());
//        circuitBreaker.setStatus(circuitBreakerDto.getStatus());
        circuitBreaker.setElementA(ConnectedElementMapper.toEntity(circuitBreakerDto.getConnectedElements().get(0)));
        if (circuitBreakerDto.getConnectedElements().size() > 1 && circuitBreakerDto.getConnectedElements().get(1) != null) {
            circuitBreaker.setElementB(ConnectedElementMapper.toEntity(circuitBreakerDto.getConnectedElements().get(1)));
        }
        return circuitBreaker;
    }
}

