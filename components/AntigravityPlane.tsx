'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';

interface AntigravityPlaneProps {
    basePos: THREE.Vector3;
    totalWidth: number;
    totalHeight: number;
    gridOffset: MutableRefObject<THREE.Vector2>;
    cursor: MutableRefObject<THREE.Vector3>;
    url: string;
    index: number;
}

export default function AntigravityPlane({
    basePos,
    totalWidth,
    totalHeight,
    gridOffset,
    cursor,
    url,
    index
}: AntigravityPlaneProps) {
    const group = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    // Random constants for variation
    const random = useMemo(() => ({
        flight: Math.random() * 2 + 1, // Float speed
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
    }), []);

    useFrame((state, delta) => {
        if (!group.current) return;

        // 1. Calculate Wrapped Position
        let x = (basePos.x + gridOffset.current.x) % totalWidth;
        let y = (basePos.y - gridOffset.current.y) % totalHeight;

        if (x < -totalWidth / 2) x += totalWidth;
        if (x > totalWidth / 2) x -= totalWidth;
        if (y < -totalHeight / 2) y += totalHeight;
        if (y > totalHeight / 2) y -= totalHeight;

        // 2. Apply Zero-G Floating
        const t = state.clock.elapsedTime;
        const floatY = Math.sin(t * random.flight + random.phase) * 0.2;
        const floatZ = Math.cos(t * 0.8 + random.phase) * 0.5;

        // 3. Gravity/Attraction (The "Well" Effect)
        // Vector from plane to cursor
        const dx = cursor.current.x - x;
        const dy = cursor.current.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attraction radius (Gravity Well)
        const radius = 4; // Smaller radius for tighter control
        let attractX = 0;
        let attractY = 0;
        let attractZ = 0;

        if (dist < radius) {
            // Pull towards center
            const force = (1 - dist / radius) * 2; // Strength
            attractX = (dx / dist) * force;
            attractY = (dy / dist) * force;
            attractZ = force * 1.5; // Pull Closer to camera (Z-axis) for inspection!
        }

        // Lerp position for smoothness
        const targetX = x + attractX;
        const targetY = y + attractY + floatY;
        const targetZ = 0 + attractZ + floatZ;

        // Use damping for position to smooth out the "attraction" snap
        // We need to be careful with infinite scrolling wrapping.
        // If we lerp the position, we might lag behind the wrapping logic.
        // But since 'x' and 'y' are calculated fresh each frame from 'basePos + offset', 
        // the hard snapping happens at the math level.
        // If we dampen the FINAL position, we might see it visually snap.
        // Actually, we should dampen the ATTRACTION Vector only.

        // For simplicity and immediate responsiveness, direct set is okay, 
        // but let's smooth the Z-axis transition specifically + rotation.

        group.current.position.x = targetX;
        group.current.position.y = targetY;
        // Smooth Z arrival
        group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 4, delta);

        // Dynamic Rotation - Tilt towards cursor
        const targetRotX = (y / viewport.height) * 0.3 - attractY * 0.2;
        const targetRotY = -(x / viewport.width) * 0.3 + attractX * 0.2;

        // Lerp rotation
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3, delta);
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 3, delta);
    });

    const handleClick = (e: any) => {
        e.stopPropagation(); // Prevent drag or other events
        // For now, open in new tab or log. 
        // Ideally, this triggers a full-screen overlay mode.
        window.open(url, '_blank');
    };

    return (
        <group ref={group}>
            <Image
                url={url}
                transparent
                opacity={0.9}
                scale={[3, 4]}
                toneMapped={false}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                onPointerOut={() => { document.body.style.cursor = 'auto' }}
            />
            {/* Floating text label - scales with zoom so always readable */}
            <Text
                position={[0, -2.5, 0.1]}
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="top"
                maxWidth={3}
                renderOrder={10}
            >
                {`Photo ${index + 1}`}
            </Text>
        </group>
    );
}
