"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { WordMagnet } from "@/components/word-magnet";

export function PreviewWordMagnet() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,.16),transparent_34%),#f8fafc] px-6 dark:border-white/10 dark:bg-[radial-gradient(circle_at_50%_25%,rgba(45,212,191,.14),transparent_34%),#050505]">
      <WordMagnet
        text="Move your cursor through this magnetic headline and watch every word gently drift aside before snapping back into a clean readable rhythm"
        radius={118}
        force={0.42}
        damping={24}
        returnDelay={260}
        disableOnMobile={false}
        className="max-w-2xl text-2xl leading-tight sm:text-3xl"
        wordClassName="rounded-lg px-0.5"
      />
    </div>
  );
}
