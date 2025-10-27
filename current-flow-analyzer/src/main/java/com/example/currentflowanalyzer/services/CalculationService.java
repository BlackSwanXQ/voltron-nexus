package com.example.currentflowanalyzer.services;

import com.example.currentflowanalyzer.ClassicalSuperpositionSolver2;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CalculationService {

    public Map<String, Double> currentCircuitBreaker() {
        // Ваша существующая логика расчета из main метода
//        Map<String, Double> result = new HashMap<>();
//
//        // Заглушка с вашими данными (замените на ваш расчет)
//        result.put("L1", 100.0);
//        result.put("L2", -30.0);
//        result.put("L3", 80.0);
//        result.put("L4", -40.0);
//        result.put("L5", -60.0);
//        result.put("L6", -50.0);
//        result.put("c1", 50.0);
//        result.put("c2", 50.0);
//        result.put("c3", -30.0);
//        // ... и т.д. все ваши 9 выключателей
//
//        return result;
//    }
//
//    public Map<String, Double> currentCircuitBreaker() {
//        Map<String, Double> result = new HashMap<>();
//
//        // Заглушка с вашими данными (замените на ваш расчет)
//        result.put("c1", 50.0);
//        result.put("c2", 50.0);
//        result.put("c3", -30.0);
//        result.put("c4", 50.0);
//        result.put("c5", 50.0);
//        result.put("c6", -30.0);
//        result.put("c7", 50.0);
//        result.put("c8", 50.0);
//        result.put("c9", -30.0);
//
//        return result;
//    }
//
//    public Map<String, Double> currentTransmissionLine() {
//        Map<String, Double> result = new HashMap<>();
//        result.put("L1", 100.0);
//        result.put("L2", -30.0);
//        result.put("L3", 80.0);
//        result.put("L4", -40.0);
//        result.put("L5", -60.0);
//        result.put("L6", -50.0);
//
//        return result;


        // Пример конфигурации с строковыми узлами
        Map<String, List<String>> config1 = Map.of(
                "Q B1/L1", List.of("B1", "L1"),
                "Q B1/L3", List.of("B1", "L3"),
                "Q B1/L5", List.of("B1", "L5"),
                "Q L1/L2", List.of("L1", "L2"),
                "Q L3/L4", List.of("L3", "L4"),
                "Q L5/L6", List.of("L5", "L6"),
                "Q B2/L2", List.of("B2", "L2"),
                "Q B2/L4", List.of("B2", "L4"),
                "Q B2/L6", List.of("B2", "L6")
        );

        // Источники со строковыми узлами
        List<Source> sources1 = List.of(
                new Source("L1", 500.0),
                new Source("L5", 200.0)
        );

        // Нагрузки
        Map<String, Double> loads1 = Map.of(
                "L2", 100.0,
                "L3", 200.0,
                "L4", 150.0,
                "L6", 250.0
        );

        // 1. Все ветви включены
//        System.out.println("=== ВСЕ ВЕТВИ ВКЛЮЧЕНЫ ===");
        ClassicalSuperpositionSolver2 solver1 = new ClassicalSuperpositionSolver2(config1, sources1, loads1);
        return solver1.solve();
    }
}