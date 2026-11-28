"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { Sparkles as SparklesParticles } from "@/components/sparkles";

function PreviewSparklesLine({
  compact = true,
}: { compact?: boolean } = {}) {
  const headingClass = compact
    ? "text-3xl"
    : "md:text-7xl text-3xl lg:text-9xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <h1
          className={cn(
            "relative z-20 text-center font-bold text-white",
            headingClass,
          )}
        >
          NEXUS-UI
        </h1>
        <div
          className={cn(
            "relative",
            compact ? "h-28 w-[18rem]" : "h-40 w-[40rem]",
          )}
        >
          <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
          <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          <div className="h-full w-full opacity-100">
            <SparklesParticles
              className="h-full w-full"
              count={compact ? 180 : 260}
              density="high"
              color="#a8d7ff"
              minSize={0.55}
              maxSize={1.45}
              speed={1.15}
              opacity={0.95}
              direction="down"
              enableGlow
            />
          </div>
          <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
        </div>
      </div>
    </div>
  );
}

function PreviewSparklesStarfield({
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

export function PreviewSparkles({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "grid w-full gap-3",
        compact ? "grid-rows-2" : "grid-rows-2 gap-4",
      )}
    >
      <PreviewSparklesLine compact={compact} />
      <PreviewSparklesStarfield compact={compact} />
    </div>
  );
}
