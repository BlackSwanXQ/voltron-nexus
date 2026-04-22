// src/components/EnergyGrid/utils/energyGridUtils.ts
import {BaseElement,Point} from '../types/types'
import { ELEMENT_TYPES } from '../shared/ElementTypes';
import { getColorByVoltage } from '../shared/VoltageColors';
import { getExitPoint } from './elementUtils';
import { getOrthogonalCoordinates } from './geometry';

// Чистая функция для получения цвета элемента
export const getElementColor = (element: BaseElement): string => {
    if (element.type === ELEMENT_TYPES.SWITCH && element.status === 'open') {
        return '#f44336';
    }
    if (element.type === ELEMENT_TYPES.BUS) {
        return getColorByVoltage(element.voltage);
    }
    if (element.type === ELEMENT_TYPES.LINE || element.type === ELEMENT_TYPES.BUS_BAR) {
        return getColorByVoltage(element.voltage);
    }
    if (element.type === ELEMENT_TYPES.JUNCTION) {
        return getColorByVoltage(element.voltage);
    }
    return getColorByVoltage(element.voltage);
};

// Создание точки соединения
export const createJunction = (x: number, y: number, voltage: number = 110): BaseElement => ({
    id: `junction-${Date.now()}`,
    type: ELEMENT_TYPES.JUNCTION,
    x: x - 4,
    y: y - 4,
    width: 8,
    height: 8,
    voltage: voltage,
    label: ""
});

