"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { SquigglyText, SquigglyDrinksHeadline } from "@/components/squiggly-text";

export function PreviewSquigglyText({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={
        compact
          ? "flex min-h-[180px] w-full min-w-0 flex-col justify-center px-4 py-8"
          : "flex min-h-[260px] w-full min-w-0 flex-col items-center justify-center px-4 py-12 sm:py-16"
      }
    >
      {compact ? (
        <SquigglyText
          as="div"
          text="Motion that sells."
          textClassName="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl"
          steps={5}
          stepDuration={90}
          scale={[5, 7]}
          baseFrequency={0.022}
          numOctaves={3}
        />
      ) : (
        <SquigglyDrinksHeadline />
      )}
    </div>
  );
}
