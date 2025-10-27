package com.example.gridmonitor.consumer;

import com.example.gridmonitor.services.GridStateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class CurrentMeasurementConsumer {

    private final GridStateService gridStateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(
            topics = "${kafka.topics.switch-measurements}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "3"

    )
    public void consumeCurrentData(String jsonMessage,
                                   @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                   @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                                   @Header(KafkaHeaders.OFFSET) long offset,
                                   @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        try {
            log.info("✅ Получены данные из Kafka - Topic: {}, Partition: {}, Offset: {}, Key: {}, Value {}",
                    topic, partition, offset, key, jsonMessage);

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
//            log.info("✅ Данные успешно обработаны");

        } catch (Exception e) {
            log.error("❌ Ошибка в consumer: {}", e.getMessage());
            log.error("❌ Проблемное сообщение: {}", jsonMessage);
        }
    }
}