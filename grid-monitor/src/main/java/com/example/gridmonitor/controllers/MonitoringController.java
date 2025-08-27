package com.example.gridmonitor.controllers;

import com.example.gridmonitor.model.domen.GridState;
import com.example.gridmonitor.model.domen.LineCurrent;
import com.example.gridmonitor.model.domen.SwitchCurrent;
import com.example.gridmonitor.services.GridStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MonitoringController {

    private final GridStateService gridStateService;

    // 1. Получить полное состояние системы
    @GetMapping("/state")
    public GridState getFullState() {
        return gridStateService.getCurrentState();
    }

    // 2. Получить все линии
    @GetMapping("/lines")
    public Map<String, LineCurrent> getAllLines() {
        return gridStateService.getCurrentState().getLineStates();
    }

    // 3. Получить конкретную линию по ID
    @GetMapping("/lines/{lineId}")
    public LineCurrent getLine(@PathVariable String lineId) {
        return gridStateService.getLineCurrent(lineId);
    }

    // 4. Получить все выключатели
    @GetMapping("/switches")
    public Map<String, SwitchCurrent> getAllSwitches() {
        return gridStateService.getCurrentState().getSwitchStates();
    }

    // 5. Получить конкретный выключатель по ID
    @GetMapping("/switches/{switchId}")
    public SwitchCurrent getSwitch(@PathVariable String switchId) {
        return gridStateService.getSwitchCurrent(switchId);
    }

    // 6. Простой health check
    @GetMapping("/health")
    public String health() {
        return "Grid Monitor is working!";
    }
}