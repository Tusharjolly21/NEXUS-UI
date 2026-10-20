"use client";
import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/** Visuals receive whether their tile is active, so they can play. */
export type LatticeVisualProps = { active: boolean };

export type LatticeFeature = {
  title: string;
  body: string;
  /** Any icon component that takes a className (lucide icons work). */
  icon?: ComponentType<{ className?: string }>;
  /** Small illustration at the top of the tile: a node, or a component that receives `{ active }`. */
  visual?: ReactNode | ComponentType<LatticeVisualProps>;
};

export type LatticeFeaturesProps = {
  /** Feature tiles. Four fit the 2x2 lattice best. */
  items?: LatticeFeature[];
  /** Small label above the heading. */
  eyebrow?: string;
  /** Section heading. Pass an empty string to hide the header. */
  heading?: string;
  /** Wanders the light over the lattice and plays each tile in turn until someone points at it. */
  autoplay?: boolean;
  /** Extra classes for the section. */
  className?: string;
};

const SPRING = { type: "spring" as const, stiffness: 340, damping: 18 };

function makeIcon(d: string) {
  function I({ className = "" }: { className?: string }) {
    return (
      <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    );
  }
  return I;
}

const PaletteIcon = makeIcon("M8 1.8a6.2 6.2 0 100 12.4c1 0 1.4-.6 1.4-1.3 0-1-.9-1.2-.9-2s.6-1.3 1.5-1.3h1.6a2.6 2.6 0 002.6-2.6C14.2 4.1 11.4 1.8 8 1.8zM4.8 7.6h0M6.5 4.8h0M9.7 4.8h0");
const WaveIcon = makeIcon("M1.5 9c1.6 0 1.6-3 3.2-3s1.6 4 3.3 4 1.6-5 3.2-5 1.7 2 3.3 2");
const FocusIcon = makeIcon("M5 2H3a1 1 0 00-1 1v2M11 2h2a1 1 0 011 1v2M5 14H3a1 1 0 01-1-1v-2M11 14h2a1 1 0 001-1v-2M8 6v4M6 8h4");
const SearchIcon = makeIcon("M7 12.2a5.2 5.2 0 100-10.4 5.2 5.2 0 000 10.4zM14.2 14.2l-3.4-3.4");
const SparkIcon = makeIcon("M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.4 3.4l2 2M10.6 10.6l2 2M3.4 12.6l2-2M10.6 5.4l2-2");

const SWATCHES = ["#1d1d1f", "#0071e3", "#bf5af2", "#ff375f", "#ff9f0a", "#30d158"];

function TokensVisual({ active }: LatticeVisualProps) {
  return (
    <div className="flex h-16 items-end gap-1.5 pl-1">
      {SWATCHES.map((c, i) => {
        const k = i - (SWATCHES.length - 1) / 2;
        return (
          <motion.span
            key={c}
            className="h-11 w-7 origin-bottom rounded-[8px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.18),0_6px_12px_-8px_rgba(0,0,0,.5)]"
            style={{ backgroundColor: c }}
            initial={false}
            animate={active ? { rotate: k * 9, y: Math.abs(k) * 4 - 10, x: k * 4 } : { rotate: 0, y: 0, x: 0 }}
            transition={{ ...SPRING, delay: active ? i * 0.035 : 0 }}
          />
        );
      })}
    </div>
  );
}

