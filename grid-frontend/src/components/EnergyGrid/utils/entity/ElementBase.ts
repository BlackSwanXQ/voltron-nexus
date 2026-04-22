import { distanceBetweenPoints, distanceToSegment } from '../geometry';

export interface Point {
    x: number;
    y: number;
}

export abstract class ElementBase {
    protected constructor(
        public id: string,
        public type: string,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public voltage: number = 110,
        public label?: string
    ) {
    }

    abstract isConnectedTo(other: ElementBase, tolerance: number): boolean;

    getCenter(): Point {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    isPointNearElement(point: Point, tolerance: number): boolean {
        return (
            point.x >= this.x - tolerance &&
            point.x <= this.x + this.width + tolerance &&
            point.y >= this.y - tolerance &&
            point.y <= this.y + this.height + tolerance
        );
    }

    protected distanceToSegment(point: Point, segmentStart: Point, segmentEnd: Point): number {
        return distanceToSegment(point, segmentStart, segmentEnd);
    }

    protected distanceBetweenPoints(point1: Point, point2: Point): number {
        return distanceBetweenPoints(point1, point2);
    }
}