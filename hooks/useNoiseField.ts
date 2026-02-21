'use client';

import { useMemo } from 'react';
import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

export function useNoiseField() {
    const noise3D = useMemo(() => createNoise3D(), []);

    const getVelocity = (x: number, y: number, time: number): THREE.Vector2 => {
        // Sample noise at multiple octaves for richer motion
        const scale = 0.3; // How "zoomed in" we are on the noise field
        const timeScale = 0.2; // Speed of evolution

        const nx = x * scale;
        const ny = y * scale;
        const nt = time * timeScale;

        // Two octaves for complexity
        const noise1 = noise3D(nx, ny, nt);
        const noise2 = noise3D(nx * 2, ny * 2, nt * 2) * 0.5;

        const angle = (noise1 + noise2) * Math.PI * 2;
        const magnitude = 0.002; // Base drift speed

        return new THREE.Vector2(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    };

    return { getVelocity };
}
