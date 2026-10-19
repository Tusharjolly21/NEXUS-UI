"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DynamicPreview } from "@/components/library/dynamic-preview";
import { cn } from "@/lib/utils";

/**
 * Previews lay out on a canvas `canvas` px wide whose height follows the tile's shape, then the
 * canvas is scaled to fit. A smaller canvas makes a small widget fill more of its tile.
 */
const DEFAULT_CANVAS = 760;

/** Bento footprint, sized to what the component needs: small, wide, tall or large. */
export type TileShape = "small" | "wide" | "tall" | "large";

export const SHAPE_CLASSES: Record<TileShape, string> = {
  small: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  large: "col-span-2 row-span-2",
};

export type TileTint = "violet" | "sky" | "peach" | "mint" | "butter" | "pink";

const TINTS: Record<TileTint, string> = {
  violet: "bg-tint-violet",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
  butter: "bg-tint-butter",
  pink: "bg-tint-pink",
};

function useCanvasFit(canvasWidth: number) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [box, setBox] = React.useState({ width: canvasWidth, height: canvasWidth, scale: 0.3 });
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const w = node.clientWidth || 1;
      const h = node.clientHeight || 1;
      setBox({ width: canvasWidth, height: Math.round((canvasWidth * h) / w), scale: w / canvasWidth });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [canvasWidth]);
  return { ref, box };
}

/** Mounts the live preview only once the tile is close to the viewport. */
function useNearViewport(margin = "400px") {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);
  return { ref, near };
}

/**
 * A quiet gallery tile: the live component is the thumbnail. The name and the open action
 * appear on hover or keyboard focus, and stay visible on touch screens.
 */
export function GalleryTile({
  slug,
  name,
  exportName,
  tint,
  canvas = DEFAULT_CANVAS,
}: {
  slug: string;
  name: string;
  exportName: string;
  tint: TileTint;
  /** Canvas width in px; smaller makes the component appear larger. */
  canvas?: number;
}) {
  const { ref: stageRef, box } = useCanvasFit(canvas);
  const { ref: nearRef, near } = useNearViewport();

  return (
    <div ref={nearRef} className={cn("group relative h-full rounded-tile p-3", TINTS[tint])}>
      <div ref={stageRef} className="relative h-full overflow-hidden rounded-[20px] bg-card">
        <div
          className="absolute left-1/2 top-1/2 flex items-center justify-center [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none"
          style={{ width: box.width, height: box.height, transform: `translate(-50%, -50%) scale(${box.scale})` }}
        >
          {near ? <DynamicPreview exportName={exportName} compact /> : null}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none",
        )}
      >
        <span className="pg-glass max-w-[70%] truncate rounded-full bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground">
          {name}
        </span>
        <Link
          href={`/components/${slug}`}
          aria-label={`Open ${name}`}
          className="pg-glass pointer-events-auto grid size-9 place-items-center rounded-full bg-foreground text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
