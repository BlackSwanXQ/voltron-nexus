// src/components/EnergyGrid/EnergyGrid.tsx
import React, {useEffect, useState} from 'react';
import {useEnergyGrid} from './hooks/useEnergyGrid';
import {useEnergyGridHandlers} from './hooks/useEnergyGridHandlers';
import {Toolbar} from "./components/Toolbar/Toolbar";
import {PropertiesPanel} from "./components/PropertiesPanel/PropertiesPanel";
import {Canvas} from "./components/Canvas/Canvas";
import {
    getElementColor,
    drawGrid,
    // debugConnections,
    previewExportData,
    handleSendToBackend
} from './utils/energyGridUtils';

import {getOrthogonalCoordinates} from './utils/geometry'


const EnergyGrid: React.FC = () => {
    const energyGrid = useEnergyGrid();
    const handlers = useEnergyGridHandlers(energyGrid);
    const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });

    // Создай новую функцию, которая обновляет координаты И вызывает handleMouseMove
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Обновляем координаты
        const coords = energyGrid.getCanvasCoordinates(e.clientX, e.clientY);
        setCursorCoords(coords);

        // Вызываем оригинальный обработчик
        handleMouseMove(e);
    };



    const {
        containerRef,
        canvasRef,
        elements,
        selectedElement,
        selectedElements,
        mode,
        showProperties,
        viewOffset,
        canvasSize,
        drawingLine,
        drawingMode,
        connections,
        selectionRect,
        extendingElement,
        extendStart,
        orthogonalMode,
        selectedTool,
        toolPreview,
        isPanning,
        draggingElement,
        resizingElement,
        connectionMode,
        setConnectionMode,
        setMode,
        setShowProperties,
        setSelectedElement,
        setSelectedElements,
        setDrawingMode,
        cancelDrawing,
        cancelToolSelection,
        deleteSelected,
        updateElementProperty,
        connectSelectedElements,
        handleForceSave,
        handleForceLoad,
        centerView,
        exportSwitchesWithConnections,
        // ✅ НУЖНО ТОЛЬКО clearSelection для Escape
        clearSelection,
        setSelectionRect, // ← оставляем для обратной совместимости
        setExtendingElement,
        setExtendStart
    } = energyGrid;

    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        handleDoubleClick
    } = handlers;

    const selectedElementData = elements.find(el => el.id === selectedElement);

    // Effect для обработки клавиатуры
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.target instanceof Element &&
                (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA')) {
                return;
            }

            if (mode !== 'edit') return;

            if (event.key === 'Escape') {
                event.preventDefault();

                // ✅ Сначала сбрасываем ВСЕ выделения элементов
                if (selectedElement || selectedElements.size > 0 || selectionRect) {
                    setSelectedElement(null);
                    setSelectedElements(new Set());
                    setShowProperties(false);
                    clearSelection(); // очищаем прямоугольник выделения
                }

                // ✅ Затем отменяем активные режимы
                if (selectedTool) {
                    cancelToolSelection(); // убирает инструмент и предпросмотр
                }

                if (drawingMode) {
                    cancelDrawing(); // отменяет рисование линии
                }

                // ✅ Очищаем остальное
                setExtendingElement(null);
                setExtendStart(null);

                return; // Важно: return чтобы не обрабатывать дальше
            }

            if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                event.preventDefault();
                if (!selectedElement && selectedElements.size === 0) return;

                const step = 1;
                let deltaX = 0;
                let deltaY = 0;

                switch (event.key) {
                    case 'ArrowUp':
                        deltaY = -step;
                        break;
                    case 'ArrowDown':
                        deltaY = step;
                        break;
                    case 'ArrowLeft':
                        deltaX = -step;
                        break;
                    case 'ArrowRight':
                        deltaX = step;
                        break;
                    default:
                        return;
                }

                energyGrid.setElements(prev => prev.map(el => {
                    const isSelected = selectedElements.has(el.id) || el.id === selectedElement;
                    if (isSelected) {
                        return {
                            ...el,
                            x: Math.max(0, el.x + deltaX),
                            y: Math.max(0, el.y + deltaY)
                        };
                    }
                    return el;
                }));
            }

            if (event.key === 'Delete' && (selectedElement || selectedElements.size > 0)) {
                event.preventDefault();
                deleteSelected();
                setSelectedElement(null);
                setSelectedElements(new Set());
                setShowProperties(false);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                // console.log('⌨️ Enter нажат, selectedElements:', selectedElements.size);
                if (selectedElements.size === 2) {
                    connectSelectedElements(selectedElements, elements, setSelectedElements, setSelectedElement);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [
        mode, selectedElement, selectedElements, selectionRect, // ✅ добавлен selectionRect
        deleteSelected, cancelDrawing, drawingMode,
        selectedTool, cancelToolSelection, energyGrid.setElements, setSelectedElement,
        setSelectedElements, setShowProperties, clearSelection,
        setExtendingElement, setExtendStart, elements,
        connectSelectedElements
    ]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                overflow: 'hidden',
                cursor: selectedTool ? 'crosshair' :
                    isPanning ? 'grabbing' :
                        drawingLine || extendingElement ? 'crosshair' :
                            drawingMode ? 'crosshair' : 'default'
            }}
        >
            <Toolbar
                mode={mode}
                selectedElement={selectedElement}
                setMode={setMode}
                selectedTool={selectedTool}
                selectTool={energyGrid.selectTool}
                drawingMode={drawingMode}
                startDrawingLine={energyGrid.startDrawingLine}
                startDrawingBusBar={energyGrid.startDrawingBusBar}
                orthogonalMode={orthogonalMode}
                toggleOrthogonalMode={energyGrid.toggleOrthogonalMode}
                cancelDrawing={cancelDrawing}
                cancelToolSelection={cancelToolSelection}
                selectedElements={selectedElements}
                elements={elements}
                connectSelectedElements={() => connectSelectedElements(selectedElements, elements, setSelectedElements, setSelectedElement)}
                showProperties={showProperties}
                setShowProperties={setShowProperties}
                handleForceSave={handleForceSave}
                handleForceLoad={handleForceLoad}
                centerView={centerView}
                previewExportData={() => previewExportData(exportSwitchesWithConnections, elements)}
                sendToBackend={() => handleSendToBackend(exportSwitchesWithConnections, elements, '/api/energy-grid/connections')}
                exportSwitchesWithConnections={exportSwitchesWithConnections}
                connectionMode={connectionMode}
                setConnectionMode={setConnectionMode}
            />

            <PropertiesPanel
                showProperties={showProperties}
                setShowProperties={setShowProperties}
                selectedElementData={selectedElementData || null}
                selectedElements={selectedElements}
                elements={elements}
                updateElementProperty={updateElementProperty}
                getElementColor={getElementColor}
            />

            <Canvas
                canvasRef={canvasRef}
                elements={elements}
                selectedElement={selectedElement}
                selectedElements={selectedElements}
                connections={connections}
                drawingLine={drawingLine}
                drawingMode={drawingMode}
                viewOffset={viewOffset}
                canvasSize={canvasSize}
                selectionRect={selectionRect}
                extendingElement={extendingElement}
                extendStart={extendStart}
                orthogonalMode={orthogonalMode}
                selectedTool={selectedTool}
                toolPreview={toolPreview}
                getElementColor={getElementColor}
                drawGrid={(ctx) => drawGrid(ctx, canvasSize)}
                getOrthogonalCoordinates={getOrthogonalCoordinates}
                handleMouseDown={handleMouseDown}
                handleMouseMove={handleCanvasMouseMove}
                handleMouseUp={handleMouseUp}
                handleDoubleClick={handleDoubleClick}
                handleWheel={handleWheel}
                isPanning={isPanning}
                draggingElement={draggingElement}
                resizingElement={resizingElement}
                connectionMode={connectionMode}
            />
{/*координаты внизу экрана*/}
            <div style={{
                position: 'fixed',
                bottom: '50px',
                left: '10px',
                background: 'black',
                color: 'white',
                padding: '5px 10px',
                fontSize: '20px',
                fontFamily: 'monospace',
                zIndex: 9999
            }}>
                X: {Math.round(cursorCoords.x)} Y: {Math.round(cursorCoords.y)}
            </div>
        </div>
    );
};

export default EnergyGrid;