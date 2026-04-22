// src/components/EnergyGrid/hooks/useEnergyGrid.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvas } from './useCanvas';
import { useElements } from './useElements';
import { useDrawing } from './useDrawing';
import { useSelection } from './useSelection';
import { useStorage } from './useStorage';
import { useExport } from './useExport';
import { useEnergyGridActions } from './useEnergyGridActions';
import { ConnectionMode } from '../types/types';

export const useEnergyGrid = () => {
    // Локальные состояния
    const [mode, setMode] = useState<'edit' | 'simulation'>('edit');
    const [showProperties, setShowProperties] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [lastDrawTime, setLastDrawTime] = useState<number>(0);
    const [connectionMode, setConnectionMode] = useState<ConnectionMode>('center');

    const containerRef = useRef<HTMLDivElement>(null);

    // Используем существующие хуки
    const canvas = useCanvas();
    const elements = useElements();
    const drawing = useDrawing({
        setSelectedElement: elements.setSelectedElement,
        setSelectedElements: elements.setSelectedElements,
        setExtendingElement: elements.setExtendingElement as any,
        setExtendStart: elements.setExtendStart as any
    });
    const selection = useSelection(); // ✅ Хук выделения
    const storage = useStorage();
    const exportHook = useExport();

    // Бизнес-логика
    const actions = useEnergyGridActions(
        elements.setElements,
        drawing.orthogonalMode,
        connectionMode
    );

    // Effects
    useEffect(() => {
        const data = storage.loadFromStorage();
        elements.setElements(data.elements);
        elements.setConnections(data.connections);
        canvas.setCanvasSize(data.canvasSize);
        canvas.setViewOffset(data.viewOffset);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            storage.saveToStorage(elements.elements, elements.connections, canvas.canvasSize, canvas.viewOffset, isLoaded);
        }
    }, [elements.elements, elements.connections, canvas.canvasSize, canvas.viewOffset, isLoaded]);

    // Функции для Toolbar
    const handleForceSave = useCallback((): void => {
        storage.saveToStorage(elements.elements, elements.connections, canvas.canvasSize, canvas.viewOffset, isLoaded);
        alert('Данные сохранены!');
    }, [storage.saveToStorage, elements.elements, elements.connections, canvas.canvasSize, canvas.viewOffset, isLoaded]);

    const handleForceLoad = useCallback((): void => {
        const data = storage.loadFromStorage();
        elements.setElements(data.elements);
        elements.setConnections(data.connections);
        canvas.setCanvasSize(data.canvasSize);
        canvas.setViewOffset(data.viewOffset);
        setIsLoaded(true);
        alert('Данные загружены!');
    }, [storage.loadFromStorage, elements.setElements, elements.setConnections, canvas.setCanvasSize, canvas.setViewOffset]);

    const centerView = useCallback((): void => {
        canvas.setViewOffset({ x: 0, y: 0 });
    }, [canvas.setViewOffset]);

    return {
        // Состояния
        mode,
        setMode,
        showProperties,
        setShowProperties,
        isLoaded,
        setIsLoaded,
        lastDrawTime,
        setLastDrawTime,
        connectionMode,
        setConnectionMode,

        // Refs
        containerRef,

        // Canvas
        ...canvas,

        // Elements
        ...elements,

        // Drawing
        ...drawing,

        // ✅ Selection - ВСЕ функции из useSelection
        selectionRect: selection.selectionRect,
        isSelecting: selection.isSelecting,
        startSelection: selection.startSelection,
        updateSelection: selection.updateSelection,
        endSelection: selection.endSelection,
        clearSelection: selection.clearSelection,
        setSelectionRect: selection.setSelectionRect, // для совместимости

        // Storage
        ...storage,

        // Export
        ...exportHook,

        // Actions
        ...actions,

        // UI Functions
        handleForceSave,
        handleForceLoad,
        centerView
    };
};