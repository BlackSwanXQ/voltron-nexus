package com.example.energygridcompositionservice.controllers;

import com.example.energygridcompositionservice.dto.ElectricalSchemeDto;
import com.example.energygridcompositionservice.services.EnergyGridService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EnergyGridController {

    EnergyGridService energyGridService;

    public EnergyGridController(EnergyGridService energyGridService) {
        this.energyGridService = energyGridService;
    }

    @PostMapping("/energy-grid/connections")
    public ResponseEntity<Map<String, String>> postConnection(@RequestBody ElectricalSchemeDto electricalSchemeDto) {
        System.out.println(electricalSchemeDto.toString());

//        // Возвращаем ответ фронтенду
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Данные успешно получены");
//        response.put("status", "success");
//        return ResponseEntity.ok(response);

        return ResponseEntity.ok(energyGridService.save(electricalSchemeDto));
    }
}