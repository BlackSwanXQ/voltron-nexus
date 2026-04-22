export const STORAGE_KEYS = {
    ELEMENTS: 'energy_grid_elements',
    CONNECTIONS: 'energy_grid_connections',
    CANVAS_SIZE: 'energy_grid_canvas_size',
    VIEW_OFFSET: 'energy_grid_view_offset'
} as const;

export const LABEL_POSITIONS = {
    TOP: 'top',
    BOTTOM: 'bottom'
} as const;

export type LabelPosition = typeof LABEL_POSITIONS[keyof typeof LABEL_POSITIONS];

export interface Size {
    width: number;
    height: number;
}

export const DEFAULT_SIZES: Record<string, Size> = {
    bus: { width: 200, height: 6 },
    switch: { width: 26, height: 26 },
    generator: { width: 80, height: 50 },
    load: { width: 80, height: 50 },
    line: { width: 100, height: 6 },
    // bus_bar: { width: 100, height: 4 },
    junction: { width: 8, height: 8 }
} as const;