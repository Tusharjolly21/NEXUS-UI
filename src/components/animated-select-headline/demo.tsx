"use client";

import { AnimatedSelectHeadline } from "./animated-select-headline";

export function AnimatedSelectHeadlineDemo() {
  return (
    <div className="flex min-h-64 items-center justify-center bg-white px-8 py-16 dark:bg-zinc-950">
      <AnimatedSelectHeadline
        words={["warp speed", "record time", "pure flow", "light speed"]}
        prefix="Build amazing websites at"
        headingClassName="dark:text-white"
      />
    </div>
  );
}
