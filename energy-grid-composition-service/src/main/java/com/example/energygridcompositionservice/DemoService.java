//package com.example.energygridcompositionservice;
//
//import com.example.energygridcompositionservice.entity.Busbar;
//import com.example.energygridcompositionservice.entity.CircuitBreaker;
//import com.example.energygridcompositionservice.entity.PowerLine;
//import com.example.energygridcompositionservice.entity.Transformer;
//import com.example.energygridcompositionservice.entity.enums.BreakerRole;
//import com.example.energygridcompositionservice.repository.BusbarRepository;
//import com.example.energygridcompositionservice.repository.CircuitBreakerRepository;
//import com.example.energygridcompositionservice.repository.PowerLineRepository;
//import com.example.energygridcompositionservice.repository.TransformerRepository;
//import jakarta.persistence.EntityManager;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@Transactional
//public class DemoService {
//
//    private final PowerLineRepository powerLineRepo;
//    private final BusbarRepository busbarRepo;
//    private final TransformerRepository transformerRepo;
//    private final CircuitBreakerRepository breakerRepo;
//    private final EntityManager em;
//
//    public DemoService(PowerLineRepository powerLineRepo,
//                       BusbarRepository busbarRepo,
//                       TransformerRepository transformerRepo,
//                       CircuitBreakerRepository breakerRepo,
//                       EntityManager em) {
//        this.powerLineRepo = powerLineRepo;
//        this.busbarRepo = busbarRepo;
//        this.transformerRepo = transformerRepo;
//        this.breakerRepo = breakerRepo;
//        this.em = em;
//    }
//
//    public void runDemo() {
//        // СОЗДАЕМ элементы
//        PowerLine line1 = new PowerLine("Линия 10кВ");
//        line1.setVoltage(10.0);
//        line1.setLength(5.2);
//        line1 = powerLineRepo.save(line1); // ТОЛЬКО ОДИН РАЗ
//
//        PowerLine line2 = new PowerLine("Линия 10кВ-2");
//        line2.setVoltage(10.0);
//        line2.setLength(3.8);
//        line2 = powerLineRepo.save(line2);
//
//        Busbar busbar = new Busbar("Шина 10кВ");
//        busbar.setVoltage(10.0);
//        busbar = busbarRepo.save(busbar);
//
//        Transformer transformer = new Transformer("Трансформатор 110/10кВ");
//        transformer.setVoltage(110.0);
//        transformer = transformerRepo.save(transformer);
//
//        Transformer transformer2 = new Transformer("Трансформатор2 110/10кВ");
//        transformer2.setVoltage(110.0);
//        transformer2 = transformerRepo.save(transformer2);
//
//
//        // СОЗДАЕМ выключатели
//        CircuitBreaker breaker1 = new CircuitBreaker("Выключатель Л1-Ш", line1, busbar, BreakerRole.LINE_TO_BUS);
//        breakerRepo.save(breaker1);
//        CircuitBreaker breaker2 = new CircuitBreaker("Выключатель Л1-Л2", line1, line2, BreakerRole.LINE_TO_LINE);
//        breakerRepo.save(breaker2);
//        CircuitBreaker breaker3 = new CircuitBreaker("Выключатель Ш-Т", busbar, transformer, BreakerRole.BUS_TO_TRANSFORMER);
//        breakerRepo.save(breaker3);
//        CircuitBreaker breaker4 = new CircuitBreaker("Выключатель Ш-Т2", busbar, transformer2, BreakerRole.BUS_TO_TRANSFORMER);
//        breakerRepo.save(breaker4);
//        em.detach(breaker1);
//        breaker1.setName("breaker1");
//
//
//        // ВЫВОД
//        showSimpleConnections();
//    }
//
//    public void showSimpleConnections() {
//        System.out.println("=== ПРОСТОЙ ВЫВОД ===");
//
//        // Линия(Шина): выключатели
//        System.out.println("\nЛиния(Шина): выключатели");
//        powerLineRepo.findAll().forEach(line -> {
//            List<String> breakers = breakerRepo.findByPowerElement(line).stream()
//                    .map(CircuitBreaker::getName)
//                    .collect(Collectors.toList());
//            System.out.println(line.getName() + ": " + String.join(", ", breakers));
//        });
//        busbarRepo.findAll().forEach(bus -> {
//            List<String> breakers = breakerRepo.findByPowerElement(bus).stream()
//                    .map(CircuitBreaker::getName)
//                    .collect(Collectors.toList());
//            System.out.println(bus.getName() + ": " + String.join(", ", breakers));
//        });
//        transformerRepo.findAll().forEach(tr -> {
//            List<String> breakers = breakerRepo.findByPowerElement(tr).stream()
//                    .map(CircuitBreaker::getName)
//                    .collect(Collectors.toList());
//            System.out.println(tr.getName() + ": " + String.join(", ", breakers));
//        });
//
//        // выключатель: Линия(шина)
//        System.out.println("\nвыключатель: Линия(шина)");
//        breakerRepo.findAll().forEach(breaker -> {
//            List<String> elements = Arrays.asList(
//                    breaker.getElementA().getName(),
//                    breaker.getElementB().getName()
//            );
//            System.out.println(breaker.getName() + ": " + String.join(" + ", elements));
//        });
//    }
//}