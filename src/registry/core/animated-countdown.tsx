"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedCountdown } from "@/components/animated-countdown";

function countdownTarget(days: number, hours = 0, minutes = 0) {
  return new Date(
    Date.now() + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  );
}

function PreviewAnimatedCountdownModern() {
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

function PreviewAnimatedCountdownDigital() {
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

function PreviewAnimatedCountdownMinimal() {
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

export function PreviewAnimatedCountdown({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <PreviewAnimatedCountdownMinimal />
  ) : (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4">
      <PreviewAnimatedCountdownModern />
      <PreviewAnimatedCountdownDigital />
      <PreviewAnimatedCountdownMinimal />
    </div>
  );
}
