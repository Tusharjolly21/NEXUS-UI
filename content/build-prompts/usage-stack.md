# Usage Stack

Add the "Usage Stack" component from Nexus UI to my project.

Usage-based pricing you can see: every 10,000 requests is a block that drops into a bin, coloured by the tier it falls in. Slide the volume up and blocks rain in, slide it down and the newest pop, while the monthly price rolls with it and the blocks can be grabbed and thrown.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `matter-js` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { UsageStack, USAGE_TIERS } from "@/components/usage-stack";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/usage-stack/index.ts ---

```ts
export { UsageStack, USAGE_TIERS, usagePrice } from "./usage-stack";
export type { UsageStackProps, UsageTier } from "./usage-stack";
```

--- components/usage-stack/usage-stack.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Matter from "matter-js";

export interface UsageTier {
  /** Tier name shown in the legend and the tier pill. */
  name: string;
  /** Last request count (inclusive) billed at this tier's rate. Use `Infinity` for the top tier. */
  upTo: number;
  /** Price in dollars per 1,000 requests inside this tier. */
  rate: number;
  /** Block, band and pill colour (hex). */
  color: string;
}

export interface UsageStackProps {
  /** Requests per month to start from. Rounded to the nearest 10,000. */
  defaultValue?: number;
  /** Called whenever the volume changes, with the new request count and the monthly price. */
  onChange?: (requests: number, price: number) => void;
  /** Steps the volume through a few sample values until someone touches the slider or the bin. */
  autoplay?: boolean;
}

const STEP = 1000 / 60;
const BW = 340, BH = 230, S = 29;
const MAX = 600_000, PER = 10_000;
/** The default graduated pricing: free up to 50k, then $0.25 per 1k to 250k, then $0.15 per 1k. */
export const USAGE_TIERS: UsageTier[] = [
  { name: "Free", upTo: 50_000, rate: 0, color: "#64d2ff" },
  { name: "Growth", upTo: 250_000, rate: 0.25, color: "#0071e3" },
  { name: "Scale", upTo: Infinity, rate: 0.15, color: "#5e5ce6" },
];
const TIERS = USAGE_TIERS;
const tierOf = (n: number) => TIERS.findIndex((t) => n <= t.upTo);
/** Graduated monthly price in dollars for `n` requests. */
export function usagePrice(n: number) {
  let total = 0, prev = 0;
  for (const t of TIERS) { const span = Math.max(0, Math.min(n, t.upTo) - prev); total += (span / 1000) * t.rate; prev = t.upTo; if (n <= t.upTo) break; }
  return total;
}
const price = usagePrice;
const fmt = (n: number) => n.toLocaleString("en-US");
const clampN = (v: number) => Math.max(0, Math.min(MAX, Math.round(v / PER) * PER));

type Block = { body: Matter.Body; el: HTMLDivElement | null; tier: number; gone?: number; queued?: boolean };

function shade(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c * 0.72);
  return `rgb(${f(v >> 16)},${f((v >> 8) & 255)},${f(v & 255)})`;
}

/**
 * Usage-based pricing you can see. Every 10,000 requests is a block that
 * drops into the bin, coloured by the tier it falls in. Slide the volume up
 * and blocks rain in; slide it down and the newest ones pop. The price rolls
 * as you go, and you can still grab the blocks and throw them about.
 */
