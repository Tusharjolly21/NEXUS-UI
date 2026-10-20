"use client";

import { AnimatedSelectHeadline } from "./animated-select-headline";

export function AnimatedSelectHeadlineDemo() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-6 px-6 pb-20 pt-16">
      <AnimatedSelectHeadline words={["warp speed", "record time", "pure flow", "light speed"]} prefix="Build amazing websites at" />
    </div>
  );
}
