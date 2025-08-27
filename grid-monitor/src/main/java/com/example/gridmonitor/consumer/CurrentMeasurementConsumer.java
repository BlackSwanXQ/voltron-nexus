package com.example.gridmonitor.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.gridmonitor.services.GridStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class CurrentMeasurementConsumer {

    private final GridStateService gridStateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(
            topics = "${kafka.topic.current-measurements}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeCurrentData(String jsonMessage) {
        try {
            log.info("📨 Получены данные из Kafka: {}", jsonMessage);

            Map<String, Double> measurements = objectMapper.readValue(jsonMessage, Map.class);

            // Двойная проверка!
            if (measurements == null) {
                log.error("❌ objectMapper вернул null!");
                return;
            }

            if (measurements.isEmpty()) {
                log.warn("⚠️ Пустые измерения");
                return;
            }

            gridStateService.updateState(measurements);
            log.info("✅ Данные успешно обработаны");

        } catch (Exception e) {
            log.error("❌ Ошибка в consumer: {}", e.getMessage());
            log.error("❌ Проблемное сообщение: {}", jsonMessage);
        }
    }
}