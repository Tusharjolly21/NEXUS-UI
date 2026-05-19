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
};

const CANVAS_WIDTH = 1040;
const CANVAS_HEIGHT = 1040;
const PREVIEW_INSET_SCALE = 0.9;

function usePreviewScale() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.5);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      const next = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT) * PREVIEW_INSET_SCALE;
      setScale(Math.max(0.2, Math.min(next, 1)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, scale };
}

export function ComponentCardPreview({
  Preview,
  hasVariants = false,
  activeIndex = 0,
  variantCount = 0,
  onCycleVariant,
  onSelectVariant,
}: ComponentCardPreviewProps) {
  const { ref, scale } = usePreviewScale();

  return (
    <div className="relative shrink-0 overflow-hidden">
      <div
        ref={ref}
        className="relative isolate aspect-square w-full overflow-hidden rounded-[24px] border border-black/5 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:border-white/10"
      >
        <div className="lf-grid absolute inset-0 opacity-20" />
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
              className="absolute left-1/2 top-1/2 flex items-center justify-center overflow-hidden [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none [&>*]:!rounded-[24px] [&_canvas]:!h-full [&_canvas]:!w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover [&_img]:!object-center [&_img]:!transition-transform [&_img]:!duration-500 group-hover:[&_img]:!scale-[1.04]"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              <Preview compact />
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
