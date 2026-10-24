"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ─── Demo data (invented people and companies) ─────────────────────────────────

export type WallTestimonial = {
  name: string;
  role: string;
  quote: string;
  /** a phrase inside the quote to highlight */
  mark?: string;
  /** turns the card into a big-number card */
  metric?: { value: string; label: string };
  hue: number;
};

/** Invented people and companies, used when no `items` are passed. */
export const DEFAULT_WALL_TESTIMONIALS: WallTestimonial[] = [
  { name: "Maya Chen", role: "Design lead, Lumora", quote: "We rebuilt our whole onboarding in an afternoon. The motion feels like it was designed in-house, not pulled from a kit.", mark: "in an afternoon", hue: 212 },
  { name: "Daniel Okafor", role: "CTO, fieldnote", quote: "Every component is one file with no surprises. I read it, I understand it, I ship it.", mark: "one file", hue: 152 },
  { name: "Sofia Marquez", role: "Founder, Parcel & Pine", quote: "Checkout conversion went up the week we swapped in the new buttons.", metric: { value: "+18%", label: "checkout conversion in week one" }, hue: 28 },
  { name: "Arjun Mehta", role: "Staff engineer, Quillstack", quote: "The springs are tuned better than anything I would have had time to tune myself.", mark: "tuned better", hue: 268 },
  { name: "Lena Fischer", role: "Head of growth, Tidewater", quote: "Our landing page finally feels alive. People screenshot it and send it to us.", mark: "feels alive", hue: 192 },
  { name: "Kenji Watanabe", role: "Product designer, Orbitly", quote: "I prototype in it now. What I hand over is what ships, frame for frame.", hue: 340 },
  { name: "Amara Nwosu", role: "PM, Cobalt Labs", quote: "Design and engineering stopped arguing about motion. There is nothing left to argue about.", hue: 230 },
  { name: "Lucas Moreau", role: "Frontend lead, Glasshouse", quote: "Shipped faster than our old in-house library could even build.", metric: { value: "3.4x", label: "faster from design to production" }, hue: 200 },
  { name: "Priya Nair", role: "Indie maker", quote: "I am one person and my product looks like a team of twenty made it.", mark: "a team of twenty", hue: 320 },
  { name: "Noah Bennett", role: "Engineering manager, Driftline", quote: "Accessibility was already handled: focus rings, labels, reduced motion. That alone saved us a sprint.", mark: "saved us a sprint", hue: 168 },
  { name: "Elif Yilmaz", role: "Founder, Kiln", quote: "Our investors asked who did our product design. It was this, and two evenings.", hue: 12 },
  { name: "Marcus Hale", role: "VP engineering, Ledgerly", quote: "Bundle stayed small because nothing pulls in a dependency you did not ask for.", metric: { value: "0", label: "extra dependencies beyond React and framer-motion" }, hue: 248 },
  { name: "Hana Kim", role: "Freelance designer", quote: "Clients think I hired a motion designer. I did not tell them otherwise.", mark: "hired a motion designer", hue: 288 },
  { name: "Tomás Ruiz", role: "Developer, Oakhaven", quote: "Copied a file, changed two props, done. That is the whole review.", hue: 96 },
];

// ─── Small pieces ──────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function Avatar({ name, hue, size = 36 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${hue + 38} 70% 44%))`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)" }}
    >
      {initials(name)}
    </span>
  );
}

