"use client";

import * as React from "react";
import { DynamicPreview } from "@/components/library/dynamic-preview";

/**
 * Renders a live preview on a canvas `canvas` px wide whose height follows the container's shape,
 * then scales it to fit. Previews mount while the box is near the viewport and unmount when it is far away.
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
    if (!node) return;
    // Mount near the viewport and unmount once well away from it, so scrolling a long wall never
    // leaves hundreds of animated previews running at the same time.
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "500px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);

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
