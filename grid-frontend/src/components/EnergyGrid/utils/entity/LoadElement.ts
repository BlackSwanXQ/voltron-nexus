import {ElementBase} from "./ElementBase";

export class LoadElement extends ElementBase {
    constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        voltage: number = 110,
        label?: string
    ) {
        super(id, 'load', x, y, width, height, voltage, label);
    }

    isConnectedTo(other: ElementBase, tolerance: number): boolean {
        if (other.type === 'bus_bar' || other.type === 'bus') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'line') {
            return other.isConnectedTo(this, tolerance);
        } else if (other.type === 'switch') {
            return other.isConnectedTo(this, tolerance);
        }
        return false;
    }
}