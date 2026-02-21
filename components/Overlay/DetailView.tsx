'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelectionStore } from './store';
import { motion } from 'framer-motion';
import { usePinch } from '@use-gesture/react';

export default function DetailView() {
    const { selectedId, setSelected, description, selectedUrl, leftText, rightText } = useSelectionStore();
    const [displayedText, setDisplayedText] = useState('');
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const pinchRef = useRef<HTMLDivElement>(null);

    // Pinch Handler for Mobile
    usePinch(
        ({ offset: [s] }) => {
            setScale(Math.max(1, Math.min(5, s)));
        },
        {
            target: pinchRef,
            scaleBounds: { min: 1, max: 5 },
        }
    );

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelected(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setSelected]);

    // Reset zoom and rotation on open
    useEffect(() => {
        setScale(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
    }, [selectedId]);

    // Typewriter Effect
    useEffect(() => {
        if (!selectedId || !description) {
            setDisplayedText('');
            return;
        }

        setDisplayedText('');
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(description.slice(0, i + 1));
            i++;
            if (i >= description.length) clearInterval(interval);
        }, 30);

        return () => clearInterval(interval);
    }, [selectedId, description]);

    if (selectedId === null) return null;

    // Use stored URL (Real HD photo) or fallback
    const url = selectedUrl || `https://picsum.photos/seed/${selectedId + 100}/1600/1200`;

    // Zoom Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = -e.deltaY * 0.002;
        setScale(s => Math.max(1, Math.min(5, s + delta)));
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current || scale <= 1) return;
        e.stopPropagation();
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    // Rotate Handler
    const handleRotate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRotation(r => r + 90);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 w-screen h-screen overflow-hidden"
            style={{ backdropFilter: 'blur(30px)' }}
            onClick={() => setSelected(null)}
        >
            <div
                className="w-full h-full max-w-[95vw] sm:max-w-[1600px] flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-10 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Top Left Corner */}
                <button
                    onClick={() => setSelected(null)}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        zIndex: 100,
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                    title="Close"
                >
                    ×
                </button>

                {/* LEFT TEXT PANEL */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden md:flex flex-col justify-center items-start w-[250px] space-y-4 text-left pointer-events-none"
                >
                    {leftText && leftText.split('\n').map((line, i) => (
                        <p key={i} className="text-white/70 font-light text-sm tracking-widest leading-loose font-mono border-l border-white/20 pl-4">
                            {line}
                        </p>
                    ))}
                </motion.div>

                {/* CENTER IMAGE AREA */}
                <div
                    className="relative flex flex-col items-center justify-center flex-1 w-full max-h-[80vh]"
                    onWheel={handleWheel}
                >
                    {/* Rotate Button - Fixed Position */}
                    <button
                        onClick={handleRotate}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '25px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            zIndex: 100,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            backdropFilter: 'blur(10px)'
                        }}
                        title="Rotate Image"
                    >
                        ⟳ Rotate
                    </button>

                    {/* Image Container with Rotation Wrapper */}
                    <div
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.4s ease-out'
                        }}
                    >
                        <motion.div
                            ref={pinchRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative shadow-2xl z-10"
                            style={{
                                border: '2px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 0 80px rgba(0,0,0,0.6)',
                                cursor: scale > 1 ? 'grab' : 'zoom-in',
                                overflow: 'hidden'
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            <img
                                src={url}
                                alt="Selected"
                                className="block max-h-[70vh] max-w-[60vw] w-auto h-auto object-contain bg-black"
                                style={{
                                    transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                                    transformOrigin: 'center center',
                                    transition: isDragging.current ? 'none' : 'transform 0.2s ease-out'
                                }}
                                draggable={false}
                            />
                        </motion.div>
                    </div>

                    {/* Bottom Caption */}
                    <div className="mt-8 text-center z-20 pointer-events-none">
                        <p className="text-white font-mono text-xl tracking-wide bg-black/60 px-6 py-2 rounded-lg inline-block border border-white/10">
                            {displayedText}
                            <span className="animate-pulse text-cyan-400">_</span>
                        </p>
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-3">
                            Scroll to Zoom • Drag to Pan // ID: {selectedId}
                        </p>
                    </div>
                </div>

                {/* RIGHT TEXT PANEL */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden md:flex flex-col justify-center items-end w-[250px] space-y-4 text-right pointer-events-none"
                >
                    {rightText && rightText.split('\n').map((line, i) => (
                        <p key={i} className="text-white/70 font-light text-sm tracking-widest leading-loose font-mono border-r border-white/20 pr-4">
                            {line}
                        </p>
                    ))}
                </motion.div>

                {/* Mobile Text Fallback */}
                {(leftText || rightText) && (
                    <div className="md:hidden w-full text-center space-y-4 text-white/60 text-sm font-mono mt-4">
                        <p>{leftText}</p>
                        <p>{rightText}</p>
                    </div>
                )}

            </div>
        </div>
    );
}
