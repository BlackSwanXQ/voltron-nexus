// Цвета для различных напряжений
export const VOLTAGE_COLORS = {
    750: '#1a237e',
    330: '#2e7d32',
    220: '#9ACD32',
    110: '#0288d1',
    10: '#6a1b9a',
    DEFAULT: '#666666'
} as const;

// Типы на основе констант
export type VoltageValue = keyof typeof VOLTAGE_COLORS;
export type ColorValue = typeof VOLTAGE_COLORS[VoltageValue];

// Функция для получения цвета по напряжению
export const getColorByVoltage = (voltage: number | string): string => {
    const voltageNumber = typeof voltage === 'string' ? parseInt(voltage, 10) : voltage;

    // Проверяем существующие ключи
    if (voltageNumber in VOLTAGE_COLORS) {
        return VOLTAGE_COLORS[voltageNumber as keyof typeof VOLTAGE_COLORS];
    }

    return VOLTAGE_COLORS.DEFAULT;
};