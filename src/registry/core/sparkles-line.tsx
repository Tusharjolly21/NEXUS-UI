"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { Sparkles as SparklesParticles } from "@/components/sparkles";

export function PreviewSparklesLine({
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
