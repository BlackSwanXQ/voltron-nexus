import {useCallback} from 'react';
import {ELEMENT_TYPES} from '../shared/ElementTypes';
import {areElementsConnected} from '../utils/connectionUtils';
import {SwitchElement,} from '../utils/entity/SwitchElement';
import {BusBarElement} from '../utils/entity/BusBarElement';
import {LineElement} from '../utils/entity/LineElement';
import {BusElement} from '../utils/entity/BusElement';
import {GeneratorElement} from '../utils/entity/GeneratorElement';
import {LoadElement} from '../utils/entity/LoadElement';
import {ElementBase} from '../utils/entity/ElementBase';
import {ConnectedElement, ElementData, SwitchesExportData, SwitchExportData} from '../types/types'


// Функция для конвертации простых объектов в экземпляры классов
const convertToClassInstances = (elements: ElementData[]): ElementBase[] => {
    return elements.map(element => {
        switch(element.type) {
            case 'switch':
                return new SwitchElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.status, element.voltage, element.label
                );
            case 'bus_bar':
                return new BusBarElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.thickness, element.voltage, element.label
                );
            case 'line':
                return new LineElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.thickness, element.voltage, element.label
                );
            case 'bus':
                return new BusElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.labelPosition, element.voltage, element.label
                );
            case 'generator':
                return new GeneratorElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.voltage, element.label
                );
            case 'load':
                return new LoadElement(
                    element.id, element.x, element.y, element.width, element.height,
                    element.voltage, element.label
                );
            default:
                return element as ElementBase;
        }
    });
};

export const useExport = () => {
    const exportSwitchesWithConnections = useCallback((elements: ElementData[]): SwitchesExportData => {
        const exportData: SwitchesExportData = {
            switches: [],
            timestamp: new Date().toISOString(),
            version: '1.0',
        };

        // КОНВЕРТИРУЕМ В КЛАССЫ
        const classElements = convertToClassInstances(elements);

        const allSwitches = classElements.filter(el => el.type === ELEMENT_TYPES.SWITCH) as SwitchElement[];

        allSwitches.forEach(switchElement => {
            const connectedElements: ConnectedElement[] = [];
            const tolerance = 20;

            classElements.forEach(element => {
                if (element.id !== switchElement.id &&
                    (element.type === ELEMENT_TYPES.LINE ||
                        element.type === ELEMENT_TYPES.BUS ||
                        element.type === ELEMENT_TYPES.GENERATOR ||
                        element.type === ELEMENT_TYPES.LOAD)) {

                    try {
                        if (areElementsConnected(classElements, switchElement, element, tolerance)) {
                            if (!connectedElements.some(conn => conn.id === element.id)) {
                                connectedElements.push({
                                    type: element.type,
                                    id: element.id,
                                    name: element.label || `${element.type}_${element.id}`,
                                    voltage: element.voltage || 110
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Ошибка при проверке соединения:', error);
                    }
                }
            });

            const switchData: SwitchExportData = {
                id: switchElement.id,
                name: switchElement.label || `Switch_${switchElement.id}`,
                voltage: switchElement.voltage || 110,
                status: switchElement.status || 'closed',
                x: Math.round(switchElement.x / 10),
                y: Math.round(switchElement.y / 10),
                width: Math.round(switchElement.width / 10),
                height: Math.round(switchElement.height / 10),
                connectedElements: connectedElements
            };

            exportData.switches.push(switchData);
        });

        return exportData;
    }, []);

    // const exportAllElements = useCallback((elements: ElementData[], connections: any[]): AllElementsExportData => {
    //     return {
    //         elements: elements.map(el => ({
    //             id: el.id,
    //             type: el.type,
    //             label: el.label || '',
    //             voltage: el.voltage || 110,
    //             coordinates: {
    //                 x: el.x,
    //                 y: el.y,
    //                 width: el.width,
    //                 height: el.height
    //             },
    //             properties: {
    //                 status: el.status,
    //                 thickness: el.thickness,
    //                 labelPosition: el.labelPosition
    //             }
    //         })),
    //         connections: connections,
    //         timestamp: new Date().toISOString(),
    //         version: '1.0'
    //     };
    // }, []);

    const sendToBackend = useCallback(async (exportData: any, endpoint: string = '/api/energy-grid/connections') => {
        try {
            const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:8080${endpoint}`;

            console.log('🚀 Отправка данных на:', fullUrl);
            console.log('📦 Данные для отправки:', exportData);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Данные успешно отправлены:', result);
            return result;
        } catch (error) {
            console.error('❌ Ошибка при отправке данных:', error);
            throw error;
        }
    }, []);

    const downloadJSON = useCallback((data: any, filename: string = 'energy-grid-data.json'): void => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    return {
        exportSwitchesWithConnections,
        // exportAllElements,
        sendToBackend,
        downloadJSON
    };
};