import {Point} from "../types/types";


/**
 * Вычисляет расстояние между двумя точками
 */
export const distanceBetweenPoints = (point1: Point, point2: Point): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Вычисляет расстояние от точки до отрезка
 */
export const distanceToSegment = (point: Point, segmentStart: Point, segmentEnd: Point): number => {
    const A = point.x - segmentStart.x;
    const B = point.y - segmentStart.y;
    const C = segmentEnd.x - segmentStart.x;
    const D = segmentEnd.y - segmentStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;
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

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
};


export const pointToLineDistance = (px, py, line) => {
    const {x: x1, y: y1, width, height} = line;
    const x2 = x1 + width;
    const y2 = y1 + height;

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
 * Вычисляет ортогональные координаты для режима прямых углов
 */
export const getOrthogonalCoordinates = (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number
): Point => {
    const dx = currentX - startX;
    const dy = currentY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        return {x: currentX, y: startY};
    } else {
        return {x: startX, y: currentY};
    }
};

export const findLineIntersection = (
    line1Start: Point,
    line1End: Point,
    line2Start: Point,
    line2End: Point
): Point | null => {
    const x1 = line1Start.x, y1 = line1Start.y;
    const x2 = line1End.x, y2 = line1End.y;
    const x3 = line2Start.x, y3 = line2Start.y;
    const x4 = line2End.x, y4 = line2End.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Линии параллельны
    if (denominator === 0) {
        return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // Проверяем что пересечение в пределах отрезков
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }

    return null;
};