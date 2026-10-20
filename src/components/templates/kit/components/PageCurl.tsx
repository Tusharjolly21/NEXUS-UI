"use client";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";

type P = [number, number];

export interface PageCurlProps {
  width?: number;
  height?: number;
  front?: ReactNode;
  back?: ReactNode;
  /** Peeks the corner by itself until the user grabs it. */
  autoplay?: boolean;
}

// Clip a polygon to the half-plane (p - m)·n <= 0 (Sutherland–Hodgman, one edge).
function clip(poly: P[], m: P, n: P, keepInside: boolean): P[] {
  const side = (p: P) => ((p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1]) * (keepInside ? 1 : -1);
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if (sa * sb < 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
const reflect = (p: P, m: P, n: P): P => {
  const d = (p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1];
  return [p[0] - 2 * d * n[0], p[1] - 2 * d * n[1]];
};
const poly = (pts: P[]) => (pts.length ? `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})` : "polygon(0 0)");

const FRONT = (
  <div className="flex h-full flex-col justify-between p-7">
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">Letter No. 7</span>
      <span className="text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f]">Peel back the corner.</span>
      <span className="max-w-[260px] text-[14px] leading-[1.5] text-[#6e6e73]">Grab the bottom-right corner and drag it across. The fold follows your hand, and the paper behind shows through.</span>
    </div>
    <span className="text-[13px] italic text-[#86868b]">— turn over</span>
  </div>
);
const BACK = (
  <div className="flex h-full flex-col items-center justify-center gap-2 p-7 text-center" style={{ background: "radial-gradient(90% 70% at 30% 20%, #ffe1c2, rgba(255,225,194,0) 60%), linear-gradient(160deg,#e7f0ff,#c9d8ff 60%,#b9a8ff)" }}>
    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5e5ce6]">You found it</span>
    <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">20% off, today only</span>
    <span className="rounded-full bg-white/80 px-3 py-1 text-[13px] font-semibold tracking-[0.1em] text-[#1d1d1f]">PEEL20</span>
  </div>
);

/**
 * A page you peel from the corner. The fold line is the perpendicular bisector
 * between the corner and your pointer: the page is clipped on one side of it,
 * and the folded flap is the corner region mirrored across it, shaded as the
 * paper's back. Let go far enough and it peels off; otherwise it lies back down.
 */
export default function PageCurl({ width = 400, height = 260, front = FRONT, back = BACK, autoplay = false }: PageCurlProps) {
  const C: P = [width, height];
  const px = useMotionValue(width);
  const py = useMotionValue(height);
  const [shape, setShape] = useState({ page: poly([[0, 0], [width, 0], [width, height], [0, height]]), flap: "polygon(0 0)", shadow: "polygon(0 0)", angle: 0, mid: [width, height] as P });
  const [peeled, setPeeled] = useState(false);
  const dragging = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  const compute = () => {
    const p: P = [px.get(), py.get()];
    const dx = C[0] - p[0], dy = C[1] - p[1];
    const len = Math.hypot(dx, dy);
    const rect: P[] = [[0, 0], [width, 0], [width, height], [0, height]];
    if (len < 1) {
      setShape((s) => ({ ...s, page: poly(rect), flap: "polygon(0 0)", shadow: "polygon(0 0)" }));
      return;
    }
    const n: P = [dx / len, dy / len];
    const m: P = [(C[0] + p[0]) / 2, (C[1] + p[1]) / 2];
    const page = clip(rect, m, n, true);
    const folded = clip(rect, m, n, false).map((q) => reflect(q, m, n));
    // a soft shadow strip just beyond the fold on the page side
    const sm: P = [m[0] - n[0] * 14, m[1] - n[1] * 14];
    const shadow = clip(clip(rect, m, n, true), sm, n, false);
    setShape({ page: poly(page), flap: poly(folded), shadow: poly(shadow), angle: (Math.atan2(n[1], n[0]) * 180) / Math.PI, mid: m });
  };
  useMotionValueEvent(px, "change", compute);
  useMotionValueEvent(py, "change", compute);

  const settle = () => {
    const far = Math.hypot(C[0] - px.get(), C[1] - py.get()) > Math.hypot(width, height) * 0.6;
    if (far) {
      setPeeled(true);
      animate(px, -width * 1.1, { type: "spring", stiffness: 60, damping: 16 });
      animate(py, -height * 0.9, { type: "spring", stiffness: 60, damping: 16 });
    } else {
      animate(px, width, { type: "spring", stiffness: 300, damping: 24 });
      animate(py, height, { type: "spring", stiffness: 300, damping: 24 });
    }
  };

  const reset = () => {
    setPeeled(false);
    animate(px, width, { type: "spring", stiffness: 120, damping: 20 });
    animate(py, height, { type: "spring", stiffness: 120, damping: 20 });
  };

  useEffect(() => {
    if (!autoplay) return;
    const peek = async () => {
      if (touched.current) return;
      animate(px, [width, width - 120, width - 70, width], { duration: 2, ease: "easeInOut" });
      animate(py, [height, height - 90, height - 50, height], { duration: 2, ease: "easeInOut" });
    };
    const a = setTimeout(peek, 700);
    const t = setInterval(peek, 3600);
    return () => { clearTimeout(a); clearInterval(t); };
  }, [autoplay, px, py, width, height]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * width, ((e.clientY - r.top) / r.height) * height] as P;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={stage}
        className="relative touch-none select-none"
        style={{ width, height }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const [x, y] = local(e);
          px.set(Math.min(width, x));
          py.set(Math.min(height, y));
        }}
        onPointerUp={() => { if (dragging.current) { dragging.current = false; settle(); } }}
        onPointerCancel={() => { if (dragging.current) { dragging.current = false; settle(); } }}
      >
        {/* what is underneath */}
        <div className="absolute inset-0 overflow-hidden rounded-[18px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.05)]">{back}</div>
        {/* the page, clipped at the fold */}
        <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[#fffdf8] shadow-[0_0_0_1px_rgba(0,0,0,.05)]" style={{ clipPath: shape.page }}>
          {front}
          <div className="absolute inset-0" style={{ clipPath: shape.shadow, background: "rgba(0,0,0,.08)" }} />
        </div>
        {/* the folded flap: the back of the paper, shaded toward the crease */}
        <div className="pointer-events-none absolute left-0 top-0" style={{ width, height, overflow: "visible", filter: "drop-shadow(-6px 8px 10px rgba(0,0,0,.22))" }}>
          <div
            className="absolute left-0 top-0"
            style={{
              width,
              height,
              clipPath: shape.flap,
              background: `linear-gradient(${shape.angle + 90}deg, #f4efe4, #ffffff 45%, #e9e2d3)`,
            }}
          />
        </div>
        {/* grab handle */}
        {!peeled && (
          <motion.button
            type="button"
            aria-label="Peel the corner. Press Enter to peel it off."
            onPointerDown={(e) => {
              touched.current = true;
              dragging.current = true;
              (e.currentTarget.parentElement as Element).setPointerCapture?.(e.pointerId);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              touched.current = true;
              setPeeled(true);
              animate(px, -width * 1.1, { type: "spring", stiffness: 60, damping: 16 });
              animate(py, -height * 0.9, { type: "spring", stiffness: 60, damping: 16 });
            }}
            className="absolute h-14 w-14 cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing"
            style={{ x: px, y: py, left: -40, top: -40 }}
          />
        )}
      </div>
      <motion.button
        type="button"
        onClick={() => { touched.current = true; reset(); }}
        animate={{ opacity: peeled ? 1 : 0.35 }}
        disabled={!peeled}
        className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        Put it back
      </motion.button>
    </div>
  );
}
