package com.example.currentflowanalyzer.controllers;

import com.example.currentflowanalyzer.services.KafkaCurrentProducer;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculate")
@RequiredArgsConstructor
public class CalculationController {

    private final KafkaCurrentProducer kafkaCurrentProducer;

    @PostMapping
    public String calculateAndSend() throws JsonProcessingException {
//        kafkaCurrentProducer.sendLineCurrentMeasurements();
        kafkaCurrentProducer.sendCircuitBreakerCurrentMeasurements();
        return "Расчет завершен и данные отправлены в Kafka";
    }
}