package com.example.gridmonitor.services;

import com.example.gridmonitor.model.domen.GridState;
import com.example.gridmonitor.model.domen.LineCurrent;
import com.example.gridmonitor.model.domen.SwitchCurrent;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@Slf4j  // Добавляем логирование
public class GridStateService {

    @Getter
    private GridState currentState;

    @PostConstruct
    public void init() {
        this.currentState = new GridState();
    }

    public void updateState(Map<String, Double> measurements) {
        // ВАЖНО: проверяем на null и пустоту
        if (measurements == null || measurements.isEmpty()) {
            log.warn("⚠️ Получены пустые или null измерения");
            return;
        }

        try {
            measurements.forEach((key, value) -> {
                if (key.startsWith("L")) {
                    LineCurrent line = new LineCurrent();
                    line.setLineId(key);
                    line.setCurrentAmperes(value);
                    line.setTimestamp(Instant.now());
                    currentState.getLineStates().put(key, line);
                } else if (key.startsWith("c")) {
                    SwitchCurrent switchCurrent = new SwitchCurrent();
                    switchCurrent.setSwitchId(key);
                    switchCurrent.setCurrentAmperes(value);
                    switchCurrent.setTimestamp(Instant.now());
                    currentState.getSwitchStates().put(key, switchCurrent);
                } else {
                    log.warn("⚠️ Неизвестный ключ измерения: {}", key);
                }
            });
            log.info("✅ Состояние сети обновлено. Линий: {}, Выключателей: {}",
                    currentState.getLineStates().size(),
                    currentState.getSwitchStates().size());

        } catch (Exception e) {
            log.error("❌ Ошибка при обновлении состояния: {}", e.getMessage());
        }
    }

    public LineCurrent getLineCurrent(String lineId) {
        return currentState.getLineStates().get(lineId);
    }

    public SwitchCurrent getSwitchCurrent(String switchId) {
        return currentState.getSwitchStates().get(switchId);
    }
}