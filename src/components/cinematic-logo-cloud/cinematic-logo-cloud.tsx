"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type LogoCloudClient = {
  name: string;
  /** Your own mark (an inline SVG component, an <Image>, anything). Wins over `src`. */
  logo?: React.ReactNode;
  /** Image URL for the mark. Nothing is fetched unless you pass one. */
  src?: string;
  /** Kept for older data. No longer fetched from a CDN; a drawn monogram is shown instead unless `logo` or `src` is set. */
  slug?: string;
  /** Render the name itself as a wordmark, styled with `className`. */
  text?: boolean;
  /** Classes for the text wordmark. */
  className?: string;
  /** Classes for the name in the named marquee. */
  nameClassName?: string;
  /** Invert the `src` image in dark mode (for black marks). */
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients?: LogoCloudClient[];
  variant?: "grid" | "marquee" | "marquee-named";
  className?: string;
  eyebrow?: string;
  description?: string;
  /** Marquee speed in px per second. */
  speed?: number;
  /** Grid: sweeps the spotlight across the logos until someone points at them. */
  autoplay?: boolean;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Drawn marks for the default (fictional) brands. */
function Glyph({ kind }: { kind: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const shapes = [
    <g key="0" {...p}><circle cx="12" cy="12" r="8" /><circle cx="18.5" cy="6.5" r="2" fill="currentColor" stroke="none" /></g>,
    <g key="1" {...p}><path d="M4 9c3-3 5 3 8 0s5 3 8 0M4 15c3-3 5 3 8 0s5 3 8 0" /></g>,
    <g key="2"><path d="M12 3 21 12 12 21 3 12Z" fill="currentColor" /></g>,
    <g key="3" {...p}><path d="M7 4v16M17 4v16M7 12h10" /></g>,
    <g key="4"><path d="M12 3 20 7.5v9L12 21 4 16.5v-9Z" fill="currentColor" /></g>,
    <g key="5" {...p}><path d="M4 18 12 5l8 13Z" /></g>,
    <g key="6"><rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor" /><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor" /><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor" opacity=".35" /><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor" opacity=".35" /></g>,
    <g key="7" {...p}><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /></g>,
    <g key="8"><path d="M5 19V5h5.5a4.5 4.5 0 0 1 0 9H5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></g>,
    <g key="9" {...p}><path d="M3 12h4l2-6 4 12 2-6h6" /></g>,
    <g key="10"><circle cx="8" cy="12" r="5" fill="currentColor" /><circle cx="16" cy="12" r="5" fill="currentColor" opacity=".45" /></g>,
    <g key="11" {...p}><path d="M12 3v18M5.5 6.5l13 11M18.5 6.5l-13 11" /></g>,
  ];
  return (
    <svg viewBox="0 0 24 24" className="size-[1.15em] shrink-0" aria-hidden>
      {shapes[kind % shapes.length]}
    </svg>
  );
}

export const DEFAULT_LOGO_CLIENTS: LogoCloudClient[] = [
  "Orbitly", "Northwind", "Kitefly", "Parallel", "Hexa", "Vela", "Quadrant", "Meridian", "Pulse", "Signal", "Duet", "Astra",
].map((name, i) => ({ name, logo: <Glyph kind={i} />, className: "font-semibold tracking-[-0.03em]" }));

const MONO = ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff"];
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** The mark: your logo, your image, or a drawn monogram. */
function Mark({ c, size }: { c: LogoCloudClient; size: number }) {
  if (c.logo) return <span className="inline-flex items-center" style={{ fontSize: size }}>{c.logo}</span>;
  if (c.src)
    // eslint-disable-next-line @next/next/no-img-element -- consumers pass any URL, including SVGs from other origins.
    return <img src={c.src} alt="" className={`w-auto ${c.invertDark ? "dark:invert" : ""}`} style={{ height: size }} loading="lazy" draggable={false} />;
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-[28%] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.55, background: MONO[hash(c.name) % MONO.length] }}
    >
      {c.name.trim()[0]?.toUpperCase()}
    </span>
  );
}

