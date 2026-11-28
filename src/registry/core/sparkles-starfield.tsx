"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { Sparkles as SparklesParticles } from "@/components/sparkles";

export function PreviewSparklesStarfield({
  compact = true,
}: { compact?: boolean } = {}) {
  const headingClass = compact
    ? "text-2xl"
    : "md:text-7xl text-3xl lg:text-8xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <SparklesParticles
          background
          count={compact ? 96 : 145}
          density="high"
          color="#e6f3ff"
          minSize={compact ? 0.7 : 0.85}
          maxSize={compact ? 2 : 2.6}
          speed={0.95}
          opacity={1}
          direction="random"
          enableGlow
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,transparent_0%,rgba(0,0,0,0.28)_100%)]" />
        <p
          className={cn(
            "relative z-20 text-center font-bold text-white",
            headingClass,
          )}
        >
          Build great products
        </p>
      </div>
    </div>
  );
}
