'use client';

import { Text } from '@react-three/drei';
import { useState, useEffect } from 'react';

interface Typewriter3DProps {
    text: string;
    position: [number, number, number];
}

export default function Typewriter3D({ text, position }: Typewriter3DProps) {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 30); // Speed

        return () => clearInterval(interval);
    }, [text]);

    return (
        <Text
            position={position}
            fontSize={0.25}
            color="white"
            maxWidth={3}
            anchorX="center"
            anchorY="top"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
            {displayed}
            {displayed.length < text.length && '_'}
        </Text>
    );
}
