'use client';

import Scene from '@/components/Scene';
import DetailView from '@/components/Overlay/DetailView';

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden relative select-none">
      <Scene />
      <DetailView />
    </main>
  );
}
