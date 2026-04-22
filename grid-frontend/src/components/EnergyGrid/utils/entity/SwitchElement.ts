import {ElementBase, Point} from "./ElementBase";

export class SwitchElement extends ElementBase {
    constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        public status: 'open' | 'closed' = 'closed',
        voltage: number = 110,
        label?: string
    ) {
        super(id, 'switch', x, y, width, height, voltage, label);
    }

    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        if (other.type === 'bus_bar') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'line') {
            return this.isConnectedToLine(other, tolerance);
        } else if (other.type === 'bus') {
            return this.isConnectedToBus(other, tolerance);
        } else if (other.type === 'generator' || other.type === 'load') {
            return this.isConnectedToGeneratorOrLoad(other, tolerance);
        }
        return false;
    }

    private isConnectedToLine(line: ElementBase, tolerance: number): boolean {
        const switchCenter = this.getCenter();
        const lineStart: Point = { x: line.x, y: line.y };
        const lineEnd: Point = {
            x: line.x + line.width,
            y: line.y + line.height
        };
        return this.distanceToSegment(switchCenter, lineStart, lineEnd) <= tolerance;
    }

    private isConnectedToBus(bus: ElementBase, tolerance: number): boolean {
        const switchCenter = this.getCenter();
        return bus.isPointNearElement(switchCenter, tolerance);
    }

    private isConnectedToGeneratorOrLoad(element: ElementBase, tolerance: number): boolean {
        const switchCenter = this.getCenter();
        const elementCenter = element.getCenter();
        return this.distanceBetweenPoints(switchCenter, elementCenter) <= tolerance;
    }
}