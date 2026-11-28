"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedCountdown } from "@/components/animated-countdown";

function countdownTarget(days: number, hours = 0, minutes = 0) {
  return new Date(
    Date.now() + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  );
}

export function PreviewAnimatedCountdownMinimal() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-background p-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">Sale ends in</p>
      <AnimatedCountdown
        targetDate={countdownTarget(0, 11, 42)}
        variant="minimal"
        showDays={false}
        size="md"
      />
    </div>
  );
}
