'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';
import AntigravityPlane from './AntigravityPlane';
import { useGravityCursor } from '@/hooks/useGravityCursor';
import { useZoom } from '@/hooks/useZoom';
import { useNoiseField } from '@/hooks/useNoiseField';

// Expanded grid for "Galaxy" feel when zoomed out
const GRID_COLS = 10;
const GRID_ROWS = 10;
const CELL_W = 5;
const CELL_H = 6;

const TOTAL_WIDTH = GRID_COLS * CELL_W;
const TOTAL_HEIGHT = GRID_ROWS * CELL_H;

// Use Picsum for reliable texture loading
const IMAGE_URLS = Array.from({ length: 20 }).map((_, i) =>
    `https://picsum.photos/seed/${i + 50}/600/800`
);

export default function InfiniteGrid() {
    const { gl, camera } = useThree();
    const { zoomTo } = useZoom();
    const { getVelocity } = useNoiseField();

    // Physics state
    const offset = useRef(new THREE.Vector2(0, 0));
    const velocity = useRef(new THREE.Vector2(0, 0));
    const isDragging = useRef(false);
    const cursor = useGravityCursor();

    // Create grid items
    const items = useMemo(() => {
        const items = [];
        let i = 0;
        for (let x = 0; x < GRID_COLS; x++) {
            for (let y = 0; y < GRID_ROWS; y++) {
                items.push({
                    id: i,
                    basePos: new THREE.Vector3(
                        (x - GRID_COLS / 2) * CELL_W,
                        (y - GRID_ROWS / 2) * CELL_H,
                        0
                    ),
                    url: IMAGE_URLS[i % IMAGE_URLS.length]
                });
                i++;
            }
        }
        return items;
    }, []);

    // Wheel = Zoom (Map-like behavior)
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Scroll down (positive deltaY) = zoom OUT
            zoomTo(e.deltaY, e.clientX, e.clientY);
        };

        gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
        return () => gl.domElement.removeEventListener('wheel', handleWheel);
    }, [gl.domElement, zoomTo]);

    // Drag = Pan
    useDrag(({ delta: [dx, dy], down }) => {
        isDragging.current = down;
        // Adjust speed based on zoom level (faster pan when zoomed out)
        const zoomFactor = camera.position.z / 15;
        const speed = 0.015 * zoomFactor;

        velocity.current.x += dx * speed;
        velocity.current.y -= dy * speed;
    }, { target: gl.domElement });

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        // Apply Noise Field (Non-linear drift)
        const noiseVel = getVelocity(offset.current.x * 0.1, offset.current.y * 0.1, t);

        if (!isDragging.current) {
            // Add organic drift
            offset.current.x += noiseVel.x;
            offset.current.y += noiseVel.y;

            // Apply friction
            velocity.current.multiplyScalar(0.94);
        }

        offset.current.add(velocity.current);
    });

    return (
        <>
            {items.map((item) => (
                <AntigravityPlane
                    key={item.id}
                    index={item.id}
                    basePos={item.basePos}
                    gridOffset={offset}
                    totalWidth={TOTAL_WIDTH}
                    totalHeight={TOTAL_HEIGHT}
                    cursor={cursor}
                    url={item.url}
                />
            ))}
        </>
    );
}
