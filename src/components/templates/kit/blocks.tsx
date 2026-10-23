"use client";
/**
 * Shared artwork and mechanics for the Kiln, Cairn and Strata templates:
 * a mountain photograph with scroll drift, a dotted world map with live pings,
 * a section pill, a snap carousel and a few small pieces.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
const landDay = "/templates/kit/assets/landscape-day.jpg";
const landDusk = "/templates/kit/assets/landscape-dusk.jpg";
const macbook = "/templates/kit/assets/macbook.webp";

/* ------------------------------------------------------------------ */
/* Mountain photograph                                                  */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export type MountainTheme = "day" | "dusk" | "night";

const PHOTO: Record<MountainTheme, { src: string; filter?: string }> = {
  day: { src: landDay },
  dusk: { src: landDusk },
  night: { src: landDusk, filter: "brightness(.55) saturate(.85)" },
};

/** Framing per seed, so the same photograph reads differently from section to section. */
const FRAMES = [
  { x: 50, y: 70, flip: false },
  { x: 38, y: 64, flip: false },
  { x: 62, y: 68, flip: true },
  { x: 46, y: 72, flip: true },
  { x: 56, y: 60, flip: false },
];

/**
 * A real mountain photograph (Annapurna range, graded for day and blue hour).
 * It drifts with scroll and breathes very slowly, so it feels alive without
 * looking animated. `focus` overrides the framing as a CSS object-position.
 */