function SpringVisual({ active }: LatticeVisualProps) {
  return (
    <div className="relative h-16 w-full max-w-[220px]">
      <svg viewBox="0 0 220 64" className="absolute inset-0 size-full" aria-hidden="true">
        <path d="M0 52 H220" className="stroke-[#d2d2d7] dark:stroke-[#48484a]" strokeDasharray="3 4" />
        <motion.path
          key={active ? "on" : "off"}
          d="M4 52 C 40 52, 52 6, 84 10 S 116 34, 136 28 S 166 18, 184 22 S 206 24, 216 24"
          fill="none"
          className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={active ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <motion.span
        className="absolute right-0 top-0 size-4 rounded-full bg-[#0071e3] shadow-[0_6px_12px_-4px_rgba(0,113,227,.6)] dark:bg-[#0a84ff]"
        initial={false}
        animate={active ? { y: [0, 30, 14, 20, 17], scaleY: [1, 0.7, 1.1, 0.95, 1], scaleX: [1, 1.25, 0.92, 1.04, 1] } : { y: 17, scaleY: 1, scaleX: 1 }}
        transition={active ? { duration: 1.1, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeOut" } : { duration: 0.3 }}
      />
    </div>
  );
}

function A11yVisual({ active }: LatticeVisualProps) {
  const id = useId().replace(/:/g, "");
  const [on, setOn] = useState(1);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setOn((v) => (v + 1) % 2), 900);
    return () => window.clearInterval(t);
  }, [active]);
  return (
    <div className="flex h-16 items-center gap-2" aria-hidden="true">
      {["Cancel", "Confirm"].map((label, i) => (
        <span
          key={label}
          className={`relative rounded-[10px] px-3 py-1.5 text-[12px] font-medium ${
            i === 1 ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]" : "bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
          }`}
        >
          {(active ? on : 1) === i ? (
            <motion.span layoutId={`${id}-ring`} className="absolute -inset-[4px] rounded-[13px] ring-2 ring-[#0071e3] dark:ring-[#0a84ff]" transition={SPRING} />
          ) : null}
          {label}
        </span>
      ))}
      <span className="ml-1 rounded-[6px] bg-[#f0f0f3] px-1.5 py-0.5 text-[11px] font-medium text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">Tab</span>
    </div>
  );
}

const RESULTS = [
  { id: "you", site: "northwind.co › pricing", title: "Pricing · Northwind" },
  { id: "b", site: "acme.dev › plans", title: "Plans and pricing" },
  { id: "c", site: "globex.io › buy", title: "Buy Globex" },
];

