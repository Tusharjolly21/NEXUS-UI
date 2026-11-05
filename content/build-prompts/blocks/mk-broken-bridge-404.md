# Broken Bridge 404

Add the "Broken Bridge 404" section from Nexus UI to my project.

A 404 page with a broken rope bridge. The two halves hang from the cliffs into the canyon and sway; brush them and they swing, grab one by any plank and pull it about. Hold one end out over the middle and the other half reaches up to meet it and ties itself back together, so the bridge sags across the gap again (the page is still missing, of course). Keyboard: the "Fix the bridge" button does the same thing.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { BrokenBridge404 } from "@/components/blocks/motion-kit/broken-bridge-404";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `homeHref` | `string` | `"/"` |  |
| `onHome` | `() => void` | none |  |
| `onSearch` | `() => void` | none |  |
| `autoplay` | `boolean` | `false` |  |
| `className` | `string` | `""` |  |

--- components/blocks/motion-kit/broken-bridge-404/index.ts ---

```ts
export { BrokenBridge404 } from "./broken-bridge-404";
export type { BrokenBridge404Props } from "./broken-bridge-404";
```

--- components/blocks/motion-kit/broken-bridge-404/broken-bridge-404.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type BrokenBridge404Props = {
  homeHref?: string;
  onHome?: () => void;
  onSearch?: () => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  home: { vb: 256, body: "<path fill=\"currentColor\" d=\"m222.14 105.85l-80-80a20 20 0 0 0-28.28 0l-80 80A19.86 19.86 0 0 0 28 120v96a12 12 0 0 0 12 12h64a12 12 0 0 0 12-12v-52h24v52a12 12 0 0 0 12 12h64a12 12 0 0 0 12-12v-96a19.86 19.86 0 0 0-5.86-14.15M204 204h-40v-52a12 12 0 0 0-12-12h-48a12 12 0 0 0-12 12v52H52v-82.35l76-76l76 76Z\"/>" },
  search: { vb: 256, body: "<path fill=\"currentColor\" d=\"M232.49 215.51L185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68a68.07 68.07 0 0 1-68-68\"/>" },
} as const;

type P = { x: number; y: number; ox: number; oy: number };
const H = 480;
const HAND = 24; // the hand rope runs this far above the deck
const G = 1700;
const STOP = Symbol("stop");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * A 404 page with a broken rope bridge. The two halves hang from the cliffs into the canyon and sway; brush
 * them and they swing, grab one by any plank and pull it about. Hold one end out over the middle and the other
 * half reaches up to meet it and ties itself back together, so the bridge sags across the gap again (the page
 * is still missing, of course). Keyboard: the "Fix the bridge" button does the same thing.
 */
