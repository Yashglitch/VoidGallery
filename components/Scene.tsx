'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Text } from '@react-three/drei'; // Only Text needed
import GalaxyEngine from './Galaxy/Engine';

export default function Scene() {
    return (
        <div className="w-full h-full absolute top-0 left-0 bg-black">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true }} // Clean sharp edges
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#000000']} />

                    {/* Basic Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />

                    {/* Background Text */}
                    <Text
                        position={[0, 0, -50]}
                        fontSize={12}
                        color="#606060"
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        EXPLORE THE VOID
                    </Text>

                    {/* Core Engine */}
                    <GalaxyEngine />

                </Suspense>
            </Canvas>
        </div>
    );
}
