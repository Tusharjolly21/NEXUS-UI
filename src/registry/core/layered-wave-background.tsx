"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { LayeredWaveBackground } from "@/components/layered-wave-background";

export function PreviewLayeredWaveBackground() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <LayeredWaveBackground
        gradientColors={["#7c3aed", "#06b6d4", "#ec4899"]}
        backgroundColor="#020617"
        waveLayers={5}
        waveWidth={1.2}
        waveHeight={1.06}
        blurIntensity={20}
        opacity={0.72}
        speed="medium"
        className="h-full min-h-0 rounded-3xl"
      >
        <div className="flex h-full items-center px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">
              Animated
            </p>
            <p className="mt-2 max-w-56 text-xl font-semibold leading-tight text-white">
              Layered gradient waves
            </p>
          </div>
        </div>
      </LayeredWaveBackground>
    </div>
  );
}