export function Mountains({ theme = "day", className = "", style, seed = 0, parallax = true, focus }: { theme?: MountainTheme; className?: string; style?: CSSProperties; seed?: number; parallax?: boolean; focus?: string }) {
  const P = PHOTO[theme];
  const F = FRAMES[Math.abs(seed) % FRAMES.length];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, parallax ? 90 : 0]);
  return (
    <div ref={ref} className={`pointer-events-none absolute overflow-hidden ${className}`} style={style} aria-hidden="true">
      <motion.div className="absolute inset-[-6%_0]" style={{ y }}>
        <motion.img
          src={P.src}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-cover"
          style={{ objectPosition: focus ?? `${F.x}% ${F.y}%`, filter: P.filter, scaleX: F.flip ? -1 : 1 }}
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: [1.06, 1.0, 1.04], opacity: 1 }}
          transition={{ scale: { duration: 40, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }, opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scale box and laptop                                                 */
/* ------------------------------------------------------------------ */

/**
 * Lays its children out at a fixed design size (w x h) and scales them to the
 * box. By default the width drives the scale and the box takes the matching
 * height; with `contain` the box keeps its own size and the content fits inside.
 */
export function ScaleBox({ w, h, children, className = "", contain = false }: { w: number; h: number; children: ReactNode; className?: string; contain?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ s: 0, x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const s = contain ? Math.min(r.width / w, r.height / h) : r.width / w;
      setBox({ s, x: (r.width - w * s) / 2, y: contain ? (r.height - h * s) / 2 : 0 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, contain]);
  return (
    <div ref={ref} className={/\babsolute\b/.test(className) ? className : `relative ${className}`} style={contain ? undefined : { height: h * box.s }}>
      <div className="absolute left-0 top-0" style={{ width: w, height: h, transform: `translate(${box.x}px, ${box.y}px) scale(${box.s})`, transformOrigin: "0 0", visibility: box.s ? "visible" : "hidden" }}>{children}</div>
    </div>
  );
}

/** Screen opening inside the photo, in percent of the image. */
const SCREEN = { l: 11.366, t: 5.242, w: 77.432, h: 71.21 };
/** Design size of the screen content: 16:10 like the real panel. */
export const LAPTOP_SCREEN = { w: 1280, h: 798 };

/**
 * A photographed MacBook Pro with a live screen. The stock wallpaper is gone
 * from the image; whatever you pass as children is laid out at 1280 x 798 and
 * scaled into the panel, under a faint glass reflection.
 */
export function Laptop({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: "1830 / 1240", ...style }}>
      <img src={macbook} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none" />
      <div className="absolute overflow-hidden bg-black" style={{ left: `${SCREEN.l}%`, top: `${SCREEN.t}%`, width: `${SCREEN.w}%`, height: `${SCREEN.h}%`, borderRadius: "0.5% / 0.8%" }}>
        <ScaleBox w={LAPTOP_SCREEN.w} h={LAPTOP_SCREEN.h} contain className="absolute inset-0">{children}</ScaleBox>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(118deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.025) 41%, rgba(255,255,255,0) 41.3%)" }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dotted world                                                         */
/* ------------------------------------------------------------------ */

const MASK = "00000702f1ffff00000000000c00000000000100400fff8000000803fe00000000001baeb80fff00000010c7fffc780003f863f20f0bff0000e000ffffffff80c3ffffbfe387f00007fe7fdfffffffff67ffffffcf47c0e00f73ffffffffffff07ffffff018380001effffffffffffff07effffc0e0180003cfffffffffffe380081fffe0fc000022cffffffffffc0400100ffff87c0000211ffffffffff81c000003fffeff0000d1fffffffffffc18000001fffefe000017fffffffffffc00000001fffff980001ffffffffffffe00000000fffffa00001fffbffffffffa00000000fffff800000f7c3ffffffff200000000ffffe00000789c1fffffffc000000000ffffc000007437ffffffff8000000000ffff8000007083fffffffc44000000007fff8000001f087ffffffc58000000003fff0000007f00fffffffe20000000000ffe000000fffffffffffe00000000001fc0000000fffffbfffffe00000000000f81800001ffff7cfffffe00000000000380000003ffffbf8ffffc00000000000188800003ffffbf87e7c0000000000001c8200003ffff9f83c7c000000000000078000003ffffde0383c10000000000001c000003fffff80381e000000000000004300003ffffe00101e0800000000000025c0001fffffc01004000000000000001fe0001fffffc00810180000000000000ff800073fff800028400000000000000ffc00000fff800018c00000000000000ffc00001ffe000019d40000000000001ffd00001ffe00000dad0000000000001fffc0000ffc00000c10e000000000001ffff0000ffc000002007800000000000ffff00007fc000000182800000000000fffe00007fc0000000000000000000007ffc00007fc4000000320000000000007ffc0000ffc4000000f30000000000001ffc0000ff8c000001ff0010000000001ffc00007f08800003ff8000000000001ff800007f9800000fff8000000000001fe000007f0800000fffc000000000001fe000007f0000000fffc000000000001fc000003e00000007ffe000000000001f8000003c00000007dfc000000000003f800000100000000607c000000000003f0000000000000000038000000000003e0000000000000000000020000000003c000000000000000001806000000000380000000000000000000080000000007000000000000000000001800000000038000000000000000000000000000000700000000000000000000000000000002000000000000000000000000000000018000000000000000000000";
const MW = 128, MH = 58;
const LAND: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let j = 0; j < MH; j++) {
    const hex = MASK.slice(j * 32, j * 32 + 32);
    const bits = hex.split("").map((h) => parseInt(h, 16).toString(2).padStart(4, "0")).join("");
    for (let i = 0; i < MW; i++) if (bits[i] === "1") out.push([i, j]);
  }
  return out;
})();
/** lon/lat -> grid cell */
export const toCell = (lat: number, lon: number): [number, number] => [((lon + 180) / 360) * MW - 0.5, ((78 - lat) / (78 + 56)) * MH - 0.5];

export interface MapPin { lat: number; lon: number; label?: string; hot?: boolean; avatar?: string; color?: string }

/**
 * A flat dotted world. Land is a field of dots, a few light up at random, and
 * pins pulse with a ring. Pings fly from random land to the nearest pin.
 */
