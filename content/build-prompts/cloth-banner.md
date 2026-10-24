# Cloth Banner

Add the "Cloth Banner" component from Nexus UI to my project.

An announcement printed on cloth and pinned to a rail by five pins. It sways in the breeze and drapes under your hand; yank it down hard and the pins pop one by one until it drops away, or press Dismiss to let it fall.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ClothBanner } from "@/components/cloth-banner";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cloth-banner/cloth-banner.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ClothBannerProps {
  /** Big line printed on the cloth. */
  title?: string;
  /** Smaller line printed under the title. */
  subtitle?: string;
  /** Gradient start colour of the cloth (top left). */
  from?: string;
  /** Gradient end colour of the cloth (bottom right). */
  to?: string;
  /** Called once the banner has dropped away, whether it was yanked down or dismissed with the button. */
  onDismiss?: () => void;
  /** Sends a gust of wind every 2.2s until someone grabs the cloth or presses a button. */
  autoplay?: boolean;
}

const SW = 360, SH = 300;
const COLS = 15, ROWS = 9, GAP = 19;
const OX = (SW - (COLS - 1) * GAP) / 2, OY = 46;
const PINS = [0, 4, 7, 10, 14];

type P = { x: number; y: number; px: number; py: number; pin: boolean };
type L = { a: number; b: number; len: number };

function buildCloth() {
  const p: P[] = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const x = OX + i * GAP, y = OY + j * GAP - (j === 0 ? 0 : 30);
    p.push({ x, y, px: x, py: y, pin: j === 0 && PINS.includes(i) });
  }
  const l: L[] = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const k = j * COLS + i;
    if (i < COLS - 1) l.push({ a: k, b: k + 1, len: GAP });
    if (j < ROWS - 1) l.push({ a: k, b: k + COLS, len: GAP });
  }
  return { p, l };
}

function paintTexture(title: string, sub: string, from: string, to: string) {
  const w = (COLS - 1) * GAP, h = (ROWS - 1) * GAP, k = 2;
  const c = document.createElement("canvas");
  c.width = w * k; c.height = h * k;
  const x = c.getContext("2d")!;
  x.scale(k, k);
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, from); g.addColorStop(1, to);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // woven texture
  x.globalAlpha = 0.06; x.fillStyle = "#fff";
  for (let i = 0; i < w; i += 3) x.fillRect(i, 0, 1, h);
  for (let j = 0; j < h; j += 3) x.fillRect(0, j, w, 1);
  x.globalAlpha = 1;
  // stitched hem
  x.setLineDash([4, 3]); x.strokeStyle = "rgba(255,255,255,.45)"; x.lineWidth = 1;
  x.strokeRect(7, 7, w - 14, h - 14); x.setLineDash([]);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = "700 30px -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
  x.fillText(title, w / 2, h / 2 - 12);
  x.font = "500 12.5px -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
  x.globalAlpha = 0.85; x.fillText(sub, w / 2, h / 2 + 20);
  return c;
}