function Stars({ n = 5, size = 13 }: { n?: number; size?: number }) {
  return (
    <span className="flex gap-0.5 text-[#ff9f0a]" aria-label={`${n} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < n ? "currentColor" : "#e5e5ea"} aria-hidden="true">
          <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9Z" />
        </svg>
      ))}
    </span>
  );
}

function Quote({ text, mark, hue }: { text: string; mark?: string; hue: number }) {
  if (!mark || !text.includes(mark)) return <>{text}</>;
  const [a, b] = text.split(mark);
  return (
    <>
      {a}
      <mark className="rounded-[4px] px-0.5 text-[#1d1d1f]" style={{ background: `hsl(${hue} 90% 88%)` }}>
        {mark}
      </mark>
      {b}
    </>
  );
}

function Card({ t }: { t: WallTestimonial }) {
  return (
    <figure className="m-0 flex flex-col gap-3 rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,0,0,.06),0_28px_50px_-24px_rgba(0,0,0,.4)]">
      {t.metric ? (
        <div className="flex flex-col">
          <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums" style={{ color: `hsl(${t.hue} 80% 40%)` }}>
            {t.metric.value}
          </span>
          <span className="mt-1.5 text-[13px] font-medium text-[#6e6e73]">{t.metric.label}</span>
        </div>
      ) : (
        <Stars />
      )}
      <blockquote className="m-0 text-[15px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f]">
        <Quote text={t.quote} mark={t.mark} hue={t.hue} />
      </blockquote>
      <figcaption className="flex items-center gap-2.5">
        <Avatar name={t.name} hue={t.hue} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13.5px] font-semibold text-[#1d1d1f]">{t.name}</span>
          <span className="truncate text-[12.5px] text-[#6e6e73]">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// ─── Wall ──────────────────────────────────────────────────────────────────────

const mod = (a: number, n: number) => ((a % n) + n) % n;

export type TestimonialWallProps = {
  /** The reviews. Each can highlight a phrase (`mark`) or become a big-number card (`metric`). */
  items?: WallTestimonial[];
  /** Height of the wall, in px. */
  height?: number;
  /** Base drift in px per second. */
  speed?: number;
  /** The wall drifts by itself. When false it starts paused; the visitor can press Play, or drag it. */
  autoplay?: boolean;
  /** Heading above the wall. */
  title?: string;
  className?: string;
};

/**
 * Testimonial Wall: an endless vertical wall of reviews. Columns drift in
 * opposite directions at slightly different speeds. Cards swell gently as they
 * pass the middle and recede towards the edges, like reading through a lens.
 * Hover a column and it eases to a stop while the others slow down; drag
 * anywhere to scrub the wall and fling it, it glides back to its own pace.
 * A pause button stops all motion, and reduced motion starts it paused.
 */
export function TestimonialWall({
  items = DEFAULT_WALL_TESTIMONIALS,
  height = 560,
  speed = 30,
  autoplay = true,
  title = "Loved by teams who ship",
  className = "",
}: TestimonialWallProps) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const [cols, setCols] = useState(3);
  // null until the visitor presses Pause or Play; until then reduced motion or `autoplay={false}` keep it still
  const [manual, setManual] = useState<boolean | null>(null);
  const paused = manual ?? (!autoplay || !!reduce);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // responsive column count from our own width
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setCols(w < 540 ? 1 : w < 820 ? 2 : 3);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    const out: WallTestimonial[][] = Array.from({ length: cols }, () => []);
    items.forEach((t, i) => out[i % cols].push(t));
    // stagger each column so neighbours never start on the same kind of card
    return out.map((c, i) => [...c.slice(i % c.length), ...c.slice(0, i % c.length)]);
  }, [items, cols]);

  // all live numbers sit in a ref: the loop never re-renders React
  const sim = useRef({
    off: [] as number[],
    f: [] as number[],
    period: [] as number[],
    cards: [] as { el: HTMLElement; top: number; h: number }[][],
    hover: -1,
    focus: false,
    drag: null as null | { y: number; t: number; v: number },
    fling: 0,
  });

  // measure periods and card offsets whenever the layout changes
  useEffect(() => {
    const s = sim.current;
    const measure = () => {
      tracks.current.slice(0, cols).forEach((tr, c) => {
        if (!tr) return;
        const kids = Array.from(tr.children) as HTMLElement[];
        const n = kids.length / 2;
        s.period[c] = n ? kids[n].offsetTop - kids[0].offsetTop : 1;
        s.cards[c] = kids.map((el) => ({ el, top: el.offsetTop, h: el.offsetHeight }));
        if (s.off[c] === undefined) s.off[c] = (c * 137) % (s.period[c] || 1);
        if (s.f[c] === undefined) s.f[c] = pausedRef.current ? 0 : 1;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    tracks.current.slice(0, cols).forEach((t) => t && ro.observe(t));
    return () => ro.disconnect();
  }, [cols, columns]);

  // the loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const s = sim.current;
    const mults = [1, 1.22, 0.9];
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const H = view.current?.clientHeight ?? height;
      s.fling *= Math.exp(-dt * 2.6);
      if (Math.abs(s.fling) < 0.5) s.fling = 0;
      for (let c = 0; c < cols; c++) {
        const tr = tracks.current[c];
        const P = s.period[c];
        if (!tr || !P) continue;
        const want = pausedRef.current || s.focus ? 0 : s.hover === c ? 0 : s.hover >= 0 ? 0.45 : 1;
        s.f[c] += (want - s.f[c]) * (1 - Math.exp(-dt * 3.2));
        const dir = c % 2 === 0 ? 1 : -1;
        if (!s.drag) s.off[c] += (dir * speed * mults[c % 3] * s.f[c] + s.fling) * dt;
        const y = -mod(s.off[c], P);
        tr.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
        // lens: swell through the middle, recede at the edges
        for (const k of s.cards[c] ?? []) {
          const mid = k.top + k.h / 2 + y;
          const d = Math.min(1.4, Math.abs(mid - H / 2) / (H / 2));
          const sc = 1 - 0.065 * d * d;
          k.el.style.transform = `scale(${sc.toFixed(4)})`;
          k.el.style.opacity = (1 - 0.32 * Math.min(1, d * d)).toFixed(3);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cols, speed, height]);

  // drag to scrub, release to fling
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    // touch keeps native page scrolling; mouse and pen scrub the wall
    if (e.button !== 0 || e.pointerType === "touch") return;
    sim.current.drag = { y: e.clientY, t: performance.now(), v: 0 };
    sim.current.fling = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    const d = s.drag;
    if (!d) return;
    const now = performance.now();
    const dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t) / 1000;
    d.v = d.v * 0.6 + (-dy / dt) * 0.4;
    d.y = e.clientY;
    d.t = now;
    for (let c = 0; c < cols; c++) s.off[c] = (s.off[c] ?? 0) - dy;
  };
  const onUp = () => {
    const s = sim.current;
    if (!s.drag) return;
    s.fling = Math.max(-2600, Math.min(2600, s.drag.v));
    s.drag = null;
  };

  return (
    <div ref={root} className={`flex w-full max-w-[1040px] flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className="flex -space-x-2">
            {items.slice(0, 4).map((t) => (
              <span key={t.name} className="rounded-full ring-2 ring-[#f5f5f7]">
                <Avatar name={t.name} hue={t.hue} size={30} />
              </span>
            ))}
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{title}</span>
            <span className="flex items-center gap-1.5 text-[12.5px] text-[#6e6e73]">
              <Stars size={11} /> <span className="tabular-nums">4.9 from 2,140 reviews</span>
            </span>
          </span>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setManual(!paused)}
          aria-pressed={paused}
          className="border-0 [font-family:inherit] inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none hover:shadow-[0_0_0_1px_rgba(0,0,0,.16)] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {paused ? <path d="M7 4.5v15l12-7.5z" /> : <><rect x="5.5" y="4.5" width="4.5" height="15" rx="1.2" /><rect x="14" y="4.5" width="4.5" height="15" rx="1.2" /></>}
          </svg>
          {paused ? "Play" : "Pause"}
        </motion.button>
      </div>

      <div
        ref={view}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onFocus={() => (sim.current.focus = true)}
        onBlur={() => (sim.current.focus = false)}
        className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        style={{
          height,
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 13%, #000 87%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, #000 13%, #000 87%, transparent)",
        }}
        aria-label={`${title}: reviews`}
        role="region"
      >
        <div className="grid h-full gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {columns.map((col, c) => (
            <div
              key={`${cols}-${c}`}
              className="relative h-full min-w-0"
              onPointerEnter={(e) => e.pointerType === "mouse" && (sim.current.hover = c)}
              onPointerLeave={() => (sim.current.hover = -1)}
            >
              <div
                ref={(el) => {
                  tracks.current[c] = el;
                }}
                className="absolute inset-x-0 top-0 flex flex-col gap-4 py-2 will-change-transform"
                role="list"
              >
                {[...col, ...col].map((t, i) => (
                  <div key={i} role="listitem" aria-hidden={i >= col.length || undefined} className="origin-center will-change-transform">
                    <Card t={t} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="m-0 px-1 text-[12.5px] text-[#86868b]">Hover a column to stop it. Drag the wall, or fling it.</p>
    </div>
  );
}
