// src/components/EnergyGrid/hooks/useEnergyGridActions.ts
import { useCallback } from 'react';
import { connectElementsWithBusBar, createJunction } from '../utils/energyGridUtils';

export const useEnergyGridActions = (
    setElements: (updater: any) => void,
    orthogonalMode: boolean,
    connectionMode: string
) => {
    const handleCreateJunction = useCallback((x: number, y: number, voltage: number = 110) => {
        const junction = createJunction(x, y, voltage);
        setElements((prev: any[]) => [...prev, junction]);
        return junction;
    }, [setElements]);

    const handleConnectElements = useCallback((element1: any, element2: any) => {
        const busBar = connectElementsWithBusBar(element1, element2, orthogonalMode, connectionMode);
        setElements((prev: any[]) => [...prev, busBar]);
    }, [setElements, orthogonalMode, connectionMode]);

    const connectSelectedElements = useCallback((
        selectedElements: Set<string>,
        elements: any[],
        setSelectedElements: (set: Set<string>) => void,
        setSelectedElement: (id: string | null) => void
    ) => {
        // console.log('🔄 connectSelectedElements вызван');
        //
        // if (selectedElements.size !== 2) {
        //     console.log('❌ Не 2 элемента выбрано:', selectedElements.size);
        //     return;
        // }

        const selectedArray = Array.from(selectedElements);
        const element1 = elements.find(el => el.id === selectedArray[0]);
        const element2 = elements.find(el => el.id === selectedArray[1]);

        // if (!element1 || !element2) {
        //     console.log('❌ Элементы не найдены');
        //     return;
        // }

        // console.log('✅ Соединяем элементы:', element1.id, element2.id);

        if (document.activeElement) {
            // console.log('🎯 Сбрасываем фокус с:', document.activeElement);
            (document.activeElement as HTMLElement).blur();
        }

        handleConnectElements(element1, element2);

        setSelectedElements(new Set());
        setSelectedElement(null);

        // console.log('✅ connectSelectedElements завершен');
    }, [handleConnectElements]);

    return {
        handleCreateJunction,
        handleConnectElements,
        connectSelectedElements
    };
};