// Соединение элементов ошиновкой
export const connectElementsWithBusBar = (
    element1: BaseElement,
    element2: BaseElement,
    orthogonalMode: boolean,
    connectionMode: string
): BaseElement => {
    let startPoint: Point;
    let endPoint: Point;

    // Логика для соединения двух ошиновок
    if (element1.type === ELEMENT_TYPES.BUS_BAR && element2.type === ELEMENT_TYPES.BUS_BAR) {
        if (connectionMode === 'center') {
            // Соединение по центрам ошиновок
            const center1 = {
                x: element1.x + element1.width / 2,
                y: element1.y + element1.height / 2
            };
            const center2 = {
                x: element2.x + element2.width / 2,
                y: element2.y + element2.height / 2
            };

            startPoint = center1;
            endPoint = center2;
        } else {
            // Соединение ближайших концов ошиновок
            const points1 = [
                { x: element1.x, y: element1.y },
                { x: element1.x + element1.width, y: element1.y + element1.height }
            ];

            const points2 = [
                { x: element2.x, y: element2.y },
                { x: element2.x + element2.width, y: element2.y + element2.height }
            ];

            let minDistance = Infinity;
            let bestStart: Point = points1[0];
            let bestEnd: Point = points2[0];

            for (const p1 of points1) {
                for (const p2 of points2) {
                    const distance = Math.sqrt(
                        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestStart = p1;
                        bestEnd = p2;
                    }
                }
            }

            startPoint = bestStart;
            endPoint = bestEnd;
        }
    } else {
        // Логика для других типов элементов
        startPoint = getExitPoint(element1, element2);
        endPoint = getExitPoint(element2, element1);

        // Ортогональный режим
        if (orthogonalMode) {
            const element1IsJunction = element1.type === ELEMENT_TYPES.JUNCTION;
            const element2IsJunction = element2.type === ELEMENT_TYPES.JUNCTION;

            if (element1IsJunction && !element2IsJunction) {
                const orthogonalStart = getOrthogonalCoordinates(endPoint.x, endPoint.y, startPoint.x, startPoint.y);
                startPoint = { x: orthogonalStart.x, y: orthogonalStart.y };
            }
            else if (element2IsJunction && !element1IsJunction) {
                const orthogonalEnd = getOrthogonalCoordinates(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                endPoint = { x: orthogonalEnd.x, y: orthogonalEnd.y };
            }
            else if (element1IsJunction && element2IsJunction) {
                const orthogonalCoords = getOrthogonalCoordinates(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                endPoint = { x: orthogonalCoords.x, y: orthogonalCoords.y };
            }
            else {
                const element1IsBus = element1.type === ELEMENT_TYPES.BUS;
                const element2IsBus = element2.type === ELEMENT_TYPES.BUS;

                const element1IsSwitch = element1.type === ELEMENT_TYPES.SWITCH;
                const element2IsSwitch = element2.type === ELEMENT_TYPES.SWITCH;

                if ((element1IsBus || element1IsSwitch) && !(element2IsBus || element2IsSwitch)) {
                    const orthogonalEnd = getOrthogonalCoordinates(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                    endPoint = { x: orthogonalEnd.x, y: orthogonalEnd.y };
                }
                else if ((element2IsBus || element2IsSwitch) && !(element1IsBus || element1IsSwitch)) {
                    const orthogonalStart = getOrthogonalCoordinates(endPoint.x, endPoint.y, startPoint.x, startPoint.y);
                    startPoint = { x: orthogonalStart.x, y: orthogonalStart.y };
                }
                else {
                    const orthogonalCoords = getOrthogonalCoordinates(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                    endPoint = { x: orthogonalCoords.x, y: orthogonalCoords.y };
                }
            }
        }
    }

    return {
        id: `bus_bar-${Date.now()}`,
        type: ELEMENT_TYPES.BUS_BAR,
        x: startPoint.x,
        y: startPoint.y,
        width: endPoint.x - startPoint.x,
        height: endPoint.y - startPoint.y,
        thickness: 4,
        voltage: 110,
        label: ""
    };
};

// Отрисовка сетки
export const drawGrid = (ctx: CanvasRenderingContext2D, canvasSize: { width: number; height: number }): void => {
    const mmSize = 10;
    const cmSize = mmSize * 10;
    const bigStep = cmSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    for (let x = 0; x <= canvasSize.width; x += mmSize) {
        ctx.beginPath();
        if (x % bigStep === 0) {
            ctx.strokeStyle = '#bdbdbd';
            ctx.lineWidth = 1;
            if (x > 0) {
                ctx.fillStyle = '#757575';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${x / cmSize}`, x, 2);
            }
        } else {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
        }
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvasSize.height; y += mmSize) {
        ctx.beginPath();
        if (y % bigStep === 0) {
            ctx.strokeStyle = '#bdbdbd';
            ctx.lineWidth = 1;
            if (y > 0) {
                ctx.fillStyle = '#757575';
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${y / cmSize}`, 2, y);
            }
        } else {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
        }
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
};


// Предпросмотр данных экспорта
export const previewExportData = (exportSwitchesWithConnections: (elements: any[]) => any, elements: any[]): void => {
    const data = exportSwitchesWithConnections(elements);
    const jsonString = JSON.stringify(data, null, 2);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`
            <html lang="">
              <head>
                <title>Данные для бэкенда</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  pre { background: #f5f5f5; padding: 15px; border: 1px solid #ccc; border-radius: 5px; overflow: auto; }
                  button { margin: 5px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                  button:hover { background: #0056b3; }
                  .stats { background: #e9ecef; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
                </style>
              </head>
              <body>
                <h2>Данные для отправки на Java бэкенд</h2>
                <div class="stats">
                  <strong>Статистика:</strong><br>
                  • Выключателей: ${data.switches.length}<br>
                  • Всего соединений: ${data.switches.reduce((sum: number, sw: any) => sum + sw.connectedElements.length, 0)}<br>
                </div>
                <button onclick="window.close()">Закрыть</button>
                <button onclick="navigator.clipboard.writeText(document.getElementById('jsonData').textContent).then(() => alert('JSON скопирован!'))">
                  Копировать JSON
                </button>
                <pre id="jsonData">${jsonString}</pre>
              </body>
            </html>
        `);
    }
};

// Отправка на бэкенд
export const handleSendToBackend = async (
    exportSwitchesWithConnections: (elements: any[]) => any,
    elements: any[],
    endpoint: string = '/api/energy-grid/connections'
): Promise<any> => {
    console.log('🔍 sendToBackend вызван с endpoint:', endpoint);

    try {
        const data = exportSwitchesWithConnections(elements);
        console.log('📤 Данные для отправки:', data);

        const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:8080${endpoint}`;
        console.log('🔗 Полный URL:', fullUrl);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('📥 Ответ получен, статус:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        const result = await response.json();
        alert('Данные успешно отправлены на бэкенд!');
        return result;
    } catch (error) {
        console.error('❌ Ошибка при отправке данных:', error);
        alert('Ошибка при отправке данных на бэкенд: ' + (error as Error).message);
    }
};