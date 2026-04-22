// hooks/useElements.ts
import {useState, useCallback} from 'react';
import {ELEMENT_TYPES} from '../shared/ElementTypes';
import {DEFAULT_SIZES} from '../shared/constants';
import {BaseElement} from '../types/types';
// import {drawingLine} from './useDrawing'
// import {drawingMode} from './useDrawing'

export const useElements = () => {
    const [elements, setElements] = useState<BaseElement[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
    const [draggingElement, setDraggingElement] = useState<BaseElement | null>(null);
    const [resizingElement, setResizingElement] = useState<BaseElement | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({x: 0, y: 0});
    const [extendingElement, setExtendingElement] = useState<BaseElement | null>(null);
    const [extendStart, setExtendStart] = useState<any>(null);

    const addElement = useCallback((type: string, x: number, y: number): BaseElement => {
        // console.trace('addElement called');
        // const size = DEFAULT_SIZES[type] || { width: 50, height: 50 };
        const size = DEFAULT_SIZES[type];

            const centeredX = x - size.width / 2;
            const centeredY = y - size.height / 2;


        const baseElement: BaseElement = {
            id: `${type}-${Date.now()}`,
            type,
            x: centeredX,
            y: centeredY,
            voltage: 110,
            width: size.width,
            height: size.height
        };

        // if(type==='bus_bar'){
        //     const baseElement: BaseElement = {
        //         id: `${Date.now()}`, // уникальный ID
        //         type: drawingMode === 'bus_bar' ? ELEMENT_TYPES.BUS_BAR : ELEMENT_TYPES.LINE,
        //         x: x,      // начальная X
        //         y: y,      // начальная Y
        //         width: finalX - drawingLine.startX,  // ширина = разница по X
        //         height: finalY - drawingLine.startY, // высота = разница по Y
        //         voltage: 110,               // напряжение по умолчанию
        //         thickness: drawingMode === 'bus_bar' ? 4 : 4 // толщина линии
        //     };
        // }


        // Настройки по умолчанию для разных типов
        let newElement: BaseElement = baseElement;

        switch (type) {
            case ELEMENT_TYPES.SWITCH:
                newElement = {
                    ...baseElement,
                    label: `Q${elements.filter(el => el.type === ELEMENT_TYPES.SWITCH).length + 1}`,
                    status: 'closed'
                };
                break;
            case ELEMENT_TYPES.GENERATOR:
                newElement = {
                    ...baseElement,
                    label: 'Генератор'
                };
                break;
            case ELEMENT_TYPES.LOAD:
                newElement = {
                    ...baseElement,
                    label: 'Нагрузка'
                };
                break;
            case ELEMENT_TYPES.JUNCTION:
                newElement = {
                    ...baseElement,
                    label: 'Точка'
                };
                break;
            case ELEMENT_TYPES.BUS:
                newElement = {
                    ...baseElement,
                    labelPosition: 'top'
                };
                break;

            // case ELEMENT_TYPES.BUS_BAR:
            //     newElement = {
            //         ...baseElement,
            //         label: '',
            //     };
            //     break;

        }
//         alert("bas_bar")
// console.log(elements)

        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        setSelectedElements(new Set([newElement.id]));

        return newElement;
    }, [elements]);

    const updateElementProperty = useCallback((
        elementId: string,
        property: string,
        value: any
    ): void => {
        setElements(prev => prev.map(el =>
            el.id === elementId
                ? {...el, [property]: value}
                : el
        ));
    }, []);

    const deleteSelected = useCallback((): void => {
        if (selectedElements.size > 0) {
            setElements(prev => prev.filter(el => !selectedElements.has(el.id)));
            setConnections(prev => prev.filter(conn =>
                !selectedElements.has(conn.from) && !selectedElements.has(conn.to)
            ));
        } else if (selectedElement) {
            setElements(prev => prev.filter(el => el.id !== selectedElement));
            setConnections(prev => prev.filter(conn =>
                conn.from !== selectedElement && conn.to !== selectedElement
            ));
        }
    }, [selectedElement, selectedElements]);

    const toggleSwitch = useCallback((elementId: string): void => {
        setElements(prev => prev.map(el =>
            el.id === elementId && el.type === ELEMENT_TYPES.SWITCH
                ? {...el, status: el.status === 'open' ? 'closed' : 'open'}
                : el
        ));
    }, []);

    return {
        elements,
        setElements,
        connections,
        setConnections,
        selectedElement,
        setSelectedElement,
        selectedElements,
        setSelectedElements,
        draggingElement,
        setDraggingElement,
        resizingElement,
        setResizingElement,
        dragOffset,
        setDragOffset,
        extendingElement,
        setExtendingElement,
        extendStart,
        setExtendStart,
        addElement,
        updateElementProperty,
        deleteSelected,
        toggleSwitch
    };
};