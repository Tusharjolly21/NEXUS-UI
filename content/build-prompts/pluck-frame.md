# Pluck Frame

Add the "Pluck Frame" component from Nexus UI to my project.

A rounded frame drawn as one elastic string. Bring the pointer to an edge and the string catches on it; keep going and it stretches out with you, widening as it goes, until it slips off and rings. The ring is drawn the way a camera sees a vibrating string: a translucent veil between rest and the furthest swing, brightest at both ends of the swing, spreading along the frame, wrapping the corners and fading. Click, or press Enter, and the whole frame rings.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PluckFrame } from "@/components/pluck-frame";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/pluck-frame/index.ts ---

```ts
import type { ComponentProps } from "react";
import { PluckFrame } from "./pluck-frame";

export { PluckFrame };
export type PluckFrameProps = ComponentProps<typeof PluckFrame>;
```

--- components/pluck-frame/pluck-frame.tsx ---

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ geometry */
const VIEW = 500; // the canvas, in its own units
const S = 290; // the frame
const R = 70; // its corner radius
const N = 480; // points around the loop
const GRAB = 10; // how close to the line the pointer must come to catch it
const PULL = 86; // how far it stretches before it slips off
const DECAY = 2.1; // how fast a ring dies out, per second
const WOBBLE = 2 * Math.PI * 2.6; // the visible spring-back, in radians per second
const VEIL_LINES = 34; // strands that make up the long exposure

interface Geo { x: Float32Array; y: Float32Array; nx: Float32Array; ny: Float32Array; s: Float32Array; per: number }
interface Pluck { at: number; vx: number; vy: number; width: number; t: number }

/** A rounded square sampled evenly by length, with the outward normal and the distance along the loop at every point. */
function build(): Geo {
  const x0 = (VIEW - S) / 2, y0 = (VIEW - S) / 2, L = S - 2 * R;
  const per = 4 * L + 2 * Math.PI * R;
  const g: Geo = { x: new Float32Array(N), y: new Float32Array(N), nx: new Float32Array(N), ny: new Float32Array(N), s: new Float32Array(N), per };
  type At = (t: number) => [number, number, number, number];
  const corner = (cx: number, cy: number, a0: number) => ({ len: (Math.PI / 2) * R, at: ((t) => { const a = a0 + t * (Math.PI / 2); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, Math.cos(a), Math.sin(a)]; }) as At });
  const line = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) => ({ len: L, at: ((t) => [ax + (bx - ax) * t, ay + (by - ay) * t, nx, ny]) as At });
  const segs = [
    line(x0 + R, y0, x0 + S - R, y0, 0, -1), corner(x0 + S - R, y0 + R, -Math.PI / 2),
    line(x0 + S, y0 + R, x0 + S, y0 + S - R, 1, 0), corner(x0 + S - R, y0 + S - R, 0),
    line(x0 + S - R, y0 + S, x0 + R, y0 + S, 0, 1), corner(x0 + R, y0 + S - R, Math.PI / 2),
    line(x0, y0 + S - R, x0, y0 + R, -1, 0), corner(x0 + R, y0 + R, Math.PI),
  ];
  let si = 0, acc = 0;
  for (let i = 0; i < N; i++) {
    const s = (i / N) * per;
    while (s > acc + segs[si].len && si < segs.length - 1) { acc += segs[si].len; si++; }
    const [px, py, nx, ny] = segs[si].at(Math.min(1, (s - acc) / segs[si].len));
    g.x[i] = px; g.y[i] = py; g.nx[i] = nx; g.ny[i] = ny; g.s[i] = s;
  }
  return g;
}

/** Distance along the loop, the short way round. */
const along = (a: number, b: number, per: number) => { const d = Math.abs(a - b) % per; return Math.min(d, per - d); };
/** A softer falloff for the stretch: smooth at the finger, easing into the still part of the string. */
const soft = (u: number) => (u >= 1 ? 0 : Math.pow((1 + Math.cos(u * Math.PI)) / 2, 0.85));

/**
 * PluckFrame: a rounded frame drawn as one elastic string. Bring the pointer to an edge and the string catches on it;
 * keep going and it stretches out with you, widening as it goes, until it slips off and rings. The ring is drawn the
 * way a camera sees a vibrating string, a translucent veil between rest and the furthest swing, brightest at both
 * ends of the swing, that spreads along the frame, wraps the corners and fades. Click, or press Enter, and the whole
 * frame rings.
 *
 * `theme` is "dark" or "light". `children` sits inside the frame. `autoplay` plucks it on its own until the pointer
 * arrives. Reduced motion shows a still frame.
 */
