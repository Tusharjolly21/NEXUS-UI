"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "@/components/background-gradient";

export function PreviewBackgroundGradient({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[260px] py-8",
      )}
    >
      <BackgroundGradient
        as="section"
        className={cn(
          "w-full rounded-2xl border-2",
          compact ? "max-w-md" : "max-w-sm aspect-[4/5]",
        )}
        containerClassName={cn(
          "rounded-[inherit] space-y-3",
          compact ? "p-4" : "p-7",
        )}
        surfaceClassName="bg-white dark:bg-white"
        colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]}
        animationSpeed={compact ? 1 : 1.25}
        blur={compact ? 20 : 30}
        interactive
      >
        <div className="overflow-hidden rounded-xl border-2 border-border/70">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
            alt="Abstract UI gradient"
            className={cn(
              "h-full w-full object-cover transition duration-500",
              compact ? "max-h-32" : "max-h-48",
            )}
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Background Gradient
        </p>
        <h3
          className={cn(
            "font-semibold tracking-tight text-foreground",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          Animated glow wrapper for premium cards
        </h3>
        <p
          className={cn(
            "leading-relaxed text-muted-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Use this component to frame cards, call-to-action blocks, and content
          panels with a soft animated glow while keeping all text highly
          readable on a clean inner surface.
        </p>
      </BackgroundGradient>
    </div>
  );
}
