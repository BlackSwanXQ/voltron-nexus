import React from 'react';
import {ELEMENT_TYPES} from '../../shared/ElementTypes';
import {PropertiesPanelProps} from "../../types/types";

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
                                                                    showProperties,
                                                                    setShowProperties,
                                                                    selectedElementData,
                                                                    selectedElements,
                                                                    elements,
                                                                    updateElementProperty,
                                                                    getElementColor
                                                                }) => {
    if (!showProperties || (!selectedElementData && selectedElements.size === 0)) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            left: 10,
            background: 'white',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            zIndex: 1000,
            minWidth: '250px',
            maxWidth: '300px',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{margin: 0}}>Свойства</h3>
                <button
                    onClick={() => setShowProperties(false)}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            {selectedElementData && (
                <div>
                    <div style={{marginBottom: '10px'}}>
                        <strong>Тип:</strong> {selectedElementData.type}
                    </div>

                    {/* Напряжение */}
                    <div style={{marginBottom: '10px'}}>
                        <label>
                            <strong>Напряжение (кВ):</strong>
                            <select
                                value={selectedElementData.voltage || 110}
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'voltage', parseInt(e.target.value))}
                                style={{marginLeft: '10px', padding: '5px'}}
                            >
                                <option value={10}>10</option>
                                <option value={110}>110</option>
                                <option value={220}>220</option>
                                <option value={330}>330</option>
                                <option value={750}>750</option>
                            </select>
                        </label>
                    </div>

                    {/* Метка */}
                    {(selectedElementData.type === ELEMENT_TYPES.BUS ||
                        selectedElementData.type === ELEMENT_TYPES.SWITCH ||
                        selectedElementData.type === ELEMENT_TYPES.GENERATOR ||
                        selectedElementData.type === ELEMENT_TYPES.LOAD ||
                        selectedElementData.type === ELEMENT_TYPES.LINE ||
                        selectedElementData.type === ELEMENT_TYPES.BUS_BAR) && (
                        <div style={{marginBottom: '10px'}}>
                            <label>
                                <strong>Метка:</strong>
                                <input
                                    type="text"
                                    value={selectedElementData.label || ''}
                                    onChange={(e) => updateElementProperty(selectedElementData.id, 'label', e.target.value)}
                                    style={{marginLeft: '10px', padding: '5px', width: '150px'}}
                                />
                            </label>
                        </div>
                    )}

                    {/* Позиция метки для шины */}
                    {selectedElementData.type === ELEMENT_TYPES.BUS && (
                        <div style={{marginBottom: '10px'}}>
                            <label>
                                <strong>Позиция метки:</strong>
                                <select
                                    value={selectedElementData.labelPosition || 'top'}
                                    onChange={(e) => updateElementProperty(selectedElementData.id, 'labelPosition', e.target.value)}
                                    style={{marginLeft: '10px', padding: '5px'}}
                                >
                                    <option value="top">Сверху</option>
                                    <option value="bottom">Снизу</option>
                                    <option value="left">Слева</option>
                                    <option value="right">Справа</option>

                                </select>
                            </label>
                        </div>
                    )}

                    {/* Статус выключателя */}
                    {selectedElementData.type === ELEMENT_TYPES.SWITCH && (
                        <div style={{marginBottom: '10px'}}>
                            <label>
                                <strong>Статус:</strong>
                                <select
                                    value={selectedElementData.status || 'closed'}
                                    onChange={(e) => updateElementProperty(selectedElementData.id, 'status', e.target.value)}
                                    style={{marginLeft: '10px', padding: '5px'}}
                                >
                                    <option value="closed">Закрыт</option>
                                    <option value="open">Открыт</option>
                                </select>
                            </label>
                        </div>
                    )}

                    {/* Толщина для линий и ошиновки */}
                    {(selectedElementData.type === ELEMENT_TYPES.LINE || selectedElementData.type === ELEMENT_TYPES.BUS_BAR) && (
                        <div style={{marginBottom: '10px'}}>
                            <label>
                                <strong>Толщина:</strong>
                                <input
                                    type="number"
                                    value={selectedElementData.thickness || (selectedElementData.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4)}
                                    onChange={(e) => updateElementProperty(selectedElementData.id, 'thickness', parseInt(e.target.value) || 0)}
                                    style={{marginLeft: '10px', padding: '5px', width: '80px'}}
                                    min="2"
                                    max="10"
                                />
                            </label>
                        </div>
                    )}

                    {/* Координаты */}
                    <div style={{marginBottom: '10px'}}>
                        <strong>Координаты:</strong>
                        <div>X: {Math.round(selectedElementData.x)}</div>
                        <div>Y: {Math.round(selectedElementData.y)}</div>
                    </div>

                </div>
            )}

        </div>
    );
};