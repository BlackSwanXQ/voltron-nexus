import { ElementBase, Point } from './ElementBase';

export class BusBarElement extends ElementBase {
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
        super(id, 'bus_bar', x, y, width, height, voltage, label);
    }


    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        if (other.type === 'switch') {
            return this.isConnectedToSwitch(other, tolerance);
        } else if (other.type === 'bus') {
            return this.isConnectedToBus(other, tolerance);
        } else if (other.type === 'line') {
            return this.isConnectedToLine(other, tolerance);
        } else if (other.type === 'bus_bar') {
            return this.isConnectedToBusBar(other as BusBarElement, tolerance);
        } else if (other.type === 'generator' || other.type === 'load') {
            return this.isConnectedToGeneratorOrLoad(other, tolerance);
        }
        return false;
    }

    private isConnectedToSwitch(switchEl: ElementBase, tolerance: number): boolean {
        const busBarStart: Point = { x: this.x, y: this.y };
        const busBarEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const switchCenter = switchEl.getCenter();

        const distToStart = this.distanceBetweenPoints(switchCenter, busBarStart);
        const distToEnd = this.distanceBetweenPoints(switchCenter, busBarEnd);

        return distToStart <= tolerance || distToEnd <= tolerance;
    }

    private isConnectedToBus(bus: ElementBase, tolerance: number): boolean {
        const busBarStart: Point = { x: this.x, y: this.y };
        const busBarEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const startNearBus = bus.isPointNearElement(busBarStart, tolerance);
        const endNearBus = bus.isPointNearElement(busBarEnd, tolerance);

        return startNearBus || endNearBus;
    }

    private isConnectedToLine(line: ElementBase, tolerance: number): boolean {
        const busBarStart: Point = { x: this.x, y: this.y };
        const busBarEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const lineStart: Point = { x: line.x, y: line.y };
        const lineEnd: Point = {
            x: line.x + line.width,
            y: line.y + line.height
        };

        const dist1 = this.distanceToSegment(lineStart, busBarStart, busBarEnd);
        const dist2 = this.distanceToSegment(lineEnd, busBarStart, busBarEnd);
        const dist3 = this.distanceToSegment(busBarStart, lineStart, lineEnd);
        const dist4 = this.distanceToSegment(busBarEnd, lineStart, lineEnd);

        return dist1 <= tolerance || dist2 <= tolerance || dist3 <= tolerance || dist4 <= tolerance;
    }

    private isConnectedToBusBar(otherBusBar: BusBarElement, tolerance: number): boolean {
        const thisStart: Point = { x: this.x, y: this.y };
        const thisEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const otherStart: Point = { x: otherBusBar.x, y: otherBusBar.y };
        const otherEnd: Point = {
            x: otherBusBar.x + otherBusBar.width,
            y: otherBusBar.y + otherBusBar.height
        };

        const dist1 = this.distanceToSegment(otherStart, thisStart, thisEnd);
        const dist2 = this.distanceToSegment(otherEnd, thisStart, thisEnd);
        const dist3 = this.distanceToSegment(thisStart, otherStart, otherEnd);
        const dist4 = this.distanceToSegment(thisEnd, otherStart, otherEnd);

        return dist1 <= tolerance || dist2 <= tolerance || dist3 <= tolerance || dist4 <= tolerance;
    }

    private isConnectedToGeneratorOrLoad(element: ElementBase, tolerance: number): boolean {
        const elementCenter = element.getCenter();
        const busBarStart: Point = { x: this.x, y: this.y };
        const busBarEnd: Point = {
            x: this.x + this.width,
            y: this.y + this.height
        };

        const distToStart = this.distanceBetweenPoints(elementCenter, busBarStart);
        const distToEnd = this.distanceBetweenPoints(elementCenter, busBarEnd);

        return distToStart <= tolerance || distToEnd <= tolerance;
    }
}