export function PluckFrame({ autoplay = false, theme = "dark", children }: { autoplay?: boolean; theme?: "dark" | "light"; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const stRef = useRef({
    ptr: null as null | { x: number; y: number },
    touched: false,
    ring: false,
  });
  const dark = theme === "dark";

  const toView = (cx: number, cy: number) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * VIEW, y: ((cy - r.top) / r.height) * VIEW };
  };

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const st = stRef.current;
    const geo = build();
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = VIEW * dpr; cv.height = VIEW * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the veil is drawn on its own layer, then laid over the frame softened
    // at half resolution: it is blurred anyway, and it keeps the frame cheap
    const vc = document.createElement("canvas");
    const vs = dpr / 2;
    vc.width = Math.round(VIEW * vs); vc.height = Math.round(VIEW * vs);
    const vx = vc.getContext("2d")!;
    vx.setTransform(vs, 0, 0, vs, 0, 0);

    const ink = dark ? "255,255,255" : "29,29,31";
    const lo = (VIEW - S) / 2, hi = (VIEW + S) / 2;
    // the string is lit from above: bright along the top, cooling toward the lower corners
    const metal = ctx.createLinearGradient(lo, lo, hi, hi);
    if (dark) { metal.addColorStop(0, "#ffffff"); metal.addColorStop(0.45, "#e8e8ed"); metal.addColorStop(1, "#8a8a92"); }
    else { metal.addColorStop(0, "#1d1d1f"); metal.addColorStop(0.5, "#2c2c2e"); metal.addColorStop(1, "#6e6e73"); }
    const room = ctx.createRadialGradient(VIEW / 2, VIEW * 0.42, 40, VIEW / 2, VIEW / 2, VIEW * 0.75);
    if (dark) { room.addColorStop(0, "#141417"); room.addColorStop(1, "#050506"); }
    else { room.addColorStop(0, "#ffffff"); room.addColorStop(1, "#f2f2f5"); }

    const DX = new Float32Array(N), DY = new Float32Array(N); // where the string is drawn right now, as an offset
    const W = new Float32Array(N); // scratch: a pluck's weight at each point
    const plucks: Pluck[] = [];
    // the hold: where along the loop the pointer has the string, and the stretch vector toward the pointer
    const hold = { on: false, at: 0, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let raf = 0, last = performance.now();
    const t0 = performance.now();

    const nearest = (p: { x: number; y: number }) => {
      let best = 0, bd = 1e9;
      for (let i = 0; i < N; i += 3) { const dx = p.x - geo.x[i], dy = p.y - geo.y[i]; const q = dx * dx + dy * dy; if (q < bd) { bd = q; best = i; } }
      for (let o = -2; o <= 2; o++) { const k = (best + o + N) % N; const dx = p.x - geo.x[k], dy = p.y - geo.y[k]; const q = dx * dx + dy * dy; if (q < bd) { bd = q; best = k; } }
      return { i: best, s: (p.x - geo.x[best]) * geo.nx[best] + (p.y - geo.y[best]) * geo.ny[best] };
    };
    const idx = (at: number) => Math.round((at / geo.per) * N) % N;
    const spanOf = (len: number) => 62 + len * 0.55; // a longer stretch takes more of the string with it
    const release = () => {
      const len = Math.hypot(hold.x, hold.y);
      if (len > 2) plucks.push({ at: hold.at, vx: hold.x, vy: hold.y, width: spanOf(len), t: 0 });
      hold.on = false; hold.x = 0; hold.y = 0; hold.vx = 0; hold.vy = 0;
    };

    const update = (dt: number) => {
      // the pointer catches the string, drags it toward itself, and lets it slip
      const p = st.ptr;
      if (p) {
        const { i, s } = nearest(p);
        const cur = hold.on ? Math.hypot(hold.x, hold.y) : 0;
        if (!hold.on && Math.abs(s - cur) < GRAB && s > -GRAB) { hold.on = true; hold.at = geo.s[i]; }
        if (hold.on) {
          if (s > PULL || s < -GRAB * 1.6) release();
          else {
            let d = geo.s[i] - hold.at;
            if (d > geo.per / 2) d -= geo.per; else if (d < -geo.per / 2) d += geo.per;
            hold.at = (hold.at + d * Math.min(1, dt * 14) + geo.per) % geo.per;
            const c = idx(hold.at);
            // the string is pulled straight toward the pointer, never inward
            const ox = p.x - geo.x[c], oy = p.y - geo.y[c];
            const out = ox * geo.nx[c] + oy * geo.ny[c];
            hold.tx = out > 0 ? ox : 0; hold.ty = out > 0 ? oy : 0;
          }
        }
      } else if (hold.on) release();
      // the stretch follows on a stiff spring, so it never jitters
      const k = 620, cd = 2 * Math.sqrt(k) * 0.86;
      const tx = hold.on ? hold.tx : 0, ty = hold.on ? hold.ty : 0;
      hold.vx += (k * (tx - hold.x) - cd * hold.vx) * dt; hold.x += hold.vx * dt;
      hold.vy += (k * (ty - hold.y) - cd * hold.vy) * dt; hold.y += hold.vy * dt;
      if (st.ring) {
        st.ring = false;
        for (let q = 0; q < 4; q++) {
          const c = idx((q / 4) * geo.per + (geo.per / 4 - Math.PI * R / 2) / 2);
          plucks.push({ at: geo.s[c], vx: geo.nx[c] * 30, vy: geo.ny[c] * 30, width: 120, t: 0 });
        }
      }
      for (const pk of plucks) pk.t += dt;
      for (let q = plucks.length - 1; q >= 0; q--) if (Math.exp(-DECAY * 0.55 * plucks[q].t) * Math.hypot(plucks[q].vx, plucks[q].vy) < 0.6) plucks.splice(q, 1);

      // the drawn string: the hold, plus every ring's slow wobble
      const hw = spanOf(Math.hypot(hold.x, hold.y));
      for (let i = 0; i < N; i++) {
        const wh = soft(along(geo.s[i], hold.at, geo.per) / hw);
        let x = hold.x * wh, y = hold.y * wh;
        for (const pk of plucks) {
          const w = soft(along(geo.s[i], pk.at, geo.per) / (pk.width * (1 + pk.t * 0.7)));
          if (!w) continue;
          // springs back past rest a little, then settles: outward swings in full, inward ones held short
          const o = Math.exp(-DECAY * pk.t) * Math.cos(pk.t * WOBBLE);
          const f = (o > 0 ? o : o * 0.3) * w;
          x += pk.vx * f; y += pk.vy * f;
        }
        DX[i] = x; DY[i] = y;
      }
    };

    const path = (g: CanvasRenderingContext2D, ox: (i: number) => number, oy: (i: number) => number, only?: (i: number) => boolean) => {
      g.beginPath();
      let pen = false;
      for (let n = 0; n <= N; n++) {
        const i = n % N;
        if (only && !only(i)) { pen = false; continue; }
        const x = geo.x[i] + ox(i), y = geo.y[i] + oy(i);
        if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y);
      }
      if (!only) g.closePath();
    };

    const draw = (now: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.fillStyle = room;
      ctx.fillRect(0, 0, VIEW, VIEW);

      // the veil: for every ring, strands from the string's rest out to its furthest swing, packed toward both ends
      // of the swing the way a vibrating string spends its time, then softened into one translucent sheet
      vx.clearRect(0, 0, VIEW, VIEW);
      if (plucks.length) {
        vx.lineJoin = "round";
        vx.lineCap = "round";
        for (const pk of plucks) {
          const amp = Math.exp(-DECAY * pk.t * 0.55); // the veil outlasts the visible wobble, as the ringing does
          const width = pk.width * (1 + pk.t * 0.7);
          for (let i = 0; i < N; i++) W[i] = soft(along(geo.s[i], pk.at, geo.per) / width);
          const on = (i: number) => W[i] > 0.002 || W[(i + 1) % N] > 0.002 || W[(i - 1 + N) % N] > 0.002;
          const shine = Math.min(1, amp * 1.25);
          const reach = Math.hypot(pk.vx, pk.vy) * amp;
          for (let k = 0; k <= VEIL_LINES; k++) {
            const u = (1 - Math.cos((Math.PI * k) / VEIL_LINES)) / 2;
            vx.strokeStyle = `rgba(${ink},${(dark ? 0.11 : 0.065) * shine})`;
            // wide enough that neighbouring strands overlap into one sheet
            vx.lineWidth = Math.max(2, reach * 0.11);
            path(vx, (i) => DX[i] + pk.vx * W[i] * amp * u, (i) => DY[i] + pk.vy * W[i] * amp * u, on);
            vx.stroke();
          }
          vx.strokeStyle = `rgba(${ink},${(dark ? 0.5 : 0.3) * shine})`;
          vx.lineWidth = 1.4;
          path(vx, (i) => DX[i] + pk.vx * W[i] * amp, (i) => DY[i] + pk.vy * W[i] * amp, on);
          vx.stroke();
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = dark ? "lighter" : "multiply";
        ctx.filter = `blur(${3 * dpr}px)`;
        ctx.drawImage(vc, 0, 0, cv.width, cv.height);
        ctx.filter = "none";
        ctx.globalAlpha = dark ? 0.45 : 0.35;
        ctx.drawImage(vc, 0, 0, cv.width, cv.height);
        ctx.restore();
      }

      // the string itself: a soft halo, then the crisp line
      ctx.globalCompositeOperation = "source-over";
      ctx.lineJoin = "round";
      // a soft halo from a few wide, faint strokes (cheaper than a blur, and steadier)
      ctx.strokeStyle = metal;
      for (const [w, a] of [[12, dark ? 0.035 : 0.02], [8, dark ? 0.06 : 0.03], [5.5, dark ? 0.1 : 0.05]] as const) {
        ctx.globalAlpha = a;
        ctx.lineWidth = w;
        path(ctx, (i) => DX[i], (i) => DY[i]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = metal;
      ctx.lineWidth = 3.4;
      path(ctx, (i) => DX[i], (i) => DY[i]);
      ctx.stroke();
      ctx.globalAlpha = dark ? 0.5 : 0.25;
      ctx.strokeStyle = dark ? "#ffffff" : "#8e8e93";
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(0, -0.8);
      path(ctx, (i) => DX[i], (i) => DY[i], (i) => geo.ny[i] < 0.2);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
      void now;
    };

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      if (autoplay && !st.touched) {
        const p = demo((now - t0) / 1000);
        st.ptr = p;
        const g = ghost.current;
        if (g) { g.style.opacity = p ? "1" : "0"; if (p) g.style.transform = `translate(${(p.x / VIEW) * 100}cqw, ${(p.y / VIEW) * 100}cqw)`; }
      } else if (ghost.current) ghost.current.style.opacity = "0";
      // a few small steps keep the springs smooth on slow frames
      for (let k = 0; k < 3; k++) update(dt / 3);
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    if (reduce) { update(0); draw(0); return; }
    raf = requestAnimationFrame(frame);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); vis.disconnect(); };
  }, [autoplay, reduce, dark]);

  return (
    <div
      className="relative w-full max-w-[440px] select-none overflow-hidden rounded-[28px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-30px_rgba(0,0,0,.55)]"
      style={{ background: dark ? "#050506" : "#f2f2f5", containerType: "inline-size", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <canvas
        ref={canvas}
        className="block aspect-square w-full touch-none outline-none"
        tabIndex={0}
        role="img"
        aria-label="A rounded frame drawn as an elastic string. Pull an edge with the pointer and it rings. Press Enter to ring the whole frame."
        onPointerMove={(e) => { const st = stRef.current; st.touched = true; st.ptr = toView(e.clientX, e.clientY); }}
        onPointerDown={(e) => { const st = stRef.current; st.touched = true; st.ptr = toView(e.clientX, e.clientY); }}
        onPointerLeave={() => { stRef.current.ptr = null; }}
        onClick={() => { stRef.current.ring = true; }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const st = stRef.current; st.touched = true; st.ring = true; } }}
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="flex w-[50%] flex-col items-center text-center">
          {children ?? <span className={`text-[12px] tracking-[0.01em] ${dark ? "text-white/45" : "text-[#86868b]"}`}>Pull an edge, then let go</span>}
        </div>
      </div>
      <div ref={ghost} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 transition-opacity duration-300" style={{ opacity: 0 }}>
        <svg width="15" height="19" viewBox="0 0 16 20" style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,.45))" }}>
          <path d="M1 1v15l4-4 3 6.5 2.4-1.1-3-6.4H13z" fill={dark ? "#fff" : "#1d1d1f"} stroke={dark ? "#1d1d1f" : "#fff"} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/** The demo pointer: out through the right edge, the top, the lower-left corner and the bottom, with rests between. */