function tri(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, s: number, p0: P, p1: P, p2: P, u0: number, v0: number, u1: number, v1: number, u2: number, v2: number) {
  // Affine-map the texture triangle (u,v) onto the cloth triangle (x,y).
  u0 *= s; v0 *= s; u1 *= s; v1 *= s; u2 *= s; v2 *= s;
  const d = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
  if (!d) return;
  const a = (p0.x * v1 + v0 * p2.x + p1.x * v2 - v1 * p2.x - v0 * p1.x - p0.x * v2) / d;
  const b = (p0.y * v1 + v0 * p2.y + p1.y * v2 - v1 * p2.y - v0 * p1.y - p0.y * v2) / d;
  const c = (u0 * p1.x + p0.x * u2 + u1 * p2.x - p1.x * u2 - p0.x * u1 - u0 * p2.x) / d;
  const dd = (u0 * p1.y + p0.y * u2 + u1 * p2.y - p1.y * u2 - p0.y * u1 - u0 * p2.y) / d;
  const e = (u0 * v1 * p2.x + v0 * p1.x * u2 + p0.x * u1 * v2 - p0.x * v1 * u2 - v0 * u1 * p2.x - u0 * p1.x * v2) / d;
  const f = (u0 * v1 * p2.y + v0 * p1.y * u2 + p0.y * u1 * v2 - p0.y * v1 * u2 - v0 * u1 * p2.y - u0 * p1.y * v2) / d;
  // grow the clip a hair so neighbouring triangles don't show seams
  const cx = (p0.x + p1.x + p2.x) / 3, cy = (p0.y + p1.y + p2.y) / 3, g = 0.9;
  const ex = (p: P) => p.x + Math.sign(p.x - cx) * g, ey = (p: P) => p.y + Math.sign(p.y - cy) * g;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(ex(p0), ey(p0)); ctx.lineTo(ex(p1), ey(p1)); ctx.lineTo(ex(p2), ey(p2)); ctx.closePath(); ctx.clip();
  ctx.transform(a, b, c, dd, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/**
 * A launch announcement printed on real cloth, hung from a rail by five
 * pins. It sways in the breeze; grab any part and it drapes and folds under
 * your hand. Yank it down hard enough and the pins pop one by one until the
 * banner drops away. That is how you dismiss it (or with the Dismiss button).
 */
export function ClothBanner({
  title = "Launch Week",
  subtitle = "Oct 27–31 · five drops, one a day",
  from = "#0071e3",
  to = "#5e5ce6",
  onDismiss,
  autoplay = false,
}: ClothBannerProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pts = useRef<P[]>([]);
  const links = useRef<L[]>([]);
  const grab = useRef<{ i: number; x: number; y: number } | null>(null);
  const gust = useRef(0);
  const active = useRef(true);
  const touched = useRef(false);
  const focusNext = useRef<"hang" | "dismiss" | null>(null);
  const hangBtn = useRef<HTMLButtonElement>(null);
  const dismissBtn = useRef<HTMLButtonElement>(null);
  const onDismissRef = useRef(onDismiss);
  const [dismissed, setDismissed] = useState(false);
  const [pins, setPins] = useState(PINS.length);

  useEffect(() => { onDismissRef.current = onDismiss; });

  useEffect(() => {
    const cloth = buildCloth();
    pts.current = cloth.p; links.current = cloth.l;
    const tex = paintTexture(title, subtitle, from, to);
    const c = canvas.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = SW * dpr; c.height = SH * dpr;
    const ctx = c.getContext("2d")!;
    const html = document.documentElement;
    let dark = html.classList.contains("dark");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, t = 0, gone = false, shownPins = -1;

    const step = () => {
      t += 1 / 60;
      const p = pts.current;
      // Reduced motion: no ambient sway; gravity, grabbing and gusts from the Breeze button still work.
      const sway = mq.matches ? 0 : Math.sin(t * 1.3) * 0.05 + Math.sin(t * 3.1) * 0.03;
      const wind = sway + gust.current;
      gust.current *= 0.97;
      for (const q of p) {
        if (q.pin) continue;
        const vx = (q.x - q.px) * 0.985, vy = (q.y - q.py) * 0.985;
        q.px = q.x; q.py = q.y;
        q.x += vx + wind * (0.6 + Math.sin(q.y * 0.05 + t * 2) * 0.4);
        q.y += vy + 0.32;
      }
      const g = grab.current;
      if (g) { const q = p[g.i]; q.x = g.x; q.y = g.y; }
      for (let it = 0; it < 5; it++) {
        for (const l of links.current) {
          const A = p[l.a], B = p[l.b];
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
          const diff = ((d - l.len) / d) * 0.5;
          const ox = dx * diff, oy = dy * diff;
          const aFixed = A.pin || (g && g.i === l.a), bFixed = B.pin || (g && g.i === l.b);
          if (!aFixed && !bFixed) { A.x += ox; A.y += oy; B.x -= ox; B.y -= oy; }
          else if (!aFixed) { A.x += ox * 2; A.y += oy * 2; }
          else if (!bFixed) { B.x -= ox * 2; B.y -= oy * 2; }
        }
      }
      // Pins pop when the cloth beneath them is stretched too far.
      PINS.forEach((i) => {
        const q = p[i];
        if (!q.pin) return;
        const below = p[i + COLS];
        if (Math.hypot(below.x - q.x, below.y - q.y) > GAP * 2.1) { q.pin = false; q.py -= 3; }
      });
      const left = PINS.reduce((n, i) => n + (p[i].pin ? 1 : 0), 0);
      if (left !== shownPins) {
        if (shownPins === -1) setDismissed(false); // a fresh cloth (new props) is hanging again
        shownPins = left;
        setPins(left);
      }
      if (!gone && left === 0 && Math.min(...p.map((q) => q.y)) > SH + 20) {
        gone = true;
        setDismissed(true);
        onDismissRef.current?.();
      }
    };

    const draw = () => {
      const p = pts.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SW, SH);
      // rail
      const rg = ctx.createLinearGradient(0, OY - 8, 0, OY - 2);
      rg.addColorStop(0, dark ? "#636366" : "#e8e8ed"); rg.addColorStop(1, dark ? "#3a3a3c" : "#a1a1a6");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.roundRect(OX - 16, OY - 9, (COLS - 1) * GAP + 32, 6, 3); ctx.fill();
      if (gone) return;
      for (let j = 0; j < ROWS - 1; j++) for (let i = 0; i < COLS - 1; i++) {
        const k = j * COLS + i;
        const a = p[k], b = p[k + 1], c2 = p[k + COLS], d = p[k + COLS + 1];
        const u = i * GAP, v = j * GAP;
        tri(ctx, tex, 2, a, b, c2, u, v, u + GAP, v, u, v + GAP);
        tri(ctx, tex, 2, b, d, c2, u + GAP, v, u + GAP, v + GAP, u, v + GAP);
        // fold shading: squashed cells read as creases
        const area = Math.abs((b.x - a.x) * (c2.y - a.y) - (c2.x - a.x) * (b.y - a.y)) / (GAP * GAP);
        const lean = (b.y - a.y) / GAP;
        const shade = Math.max(-0.25, Math.min(0.35, (1 - area) * 0.6 + lean * 0.18));
        if (Math.abs(shade) > 0.02) {
          ctx.fillStyle = shade > 0 ? `rgba(0,0,0,${shade})` : `rgba(255,255,255,${-shade})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.lineTo(c2.x, c2.y); ctx.closePath(); ctx.fill();
        }
      }
      // pins
      PINS.forEach((i) => {
        const q = p[i];
        if (!q.pin) return;
        ctx.fillStyle = dark ? "#d1d1d6" : "#1d1d1f"; ctx.beginPath(); ctx.arc(q.x, q.y - 2, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = dark ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.arc(q.x - 1, q.y - 3, 1, 0, Math.PI * 2); ctx.fill();
      });
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = pts.current;
      if (gone && p.some((q) => q.pin)) gone = false; // hung back up
      if (gone) return; // nothing left to simulate until it is hung back up
      step();
      draw();
    };

    // Only run while on screen and the tab is visible.
    let onScreen = true;
    const sync = () => {
      const run = onScreen && !document.hidden;
      active.current = run;
      if (run && !raf) raf = requestAnimationFrame(loop);
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    if (root.current) io.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    // Follow the site theme: redraw the rail and pins when html.dark flips.
    const mo = new MutationObserver(() => {
      const next = html.classList.contains("dark");
      if (next === dark) return;
      dark = next;
      draw();
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    draw();
    sync();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      grab.current = null;
    };
  }, [title, subtitle, from, to]);

  // Keep keyboard focus on a live control when the buttons swap.
  useEffect(() => {
    if (focusNext.current === "hang" && dismissed) hangBtn.current?.focus();
    if (focusNext.current === "dismiss" && !dismissed) dismissBtn.current?.focus();
    focusNext.current = null;
  }, [dismissed]);

  useEffect(() => {
    if (!autoplay) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!active.current) return;
      gust.current = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.3);
    }, 2200);
    return () => clearInterval(id);
  }, [autoplay]);

  const local = (e: RPointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SW, y: ((e.clientY - r.top) / r.height) * SH };
  };
  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    touched.current = true;
    const m = local(e);
    let best = -1, bd = 34;
    pts.current.forEach((q, i) => { const d = Math.hypot(q.x - m.x, q.y - m.y); if (d < bd && !q.pin) { bd = d; best = i; } });
    if (best < 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { i: best, ...m };
  };
  const move = (e: RPointerEvent) => { if (grab.current) Object.assign(grab.current, local(e)); };
  const up = () => { grab.current = null; };
  const hangBack = () => {
    const cloth = buildCloth();
    pts.current = cloth.p; links.current = cloth.l;
    focusNext.current = "dismiss";
    setPins(PINS.length);
    setDismissed(false);
  };
  const dismiss = () => {
    touched.current = true;
    grab.current = null;
    pts.current.forEach((q) => { q.pin = false; });
    focusNext.current = "hang";
    setPins(0);
  };

  return (
    <div ref={root} className="flex w-[380px] max-w-full flex-col items-center gap-3">
      <div className="relative w-full">
        <canvas
          ref={canvas}
          className="block h-auto w-full cursor-grab touch-none active:cursor-grabbing"
          style={{ aspectRatio: `${SW} / ${SH}` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="img"
          aria-label={`Announcement banner: ${title}. ${subtitle}`}
        />
        <AnimatePresence>
          {dismissed && (
            <motion.div key="gone" className="absolute inset-0 flex flex-col items-center justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Announcement dismissed.</span>
              <button
                ref={hangBtn}
                type="button"
                onClick={hangBack}
                className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
              >
                Hang it back up
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex w-full items-center justify-between gap-3 px-2">
        <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]" aria-live="polite">{dismissed ? "" : pins === PINS.length ? "Pull it down hard to dismiss." : `${pins} pin${pins === 1 ? "" : "s"} left…`}</span>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => { touched.current = true; gust.current = 0.9; }}
            disabled={dismissed}
            className="h-8 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-40 dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
          >
            Breeze
          </motion.button>
          <button
            ref={dismissBtn}
            type="button"
            onClick={dismiss}
            disabled={dismissed}
            aria-label="Dismiss announcement"
            className="h-8 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-40 dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
```

--- components/cloth-banner/index.ts ---

```ts
export { ClothBanner } from "./cloth-banner";
export type { ClothBannerProps } from "./cloth-banner";
```