export function UsageStack({ defaultValue = 120_000, onChange, autoplay = false }: UsageStackProps) {
  const root = useRef<HTMLDivElement>(null);
  const bin = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const engine = useRef<Matter.Engine | null>(null);
  const blocks = useRef<Block[]>([]);
  const grab = useRef<Matter.Constraint | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const active = useRef(true);
  const [n, setN] = useState(() => clampN(defaultValue));
  const [k, setK] = useState(1);
  const touched = useRef(false);
  const slideDrag = useRef(false);
  const onChangeRef = useRef(onChange);
  const reduce = useReducedMotion();
  const tier = tierOf(n);
  const cost = useSpring(price(n), { stiffness: 140, damping: 22 });
  useEffect(() => { cost.set(price(n)); }, [n, cost]);
  const costText = useTransform(cost, (v) => `$${Math.round(v).toLocaleString("en-US")}`);

  useEffect(() => { onChangeRef.current = onChange; });
  const nRef = useRef(n);
  useEffect(() => { nRef.current = n; }, [n]);
  /** Set the volume (clamped to 0–600k) and report it. */
  const change = (next: number) => {
    const v = Math.max(0, Math.min(MAX, next));
    if (v === nRef.current) return;
    nRef.current = v;
    setN(v);
    onChangeRef.current?.(v, price(v));
  };
  const changeRef = useRef(change);
  useEffect(() => { changeRef.current = change; });

  useEffect(() => {
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engine.current = e;
    const w = { isStatic: true, friction: 0.6 };
    Matter.Composite.add(e.world, [
      Matter.Bodies.rectangle(BW / 2, BH + 30, BW * 2, 60, w),
      Matter.Bodies.rectangle(-30, BH / 2 - 150, 60, BH + 300, w),
      Matter.Bodies.rectangle(BW + 30, BH / 2 - 150, 60, BH + 300, w),
      Matter.Bodies.rectangle(BW / 2, -330, BW * 2, 60, w),
    ]);

    // Release queued blocks into the space above the bin wherever there is room, a few per frame,
    // so a big jump in volume rains in instead of piling up on the ceiling.
    const release = () => {
      let budget = 6;
      for (const b of blocks.current) {
        if (!b.queued || b.gone !== undefined) continue;
        if (budget-- <= 0) return;
        let placed = false;
        for (let tries = 0; tries < 4 && !placed; tries++) {
          const x = 30 + Math.random() * (BW - 60), y = -40 - Math.random() * 220;
          const region = { min: { x: x - S, y: y - S }, max: { x: x + S, y: y + S } };
          const others = Matter.Composite.allBodies(e.world).filter((o) => !o.isStatic);
          if (Matter.Query.region(others, region).length) continue;
          Matter.Body.setPosition(b.body, { x, y });
          Matter.Body.setAngle(b.body, (Math.random() - 0.5) * 0.8);
          Matter.Composite.add(e.world, b.body);
          b.queued = false;
          placed = true;
        }
        if (!placed) return;
      }
    };

    let raf = 0, acc = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      acc += Math.min(100, now - last);
      last = now;
      release();
      for (let i = 0; acc >= STEP && i < 4; i++) { Matter.Engine.update(e, STEP); acc -= STEP; }
      if (acc > STEP) acc = 0;
      blocks.current = blocks.current.filter((b) => {
        if (!b.el) return true;
        if (b.queued) {
          if (b.gone !== undefined) { b.el.remove(); return false; }
          return true;
        }
        const { x, y } = b.body.position;
        let s = 1, o = 1;
        if (b.gone !== undefined) { b.gone += 1 / 14; s = 1 + b.gone * 0.5; o = 1 - b.gone; if (o <= 0) { b.el.remove(); return false; } }
        b.el.style.transform = `translate(${x - S / 2}px, ${y - S / 2}px) rotate(${b.body.angle}rad) scale(${s})`;
        b.el.style.opacity = String(o);
        return true;
      });
    };

    // Only simulate while the bin is on screen and the tab is visible.
    let onScreen = true;
    const sync = () => {
      const run = onScreen && !document.hidden;
      active.current = run;
      if (run && !raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(loop); }
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    if (root.current) io.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    sync();

    const ro = new ResizeObserver(() => { if (bin.current) setK(bin.current.offsetWidth / BW); });
    if (bin.current) ro.observe(bin.current);
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      Matter.Composite.clear(e.world, false);
      Matter.Engine.clear(e);
      engine.current = null;
      grab.current = null;
      blocks.current.forEach((b) => b.el?.remove());
      blocks.current = [];
    };
  }, []);

  // Keep the number of live blocks in step with the volume.
  useEffect(() => {
    const e = engine.current, host = layer.current;
    if (!e || !host) return;
    const want = Math.round(n / PER);
    const live = blocks.current.filter((b) => b.gone === undefined);
    for (let i = live.length; i < want; i++) {
      const t = tierOf((i + 1) * PER);
      const body = Matter.Bodies.rectangle(30 + Math.random() * (BW - 60), -40, S, S, { chamfer: { radius: 7 }, restitution: 0.2, friction: 0.5, density: 0.002 });
      const el = document.createElement("div");
      el.className = "absolute left-0 top-0 rounded-[8px] will-change-transform";
      el.style.cssText += `width:${S}px;height:${S}px;background:linear-gradient(160deg, ${TIERS[t].color}, ${shade(TIERS[t].color)});box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 2px 4px rgba(0,0,0,.12);transform:translate(-100px,-100px)`;
      host.appendChild(el);
      blocks.current.push({ body, el, tier: t, queued: true });
    }
    for (let i = live.length - 1; i >= want; i--) {
      const b = live[i];
      if (!b.queued) Matter.Composite.remove(e.world, b.body);
      b.gone = 0;
    }
  }, [n]);

  const setFromX = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    change(Math.round((f * MAX) / PER) * PER);
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      touched.current = true;
      change(e.key === "Home" ? 0 : MAX);
      return;
    }
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? PER : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -PER : e.key === "PageUp" ? PER * 5 : e.key === "PageDown" ? -PER * 5 : 0;
    if (d) { e.preventDefault(); touched.current = true; change(nRef.current + d); }
  };

  const local = (e: RPointerEvent) => {
    const r = bin.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * BW, y: ((e.clientY - r.top) / r.height) * BH };
  };
  const binDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const p = local(e);
    const hit = Matter.Query.point(blocks.current.filter((b) => b.gone === undefined && !b.queued).map((b) => b.body), p)[0];
    if (!hit || !engine.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = Matter.Constraint.create({ pointA: p, bodyB: hit, pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y }, stiffness: 0.15, damping: 0.1, length: 0 });
    Matter.Composite.add(engine.current.world, grab.current);
  };
  const binMove = (e: RPointerEvent) => { if (grab.current) grab.current.pointA = local(e); };
  const binUp = () => {
    if (grab.current && engine.current) Matter.Composite.remove(engine.current.world, grab.current);
    grab.current = null;
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const seq = [260_000, 480_000, 90_000, 340_000, 600_000, 150_000];
    let i = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!active.current) return;
      changeRef.current(seq[i++ % seq.length]);
    }, 2600);
    return () => clearInterval(id);
  }, [autoplay, reduce]);

  const frac = n / MAX;
  const monthly = Math.round(price(n));
  return (
    <div
      ref={root}
      className="w-[380px] max-w-full select-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Usage pricing</h3>
          <p className="m-0 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Each block is 10,000 requests.</p>
        </div>
        <div className="flex flex-col items-end">
          <motion.span className="text-[28px] font-semibold leading-none tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{costText}</motion.span>
          <span className="mt-1 text-[12px] text-[#86868b] dark:text-[#8e8e93]">per month</span>
        </div>
      </div>

      <div
        ref={bin}
        className="relative mt-4 w-full touch-none overflow-hidden rounded-[16px] bg-[#f5f5f7] shadow-[inset_0_2px_6px_rgba(0,0,0,.07)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,.4)]"
        style={{ aspectRatio: `${BW} / ${BH}`, cursor: "grab" }}
        onPointerDown={binDown}
        onPointerMove={binMove}
        onPointerUp={binUp}
        onPointerCancel={binUp}
        role="img"
        aria-label={`${fmt(n)} requests: ${Math.round(n / PER)} blocks`}
      >
        <div ref={layer} className="absolute left-0 top-0 origin-top-left" style={{ width: BW, height: BH, transform: `scale(${k})` }} />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          {TIERS.map((t, i) => (
            <span
              key={t.name}
              className={`flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur dark:bg-[#1c1c1e]/85 ${i === tier ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#86868b] dark:text-[#8e8e93]"}`}
            >
              <span className="h-2 w-2 rounded-[3px]" style={{ background: t.color }} />{t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Requests / month</span>
        <span className="text-[15px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{fmt(n)}</span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Requests per month"
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-valuenow={n}
        aria-valuetext={`${fmt(n)} requests, ${TIERS[tier].name} tier, $${fmt(monthly)} per month`}
        onKeyDown={key}
        onPointerDown={(e) => { touched.current = true; slideDrag.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromX(e.clientX); }}
        onPointerMove={(e) => { if (slideDrag.current) setFromX(e.clientX); }}
        onPointerUp={() => { slideDrag.current = false; }}
        onPointerCancel={() => { slideDrag.current = false; }}
        className="relative mt-3 h-6 cursor-pointer touch-none outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
      >
        <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
          {/* tier bands */}
          {TIERS.map((t, i) => {
            const a = i === 0 ? 0 : TIERS[i - 1].upTo / MAX, b = Math.min(1, t.upTo / MAX);
            return (
              <motion.div
                key={t.name}
                className="absolute inset-y-0"
                style={{ left: `${a * 100}%`, width: `${(b - a) * 100}%`, background: t.color }}
                animate={{ clipPath: `inset(0 ${Math.max(0, Math.min(100, ((b - frac) / (b - a)) * 100))}% 0 0)` }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
              />
            );
          })}
        </div>
        <motion.div
          className="absolute top-1/2 h-6 w-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.3),0_0_0_0.5px_rgba(0,0,0,.08)]"
          style={{ y: "-50%", x: "-50%" }}
          animate={{ left: `${frac * 100}%` }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-[#86868b] dark:text-[#8e8e93]"><span>0</span><span>200k</span><span>400k</span><span>600k</span></div>

      <div className="mt-4 flex items-center justify-between rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 dark:bg-[#2c2c2e]">
        <span className="flex items-center gap-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={tier} className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-white" style={{ background: TIERS[tier].color }} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>{TIERS[tier].name}</motion.span>
          </AnimatePresence>
          tier
        </span>
        <span className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{n <= 50_000 ? "First 50k are free" : `$${(price(n) / (n / 1000)).toFixed(3)} per 1k`}</span>
      </div>
    </div>
  );
}
```
