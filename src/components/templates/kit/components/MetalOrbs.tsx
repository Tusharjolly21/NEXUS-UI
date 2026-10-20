"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Mode = "joined" | "apart" | "orbit";

export interface MetalOrbsProps {
  width?: number;
  height?: number;
  /** Cycles modes by itself until the user interacts. */
  autoplay?: boolean;
}

/**
 * Two liquid-metal orbs drawn as metaballs. Every frame computes a field over a
 * low-resolution buffer, derives a surface normal from its gradient, and shades
 * it with a fake chrome environment (sky above, dark horizon, warm ground). When
 * the orbs get close their fields add up and the surfaces bulge into each other.
 */
export default function MetalOrbs({ width = 440, height = 280, autoplay = false }: MetalOrbsProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("apart");
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const S = 2; // buffer downscale
    const bw = Math.floor(width / S), bh = Math.floor(height / S);
    const buf = document.createElement("canvas");
    buf.width = bw;
    buf.height = bh;
    const bctx = buf.getContext("2d")!;
    const img = bctx.createImageData(bw, bh);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = width * dpr;
    cv.height = height * dpr;
    const orbs = [
      { x: width * 0.32, y: height / 2, r: 54, tint: [150, 190, 255] },
      { x: width * 0.68, y: height / 2, r: 48, tint: [255, 170, 120] },
    ];
    let raf = 0;
    const field = new Float32Array(bw * bh);
    const env = (ny: number, nx: number) => {
      // chrome-ish environment: bright sky, dark band at horizon, warm ground
      const t = ny; // -1 bottom .. 1 top
      if (t > 0.18) { const k = (t - 0.18) / 0.82; return [205 + 45 * k, 214 + 38 * k, 226 + 28 * k]; }
      if (t > -0.08) { const k = (t + 0.08) / 0.26; const e = k * k * (3 - 2 * k); return [92 + 113 * e + nx * 8, 98 + 116 * e, 108 + 118 * e]; }
      const k = Math.min(1, (-t - 0.08) / 0.7);
      return [196 - 70 * k, 172 - 70 * k, 140 - 64 * k];
    };
    const frame = (now: number) => {
      const m = modeRef.current;
      const tt = now / 1000;
      const cx = width / 2, cy = height / 2;
      let targets: [number, number][];
      if (m === "joined") targets = [[cx - 30, cy + Math.sin(tt) * 6], [cx + 32, cy - Math.sin(tt) * 6]];
      else if (m === "apart") targets = [[cx - 120, cy + Math.sin(tt * 0.8) * 10], [cx + 120, cy - Math.sin(tt * 0.8) * 10]];
      else targets = [[cx + Math.cos(tt * 1.4) * 70, cy + Math.sin(tt * 1.4) * 38], [cx - Math.cos(tt * 1.4) * 70, cy - Math.sin(tt * 1.4) * 38]];
      if (pointer.current) targets[0] = [pointer.current.x, pointer.current.y];
      orbs.forEach((o, i) => { o.x += (targets[i][0] - o.x) * 0.08; o.y += (targets[i][1] - o.y) * 0.08; });

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const px = x * S, py = y * S;
          let f = 0;
          for (const o of orbs) {
            const dx = px - o.x, dy = py - o.y;
            f += (o.r * o.r) / (dx * dx + dy * dy + 1);
          }
          field[y * bw + x] = f;
        }
      }
      const data = img.data;
      for (let y = 1; y < bh - 1; y++) {
        for (let x = 1; x < bw - 1; x++) {
          const i = y * bw + x;
          const f = field[i];
          const o = i * 4;
          if (f < 0.85) { data[o + 3] = 0; continue; }
          const gx = field[i + 1] - field[i - 1];
          const gy = field[i + bw] - field[i - bw];
          // Normal: steep gradient near the rim, flat on top.
          let nx = -gx * 4.5, ny = gy * 4.5;
          const len = Math.hypot(nx, ny);
          if (len > 1) { nx /= len; ny /= len; }
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          // reflect a view ray (0,0,1) -> use normal.y as the env lookup with some bend
          const ry = ny * 1.1 + nz * 0.05;
          let [r, g, b] = env(Math.max(-1, Math.min(1, ry)), nx);
          // tint by which orb dominates
          const p = (px: number, py: number) => {
            const a = orbs[0], c = orbs[1];
            const fa = (a.r * a.r) / ((px - a.x) ** 2 + (py - a.y) ** 2 + 1);
            const fc = (c.r * c.r) / ((px - c.x) ** 2 + (py - c.y) ** 2 + 1);
            return fa / (fa + fc);
          };
          const w = p(x * S, y * S);
          const tr = orbs[0].tint[0] * w + orbs[1].tint[0] * (1 - w);
          const tg = orbs[0].tint[1] * w + orbs[1].tint[1] * (1 - w);
          const tb = orbs[0].tint[2] * w + orbs[1].tint[2] * (1 - w);
          r = r * 0.72 + tr * 0.28; g = g * 0.72 + tg * 0.28; b = b * 0.72 + tb * 0.28;
          // specular
          const spec = Math.pow(Math.max(0, -nx * 0.45 + ny * 0.55 + nz * 0.7), 18) * 255;
          const edge = Math.min(1, (f - 0.85) / 0.25);
          data[o] = Math.min(255, r + spec);
          data[o + 1] = Math.min(255, g + spec);
          data[o + 2] = Math.min(255, b + spec);
          data[o + 3] = 255 * edge;
        }
      }
      bctx.putImageData(img, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // floor shadows
      orbs.forEach((o) => {
        const g = ctx.createRadialGradient(o.x, height - 30, 2, o.x, height - 30, o.r * 1.2);
        g.addColorStop(0, "rgba(0,0,0,.18)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(o.x, height - 30, o.r * 1.2, o.r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw * S, bh * S);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  useEffect(() => {
    if (!autoplay) return;
    const order: Mode[] = ["joined", "orbit", "apart"];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setMode(order[k++ % order.length]);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff,#f0f0f3)] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-28px_rgba(0,0,0,.3)]">
        <canvas
          ref={canvas}
          role="img"
          aria-label="Two liquid metal orbs. Move the pointer to drag the left one."
          style={{ width, height, maxWidth: "100%", display: "block" }}
          className="cursor-grab touch-none"
          onPointerMove={(e) => {
            if (e.buttons !== 1 && e.pointerType === "mouse") return;
            const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
            pointer.current = { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
          }}
          onPointerDown={(e) => {
            touched.current = true;
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
            const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
            pointer.current = { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
          }}
          onPointerUp={() => (pointer.current = null)}
          onPointerCancel={() => (pointer.current = null)}
        />
      </div>
      <div role="group" aria-label="Orb motion" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]">
        {(["joined", "apart", "orbit"] as Mode[]).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => { touched.current = true; setMode(m); }} className="relative z-10 h-8 rounded-[9px] px-5 text-[13px] font-medium capitalize text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]">
            {mode === m && <motion.span layoutId="metal-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
            {m}
          </button>
        ))}
      </div>
      <span className="text-[13px] text-[#86868b]">Drag inside to pull the cool orb around.</span>
    </div>
  );
}
