'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalaxyNavigation } from '@/hooks/useGalaxyNavigation';
import { useGravityCursor } from '@/hooks/useGravityCursor';
import { useNoiseField } from '@/hooks/useNoiseField';
import PhotoCard from './Card';
import { ErrorBoundary } from '../ErrorBoundary';

// Grid Config
// Grid Config
const COLS = 20;
const ROWS = 20;
const SPACING_X = 6;
const SPACING_Y = 7;
const WORLD_W = COLS * SPACING_X;
const WORLD_H = ROWS * SPACING_Y;

export default function GalaxyEngine() {
    const { offset: worldOffset, velocity } = useGalaxyNavigation();
    const { getVelocity: getNoise } = useNoiseField();
    const cursor = useGravityCursor();

    // State for real photos
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        // In static export, we fetch the gallery.json directly from the public folder
        // or a static asset path.
        fetch('/gallery.json')
            .then(res => res.json())
            .then(data => setPhotos(data))
            .catch(err => console.error('Failed to load galaxy:', err));
    }, []);

    // Create Items (Photo Data)
    const items = useMemo(() => {
        const grid = [];
        for (let i = 0; i < COLS * ROWS; i++) {
            const row = Math.floor(i / COLS);
            const col = i % COLS;

            // Calculate base position centered around 0,0
            const baseX = (col - COLS / 2) * SPACING_X;
            const baseY = (row - ROWS / 2) * SPACING_Y;

            // Determine Photo Source
            let url, description, leftText, rightText, realId;
            if (photos.length > 0) {
                // Use real photos repeatedly
                const photo = photos[i % photos.length];
                url = photo.src;
                description = photo.description;
                leftText = photo.leftText;
                rightText = photo.rightText;
                realId = photo.id;
            } else {
                // Fallback to Picsum
                url = `https://picsum.photos/seed/${i + 100}/600/800`;
                description = `Memory Fragment #${i}`;
                leftText = '';
                rightText = '';
            }

            grid.push({
                id: i,
                row,
                col,
                baseX,
                baseY,
                url,
                description,
                leftText,
                rightText
            });
        }
        return grid;
    }, [photos]);

    // Main Physics Loop (Applied to Global Offset)
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const drift = getNoise(worldOffset.current.offset.x * 0.1, worldOffset.current.offset.y * 0.1, t);
        velocity.current.velocity.x += drift.x * 0.8;
        velocity.current.velocity.y += drift.y * 0.8;
    });

    return (
        <>
            {items.map((item) => (
                <ErrorBoundary key={item.id} fallback={null}>
                    <PhotoCard
                        id={item.id}
                        rowIndex={item.row}
                        colIndex={item.col}
                        url={item.url}
                        description={item.description}
                        leftText={item.leftText}
                        rightText={item.rightText}
                        basePos={new THREE.Vector3(item.baseX, item.baseY, 0)}
                        worldOffset={worldOffset}
                        cursor={cursor}
                        worldSize={{ width: WORLD_W, height: WORLD_H }}
                    />
                </ErrorBoundary>
            ))}
        </>
    );
}
