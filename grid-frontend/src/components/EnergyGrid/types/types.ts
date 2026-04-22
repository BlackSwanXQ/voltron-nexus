// types.ts
import React, {RefObject} from "react";

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface BaseElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    voltage: number;
    label?: string;
    status?: 'open' | 'closed';
    thickness?: number;
    labelPosition?: string;
}

export interface PropertiesPanelProps {
    showProperties: boolean;
    setShowProperties: (show: boolean) => void;
    selectedElementData: BaseElement | null;
    selectedElements: Set<string>;
    elements: BaseElement[];
    updateElementProperty: (elementId: string, property: string, value: any) => void;
    getElementColor: (element: BaseElement) => string;
}


export interface Connection {
    from: Point;
    to: Point;
    current?: number;
}

export interface DrawingLine {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

export interface SelectionRect {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

export interface ExtendStart {
    x: number;
    y: number;
    currentX: number;
    currentY: number;
    fromStart: boolean;
}


export interface CanvasProps {
    canvasRef: RefObject<HTMLCanvasElement>;
    elements: BaseElement[];
    selectedElement: string | null;
    selectedElements: Set<string>;
    connections: Connection[];
    drawingLine: DrawingLine | null;
    drawingMode: 'line' | 'bus_bar' | null;
    viewOffset: Point;
    canvasSize: { width: number; height: number };
    selectionRect: SelectionRect | null;
    extendingElement: BaseElement | null;
    extendStart: ExtendStart | null;
    orthogonalMode: boolean;
    selectedTool: string | null;
    toolPreview: Point | null;
    getElementColor: (element: BaseElement) => string;
    drawGrid: (ctx: CanvasRenderingContext2D) => void;
    getOrthogonalCoordinates: (startX: number, startY: number, currentX: number, currentY: number) => Point;
    handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleDoubleClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    isPanning: boolean;
    draggingElement: BaseElement | null;
    resizingElement: BaseElement | null;
    handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
    connectionMode: 'center' | 'nearest';
}

type Mode = 'edit' | 'simulation';
type DrawingMode = 'line' | 'bus_bar' | null;
type ToolType = string | null;
export type ConnectionMode = 'center' | 'nearest';

export interface ToolbarProps {
    mode: Mode;
    selectedElement: string | null;
    setMode: (mode: Mode) => void;
    selectedTool: ToolType;
    selectTool: (toolType: ToolType) => void;
    drawingMode: DrawingMode;
    startDrawingLine: () => void;
    startDrawingBusBar: () => void;
    orthogonalMode: boolean;
    toggleOrthogonalMode: () => void;
    cancelDrawing: () => void;
    cancelToolSelection: () => void;
    selectedElements: Set<string>;
    elements: BaseElement[];
    connectSelectedElements: () => void;
    showProperties: boolean;
    setShowProperties: (show: boolean) => void;
    handleForceSave: () => void;
    handleForceLoad: () => void;
    centerView: () => void;
    // debugConnections: () => void;
    previewExportData: () => void;
    sendToBackend: (data: any) => void;
    exportSwitchesWithConnections: (elements: BaseElement[]) => any;
    connectionMode: ConnectionMode;
    setConnectionMode: (mode: ConnectionMode) => void;
}
export interface ExtendAreaResult {
    atStart: boolean;
    atEnd: boolean;
}

export interface ElementData {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    status?: 'open' | 'closed';
    thickness?: number;
    labelPosition?: string;
    voltage?: number;
    label?: string;
}

export interface ConnectedElement {
    type: string;
    id: string;
    name: string;
    voltage: number;
}

export interface SwitchExportData {
    id: string;
    name: string;
    voltage: number;
    status: 'open' | 'closed';
    x: number;
    y: number;
    width: number;
    height: number;
    connectedElements: ConnectedElement[];
}

export interface SwitchesExportData {
    switches: SwitchExportData[];
    timestamp: string;
    version: string;
}

export interface ElementExportData {
    id: string;
    type: string;
    label: string;
    voltage: number;
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    properties: {
        status?: 'open' | 'closed';
        thickness?: number;
        labelPosition?: string;
    };
}

export interface AllElementsExportData {
    elements: ElementExportData[];
    connections: any[];
    timestamp: string;
    version: string;
}

export interface UseCanvasReturn {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    viewOffset: Point;
    setViewOffset: React.Dispatch<React.SetStateAction<Point>>;
    canvasSize: Size;
    setCanvasSize: React.Dispatch<React.SetStateAction<Size>>;
    isPanning: boolean;
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
    panStart: Point;
    setPanStart: React.Dispatch<React.SetStateAction<Point>>;
    getCanvasCoordinates: (clientX: number, clientY: number) => Point;
}

export interface UseDrawingProps {
    setSelectedElement: (element: string | null) => void;
    setSelectedElements: (elements: Set<string>) => void;
    setExtendingElement: (element: BaseElement | null) => void;
    setExtendStart: (start: any) => void;
}


export interface ToolPreview {
    x: number;
    y: number;
}

export interface UseSelectionReturn {
    selectionRect: SelectionRect | null;
    setSelectionRect: React.Dispatch<React.SetStateAction<SelectionRect | null>>;
    isSelecting: boolean;
    startSelection: (startX: number, startY: number) => void;
    updateSelection: (currentX: number, currentY: number) => void;
    endSelection: () => void;
    clearSelection: () => void;
}

export interface Element {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    voltage: number;
    label?: string;
}

export interface StorageData {
    elements: Element[];
    connections: Connection[];
    canvasSize: Size;
    viewOffset: Point;
}

export interface StorageInfo {
    hasElements: boolean;
    hasConnections: boolean;
    elementsCount: number;
    connectionsCount: number;
}

export interface UseStorageReturn {
    saveToStorage: (elements: Element[], connections: Connection[], canvasSize: Size, viewOffset: Point, isLoaded: boolean) => void;
    loadFromStorage: () => StorageData;
    clearStorage: () => void;
    getStorageInfo: () => StorageInfo;
}


