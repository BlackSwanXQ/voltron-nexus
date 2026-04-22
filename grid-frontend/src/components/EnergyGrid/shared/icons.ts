// Иконки для элементов энергосистемы
export const ICONS = {
    BUS: '📏',
    SWITCH: '⚡',
    GENERATOR: '🔋',
    LOAD: '💡',
    JUNCTION: '🔘',
    LINE: '📐',
    BUS_BAR: '⚡'
} as const;

// Иконки для инструментов
export const TOOL_ICONS = {
    SELECT: '🎯',
    PAN: '✋',
    DRAW_LINE: '📏',
    DRAW_BUS_BAR: '⚡',
    ORTHOGONAL: '📐'
} as const;

// Иконки для статусов
export const STATUS_ICONS = {
    CLOSED: '🟢',
    OPEN: '🔴',
    CONNECTED: '🔗',
    DISCONNECTED: '🔌'
} as const;

// Типы на основе констант
export type Icons = typeof ICONS;
export type IconType = keyof Icons;
export type IconValue = Icons[IconType];

export type ToolIcons = typeof TOOL_ICONS;
export type ToolIconType = keyof ToolIcons;
export type ToolIconValue = ToolIcons[ToolIconType];

export type StatusIcons = typeof STATUS_ICONS;
export type StatusIconType = keyof StatusIcons;
export type StatusIconValue = StatusIcons[StatusIconType];