import {ElementBase, Point} from "./ElementBase";

export class BusElement extends ElementBase {
    constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        public labelPosition: string = 'top',
        voltage: number = 110,
        label?: string
    ) {

        super(id, 'bus', x, y, width, height, voltage, label);
    }

    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        if (other.type === 'bus_bar') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'line') {
            return this.isConnectedToLine(other, tolerance);
        } else if (other.type === 'switch') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'generator' || other.type === 'load') {
            return this.isConnectedToGeneratorOrLoad(other, tolerance);
        }
        return false;
    }

    private isConnectedToLine(line: ElementBase, tolerance: number): boolean {
        const lineStart: Point = { x: line.x, y: line.y };
        const lineEnd: Point = {
            x: line.x + line.width,
            y: line.y + line.height
        };

        return this.isPointNearElement(lineStart, tolerance) ||
            this.isPointNearElement(lineEnd, tolerance);
    }

    private isConnectedToGeneratorOrLoad(element: ElementBase, tolerance: number): boolean {
        const elementCenter = element.getCenter();
        return this.isPointNearElement(elementCenter, tolerance);
    }
}