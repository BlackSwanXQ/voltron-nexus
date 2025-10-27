package com.example.energygridcompositionservice.dto.mapper;

import com.example.energygridcompositionservice.dto.ConnectedElementDto;
import com.example.energygridcompositionservice.dto.PowerLineDto;
import com.example.energygridcompositionservice.entity.Busbar;
import com.example.energygridcompositionservice.entity.ConnectedElement;
import com.example.energygridcompositionservice.entity.PowerLine;

public class ConnectedElementMapper {

    public static ConnectedElementDto toDto(ConnectedElement connectedElement) {
        ConnectedElementDto connectedElementDto = new PowerLineDto();
        connectedElementDto.setId(Long.toString(connectedElement.getId()));
        connectedElementDto.setName(connectedElement.getName());
        return connectedElementDto;
    }



    public static ConnectedElement toEntity(ConnectedElementDto connectedElementDto) {
        ConnectedElement connectedElement = new PowerLine();
        connectedElement.setId(Long.getLong(connectedElementDto.getId()));
        connectedElement.setName(connectedElementDto.getName());
        return connectedElement;
        }

    public static PowerLine toEntityLine(ConnectedElementDto connectedElementDto) {
        PowerLine connectedElement = new PowerLine();
        connectedElement.setId(Long.getLong(connectedElementDto.getId()));
        connectedElement.setName(connectedElementDto.getName());
        connectedElement.setVoltage(connectedElement.getVoltage());

        return connectedElement;
    }

    public static Busbar toEntityBus(ConnectedElementDto connectedElementDto) {
        Busbar connectedElement = new Busbar();
        connectedElement.setId(Long.getLong(connectedElementDto.getId()));
        connectedElement.setName(connectedElementDto.getName());
        connectedElement.setVoltage(connectedElement.getVoltage());

        return connectedElement;
    }



    }

