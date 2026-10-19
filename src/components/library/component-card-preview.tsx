"use client";

import * as React from "react";
import type { ComponentType } from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type ComponentCardPreviewProps = {
  Preview: ComponentType<{ compact?: boolean }> | null;
  hasVariants?: boolean;
  activeIndex?: number;
  variantCount?: number;
  onCycleVariant?: () => void;
  onSelectVariant?: (index: number) => void;
  /**
   * `inset` (default) renders the preview as a rounded square floating inside a gridded frame.
   * `bleed` fills a 4:3 tile edge to edge — used by the Bencho-style catalog wall, where the
   * surrounding card supplies the rounding.
   */
  frame?: "inset" | "bleed";
};

const FRAMES = {
  inset: { width: 1040, height: 1040, insetScale: 0.9 },
  bleed: { width: 1280, height: 960, insetScale: 1 },
} as const;

function usePreviewScale(frame: keyof typeof FRAMES) {
  const { width: canvasWidth, height: canvasHeight, insetScale } = FRAMES[frame];
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.5);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      const next = Math.min(width / canvasWidth, height / canvasHeight) * insetScale;
      setScale(Math.max(0.2, Math.min(next, 1)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [canvasWidth, canvasHeight, insetScale]);

  return { ref, scale };
}

// Defers rendering until the card is near the viewport — prevents 50+ simultaneous
// preview animations from running on page load when most cards are below the fold.
function useIsNearViewport(rootMargin = "300px") {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [isNear, setIsNear] = React.useState(false);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    // If IntersectionObserver is not available (SSR / old browser), reveal immediately.
    if (typeof IntersectionObserver === "undefined") {
      setIsNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect(); // fire once, then stop watching
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { sentinelRef, isNear };
}

export function ComponentCardPreview({
  Preview,
  hasVariants = false,
  activeIndex = 0,
  variantCount = 0,
  onCycleVariant,
  onSelectVariant,
  frame = "inset",
}: ComponentCardPreviewProps) {
  const { ref, scale } = usePreviewScale(frame);
  const canvas = FRAMES[frame];
  const bleed = frame === "bleed";
  const { sentinelRef, isNear } = useIsNearViewport();

  return (
    <div className="relative shrink-0 overflow-hidden">
      {/* Invisible sentinel that sits at the top of the card for IntersectionObserver */}
      <div ref={sentinelRef} className="absolute inset-x-0 top-0 h-px" aria-hidden />

      <div
        ref={ref}
        className={cn(
          "relative isolate w-full overflow-hidden",
          bleed
            ? "aspect-[4/3] bg-zinc-950"
            : "aspect-square rounded-[24px] border border-black/5 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:border-white/10",
        )}
      >
        {!bleed && <div className="lf-grid absolute inset-0 opacity-20" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {Preview ? (
          <div
            role="button"
            tabIndex={0}
            aria-label={hasVariants ? "Show next preview variant" : "Preview component"}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCycleVariant?.();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onCycleVariant?.();
              }
            }}
          >
            <div
              className={cn(
                "absolute left-1/2 top-1/2 flex items-center justify-center overflow-hidden [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none",
                bleed ? "[&>*]:!rounded-none" : "[&>*]:!rounded-[24px]",
                "[&_canvas]:!h-full [&_canvas]:!w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover [&_img]:!object-center [&_img]:!transition-transform [&_img]:!duration-500 group-hover:[&_img]:!scale-[1.04]",
              )}
              style={{
                width: canvas.width,
                height: canvas.height,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              {isNear ? (
                <Preview compact />
              ) : (
                // Skeleton placeholder — exact same dimensions as the live preview.
                // Shown until the card scrolls near the viewport.
                <div className={cn("h-full w-full bg-zinc-900/60", !bleed && "rounded-[24px]")} />
              )}
            </div>
          </div>
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
            <Layers className="size-8 opacity-40" />
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">
              Template
            </span>
          </div>
        )}

        {hasVariants && variantCount > 1 ? (
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {Array.from({ length: variantCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectVariant?.(index);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  index === activeIndex
                    ? "w-4 bg-white/80"
                    : "w-1.5 bg-white/30 hover:bg-white/50",
                )}
                aria-label={`Variant ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
