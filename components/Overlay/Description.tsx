'use client';

import { useEffect, useState } from 'react';
import { useSelectionStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';

export default function DescriptionOverlay() {
    const { description, selectedId } = useSelectionStore();
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!description) {
            setDisplayedText('');
            return;
        }

        let i = 0;
        setDisplayedText('');
        const interval = setInterval(() => {
            setDisplayedText(description.slice(0, i + 1));
            i++;
            if (i >= description.length) clearInterval(interval);
        }, 50); // Typing speed

        return () => clearInterval(interval);
    }, [description]);

    if (!description) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
            {/* Backdrop Blur to focus on text? Maybe too much. Let's keep it minimal. */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-black/80 backdrop-blur-md p-8 border border-white/10 rounded-sm max-w-lg text-center"
            >
                <p className="text-xs text-white/50 uppercase tracking-widest mb-4">
                    FILE_ID_{[selectedId]}
                </p>
                <h2 className="text-3xl text-white font-mono leading-relaxed">
                    {displayedText}
                    <span className="animate-pulse">_</span>
                </h2>
            </motion.div>
        </div>
    );
}
