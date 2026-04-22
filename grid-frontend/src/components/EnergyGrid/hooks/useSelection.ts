// src/components/EnergyGrid/hooks/useSelection.ts
import { useState, useCallback } from 'react';
import { SelectionRect, UseSelectionReturn } from "../types/types";

export const useSelection = (): UseSelectionReturn => {
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

    const startSelection = useCallback((startX: number, startY: number) => {
        setSelectionRect({
            startX,
            startY,
            currentX: startX,
            currentY: startY
        });
        setIsSelecting(true);
    }, []);

    const updateSelection = useCallback((currentX: number, currentY: number) => {
        setSelectionRect(prev => {
            if (!prev) return null;
            return {
                ...prev,
                currentX,
                currentY
            };
        });
    }, []);

    const endSelection = useCallback(() => {
        setIsSelecting(false);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectionRect(null);
        setIsSelecting(false);
    }, []);

    return {
        selectionRect,
        setSelectionRect, // оставляем для обратной совместимости
        isSelecting,
        startSelection,
        updateSelection,
        endSelection,
        clearSelection
    };
};