import { create } from 'zustand';

interface SelectionState {
    selectedId: number | null;
    selectedUrl: string | null;
    description: string | null;
    leftText: string | null;
    rightText: string | null;
    setSelected: (id: number | null, url?: string | null, desc?: string | null, left?: string | null, right?: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
    selectedId: null,
    selectedUrl: null,
    description: null,
    leftText: null,
    rightText: null,
    setSelected: (id, url = null, desc = null, left = null, right = null) => {
        if (id === null) {
            set({ selectedId: null, selectedUrl: null, description: null, leftText: null, rightText: null });
            return;
        }

        // Use provided data if available
        if (url) {
            set({
                selectedId: id,
                selectedUrl: url,
                description: desc ?? 'Unknown Memory',
                leftText: left ?? '',
                rightText: right ?? ''
            });
        } else {
            // Fallback
            set({
                selectedId: id,
                selectedUrl: null,
                description: "Unknown Memory",
                leftText: '',
                rightText: ''
            });
        }
    }
}));
