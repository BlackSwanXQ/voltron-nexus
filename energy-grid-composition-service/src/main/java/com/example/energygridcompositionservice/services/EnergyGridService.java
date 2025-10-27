package com.example.energygridcompositionservice.services;


import com.example.energygridcompositionservice.dto.CircuitBreakerDto;
import com.example.energygridcompositionservice.dto.ConnectedElementDto;
import com.example.energygridcompositionservice.dto.PowerLineDto;
import com.example.energygridcompositionservice.dto.mapper.CircuitBreakerMapper;
import com.example.energygridcompositionservice.dto.mapper.ConnectedElementMapper;
import com.example.energygridcompositionservice.entity.Busbar;
import com.example.energygridcompositionservice.entity.CircuitBreaker;
import com.example.energygridcompositionservice.entity.ConnectedElement;
import com.example.energygridcompositionservice.entity.PowerLine;
import com.example.energygridcompositionservice.repository.*;
import com.example.energygridcompositionservice.dto.ElectricalSchemeDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class EnergyGridService {

    private final BusbarRepository busbarRepository;
    private final PowerLineRepository powerLineRepository;
    private final CircuitBreakerRepository circuitBreakerRepository;
    private final ConnectedElementRepository powerElementRepository;
    private final TransformerRepository transformerRepository;

    public EnergyGridService(BusbarRepository busbarRepository,
                             ConnectedElementRepository powerElementRepository,
                             CircuitBreakerRepository circuitBreakerRepository,
                             PowerLineRepository powerLineRepository,
                             TransformerRepository transformerRepository) {
        this.busbarRepository = busbarRepository;
        this.powerLineRepository = powerLineRepository;
        this.circuitBreakerRepository = circuitBreakerRepository;
        this.powerElementRepository = powerElementRepository;
        this.transformerRepository = transformerRepository;
    }

    @Transactional
    public Map<String, String> save(ElectricalSchemeDto electricalSchemeDto) {

        List<ConnectedElementDto> connectedElementsDto = electricalSchemeDto.getSwitches().stream()
                .map(CircuitBreakerDto::getConnectedElements)
                .flatMap(List::stream)
                .toList();

        List<PowerLine> lines = connectedElementsDto.stream()
                .filter(el -> el.getType().equals("line"))
                .map(ConnectedElementMapper::toEntityLine)
                .toList();

        powerLineRepository.saveAll(lines);

        System.out.println(lines);


        List<Busbar> buses = connectedElementsDto.stream()
                .filter(el -> el.getType().equals("bus"))
                .map(ConnectedElementMapper::toEntityBus)
                .toList();

        busbarRepository.saveAll(buses);

        System.out.println(buses);

//        Map<Long, ConnectedElement> connectedElementsMap = new HashMap<>();

        List<ConnectedElement> connectedElement = powerElementRepository.findAll();

        Map<String, ConnectedElement> elementMap = connectedElement.stream()
                .collect(Collectors.toMap(
                        ConnectedElement::getName,
                        e -> e,
                        (existing, replacement) -> existing // обработка дубликатов
                ));
        System.out.println("Map " + elementMap);


        List<CircuitBreaker> circuitBreakers = electricalSchemeDto.getSwitches().stream()
                .map(switchDto -> {
                    CircuitBreaker circuitBreaker = CircuitBreakerMapper.toEntity(switchDto);

                    // Устанавливаем sideA (первый элемент)
                    if (!switchDto.getConnectedElements().isEmpty()) {
                        ConnectedElementDto firstElement = switchDto.getConnectedElements().get(0);
                        ConnectedElement sideA = elementMap.get(firstElement.getName());
                        circuitBreaker.setElementA(sideA);
                    }

                    // Устанавливаем sideB (второй элемент)
                    if (switchDto.getConnectedElements().size() > 1) {
                        ConnectedElementDto secondElement = switchDto.getConnectedElements().get(1);
                        ConnectedElement sideB = elementMap.get(secondElement.getName());
                        circuitBreaker.setElementB(sideB);
                    }

                    return circuitBreaker;
                })
                .collect(Collectors.toList());


        circuitBreakerRepository.saveAll(circuitBreakers);


        Map<String, String> response = new HashMap<>();
        response.put("message", "Данные успешно получены");
        response.put("status", "success");
        return response;

    }

}
