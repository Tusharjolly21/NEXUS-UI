import { create } from 'zustand';

type MacbookStore = {
    color: string;
    setColor: (color: string) => void;
    scale: number;
    setScale: (scale: number) => void;
    texture: string;
    setTexture: (texture: string) => void;
    reset: () => void;
};

const initialState = {
    color: '#2e2c2e',
    scale: 0.08,
    texture: '/videos/feature-1.mp4',
};

const useMacbookStore = create<MacbookStore>((set) => ({
    ...initialState,
    setColor: (color) => set({ color }),
    setScale: (scale) => set({ scale }),
    setTexture: (texture) => set({ texture }),

    reset: () => set(initialState),
}))

export default useMacbookStore;
