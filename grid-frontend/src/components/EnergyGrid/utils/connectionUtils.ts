import {ElementBase} from './entity/ElementBase';
import {SwitchElement} from "./entity/SwitchElement";
import {BusBarElement} from "./entity/BusBarElement";

/**
 * Проверяет прямое соединение между двумя элементами
 */
export const isDirectlyConnected = (
    element1: ElementBase,
    element2: ElementBase,
    tolerance: number = 20
): boolean => {
    return element1.isConnectedTo(element2, tolerance);
};

/**
 * Проверяет соединение элементов (прямое или через ошиновку)
 */
export const areElementsConnected = (
    elements: ElementBase[],
    switchElement: SwitchElement,
    lineOrTransformer: ElementBase,
    tolerance: number = 20
): boolean => {
    // Проверяем прямое соединение
    if (switchElement.isConnectedTo(lineOrTransformer, tolerance)) {
        return true;
    }

    const busBars = elements.filter((el): el is BusBarElement => el.type === 'bus_bar');

    // Проверяем соединение через одну ошиновку
    const connectedThroughSingleBusBar = busBars.some(busBar =>
        busBar.isConnectedTo(switchElement, tolerance) &&
        busBar.isConnectedTo(lineOrTransformer, tolerance)
    );

    if (connectedThroughSingleBusBar) {
        return true;
    }

    // Проверяем соединение через цепочку ошиновок
    return busBars.some(busBar1 =>
        busBar1.isConnectedTo(switchElement, tolerance) &&
        busBars.some(busBar2 =>
            busBar1.id !== busBar2.id &&
            busBar1.isConnectedTo(busBar2, tolerance) &&
            busBar2.isConnectedTo(lineOrTransformer, tolerance)
        )
    );
};

/**
 * Находит все выключатели, соединенные с указанным элементом
 */
export const findSwitchesConnectedToElement = (
    elements: ElementBase[],
    element: ElementBase
): SwitchElement[] => {
    const switches = elements.filter((el): el is SwitchElement => el.type === 'switch');
    const tolerance = 20;

    return switches.filter(switchEl =>
        areElementsConnected(elements, switchEl, element, tolerance)
    );
};

/**
 * Проверяет соединение элемента с точкой
 */
export const isElementConnectedToPoint = (
    element: ElementBase,
    point: { x: number; y: number },
    tolerance: number = 10
): boolean => {
    return element.isPointNearElement(point, tolerance);
};