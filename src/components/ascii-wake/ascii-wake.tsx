"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

export type AsciiWakeMode = "ramp" | "binary" | "blocks" | "flow";

const RAMPS: Record<Exclude<AsciiWakeMode, "flow">, string> = {
  ramp: " .:-=+*#%@",
  binary: " 0101",
  blocks: " ░▒▓█",
};
const FLOW = ["─", "╲", "│", "╱"]; // direction of travel, by angle
const MODES: AsciiWakeMode[] = ["ramp", "binary", "blocks", "flow"];

export interface AsciiWakeProps {
  /** Height of the field in px; it fills the available width. */
  height?: number;
  /** Colour of the glyphs right under the pointer. */
  accent?: string;
  /** Draws a looping path by itself while the pointer is away. */
  autoplay?: boolean;
}

/**
 * A field of characters that thickens where the pointer has been. The trail is
 * a list of timestamped points; each cell sums their falloff and picks a glyph
 * from a density ramp, so the wake is densest under the pointer and thins out
 * as it ages.
 */
export function AsciiWake({ height = 300, accent = "#0071e3", autoplay = false }: AsciiWakeProps) {
  const seg = "ascii-seg-" + useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<AsciiWakeMode>("ramp");
  const modeRef = useRef(mode);
  const dark = useRef(false);
  const trail = useRef<{ x: number; y: number; t: number; a: number }[]>([]);
  const lastPointer = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Canvas colours cannot use `dark:`, so track the site theme for the draw loop.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      dark.current = root.classList.contains("dark");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvas.current!;
    const box = wrap.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const CW = 10, CH = 15;
    const resize = () => {
      w = box.clientWidth;
      h = height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const LIFE = 1400;
    const draw = (now: number) => {
      // Synthetic pointer while idle.
      if (autoplay && now - lastPointer.current > 1800) {
        const t = now / 1000;
        const x = w / 2 + Math.sin(t * 1.3) * w * 0.36 + Math.sin(t * 3.1) * 30;
        const y = h / 2 + Math.sin(t * 2.1 + 1) * h * 0.3;
        const prev = trail.current[trail.current.length - 1];
        const a = prev ? Math.atan2(y - prev.y, x - prev.x) : 0;
        trail.current.push({ x, y, t: now, a });
      }
      trail.current = trail.current.filter((p) => now - p.t < LIFE).slice(-90);

      const ink = dark.current ? "245,245,247" : "29,29,31";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${CH - 2}px ui-monospace, 'SF Mono', Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const pts = trail.current;
      const head = pts[pts.length - 1];
      const m = modeRef.current;
      const cols = Math.ceil(w / CW), rows = Math.ceil(h / CH);
      for (let r = 0; r < rows; r++) {
        const cy = r * CH + CH / 2;
        for (let c = 0; c < cols; c++) {
          const cx = c * CW + CW / 2;
          let v = 0, ang = 0, best = 0;
          for (let k = 0; k < pts.length; k++) {
            const p = pts[k];
            const age = (now - p.t) / LIFE;
            const sigma = 14 + age * 34;
            const dx = cx - p.x, dy = cy - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 9 * sigma * sigma) continue;
            const f = Math.exp(-d2 / (2 * sigma * sigma)) * (1 - age) * 0.55;
            v += f;
            if (f > best) { best = f; ang = p.a; }
          }
          if (v < 0.04) {
            // Faint resting grid so the surface reads as a field.
            if ((c + r) % 4 === 0) { ctx.fillStyle = `rgba(${ink},${dark.current ? 0.12 : 0.08})`; ctx.fillText("·", cx, cy); }
            continue;
          }
          v = Math.min(1, v);
          let ch: string;
          if (m === "flow") {
            const idx = Math.round((((ang % Math.PI) + Math.PI) % Math.PI) / (Math.PI / 4)) % 4;
            ch = FLOW[idx];
          } else {
            const ramp = RAMPS[m];
            ch = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
          }
          const nearHead = head ? Math.hypot(cx - head.x, cy - head.y) < 26 : false;
          ctx.fillStyle = nearHead ? accent : `rgba(${ink},${0.25 + v * 0.75})`;
          ctx.fillText(ch, cx, cy);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [height, accent, autoplay]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={wrap}
        className="relative w-full overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_50px_-28px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_50px_-28px_rgba(0,0,0,.8)]"
        style={{ height }}
        onPointerMove={(e) => {
          const r = wrap.current!.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * wrap.current!.clientWidth;
          const y = ((e.clientY - r.top) / r.height) * height;
          const prev = trail.current[trail.current.length - 1];
          const a = prev ? Math.atan2(y - prev.y, x - prev.x) : 0;
          lastPointer.current = performance.now();
          trail.current.push({ x, y, t: performance.now(), a });
        }}
      >
        <canvas ref={canvas} className="absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <span className="rounded-full bg-white/80 px-3 py-1 text-[12px] font-medium text-[#6e6e73] backdrop-blur dark:bg-[#2c2c2e]/80 dark:text-[#a1a1a6]">Move your pointer across the field</span>
        </div>
      </div>
      <div role="group" aria-label="Glyph set" className="relative grid grid-cols-4 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className="relative z-10 h-8 rounded-[9px] px-4 text-[13px] font-medium capitalize text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7]"
          >
            {mode === m && (
              <motion.span
                layoutId={seg}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
              />
            )}
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
