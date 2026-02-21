'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDrag, usePinch } from '@use-gesture/react';

interface GalaxyNavState {
    zoom: number;
    offset: THREE.Vector2;
    velocity: THREE.Vector2;
}

export function useGalaxyNavigation() {
    const { gl, camera } = useThree();

    // State Refs (Mutable for physics loop)
    const state = useRef<GalaxyNavState>({
        zoom: 15,
        offset: new THREE.Vector2(0, 0),
        velocity: new THREE.Vector2(0, 0),
    });

    const isDragging = useRef(false);

    // Zoom Constants
    const MIN_ZOOM = 5;
    const MAX_ZOOM = 80;

    // 1. Wheel -> Zoom OR Pan
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Check for Zoom (Pinch gestures on trackpad usually set ctrlKey automatically on some browsers, 
            // but mapped deltaY is better heuristic if ctrlKey is unreliable? Standard simple approach first: 
            // Ctrl+Wheel = Zoom. Standard Wheel = Pan.)

            if (e.ctrlKey) {
                // Zoom Logic
                const currentZoom = state.current.zoom;
                const factor = e.deltaY > 0 ? 1.05 : 0.95; // Scroll Down = Zoom Out
                const target = THREE.MathUtils.clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM);
                state.current.zoom = target;
            } else {
                // Pan Logic (Trackpad scrolling)
                // Invert X/Y for natural touch feel
                // Zoom-based speed scaling
                const zoomFactor = state.current.zoom / 15;
                const panSpeed = 0.005 * zoomFactor; // Slower, heavier feel

                state.current.velocity.x -= e.deltaX * panSpeed;
                state.current.velocity.y += e.deltaY * panSpeed;
            }
        };

        const dom = gl.domElement;
        dom.addEventListener('wheel', handleWheel, { passive: false });
        return () => dom.removeEventListener('wheel', handleWheel);
    }, [gl.domElement]);

    // 2. Drag -> Pan
    useDrag(({ delta: [dx, dy], down }) => {
        isDragging.current = down;
        // Adjust speed for mobile touch vs mouse
        const zoomFactor = state.current.zoom / 15;
        const panSpeed = 0.02 * zoomFactor;
        state.current.velocity.x += dx * panSpeed;
        state.current.velocity.y -= dy * panSpeed;
    }, { target: gl.domElement });

    // 3. Pinch -> Zoom
    usePinch(({ offset: [s], movement: [ms], first, memo }) => {
        if (first) return state.current.zoom;
        // s is scale. default 1.
        // We want to scale our "memo" (initial zoom) by 1/s

        // Simple heuristic: 
        // Pinch Out (ms > 0) -> Zoom In -> Decrease Z
        // Pinch In (ms < 0) -> Zoom Out -> Increase Z

        const currentZoom = state.current.zoom;
        const factor = 1 - (ms * 0.005); // Sensitivity

        const target = THREE.MathUtils.clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM);
        state.current.zoom = target;

        return memo;
    }, { target: gl.domElement });

    // 3. Physics Loop (Frame Update)
    useFrame((_, delta) => {
        // Smooth Zoom Camera
        if (Math.abs(camera.position.z - state.current.zoom) > 0.1) {
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, state.current.zoom, 5 * delta);
        }

        // Friction
        if (!isDragging.current) {
            state.current.velocity.multiplyScalar(0.92); // Heavy drift
        }

        // Apply Velocity
        state.current.offset.add(state.current.velocity);
    });

    return {
        offset: state,
        velocity: state,
        zoom: state.current.zoom
    };
}
