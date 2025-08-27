package com.example.gridmonitor.model.domen;

import com.example.gridmonitor.model.domen.LineCurrent;
import com.example.gridmonitor.model.domen.SwitchCurrent;
import lombok.Data;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class GridState {
    private Map<String, LineCurrent> lineStates = new ConcurrentHashMap<>();
    private Map<String, SwitchCurrent> switchStates = new ConcurrentHashMap<>();
}
