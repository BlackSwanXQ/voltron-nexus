// hooks/useDrawing.ts
import {useCallback, useState} from 'react';
import {DrawingLine, ToolPreview, UseDrawingProps} from '../types/types';


export const useDrawing = ({
                               setSelectedElement,
                               setSelectedElements,
                               setExtendingElement,
                               setExtendStart
                           }: UseDrawingProps) => {
    const [drawingLine, setDrawingLine] = useState<DrawingLine | null>(null);
    const [drawingMode, setDrawingMode] = useState<'line' | 'bus_bar' | null>(null);
    const [orthogonalMode, setOrthogonalMode] = useState<boolean>(false);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [toolPreview, setToolPreview] = useState<ToolPreview | null>(null);

    const startDrawingLine = useCallback(() => {
        setDrawingMode('line');
        setSelectedElement(null);
        setSelectedElements(new Set());
        setSelectedTool(null);
    }, [setSelectedElement, setSelectedElements, setSelectedTool]);

    const startDrawingBusBar = useCallback(() => {
        setDrawingMode('bus_bar');
        setSelectedElement(null);
        setSelectedElements(new Set());
        setSelectedTool(null);
    }, [setSelectedElement, setSelectedElements, setSelectedTool]);

    const cancelDrawing = useCallback(() => {
        setDrawingMode(null);
        setDrawingLine(null);
        setExtendingElement(null);
        setExtendStart(null);
    }, [setExtendingElement, setExtendStart]);

    const selectTool = useCallback((toolType: string | null) => {
        setSelectedTool(toolType);
        setDrawingMode(null);
        setSelectedElement(null);
        setSelectedElements(new Set());
    }, [setSelectedElement, setSelectedElements]);

    const cancelToolSelection = useCallback(() => {
        setSelectedTool(null);
        setToolPreview(null);
    }, []);

    const toggleOrthogonalMode = useCallback(() => {
        setOrthogonalMode(prev => !prev);
    }, []);

    return {
        drawingLine,
        setDrawingLine,
        drawingMode,
        setDrawingMode,
        orthogonalMode,
        setOrthogonalMode,
        selectedTool,
        setSelectedTool,
        toolPreview,
        setToolPreview,
        startDrawingLine,
        startDrawingBusBar,
        cancelDrawing,
        selectTool,
        cancelToolSelection,
        toggleOrthogonalMode
    };
};