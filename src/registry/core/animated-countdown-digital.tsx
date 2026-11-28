"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedCountdown } from "@/components/animated-countdown";

function countdownTarget(days: number, hours = 0, minutes = 0) {
  return new Date(
    Date.now() + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  );
}

export function PreviewAnimatedCountdownDigital() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-cyan-400/10 bg-zinc-950 p-4">
      <AnimatedCountdown
        targetDate={countdownTarget(2, 8, 20)}
        variant="digital"
        size="md"
        showSeparators
      />
    </div>
  );
}
