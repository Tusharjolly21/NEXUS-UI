"use client";

import * as React from "react";
import { DynamicPreview } from "@/components/library/dynamic-preview";

/**
 * Renders a live preview on a canvas `canvas` px wide whose height follows the container's shape,
 * then scales it to fit. Previews mount only once the box is near the viewport.
 */
export function ScaledPreview({ exportName, canvas, eager = false }: { exportName: string; canvas: number; eager?: boolean }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [box, setBox] = React.useState({ width: canvas, height: canvas, scale: 0.3 });
  const [near, setNear] = React.useState(eager);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const w = node.clientWidth || 1;
      const h = node.clientHeight || 1;
      setBox({ width: canvas, height: Math.round((canvas * h) / w), scale: w / canvas });
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(node);
    return () => resize.disconnect();
  }, [canvas]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || eager) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none"
        style={{ width: box.width, height: box.height, transform: `translate(-50%, -50%) scale(${box.scale})` }}
      >
        {near ? <DynamicPreview exportName={exportName} compact /> : null}
      </div>
    </div>
  );
}
