// components/Toolbar/Toolbar.tsx
import React from 'react';
import {ELEMENT_TYPES} from '../../shared/ElementTypes';
import {ICONS} from '../../shared/icons';
import {ToolbarProps} from "../../types/types";
import energyGrid from "../../EnergyGrid";

export const Toolbar: React.FC<ToolbarProps> = ({
                                                    mode,
                                                    selectedElement,
                                                    setMode,
                                                    selectedTool,
                                                    selectTool,
                                                    drawingMode,
                                                    startDrawingLine,
                                                    startDrawingBusBar,
                                                    orthogonalMode,
                                                    toggleOrthogonalMode,
                                                    cancelDrawing,
                                                    cancelToolSelection,
                                                    selectedElements,
                                                    elements,
                                                    connectSelectedElements,
                                                    showProperties,
                                                    setShowProperties,
                                                    handleForceSave,
                                                    handleForceLoad,
                                                    centerView,
                                                    // debugConnections,
                                                    previewExportData,
                                                    sendToBackend,
                                                    exportSwitchesWithConnections,
                                                    connectionMode,
                                                    setConnectionMode
                                                }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '140px',
            gap: '8px'
        }}>
            {/* Переключение режимов */}
            <div style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
                <button
                    onClick={() => setMode('edit')}
                    style={{
                        padding: '6px 8px',
                        background: mode === 'edit' ? '#2196F3' : '#e0e0e0',
                        color: mode === 'edit' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        flex: 1
                    }}
                >
                    ✏️ Редактор
                </button>
                <button
                    onClick={() => setMode('simulation')}
                    style={{
                        padding: '6px 8px',
                        background: mode === 'simulation' ? '#4CAF50' : '#e0e0e0',
                        color: mode === 'simulation' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        flex: 1
                    }}
                >
                    ⚡ Модель
                </button>
            </div>

            {mode === 'edit' && (
                <>
                    {/* Инструменты размещения */}
                    <div style={{borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '5px'}}>
                        <button
                            onClick={() => selectTool(ELEMENT_TYPES.BUS)}
                            style={{
                                background: selectedTool === ELEMENT_TYPES.BUS ? '#2196F3' : '#e0e0e0',
                                color: selectedTool === ELEMENT_TYPES.BUS ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.BUS} Шина
                        </button>
                        <button
                            onClick={() => selectTool(ELEMENT_TYPES.SWITCH)}
                            style={{
                                background: selectedTool === ELEMENT_TYPES.SWITCH ? '#2196F3' : '#e0e0e0',
                                color: selectedTool === ELEMENT_TYPES.SWITCH ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.SWITCH} Выключатель
                        </button>
                        <button
                            onClick={() => selectTool(ELEMENT_TYPES.GENERATOR)}
                            style={{
                                background: selectedTool === ELEMENT_TYPES.GENERATOR ? '#2196F3' : '#e0e0e0',
                                color: selectedTool === ELEMENT_TYPES.GENERATOR ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.GENERATOR} Генератор
                        </button>
                        <button
                            onClick={() => selectTool(ELEMENT_TYPES.LOAD)}
                            style={{
                                background: selectedTool === ELEMENT_TYPES.LOAD ? '#2196F3' : '#e0e0e0',
                                color: selectedTool === ELEMENT_TYPES.LOAD ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.LOAD} Нагрузка
                        </button>
                        <button
                            onClick={() => selectTool(ELEMENT_TYPES.JUNCTION)}
                            style={{
                                background: selectedTool === ELEMENT_TYPES.JUNCTION ? '#2196F3' : '#e0e0e0',
                                color: selectedTool === ELEMENT_TYPES.JUNCTION ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%'
                            }}
                        >
                            {ICONS.JUNCTION} Точка
                        </button>
                    </div>

                     {/*Инструменты рисования */}
                    <div style={{borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '5px'}}>
                        <button
                            onClick={startDrawingLine}
                            style={{
                                background: drawingMode === 'line' ? '#2196F3' : '#e0e0e0',
                                color: drawingMode === 'line' ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.LINE} Рисовать линию
                        </button>
                        <button
                            onClick={startDrawingBusBar}
                            style={{
                                background: drawingMode === 'bus_bar' ? '#2196F3' : '#e0e0e0',
                                color: drawingMode === 'bus_bar' ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {ICONS.BUS_BAR} Рисовать ошиновку
                        </button>

                        <button
                            onClick={toggleOrthogonalMode}
                            style={{
                                background: orthogonalMode ? '#4CAF50' : '#e0e0e0',
                                color: orthogonalMode ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {orthogonalMode ? '📐 Прямой угол: ВКЛ' : '📐 Прямой угол: ВЫКЛ'}
                        </button>

                        {/*{(drawingMode || selectedTool) && (*/}
                        {/*    <button*/}
                        {/*        onClick={() => {*/}
                        {/*            cancelDrawing();*/}
                        {/*            cancelToolSelection();*/}
                        {/*        }}*/}
                        {/*        style={{*/}
                        {/*            background: '#f44336',*/}
                        {/*            color: 'white',*/}
                        {/*            border: 'none',*/}
                        {/*            padding: '6px',*/}
                        {/*            borderRadius: '4px',*/}
                        {/*            cursor: 'pointer',*/}
                        {/*            fontSize: '10px',*/}
                        {/*            width: '100%',*/}
                        {/*            marginBottom: '5px'*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        ❌ Отмена*/}
                        {/*    </button>*/}
                        {/*)}*/}
                    </div>

                    {/* Переключатель режима соединения ошиновок */}
                        <div style={{fontSize: '10px', color: '#666', marginBottom: '5px', textAlign: 'center'}}>
                            Соединение ошиновок:
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <button
                                onClick={() => setConnectionMode('center')}
                                style={{
                                    background: connectionMode === 'center' ? '#2196F3' : '#e0e0e0',
                                    color: connectionMode === 'center' ? 'white' : 'black',
                                    border: 'none',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    width: '100%'
                                }}
                            >
                                📍 По центрам
                            </button>
                            <button
                                onClick={() => setConnectionMode('nearest')}
                                style={{
                                    background: connectionMode === 'nearest' ? '#2196F3' : '#e0e0e0',
                                    color: connectionMode === 'nearest' ? 'white' : 'black',
                                    border: 'none',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    width: '100%'
                                }}
                            >
                                🔄 Ближайшие концы
                            </button>
                        </div>

                    {/* Кнопка соединения */}
                    {/*{selectedElements.size === 2 && (() => {*/}
                    {/*    const selectedArray = Array.from(selectedElements);*/}
                    {/*    const element1 = elements.find(el => el.id === selectedArray[0]);*/}
                    {/*    const element2 = elements.find(el => el.id === selectedArray[1]);*/}
                    {/*    const isValidSelection = element1 && element2 &&*/}
                    {/*        ((element1.type === ELEMENT_TYPES.SWITCH || element1.type === ELEMENT_TYPES.JUNCTION || element1.type === ELEMENT_TYPES.BUS) &&*/}
                    {/*            (element2.type === ELEMENT_TYPES.SWITCH || element2.type === ELEMENT_TYPES.JUNCTION || element2.type === ELEMENT_TYPES.BUS));*/}
                    {/*    return isValidSelection && (*/}
                    {/*        <button*/}
                    {/*            onClick={connectSelectedElements}*/}
                    {/*            style={{*/}
                    {/*                background: '#9C27B0',*/}
                    {/*                color: 'white',*/}
                    {/*                border: 'none',*/}
                    {/*                padding: '6px',*/}
                    {/*                borderRadius: '4px',*/}
                    {/*                cursor: 'pointer',*/}
                    {/*                fontSize: '10px',*/}
                    {/*                width: '100%',*/}
                    {/*                marginBottom: '5px'*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            🔗 Соединить ошиновкой (Enter)*/}
                    {/*        </button>*/}
                    {/*    );*/}
                    {/*})()}*/}

                    {/* Управление свойствами */}
                    {(selectedElement || selectedElements.size > 0) && (
                        <button
                            onClick={() => setShowProperties(!showProperties)}
                            style={{
                                background: showProperties ? '#FF9800' : '#e0e0e0',
                                color: showProperties ? 'white' : 'black',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            {showProperties ? '❌ Скрыть свойства' : '⚙️ Свойства'}
                        </button>
                    )}

                    {/* Управление данными */}
                    <div style={{borderTop: '1px solid #ccc', paddingTop: '8px', marginTop: '5px'}}>
                        <button
                            onClick={handleForceSave}
                            style={{
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            💾 Сохранить сейчас
                        </button>
                        <button
                            onClick={handleForceLoad}
                            style={{
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            📂 Загрузить заново
                        </button>

                        {/*<button*/}
                        {/*    onClick={debugConnections}*/}
                        {/*    style={{*/}
                        {/*        background: '#9C27B0',*/}
                        {/*        color: 'white',*/}
                        {/*        border: 'none',*/}
                        {/*        padding: '6px',*/}
                        {/*        borderRadius: '4px',*/}
                        {/*        cursor: 'pointer',*/}
                        {/*        fontSize: '10px',*/}
                        {/*        width: '100%',*/}
                        {/*        marginBottom: '5px'*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    🐛 Отладка соединений*/}
                        {/*</button>*/}
                        <button
                            onClick={previewExportData}
                            style={{
                                background: '#FF9800',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            📊 Предпросмотр данных
                        </button>
                        <button
                            onClick={() => sendToBackend(exportSwitchesWithConnections(elements))}
                            style={{
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                width: '100%',
                                marginBottom: '5px'
                            }}
                        >
                            🚀 Отправить на бэкенд
                        </button>

                    </div>
                </>
            )}

        </div>
    );
};