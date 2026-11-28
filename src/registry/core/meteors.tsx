"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { Meteors } from "@/components/meteors";

export function PreviewMeteors({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[420px] max-h-[420px]" : "min-h-[500px] py-14",
      )}
    >
      <Meteors
        number={compact ? 32 : 28}
        minDelay={0.06}
        maxDelay={1.9}
        minDuration={2.8}
        maxDuration={5.6}
        angle={214}
        color="#93c5fd"
        intensity={compact ? "medium" : "high"}
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050911] text-white",
          compact
            ? "max-w-2xl min-h-[260px] px-7 py-16"
            : "max-w-4xl min-h-[360px] px-10 py-24",
        )}
      >
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">
            Meteor Effect
          </p>
          <h3
            className={cn(
              "mt-2 font-semibold tracking-tight",
              compact ? "text-2xl" : "text-4xl",
            )}
          >
            Diagonal cinematic beams
          </h3>
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl text-slate-300/85",
              compact ? "text-xs" : "text-sm",
            )}
          >
            Reusable motion background for heroes, cards, and pricing sections.
          </p>
        </div>
      </Meteors>
    </div>
  );
}
