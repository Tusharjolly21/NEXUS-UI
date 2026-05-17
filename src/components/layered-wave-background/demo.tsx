"use client";

import { LayeredWaveBackground } from "./layered-wave-background";

export function LayeredWaveBackgroundDemo() {
  return (
    <LayeredWaveBackground className="h-[560px] rounded-2xl">
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            Coming soon
          </p>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
            Launch with motion.
          </h2>
          <p className="mt-4 max-w-xl text-white/65">
            Layered animated gradients for modern hero sections and event pages.
          </p>
        </div>
      </div>
    </LayeredWaveBackground>
  );
}
