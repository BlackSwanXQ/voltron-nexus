import {ElementBase} from "./ElementBase";

export class JunctionElement extends ElementBase {
    constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        voltage: number = 110,
        label?: string
    ) {
        super(id, 'junction', x, y, width, height, voltage, label);
    }

    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        const thisCenter = this.getCenter();
        const otherCenter = other.getCenter();
        const distance = this.distanceBetweenPoints(thisCenter, otherCenter);
        return distance <= tolerance;
    }
}