export function BrokenBridge404({ homeHref = "/", onHome, onSearch, autoplay = false, className = "" }: BrokenBridge404Props) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [W, setW] = useState(880);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cliff = W < 600 ? 46 : 110;
  // on a narrow screen the words wrap onto more lines, so the bridge hangs a little lower
  const ANCHOR_Y = W < 600 ? 322 : 262;

  // two chains of rope nodes, each fixed at its cliff; node 0 is the post
  const sim = useRef<{ L: P[]; R: P[]; seg: number; joined: boolean; grab: { side: "L" | "R"; i: number; x: number; y: number } | null; reach: number; ptr: { x: number; y: number; t: number } | null; t: number }>({
    L: [],
    R: [],
    seg: 20,
    joined: false,
    grab: null,
    reach: 0,
    ptr: null,
    t: 0,
  });
  const [fixed, setFixed] = useState(false);
  const fixedRef = useRef(false);

  const build = useCallback(() => {
    const s = sim.current;
    const gap = W - cliff * 2;
    const n = 13;
    const len = gap * 0.56;
    s.seg = len / (n - 1);
    const make = (x0: number, dir: number) =>
      Array.from({ length: n }, (_, i) => {
        // start hanging nearly straight down with a little lean
        const x = x0 + dir * Math.min(i * s.seg * 0.25, 30);
        const y = ANCHOR_Y + i * s.seg * 0.95;
        return { x, y, ox: x, oy: y };
      });
    s.L = make(cliff, 1);
    s.R = make(W - cliff, -1);
    s.joined = false;
    s.reach = 0;
    fixedRef.current = false;
    setFixed(false);
  }, [W, cliff, ANCHOR_Y]);
  useEffect(() => build(), [build]);

  const join = useCallback(() => {
    const s = sim.current;
    if (s.joined) return;
    s.joined = true;
    s.grab = null;
    fixedRef.current = true;
    setFixed(true);
  }, []);

  /** break it again (used between demo loops) */
  const snapApart = useCallback(() => {
    const s = sim.current;
    s.joined = false;
    s.reach = 0;
    fixedRef.current = false;
    setFixed(false);
    const a = s.L[s.L.length - 1];
    const b = s.R[s.R.length - 1];
    a.ox = a.x + 6;
    b.ox = b.x - 6;
  }, []);

  // ─── simulation and drawing ───
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const DT = 1 / 120;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    // a few stars up in the dark part of the sky, and fireflies drifting in the canyon
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const stars = Array.from({ length: Math.round(W / 22) }, () => ({ x: rnd() * W, y: rnd() * ANCHOR_Y * 0.55, r: 0.6 + rnd() * 1.1, ph: rnd() * 6.28 }));
    const flies = Array.from({ length: Math.round(W / 50) }, () => ({ x: cliff + rnd() * (W - cliff * 2), y: ANCHOR_Y + 20 + rnd() * (H - ANCHOR_Y - 40), ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.6 }));
    const glow = document.createElement("canvas");
    glow.width = glow.height = 32;
    const gc = glow.getContext("2d");
    if (gc) {
      const rg = gc.createRadialGradient(16, 16, 0, 16, 16, 16);
      rg.addColorStop(0, "rgba(255,236,170,1)");
      rg.addColorStop(0.25, "rgba(255,200,110,.75)");
      rg.addColorStop(1, "rgba(255,150,80,0)");
      gc.fillStyle = rg;
      gc.fillRect(0, 0, 32, 32);
    }

    const step = () => {
      const s = sim.current;
      s.t += DT;
      const wind = reduced ? 0 : Math.sin(s.t * 0.9) * 28 + Math.sin(s.t * 2.3) * 9;
      for (const ch of [s.L, s.R]) {
        for (let i = 1; i < ch.length; i++) {
          const p = ch[i];
          const vx = (p.x - p.ox) * 0.992;
          const vy = (p.y - p.oy) * 0.992;
          p.ox = p.x;
          p.oy = p.y;
          p.x += vx + wind * (i / ch.length) * DT * DT;
          p.y += vy + G * DT * DT;
        }
      }
      // the far half reaches for an end held out over the middle
      const g = s.grab;
      if (g && !s.joined) {
        const held = (g.side === "L" ? s.L : s.R)[g.i];
        const other = g.side === "L" ? s.R : s.L;
        const isEnd = g.i >= (g.side === "L" ? s.L : s.R).length - 2;
        const mid = W / 2;
        const near = isEnd && Math.abs(held.x - mid) < W * 0.16 && held.y < ANCHOR_Y + 120;
        s.reach = clamp(s.reach + (near ? DT * 0.9 : -DT * 2), 0, 1);
        if (s.reach > 0) {
          const e = other[other.length - 1];
          const k = s.reach * s.reach * 0.06;
          e.x += (held.x - e.x) * k;
          e.y += (held.y - e.y) * k;
          if (Math.hypot(held.x - e.x, held.y - e.y) < 14) join();
        }
      }
      for (let it = 0; it < 14; it++) {
        for (const ch of [s.L, s.R]) {
          ch[0].x = ch === s.L ? cliff : W - cliff;
          ch[0].y = ANCHOR_Y;
          for (let i = 0; i < ch.length - 1; i++) {
            const a = ch[i];
            const b = ch[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 1;
            const diff = (d - s.seg) / d;
            if (i === 0) {
              b.x -= dx * diff;
              b.y -= dy * diff;
            } else {
              a.x += dx * diff * 0.5;
              a.y += dy * diff * 0.5;
              b.x -= dx * diff * 0.5;
              b.y -= dy * diff * 0.5;
            }
          }
        }
        if (s.joined) {
          // the two ends are tied: keep them together
          const a = s.L[s.L.length - 1];
          const b = s.R[s.R.length - 1];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          a.x = b.x = mx;
          a.y = b.y = my;
        }
        if (g) {
          const p = (g.side === "L" ? s.L : s.R)[g.i];
          if (g.i > 0) {
            p.x = g.x;
            p.y = g.y;
          }
        }
        // nothing goes into the cliffs
        for (const ch of [s.L, s.R])
          for (const p of ch) {
            if (p.x < cliff && p.y > ANCHOR_Y - 2) p.x = cliff;
            if (p.x > W - cliff && p.y > ANCHOR_Y - 2) p.x = W - cliff;
          }
      }
    };

    const draw = () => {
      const s = sim.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // stars and fireflies, behind everything else
      for (const st of stars) {
        ctx.globalAlpha = 0.45 + 0.45 * Math.sin(s.t * 1.7 + st.ph);
        ctx.fillStyle = "#fff4dc";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const f of flies) {
        const fx = f.x + Math.sin(s.t * f.sp + f.ph) * 26;
        const fy = f.y + Math.cos(s.t * f.sp * 1.3 + f.ph) * 14;
        ctx.globalAlpha = 0.35 + 0.65 * Math.max(0, Math.sin(s.t * 2.1 * f.sp + f.ph));
        ctx.drawImage(glow, fx - 9, fy - 9, 18, 18);
      }
      ctx.globalAlpha = 1;
      // cliffs: dark rock lit orange along the edge facing the sunset
      const rock = ctx.createLinearGradient(0, ANCHOR_Y, 0, H);
      rock.addColorStop(0, "#3a1658");
      rock.addColorStop(1, "#13072b");
      ctx.fillStyle = rock;
      ctx.beginPath();
      ctx.moveTo(0, ANCHOR_Y);
      ctx.lineTo(cliff + 4, ANCHOR_Y);
      ctx.lineTo(cliff - 6, ANCHOR_Y + 60);
      ctx.lineTo(cliff + 2, ANCHOR_Y + 130);
      ctx.lineTo(cliff - 10, H);
      ctx.lineTo(0, H);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(W, ANCHOR_Y);
      ctx.lineTo(W - cliff - 4, ANCHOR_Y);
      ctx.lineTo(W - cliff + 8, ANCHOR_Y + 80);
      ctx.lineTo(W - cliff - 2, ANCHOR_Y + 150);
      ctx.lineTo(W - cliff + 10, H);
      ctx.lineTo(W, H);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,158,92,.85)";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, ANCHOR_Y);
      ctx.lineTo(cliff + 4, ANCHOR_Y);
      ctx.lineTo(cliff - 6, ANCHOR_Y + 60);
      ctx.lineTo(cliff + 2, ANCHOR_Y + 130);
      ctx.moveTo(W, ANCHOR_Y);
      ctx.lineTo(W - cliff - 4, ANCHOR_Y);
      ctx.lineTo(W - cliff + 8, ANCHOR_Y + 80);
      ctx.lineTo(W - cliff - 2, ANCHOR_Y + 150);
      ctx.stroke();
      // posts
      for (const x of [cliff - 8, W - cliff + 2]) {
        ctx.fillStyle = "#2a0f45";
        ctx.fillRect(x, ANCHOR_Y - HAND - 10, 6, HAND + 12);
        ctx.fillStyle = "#ffb070";
        ctx.fillRect(x, ANCHOR_Y - HAND - 10, 6, 2);
      }
      for (const ch of [s.L, s.R]) {
        const dir = ch === s.L ? 1 : -1;
        // hand rope: the deck offset along its normal, so it rides above when level and beside when hanging
        const hand = ch.map((p, i) => {
          const a = ch[Math.max(0, i - 1)];
          const b = ch[Math.min(ch.length - 1, i + 1)];
          let tx = b.x - a.x;
          let ty = b.y - a.y;
          const l = Math.hypot(tx, ty) || 1;
          tx /= l;
          ty /= l;
          // normal pointing "up" relative to the walking direction
          let nx = ty * dir;
          let ny = -tx * dir;
          // the hand rope always rides above the deck, never flips underneath when the rope folds back
          if (ny > 0) {
            nx = -nx;
            ny = -ny;
          }
          return { x: p.x + nx * HAND, y: p.y + ny * HAND };
        });
        ctx.strokeStyle = "rgba(42,15,69,.6)";
        ctx.lineWidth = 1;
        for (let i = 1; i < ch.length; i++) {
          ctx.beginPath();
          ctx.moveTo(ch[i].x, ch[i].y);
          ctx.lineTo(hand[i].x, hand[i].y);
          ctx.stroke();
        }
        ctx.strokeStyle = "#2a0f45";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const line of [ch, hand]) {
          ctx.beginPath();
          line.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.stroke();
        }
        // planks
        for (let i = 0; i < ch.length - 1; i++) {
          const a = ch[i];
          const b = ch[i + 1];
          const ang = Math.atan2(b.y - a.y, b.x - a.x);
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          ctx.save();
          ctx.translate((a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.rotate(ang);
          ctx.fillStyle = "#3b1552";
          const w = len - 3;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -1, w, 7, 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,170,100,.8)";
          ctx.fillRect(-w / 2 + 1.5, -1, w - 3, 1.5);
          ctx.restore();
        }
      }
      // the knot, once it's tied
      if (s.joined) {
        const e = s.L[s.L.length - 1];
        ctx.fillStyle = "#ffb070";
        ctx.beginPath();
        ctx.arc(e.x, e.y + 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      if (reduced && !sim.current.grab) {
        // with reduced motion the ropes settle once and stay put
        if (acc < 3) {
          for (let k = 0; k < 120; k++) step();
          acc += 1;
        }
      } else {
        acc += dt;
        let n = 0;
        while (acc >= DT && n < 6) {
          step();
          acc -= DT;
          n++;
        }
      }
      draw();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [W, cliff, reduced, join, ANCHOR_Y]);

  // ─── the hand ───
  const local = (e: { clientX: number; clientY: number }) => {
    const r = cvRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const nearest = (x: number, y: number) => {
    const s = sim.current;
    let best: { side: "L" | "R"; i: number; d: number } | null = null;
    (["L", "R"] as const).forEach((side) =>
      s[side].forEach((p, i) => {
        if (!i) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < 30 && (!best || d < best.d)) best = { side, i, d };
      }),
    );
    return best as { side: "L" | "R"; i: number; d: number } | null;
  };
  const grabAt = (x: number, y: number) => {
    const n = nearest(x, y);
    if (!n) return false;
    sim.current.grab = { side: n.side, i: n.i, x, y };
    return true;
  };
  const moveTo = (x: number, y: number) => {
    const s = sim.current;
    if (s.grab) {
      s.grab.x = clamp(x, 0, W);
      s.grab.y = clamp(y, 0, H);
      return;
    }
    // brushing past pushes the planks
    const now = performance.now();
    const lp = s.ptr;
    s.ptr = { x, y, t: now };
    if (!lp || now - lp.t > 80) return;
    const vx = (x - lp.x) / Math.max(8, now - lp.t);
    const vy = (y - lp.y) / Math.max(8, now - lp.t);
    for (const ch of [s.L, s.R])
      ch.forEach((p, i) => {
        if (!i) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < 40) {
          const f = (1 - d / 40) * 2.2;
          p.ox -= vx * f;
          p.oy -= vy * f;
        }
      });
  };
  const letGo = () => {
    sim.current.grab = null;
  };
  const onDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    const p = local(e);
    if (grabAt(p.x, p.y)) e.currentTarget.setPointerCapture(e.pointerId);
  };

  // keyboard (and the demo): one end goes out to the middle and the other reaches up for it
  const fixIt = useCallback(async () => {
    const s = sim.current;
    if (s.joined) return;
    if (reduced) {
      join();
      return;
    }
    const end = s.L.length - 1;
    const start = s.L[end];
    s.grab = { side: "L", i: end, x: start.x, y: start.y };
    const tx = W / 2 - 6;
    const ty = ANCHOR_Y + 40;
    const sx = start.x;
    const sy = start.y;
    await new Promise<void>((res) => {
      animate(0, 1, {
        duration: 0.9,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (k) => {
          if (s.grab) {
            s.grab.x = sx + (tx - sx) * k;
            s.grab.y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * 30;
          }
        },
        onComplete: res,
      });
    });
    const t0 = performance.now();
    while (!s.joined && performance.now() - t0 < 3000) await new Promise((r) => setTimeout(r, 50));
    s.grab = null;
  }, [W, reduced, join, ANCHOR_Y]);

  // ─── autoplay ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      sim.current.grab = null;
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const canvasTop = () => cvRef.current!.getBoundingClientRect().top - root.getBoundingClientRect().top;
    const follow = () => {
      const ct = canvasTop();
      if (sim.current.grab) moveTo(gx.get(), gy.get() - ct);
      else moveTo(gx.get(), gy.get() - ct);
    };
    const offs = [gx.on("change", follow), gy.on("change", follow)];
    (async () => {
      await wait(1100);
      while (alive) {
        const s = sim.current;
        const ct = canvasTop();
        // brush through the right half so it swings
        gx.set(W - cliff - 120);
        gy.set(ct + ANCHOR_Y + 40);
        await run(go, 1, 0.25);
        await Promise.all([run(gx, W - cliff + 20, 0.5), run(gy, ct + ANCHOR_Y + 120, 0.5)]);
        await run(gx, W - cliff - 140, 0.35);
        await wait(700);
        // take the left half by its end and hold it out over the middle
        const e = s.L[s.L.length - 1];
        await Promise.all([run(gx, Math.min(e.x, W * 0.45), 0.7), run(gy, ct + Math.min(e.y, H - 30), 0.7)]);
        await run(gs, 0.8, 0.1);
        grabAt(e.x, e.y);
        await Promise.all([run(gx, W / 2 - 6, 1.1), run(gy, ct + ANCHOR_Y + 40, 1.1)]);
        const t0 = performance.now();
        while (!s.joined && performance.now() - t0 < 3500) await wait(60);
        letGo();
        await run(gs, 1, 0.12);
        await run(go, 0, 0.3);
        await wait(3600);
        snapApart();
        await wait(2800);
      }
    })().catch((err) => err !== STOP && console.error(err));
    return () => {
      abort();
      offs.forEach((f) => f());
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, W, cliff, ANCHOR_Y]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;

  return (
    <div ref={rootRef} className={`relative mx-auto w-full max-w-[880px] select-none overflow-hidden rounded-[28px] text-white shadow-[0_30px_60px_-30px_rgba(91,31,138,.75)] ${className}`} style={{ height: H, background: "linear-gradient(180deg, #170a3f 0%, #36116a 28%, #7c2386 50%, #d9447a 68%, #ff8a5b 84%, #ffc978 100%)" }}>
      {/* the sun going down behind the canyon */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 h-[420px] w-[420px] rounded-full" style={{ transform: "translateX(-50%)", top: H - 210, background: "radial-gradient(circle, rgba(255,226,150,.95) 0%, rgba(255,170,100,.55) 28%, rgba(255,120,110,0) 62%)" }} />
      {/* the number, down in the canyon */}
      <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 m-0 bg-clip-text text-center font-semibold leading-none tracking-[-0.06em] text-transparent" style={{ top: ANCHOR_Y - 10, fontSize: Math.min(260, W * 0.36), backgroundImage: "linear-gradient(180deg, rgba(255,240,214,.95) 10%, rgba(255,190,140,.35) 70%, rgba(255,160,120,0) 95%)" }}>
        404
      </p>
      {/* far ridges between the cliffs */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 w-full" height={150} viewBox="0 0 800 150" preserveAspectRatio="none">
        <path d="M0 70 L90 40 L170 78 L260 30 L350 72 L430 44 L520 82 L610 36 L700 70 L800 48 L800 150 L0 150 Z" fill="#b83a7e" opacity={0.75} />
        <path d="M0 105 L120 72 L210 100 L300 66 L400 104 L500 74 L590 102 L690 70 L800 98 L800 150 L0 150 Z" fill="#6a1f78" />
      </svg>
      <canvas
        ref={cvRef}
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={(e) => {
          const p = local(e);
          moveTo(p.x, p.y);
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        className="absolute inset-0 h-full w-full cursor-grab [touch-action:none] active:cursor-grabbing"
      />

      <div className="pointer-events-none relative flex flex-col items-center px-6 pt-10 text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={fixed ? "fixed" : "broken"} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.3 }} aria-live="polite">
            <h3 className="m-0 text-[clamp(24px,4vw,34px)] font-semibold tracking-[-0.03em] text-white">{fixed ? "Bridge fixed" : "This page fell through"}</h3>
            <p className="m-0 mx-auto mt-2 max-w-[44ch] text-[15px] leading-[1.5] text-[#e9dcff]">
              {fixed ? "The page still isn't here, though. Let's get you somewhere that is." : "The link you followed is broken, or the page has moved."}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-2">
          <a
            href={homeHref}
            onClick={(e) => {
              if (onHome) {
                e.preventDefault();
                onHome();
              }
            }}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-[#36116a] no-underline shadow-[0_10px_24px_-10px_rgba(255,170,100,.9)] outline-none focus-visible:ring-2 focus-visible:ring-[#ffd27a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#36116a]"
          >
            {ic("home", 15)}
            Back to home
          </a>
          <button type="button" onClick={onSearch} className="flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-[14px] font-medium text-white outline-none ring-1 ring-inset ring-white/30 backdrop-blur-md hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-[#ffd27a]">
            {ic("search", 15)}
            Search the site
          </button>
        </div>
        <button
          type="button"
          onClick={() => void (fixed ? snapApart() : fixIt())}
          className="pointer-events-auto mt-3 rounded-full px-3 py-1 text-[12.5px] text-[#e9dcff] underline-offset-2 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#ffd27a]"
        >
          {fixed ? "Break it again" : "Or fix the bridge: hold one end over the middle"}
        </button>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```
