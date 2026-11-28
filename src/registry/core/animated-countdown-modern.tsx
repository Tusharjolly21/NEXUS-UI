"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedCountdown } from "@/components/animated-countdown";

function countdownTarget(days: number, hours = 0, minutes = 0) {
  return new Date(
    Date.now() + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  );
}

export function PreviewAnimatedCountdownModern() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent_35%),linear-gradient(180deg,var(--background),var(--muted))] p-4 text-center dark:bg-zinc-950">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Launching in
      </p>
      <AnimatedCountdown
        targetDate={countdownTarget(7, 12, 45)}
        variant="modern"
        size="md"
      />
    </div>
  );
}
