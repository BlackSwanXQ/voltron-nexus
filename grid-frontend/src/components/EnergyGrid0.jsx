import React, {useCallback, useEffect, useRef, useState} from 'react';

// Основной компонент редактора энергетических сетей
const EnergyGrid = () => {
    // ========== REFS (ссылки на DOM-элементы) ==========
    const canvasRef = useRef(null);        // Ссылка на canvas элемент для рисования
    const containerRef = useRef(null);     // Ссылка на контейнер компонента

    // ========== STATE (состояние компонента) ==========

    // Основные данные
    const [lastDrawTime, setLastDrawTime] = useState(0);
    const [elements, setElements] = useState([]);              // Массив всех элементов энергосистемы
    const [connections, setConnections] = useState([]);        // Массив соединений между элементами

    // Выделение элементов
    const [selectedElement, setSelectedElement] = useState(null);          // ID выбранного элемента
    const [selectedElements, setSelectedElements] = useState(new Set());   // Множество выбранных элементов (для мультивыделения)

    // Перетаскивание и изменение размера
    const [draggingElement, setDraggingElement] = useState(null);      // Элемент в процессе перетаскивания
    const [resizingElement, setResizingElement] = useState(null);      // Элемент в процессе изменения размера
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});      // Смещение курсора относительно элемента при drag

    // Режимы работы
    const [mode, setMode] = useState('edit');                  // Режим работы: 'edit' или 'simulation'
    const [showProperties, setShowProperties] = useState(false); // Показать/скрыть панель свойств
    const [isLoaded, setIsLoaded] = useState(false);           // Флаг загрузки данных из localStorage

    // Холст и навигация
    const [canvasSize, setCanvasSize] = useState({width: 3000, height: 2000}); // Размер виртуального холста
    const [viewOffset, setViewOffset] = useState({x: 0, y: 0});      // Смещение области просмотра
    const [isPanning, setIsPanning] = useState(false);                 // Флаг перемещения по холсту
    const [panStart, setPanStart] = useState({x: 0, y: 0});          // Начальная точка pan

    // Рисование линий
    const [drawingLine, setDrawingLine] = useState(null);      // Данные рисуемой линии
    const [drawingMode, setDrawingMode] = useState(null);      // Режим рисования: 'line' или 'bus_bar'

    // Выделение области
    const [selectionRect, setSelectionRect] = useState(null);  // Прямоугольник выделения

    // Расширение линий
    const [extendingElement, setExtendingElement] = useState(null); // Элемент в процессе расширения
    const [extendStart, setExtendStart] = useState(null);           // Начальная точка расширения

    // Настройки
    const [orthogonalMode, setOrthogonalMode] = useState(false);    // Режим прямых углов при рисовании

    // Новые состояния для выбора инструментов
    const [selectedTool, setSelectedTool] = useState(null);        // Выбранный инструмент (тип элемента)
    const [toolPreview, setToolPreview] = useState(null);          // Предпросмотр элемента под курсором

    // ========== КОНСТАНТЫ ==========

    // Ключи для localStorage
    const STORAGE_KEYS = {
        ELEMENTS: 'energy_grid_elements',        // Сохраненные элементы
        CONNECTIONS: 'energy_grid_connections',  // Сохраненные соединения
        CANVAS_SIZE: 'energy_grid_canvas_size',  // Размер холста
        VIEW_OFFSET: 'energy_grid_view_offset'   // Смещение просмотра
    };

    // Типы элементов энергосистемы
    const ELEMENT_TYPES = {
        BUS: 'bus',             // Шина - проводник для распределения энергии
        BUS_BAR: 'bus_bar',     // Ошиновка - соединение между элементами
        SWITCH: 'switch',       // Выключатель - коммутационный аппарат
        GENERATOR: 'generator', // Генератор - источник энергии
        LOAD: 'load',           // Нагрузка - потребитель энергии
        LINE: 'line',           // Линия - линия электропередачи
        JUNCTION: 'junction'    // Узел соединения - точка соединения линий
    };

    // Позиции подписей элементов
    const LABEL_POSITIONS = {
        TOP: 'top',     // Подпись сверху элемента
        BOTTOM: 'bottom' // Подпись снизу элемента
    };

    // Цветовая схема для разных классов напряжения
    const VOLTAGE_COLORS = {
        750: '#1a237e',     // 750 кВ - темно-синий (сверхвысокое напряжение)
        330: '#2e7d32',     // 330 кВ - зеленый (высокое напряжение)
        110: '#0288d1',     // 110 кВ - синий (распределительное напряжение)
        10: '#6a1b9a',      // 10 кВ - фиолетовый (среднее напряжение)
        DEFAULT: '#666666'  // По умолчанию - серый
    };

    // Стандартные размеры элементов (в пикселях)
    const DEFAULT_SIZES = {
        [ELEMENT_TYPES.BUS]: {width: 200, height: 6},           // Шина - длинная и узкая
        [ELEMENT_TYPES.SWITCH]: {width: 26, height: 26},        // Выключатель - квадратный
        [ELEMENT_TYPES.GENERATOR]: {width: 80, height: 50},     // Генератор - прямоугольник
        [ELEMENT_TYPES.LOAD]: {width: 80, height: 50},          // Нагрузка - прямоугольник
        [ELEMENT_TYPES.LINE]: {width: 100, height: 4},          // Линия - тонкая линия
        [ELEMENT_TYPES.BUS_BAR]: {width: 100, height: 4},       // Ошиновка - тонкая линия
        [ELEMENT_TYPES.JUNCTION]: {width: 8, height: 8}         // Узел - маленький квадрат
    };

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    /**
     * Получает цвет элемента по классу напряжения
     * @param {number} voltage - класс напряжения в кВ
     * @returns {string} HEX-цвет
     */
    const getColorByVoltage = useCallback((voltage) => {
        return VOLTAGE_COLORS[voltage] || VOLTAGE_COLORS.DEFAULT;
    }, []); // Пустой массив зависимостей - функция никогда не пересоздается

    /**
     * Определяет цвет элемента с учетом его типа и состояния
     * @param {Object} element - элемент энергосистемы
     * @returns {string} HEX-цвет
     */
    const getElementColor = useCallback((element) => {
        // Выключатель в отключенном состоянии - красный
        if (element.type === ELEMENT_TYPES.SWITCH && element.status === 'open') {
            return '#f44336';
        }
        // Для шин, линий, ошиновок и узлов - цвет по напряжению
        if (element.type === ELEMENT_TYPES.BUS) {
            return getColorByVoltage(element.voltage);
        }
        if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
            return getColorByVoltage(element.voltage);
        }
        if (element.type === ELEMENT_TYPES.JUNCTION) {
            return getColorByVoltage(element.voltage);
        }
        // По умолчанию - цвет по напряжению
        return getColorByVoltage(element.voltage);
    }, [getColorByVoltage]); // Зависит от getColorByVoltage

    /**
     * Создает новый узел соединения
     * @param {number} x - координата X
     * @param {number} y - координата Y
     * @param {number} voltage - класс напряжения (по умолчанию 110 кВ)
     * @returns {Object} созданный узел
     */
    const createJunction = useCallback((x, y, voltage = 110) => {
        const newJunction = {
            id: `junction-${Date.now()}`,      // Уникальный ID с временной меткой
            type: ELEMENT_TYPES.JUNCTION,      // Тип - узел соединения
            x: x - 4,                         // Центрирование по X (ширина 8px)
            y: y - 4,                         // Центрирование по Y (высота 8px)
            width: 8,                         // Ширина узла
            height: 8,                        // Высота узла
            voltage: voltage,                 // Класс напряжения
            label: ""                         // Подпись (изначально пустая)
        };
        // Добавляем узел в массив элементов
        setElements(prev => [...prev, newJunction]);
        return newJunction;
    }, []);

    /**
     * Создает точку соединения в месте пересечения элементов
     * @param {number} x - координата X
     * @param {number} y - координата Y
     * @param {number} voltage - класс напряжения
     * @returns {Object} созданный узел
     */
    const createConnectionPoint = useCallback((x, y, voltage = 110) => {
        const junction = createJunction(x, y, voltage);
        return junction;
    }, [createJunction]);

    /**
     * Вычисляет точку выхода соединения из элемента
     * @param {Object} element - исходный элемент
     * @param {Object} targetElement - целевой элемент
     * @returns {Object} координаты {x, y} точки выхода
     */
        // ВЫНЕСИ ЭТУ ФУНКЦИЮ ВНЕ useCallback, перед ним
    const getExitPoint = (element, targetElement) => {
            const elementCenter = {
                x: element.x + element.width / 2,
                y: element.y + element.height / 2
            };
            const targetCenter = {
                x: targetElement.x + targetElement.width / 2,
                y: targetElement.y + targetElement.height / 2
            };

            // Для ВЫКЛЮЧАТЕЛЕЙ
            if (element.type === ELEMENT_TYPES.SWITCH) {
                // Если цель - ШИНА
                if (targetElement.type === ELEMENT_TYPES.BUS) {
                    const busBottom = targetElement.y + targetElement.height;
                    const switchTop = element.y;
                    const busTop = targetElement.y;
                    const switchBottom = element.y + element.height;
                    const busRight = targetElement.x + targetElement.width;
                    const switchLeft = element.x;

                    if (busBottom < switchTop) {
                        return { x: elementCenter.x, y: element.y };
                    } else if (busTop > switchBottom) {
                        return { x: elementCenter.x, y: element.y + element.height };
                    } else if (busRight < switchLeft) {
                        return { x: element.x, y: elementCenter.y };
                    } else {
                        return { x: element.x + element.width, y: elementCenter.y };
                    }
                }
                // Если цель - ВЫКЛЮЧАТЕЛЬ - УПРОЩЕННАЯ ЛОГИКА БЕЗ РЕКУРСИИ
                else if (targetElement.type === ELEMENT_TYPES.SWITCH) {
                    const dx = targetCenter.x - elementCenter.x;
                    const dy = targetCenter.y - elementCenter.y;

                    // ПРОСТАЯ ЛОГИКА - всегда выход из центра стороны
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // Горизонтальное направление
                        return {
                            x: dx > 0 ? element.x + element.width : element.x,
                            y: elementCenter.y
                        };
                    } else {
                        // Вертикальное направление
                        return {
                            x: elementCenter.x,
                            y: dy > 0 ? element.y + element.height : element.y
                        };
                    }
                }
            }

            // Для ШИН
            if (element.type === ELEMENT_TYPES.BUS) {
                const closestX = Math.max(element.x, Math.min(targetCenter.x, element.x + element.width));
                const closestY = Math.max(element.y, Math.min(targetCenter.y, element.y + element.height));
                return { x: closestX, y: closestY };
            }

            return elementCenter;
        };

    /**
     * Создает ошиновку с прямыми углами между двумя элементами
     * @param {Object} element1 - первый элемент
     * @param {Object} element2 - второй элемент
     * @returns {Object|null} созданная ошиновка или null если соединение невозможно
     */
    const connectElementsWithOrthogonalBusBar = useCallback((element1, element2) => {
        // Получаем точку выхода из выключателя
        const switchElement = element1.type === ELEMENT_TYPES.SWITCH ? element1 : element2;
        const busElement = element1.type === ELEMENT_TYPES.BUS ? element1 : element2;

        const startPoint = getExitPoint(switchElement, busElement);
        const endPoint = getExitPoint(busElement, switchElement);

        const busBar = {
            id: `bus_bar-${Date.now()}`,
            type: ELEMENT_TYPES.BUS_BAR,
            x: startPoint.x,
            y: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            thickness: 4,
            voltage: 110,
            label: ""
        };

        setElements(prev => [...prev, busBar]);
        return busBar;
    }, [getExitPoint]);

    /**
     * Соединяет два элемента ошиновкой
     * @param {Object} element1 - первый элемент
     * @param {Object} element2 - второй элемент
     * @returns {Object|null} созданная ошиновка или null если соединение невозможно
     */
    const connectElementsWithBusBar = useCallback((element1, element2) => {
        const startPoint = getExitPoint(element1, element2);
        const endPoint = getExitPoint(element2, element1);

        const newBusBar = {
            id: `bus_bar-${Date.now()}`,
            type: ELEMENT_TYPES.BUS_BAR,
            x: startPoint.x,
            y: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            thickness: 4,
            voltage: 110,
            label: ""
        };

        setElements(prev => [...prev, newBusBar]);
    }, []); // УБРАЛ getExitPoint из зависимостей

    /**
     * Вычисляет расстояние между двумя точками
     * @param {Object} point1 - первая точка {x, y}
     * @param {Object} point2 - вторая точка {x, y}
     * @returns {number} расстояние
     */
    const distanceBetweenPoints = (point1, point2) => {
        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2)
        );
    };

    /**
     * Вычисляет расстояние от точки до отрезка
     * @param {Object} point - точка {x, y}
     * @param {Object} segmentStart - начало отрезка {x, y}
     * @param {Object} segmentEnd - конец отрезка {x, y}
     * @returns {number} минимальное расстояние
     */
    const distanceToSegment = (point, segmentStart, segmentEnd) => {
        // Вектор от начала отрезка до точки
        const A = point.x - segmentStart.x;
        const B = point.y - segmentStart.y;
        // Вектор отрезка
        const C = segmentEnd.x - segmentStart.x;
        const D = segmentEnd.y - segmentStart.y;

        // Скалярное произведение
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        // Определяем ближайшую точку на отрезке
        if (param < 0) {
            xx = segmentStart.x;
            yy = segmentStart.y;
        } else if (param > 1) {
            xx = segmentEnd.x;
            yy = segmentEnd.y;
        } else {
            xx = segmentStart.x + param * C;
            yy = segmentStart.y + param * D;
        }

        // Расстояние до ближайшей точки
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Проверяет прямое соединение между двумя элементами
     * @param {Object} element1 - первый элемент
     * @param {Object} element2 - второй элемент
     * @param {number} tolerance - допуск расстояния
     * @returns {boolean} true если элементы соединены напрямую
     */
    const isDirectlyConnected = useCallback((element1, element2, tolerance = 20) => {
        // ОШИНОВКА с ВЫКЛЮЧАТЕЛЕМ - проверяем концы ошиновки
        if (element1.type === ELEMENT_TYPES.BUS_BAR && element2.type === ELEMENT_TYPES.SWITCH) {
            const busBarStart = {x: element1.x, y: element1.y};
            const busBarEnd = {
                x: element1.x + element1.width,
                y: element1.y + element1.height
            };

            const switchCenter = {
                x: element2.x + element2.width / 2,
                y: element2.y + element2.height / 2
            };

            const distToStart = distanceBetweenPoints(switchCenter, busBarStart);
            const distToEnd = distanceBetweenPoints(switchCenter, busBarEnd);

            return distToStart <= tolerance || distToEnd <= tolerance;
        }

        // ОШИНОВКА с ШИНОЙ - проверяем концы ошиновки относительно границ шины
        if (element1.type === ELEMENT_TYPES.BUS_BAR && element2.type === ELEMENT_TYPES.BUS) {
            const busBarStart = {x: element1.x, y: element1.y};
            const busBarEnd = {
                x: element1.x + element1.width,
                y: element1.y + element1.height
            };

            const startNearBus = (
                busBarStart.x >= element2.x - tolerance &&
                busBarStart.x <= element2.x + element2.width + tolerance &&
                busBarStart.y >= element2.y - tolerance &&
                busBarStart.y <= element2.y + element2.height + tolerance
            );

            const endNearBus = (
                busBarEnd.x >= element2.x - tolerance &&
                busBarEnd.x <= element2.x + element2.width + tolerance &&
                busBarEnd.y >= element2.y - tolerance &&
                busBarEnd.y <= element2.y + element2.height + tolerance
            );

            return startNearBus || endNearBus;
        }

        // ОШИНОВКА с ЛИНИЕЙ - проверяем всю длину ошиновки
        if (element1.type === ELEMENT_TYPES.BUS_BAR && element2.type === ELEMENT_TYPES.LINE) {
            const busBarStart = {x: element1.x, y: element1.y};
            const busBarEnd = {
                x: element1.x + element1.width,
                y: element1.y + element1.height
            };

            const lineStart = {x: element2.x, y: element2.y};
            const lineEnd = {
                x: element2.x + element2.width,
                y: element2.y + element2.height
            };

            const dist1 = distanceToSegment(lineStart, busBarStart, busBarEnd);
            const dist2 = distanceToSegment(lineEnd, busBarStart, busBarEnd);
            const dist3 = distanceToSegment(busBarStart, lineStart, lineEnd);
            const dist4 = distanceToSegment(busBarEnd, lineStart, lineEnd);

            return dist1 <= tolerance || dist2 <= tolerance || dist3 <= tolerance || dist4 <= tolerance;
        }

        // ВЫКЛЮЧАТЕЛЬ с ЛИНИЕЙ (прямое соединение без ошиновки)
        if (element1.type === ELEMENT_TYPES.SWITCH && element2.type === ELEMENT_TYPES.LINE) {
            const switchCenter = {
                x: element1.x + element1.width / 2,
                y: element1.y + element1.height / 2
            };

            const lineStart = {x: element2.x, y: element2.y};
            const lineEnd = {
                x: element2.x + element2.width,
                y: element2.y + element2.height
            };

            return distanceToSegment(switchCenter, lineStart, lineEnd) <= tolerance;
        }

        // ВЫКЛЮЧАТЕЛЬ с ШИНОЙ (прямое соединение)
        if (element1.type === ELEMENT_TYPES.SWITCH && element2.type === ELEMENT_TYPES.BUS) {
            const switchCenter = {
                x: element1.x + element1.width / 2,
                y: element1.y + element1.height / 2
            };

            return (
                switchCenter.x >= element2.x - tolerance &&
                switchCenter.x <= element2.x + element2.width + tolerance &&
                switchCenter.y >= element2.y - tolerance &&
                switchCenter.y <= element2.y + element2.height + tolerance
            );
        }

        // Симметричные случаи (меняем элементы местами)
        if (element2.type === ELEMENT_TYPES.BUS_BAR && element1.type === ELEMENT_TYPES.SWITCH) {
            return isDirectlyConnected(element2, element1, tolerance);
        }
        if (element2.type === ELEMENT_TYPES.BUS_BAR && element1.type === ELEMENT_TYPES.BUS) {
            return isDirectlyConnected(element2, element1, tolerance);
        }
        if (element2.type === ELEMENT_TYPES.BUS_BAR && element1.type === ELEMENT_TYPES.LINE) {
            return isDirectlyConnected(element2, element1, tolerance);
        }
        if (element2.type === ELEMENT_TYPES.SWITCH && element1.type === ELEMENT_TYPES.LINE) {
            return isDirectlyConnected(element2, element1, tolerance);
        }
        if (element2.type === ELEMENT_TYPES.SWITCH && element1.type === ELEMENT_TYPES.BUS) {
            return isDirectlyConnected(element2, element1, tolerance);
        }

        return false;
    }, []);

    /**
     * Проверяет соединение элементов (прямое или через ошиновку)
     * @param {Object} element1 - первый элемент
     * @param {Object} element2 - второй элемент
     * @param {number} tolerance - допуск расстояния
     * @returns {boolean} true если элементы соединены
     */
    const areElementsConnected = useCallback((element1, element2, tolerance = 20) => {
        // Проверяем прямое соединение
        if (isDirectlyConnected(element1, element2, tolerance)) {
            return true;
        }

        // Проверяем соединение через ошиновку
        const connectingBusBars = elements.filter(busBar =>
            busBar.type === ELEMENT_TYPES.BUS_BAR &&
            isDirectlyConnected(element1, busBar, tolerance) &&
            isDirectlyConnected(busBar, element2, tolerance)
        );

        return connectingBusBars.length > 0;
    }, [elements, isDirectlyConnected]);

    /**
     * Находит все выключатели, соединенные с элементом
     * @param {Object} element - целевой элемент
     * @returns {Array} массив соединенных выключателей
     */
    const findSwitchesConnectedToElement = useCallback((element) => {
        const connectedSwitches = new Set();
        const tolerance = 20;

        // Находим ошиновки, соединенные с элементом
        const connectedBusBars = elements.filter(busBar =>
            busBar.type === ELEMENT_TYPES.BUS_BAR &&
            areElementsConnected(element, busBar, tolerance)
        );

        // Для каждой ошиновки находим соединенные выключатели
        connectedBusBars.forEach(busBar => {
            const switchesOnThisBusBar = elements.filter(el =>
                el.type === ELEMENT_TYPES.SWITCH &&
                areElementsConnected(busBar, el, tolerance)
            );
            switchesOnThisBusBar.forEach(switchElement => {
                connectedSwitches.add(switchElement);
            });
        });

        // Находим выключатели, соединенные напрямую
        const directSwitches = elements.filter(el =>
            el.type === ELEMENT_TYPES.SWITCH &&
            areElementsConnected(element, el, tolerance)
        );
        directSwitches.forEach(switchElement => {
            connectedSwitches.add(switchElement);
        });

        return Array.from(connectedSwitches);
    }, [elements, areElementsConnected]);

    /**
     * Соединяет выбранные элементы ошиновкой
     */
    const connectSelectedElements = useCallback(() => {
        console.log('🔄 connectSelectedElements вызван');

        // Только для двух выбранных элементов
        if (selectedElements.size !== 2) {
            console.log('❌ Не 2 элемента выбрано:', selectedElements.size);
            return;
        }

        const selectedArray = Array.from(selectedElements);
        const element1 = elements.find(el => el.id === selectedArray[0]);
        const element2 = elements.find(el => el.id === selectedArray[1]);

        if (!element1 || !element2) {
            console.log('❌ Элементы не найдены');
            return;
        }

        console.log('✅ Соединяем элементы:', element1.id, element2.id);

        // Сначала сбрасываем ВСЕ состояния взаимодействия
        console.log('🗑️ Сбрасываем все состояния');
        setDraggingElement(null); // ⬅️ ВАЖНО: сбрасываем перетаскивание
        setResizingElement(null);
        setDrawingLine(null);
        setExtendingElement(null);
        setExtendStart(null);

        // Затем сбрасываем выделение
        setSelectedElements(new Set());
        setSelectedElement(null);

        // Сбрасываем фокус с любого активного элемента
        if (document.activeElement) {
            console.log('🎯 Сбрасываем фокус с:', document.activeElement);
            document.activeElement.blur();
        }

        // Создаем соединение
        connectElementsWithBusBar(element1, element2);

        console.log('✅ connectSelectedElements завершен');
    }, [selectedElements, elements, connectElementsWithBusBar]);

    /**
     * Проверяет соединен ли элемент с точкой
     * @param {Object} element - элемент
     * @param {Object} point - точка {x, y}
     * @param {number} tolerance - допуск расстояния
     * @returns {boolean} true если соединен
     */
    const isElementConnectedToPoint = useCallback((element, point, tolerance = 10) => {
        // Для разных типов элементов разные условия соединения
        if (element.type === ELEMENT_TYPES.SWITCH) {
            return (
                point.x >= element.x - tolerance &&
                point.x <= element.x + element.width + tolerance &&
                point.y >= element.y - tolerance &&
                point.y <= element.y + element.height + tolerance
            );
        } else if (element.type === ELEMENT_TYPES.JUNCTION) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
            return distance <= tolerance;
        } else if (element.type === ELEMENT_TYPES.BUS) {
            return (
                point.x >= element.x - tolerance &&
                point.x <= element.x + element.width + tolerance &&
                point.y >= element.y - tolerance &&
                point.y <= element.y + element.height + tolerance
            );
        } else if (element.type === ELEMENT_TYPES.GENERATOR || element.type === ELEMENT_TYPES.LOAD) {
            return (
                point.x >= element.x - tolerance &&
                point.x <= element.x + element.width + tolerance &&
                point.y >= element.y - tolerance &&
                point.y <= element.y + element.height + tolerance
            );
        }
        return false;
    }, []);

    /**
     * Экспортирует данные о выключателях и их соединениях
     * @returns {Object} структура данных для бэкенда
     */
    const exportSwitchesWithConnections = useCallback(() => {
        const exportData = {
            switches: [],           // Массив выключателей
            timestamp: new Date().toISOString(), // Временная метка
            version: '1.0'         // Версия формата
        };

        // Находим все выключатели
        const allSwitches = elements.filter(el => el.type === ELEMENT_TYPES.SWITCH);

        // Для каждого выключателя находим подключенные элементы
        allSwitches.forEach(switchElement => {
            const connectedElements = [];
            const tolerance = 20;

            // Ищем подключенные линии
            elements.forEach(element => {
                if (element.type === ELEMENT_TYPES.LINE && areElementsConnected(switchElement, element, tolerance)) {
                    // Проверяем, нет ли уже такого соединения
                    if (!connectedElements.some(conn => conn.type === 'line' && conn.id === element.id)) {
                        connectedElements.push({
                            type: 'line',
                            id: element.id,
                            name: element.label || `Line_${element.id}`
                        });
                    }
                }
            });

            // Ищем подключенные шины
            elements.forEach(element => {
                if (element.type === ELEMENT_TYPES.BUS && areElementsConnected(switchElement, element, tolerance)) {
                    if (!connectedElements.some(conn => conn.type === 'bus' && conn.id === element.id)) {
                        connectedElements.push({
                            type: 'bus',
                            id: element.id,
                            name: element.label || `Bus_${element.id}`
                        });
                    }
                }
            });

            // Формируем данные выключателя
            const switchData = {
                id: switchElement.id,
                name: switchElement.label || `Switch_${switchElement.id}`,
                voltage: switchElement.voltage || 110,
                status: switchElement.status || 'closed',
                x: Math.round(switchElement.x / 10),  // Координаты в условных единицах
                y: Math.round(switchElement.y / 10),
                width: Math.round(switchElement.width / 10),
                height: Math.round(switchElement.height / 10),
                connectedElements: connectedElements  // Массив соединенных элементов
            };

            exportData.switches.push(switchData);
        });

        return exportData;
    }, [elements, areElementsConnected]);

    /**
     * Отладочная функция для проверки соединений
     */
    const debugConnections = useCallback(() => {
        const data = exportSwitchesWithConnections();
        console.log('=== ДЕТАЛЬНАЯ ОТЛАДКА СОЕДИНЕНИЙ ===');
        console.log('Всего выключателей:', data.switches.length);

        data.switches.forEach(sw => {
            console.log(`--- Выключатель ${sw.name} (${sw.x}, ${sw.y}) ---`);
            console.log(`Соединений: ${sw.connectedElements.length}`);
            if (sw.connectedElements.length === 0) {
                console.log('  ❌ Нет соединений!');
            } else {
                sw.connectedElements.forEach(conn => {
                    console.log(`  ✅ ${conn.type}: ${conn.name}`);
                });
            }
        });
        alert(`Информация о соединениях выведена в консоль (F12)`);
    }, [exportSwitchesWithConnections]);

    /**
     * Отправляет данные на бэкенд
     * @param {string} endpoint - URL эндпоинта
     * @returns {Promise} промис запроса
     */
    const sendToBackend = useCallback(async (endpoint = '/api/energy-grid/connections') => {
        console.log('🔍 sendToBackend вызван с endpoint:', endpoint);
        console.log('🔍 Тип endpoint:', typeof endpoint);

        try {
            const data = exportSwitchesWithConnections();
            console.log('📤 Данные для отправки:', data);

            // Явно указываем полный URL для тестирования
            const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:8080${endpoint}`;
            console.log('🔗 Полный URL:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('📥 Ответ получен, статус:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const result = await response.json();
            alert('Данные успешно отправлены на бэкенд!');
            return result;
        } catch (error) {
            console.error('❌ Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных на бэкенд: ' + error.message);
        }
    }, [exportSwitchesWithConnections]);

    /**
     * Показывает превью данных для экспорта в новом окне
     */
    const previewExportData = useCallback(() => {
        const data = exportSwitchesWithConnections();
        const jsonString = JSON.stringify(data, null, 2);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
                <head>
                    <title>Данные для бэкенда</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        pre { background: #f5f5f5; padding: 15px; border: 1px solid #ccc; border-radius: 5px; overflow: auto; }
                        button { margin: 5px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                        button:hover { background: #0056b3; }
                        .stats { background: #e9ecef; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
                    </style>
                </head>
                <body>
                    <h2>Данные для отправки на Java бэкенд</h2>
                    <div class="stats">
                        <strong>Статистика:</strong><br>
                        • Выключателей: ${data.switches.length}<br>
                        • Всего соединений: ${data.switches.reduce((sum, sw) => sum + sw.connectedElements.length, 0)}<br>
                    </div>
                    <button onclick="window.close()">Закрыть</button>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('jsonData').textContent).then(() => alert('JSON скопирован!'))">
                        Копировать JSON
                    </button>
                    <pre id="jsonData">${jsonString}</pre>
                </body>
            </html>
        `);
    }, [exportSwitchesWithConnections]);

    // ========== РАБОТА С LOCALSTORAGE ==========

    /**
     * Сохраняет данные в localStorage
     */
    const saveToStorage = useCallback(() => {
        if (!isLoaded) return; // Не сохранять до загрузки
        try {
            localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
            localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
            localStorage.setItem(STORAGE_KEYS.CANVAS_SIZE, JSON.stringify(canvasSize));
            localStorage.setItem(STORAGE_KEYS.VIEW_OFFSET, JSON.stringify(viewOffset));
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    }, [elements, connections, canvasSize, viewOffset, isLoaded]);

    /**
     * Загружает данные из localStorage
     */
    const loadFromStorage = useCallback(() => {
        try {
            const savedElements = localStorage.getItem(STORAGE_KEYS.ELEMENTS);
            const savedConnections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
            const savedCanvasSize = localStorage.getItem(STORAGE_KEYS.CANVAS_SIZE);
            const savedViewOffset = localStorage.getItem(STORAGE_KEYS.VIEW_OFFSET);

            if (savedElements) setElements(JSON.parse(savedElements));
            if (savedConnections) setConnections(JSON.parse(savedConnections));
            if (savedCanvasSize) setCanvasSize(JSON.parse(savedCanvasSize));
            if (savedViewOffset) setViewOffset(JSON.parse(savedViewOffset));

            setIsLoaded(true);
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            setIsLoaded(true);
        }
    }, []);

    /**
     * Очищает localStorage и состояние
     */
    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.ELEMENTS);
            localStorage.removeItem(STORAGE_KEYS.CONNECTIONS);
            localStorage.removeItem(STORAGE_KEYS.CANVAS_SIZE);
            localStorage.removeItem(STORAGE_KEYS.VIEW_OFFSET);

            setElements([]);
            setConnections([]);
            setCanvasSize({width: 3000, height: 2000});
            setViewOffset({x: 0, y: 0});
            setSelectedElement(null);
            setSelectedElements(new Set());
            setShowProperties(false);
        } catch (error) {
            console.error('Ошибка при очистке:', error);
        }
    }, []);

    // ========== USE EFFECT ХУКИ ==========

    // Автосохранение при изменении данных
    useEffect(() => {
        if (isLoaded) {
            saveToStorage();
        }
    }, [elements, connections, canvasSize, viewOffset, saveToStorage, isLoaded]);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        loadFromStorage();
    }, []);

    // ========== ФУНКЦИИ РАБОТЫ С КООРДИНАТАМИ ==========

    /**
     * Преобразует координаты мыши в координаты на холсте
     * @param {number} clientX - X координата мыши
     * @param {number} clientY - Y координата мыши
     * @returns {Object} координаты {x, y} на холсте
     */
    /**
     * Преобразует координаты мыши в координаты на холсте
     */
    const getCanvasCoordinates = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};
        const rect = canvas.getBoundingClientRect();
        const coords = {
            x: clientX - rect.left + viewOffset.x,
            y: clientY - rect.top + viewOffset.y
        };
        console.log('📍 Преобразование координат:', {clientX, clientY, viewOffset, result: coords});
        return coords;
    }, [viewOffset]);

    /**
     * Вычисляет ортогональные координаты для режима прямых углов
     * @param {number} startX - начальная X
     * @param {number} startY - начальная Y
     * @param {number} currentX - текущая X
     * @param {number} currentY - текущая Y
     * @returns {Object} ортогональные координаты {x, y}
     */
    const getOrthogonalCoordinates = useCallback((startX, startY, currentX, currentY) => {
        const dx = currentX - startX;
        const dy = currentY - startY;
        // Выбираем направление с большим смещением
        if (Math.abs(dx) > Math.abs(dy)) {
            return {x: currentX, y: startY}; // Горизонтальная линия
        } else {
            return {x: startX, y: currentY}; // Вертикальная линия
        }
    }, []);

    // ========== ФУНКЦИИ ОТРИСОВКИ ==========

    /**
     * Рисует сетку на холсте
     * @param {CanvasRenderingContext2D} ctx - контекст canvas
     */
    const drawGrid = useCallback((ctx) => {
        const mmSize = 10;     // Размер ячейки в пикселях (1 мм)
        const cmSize = mmSize * 10; // 1 см = 10 мм
        const bigStep = cmSize;    // Шаг крупной сетки

        // Заливка фона
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

        // Вертикальные линии
        for (let x = 0; x <= canvasSize.width; x += mmSize) {
            ctx.beginPath();
            if (x % bigStep === 0) {
                // Крупная сетка - каждые 10 мм
                ctx.strokeStyle = '#bdbdbd';
                ctx.lineWidth = 1;
                if (x > 0) {
                    // Подписи координат
                    ctx.fillStyle = '#757575';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${x / cmSize}`, x, 2); // В сантиметрах
                }
            } else {
                // Мелкая сетка
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 0.5;
            }
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize.height);
            ctx.stroke();
        }

        // Горизонтальные линии
        for (let y = 0; y <= canvasSize.height; y += mmSize) {
            ctx.beginPath();
            if (y % bigStep === 0) {
                ctx.strokeStyle = '#bdbdbd';
                ctx.lineWidth = 1;
                if (y > 0) {
                    ctx.fillStyle = '#757575';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${y / cmSize}`, 2, y);
                }
            } else {
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 0.5;
            }
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize.width, y);
            ctx.stroke();
        }

        // Рамка холста
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
    }, [canvasSize]);

    /**
     * Основная функция отрисовки всего холста
     */
    const draw = useCallback(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Очистка холста
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Применяем смещение просмотра
        ctx.translate(-viewOffset.x, -viewOffset.y);

        // Рисуем сетку
        drawGrid(ctx);

        // Рисуем соединения
        connections.forEach(conn => {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
            ctx.stroke();

            // Отображение тока (если есть)
            if (conn.current) {
                const midX = (conn.from.x + conn.to.x) / 2;
                const midY = (conn.from.y + conn.to.y) / 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(midX - 20, midY - 8, 40, 16);
                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${conn.current}A`, midX, midY + 4);
            }
        });

        // Рисуем линию в процессе рисования
        if (drawingLine) {
            const drawingColor = drawingMode === 'bus_bar' ? VOLTAGE_COLORS[110] : VOLTAGE_COLORS.DEFAULT;
            ctx.strokeStyle = drawingColor;
            ctx.lineWidth = drawingMode === 'bus_bar' ? 4 : 2;
            ctx.setLineDash([5, 5]); // Пунктирная линия для предпросмотра
            ctx.beginPath();

            let currentX = drawingLine.currentX;
            let currentY = drawingLine.currentY;

            // Ортогональный режим
            if (orthogonalMode) {
                const orthogonalCoords = getOrthogonalCoordinates(
                    drawingLine.startX,
                    drawingLine.startY,
                    drawingLine.currentX,
                    drawingLine.currentY
                );
                currentX = orthogonalCoords.x;
                currentY = orthogonalCoords.y;
            }

            ctx.moveTo(drawingLine.startX, drawingLine.startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Рисуем расширение элемента
        if (extendingElement) {
            const extendColor = getElementColor(extendingElement);
            ctx.strokeStyle = extendColor;
            ctx.lineWidth = extendingElement.thickness || (extendingElement.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4);
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(extendStart.x, extendStart.y);
            ctx.lineTo(extendStart.currentX, extendStart.currentY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Рисуем предпросмотр инструмента
        if (selectedTool && toolPreview) {
            ctx.save();
            ctx.globalAlpha = 0.7; // Полупрозрачный предпросмотр

            const previewColor = getColorByVoltage(110);
            const {x, y} = toolPreview;
            const size = DEFAULT_SIZES[selectedTool];

            switch (selectedTool) {
                case ELEMENT_TYPES.BUS:
                    ctx.fillStyle = previewColor;
                    ctx.fillRect(x, y, size.width, size.height);
                    break;
                case ELEMENT_TYPES.SWITCH:
                    ctx.fillStyle = previewColor;
                    ctx.fillRect(x, y, size.width, size.height);
                    break;
                case ELEMENT_TYPES.GENERATOR:
                case ELEMENT_TYPES.LOAD:
                    ctx.fillStyle = previewColor;
                    ctx.fillRect(x, y, size.width, size.height);
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        selectedTool === ELEMENT_TYPES.GENERATOR ? 'Генератор' : 'Нагрузка',
                        x + size.width / 2,
                        y + size.height / 2
                    );
                    break;
                case ELEMENT_TYPES.JUNCTION:
                    ctx.fillStyle = previewColor;
                    ctx.beginPath();
                    ctx.arc(
                        x + size.width / 2,
                        y + size.height / 2,
                        size.width / 2,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                    break;
            }

            ctx.restore();
        }

        // Рисуем прямоугольник выделения
        if (selectionRect) {
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(
                selectionRect.startX,
                selectionRect.startY,
                selectionRect.currentX - selectionRect.startX,
                selectionRect.currentY - selectionRect.startY
            );
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
            ctx.fillRect(
                selectionRect.startX,
                selectionRect.startY,
                selectionRect.currentX - selectionRect.startX,
                selectionRect.currentY - selectionRect.startY
            );
        }

        // Рисуем все элементы
        elements.forEach(element => {
            ctx.save();
            const isSelected = selectedElements.has(element.id) || selectedElement === element.id;
            const fillColor = getElementColor(element);

            // Отрисовка в зависимости от типа элемента
            switch (element.type) {
                case ELEMENT_TYPES.BUS:
                    // Шина - прямоугольник
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        // Выделение золотой рамкой
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(element.x, element.y, element.width, element.height);
                    }
                    // Подпись шины
                    if (element.label) {
                        ctx.fillStyle = '#333';
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        if (element.labelPosition === LABEL_POSITIONS.BOTTOM) {
                            ctx.textBaseline = 'top';
                            ctx.fillText(
                                element.label,
                                element.x + element.width / 2,
                                element.y + element.height + 5
                            );
                        } else {
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(
                                element.label,
                                element.x + element.width / 2,
                                element.y - 5
                            );
                        }
                    }
                    // Отображение напряжения
                    if (element.voltage) {
                        ctx.fillStyle = '#666';
                        ctx.font = '9px Arial';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(
                            `${element.voltage} кВ`,
                            element.x + element.width + 5,
                            element.y + element.height / 2
                        );
                    }
                    break;

                case ELEMENT_TYPES.SWITCH:
                    // Выключатель - квадрат
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(element.x, element.y, element.width, element.height);
                    }
                    // Подпись выключателя
                    if (element.label) {
                        ctx.fillStyle = '#000';
                        ctx.font = 'bold 10px Arial';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(
                            element.label,
                            element.x + element.width + 5,
                            element.y + element.height / 2
                        );
                    }
                    break;

                case ELEMENT_TYPES.GENERATOR:
                case ELEMENT_TYPES.LOAD:
                    // Генератор и нагрузка - прямоугольники с текстом
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(element.x, element.y, element.width, element.height);
                    }
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        element.label || element.type,
                        element.x + element.width / 2,
                        element.y + element.height / 2
                    );
                    break;

                case ELEMENT_TYPES.JUNCTION:
                    // Узел соединения - круг
                    ctx.fillStyle = fillColor;
                    ctx.beginPath();
                    ctx.arc(
                        element.x + element.width / 2,
                        element.y + element.height / 2,
                        element.width / 2,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                    if (isSelected) {
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    break;

                case ELEMENT_TYPES.LINE:
                case ELEMENT_TYPES.BUS_BAR:
                    // Линии и ошиновки
                    const lineThickness = element.thickness || (element.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4);
                    ctx.strokeStyle = fillColor;
                    ctx.lineWidth = lineThickness;

                    if (isSelected) {
                        // Подсветка выделения
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = lineThickness + 4;
                        ctx.beginPath();
                        ctx.moveTo(element.x, element.y);
                        ctx.lineTo(element.x + element.width, element.y + element.height);
                        ctx.stroke();
                        ctx.strokeStyle = fillColor;
                        ctx.lineWidth = lineThickness;
                    }

                    // Отрисовка линии
                    ctx.beginPath();
                    ctx.moveTo(element.x, element.y);
                    ctx.lineTo(element.x + element.width, element.y + element.height);
                    ctx.stroke();

                    // Подпись линии
                    if (element.label) {
                        const midX = element.x + element.width / 2;
                        const midY = element.y + element.height / 2;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(midX - 20, midY - 8, 40, 16);
                        ctx.fillStyle = '#333';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(element.label, midX, midY);
                    }
                    break;
            }

            // Маркеры изменения размера для прямоугольных элементов
            if (isSelected && element.type !== ELEMENT_TYPES.LINE && element.type !== ELEMENT_TYPES.BUS_BAR && element.type !== ELEMENT_TYPES.SWITCH && element.type !== ELEMENT_TYPES.JUNCTION) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(
                    element.x + element.width - 4,
                    element.y + element.height - 4,
                    8, 8
                );
            }

            // Маркеры расширения для линий
            if (isSelected && (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR)) {
                const endX = element.x + element.width;
                const endY = element.y + element.height;
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(element.x, element.y, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        });
        ctx.restore();
    }, [elements, selectedElement, selectedElements, connections, drawingLine, drawingMode, viewOffset, canvasSize, selectionRect, getElementColor, drawGrid, extendingElement, extendStart, orthogonalMode, getOrthogonalCoordinates, selectedTool, toolPreview, getColorByVoltage]);

    // ========== ФУНКЦИИ ПОИСКА И ВЗАИМОДЕЙСТВИЯ ==========

    /**
     * Находит элемент по координатам
     * @param {number} x - координата X
     * @param {number} y - координата Y
     * @returns {Object|null} найденный элемент или null
     */
    /**
     * Находит элемент по координатам
     */
    const findElementAt = useCallback((x, y) => {
        console.log('🔍 Поиск элемента по координатам:', {x, y});

        const foundElement = elements.find(element => {
            // Для разных типов элементов разные условия поиска
            if (element.type === ELEMENT_TYPES.BUS) {
                const grabArea = 10; // Область захвата вокруг шины
                const isFound = (
                    x >= element.x - grabArea &&
                    x <= element.x + element.width + grabArea &&
                    y >= element.y - grabArea &&
                    y <= element.y + element.height + grabArea
                );
                if (isFound) console.log('📏 Найдена шина:', element.id);
                return isFound;
            } else if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
                // Для линий - расстояние до линии
                const distance = pointToLineDistance(x, y, element);
                const isFound = distance < 15;
                if (isFound) console.log('📐 Найдена линия/ошиновка:', element.id, 'расстояние:', distance);
                return isFound;
            } else if (element.type === ELEMENT_TYPES.JUNCTION) {
                // Для узлов - расстояние до центра
                const centerX = element.x + element.width / 2;
                const centerY = element.y + element.height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const isFound = distance < 15;
                if (isFound) console.log('🔘 Найден узел:', element.id, 'расстояние:', distance);
                return isFound;
            } else {
                // Для остальных - попадание в bounding box
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
    }, [elements]);

    /**
     * Вычисляет расстояние от точки до линии
     */
    const pointToLineDistance = (px, py, line) => {
        const {x: x1, y: y1, width, height} = line;
        const x2 = x1 + width;
        const y2 = y1 + height;

        // Векторные вычисления
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Проверяет попадание в область изменения размера
     */
    const isInResizeArea = useCallback((element, x, y) => {
        // Изменение размера только для прямоугольных элементов
        if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR || element.type === ELEMENT_TYPES.SWITCH || element.type === ELEMENT_TYPES.JUNCTION) return false;

        const resizeHandleSize = 8;
        return (
            x >= element.x + element.width - resizeHandleSize &&
            x <= element.x + element.width + resizeHandleSize &&
            y >= element.y + element.height - resizeHandleSize &&
            y <= element.y + element.height + resizeHandleSize
        );
    }, []);

    /**
     * Проверяет попадание в область расширения линии
     */
    const isInExtendArea = useCallback((element, x, y) => {
        // Расширение только для линий и ошиновок
        if (element.type !== ELEMENT_TYPES.LINE && element.type !== ELEMENT_TYPES.BUS_BAR) return false;

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
    }, []);

    /**
     * Проверяет попадание элемента в область выделения
     */
    const isElementInSelection = useCallback((element, rect) => {
        const startX = Math.min(rect.startX, rect.currentX);
        const startY = Math.min(rect.startY, rect.currentY);
        const endX = Math.max(rect.startX, rect.currentX);
        const endY = Math.max(rect.startY, rect.currentY);

        // Для линий - проверяем концы
        if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
            const lineStart = {x: element.x, y: element.y};
            const lineEnd = {x: element.x + element.width, y: element.y + element.height};
            const startInside = lineStart.x >= startX && lineStart.x <= endX && lineStart.y >= startY && lineStart.y <= endY;
            const endInside = lineEnd.x >= startX && lineEnd.x <= endX && lineEnd.y >= startY && lineEnd.y <= endY;
            return startInside || endInside;
        }
        // Для узлов - проверяем центр
        else if (element.type === ELEMENT_TYPES.JUNCTION) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            return centerX >= startX && centerX <= endX && centerY >= startY && centerY <= endY;
        }
        // Для остальных - полное попадание в прямоугольник
        else {
            return (
                element.x >= startX &&
                element.x + element.width <= endX &&
                element.y >= startY &&
                element.y + element.height <= endY
            );
        }
    }, []);

    // ========== ФУНКЦИИ УПРАВЛЕНИЯ ИНСТРУМЕНТАМИ ==========

    /**
     * Выбирает инструмент для размещения элемента
     * @param {string} toolType - тип элемента
     */
    const selectTool = useCallback((toolType) => {
        setSelectedTool(toolType);
        setDrawingMode(null); // Отменяем режим рисования линий
        setSelectedElement(null);
        setSelectedElements(new Set());
    }, []);

    /**
     * Отменяет выбор инструмента
     */
    const cancelToolSelection = useCallback(() => {
        setSelectedTool(null);
        setToolPreview(null);
    }, []);

    /**
     * Создает элемент в указанных координатах
     * @param {string} type - тип элемента
     * @param {number} x - координата X
     * @param {number} y - координата Y
     */
    const createElementAt = useCallback((type, x, y) => {
        const size = DEFAULT_SIZES[type];
        const centeredX = x - size.width / 2;
        const centeredY = y - size.height / 2;

        const newElement = {
            id: `${type}-${Date.now()}`,
            type,
            x: centeredX,
            y: centeredY,
            voltage: 110,
            ...size
        };

        // Настройки по умолчанию для разных типов
        switch (type) {
            case ELEMENT_TYPES.BUS:
                newElement.labelPosition = LABEL_POSITIONS.TOP;
                break;
            case ELEMENT_TYPES.SWITCH:
                newElement.label = `Q${elements.filter(el => el.type === ELEMENT_TYPES.SWITCH).length + 1}`;
                newElement.status = 'closed';
                break;
            case ELEMENT_TYPES.GENERATOR:
                newElement.label = 'Генератор';
                break;
            case ELEMENT_TYPES.LOAD:
                newElement.label = 'Нагрузка';
                break;
            case ELEMENT_TYPES.JUNCTION:
                newElement.label = 'Точка';
                break;
        }

        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        setSelectedElements(new Set([newElement.id]));

        // Сбрасываем инструмент после создания элемента
        cancelToolSelection();
    }, [elements, cancelToolSelection]);

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

    /**
     * Обработчик нажатия кнопки мыши
     */
    /**
     * Обработчик нажатия кнопки мыши
     */
    const handleMouseDown = useCallback((event) => {
        if (mode !== 'edit') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        console.log('🖱️ MouseDown в координатах:', {x, y});
        console.log('🛠️ Активные состояния:', {
            selectedTool,
            drawingMode,
            selectedElements: Array.from(selectedElements),
            selectedElement
        });

        // Pan (перемещение по холсту) - средняя кнопка или Ctrl+левая
        if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
            console.log('🔄 Начало pan');
            setIsPanning(true);
            setPanStart({x: event.clientX, y: event.clientY});
            return;
        }

        // Только левая кнопка мыши
        if (event.button !== 0) return;

        // Если выбран инструмент - создаем элемент
        if (selectedTool) {
            console.log('🔧 Создание элемента инструментом:', selectedTool);
            createElementAt(selectedTool, x, y);
            return;
        }

        const clickedElement = findElementAt(x, y);
        console.log('🎯 Кликнут элемент:', clickedElement ? clickedElement.id : 'ничего');

        if (clickedElement) {
            // Расширение линии
            if (clickedElement.type === ELEMENT_TYPES.LINE || clickedElement.type === ELEMENT_TYPES.BUS_BAR) {
                const extendArea = isInExtendArea(clickedElement, x, y);
                if (extendArea.atStart || extendArea.atEnd) {
                    console.log('📏 Расширение линии:', clickedElement.id);
                    setExtendingElement(clickedElement);
                    setExtendStart({
                        x: extendArea.atStart ? clickedElement.x : clickedElement.x + clickedElement.width,
                        y: extendArea.atStart ? clickedElement.y : clickedElement.y + clickedElement.height,
                        currentX: x,
                        currentY: y,
                        fromStart: extendArea.atStart
                    });
                    return;
                }
            }

            // Изменение размера
            if (isInResizeArea(clickedElement, x, y)) {
                console.log('📐 Изменение размера:', clickedElement.id);
                setResizingElement(clickedElement);
            } else {
                // Мультивыделение с Shift - НЕ начинаем перетаскивание
                if (event.shiftKey) {
                    console.log('🔲 Мультивыделение с Shift');
                    setSelectedElements(prev => {
                        const newSelection = new Set(prev);
                        if (newSelection.has(clickedElement.id)) {
                            newSelection.delete(clickedElement.id);
                            console.log('➖ Удален из выделения:', clickedElement.id);
                        } else {
                            newSelection.add(clickedElement.id);
                            console.log('➕ Добавлен в выделение:', clickedElement.id);
                        }
                        console.log('🎯 Новое выделение:', Array.from(newSelection));
                        return newSelection;
                    });
                    setSelectedElement(null);
                    // ⬅️ ВАЖНО: НЕ устанавливаем draggingElement при Shift+клике
                    return; // ⬅️ Выходим сразу
                } else {
                    // Перетаскивание элемента (только без Shift)
                    console.log('👆 Начало перетаскивания:', clickedElement.id);
                    setDraggingElement(clickedElement);
                    setDragOffset({
                        x: x - clickedElement.x,
                        y: y - clickedElement.y
                    });

                    // Одиночное выделение
                    if (selectedElements.has(clickedElement.id)) {
                        console.log('🎯 Элемент уже выделен:', clickedElement.id);
                        setSelectedElement(clickedElement.id);
                    } else {
                        console.log('🎯 Новое выделение элемента:', clickedElement.id);
                        setSelectedElement(clickedElement.id);
                        setSelectedElements(new Set([clickedElement.id]));
                    }
                }
            }
        } else {
            // Клик на пустом месте
            console.log('⬜ Клик на пустом месте');
            if (drawingMode) {
                console.log('✏️ Начало рисования линии в режиме:', drawingMode);
                setDrawingLine({
                    startX: x,
                    startY: y,
                    currentX: x,
                    currentY: y
                });
            } else {
                console.log('🔲 Начало выделения области');
                setSelectionRect({
                    startX: x,
                    startY: y,
                    currentX: x,
                    currentY: y
                });
                setSelectedElement(null);
                setSelectedElements(new Set());
            }
            setShowProperties(false);
        }
    }, [mode, findElementAt, isInResizeArea, isInExtendArea, getCanvasCoordinates, drawingMode, selectedElements, selectedTool, createElementAt]);

    /**
     * Обработчик движения мыши
     */
    const handleMouseMove = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        // Обновляем предпросмотр инструмента
        if (selectedTool) {
            const size = DEFAULT_SIZES[selectedTool];
            const centeredX = x - size.width / 2;
            const centeredY = y - size.height / 2;
            setToolPreview({x: centeredX, y: centeredY});
        } else {
            setToolPreview(null);
        }

        if (isPanning) {
            // Перемещение по холсту
            const deltaX = event.clientX - panStart.x;
            const deltaY = event.clientY - panStart.y;
            setViewOffset(prev => ({
                x: Math.max(0, prev.x - deltaX),
                y: Math.max(0, prev.y - deltaY)
            }));
            setPanStart({x: event.clientX, y: event.clientY});
        } else if (draggingElement && selectedElements.size > 0) {
            // Перетаскивание нескольких элементов
            const deltaX = x - (draggingElement.x + dragOffset.x);
            const deltaY = y - (draggingElement.y + dragOffset.y);
            setElements(prev => prev.map(el => {
                if (selectedElements.has(el.id)) {
                    return {
                        ...el,
                        x: Math.max(0, el.x + deltaX),
                        y: Math.max(0, el.y + deltaY)
                    };
                }
                return el;
            }));
            setDraggingElement(prev => ({
                ...prev,
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));
        } else if (draggingElement) {
            // Перетаскивание одного элемента
            setElements(prev => prev.map(el =>
                el.id === draggingElement.id
                    ? {
                        ...el,
                        x: Math.max(0, x - dragOffset.x),
                        y: Math.max(0, y - dragOffset.y)
                    }
                    : el
            ));
        } else if (resizingElement) {
            // Изменение размера элемента
            setElements(prev => prev.map(el =>
                el.id === resizingElement.id
                    ? {
                        ...el,
                        width: Math.max(20, x - el.x),
                        height: Math.max(6, y - el.y)
                    }
                    : el
            ));
        } else if (drawingLine) {
            // Рисование линии (обновление предпросмотра)
            let currentX = x;
            let currentY = y;
            if (orthogonalMode) {
                const orthogonalCoords = getOrthogonalCoordinates(
                    drawingLine.startX,
                    drawingLine.startY,
                    x,
                    y
                );
                currentX = orthogonalCoords.x;
                currentY = orthogonalCoords.y;
            }
            setDrawingLine(prev => ({
                ...prev,
                currentX: currentX,
                currentY: currentY
            }));
        } else if (extendingElement && extendStart) {
            // Расширение линии
            setExtendStart(prev => ({
                ...prev,
                currentX: x,
                currentY: y
            }));
        } else if (selectionRect) {
            // Изменение области выделения
            setSelectionRect(prev => ({
                ...prev,
                currentX: x,
                currentY: y
            }));
        }
    }, [isPanning, panStart, draggingElement, dragOffset, resizingElement, drawingLine, getCanvasCoordinates, selectedElements, selectionRect, extendingElement, extendStart, orthogonalMode, getOrthogonalCoordinates, selectedTool]);

    /**
     * Обработчик отпускания кнопки мыши
     */
    const handleMouseUp = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        if (isPanning) {
            setIsPanning(false);
        } else if (drawingLine && drawingMode) {
            // Завершение рисования линии
            let finalX = x;
            let finalY = y;
            if (orthogonalMode) {
                const orthogonalCoords = getOrthogonalCoordinates(
                    drawingLine.startX,
                    drawingLine.startY,
                    x,
                    y
                );
                finalX = orthogonalCoords.x;
                finalY = orthogonalCoords.y;
            }

            // Создание нового элемента
            const newElement = {
                id: `${drawingMode}-${Date.now()}`,
                type: drawingMode === 'bus_bar' ? ELEMENT_TYPES.BUS_BAR : ELEMENT_TYPES.LINE,
                x: drawingLine.startX,
                y: drawingLine.startY,
                width: finalX - drawingLine.startX,
                height: finalY - drawingLine.startY,
                voltage: 110,
                thickness: drawingMode === 'bus_bar' ? 2 : 4
            };
            setElements(prev => [...prev, newElement]);
            setSelectedElement(newElement.id);
            setSelectedElements(new Set([newElement.id]));
            setDrawingMode(null);
        } else if (extendingElement && extendStart) {
            // Завершение расширения линии
            const deltaX = x - extendStart.x;
            const deltaY = y - extendStart.y;
            setElements(prev => prev.map(el => {
                if (el.id === extendingElement.id) {
                    if (extendStart.fromStart) {
                        // Расширение от начала
                        return {
                            ...el,
                            x: x,
                            y: y,
                            width: el.width + (el.x - x),
                            height: el.height + (el.y - y)
                        };
                    } else {
                        // Расширение от конца
                        return {
                            ...el,
                            width: el.width + deltaX,
                            height: el.height + deltaY
                        };
                    }
                }
                return el;
            }));
            setExtendingElement(null);
            setExtendStart(null);
        } else if (selectionRect) {
            // Завершение выделения области
            const selectedIds = new Set();
            elements.forEach(element => {
                if (isElementInSelection(element, selectionRect)) {
                    selectedIds.add(element.id);
                }
            });
            if (selectedIds.size > 0) {
                setSelectedElements(selectedIds);
                setSelectedElement(null);
            }
            setSelectionRect(null);
        }

        // Сброс всех состояний взаимодействия
        setDraggingElement(null);
        setResizingElement(null);
        setDrawingLine(null);
        setExtendingElement(null);
        setExtendStart(null);
        setIsPanning(false);
    }, [isPanning, drawingLine, drawingMode, getCanvasCoordinates, selectionRect, elements, isElementInSelection, extendingElement, extendStart, orthogonalMode, getOrthogonalCoordinates]);

    /**
     * Обработчик колесика мыши (прокрутка)
     */
    const handleWheel = useCallback((event) => {
        event.preventDefault();

        // Вертикальная прокрутка
        setViewOffset(prev => {
            const newY = prev.y + event.deltaY;
            return {
                x: prev.x,
                y: Math.max(0, newY)
            };
        });

        // Автоматическое расширение холста при приближении к краю
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const visibleBottom = viewOffset.y + rect.height;
        if (visibleBottom > canvasSize.height - 500) {
            setCanvasSize(prev => ({
                ...prev,
                height: prev.height + 1000
            }));
        }
    }, [viewOffset, canvasSize]);

    // ========== ФУНКЦИИ УПРАВЛЕНИЯ ЭЛЕМЕНТАМИ ==========

    /**
     * Добавляет новый элемент в центр экрана
     * @param {string} type - тип элемента
     */
    const addElement = useCallback((type) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Позиция в центре видимой области
        const rect = canvas.getBoundingClientRect();
        const centerX = viewOffset.x + rect.width / 2 - 100;
        const centerY = viewOffset.y + rect.height / 2 - 50;

        const newElement = {
            id: `${type}-${Date.now()}`,
            type,
            x: centerX,
            y: centerY,
            voltage: 110,
            ...DEFAULT_SIZES[type] // Стандартные размеры
        };

        // Настройки по умолчанию для разных типов
        switch (type) {
            case ELEMENT_TYPES.BUS:
                newElement.voltage = 110;
                newElement.labelPosition = LABEL_POSITIONS.TOP;
                break;
            case ELEMENT_TYPES.SWITCH:
                newElement.label = `Q${elements.filter(el => el.type === ELEMENT_TYPES.SWITCH).length + 1}`;
                newElement.status = 'closed';
                break;
            case ELEMENT_TYPES.GENERATOR:
                newElement.label = 'Генератор';
                break;
            case ELEMENT_TYPES.LOAD:
                newElement.label = 'Нагрузка';
                break;
            case ELEMENT_TYPES.JUNCTION:
                newElement.label = 'Точка';
                break;
        }

        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        setSelectedElements(new Set([newElement.id]));
    }, [elements, viewOffset]);

    /**
     * Обновляет свойство элемента
     */
    const updateElementProperty = useCallback((elementId, property, value) => {
        setElements(prev => prev.map(el =>
            el.id === elementId
                ? {...el, [property]: value}
                : el
        ));
    }, []);

    /**
     * Удаляет выбранные элементы
     */
    const deleteSelected = useCallback(() => {
        if (selectedElements.size > 0) {
            // Удаление множества элементов
            setElements(prev => prev.filter(el => !selectedElements.has(el.id)));
            setConnections(prev => prev.filter(conn =>
                !selectedElements.has(conn.fromElement) && !selectedElements.has(conn.toElement)
            ));
            setSelectedElement(null);
            setSelectedElements(new Set());
            setShowProperties(false);
        } else if (selectedElement) {
            // Удаление одного элемента
            setElements(prev => prev.filter(el => el.id !== selectedElement));
            setConnections(prev => prev.filter(conn =>
                conn.fromElement !== selectedElement && conn.toElement !== selectedElement
            ));
            setSelectedElement(null);
            setSelectedElements(new Set());
            setShowProperties(false);
        }
    }, [selectedElement, selectedElements]);

    /**
     * Переключает состояние выключателя
     */
    const toggleSwitch = useCallback((elementId) => {
        setElements(prev => prev.map(el =>
            el.id === elementId && el.type === ELEMENT_TYPES.SWITCH
                ? {...el, status: el.status === 'open' ? 'closed' : 'open'}
                : el
        ));
    }, []);

    /**
     * Обработчик двойного клика
     */
    const handleDoubleClick = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        const clickedElement = findElementAt(x, y);
        if (clickedElement) {
            // Двойной клик на выключателе - переключение
            if (clickedElement.type === ELEMENT_TYPES.SWITCH) {
                toggleSwitch(clickedElement.id);
            }
        } else {
            // Двойной клик на пустом месте - создание узла
            createJunction(x, y, 110);
        }
    }, [findElementAt, toggleSwitch, getCanvasCoordinates, createJunction]);

    // ========== ФУНКЦИИ РИСОВАНИЯ ==========

    const startDrawingLine = useCallback(() => {
        setDrawingMode('line');
        setSelectedElement(null);
        setSelectedElements(new Set());
        setSelectedTool(null); // Отменяем выбор инструмента
    }, []);

    const startDrawingBusBar = useCallback(() => {
        setDrawingMode('bus_bar');
        setSelectedElement(null);
        setSelectedElements(new Set());
        setSelectedTool(null); // Отменяем выбор инструмента
    }, []);

    const cancelDrawing = useCallback(() => {
        setDrawingMode(null);
        setDrawingLine(null);
        setExtendingElement(null);
        setExtendStart(null);
    }, []);

    const toggleOrthogonalMode = useCallback(() => {
        setOrthogonalMode(prev => !prev);
    }, []);

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    const handleForceSave = useCallback(() => {
        saveToStorage();
        alert('Данные сохранены!');
    }, [saveToStorage]);

    const handleForceLoad = useCallback(() => {
        loadFromStorage();
        alert('Данные загружены!');
    }, [loadFromStorage]);

    const centerView = useCallback(() => {
        setViewOffset({x: 0, y: 0});
    }, []);

    // ========== ПЕРЕМЕННЫЕ ДЛЯ РЕНДЕРА ==========

    const selectedElementData = elements.find(el => el.id === selectedElement);

    // ========== USE EFFECT ДЛЯ ОТРИСОВКИ ==========

    // Перерисовка при изменении состояния
    useEffect(() => {
        draw();
    }, [draw]);

    // ========== ОБРАБОТКА КЛАВИАТУРЫ ==========

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Игнорируем клавиши, если фокус в поле ввода
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            if (mode !== 'edit') return;

            // Отмена выбора инструмента по Escape
            if (event.key === 'Escape') {
                event.preventDefault();
                if (selectedTool) {
                    cancelToolSelection();
                } else {
                    cancelDrawing();
                    setSelectionRect(null);
                    setExtendingElement(null);
                    setExtendStart(null);
                }
            }

            // Перемещение элементов стрелками с Alt
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

                setElements(prev => prev.map(el => {
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

            // Удаление выделенных элементов
            if (event.key === 'Delete' && (selectedElement || selectedElements.size > 0)) {
                event.preventDefault();
                deleteSelected();
            }
            // Соединение выбранных элементов
            else if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                console.log('⌨️ Enter нажат, selectedElements:', selectedElements.size);
                if (selectedElements.size === 2) {
                    connectSelectedElements();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mode, selectedElement, selectedElements, deleteSelected, cancelDrawing, connectSelectedElements, selectedTool, cancelToolSelection]);

    // ========== RENDER ==========

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
                // Динамическое изменение курсора
                cursor: selectedTool ? 'crosshair' :
                    isPanning ? 'grabbing' :
                        drawingLine || extendingElement ? 'crosshair' :
                            drawingMode ? 'crosshair' : 'default'
            }}
        >
            {/* Панель инструментов */}
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
                maxWidth: '120px',
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

                {/* Инструменты редактора */}
                {mode === 'edit' && (
                    <>
                        {/* Кнопки выбора инструментов */}
                        <div style={{borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '5px'}}>
                            <div style={{fontSize: '10px', color: '#666', marginBottom: '5px', textAlign: 'center'}}>
                                Инструменты размещения:
                            </div>
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
                                📏 Шина
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
                                ⚡ Выключатель
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
                                🔋 Генератор
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
                                💡 Нагрузка
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
                                🔘 Точка соединения
                            </button>

                            {selectedTool && (
                                <div style={{fontSize: '8px', color: '#4CAF50', textAlign: 'center', marginTop: '5px'}}>
                                    💡 Кликните на холст для размещения
                                </div>
                            )}
                        </div>

                        {/* Инструменты рисования */}
                        <div style={{borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '5px'}}>
                            <div style={{fontSize: '10px', color: '#666', marginBottom: '5px', textAlign: 'center'}}>
                                Инструменты рисования:
                            </div>
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
                                📏 Рисовать линию
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
                                ⚡ Рисовать ошиновку
                            </button>

                            {/* Переключатель ортогонального режима */}
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

                            {/* Кнопка отмены рисования */}
                            {(drawingMode || selectedTool) && (
                                <button
                                    onClick={() => {
                                        cancelDrawing();
                                        cancelToolSelection();
                                    }}
                                    style={{
                                        background: '#f44336',
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
                                    ❌ Отмена
                                </button>
                            )}
                        </div>

                        {/* Кнопка соединения для двух выбранных элементов */}
                        {selectedElements.size === 2 && (() => {
                            const selectedArray = Array.from(selectedElements);
                            const element1 = elements.find(el => el.id === selectedArray[0]);
                            const element2 = elements.find(el => el.id === selectedArray[1]);
                            const isValidSelection = element1 && element2 &&
                                ((element1.type === ELEMENT_TYPES.SWITCH || element1.type === ELEMENT_TYPES.JUNCTION || element1.type === ELEMENT_TYPES.BUS) &&
                                    (element2.type === ELEMENT_TYPES.SWITCH || element2.type === ELEMENT_TYPES.JUNCTION || element2.type === ELEMENT_TYPES.BUS));
                            return isValidSelection && (
                                <button
                                    onClick={connectSelectedElements}
                                    style={{
                                        background: '#9C27B0',
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
                                    🔗 Соединить ошиновкой (Enter)
                                </button>
                            );
                        })()}

                        {/* Управление выделенными элементами */}
                        <button onClick={deleteSelected}>
                            🗑️ Удалить выбранное ({selectedElements.size || (selectedElement ? 1 : 0)})
                        </button>
                        {(selectedElement || selectedElements.size > 0) && (
                            <button onClick={() => setShowProperties(!showProperties)}>
                                {showProperties ? '❌ Скрыть свойства' : '⚙️ Свойства'}
                            </button>
                        )}

                        {/* Управление данными и отладка */}
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
                            <button
                                onClick={centerView}
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
                                🎯 В начало
                            </button>

                            {/* Отладочные функции */}
                            <button
                                onClick={debugConnections}
                                style={{
                                    background: '#9C27B0',
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
                                🐛 Отладка соединений
                            </button>
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
                                📊 Предпросмотр данных (JSON)
                            </button>
                            <button
                                onClick={() => sendToBackend()}
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
                            <div style={{fontSize: '8px', color: '#666', textAlign: 'center'}}>
                                Отправляет выключатели с соединениями
                            </div>

                            <button
                                onClick={clearStorage}
                                style={{
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    width: '100%'
                                }}
                            >
                                🗑️ Очистить всё
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Панель свойств элемента */}
            {showProperties && (selectedElementData || selectedElements.size > 0) && (
                <div style={{
                    position: 'fixed',
                    top: 150,
                    right: 10,
                    background: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    zIndex: 1000,
                    minWidth: '250px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <h3 style={{margin: 0, fontSize: '14px'}}>
                            {selectedElements.size > 1 ? `Свойства (${selectedElements.size} элементов)` :
                                `Свойства: ${
                                    selectedElementData?.type === ELEMENT_TYPES.BUS_BAR ? 'Ошиновка' :
                                        selectedElementData?.type === ELEMENT_TYPES.LINE ? 'Линия' :
                                            selectedElementData?.type === ELEMENT_TYPES.BUS ? 'Шина' :
                                                selectedElementData?.type === ELEMENT_TYPES.SWITCH ? 'Выключатель' :
                                                    selectedElementData?.type === ELEMENT_TYPES.GENERATOR ? 'Генератор' :
                                                        selectedElementData?.type === ELEMENT_TYPES.LOAD ? 'Нагрузка' :
                                                            selectedElementData?.type === ELEMENT_TYPES.JUNCTION ? 'Точка соединения' :
                                                                selectedElementData?.type
                                }`}
                        </h3>
                        <button
                            onClick={() => setShowProperties(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Групповое редактирование */}
                    {selectedElements.size > 1 ? (
                        <div style={{fontSize: '12px', color: '#666'}}>
                            Групповое редактирование {selectedElements.size} элементов
                            <br/><br/>
                            <strong>Доступные действия:</strong>
                            <br/>• Перетаскивание для перемещения
                            <br/>• Delete для удаления
                            {(() => {
                                const selectedArray = Array.from(selectedElements);
                                const element1 = elements.find(el => el.id === selectedArray[0]);
                                const element2 = elements.find(el => el.id === selectedArray[1]);
                                const areConnectable = element1 && element2 &&
                                    ((element1.type === ELEMENT_TYPES.SWITCH || element1.type === ELEMENT_TYPES.JUNCTION || element1.type === ELEMENT_TYPES.BUS) &&
                                        (element2.type === ELEMENT_TYPES.SWITCH || element2.type === ELEMENT_TYPES.JUNCTION || element2.type === ELEMENT_TYPES.BUS));
                                return areConnectable && (
                                    <>
                                        <br/>• Enter - соединить ошиновкой
                                    </>
                                );
                            })()}
                            <br/><br/>
                            Для редактирования отдельных свойств выберите один элемент.
                        </div>
                    ) : selectedElementData && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {/* Напряжение */}
                            <div>
                                <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                    Класс напряжения (кВ):
                                </label>
                                <select
                                    value={selectedElementData.voltage || 110}
                                    onChange={(e) => updateElementProperty(selectedElementData.id, 'voltage', parseInt(e.target.value))}
                                    style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                >
                                    <option value={750}>750 кВ ({VOLTAGE_COLORS[750]})</option>
                                    <option value={330}>330 кВ ({VOLTAGE_COLORS[330]})</option>
                                    <option value={110}>110 кВ ({VOLTAGE_COLORS[110]})</option>
                                    <option value={10}>10 кВ ({VOLTAGE_COLORS[10]})</option>
                                </select>
                                <div style={{
                                    fontSize: '10px',
                                    marginTop: '4px',
                                    padding: '4px',
                                    background: getElementColor(selectedElementData),
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '2px'
                                }}>
                                    Текущий цвет: {selectedElementData.voltage || 110} кВ
                                </div>
                            </div>

                            {/* Свойства линий и ошиновок */}
                            {(selectedElementData.type === ELEMENT_TYPES.LINE || selectedElementData.type === ELEMENT_TYPES.BUS_BAR) && (
                                <>
                                    <div>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Название (необязательно):
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedElementData.label || ''}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'label', e.target.value)}
                                            placeholder="Можно оставить пустым"
                                            style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                        />
                                    </div>
                                    <div>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Толщина:
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={selectedElementData.thickness || (selectedElementData.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4)}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'thickness', parseInt(e.target.value))}
                                            style={{width: '100%'}}
                                        />
                                        <div style={{fontSize: '10px', color: '#666', textAlign: 'center'}}>
                                            {selectedElementData.thickness || (selectedElementData.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4)}px
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#2e7d32',
                                        textAlign: 'center',
                                        marginTop: '5px'
                                    }}>
                                        💡 Для продления: выберите элемент и перетащите зеленый маркер
                                    </div>
                                </>
                            )}

                            {/* Свойства шин */}
                            {selectedElementData.type === ELEMENT_TYPES.BUS && (
                                <>
                                    <div>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Подпись:
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedElementData.label || ''}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'label', e.target.value)}
                                            style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                        />
                                    </div>
                                    <div>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Позиция подписи:
                                        </label>
                                        <select
                                            value={selectedElementData.labelPosition || LABEL_POSITIONS.TOP}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'labelPosition', e.target.value)}
                                            style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                        >
                                            <option value={LABEL_POSITIONS.TOP}>Сверху</option>
                                            <option value={LABEL_POSITIONS.BOTTOM}>Снизу</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Подписи для остальных элементов */}
                            {selectedElementData.type !== ELEMENT_TYPES.LINE && selectedElementData.type !== ELEMENT_TYPES.BUS_BAR && selectedElementData.type !== ELEMENT_TYPES.BUS && selectedElementData.type !== ELEMENT_TYPES.JUNCTION && (
                                <div>
                                    <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                        Подпись:
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedElementData.label || ''}
                                        onChange={(e) => updateElementProperty(selectedElementData.id, 'label', e.target.value)}
                                        style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                    />
                                </div>
                            )}

                            {/* Подсказка для узлов */}
                            {selectedElementData.type === ELEMENT_TYPES.JUNCTION && (
                                <div style={{fontSize: '10px', color: '#666', textAlign: 'center'}}>
                                    💡 Точка соединения используется для соединения с выключателями ошиновкой
                                </div>
                            )}

                            {/* Размеры для прямоугольных элементов */}
                            {selectedElementData.type !== ELEMENT_TYPES.LINE && selectedElementData.type !== ELEMENT_TYPES.BUS_BAR && selectedElementData.type !== ELEMENT_TYPES.SWITCH && selectedElementData.type !== ELEMENT_TYPES.JUNCTION && (
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <div style={{flex: 1}}>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Ширина (мм):
                                        </label>
                                        <input
                                            type="number"
                                            value={Math.round(selectedElementData.width / 10)}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'width', parseInt(e.target.value) * 10)}
                                            style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                        />
                                    </div>
                                    <div style={{flex: 1}}>
                                        <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                            Высота (мм):
                                        </label>
                                        <input
                                            type="number"
                                            value={Math.round(selectedElementData.height / 10)}
                                            onChange={(e) => updateElementProperty(selectedElementData.id, 'height', parseInt(e.target.value) * 10)}
                                            style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Статус выключателя */}
                            {selectedElementData.type === ELEMENT_TYPES.SWITCH && (
                                <div>
                                    <label style={{fontSize: '12px', display: 'block', marginBottom: '4px'}}>
                                        Статус:
                                    </label>
                                    <select
                                        value={selectedElementData.status}
                                        onChange={(e) => updateElementProperty(selectedElementData.id, 'status', e.target.value)}
                                        style={{width: '100%', padding: '4px', fontSize: '12px'}}
                                    >
                                        <option value="closed">Включен</option>
                                        <option value="open">Выключен</option>
                                    </select>
                                    <div style={{fontSize: '10px', color: '#666', marginTop: '4px'}}>
                                        Размер выключателя фиксированный
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Canvas элемент */}
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onWheel={handleWheel}
                style={{
                    border: '1px solid #ccc',
                    // Динамическое изменение курсора
                    cursor: selectedTool ? 'crosshair' :
                        isPanning ? 'grabbing' :
                            drawingLine || extendingElement || drawingMode ? 'crosshair' :
                                selectionRect ? 'crosshair' :
                                    draggingElement ? 'grabbing' :
                                        resizingElement ? 'nw-resize' : 'default',
                    display: 'block',
                    position: 'fixed',
                    top: 0,
                    left: 0
                }}
            />
        </div>
    );
};

export default EnergyGrid;