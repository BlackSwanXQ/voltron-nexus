import {useCallback, useRef, useState} from 'react';
import {Point, Size, UseCanvasReturn} from "../types/types";


export const useCanvas = (): UseCanvasReturn => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewOffset, setViewOffset] = useState<Point>({x: 0, y: 0});
    const [canvasSize, setCanvasSize] = useState<Size>({width: 3000, height: 2000});
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panStart, setPanStart] = useState<Point>({x: 0, y: 0});

    const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};

        const rect = canvas.getBoundingClientRect();
        // console.log('clientY = ' + clientY)
        // console.log('rectTop = ' + rect.height)
        // console.log('viewOffsetY = ' + viewOffset.y)
        // console.log('canvasSize ' + canvasSize.height)
        // console.log('isPanning ' + isPanning)
        // console.log('panStart ' + panStart.x)
        return {
            x: clientX - rect.left + viewOffset.x,
            y: clientY - rect.top + viewOffset.y
        };
    }, [viewOffset]);

    return {
        canvasRef,
        viewOffset,
        setViewOffset,
        canvasSize,
        setCanvasSize,
        isPanning,
        setIsPanning,
        panStart,
        setPanStart,
        getCanvasCoordinates
    };
};