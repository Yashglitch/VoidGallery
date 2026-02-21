import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

export function useGravityCursor() {
    const { pointer, viewport } = useThree();
    const cursor = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(() => {
        // Convert normalized pointer (-1 to 1) to world units at z=0
        // viewport.width is the total width in world units at z=0
        const x = (pointer.x * viewport.width) / 2;
        const y = (pointer.y * viewport.height) / 2;
        cursor.current.set(x, y, 0);
    });

    return cursor;
}
