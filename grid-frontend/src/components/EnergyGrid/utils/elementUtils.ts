import {ELEMENT_TYPES} from '../shared/ElementTypes';
import {findLineIntersection, pointToLineDistance} from "./geometry";
import {Point, BaseElement, SelectionRect, ExtendAreaResult} from "../types/types";


export const findElementAt = (elements: BaseElement[], x: number, y: number): BaseElement | undefined => {
    // console.log('🔍 Поиск элемента по координатам:', {x, y});

    const foundElement = elements.find(element => {
        if (element.type === ELEMENT_TYPES.BUS) {
            const grabArea = 10;
            const isFound = (
                x >= element.x - grabArea &&
                x <= element.x + element.width + grabArea &&
                y >= element.y - grabArea &&
                y <= element.y + element.height + grabArea
            );
            if (isFound) console.log('📏 Найдена шина:', element.id);
            return isFound;
        } else if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
            const distance = pointToLineDistance(x, y, element);
            const isFound = distance < 15;
            if (isFound) console.log('📐 Найдена линия/ошиновка:', element.id, 'расстояние:', distance);
            return isFound;
        } else if (element.type === ELEMENT_TYPES.JUNCTION) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const isFound = distance < 15;
            if (isFound) console.log('🔘 Найден узел:', element.id, 'расстояние:', distance);
            return isFound;
        } else {
            const isFound = (
                x >= element.x &&
                x <= element.x + element.width &&
                y >= element.y &&
                y <= element.y + element.height
            );
            if (isFound) console.log('⬜ Найден элемент:', element.type, element.id);
            return isFound;
        }
    });

    console.log('🔍 Результат поиска:', foundElement ? foundElement.id : 'null');
    return foundElement;
};

export const isInResizeArea = (element: BaseElement, x: number, y: number): boolean => {
    if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR || element.type === ELEMENT_TYPES.SWITCH || element.type === ELEMENT_TYPES.JUNCTION) return false;

    const resizeHandleSize = 8;
    return (
        x >= element.x + element.width - resizeHandleSize &&
        x <= element.x + element.width + resizeHandleSize &&
        y >= element.y + element.height - resizeHandleSize &&
        y <= element.y + element.height + resizeHandleSize
    );
};

export const isInExtendArea = (element: BaseElement, x: number, y: number): ExtendAreaResult => {
    if (element.type !== ELEMENT_TYPES.LINE && element.type !== ELEMENT_TYPES.BUS_BAR) {
        return {atStart: false, atEnd: false};
    }

    const extendHandleSize = 8;
    const startX = element.x;
    const startY = element.y;
    const endX = element.x + element.width;
    const endY = element.y + element.height;

    const atStart =
        x >= startX - extendHandleSize &&
        x <= startX + extendHandleSize &&
        y >= startY - extendHandleSize &&
        y <= startY + extendHandleSize;
    const atEnd =
        x >= endX - extendHandleSize &&
        x <= endX + extendHandleSize &&
        y >= endY - extendHandleSize &&
        y <= endY + extendHandleSize;

    return {atStart, atEnd};
};

export const isElementInSelection = (element: BaseElement, rect: SelectionRect): boolean => {
    const startX = Math.min(rect.startX, rect.currentX);
    const startY = Math.min(rect.startY, rect.currentY);
    const endX = Math.max(rect.startX, rect.currentX);
    const endY = Math.max(rect.startY, rect.currentY);

    if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
        const lineStart = {x: element.x, y: element.y};
        const lineEnd = {x: element.x + element.width, y: element.y + element.height};
        const startInside = lineStart.x >= startX && lineStart.x <= endX && lineStart.y >= startY && lineStart.y <= endY;
        const endInside = lineEnd.x >= startX && lineEnd.x <= endX && lineEnd.y >= startY && lineEnd.y <= endY;
        return startInside || endInside;
    } else if (element.type === ELEMENT_TYPES.JUNCTION) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        return centerX >= startX && centerX <= endX && centerY >= startY && centerY <= endY;
    } else {
        return (
            element.x >= startX &&
            element.x + element.width <= endX &&
            element.y >= startY &&
            element.y + element.height <= endY
        );
    }
};

export const getExitPoint = (element: BaseElement, targetElement: BaseElement): Point => {
    if (element.type === ELEMENT_TYPES.JUNCTION) {
        return {
            x: element.x + element.width / 2,
            y: element.y + element.height / 2
        };
    }

    const elementCenter = {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2
    };
    const targetCenter = {
        x: targetElement.x + targetElement.width / 2,
        y: targetElement.y + targetElement.height / 2
    };

    if (element.type === ELEMENT_TYPES.SWITCH) {
        if (targetElement.type === ELEMENT_TYPES.BUS) {
            const busBottom = targetElement.y + targetElement.height;
            const switchTop = element.y;
            const busTop = targetElement.y;
            const switchBottom = element.y + element.height;
            const busRight = targetElement.x + targetElement.width;
            const switchLeft = element.x;

            if (busBottom < switchTop) {
                return {x: elementCenter.x, y: element.y};
            } else if (busTop > switchBottom) {
                return {x: elementCenter.x, y: element.y + element.height};
            } else if (busRight < switchLeft) {
                return {x: element.x, y: elementCenter.y};
            } else {
                return {x: element.x + element.width, y: elementCenter.y};
            }
        } else if (targetElement.type === ELEMENT_TYPES.SWITCH) {
            const dx = targetCenter.x - elementCenter.x;
            const dy = targetCenter.y - elementCenter.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                return {
                    x: dx > 0 ? element.x + element.width : element.x,
                    y: elementCenter.y
                };
            } else {
                return {
                    x: elementCenter.x,
                    y: dy > 0 ? element.y + element.height : element.y
                };
            }
        }
    }

    if (element.type === ELEMENT_TYPES.BUS) {
        const closestX = Math.max(element.x, Math.min(targetCenter.x, element.x + element.width));
        const closestY = Math.max(element.y, Math.min(targetCenter.y, element.y + element.height));
        return {x: closestX, y: closestY};
    }

    return elementCenter;
};

