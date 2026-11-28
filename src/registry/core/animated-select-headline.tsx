"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedSelectHeadline } from "@/components/animated-select-headline";

export function PreviewAnimatedSelectHeadline() {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white px-8 py-12 dark:border-white/10 dark:bg-zinc-950">
      <AnimatedSelectHeadline
        words={["warp speed", "record time", "pure flow", "light speed"]}
        prefix="Build amazing websites at"
        headingClassName="dark:text-white"
      />
    </div>
  );
}