function demo(t: number): { x: number; y: number } | null {
  const T = t % 11;
  const lo = (VIEW - S) / 2, hi = (VIEW + S) / 2, mid = VIEW / 2;
  const path: [number, number, number][] = [
    [0.0, mid + 20, mid + 30],
    [0.8, hi - 24, mid - 10],
    [2.0, hi + 92, mid + 4], // out through the right edge: catches, stretches, slips
    [2.6, hi + 96, mid + 60],
    [3.3, mid + 30, lo + 40],
    [4.5, mid - 20, lo - 94], // up through the top
    [5.1, mid - 70, lo - 90],
    [5.8, lo + 46, hi - 46],
    [7.0, lo - 66, hi + 66], // out through the lower-left corner
    [7.6, lo - 70, hi + 30],
    [8.3, mid + 10, hi - 30],
    [9.4, mid + 30, hi + 94], // down through the bottom
    [10.1, mid + 80, hi + 90],
    [11.0, mid + 20, mid + 30],
  ];
  for (let i = 0; i < path.length - 1; i++) {
    const [ta, xa, ya] = path[i], [tb, xb, yb] = path[i + 1];
    if (T >= ta && T <= tb) {
      const u = (T - ta) / (tb - ta);
      const e = u * u * (3 - 2 * u);
      return { x: xa + (xb - xa) * e, y: ya + (yb - ya) * e };
    }
  }
  return null;
}
```