function SeoVisual({ active }: LatticeVisualProps) {
  const order = active ? ["you", "b", "c"] : ["b", "c", "you"];
  return (
    <div className="flex h-16 w-full max-w-[240px] flex-col justify-center gap-1" aria-hidden="true">
      {order.map((id, i) => {
        const r = RESULTS.find((x) => x.id === id)!;
        const me = id === "you";
        return (
          <motion.div
            key={id}
            layout
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`flex items-center gap-2 rounded-[8px] px-2 py-[3px] ${me ? "bg-[#0071e3]/10 dark:bg-[#0a84ff]/20" : ""}`}
          >
            <span className="w-3 text-[10px] font-semibold tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{i + 1}</span>
            <span className="min-w-0 truncate text-[11px]">
              <span className={me ? "font-semibold text-[#0066cc] dark:text-[#64a8ff]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}>{r.title}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

const ITEMS: LatticeFeature[] = [
  { title: "Tokens, not hex codes", body: "Colour, type and spacing come from one set of variables, so a rebrand is a single file.", icon: PaletteIcon, visual: TokensVisual },
  { title: "Motion with intent", body: "Springs tuned to feel physical: quick to respond, calm to settle, never in the way.", icon: WaveIcon, visual: SpringVisual },
  { title: "Accessible by default", body: "Focus you can see, keyboard paths that make sense and reduced motion honoured everywhere.", icon: FocusIcon, visual: A11yVisual },
  { title: "Ready for search", body: "Semantic markup, real headings and a fast first paint, so pages rank as well as they look.", icon: SearchIcon, visual: SeoVisual },
];

function renderVisual(v: LatticeFeature["visual"], active: boolean) {
  if (!v) return null;
  if (typeof v === "function") {
    const V = v as ComponentType<LatticeVisualProps>;
    return <V active={active} />;
  }
  return v as ReactNode;
}

/**
 * A feature grid drawn on a hairline lattice. The hairlines catch a soft blue
 * light that follows the pointer, and the tile under it plays its little
 * illustration: swatches fan out, a spring ball lands and settles, a focus
 * ring hops between buttons, a search result climbs to first place.
 */
export function LatticeFeatures({
  items = ITEMS,
  eyebrow = "Why teams switch",
  heading = "Everything a design system should have done for you",
  autoplay = false,
  className = "",
}: LatticeFeaturesProps) {
  const reduce = useReducedMotion() === true;
  const lattice = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  const lx = useMotionValue(120);
  const ly = useMotionValue(80);
  const sx = useSpring(lx, { stiffness: 120, damping: 20 });
  const sy = useSpring(ly, { stiffness: 120, damping: 20 });
  const glow = useMotionValue(0);
  const glowS = useSpring(glow, { stiffness: 200, damping: 30 });
  const lines = useMotionTemplate`radial-gradient(280px circle at ${sx}px ${sy}px, var(--lat-glow), transparent 70%)`;
  const wash = useMotionTemplate`radial-gradient(380px circle at ${sx}px ${sy}px, var(--lat-wash), transparent 70%)`;

  const count = items.length;
  useEffect(() => {
    if (!autoplay || reduce || count === 0) return;
    let raf = 0;
    let k = 0;
    const t0 = performance.now();
    glow.set(1);
    const frame = (t: number) => {
      if (touched.current) return;
      const el = lattice.current;
      if (el) {
        const s = (t - t0) / 1000;
        lx.set(el.offsetWidth * (0.5 + Math.sin(s * 0.9) * 0.4));
        ly.set(el.offsetHeight * (0.5 + Math.sin(s * 1.3 + 1) * 0.38));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const first = window.setTimeout(() => !touched.current && setActive(0), 400);
    const iv = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(iv);
        return;
      }
      setActive(++k % count);
    }, 2400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(first);
      window.clearInterval(iv);
    };
  }, [autoplay, reduce, count, lx, ly, glow]);

  const point = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    lx.set(e.clientX - r.left);
    ly.set(e.clientY - r.top);
  };

  return (
    <section className={`@container w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] @min-[560px]:p-8 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}>
      {heading ? (
        <div className="max-w-lg">
          {eyebrow ? <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0066cc] dark:text-[#64a8ff]">{eyebrow}</p> : null}
          <h2 className="mt-2 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] [text-wrap:balance]">{heading}</h2>
        </div>
      ) : null}
      <div
        ref={lattice}
        onPointerEnter={() => {
          touched.current = true;
          glow.set(1);
        }}
        onPointerMove={point}
        onPointerLeave={() => {
          glow.set(0);
          setActive(null);
        }}
        className={`relative grid grid-cols-1 gap-px overflow-hidden rounded-[22px] bg-[#e5e5ea] p-px [--lat-glow:rgba(0,113,227,.85)] [--lat-wash:rgba(0,113,227,.06)] @min-[520px]:grid-cols-2 dark:bg-[#38383a] dark:[--lat-glow:rgba(10,132,255,.9)] dark:[--lat-wash:rgba(10,132,255,.1)] ${heading ? "mt-6" : ""}`}
      >
        {!reduce ? <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: lines, opacity: glowS }} /> : null}
        {items.map((it, i) => {
          const Icon = it.icon ?? SparkIcon;
          const on = active === i;
          return (
            <motion.div
              key={it.title}
              tabIndex={0}
              onPointerEnter={() => setActive(i)}
              onFocus={() => {
                touched.current = true;
                setActive(i);
              }}
              onBlur={() => setActive((a) => (a === i ? null : a))}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 240, damping: 24, delay: i * 0.07 }}
              className="relative flex flex-col bg-white p-5 outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:focus-visible:outline-[#0a84ff]"
            >
              {!reduce ? <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: wash, opacity: glowS }} /> : null}
              <div className="relative flex min-h-[64px] items-center">{renderVisual(it.visual, on && !reduce)}</div>
              <div className="relative mt-4 flex items-center gap-2">
                <motion.span
                  className={`grid size-7 place-items-center rounded-[9px] transition-colors duration-200 ${
                    on ? "bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "bg-[#f0f0f3] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]"
                  }`}
                  animate={{ scale: on ? 1.08 : 1 }}
                  transition={SPRING}
                >
                  <Icon className="size-3.5" />
                </motion.span>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{it.title}</h3>
              </div>
              <p className="relative mt-2 text-[13px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{it.body}</p>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Move across the grid; each tile plays its idea.</p>
    </section>
  );
}
