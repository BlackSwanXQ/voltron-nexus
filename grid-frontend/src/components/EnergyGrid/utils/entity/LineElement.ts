import {ElementBase, Point} from "./ElementBase";

export class LineElement extends ElementBase {
    constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        public thickness: number = 4,
        voltage: number = 110,
        label?: string
    ) {
        super(id, 'line', x, y, width, height, voltage, label);
    }

    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        if (other.type === 'bus_bar') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'bus') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'switch') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'line') {
            return this.isConnectedToLine(other, tolerance);
        } else if (other.type === 'generator' || other.type === 'load') {
            return this.isConnectedToGeneratorOrLoad(other, tolerance);
        }
        return false;
    }

    private isConnectedToLine(otherLine: ElementBase, tolerance: number): boolean {
        const thisStart: Point = { x: this.x, y: this.y };
        const thisEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const otherStart: Point = { x: otherLine.x, y: otherLine.y };
        const otherEnd: Point = {
            x: otherLine.x + otherLine.width,
            y: otherLine.y + otherLine.height
        };

        const dist1 = this.distanceToSegment(otherStart, thisStart, thisEnd);
        const dist2 = this.distanceToSegment(otherEnd, thisStart, thisEnd);
        const dist3 = this.distanceToSegment(thisStart, otherStart, otherEnd);
        const dist4 = this.distanceToSegment(thisEnd, otherStart, otherEnd);

        return dist1 <= tolerance || dist2 <= tolerance || dist3 <= tolerance || dist4 <= tolerance;
    }

    private isConnectedToGeneratorOrLoad(element: ElementBase, tolerance: number): boolean {
        const elementCenter = element.getCenter();
        const lineStart: Point = { x: this.x, y: this.y };
        const lineEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };
        return this.distanceToSegment(elementCenter, lineStart, lineEnd) <= tolerance;
    }
}