export function DotWorld({ pins = [], dot = "rgba(255,255,255,.22)", lit = "#3b82f6", className = "", pings = true, cell = 10 }: { pins?: MapPin[]; dot?: string; lit?: string; className?: string; pings?: boolean; cell?: number }) {
  const W = MW * cell, H = MH * cell;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(id);
  }, [inView]);
  const litSet = useMemo(() => {
    const r = rng(tick * 97 + 3);
    const s = new Set<number>();
    for (let k = 0; k < 26; k++) s.add(Math.floor(r() * LAND.length));
    return s;
  }, [tick]);
  const pinCells = pins.map((p) => toCell(p.lat, p.lon));
  const ping = useMemo(() => {
    if (!pings || !pins.length) return null;
    const r = rng(tick * 13 + 1);
    const from = LAND[Math.floor(r() * LAND.length)];
    let best = 0, bd = Infinity;
    pinCells.forEach((c, k) => { const d = (c[0] - from[0]) ** 2 + (c[1] - from[1]) ** 2; if (d < bd) { bd = d; best = k; } });
    return { from, to: pinCells[best], k: tick };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return (
    <div ref={ref} className={`relative ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        {LAND.map(([i, j], k) => (
          <circle key={k} cx={i * cell + cell / 2} cy={j * cell + cell / 2} r={cell * 0.28} fill={litSet.has(k) ? lit : dot} style={{ transition: "fill .6s" }} />
        ))}
        {ping && (
          <motion.path key={ping.k} d={`M${ping.from[0] * cell},${ping.from[1] * cell} Q${((ping.from[0] + ping.to[0]) / 2) * cell},${Math.min(ping.from[1], ping.to[1]) * cell - 60} ${ping.to[0] * cell + cell / 2},${ping.to[1] * cell + cell / 2}`} fill="none" stroke={lit} strokeWidth={cell * 0.18} strokeLinecap="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 0.9, ease: "easeOut" }} />
        )}
        {pinCells.map(([x, y], k) => (
          <g key={k} transform={`translate(${x * cell + cell / 2},${y * cell + cell / 2})`}>
            <motion.circle r={cell * 2.2} fill="none" stroke={pins[k].color ?? lit} strokeWidth={cell * 0.08} style={{ transformBox: "fill-box", transformOrigin: "center" }} animate={{ scale: [0.23, 1], opacity: [0.9, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.4, ease: "easeOut" }} />
            <circle r={cell * 0.5} fill={pins[k].color ?? lit} />
          </g>
        ))}
      </svg>
      {pins.map((p, k) => p.label || p.avatar ? (
        <div key={k} className="absolute" style={{ left: `${((pinCells[k][0] + 0.5) / MW) * 100}%`, top: `${((pinCells[k][1] + 0.5) / MH) * 100}%` }}>
          {p.avatar && <span className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-white/80" style={{ background: p.avatar }}>{p.label?.slice(0, 1)}</span>}
          {p.label && !p.avatar && <span className="absolute left-3 top-[-10px] whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">{p.label}</span>}
        </div>
      ) : null)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

/** A highlighter block that sweeps in behind a phrase. */
export function Mark({ children, color = "#0071e3", ink = "#fff", base = "#16181d", delay = 0.4 }: { children: ReactNode; color?: string; ink?: string; /** Text colour before the highlight lands (animating from "inherit" is not possible). */ base?: string; delay?: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-[0.08em]">
      <motion.span className="absolute inset-y-[0.06em] left-0 right-0 origin-left" style={{ background: color }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] }} />
      <motion.span className="relative" initial={{ color: base }} whileInView={{ color: ink }} viewport={{ once: true }} transition={{ duration: 0.2, delay: delay + 0.35 }}>{children}</motion.span>
    </span>
  );
}

const SKIN = ["#f3d2b3", "#e6b48a", "#cf9068", "#a8714d", "#7a4f35", "#f7dcc6"];
const HAIR = ["#25201d", "#4b3526", "#7b5333", "#c58d4b", "#171717", "#8d8d93", "#a2472b"];

function nameHash(name: string) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * A small illustrated portrait. Face-free, so it reads as a person without pretending to be a photo.
 * The skin, hair style and hair colour come from a hash of the name, so the same name always gets
 * the same portrait, and `hue` tints the backdrop and the shirt.
 */
export function Avatar({ name, size = 36, hue = 210, fluid = false }: { name: string; size?: number; hue?: number; /** Fill the width of the parent instead of using `size` px. */ fluid?: boolean }) {
  const h = nameHash(name);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >>> 4) % HAIR.length];
  const style = (h >>> 9) % 6;
  const shade = "rgba(0,0,0,.14)";
  const back =
    style === 1 ? <path d="M19.5 40c-2.5-15 1-27 12.5-27s15 12 12.5 27c-3 1-5-1-5.5-3H25c-.5 2-2.5 4-5.5 3z" fill={hair} /> :
    style === 2 ? <path d="M18.5 50c-3-18 1-36 13.5-36s16.5 18 13.5 36z" fill={hair} /> : null;
  const front =
    style === 0 ? <path d="M21.6 26c-.4-8 4.4-12.6 10.4-12.6S42.4 18 42 26c-1.8-4.6-5.6-6.6-10-6.6s-8.2 2-10.4 6.6z" fill={hair} /> :
    style === 1 ? <path d="M22 27c-.5-7.5 3.5-12.5 10-12.5S42.5 19.5 42 27c-1.2-5-5-7.5-10-7.5S23.2 22 22 27z" fill={hair} /> :
    style === 2 ? <path d="M22 28c-1-9 3-14 10-14s11 5 10 14c-2.5-6-6-8.5-10-8.5S24.5 22 22 28z" fill={hair} /> :
    style === 3 ? <g fill={hair}>{[[24, 20, 4.2], [29, 15.8, 4.5], [35, 15.8, 4.5], [40, 20, 4.2], [22.5, 25, 3.4], [41.5, 25, 3.4]].map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} />)}</g> :
    style === 4 ? <g fill={hair}><path d="M21.6 26c-.4-8 4.4-12.6 10.4-12.6S42.4 18 42 26c-1.8-4.6-5.6-6.6-10-6.6s-8.2 2-10.4 6.6z" /><circle cx="32" cy="12.5" r="4.6" /></g> :
    <g fill={hair}><path d="M22.2 25c0-6.5 4-10 9.8-10s9.8 3.5 9.8 10c-2-3.2-5.8-4.5-9.8-4.5s-7.8 1.3-9.8 4.5z" /><path d="M22.4 28.5c.8 7.5 4.6 11 9.6 11s8.8-3.5 9.6-11c-1.2 3-4.2 4.2-9.6 4.2s-8.4-1.2-9.6-4.2z" opacity=".92" /></g>;
  return (
    <span className="inline-flex flex-none overflow-hidden rounded-full" style={{ width: fluid ? "100%" : size, height: fluid ? undefined : size, aspectRatio: "1 / 1", background: `hsl(${hue} 70% 90%)` }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width="100%" height="100%" focusable="false">
        {back}
        <path d="M8 66c0-13 10-21.5 24-21.5S56 53 56 66z" fill={`hsl(${hue} 52% 46%)`} />
        <path d="M27.5 36h9v9.5c-2.2 1.8-6.8 1.8-9 0z" fill={skin} />
        <path d="M27.5 41.5c2.6 1.6 6.4 1.6 9 0v-3.5h-9z" fill={shade} />
        <ellipse cx="32" cy="27" rx="9.6" ry="10.6" fill={skin} />
        {front}
      </svg>
    </span>
  );
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Each invented brand has its own glyph and its own type treatment, so a wall of them does not read as one template. */
const MARKS: Record<string, { glyph: ReactNode; type: string }> = {
  Quillbase: { glyph: <path d="M15 3C8 4 4.5 8 3.8 15c3-5 6-7.5 11.2-12z" fill="currentColor" />, type: "font-semibold tracking-[-0.03em]" },
  Orbitly: { glyph: <><circle cx="9" cy="9" r="2.6" fill="currentColor" /><ellipse cx="9" cy="9" rx="7.5" ry="3.2" {...STROKE} strokeWidth={1.6} transform="rotate(-30 9 9)" /></>, type: "font-medium tracking-[-0.01em]" },
  Fernhouse: { glyph: <><path d="M2.5 9 9 3l6.5 6v6.5h-13z" {...STROKE} /><path d="M9 15.5V9.5" {...STROKE} strokeWidth={1.6} /></>, type: "font-serif text-[1.06em]" },
  Copperline: { glyph: <path d="M3 15.5 11.5 2.5M7.5 15.5 16 2.5" {...STROKE} strokeWidth={2.2} />, type: "font-bold tracking-[-0.04em]" },
  Mosswell: { glyph: <><circle cx="9" cy="9" r="6.8" {...STROKE} /><circle cx="9" cy="9" r="2.8" fill="currentColor" /></>, type: "font-light tracking-[0.02em]" },
  Brightpath: { glyph: <><path d="M2 15c4 0 3-8 7-8s3 8 7 8" {...STROKE} strokeWidth={2.2} /><circle cx="9" cy="2.8" r="1.5" fill="currentColor" /></>, type: "font-semibold tracking-[-0.04em]" },
  Tidewater: { glyph: <path d="M2 7c2-2 4-2 6 0s4 2 6 0M2 12c2-2 4-2 6 0s4 2 6 0" {...STROKE} strokeWidth={2.2} />, type: "font-medium tracking-[-0.01em]" },
  Parcelkit: { glyph: <><path d="M9 2l6.5 3.5v7L9 16l-6.5-3.5v-7z" {...STROKE} strokeWidth={1.8} /><path d="M9 9v7M9 9l6.5-3.5M9 9 2.5 5.5" {...STROKE} strokeWidth={1.3} /></>, type: "text-[0.8em] font-semibold uppercase tracking-[0.2em]" },
  Juniper: { glyph: <g fill="currentColor"><circle cx="6" cy="11" r="3.2" /><circle cx="12" cy="11" r="3.2" opacity=".6" /><circle cx="9" cy="5.5" r="3.2" opacity=".85" /></g>, type: "font-serif text-[1.06em] italic" },
  Arcadia: { glyph: <path d="M3 16V9a6 6 0 0112 0v7" {...STROKE} strokeWidth={2.4} />, type: "font-light tracking-[0.05em]" },
  Keystone: { glyph: <path d="M5 3h8l2.5 12h-13z" fill="currentColor" />, type: "text-[0.86em] font-black uppercase tracking-[0.08em]" },
  Lumenly: { glyph: <><circle cx="9" cy="9" r="6.8" {...STROKE} /><path d="M9 2.2a6.8 6.8 0 010 13.6z" fill="currentColor" /></>, type: "font-semibold tracking-[-0.02em]" },
  Driftwood: { glyph: <><path d="M2 10.5c3-6 6-6 8-2s4 3 6-2" {...STROKE} strokeWidth={2.2} /><path d="M2 15h14" {...STROKE} strokeWidth={1.6} /></>, type: "font-mono text-[0.9em] tracking-[-0.04em]" },
  Sable: { glyph: <path d="M9 2l6.5 7L9 16 2.5 9z" fill="currentColor" />, type: "font-serif text-[1.06em]" },
  Halcyon: { glyph: <><path d="M9 2a7 7 0 017 7H9z" fill="currentColor" /><path d="M9 16a7 7 0 01-7-7h7z" fill="currentColor" opacity=".5" /></>, type: "font-light tracking-[0.02em]" },
};
const FALLBACK_GLYPHS: ReactNode[] = [
  <circle key="c" cx="9" cy="9" r="7" {...STROKE} strokeWidth={2.4} />,
  <path key="t" d="M9 2l7 13H2z" fill="currentColor" />,
  <rect key="r" x="2.5" y="2.5" width="13" height="13" rx="4" {...STROKE} strokeWidth={2.4} />,
];

/** Just the glyph of an invented brand, for compact logo chips. */
export function BrandGlyph({ name, size = 18 }: { name: string; size?: number }) {
  const mark = MARKS[name];
  return <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true" className="flex-none">{mark ? mark.glyph : FALLBACK_GLYPHS[0]}</svg>;
}

/** Invented wordmarks for logo walls. */
export function Wordmark({ name, glyph = 0, className = "" }: { name: string; glyph?: number; className?: string }) {
  const mark = MARKS[name];
  const g = mark ? mark.glyph : FALLBACK_GLYPHS[glyph % FALLBACK_GLYPHS.length];
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[17px] leading-none ${mark?.type ?? "font-semibold tracking-[-0.02em]"} ${className}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-none">{g}</svg>{name}
    </span>
  );
}

/** Horizontal snap carousel with dots; autoplays until touched. */
export function SnapCarousel({ children, itemWidth = 420, dark = false, label }: { children: ReactNode[]; itemWidth?: number; dark?: boolean; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const touched = useRef(false);
  const inView = useInView(track, { amount: 0.4 });
  const go = (k: number) => {
    const el = track.current;
    if (!el) return;
    const n = children.length;
    const next = (k + n) % n;
    el.scrollTo({ left: next * (itemWidth + 20), behavior: "smooth" });
  };
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => { if (!touched.current) go(i + 1); }, 3800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, inView]);
  return (
    <div>
      <div ref={track} role="region" aria-label={label} tabIndex={0} onPointerDown={() => (touched.current = true)} onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / (itemWidth + 20)))}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children.map((c, k) => (
          <motion.div key={k} className="snap-start" style={{ flex: `0 0 min(${itemWidth}px, 84vw)` }} animate={{ opacity: Math.abs(k - i) > 2 ? 0.5 : 1 }}>{c}</motion.div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-2 ${dark ? "bg-white/10" : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06)]"}`}>
          {children.map((_, k) => (
            <button key={k} type="button" aria-label={`Go to slide ${k + 1}`} onClick={() => { touched.current = true; go(k); }} className="relative h-2 rounded-full outline-none focus-visible:ring-2" style={{ width: k === i ? 22 : 8, background: k === i ? (dark ? "#fff" : "#1d1d1f") : dark ? "rgba(255,255,255,.3)" : "#d2d2d7", transition: "width .35s cubic-bezier(.16,1,.3,1), background .3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Rolls a number up when it scrolls into view. */
export function CountUp({ to, suffix = "", prefix = "", className = "", decimals = 0 }: { to: number; suffix?: string; prefix?: string; className?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to, mv]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

/** Floating pill that names the section you're in, with a page progress ring. */
export function SectionPill({ brand, sections, accent = "#0071e3" }: { brand: string; sections: { id: string; label: string }[]; accent?: string }) {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const dash = useTransform(p, (v) => `${v * 50.3} 50.3`);
  const [cur, setCur] = useState(sections[0]?.label ?? "");
  useEffect(() => {
    const on = () => {
      let best = sections[0]?.label ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) best = s.label;
      }
      setCur(best);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [sections]);
  return (
    <motion.div className="fixed bottom-20 left-1/2 z-40 flex h-11 items-center gap-3 rounded-full bg-[#1d1d1f]/90 pl-4 pr-3 text-[13px] font-medium text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,.5)] backdrop-blur-xl" style={{ x: "-50%" }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: 1 }} aria-live="polite">
      <span className="font-semibold">{brand}</span>
      <span className="h-4 w-px bg-white/20" />
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2.4" /><motion.circle cx="10" cy="10" r="8" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" style={{ strokeDasharray: dash }} transform="rotate(-90 10 10)" /></svg>
      <span className="relative h-5 w-[110px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={cur} className="absolute inset-0 truncate" initial={{ y: 18, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -18, opacity: 0, filter: "blur(4px)" }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>{cur}</motion.span>
        </AnimatePresence>
      </span>
    </motion.div>
  );
}

/** Tiny line icon set used across the three templates. */
export function Icon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const d: Record<string, string> = {
    bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
    chat: "M4 5h16v10H9l-5 4z",
    globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    code: "M8 8l-4 4 4 4M16 8l4 4-4 4",
    spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
    check: "M5 12.5l4.5 4.5L19 7.5",
    shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
    route: "M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM8 17h6a4 4 0 000-8h-2a4 4 0 010-8",
    pulse: "M3 12h4l3-7 4 14 3-7h4",
    phone: "M7 3h10v18H7zM11 18h2",
    moon: "M20 14a8 8 0 01-10-10 8 8 0 1010 10z",
    stack: "M4 7h16M4 12h16M4 17h16",
    refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
    users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M17 11a3 3 0 100-6M22 21a5 5 0 00-5-5",
    clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
    arrow: "M5 12h14M13 6l6 6-6 6",
    plus: "M12 5v14M5 12h14",
    search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
    cpu: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
    star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d={d[name] ?? d.spark} /></svg>;
}
