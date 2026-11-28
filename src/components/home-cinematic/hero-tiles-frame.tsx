"use client";

import * as React from "react";

export type PieceId = "glyph" | "globe" | "avatars" | "scenes" | "apply" | "dictate";

/** Two columns, each a stack of whole components with the same gap between them. */
const COLUMNS: PieceId[][] = [
  ["glyph", "globe", "avatars"],
  ["scenes", "apply", "dictate"],
];

/** The width each component is drawn at before it is shrunk to its column. Tall ones are drawn wider, so they come out shorter. */
const DESIGNED_WIDTH: Partial<Record<PieceId, number>> = { scenes: 620, avatars: 300, globe: 300 };
const DEFAULT_WIDTH = 400;

/**
 * Lays a component out at the width it was designed for, then scales the whole thing down to the width it is given, so
 * it shows complete and in proportion (never cropped, never re-wrapped). It stays live: clicks and hovers still work.
 */
function Scaled({ id, children }: { id: PieceId; children: React.ReactNode }) {
  const designed = DESIGNED_WIDTH[id] ?? DEFAULT_WIDTH;
  const outer = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const [fit, setFit] = React.useState<{ scale: number; height: number } | null>(null);

  React.useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const scale = o.clientWidth / designed;
      setFit({ scale, height: i.offsetHeight * scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [designed]);

  return (
    <div ref={outer} className="relative w-full" style={{ height: fit?.height }}>
      <div
        ref={inner}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: designed, transform: fit ? `scale(${fit.scale})` : undefined, visibility: fit ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The hero's right side: the newest components, whole, in two even columns with the same gap everywhere. `render` fills
 * a piece with its live component; without it the box is empty but has the same width.
 */
export function PieceStack({ render }: { render?: Partial<Record<PieceId, React.ReactNode>> }) {
  return (
    <div className="mx-auto grid min-h-[560px] w-full max-w-[540px] grid-cols-2 items-start gap-4">
      {COLUMNS.map((col, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-4">
          {col.map((id) => (render?.[id] ? <Scaled key={id} id={id}>{render[id]}</Scaled> : null))}
        </div>
      ))}
    </div>
  );
}
