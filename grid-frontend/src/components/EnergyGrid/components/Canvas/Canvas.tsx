import React, {useCallback, useEffect} from 'react';
import {ELEMENT_TYPES} from '../../shared/ElementTypes';
import {getColorByVoltage} from '../../shared/VoltageColors';
import {DEFAULT_SIZES} from '../../shared/constants';
import {areBusBarsConnectedByEnds, getBusBarAndBusIntersection, getBusBarsIntersection} from "../../utils/elementUtils";
import {BaseElement, CanvasProps} from '../../types/types';

export const Canvas: React.FC<CanvasProps> = ({
                                                  canvasRef,
                                                  elements,
                                                  selectedElement,
                                                  selectedElements,
                                                  connections,
                                                  drawingLine,
                                                  drawingMode,
                                                  viewOffset,
                                                  canvasSize,
                                                  selectionRect,
                                                  extendingElement,
                                                  extendStart,
                                                  orthogonalMode,
                                                  selectedTool,
                                                  toolPreview,
                                                  getElementColor,
                                                  drawGrid,
                                                  getOrthogonalCoordinates,
                                                  handleMouseDown,
                                                  handleMouseMove,
                                                  handleMouseUp,
                                                  handleDoubleClick,
                                                  isPanning,
                                                  draggingElement,
                                                  resizingElement,
                                                  handleWheel,
                                                  connectionMode
                                              }: CanvasProps) => {
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-viewOffset.x, -viewOffset.y);

        drawGrid(ctx);

        // Отрисовка соединений  - НЕ ПОНЯТНО
        // connections.forEach(conn => {
        //     ctx.strokeStyle = '#000';
        //     ctx.lineWidth = 3;
        //     ctx.beginPath();
        //     ctx.moveTo(conn.from.x, conn.from.y);
        //     ctx.lineTo(conn.to.x, conn.to.y);
        //     ctx.stroke();
        //
        //     if (conn.current) {
        //         const midX = (conn.from.x + conn.to.x) / 2;
        //         const midY = (conn.from.y + conn.to.y) / 2;
        //         ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        //         ctx.fillRect(midX - 20, midY - 8, 40, 16);
        //         ctx.fillStyle = '#000';
        //         ctx.font = '10px Arial';
        //         ctx.textAlign = 'center';
        //         ctx.fillText(`${conn.current}A`, midX, midY + 4);
        //     }
        // });

        // Пунктирная линия показывающая направление при рисовании ошиновки или линии
        if (drawingLine) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();

            let currentX = drawingLine.currentX;
            let currentY = drawingLine.currentY;

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

        // Пунктирная линия при изменении длины или перемещении конца ошиновки или линии
        if (extendingElement && extendStart) {
            ctx.strokeStyle = getElementColor(extendingElement);
            ctx.lineWidth = extendingElement.thickness || (extendingElement.type === ELEMENT_TYPES.BUS_BAR ? 6 : 4);
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(extendStart.x, extendStart.y);
            ctx.lineTo(extendStart.currentX, extendStart.currentY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Пердпросмотр элемента при его выборе на панели инструментов
        if (selectedTool && toolPreview) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            const previewColor = getColorByVoltage(110);
            const {x, y} = toolPreview;
            const size = DEFAULT_SIZES[selectedTool] || {width: 50, height: 50};

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
                        selectedTool === ELEMENT_TYPES.GENERATOR ? 'Generator' : 'Нагрузка',
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

        // Отрисовка прямоугольника при выделении нескольких элементов
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

        // Отрисовка элементов
        elements.forEach(element => {
            ctx.save();
            const isSelected = selectedElements.has(element.id) || selectedElement === element.id;
            const fillColor = getElementColor(element);

            switch (element.type) {
                case ELEMENT_TYPES.BUS:
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        drawEdging(ctx, element)
                    }

                    if (element.label) {
                        elementSignature(ctx, element);
                    }
                    break;

                case ELEMENT_TYPES.SWITCH:
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        drawEdging(ctx, element);
                    }
                    if (element.label) {
                        elementSignature(ctx, element)
                    }
                    break;

                case ELEMENT_TYPES.GENERATOR:
                case ELEMENT_TYPES.LOAD:
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    if (isSelected) {
                        drawEdging(ctx, element)
                    }
                    elementSignature(ctx, element)
                    break;

                case ELEMENT_TYPES.JUNCTION:
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
                        drawEdging(ctx, element)
                    }
                    break;

                case ELEMENT_TYPES.LINE:
                    const lineThickness = element.thickness || 4;
                    ctx.strokeStyle = fillColor;
                    ctx.lineWidth = lineThickness;
                    ctx.beginPath();
                    ctx.moveTo(element.x, element.y);
                    ctx.lineTo(element.x + element.width, element.y + element.height);
                    ctx.stroke();

                    if (isSelected) {
                        drawEdging(ctx, element)
                    }

                    if (element.label) {
                        elementSignature(ctx, element)
                    }
                    break;

                case ELEMENT_TYPES.BUS_BAR:
                    const busBarThickness = element.thickness || 6;
                    ctx.strokeStyle = fillColor;
                    ctx.lineWidth = busBarThickness;
                    ctx.beginPath();
                    ctx.moveTo(element.x, element.y);
                    ctx.lineTo(element.x + element.width, element.y + element.height);
                    ctx.stroke();

                    if (isSelected) {
                        drawEdging(ctx, element)
                    }
                    if (element.label) {
                        elementSignature(ctx, element)
                    }

                    // Точки для ошиновок с ошиновками - только если не соединены концами
                    elements.forEach(otherElement => {
                        if (otherElement.id !== element.id && otherElement.type === ELEMENT_TYPES.BUS_BAR) {
                            const intersection = getBusBarsIntersection(element, otherElement);
                            if (intersection && !areBusBarsConnectedByEnds(element, otherElement)) {
                                ctx.fillStyle = '#0288d1';
                                ctx.beginPath();
                                ctx.arc(intersection.x, intersection.y, 5, 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        }
                    });

                    // Точки для ошиновок с шинами - всегда
                    elements.forEach(otherElement => {
                        if (otherElement.id !== element.id && otherElement.type === ELEMENT_TYPES.BUS) {
                            const intersection = getBusBarAndBusIntersection(element, otherElement);
                            if (intersection) {
                                ctx.fillStyle = '#FFFFFF';
                                ctx.beginPath();
                                ctx.arc(intersection.x, intersection.y, 5, 0, 2 * Math.PI);
                                ctx.fill();
                                ctx.strokeStyle = '#000000';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                        }
                    });

                    break;
            }
            // Квадратик в правом нижнем углу шины для расширения
            if (isSelected && element.type !== ELEMENT_TYPES.LINE && element.type !== ELEMENT_TYPES.BUS_BAR && element.type !== ELEMENT_TYPES.SWITCH && element.type !== ELEMENT_TYPES.JUNCTION) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(
                    element.x + element.width - 4,
                    element.y + element.height - 4,
                    8, 8
                );
            }

            // Кружоки на концах линий и ошиновок для растягивания
            if (isSelected && (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR)) {
                const endX = element.x + element.width;
                const endY = element.y + element.height;

                // Окантовка для начала линии
                ctx.strokeStyle = '#FF9800';  // Цвет рамки
                ctx.lineWidth = 2;            // Толщина линии
                ctx.beginPath();
                ctx.strokeRect(element.x - 6, element.y - 6, 12, 12);  // Рамка вместо заливки
                ctx.stroke();

                // Окантовка для конца линии
                ctx.strokeStyle = '#FF9800';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.strokeRect(element.x + element.width - 6, element.y + element.height - 6, 12, 12);
                ctx.stroke();
            }
            ctx.restore();
        });
        ctx.restore();
    }, [
        // 📋 ВСЕ зависимости функции draw
        canvasRef.current,
        elements,
        connections,
        selectedElement,
        selectedElements,
        drawingLine,
        drawingMode,
        viewOffset,
        selectionRect,
        extendingElement,
        extendStart,
        orthogonalMode,
        selectedTool,
        toolPreview,
        getElementColor,
        drawGrid,
        getOrthogonalCoordinates
    ]);


    // Окантовака элемента при выделении его мышью
    const drawEdging = (ctx: CanvasRenderingContext2D, element: BaseElement) => {
        ctx.save();

        if (element.type === ELEMENT_TYPES.SWITCH ||
            element.type === ELEMENT_TYPES.GENERATOR ||
            element.type === ELEMENT_TYPES.LOAD ||
            element.type === ELEMENT_TYPES.BUS) {

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);

            const padding = 4;
            const selectionX = element.x - padding;
            const selectionY = element.y - padding;
            const selectionWidth = element.width + (padding * 2);
            const selectionHeight = element.height + (padding * 2);

            ctx.strokeRect(selectionX, selectionY, selectionWidth, selectionHeight);
        } else if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
            // ТОЧНО ТАК ЖЕ КАК У ВЫКЛЮЧАТЕЛЕЙ - с отступами
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);

            // Создаем "прямоугольник" вокруг линии
            const padding = 4;
            const x1 = element.x;
            const y1 = element.y;
            const x2 = element.x + element.width;
            const y2 = element.y + element.height;

            // Находим перпендикулярное направление
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length > 0) {
                const nx = -dy / length * padding;
                const ny = dx / length * padding;

                // 4 точки "прямоугольника" вокруг линии
                const points = [
                    {x: x1 + nx, y: y1 + ny},
                    {x: x2 + nx, y: y2 + ny},
                    {x: x2 - nx, y: y2 - ny},
                    {x: x1 - nx, y: y1 - ny}
                ];

                // Рисуем прямоугольник
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.lineTo(points[2].x, points[2].y);
                ctx.lineTo(points[3].x, points[3].y);
                ctx.closePath();
                ctx.stroke();
            }
        } else if (element.type === ELEMENT_TYPES.JUNCTION) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);

            ctx.beginPath();
            ctx.arc(
                element.x + element.width / 2,
                element.y + element.height / 2,
                (element.width / 2) + 4,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        ctx.restore();
    };

    // Подпист элемента
    const elementSignature = (ctx: CanvasRenderingContext2D, element: BaseElement) => {
        if (element.type == ELEMENT_TYPES.LINE ||
            element.type == ELEMENT_TYPES.BUS_BAR ||
            element.type == ELEMENT_TYPES.GENERATOR ||
            element.type == ELEMENT_TYPES.LOAD
        ) {
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

        if (element.type == ELEMENT_TYPES.SWITCH) {
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

        if (element.type == ELEMENT_TYPES.BUS) {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let labelX = element.x + element.width / 2;
            let labelY = element.y + element.height / 2;

            // Позиционирование метки в зависимости от labelPosition
            switch (element.labelPosition) {
                case 'top':
                    labelY = element.y - 15;
                    break;
                case 'bottom':
                    labelY = element.y + element.height + 15;
                    break;
                case 'left':
                    labelX = element.x - 10;
                    labelY = element.y + element.height / 2;
                    ctx.textAlign = 'right';
                    break;
                case 'right':
                    labelX = element.x + element.width + 10;
                    labelY = element.y + element.height / 2;
                    ctx.textAlign = 'left';
                    break;
            }

            // Фон для текста для лучшей читаемости
            const textMetrics = ctx.measureText(element.label);
            const textWidth = textMetrics.width;
            const textHeight = 16;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
                labelX - textWidth / 2 - 4,
                labelY - textHeight / 2 - 2,
                textWidth + 8,
                textHeight + 4
            );

            // Текст
            ctx.fillStyle = '#000';
            ctx.fillText(element.label, labelX, labelY);
        }
    }


    // ✅ Теперь useEffect работает правильно
    useEffect(() => {
        draw();
    }, [draw]);

    const getCursor = (): string => {
        if (selectedTool) return 'crosshair';
        if (isPanning) return 'grabbing';
        if (drawingLine || extendingElement || drawingMode) return 'crosshair';
        if (selectionRect) return 'crosshair';
        if (draggingElement) return 'grabbing';
        if (resizingElement) return 'nw-resize';
        return 'default';
    };

    return (
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
                cursor: getCursor(),
                display: 'block',
                position: 'fixed',
                top: 0,
                left: 0
            }}
        />
    );
};