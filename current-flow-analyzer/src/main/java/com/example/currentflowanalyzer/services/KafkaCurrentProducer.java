package com.example.currentflowanalyzer.services;

import com.example.currentflowanalyzer.ClassicalSuperpositionSolver2;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaCurrentProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final CalculationService calculationService;

    // Добавляем если нужно metricsService
    // private final MetricsService metricsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(fixedRateString = "${app.scheduling.interval}")
    public void sendMeasurementsAutomatically() {
        try {
//            sendLineCurrentMeasurements();
            sendCircuitBreakerCurrentMeasurements();
        } catch (JsonProcessingException e) {
            log.error("❌ Ошибка преобразования в JSON: {}", e.getMessage());
        }
    }

//    public void sendLineCurrentMeasurements() throws JsonProcessingException {
        // Сразу создаем effectively final переменную
//        final Map<String, Double> calculations = calculationService.calculateCurrents();
//        String jsonMessage = objectMapper.writeValueAsString(calculations);

//        kafkaTemplate.send("line-measurements", String.valueOf(new Random().nextInt(2,100)), jsonMessage)
//                .thenAccept(result -> {
//                    log.info("✅ Данные отправлены. Topic: {}, partition: {}, Offset: {}",
//                            result.getRecordMetadata().topic(),
//                            result.getRecordMetadata().partition(),
//                            result.getRecordMetadata().offset());
//
//                    log.info("Отправленные данные: {}", jsonMessage); // ← Теперь OK
//                })
//                .exceptionally(ex -> {
//                    log.error("❌ Ошибка отправки: {}", ex.getMessage());
//                    return null;
//                });
//    }

    public void sendCircuitBreakerCurrentMeasurements() throws JsonProcessingException {
        // Сразу создаем effectively final переменную
        final Map<String, Double> calculations = calculationService.currentCircuitBreaker();
        String jsonMessage = objectMapper.writeValueAsString(calculations);

        kafkaTemplate.send("switch-measurements", String.valueOf(new Random().nextInt(2,100)), jsonMessage)
                .thenAccept(result -> {
                    log.info("✅ Данные отправлены. Topic: {}, partition: {}, Offset: {}",
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());

                    log.info("Отправленные данные: {}", jsonMessage); // ← Теперь OK
                })
                .exceptionally(ex -> {
                    log.error("❌ Ошибка отправки: {}", ex.getMessage());
                    return null;
                });

    }
}