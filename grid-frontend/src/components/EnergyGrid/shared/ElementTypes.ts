import { DEFAULT_SIZES, LabelPosition, Size } from './constants';

export const ELEMENT_TYPES = {
    BUS: 'bus',
    BUS_BAR: 'bus_bar',
    SWITCH: 'switch',
    GENERATOR: 'generator',
    LOAD: 'load',
    LINE: 'line',
    JUNCTION: 'junction'
} as const;

export type ElementType = typeof ELEMENT_TYPES[keyof typeof ELEMENT_TYPES];

interface ElementConfig {
    label: string;
    icon: string;
    defaultSize: Size;
    defaultVoltage: number;
    canResize: boolean;
    hasLabel: boolean;
    hasStatus?: boolean;
    hasThickness?: boolean;
    labelPosition?: LabelPosition;
}

export const ELEMENT_CONFIGS: Record<ElementType, ElementConfig> = {
    [ELEMENT_TYPES.BUS]: {
        label: 'Шина',
        icon: '📏',
        defaultSize: DEFAULT_SIZES.bus,
        defaultVoltage: 110,
        canResize: true,
        hasLabel: true,
        labelPosition: 'top'
    },
    [ELEMENT_TYPES.SWITCH]: {
        label: 'Выключатель',
        icon: '⚡',
        defaultSize: DEFAULT_SIZES.switch,
        defaultVoltage: 110,
        canResize: false,
        hasLabel: true,
        hasStatus: true
    },
    [ELEMENT_TYPES.GENERATOR]: {
        label: 'Генератор',
        icon: '🔋',
        defaultSize: DEFAULT_SIZES.generator,
        defaultVoltage: 110,
        canResize: true,
        hasLabel: true
    },
    [ELEMENT_TYPES.LOAD]: {
        label: 'Нагрузка',
        icon: '💡',
        defaultSize: DEFAULT_SIZES.load,
        defaultVoltage: 110,
        canResize: true,
        hasLabel: true
    },
    [ELEMENT_TYPES.JUNCTION]: {
        label: 'Точка соединения',
        icon: '🔘',
        defaultSize: DEFAULT_SIZES.junction,
        defaultVoltage: 110,
        canResize: false,
        hasLabel: false
    },
    [ELEMENT_TYPES.LINE]: {
        label: 'Линия',
        icon: '📐',
        defaultSize: DEFAULT_SIZES.line,
        defaultVoltage: 110,
        canResize: false,
        hasLabel: true,
        hasThickness: true
    },
    [ELEMENT_TYPES.BUS_BAR]: {
        label: 'Ошиновка',
        icon: '⚡',
        defaultSize: DEFAULT_SIZES.bus_bar,
        defaultVoltage: 110,
        canResize: false,
        hasLabel: true,
        hasThickness: true
    }
};

export const getElementConfig = (type: ElementType): ElementConfig => {
    return ELEMENT_CONFIGS[type] || ELEMENT_CONFIGS[ELEMENT_TYPES.BUS];
};

export const getElementLabel = (type: ElementType): string => {
    return getElementConfig(type).label;
};

export const getElementIcon = (type: ElementType): string => {
    return getElementConfig(type).icon;
};