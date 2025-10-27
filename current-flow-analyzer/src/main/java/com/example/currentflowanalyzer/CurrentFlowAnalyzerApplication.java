package com.example.currentflowanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CurrentFlowAnalyzerApplication {
    public static void main(String[] args) {
        SpringApplication.run(CurrentFlowAnalyzerApplication.class, args);
        System.out.println("🧮 Current Flow Analyzer запущен!");
        System.out.println("📤 Данные будут отправляться в Kafka каждые 10 секунд");
        System.out.println("🔗 Ручной запуск: POST http://localhost:8080/api/calculate");
    }
}