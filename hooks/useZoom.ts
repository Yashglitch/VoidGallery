'use client';

import { useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ZoomState {
    targetZoom: number;
    currentZoom: number;
}

export function useZoom() {
    const { camera, viewport, size } = useThree();
    const zoomState = useRef<ZoomState>({ targetZoom: 15, currentZoom: 15 });

    // Constraints
    const MIN_ZOOM = 5;   // Close up
    const MAX_ZOOM = 60;  // Bird's eye view (can see entire grid)

    const zoomTo = useCallback((delta: number, mouseX?: number, mouseY?: number) => {
        // Calculate new target zoom
        const factor = delta > 0 ? 0.9 : 1.1;
        let newZoom = zoomState.current.targetZoom * factor;

        // Clamp
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        zoomState.current.targetZoom = newZoom;
    }, []);

    useFrame((state, delta) => {
        // Smooth lerp to target zoom
        const current = zoomState.current.currentZoom;
        const target = zoomState.current.targetZoom;

        if (Math.abs(current - target) > 0.01) {
            const newZoom = THREE.MathUtils.lerp(current, target, 10 * delta);
            zoomState.current.currentZoom = newZoom;
            camera.position.z = newZoom;
        }
    });

    return {
        zoom: zoomState.current.currentZoom,
        zoomTo,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
    };
}
