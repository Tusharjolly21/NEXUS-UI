"use client";

import { ParticleNoise } from "./particle-noise";

export function ParticleNoiseDemo() {
  return (
    <div className="h-[560px] overflow-hidden rounded-2xl bg-zinc-950">
      <ParticleNoise
        positionY={0.45}
        zoom={0.9}
        spacing={18}
        inflation={58}
        speed="slow"
        backgroundColor="#000000"
        dotColor="#f8fafc"
        secondaryDotColor="#94a3b8"
        opacity={0.86}
        surfaceBias={0.82}
        gridJitter={0}
      />
    </div>
  );
}