// В utils/elementUtils.ts
export const areBusBarsConnected = (busBar1: BaseElement, busBar2: BaseElement, tolerance: number = 10): boolean => {
    if (busBar1.type !== ELEMENT_TYPES.BUS_BAR || busBar2.type !== ELEMENT_TYPES.BUS_BAR) {
        return false;
    }

    const line1Start = {x: busBar1.x, y: busBar1.y};
    const line1End = {x: busBar1.x + busBar1.width, y: busBar1.y + busBar1.height};

    const line2Start = {x: busBar2.x, y: busBar2.y};
    const line2End = {x: busBar2.x + busBar2.width, y: busBar2.y + busBar2.height};

    // Ищем точку пересечения
    const intersection = findLineIntersection(line1Start, line1End, line2Start, line2End);

    return intersection !== null;
};

// Новая функция которая возвращает точку пересечения
export const getBusBarsIntersection = (busBar1: BaseElement, busBar2: BaseElement): Point | null => {
    const line1Start = {x: busBar1.x, y: busBar1.y};
    const line1End = {x: busBar1.x + busBar1.width, y: busBar1.y + busBar1.height};

    const line2Start = {x: busBar2.x, y: busBar2.y};
    const line2End = {x: busBar2.x + busBar2.width, y: busBar2.y + busBar2.height};

    return findLineIntersection(line1Start, line1End, line2Start, line2End);
};

// В utils/elementUtils.ts добавляем функцию
export const areBusBarAndBusConnected = (busBar: BaseElement, bus: BaseElement, tolerance: number = 20): boolean => {
    if (busBar.type !== ELEMENT_TYPES.BUS_BAR || bus.type !== ELEMENT_TYPES.BUS) {
        return false;
    }

    // Проверяем ТОЛЬКО КОНЕЦ ошиновки на соединение с шиной
    const busBarEnd = {
        x: busBar.x + busBar.width,
        y: busBar.y + busBar.height
    };

    // Проверяем находится ли КОНЕЦ ошиновки рядом с шиной
    const isEndNearBus = (
        busBarEnd.x >= bus.x - tolerance &&
        busBarEnd.x <= bus.x + bus.width + tolerance &&
        busBarEnd.y >= bus.y - tolerance &&
        busBarEnd.y <= bus.y + bus.height + tolerance
    );

    console.log('🔗 Проверка конца ошиновки с шиной:', {
        busBarEnd,
        busBounds: {x: bus.x, y: bus.y, width: bus.width, height: bus.height},
        isEndNearBus
    });

    return isEndNearBus;
};

// utils/elementUtils.ts - заменить функцию getBusBarAndBusIntersection
export const getBusBarAndBusIntersection = (busBar: BaseElement, bus: BaseElement): Point | null => {
    // Конец ошиновки
    const busBarEnd = {
        x: busBar.x + busBar.width,
        y: busBar.y + busBar.height
    };

    // Центр высоты шины
    const busCenterY = bus.y + bus.height / 2;
    // Центр ширины шины
    const busCenterX = bus.x + bus.width / 2;

    // console.log('🔍 Проверка конца ошиновки с шиной:', {
    //     busBarEnd,
    //     busCenterY,
    //     busBounds: {x: bus.x, y: bus.y, width: bus.width, height: bus.height}
    // });

    // Если конец ошиновки близко к центру высоты шины
    const isNearCenter = Math.abs(busBarEnd.y - busCenterY) <= 10;
    // И если конец ошиновки находится напротив шины
    const isOppositeBus = busBarEnd.x >= bus.x - 10 && busBarEnd.x <= bus.x + bus.width + 10;

    const isNearCenter2 = Math.abs(busBar.y - busCenterY) <= 10;

    // if (isNearCenter && isOppositeBus) {
    if (isNearCenter) {
        // ВОТ ИСПРАВЛЕНИЕ: берем Y центра шины, а не Y конца ошиновки
        const result = {x: busBarEnd.x, y: busCenterY}; // ← ИЗМЕНИЛ busBarEnd.y на busCenterY
        // console.log('✅ Точка соединения найдена:', result);
        return result;
    }

    if (isNearCenter2) {
        // busBarEnd.x=busBar.x
        const result = {x: busBar.x, y: busCenterY}; // ← ИЗМЕНИЛ busBarEnd.y на busCenterY
        // console.log('✅ Точка соединения найдена:', result);
        return result;
    }


    // console.log('❌ Не найдено подходящего соединения');
    return null;
};

// utils/elementUtils.ts - добавить функцию
export const areBusBarsConnectedByEnds = (busBar1: BaseElement, busBar2: BaseElement, tolerance: number = 5): boolean => {
    if (busBar1.type !== ELEMENT_TYPES.BUS_BAR || busBar2.type !== ELEMENT_TYPES.BUS_BAR) return false;

    const ends1 = [
        {x: busBar1.x, y: busBar1.y},
        {x: busBar1.x + busBar1.width, y: busBar1.y + busBar1.height}
    ];

    const ends2 = [
        {x: busBar2.x, y: busBar2.y},
        {x: busBar2.x + busBar2.width, y: busBar2.y + busBar2.height}
    ];

    for (const end1 of ends1) {
        for (const end2 of ends2) {
            const distance = Math.sqrt(Math.pow(end2.x - end1.x, 2) + Math.pow(end2.y - end1.y, 2));
            if (distance <= tolerance) return true;
        }
    }
    return false;
};

