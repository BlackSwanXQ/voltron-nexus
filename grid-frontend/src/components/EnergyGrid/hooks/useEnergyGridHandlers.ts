// src/components/EnergyGrid/hooks/useEnergyGridHandlers.ts
import { useCallback } from 'react';
import { findElementAt, isElementInSelection, isInExtendArea, isInResizeArea } from '../utils/elementUtils';
import { getOrthogonalCoordinates } from '../utils/geometry';
import { DEFAULT_SIZES } from '../shared/constants';
import { ELEMENT_TYPES } from '../shared/ElementTypes';
import { useEnergyGrid } from "./useEnergyGrid";
import {BaseElement, Point} from "../types/types";

// Хук обработчиков событий мыши для канваса энергосети
// Получает все состояния и методы из основного хука useEnergyGrid
export const useEnergyGridHandlers = (
    energyGrid: ReturnType<typeof useEnergyGrid>
) => {

    // ДЕСТРУКТУРИЗАЦИЯ: извлекаем все необходимые состояния и методы из energyGrid
    // Каждая переменная теперь доступна напрямую, а не через energyGrid.переменная
    const {
        // Canvas - состояние канваса
        canvasRef,              // ссылка на DOM элемент canvas
        getCanvasCoordinates,   // функция преобразования координат мыши в координаты канваса
        setViewOffset,          // установка смещения вида (для скроллинга/панорамирования)
        setCanvasSize,          // установка размера канваса
        isPanning,              // флаг: происходит ли панорамирование
        setIsPanning,           // установка флага панорамирования
        panStart,               // начальная точка панорамирования
        setPanStart,            // установка начальной точки панорамирования
        viewOffset,             // текущее смещение вида
        canvasSize,             // текущий размер канваса

        // Elements - состояние элементов на канвасе
        elements,               // массив всех элементов
        setElements,            // функция обновления массива элементов
        selectedElement,        // id выбранного элемента (одиночный выбор)
        setSelectedElement,     // установка выбранного элемента
        selectedElements,       // Set id множественного выбора
        setSelectedElements,    // установка множественного выбора
        draggingElement,        // элемент, который перетаскивается
        setDraggingElement,     // установка перетаскиваемого элемента
        resizingElement,        // элемент, который изменяется в размере
        setResizingElement,     // установка изменяемого элемента
        dragOffset,             // смещение между курсором и элементом при перетаскивании
        setDragOffset,          // установка смещения перетаскивания
        extendingElement,       // линия, которая продлевается
        setExtendingElement,    // установка продлеваемой линии
        extendStart,            // начальные данные для продления
        setExtendStart,         // установка начальных данных продления
        addElement,             // функция добавления нового элемента
        toggleSwitch,           // переключение состояния выключателя

        // Drawing - состояние рисования
        drawingLine,            // данные о рисуемой линии (превью)
        setDrawingLine,         // установка данных рисуемой линии
        drawingMode,            // режим рисования ('line' или 'bus_bar' или null)
        setDrawingMode,         // установка режима рисования
        orthogonalMode,         // флаг ортогонального режима
        selectedTool,           // выбранный инструмент (bus, switch, generator и т.д.)
        setToolPreview,         // установка превью инструмента

        // Selection - состояние выделения
        selectionRect,          // прямоугольник выделения
        isSelecting,            // флаг: происходит ли выделение
        startSelection,         // начало выделения (клик без элемента)
        updateSelection,        // обновление прямоугольника выделения при движении мыши
        endSelection,           // завершение выделения
        clearSelection,         // очистка выделения
        setSelectionRect,       // установка прямоугольника выделения

        // Mode - режим работы
        mode,                   // текущий режим ('edit' или 'simulation')
        setShowProperties,      // показ/скрытие панели свойств

        // Actions - дополнительные действия
        handleCreateJunction    // создание точки соединения
    } = energyGrid;

    // ОБРАБОТЧИК НАЖАТИЯ КНОПКИ МЫШИ НА КАНВАС
    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {

        // Если не в режиме редактирования - игнорируем
        if (mode !== 'edit') return;

        // Получаем ссылку на канвас
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Преобразуем координаты мыши (окно браузера) в координаты канваса
        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        // ПАННОМИРОВАНИЕ: если нажата средняя кнопка мыши ИЛИ Ctrl+левая кнопка
        // Средняя кнопка = колесо мыши (button === 1)
        // Ctrl+левая кнопка = альтернативный способ панорамирования
        if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
            setIsPanning(true);                        // включаем режим панорамирования
            setPanStart({ x: event.clientX, y: event.clientY }); // запоминаем начальную точку
            return;                                     // выходим - дальше не обрабатываем
        }

        // Игнорируем все кнопки кроме левой (button === 0)
        if (event.button !== 0) return;

        // СЛУЧАЙ 1: Если уже продлеваем линию - завершаем продление
        // Это второй клик при продлении (первый клик начал продление)
        if (extendingElement) {
            setExtendingElement(null); // просто сбрасываем состояние
            return;                    // выходим
        }

        // СЛУЧАЙ 2: Если уже рисуем линию (в режиме рисования) - завершаем рисование
        // Это второй клик при рисовании линии (первый клик поставил начальную точку)
        if (drawingLine && drawingMode) {
            // Определяем конечные координаты с учетом ортогонального режима
            let finalX = x;
            let finalY = y;

            // Если включен ортогональный режим - корректируем координаты
            if (orthogonalMode) {
                const orthogonalCoords = getOrthogonalCoordinates(
                    drawingLine.startX,   // от начальной точки
                    drawingLine.startY,
                    x,                    // до текущего положения курсора
                    y
                );
                finalX = orthogonalCoords.x;  // получаем "привязанные" координаты
                finalY = orthogonalCoords.y;
            }

            // Создаем новый элемент-линию на основе превью
            const newElement: BaseElement = {
                id: `${drawingMode}-${Date.now()}`, // уникальный ID
                type: drawingMode === 'bus_bar' ? ELEMENT_TYPES.BUS_BAR : ELEMENT_TYPES.LINE,
                x: drawingLine.startX,      // начальная X
                y: drawingLine.startY,      // начальная Y
                width: finalX - drawingLine.startX,  // ширина = разница по X
                height: finalY - drawingLine.startY, // высота = разница по Y
                voltage: 110,               // напряжение по умолчанию
                thickness: drawingMode === 'bus_bar' ? 4 : 4 // толщина линии
            };

            // Добавляем новый элемент в массив
            setElements(prev => [...prev, newElement]);
                // addElement(selectedTool, x, y)
            // addElement("bus_bar", drawingLine.startX, drawingLine.startY)

            // Выделяем созданный элемент
            setSelectedElement(newElement.id);
            setSelectedElements(new Set([newElement.id]));

            // Сбрасываем режим рисования
            setDrawingMode(null);
            setDrawingLine(null);

            return; // завершаем обработку
        }

        // СЛУЧАЙ 3: Если выбран инструмент (шина, выключатель и т.д.) - добавляем элемент
        if (selectedTool) {
            addElement(selectedTool, x, y); // добавляем элемент в позицию курсора
            return; // завершаем обработку
        }

        // Поиск элемента под курсором
        const clickedElement = findElementAt(elements, x, y);

        // СЛУЧАЙ 4: Кликнули по существующему элементу
        if (clickedElement) {
            // Проверяем, является ли элемент линией или ошиновкой
            if (clickedElement.type === ELEMENT_TYPES.LINE || clickedElement.type === ELEMENT_TYPES.BUS_BAR) {
                // Проверяем, попали ли в зону продления (концы линии)
                const extendArea = isInExtendArea(clickedElement, x, y);

                // Если попали в зону продления (в начало или конец линии)
                if (extendArea && (extendArea.atStart || extendArea.atEnd)) {
                    // НАЧИНАЕМ ПРОДЛЕНИЕ ЛИНИИ (ПЕРВЫЙ КЛИК)

                    // Вычисляем координаты конца линии
                    const originalEndX = clickedElement.x + clickedElement.width;
                    const originalEndY = clickedElement.y + clickedElement.height;

                    // Создаем расширенный объект линии с дополнительными свойствами
                    // для отслеживания процесса продления
                    setExtendingElement({
                        ...clickedElement, // копируем все свойства исходной линии

                        // Дополнительные служебные свойства:
                        extendFromStart: extendArea.atStart, // true = продлеваем с начала, false = с конца

                        // Сохраняем ИСХОДНЫЕ координаты (не будут меняться)
                        originalX: clickedElement.x,          // начальная X
                        originalY: clickedElement.y,          // начальная Y
                        originalEndX: originalEndX,           // конечная X
                        originalEndY: originalEndY,           // конечная Y
                        originalWidth: clickedElement.width,  // ширина
                        originalHeight: clickedElement.height,// высота

                        // Точка отсчета для ортогонального режима:
                        // Если продлеваем с начала - фиксируем конец
                        // Если продлеваем с конца - фиксируем начало
                        orthogonalStartX: extendArea.atStart ? originalEndX : clickedElement.x,
                        orthogonalStartY: extendArea.atStart ? originalEndY : clickedElement.y
                    } as BaseElement); // as BaseElement - приведение типа (костыль для TypeScript)

                    return; // завершаем обработку
                }
            }

            // Проверяем, попали ли в зону изменения размера
            if (isInResizeArea(clickedElement, x, y)) {
                setResizingElement(clickedElement); // начинаем изменение размера
            } else {
                // Обычный клик по элементу (не на зону продления/изменения размера)

                // Если зажата клавиша Shift - работа с множественным выделением
                if (event.shiftKey) {
                    setSelectedElements(prev => {
                        const newSelection = new Set(prev); // копируем текущее выделение

                        // Если элемент уже выделен - убираем его
                        // Если не выделен - добавляем
                        if (newSelection.has(clickedElement.id)) {
                            newSelection.delete(clickedElement.id);
                        } else {
                            newSelection.add(clickedElement.id);
                        }
                        return newSelection;
                    });
                    setSelectedElement(null); // сбрасываем одиночное выделение
                    return;
                } else {
                    // Обычный клик без Shift - начинаем перетаскивание
                    setDraggingElement(clickedElement); // элемент для перетаскивания

                    // Вычисляем смещение между курсором и элементом
                    // чтобы элемент "прилип" к курсору в нужном месте
                    setDragOffset({
                        x: x - clickedElement.x, // смещение по X
                        y: y - clickedElement.y  // смещение по Y
                    });

                    // Обновляем выделение
                    if (selectedElements.has(clickedElement.id)) {
                        // Если элемент уже в множественном выделении - делаем его одиночным
                        setSelectedElement(clickedElement.id);
                    } else {
                        // Иначе выделяем только этот элемент
                        setSelectedElement(clickedElement.id);
                        setSelectedElements(new Set([clickedElement.id]));
                    }
                }
            }
        } else {
            // СЛУЧАЙ 5: Кликнули по пустому месту (не попали в элемент)

            // Если активен режим рисования - начинаем новую линию
            if (drawingMode) {
                setDrawingLine({
                    startX: x,   // начальная точка
                    startY: y,
                    currentX: x, // текущая точка (будет меняться при движении мыши)
                    currentY: y
                } as any); // превью линии
            } else {
                // Если не рисуем - начинаем прямоугольное выделение
                startSelection(x, y); // начальная точка выделения
                setSelectedElement(null);    // сбрасываем одиночное выделение
                setSelectedElements(new Set()); // сбрасываем множественное выделение
            }
            setShowProperties(false); // скрываем панель свойств
        }
    }, [
        // ЗАВИСИМОСТИ хука useCallback:
        // Все переменные и функции, которые используются внутри handleMouseDown
        mode, elements, selectedTool, drawingMode, drawingLine, selectedElements, selectedElement, addElement,
        getCanvasCoordinates, setIsPanning, setPanStart, setExtendingElement, setExtendStart,
        setResizingElement, setSelectedElements, setSelectedElement, setDraggingElement, setDragOffset,
        setDrawingLine, startSelection, setShowProperties, orthogonalMode, setElements,
        setSelectedElements, setDrawingMode, extendingElement
    ]);

    // ОБРАБОТЧИК ДВИЖЕНИЯ МЫШИ ПО КАНВАСУ
    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Преобразуем координаты мыши в координаты канваса
        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        let x = coords.x; // используем let, т.к. координаты могут меняться (ортогональный режим)
        let y = coords.y;

        // ПРЕВЬЮ ИНСТРУМЕНТА: если выбран инструмент (шина, выключатель и т.д.)
        if (selectedTool) {
            // Получаем размер по умолчанию для выбранного инструмента
            const size = DEFAULT_SIZES[selectedTool];

            // Центрируем превью относительно курсора
            const centeredX = x - size.width / 2;
            const centeredY = y - size.height / 2;

            // Устанавливаем позицию превью
            setToolPreview({ x: centeredX, y: centeredY } as Point);
        } else {
            setToolPreview(null); // скрываем превью, если инструмент не выбран
        }

        // ПАННОМИРОВАНИЕ: если активно
        if (isPanning) {
            // Вычисляем смещение мыши от начальной точки
            const deltaX = event.clientX - panStart.x;
            const deltaY = event.clientY - panStart.y;

            // Обновляем смещение вида (двигаем "камеру")
            setViewOffset(prev => ({
                x: Math.max(0, prev.x - deltaX),  // не уходим за левую границу
                y: Math.max(0, prev.y - deltaY)   // не уходим за верхнюю границу
            }));

            // Обновляем начальную точку для следующего движения
            setPanStart({ x: event.clientX, y: event.clientY });
        }
        // ПЕРЕТАСКИВАНИЕ ЭЛЕМЕНТОВ: если перетаскиваем элемент и есть множественное выделение
        else if (draggingElement && selectedElements.size > 0) {
            // Вычисляем смещение курсора от позиции элемента с учетом dragOffset
            const deltaX = x - (draggingElement.x + dragOffset.x);
            const deltaY = y - (draggingElement.y + dragOffset.y);

            // Обновляем все выделенные элементы
            setElements(prev => prev.map(el => {
                if (selectedElements.has(el.id)) {
                    return {
                        ...el,
                        x: Math.max(0, el.x + deltaX), // двигаем по X (не уходим за 0)
                        y: Math.max(0, el.y + deltaY)  // двигаем по Y (не уходим за 0)
                    };
                }
                return el;
            }));

            // Обновляем сам draggingElement для последующих расчетов
            setDraggingElement(prev => prev ? {
                ...prev,
                x: prev.x + deltaX, // новая позиция X
                y: prev.y + deltaY  // новая позиция Y
            } : null);
        }
        // ПЕРЕТАСКИВАНИЕ ОДНОГО ЭЛЕМЕНТА: если перетаскиваем без множественного выделения
        else if (draggingElement) {
            setElements(prev => prev.map(el =>
                el.id === draggingElement.id
                    ? {
                        ...el,
                        // Позиционируем элемент относительно курсора с учетом смещения
                        x: Math.max(0, x - dragOffset.x),
                        y: Math.max(0, y - dragOffset.y)
                    }
                    : el
            ));
        }
        // ИЗМЕНЕНИЕ РАЗМЕРА: если активен режим изменения размера
        else if (resizingElement) {
            setElements(prev => prev.map(el =>
                el.id === resizingElement.id
                    ? {
                        ...el,
                        // Новая ширина/высота = разница между курсором и началом элемента
                        width: Math.max(20, x - el.x),    // минимальная ширина 20px
                        height: Math.max(6, y - el.y)     // минимальная высота 6px
                    }
                    : el
            ));
        }
        // ПРЕВЬЮ РИСУЕМОЙ ЛИНИИ: если в режиме рисования (первый клик был, второй еще нет)
        else if (drawingLine && drawingMode) {
            let currentX = x;
            let currentY = y;

            // Если включен ортогональный режим - корректируем координаты
            if (orthogonalMode) {
                const orthogonalCoords = getOrthogonalCoordinates(
                    drawingLine.startX,   // от начальной точки
                    drawingLine.startY,
                    x,                    // до текущего положения курсора
                    y
                );
                currentX = orthogonalCoords.x;
                currentY = orthogonalCoords.y;
            }

            // Обновляем превью линии (линия "тянется" за курсором)
            setDrawingLine(prev => prev ? {
                ...prev,
                currentX: currentX, // текущая конечная точка X
                currentY: currentY  // текущая конечная точка Y
            } : null);
        }
        // ПРОДЛЕНИЕ ЛИНИИ: если активен режим продления
        else if (extendingElement) {
            // Извлекаем служебные свойства, добавленные при начале продления
            // as any - костыль для TypeScript, т.к. эти свойства не в BaseElement
            const extendFromStart = (extendingElement as any).extendFromStart;
            const originalEndX = (extendingElement as any).originalEndX;
            const originalEndY = (extendingElement as any).originalEndY;
            const originalX = (extendingElement as any).originalX;
            const originalY = (extendingElement as any).originalY;

            // Если включен ортогональный режим - корректируем координаты курсора
            if (orthogonalMode) {
                const orthogonalStartX = (extendingElement as any).orthogonalStartX;
                const orthogonalStartY = (extendingElement as any).orthogonalStartY;

                // Получаем "привязанные" координаты относительно фиксированной точки
                const orthogonalCoords = getOrthogonalCoordinates(
                    orthogonalStartX, // фиксированная точка (начало или конец)
                    orthogonalStartY,
                    x,                // текущий курсор
                    y
                );
                x = orthogonalCoords.x; // обновляем X
                y = orthogonalCoords.y; // обновляем Y
            }

            // Обновляем линию в массиве элементов
            setElements(prev => prev.map(el => {
                if (el.id === extendingElement.id) {
                    // ПРОДЛЕНИЕ С НАЧАЛА: двигаем начало, конец фиксирован
                    if (extendFromStart) {
                        // Вычисляем новую ширину/высоту
                        const newWidth = originalEndX - x;   // от курсора до фиксированного конца
                        const newHeight = originalEndY - y;

                        // Проверяем направление
                        if (newWidth >= 0) {
                            // Курсор слева от конца - нормальная ситуация
                            return {
                                ...el,
                                x: x,           // новое начало
                                y: y,
                                width: newWidth,  // новая ширина
                                height: newHeight // новая высота
                            };
                        } else {
                            // Курсор справа от конца - меняем начало и конец местами
                            return {
                                ...el,
                                x: originalEndX,    // теперь начало = старый конец
                                y: originalEndY,
                                width: -newWidth,   // ширина положительная
                                height: -newHeight  // высота положительная
                            };
                        }
                    } else {
                        // ПРОДЛЕНИЕ С КОНЦА: двигаем конец, начало фиксировано
                        const newWidth = x - originalX;   // от фиксированного начала до курсора
                        const newHeight = y - originalY;

                        if (newWidth >= 0) {
                            // Курсор справа от начала - нормальная ситуация
                            return {
                                ...el,
                                x: originalX,    // начало не меняется
                                y: originalY,
                                width: newWidth,  // новая ширина
                                height: newHeight // новая высота
                            };
                        } else {
                            // Курсор слева от начала - меняем начало и конец местами
                            return {
                                ...el,
                                x: x,            // теперь начало = курсор
                                y: y,
                                width: -newWidth,   // ширина положительная
                                height: -newHeight  // высота положительная
                            };
                        }
                    }
                }
                return el; // остальные элементы не меняем
            }));
        }
        // ВЫДЕЛЕНИЕ ОБЛАСТИ: если активно прямоугольное выделение
        else if (isSelecting && selectionRect) {
            updateSelection(x, y); // обновляем прямоугольник до текущей позиции курсора
        }
    }, [
        // ЗАВИСИМОСТИ хука useCallback для handleMouseMove
        isPanning, panStart, draggingElement, dragOffset, resizingElement, drawingLine, drawingMode,
        getCanvasCoordinates, selectedElements, isSelecting, selectionRect, extendingElement,
        orthogonalMode, selectedTool, setViewOffset, setPanStart, setElements, setDraggingElement,
        setDrawingLine, updateSelection, setToolPreview
    ]);

    // ОБРАБОТЧИК ОТПУСКАНИЯ КНОПКИ МЫШИ
    const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Завершаем панорамирование
        if (isPanning) {
            setIsPanning(false);
            return;
        }

        // Завершаем перетаскивание
        if (draggingElement) {
            setDraggingElement(null);
        }

        // Завершаем изменение размера
        if (resizingElement) {
            setResizingElement(null);
        }

        // Завершаем выделение области
        if (isSelecting && selectionRect) {
            endSelection(); // завершаем процесс выделения

            // Определяем, какие элементы попали в прямоугольник выделения
            const selectedIds = new Set<string>();
            elements.forEach(element => {
                if (isElementInSelection(element, selectionRect)) {
                    selectedIds.add(element.id);
                }
            });

            // Если нашли элементы - выделяем их
            if (selectedIds.size > 0) {
                setSelectedElements(selectedIds);     // множественное выделение
                setSelectedElement(null);            // сбрасываем одиночное
            }

            clearSelection(); // очищаем прямоугольник выделения
        }

        // Примечание: завершение продления линии происходит в handleMouseDown
        // (при втором клике), поэтому здесь не обрабатывается
    }, [
        // ЗАВИСИМОСТИ хука useCallback для handleMouseUp
        isPanning, isSelecting, selectionRect, elements, draggingElement, resizingElement,
        setIsPanning, setDraggingElement, setResizingElement,
        endSelection, clearSelection, setSelectedElements, setSelectedElement
    ]);

    // ОБРАБОТЧИК КОЛЕСИКА МЫШИ (СКРОЛЛИНГ/ЗУМ)
    const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>): void => {
        event.preventDefault(); // предотвращаем стандартный скроллинг страницы

        // Обновляем смещение вида по вертикали
        setViewOffset(prev => {
            const newY = prev.y + event.deltaY; // deltaY - количество прокрутки
            return {
                x: prev.x,                    // горизонталь не меняем
                y: Math.max(0, newY)         // не уходим выше 0
            };
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // АВТОРАСШИРЕНИЕ КАНВАСА: если приближаемся к нижней границе
        const rect = canvas.getBoundingClientRect();
        const visibleBottom = viewOffset.y + rect.height; // нижняя граница видимой области

        // Если до нижнего края канваса осталось меньше 500px - расширяем канвас
        if (visibleBottom > canvasSize.height - 500) {
            setCanvasSize(prev => ({
                ...prev,
                height: prev.height + 1000 // добавляем 1000px высоты
            }));
        }
    }, [viewOffset, canvasSize, setViewOffset, setCanvasSize]);

    // ОБРАБОТЧИК ДВОЙНОГО КЛИКА
    const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const coords = getCanvasCoordinates(event.clientX, event.clientY);
        const x = coords.x;
        const y = coords.y;

        // Ищем элемент под курсором
        const clickedElement = findElementAt(elements, x, y);

        if (clickedElement) {
            // Двойной клик по выключателю - переключаем его состояние
            if (clickedElement.type === ELEMENT_TYPES.SWITCH) {
                toggleSwitch(clickedElement.id);
            }
        } else {
            // Двойной клик по пустому месту - создаем точку соединения
            handleCreateJunction(x, y, 110);
        }
    }, [elements, toggleSwitch, getCanvasCoordinates, handleCreateJunction]);

    // ВОЗВРАЩАЕМ ОБРАБОТЧИКИ ДЛЯ ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТЕ
    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        handleDoubleClick
    };
};