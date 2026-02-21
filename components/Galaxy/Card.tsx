import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';

import { useSelectionStore } from '@/components/Overlay/store';
import Typewriter3D from './Typewriter3D';

interface PhotoCardProps {
    id: number;
    rowIndex: number;
    colIndex: number;
    url: string;
    description: string;
    leftText?: string;
    rightText?: string;
    basePos: THREE.Vector3;
    worldOffset: any;
    cursor: MutableRefObject<THREE.Vector3>;
    worldSize: { width: number; height: number };
}

export default function PhotoCard({ id, rowIndex, colIndex, url, description, leftText, rightText, basePos, worldOffset, cursor, worldSize }: PhotoCardProps) {
    const group = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const { selectedId, setSelected } = useSelectionStore();
    const isSelected = selectedId === id;

    // ... (DNA and useFrame stay same)

    // Random "DNA" 
    const dna = useMemo(() => ({
        speed: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        scale: 1 + Math.random() * 0.5,
    }), []);

    useFrame((state, delta) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime;

        // ----------------------
        // 1. Alternating "Conveyor" Motion
        // ----------------------
        // Rows: Even -> Right, Odd -> Left
        // Cols: Even -> Down, Odd -> Up
        const rowDir = rowIndex % 2 === 0 ? 1 : -1;
        const colDir = colIndex % 2 === 0 ? -1 : 1;

        const SPEED = 2.0; // "Slightly increase speed"

        // Calculate dynamic offset based on time and direction
        const conveyorX = t * SPEED * rowDir;
        const conveyorY = t * SPEED * colDir;

        // Apply Position Wrapping
        // Total Position = Base + Global Offset + Conveyor Offset
        let x = (basePos.x + worldOffset.current.offset.x + conveyorX) % worldSize.width;
        let y = (basePos.y - worldOffset.current.offset.y + conveyorY) % worldSize.height; // Note -worldOffset.y for natural scroll

        // Wrap around logic
        if (x < -worldSize.width / 2) x += worldSize.width;
        if (x > worldSize.width / 2) x -= worldSize.width;
        if (y < -worldSize.height / 2) y += worldSize.height;
        if (y > worldSize.height / 2) y -= worldSize.height;

        // ----------------------
        // 2. Antigravity Physics
        // ----------------------
        // Floating Sine Wave
        const floatY = Math.sin(t * dna.speed + dna.phase) * 0.3;
        const floatZ = Math.cos(t * 0.5 + dna.phase) * 0.5;

        // Gravity Well (Cursor Attraction)
        const dx = cursor.current.x - x;
        const dy = cursor.current.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const RADIUS = 6;
        const FORCE_STR = 1;

        let fx = 0, fy = 0, fz = 0;

        if (dist < RADIUS) {
            const force = (1 - dist / RADIUS) * FORCE_STR;
            fx = (dx / dist) * force * 1.5;
            fy = (dy / dist) * force * 1.5;
            fz = force * 2;
        }

        // ----------------------
        // 3. Smooth Updates
        // ----------------------
        const tx = x + fx;
        const ty = y + fy + floatY;
        const tz = (isSelected ? 2 : 0) + fz + floatZ; // Bring forward if selected

        group.current.position.x = tx;
        group.current.position.y = ty;
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, tz, 3 * delta);

        // Tilt / Rotation (Flatten if selected)
        const targetRotX = isSelected ? 0 : ((y / viewport.height) * 0.2 - fy * 0.1);
        const targetRotY = isSelected ? 0 : (-(x / viewport.width) * 0.2 + fx * 0.1);

        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 4 * delta);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 4 * delta);
    });

    // Click Handler
    const handleClick = (e: any) => {
        e.stopPropagation();
        // Toggle selection (pass current URL and Desc to store)
        setSelected(isSelected ? null : id, url, description, leftText, rightText);
    };

    return (
        <group ref={group}>
            <Image
                url={url}
                scale={[3 * dna.scale, 4 * dna.scale]}
                transparent
                opacity={0.9}
                toneMapped={false}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            />
        </group>
    );
}