/** Logo plus wordmark, as shown in the grid. */
function Brand({ c }: { c: LogoCloudClient }) {
  if (c.text && !c.logo && !c.src) return <span className={`text-[20px] font-semibold tracking-[-0.03em] ${c.className ?? ""}`}>{c.name}</span>;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Mark c={c} size={c.src ? 24 : 22} />
      {!c.src && <span className={`text-[17px] font-semibold tracking-[-0.03em] ${c.className ?? ""}`}>{c.name}</span>}
    </span>
  );
}

/** A grid cell that resolves from soft grey to crisp ink as the spotlight passes. */
function Cell({ c, i, lx, ly, inView, still }: { c: LogoCloudClient; i: number; lx: MotionValue<number>; ly: MotionValue<number>; inView: boolean; still: boolean }) {
  const ref = React.useRef<HTMLLIElement>(null);
  const lit = useTransform([lx, ly], ([x, y]: number[]) => {
    const el = ref.current;
    if (!el || x < -1000) return 0;
    const cx = el.offsetLeft + el.offsetWidth / 2;
    const cy = el.offsetTop + el.offsetHeight / 2;
    const d = Math.hypot(x - cx, y - cy) / 150;
    return Math.exp(-d * d);
  });
  const glow = useSpring(lit, { stiffness: 200, damping: 24 });
  const opacity = useTransform(glow, [0, 1], [0.6, 1]);
  const scale = useTransform(glow, [0, 1], [1, still ? 1 : 1.06]);
  const y = useTransform(glow, [0, 1], [0, still ? 0 : -2]);
  return (
    <motion.li
      ref={ref}
      className="flex h-[66px] items-center justify-center px-3"
      initial={false}
      animate={inView || still ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(10px)", y: 14 }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18, delay: 0.06 * i }}
    >
      <motion.span className="text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ opacity, scale, y }}>
        <Brand c={c} />
      </motion.span>
    </motion.li>
  );
}

/** Marquee track driven by rAF: drifts, slows under the pointer, and can be dragged and flung. */
function Marquee({ clients, named, speed, still }: { clients: LogoCloudClient[]; named: boolean; speed: number; still: boolean }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const first = React.useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const slow = useSpring(1, { stiffness: 120, damping: 20 });
  const [copies, setCopies] = React.useState(2);
  const [paused, setPaused] = React.useState(false);
  const drag = React.useRef<{ id: number; last: number; t: number; v: number } | null>(null);
  const fling = React.useRef(0);
  const pausedRef = React.useRef(false);
  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  React.useEffect(() => {
    const w = wrap.current;
    const f = first.current;
    if (!w || !f || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const need = Math.max(2, Math.ceil(w.clientWidth / Math.max(1, f.scrollWidth)) + 1);
      setCopies((c) => (c === need ? c : need));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);
    ro.observe(f);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const span = first.current?.scrollWidth ?? 0;
      if (span > 0 && !drag.current) {
        fling.current *= Math.pow(0.04, dt);
        if (Math.abs(fling.current) < 4) fling.current = 0;
        const base = pausedRef.current ? 0 : -speed * slow.get();
        let next = x.get() + (base + fling.current) * dt;
        next = ((next % span) + span) % span - span;
        x.set(r3(next));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [still, speed, slow, x]);

  const pill = `flex shrink-0 items-center rounded-[16px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_8px_20px_-14px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${named ? "gap-2.5 px-4 py-2.5" : "px-5 py-3"}`;
  const item = (c: LogoCloudClient) => (
    <span className={pill}>
      {named || !c.text ? <Mark c={c} size={named ? 20 : 22} /> : null}
      {(named || (c.text && !c.logo && !c.src)) && <span className={`whitespace-nowrap text-[15px] font-semibold tracking-[-0.02em] ${c.nameClassName ?? c.className ?? ""}`}>{c.name}</span>}
    </span>
  );

  if (still) {
    return (
      <ul className="flex flex-wrap justify-center gap-3 px-4">
        {clients.map((c) => (
          <li key={c.name} aria-label={c.name}>
            {item(c)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="relative">
      <div
        ref={wrap}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden py-3 active:cursor-grabbing"
        style={{ maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") slow.set(0.15);
        }}
        onPointerLeave={() => slow.set(1)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, last: e.clientX, t: performance.now(), v: 0 };
          fling.current = 0;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const now = performance.now();
          const dx = e.clientX - d.last;
          const span = first.current?.scrollWidth ?? 1;
          let next = x.get() + dx;
          next = ((next % span) + span) % span - span;
          x.set(r3(next));
          d.v = (dx / Math.max(1, now - d.t)) * 1000 * 0.6 + d.v * 0.4;
          d.last = e.clientX;
          d.t = now;
        }}
        onPointerUp={() => {
          fling.current = Math.max(-2400, Math.min(2400, drag.current?.v ?? 0));
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <motion.div className="flex w-max" style={{ x }}>
          {Array.from({ length: copies }, (_, k) => (
            <ul key={k} ref={k === 0 ? first : undefined} className="flex shrink-0 gap-3 pr-3" aria-hidden={k > 0 ? true : undefined} aria-label={k === 0 ? "Customers" : undefined}>
              {clients.map((c) => (
                <li key={c.name} aria-label={k === 0 ? c.name : undefined}>
                  {item(c)}
                </li>
              ))}
            </ul>
          ))}
        </motion.div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play logo marquee" : "Pause logo marquee"}
        aria-pressed={paused}
        className="absolute -bottom-1 right-3 flex size-7 items-center justify-center rounded-full text-[#6e6e73] outline-none hover:bg-black/[.05] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-white/10 dark:focus-visible:ring-[#0a84ff]"
      >
        <svg viewBox="0 0 16 16" className="size-3" fill="currentColor" aria-hidden>
          {paused ? <path d="M5 3.5v9l7-4.5Z" /> : <path d="M4.5 3h2.2v10H4.5ZM9.3 3h2.2v10H9.3Z" />}
        </svg>
      </button>
    </div>
  );
}

/**
 * Social proof that feels cinematic. The grid blurs each logo into view in
 * turn, then a soft spotlight follows the pointer and the logos it passes
 * resolve from grey into crisp ink. The marquees drift, ease off under the
 * pointer and can be dragged and flung.
 */
export function CinematicLogoCloud({
  clients = DEFAULT_LOGO_CLIENTS,
  variant = "grid",
  className = "",
  eyebrow = "Trusted by teams building the future of AI.",
  description,
  speed = 40,
  autoplay = false,
}: CinematicLogoCloudProps) {
  const still = useReducedMotion() === true;
  const grid = React.useRef<HTMLUListElement>(null);
  const inView = useInView(grid, { once: true, margin: "-40px" });
  // Far off-canvas when the pointer is away; each cell springs its own glow.
  const lx = useMotionValue(-1e4);
  const ly = useMotionValue(-1e4);
  const touched = React.useRef(false);

  React.useEffect(() => {
    if (!autoplay || still || variant !== "grid") return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (touched.current) return;
      const el = grid.current;
      if (el) {
        const t = (now - t0) / 1000;
        lx.set(el.clientWidth * (0.5 + 0.42 * Math.sin(t * 0.8)));
        ly.set(el.clientHeight * (0.5 + 0.4 * Math.sin(t * 1.3 + 1)));
      }
      raf = requestAnimationFrame(loop);
    };
    const start = setTimeout(() => (raf = requestAnimationFrame(loop)), 900);
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [autoplay, still, variant, lx, ly]);

  const head = (
    <div className="px-4 text-center">
      {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">{eyebrow}</p>}
      {description && <p className="mt-1.5 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>}
    </div>
  );

  if (variant !== "grid") {
    return (
      <section className={`w-full py-10 ${className}`}>
        {head}
        <div className="mt-6">
          <Marquee clients={clients} named={variant === "marquee-named"} speed={speed} still={still} />
        </div>
      </section>
    );
  }

  return (
    <section className={`@container w-full py-10 ${className}`}>
      {head}
      <ul
        ref={grid}
        aria-label="Customers"
        className="relative mx-auto mt-6 grid max-w-5xl grid-cols-2 @[440px]:grid-cols-3 @[560px]:grid-cols-4"
        onPointerMove={(e) => {
          touched.current = true;
          const r = e.currentTarget.getBoundingClientRect();
          lx.set(e.clientX - r.left);
          ly.set(e.clientY - r.top);
        }}
        onPointerLeave={() => {
          lx.set(-1e4);
          ly.set(-1e4);
        }}
      >
        {clients.map((c, i) => (
          <Cell key={c.name} c={c} i={i} lx={lx} ly={ly} inView={inView} still={still} />
        ))}
      </ul>
    </section>
  );
}
