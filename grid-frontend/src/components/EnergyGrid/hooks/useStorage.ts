import {useCallback} from 'react';
import {STORAGE_KEYS} from '../shared/constants';
import {Point, Size, Element, Connection, StorageData, StorageInfo, UseStorageReturn} from "../types/types";


export const useStorage = (): UseStorageReturn => {

    const saveToStorage = useCallback((
        elements: Element[],
        connections: Connection[],
        canvasSize: Size,
        viewOffset: Point,
        isLoaded: boolean
    ) => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
            localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
            localStorage.setItem(STORAGE_KEYS.CANVAS_SIZE, JSON.stringify(canvasSize));
            localStorage.setItem(STORAGE_KEYS.VIEW_OFFSET, JSON.stringify(viewOffset));

            console.log('💾 Данные сохранены в localStorage');
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    }, []);

    const loadFromStorage = useCallback((): StorageData => {
        try {
            const savedElements = localStorage.getItem(STORAGE_KEYS.ELEMENTS);
            const savedConnections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
            const savedCanvasSize = localStorage.getItem(STORAGE_KEYS.CANVAS_SIZE);
            const savedViewOffset = localStorage.getItem(STORAGE_KEYS.VIEW_OFFSET);

            const data: StorageData = {
                elements: savedElements ? JSON.parse(savedElements) : [],
                connections: savedConnections ? JSON.parse(savedConnections) : [],
                canvasSize: savedCanvasSize ? JSON.parse(savedCanvasSize) : {width: 3000, height: 2000},
                viewOffset: savedViewOffset ? JSON.parse(savedViewOffset) : {x: 0, y: 0}
            };

            console.log('📂 Данные загружены из localStorage');
            return data;
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            return {
                elements: [],
                connections: [],
                canvasSize: {width: 3000, height: 2000},
                viewOffset: {x: 0, y: 0}
            };
        }
    }, []);

    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.ELEMENTS);
            localStorage.removeItem(STORAGE_KEYS.CONNECTIONS);
            localStorage.removeItem(STORAGE_KEYS.CANVAS_SIZE);
            localStorage.removeItem(STORAGE_KEYS.VIEW_OFFSET);
            console.log('🗑️ localStorage очищен');
        } catch (error) {
            console.error('Ошибка при очистке:', error);
        }
    }, []);

    const getStorageInfo = useCallback((): StorageInfo => {
        try {
            const elements = localStorage.getItem(STORAGE_KEYS.ELEMENTS);
            const connections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);

            return {
                hasElements: !!elements,
                hasConnections: !!connections,
                elementsCount: elements ? JSON.parse(elements).length : 0,
                connectionsCount: connections ? JSON.parse(connections).length : 0
            };
        } catch (error) {
            console.error('Ошибка при получении информации о хранилище:', error);
            return {
                hasElements: false,
                hasConnections: false,
                elementsCount: 0,
                connectionsCount: 0
            };
        }
    }, []);

    return {
        saveToStorage,
        loadFromStorage,
        clearStorage,
        getStorageInfo
    };
};