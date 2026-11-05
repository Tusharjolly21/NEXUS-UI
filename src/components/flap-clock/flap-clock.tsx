"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type FlapCity = {
  /** shown on the flaps, e.g. "New York" */
  name: string;
  /** an IANA time zone, e.g. "America/New_York" */
  timeZone: string;
  /** who's there, e.g. "Maya" */
  label?: string;
  /** a short code used when the name doesn't fit, e.g. "NYC" */
  short?: string;
};
export type FlapClockProps = {
  cities?: FlapCity[];
  /** 12-hour clock with am/pm; 24-hour by default */
  hour12?: boolean;
  /** local working hours, start and end (24h); 9 to 17 by default */
  workHours?: [number, number];
  title?: string;
  /** called as the visitor plans a time: the moment they're looking at and its distance from now in minutes */
  onScrub?: (time: Date, offsetMinutes: number) => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor Icons (MIT) via Iconify, inlined
const ICON = {
  now: { vb: 256, body: "<path fill=\"currentColor\" d=\"M140 80v41.21l34.17 20.5a12 12 0 1 1-12.34 20.58l-40-24A12 12 0 0 1 116 128V80a12 12 0 0 1 24 0m-12-52a99.38 99.38 0 0 0-70.76 29.34c-4.69 4.74-9 9.37-13.24 14V64a12 12 0 0 0-24 0v40a12 12 0 0 0 12 12h40a12 12 0 0 0 0-24H57.77c5.23-6 10.6-11.78 16.49-17.74a76 76 0 1 1 1.58 109a12 12 0 0 0-16.48 17.46A100 100 0 1 0 128 28\"/>" },
  globe: { vb: 256, body: "<path fill=\"currentColor\" d=\"M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m84 108a83.6 83.6 0 0 1-4.47 27L167 130a19.65 19.65 0 0 0-7.8-2.78l-22.82-3.08a20.14 20.14 0 0 0-18.66 7.86h-4.07l-2.71-5.6a19.88 19.88 0 0 0-13.8-10.84l-2.68-.56l4-7h14.39a20 20 0 0 0 9.66-2.49l12.25-6.76a20.6 20.6 0 0 0 3.74-2.68l26.92-24.33A20 20 0 0 0 172 56.49A84 84 0 0 1 212 128m-71.24-83l6.2 11.1L122.75 78l-10.93 6H96.14a20.05 20.05 0 0 0-17.36 10.06l-4.49 7.85l-6.61-17.63l9.91-23.42A83.9 83.9 0 0 1 140.76 45M44 128a83.5 83.5 0 0 1 4.4-26.77l7.74 20.65a19.89 19.89 0 0 0 14.52 12.53l19.53 4.2l3 6.1a20.11 20.11 0 0 0 13.55 10.77l-5 11.12a20 20 0 0 0 3.58 21.71l.21.22l18.16 18.7l-.89 4.59A84.09 84.09 0 0 1 44 128m103.65 81.66a20.11 20.11 0 0 0-5-17.3l-.21-.22l-17.72-18.25l11.37-25.52l19 2.56l41.43 25.48a84.2 84.2 0 0 1-48.87 33.25\"/>" },
  users: { vb: 256, body: "<path fill=\"currentColor\" d=\"M164.38 181.1a52 52 0 1 0-72.76 0a75.9 75.9 0 0 0-30 28.89a12 12 0 0 0 20.78 12a53 53 0 0 1 91.22 0a12 12 0 1 0 20.78-12a75.9 75.9 0 0 0-30.02-28.89M100 144a28 28 0 1 1 28 28a28 28 0 0 1-28-28m147.21 9.59a12 12 0 0 1-16.81-2.39c-8.33-11.09-19.85-19.59-29.33-21.64a12 12 0 0 1-1.82-22.91a20 20 0 1 0-24.78-28.3a12 12 0 1 1-21-11.6a44 44 0 1 1 73.28 48.35a92.2 92.2 0 0 1 22.85 21.69a12 12 0 0 1-2.39 16.8m-192.28-24c-9.48 2.05-21 10.55-29.33 21.65a12 12 0 0 1-19.19-14.45a92.4 92.4 0 0 1 22.85-21.69a44 44 0 1 1 73.28-48.35a12 12 0 1 1-21 11.6a20 20 0 1 0-24.78 28.3a12 12 0 0 1-1.82 22.91Z\"/>" },
} as const;

const CITIES: FlapCity[] = [
  { name: "San Francisco", short: "SFO", timeZone: "America/Los_Angeles", label: "Noah" },
  { name: "New York", short: "NYC", timeZone: "America/New_York", label: "Maya" },
  { name: "London", short: "LDN", timeZone: "Europe/London", label: "Sam" },
  { name: "Bengaluru", short: "BLR", timeZone: "Asia/Kolkata", label: "Priya" },
  { name: "Tokyo", short: "TYO", timeZone: "Asia/Tokyo", label: "Ken" },
];

/** every row's flaps get their own enamel colour */
type Tint = { top: string; bot: string; ink: string; band: string };
const TINTS: Tint[] = [
  { top: "#e8452f", bot: "#c9301f", ink: "#fff4e4", band: "#ff7a63" }, // tomato
  { top: "#ffc23d", bot: "#f0a312", ink: "#2b1700", band: "#ffc23d" }, // saffron
  { top: "#13a38e", bot: "#0b8070", ink: "#effffb", band: "#2fd3bd" }, // teal
  { top: "#4766ff", bot: "#2b44dc", ink: "#f3f5ff", band: "#7b90ff" }, // cobalt
  { top: "#a24ff0", bot: "#7d2ed2", ink: "#fbf3ff", band: "#c387ff" }, // plum
  { top: "#ff5ea2", bot: "#df3a83", ink: "#fff2f8", band: "#ff8cbf" }, // pink
];

type Status = "Asleep" | "Morning" | "Working" | "Evening" | "Night";
const STATUS: Record<Status, { dot: string; text: string; bg: string }> = {
  Asleep: { dot: "#8b93ff", text: "#d4d7ff", bg: "rgba(139,147,255,.16)" },
  Morning: { dot: "#ffc46b", text: "#ffe2b8", bg: "rgba(255,196,107,.16)" },
  Working: { dot: "#3ee08f", text: "#c4f7da", bg: "rgba(62,224,143,.16)" },
  Evening: { dot: "#ff8a5b", text: "#ffd3c0", bg: "rgba(255,138,91,.16)" },
  Night: { dot: "#c08bff", text: "#e8d6ff", bg: "rgba(192,139,255,.16)" },
};

// the order the characters sit on each drum, like a real split-flap unit
const DIGITS = " 0123456789";
const LETTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-'&";
const DAY = 1440;
const STOP = Symbol("stop");

const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FMT = new Map<string, Intl.DateTimeFormat>();
function fmtFor(tz: string) {
  let f = FMT.get(tz);
  if (!f) {
    const opts: Intl.DateTimeFormatOptions = { hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", weekday: "short" };
    try {
      f = new Intl.DateTimeFormat("en-US", { ...opts, timeZone: tz });
    } catch {
      f = new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" });
    }
    FMT.set(tz, f);
  }
  return f;
}
/** the wall clock in a zone at a moment */
type Wall = { h: number; m: number; wd: string; mins: number };
function wall(tz: string, t: number): Wall {
  const p = fmtFor(tz).formatToParts(t);
  const g = (k: string) => p.find((x) => x.type === k)?.value ?? "0";
  const h = +g("hour") % 24;
  const m = +g("minute");
  return { h, m, wd: g("weekday"), mins: Date.UTC(+g("year"), +g("month") - 1, +g("day"), h, m) / 60000 };
}
function statusOf(hf: number, [ws, we]: [number, number]): Status {
  if (hf < 6) return "Asleep";
  if (hf < ws) return "Morning";
  if (hf < we) return "Working";
  if (hf < 21) return "Evening";
  return "Night";
}
const clockText = (w: Wall, h12: boolean) => (h12 ? `${w.h % 12 || 12}:${pad2(w.m)} ${w.h < 12 ? "am" : "pm"}` : `${pad2(w.h)}:${pad2(w.m)}`);
const relText = (d: number) => {
  if (d === 0) return "same as you";
  const a = Math.abs(d);
  return `${d > 0 ? "+" : "−"}${Math.floor(a / 60)}h${a % 60 ? ` ${a % 60}m` : ""}`;
};
const spanText = (d: number) => {
  const a = Math.abs(Math.round(d));
  const s = `${Math.floor(a / 60) ? `${Math.floor(a / 60)}h ` : ""}${a % 60 ? `${a % 60}m` : ""}`.trim() || "0m";
  return d > 0 ? `in ${s}` : `${s} ago`;
};

// the sky over a day, by local hour
const SKY: [number, string][] = [
  [0, "#10154a"],
  [4.5, "#1d2163"],
  [6, "#d9628f"],
  [7.3, "#ffb38a"],
  [9, "#72c8ff"],
  [13, "#4aa3ff"],
  [16.6, "#ffbf5a"],
  [18.4, "#ff6b55"],
  [19.6, "#7a3f9e"],
  [21, "#1d1f5c"],
  [24, "#10154a"],
];
function skyAt(h: number) {
  const x = ((h % 24) + 24) % 24;
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= x) i++;
  const [h0, c0] = SKY[i];
  const [h1, c1] = SKY[i + 1];
  const t = (x - h0) / (h1 - h0);
  const a = [1, 3, 5].map((k) => parseInt(c0.slice(k, k + 2), 16));
  const b = [1, 3, 5].map((k) => parseInt(c1.slice(k, k + 2), 16));
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
}

/** step forward round the drum towards the target: big jumps first, then one flap at a time, like a real unit catching up */
function stepToward(drum: string, from: string, to: string) {
  const n = drum.length;
  const i = Math.max(0, drum.indexOf(from));
  const j = drum.indexOf(to);
  if (j < 0) return to;
  const d = (j - i + n) % n;
  if (d === 0) return to;
  return drum[(i + Math.max(1, Math.ceil(d / 4))) % n];
}

/** half a character card: the top or bottom half of the glyph, sitting at `at` px inside its parent */
function Half({ c, part, at, w, h, fs, tint }: { c: string; part: "top" | "bot"; at: number; w: number; h: number; fs: number; tint: Tint }) {
  const half = h / 2;
  const r = Math.max(3, Math.round(w * 0.16));
  return (
    <div
      className="absolute left-0 overflow-hidden"
      style={{
        top: at,
        width: w,
        height: half,
        borderRadius: part === "top" ? `${r}px ${r}px 0 0` : `0 0 ${r}px ${r}px`,
        background: part === "top" ? `linear-gradient(180deg, ${tint.top}, ${tint.top} 55%, ${tint.bot})` : `linear-gradient(180deg, ${tint.bot}, ${tint.bot} 60%, ${tint.top} 100%)`,
      }}
    >
      <span className="absolute left-0 grid place-items-center font-bold leading-none" style={{ top: part === "top" ? 0 : -half, width: w, height: h, fontSize: fs, color: tint.ink, letterSpacing: "-0.02em" }}>
        {c === " " ? "" : c}
      </span>
      {part === "top" && <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 70%)" }} />}
    </div>
  );
}

type FlapProps = { ch: string; drum: string; tint: Tint; w: number; h: number; fs: number; delay: number; reduced: boolean };

/**
 * One split-flap unit. When its character changes it flips the top leaf down round the drum, a card at a time,
 * until it lands on the new one with a little bounce.
 */
const Flap = memo(function Flap({ ch, drum, tint, w, h, fs, delay, reduced }: FlapProps) {
  const [cur, setCur] = useState(ch);
  const [flip, setFlip] = useState<{ from: string; to: string; k: number; last: boolean } | null>(null);
  const target = useRef(ch);
  target.current = ch;
  const curRef = useRef(ch);
  const busy = useRef(false);
  const seq = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const advance = useCallback(() => {
    if (!alive.current) return;
    const from = curRef.current;
    const to = target.current;
    if (from === to) {
      busy.current = false;
      return;
    }
    const next = reduced ? to : stepToward(drum, from, to);
    seq.current += 1;
    setFlip({ from, to: next, k: seq.current, last: next === to });
  }, [drum, reduced]);

  useEffect(() => {
    if (busy.current || curRef.current === ch) return;
    busy.current = true;
    window.setTimeout(advance, delay);
  }, [ch, delay, advance]);

  const landed = () => {
    if (!flip) return;
    curRef.current = flip.to;
    setCur(flip.to);
    setFlip(null);
    advance();
  };

  const half = h / 2;
  const r = Math.max(3, Math.round(w * 0.16));
  const bounce = !!flip?.last && !reduced;
  const dur = reduced ? 0.14 : bounce ? 0.26 : 0.075;
  const pin = Math.max(3, Math.round(h * 0.12));
  return (
    <div className="relative shrink-0" style={{ width: w, height: h, perspective: h * 5, borderRadius: r, boxShadow: "0 2px 0 rgba(0,0,0,.4), 0 6px 10px -6px rgba(0,0,0,.7)" }}>
      {/* the next card's top waits behind the leaf; the current card's bottom stays until the leaf covers it */}
      <Half c={flip ? flip.to : cur} part="top" at={0} w={w} h={h} fs={fs} tint={tint} />
      <Half c={cur} part="bot" at={half} w={w} h={h} fs={fs} tint={tint} />
      {flip && (
        <motion.span
          key={`s${flip.k}`}
          className="pointer-events-none absolute left-0 bg-black"
          style={{ top: half, width: w, height: half, borderRadius: `0 0 ${r}px ${r}px` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.32, 0] }}
          transition={{ duration: dur, times: [0, 0.5, 1] }}
        />
      )}
      {flip && (
        <motion.div
          key={flip.k}
          className="absolute left-0 top-0 [transform-style:preserve-3d]"
          style={{ width: w, height: half, transformOrigin: "50% 100%", zIndex: 3 }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: bounce ? [0, -180, -163, -180] : -180 }}
          transition={bounce ? { duration: dur, times: [0, 0.58, 0.8, 1], ease: ["easeIn", "easeOut", "easeIn"] } : { duration: dur, ease: "easeIn" }}
          onAnimationComplete={landed}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Half c={flip.from} part="top" at={0} w={w} h={h} fs={fs} tint={tint} />
            <motion.span className="absolute inset-0 bg-black" style={{ borderRadius: `${r}px ${r}px 0 0` }} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ duration: dur * (bounce ? 0.58 : 1), ease: "easeIn" }} />
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateX(180deg)" }}>
            <Half c={flip.to} part="bot" at={0} w={w} h={h} fs={fs} tint={tint} />
            <motion.span className="absolute inset-0 bg-black" style={{ borderRadius: `0 0 ${r}px ${r}px` }} initial={{ opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: dur, ease: "easeOut" }} />
          </div>
        </motion.div>
      )}
      {/* the hinge: a dark gap with the axle pins at either side */}
      <span className="pointer-events-none absolute left-0 z-[4]" style={{ top: half - 0.5, width: w, height: 1, background: "rgba(0,0,0,.4)" }} />
      <span className="pointer-events-none absolute z-[4] rounded-[1px] bg-[#05071c]" style={{ top: half - pin / 2, left: -1, width: Math.max(1.5, w * 0.07), height: pin }} />
      <span className="pointer-events-none absolute z-[4] rounded-[1px] bg-[#05071c]" style={{ top: half - pin / 2, right: -1, width: Math.max(1.5, w * 0.07), height: pin }} />
    </div>
  );
});

/** sizes for the flaps from the board's width */
function layoutFor(W: number) {
  if (W >= 860) return { mode: "wide" as const, tw: 30, th: 44, fs: 26, gap: 3, pad: 22 };
  if (W >= 600) return { mode: "mid" as const, tw: 26, th: 38, fs: 22, gap: 3, pad: 18 };
  const tw = W < 280 ? 16 : W < 330 ? 18 : W < 420 ? 20 : 23;
  return { mode: "narrow" as const, tw, th: Math.round(tw * 1.45), fs: Math.round(tw * 0.84), gap: 2, pad: 12 };
}

/**
 * A team world clock on a split-flap board. Every row is a city: its local time and name on enamel flaps in the
 * row's own colour, and whether they're asleep, starting their morning, working or done for the day. When a
 * minute turns, the flaps clatter round to the new time. Drag the handle along the sky strip underneath to look
 * up to twelve hours either way ("what time is it for everyone if we meet at four?"): the whole board flips as
 * you go, and the count at the top says how many people would be working. Now snaps it back to the live time.
 * Keyboard: the handle is a slider; arrows move by a quarter hour, Page Up and Page Down by an hour, Home
 * returns to now.
 */
export function FlapClock({ cities = CITIES, hour12 = false, workHours = [9, 17], title = "Team clock", onScrub, autoplay = false, className = "" }: FlapClockProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const armed = reduced || seen;

  const [W, setW] = useState(900);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(() => setW(Math.round(el.getBoundingClientRect().width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = layoutFor(W);

  // the live clock, refreshed when the minute turns
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow((p) => (Math.floor(p / 60000) === Math.floor(t / 60000) ? p : t));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // the planned moment, in minutes from now
  const scrub = useMotionValue(0);
  const [offset, setOffset] = useState(0);
  useEffect(() => scrub.on("change", (m) => setOffset(Math.round(m))), [scrub]);
  const [dragging, setDragging] = useState(false);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const live = Math.abs(offset) < 1;
  const T = live ? now : Math.round((now + offset * 60000) / 300000) * 300000;

  // a slow clatter on arrival, quick ripples after that
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setIntro(false), 2600);
    return () => window.clearTimeout(id);
  }, [armed]);

  const zone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);
  const me = wall(zone, T);
  const rows = cities.map((c, i) => {
    const w = wall(c.timeZone, T);
    return { c, w, status: statusOf(w.h + w.m / 60, workHours), diff: w.mins - me.mins, tint: TINTS[i % TINTS.length] };
  });
  const working = rows.filter((r) => r.status === "Working").length;

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onScrub?.(new Date(T), live ? 0 : Math.round((T - now) / 60000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T]);

  // how many name flaps fit on a row
  const colonW = Math.round(L.tw * 0.42);
  const timeW = 4 * L.tw + 2 * L.gap + colonW + (hour12 ? Math.round(L.tw * 0.9) : 0);
  const sep = Math.round(L.tw * 0.55);
  const inner = W - L.pad * 2 - (L.mode === "narrow" ? 16 : 28);
  const side = L.mode === "wide" ? 168 + 16 + 24 * 9 + 23 + 16 : L.mode === "mid" ? 150 + 16 : 0;
  const longest = Math.max(3, ...cities.map((c) => c.name.length));
  const nameN = clamp(Math.floor((inner - timeW - sep - side + L.gap) / (L.tw + L.gap)), 3, Math.min(14, longest));
  const nameFor = (c: FlapCity) => {
    const clean = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toUpperCase()
        .split("")
        .map((ch) => (LETTERS.includes(ch) ? ch : " "))
        .join("");
    const full = clean(c.name);
    if (full.length <= nameN) return full;
    if (c.short && c.short.length <= nameN) return clean(c.short);
    return full.slice(0, nameN);
  };

  // ─── the sky strip: twelve hours back to twelve ahead, in the visitor's own time ───
  const sky = useMemo(() => {
    const start = now - (DAY / 2) * 60000;
    const stops: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const w = wall(zone, start + i * 3600000);
      stops.push(`${skyAt(w.h + w.m / 60)} ${((i / 24) * 100).toFixed(2)}%`);
    }
    const s0 = wall(zone, start);
    const firstMin = s0.m === 0 ? 0 : 60 - s0.m;
    const ticks: { p: number; h: number }[] = [];
    for (let k = 0; firstMin + 60 * k < DAY; k++) ticks.push({ p: (firstMin + 60 * k) / DAY, h: (s0.h + (s0.m === 0 ? 0 : 1) + k) % 24 });
    return { bg: `linear-gradient(90deg, ${stops.join(", ")})`, ticks };
  }, [now, zone]);
  const every = L.mode === "narrow" ? 6 : 3;
  const hourLabel = (h: number) => (hour12 ? `${h % 12 || 12}${h < 12 ? "am" : "pm"}` : `${pad2(h)}:00`);

  const handleLeft = useTransform(scrub, (m) => `${(m / DAY + 0.5) * 100}%`);
  const bubbleX = useTransform(scrub, (m) => {
    const f = m / DAY + 0.5;
    return `${-50 + (f < 0.12 ? (0.12 - f) * 380 : f > 0.88 ? -(f - 0.88) * 380 : 0)}%`;
  });

  const stopAnim = () => {
    anim.current?.stop();
    anim.current = null;
  };
  const glide = useCallback(
    (m: number) => {
      anim.current?.stop();
      anim.current = animate(scrub, clamp(m, -DAY / 2, DAY / 2), reduced ? { duration: 0.15 } : { type: "spring", stiffness: 170, damping: 24 });
    },
    [scrub, reduced],
  );
  const goNow = useCallback(() => glide(0), [glide]);

  const fromX = (clientX: number) => {
    const r = stripRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return (clamp((clientX - r.left) / r.width, 0, 1) - 0.5) * DAY;
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    glide(fromX(e.clientX));
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    stopAnim();
    scrub.set(fromX(e.clientX));
  };
  const onUp = () => setDragging(false);

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const q = 15 * 60000;
    const off = (t: number) => (t - now) / 60000;
    let m: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") m = off((Math.floor(T / q) + 1) * q);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") m = off((Math.ceil(T / q) - 1) * q);
    else if (e.key === "PageUp") m = scrub.get() + 60;
    else if (e.key === "PageDown") m = scrub.get() - 60;
    else if (e.key === "Home") m = 0;
    else if (e.key === "End") m = DAY / 2;
    if (m === null) return;
    e.preventDefault();
    glide(m);
  };

  // ─── autoplay: plan a meeting eight hours out, nudge it back, then return to now ───
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
    let unsub: (() => void) | null = null;
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      unsub?.();
      setDragging(false);
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
    const at = (m: number) => {
      const s = stripRef.current?.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      if (!s) return { x: 0, y: 0 };
      return { x: s.left - b.left + (m / DAY + 0.5) * s.width, y: s.top - b.top + s.height / 2 };
    };
    const tap = async (sel: string, act: () => void, d = 0.45) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      await Promise.all([run(gx, r.left - b.left + r.width / 2, d), run(gy, r.top - b.top + r.height / 2, d)]);
      await run(gs, 0.8, 0.08);
      act();
      await run(gs, 1, 0.12);
    };
    (async () => {
      await wait(2400);
      while (alive) {
        stopAnim();
        const p = at(scrub.get());
        gx.set(p.x + 36);
        gy.set(p.y + 56);
        await run(go, 1, 0.25);
        await Promise.all([run(gx, p.x, 0.45), run(gy, p.y, 0.45)]);
        await run(gs, 0.8, 0.1);
        setDragging(true);
        unsub = scrub.on("change", (m) => gx.set(at(m).x));
        await run(scrub, 480, 2.8);
        await wait(1100);
        await run(scrub, 300, 1.3);
        unsub();
        unsub = null;
        setDragging(false);
        await run(gs, 1, 0.12);
        await wait(1800);
        await tap("[data-now]", goNow);
        await run(go, 0, 0.3);
        await wait(3600);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const narrow = L.mode === "narrow";
  const rivet = "radial-gradient(circle at 35% 30%, #c9d0ff, #5a63a8 55%, #1a1f52)";

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[1100px] select-none overflow-hidden rounded-[28px] text-[#fff6e6] ${className}`}
      style={{
        padding: L.pad,
        background: "radial-gradient(120% 90% at 50% -25%, #2c3596 0%, #161b52 45%, #0d1136 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 -2px 0 rgba(0,0,0,.4), 0 30px 60px -30px rgba(22,27,82,.75)",
      }}
    >
      {[
        [8, 8],
        [8, -8],
        [-8, 8],
        [-8, -8],
      ].map(([y, x], k) => (
        <span key={k} aria-hidden="true" className="absolute h-[7px] w-[7px] rounded-full" style={{ [y > 0 ? "top" : "bottom"]: Math.abs(y), [x > 0 ? "left" : "right"]: Math.abs(x), background: rivet }} />
      ))}

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(255,61,139,.8)]" style={{ background: "linear-gradient(140deg, #ff7a3d, #ff3d8b 55%, #7a5cff)" }}>
            {ic("globe", 18)}
          </span>
          <div className="min-w-0">
            <h3 className="m-0 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[#fff6e6]">{title}</h3>
            <p className="m-0 text-[12.5px] leading-snug text-[#aab0e6]">Where everyone is in their day.</p>
          </div>
        </div>
        <p aria-live="polite" className="m-0 flex items-center gap-2 rounded-full bg-[#3ee08f]/[.14] py-1 pl-2 pr-3 text-[12.5px] font-medium text-[#c4f7da]">
          <span className="text-[#3ee08f]">{ic("users", 15)}</span>
          <span className="tabular-nums">
            {working} of {cities.length} working
          </span>
        </p>
      </div>

      {/* the board */}
      <ol className="m-0 mt-4 list-none rounded-[18px] bg-[#080b26] p-0 shadow-[inset_0_2px_12px_rgba(0,0,0,.65),0_1px_0_rgba(255,255,255,.08)]" style={{ padding: narrow ? "4px 8px" : "6px 14px" }}>
        {rows.map((r, i) => {
          const h12 = r.w.h % 12 || 12;
          const hh = hour12 ? (h12 < 10 ? ` ${h12}` : String(h12)) : pad2(r.w.h);
          const time = armed ? `${hh}${pad2(r.w.m)}` : "    ";
          const name = armed ? nameFor(r.c).padEnd(nameN, " ") : " ".repeat(nameN);
          const del = (col: number) => (intro ? 250 + i * 110 + col * 34 : i * 22 + col * 16);
          const st = STATUS[r.status];
          const fh = r.w.h + r.w.m / 60;
          const meta = (
            <div className={`flex min-w-0 ${narrow ? "flex-wrap items-center gap-x-2 gap-y-1" : "flex-col items-start gap-1"}`}>
              <span className="relative inline-flex h-[24px] shrink-0 items-center overflow-hidden rounded-full pl-2 pr-2.5 text-[12px] font-medium" style={{ background: st.bg, color: st.text }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={r.status} className="flex items-center gap-1.5" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: st.dot, boxShadow: `0 0 8px ${st.dot}` }} />
                    {r.status}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className={`flex min-w-0 max-w-full items-baseline gap-2 whitespace-nowrap text-[12px] text-[#aab0e6] ${narrow ? "" : "pl-1"}`}>
                {r.c.label && <span className="font-medium text-[#fff6e6]">{r.c.label}</span>}
                <span>{r.w.wd}</span>
                <span className="whitespace-nowrap tabular-nums">{relText(r.diff)}</span>
              </span>
            </div>
          );
          return (
            <li key={`${r.c.timeZone}-${r.c.name}`} className={`${i ? "border-t border-white/[.06]" : ""} ${narrow ? "py-2" : "flex items-center gap-4 py-2.5"}`}>
              <span className="sr-only">
                {r.c.name}
                {r.c.label ? `, ${r.c.label}` : ""}: {clockText(r.w, hour12)} {r.w.wd}, {r.status.toLowerCase()}.
              </span>
              <div aria-hidden="true" className="flex shrink-0 items-center" style={{ gap: L.gap }}>
                {[0, 1].map((k) => (
                  <Flap key={`h${k}`} ch={time[k]} drum={DIGITS} tint={r.tint} w={L.tw} h={L.th} fs={L.fs} delay={del(k)} reduced={reduced} />
                ))}
                <span className="flex flex-col items-center justify-center gap-[22%]" style={{ width: colonW, height: L.th }}>
                  {[0, 1].map((k) => (
                    <span key={k} className="rounded-full" style={{ width: Math.max(3, L.tw * 0.15), height: Math.max(3, L.tw * 0.15), background: r.tint.band, boxShadow: `0 0 6px ${r.tint.band}` }} />
                  ))}
                </span>
                {[2, 3].map((k) => (
                  <Flap key={`m${k}`} ch={time[k]} drum={DIGITS} tint={r.tint} w={L.tw} h={L.th} fs={L.fs} delay={del(k)} reduced={reduced} />
                ))}
                {hour12 && (
                  <span className="self-end pb-[3px] pl-1 text-[11px] font-semibold uppercase text-[#aab0e6]" style={{ width: Math.round(L.tw * 0.9) - 4 }}>
                    {r.w.h < 12 ? "am" : "pm"}
                  </span>
                )}
                <span style={{ width: sep }} />
                {name.split("").map((c, k) => (
                  <Flap key={`n${k}`} ch={c} drum={LETTERS} tint={r.tint} w={L.tw} h={L.th} fs={L.fs} delay={del(4 + k)} reduced={reduced} />
                ))}
              </div>
              {narrow ? <div className="mt-1.5">{meta}</div> : <div className="min-w-0 flex-1 overflow-hidden">{meta}</div>}
              {L.mode === "wide" && (
                <div aria-hidden="true" className="relative flex shrink-0 gap-px">
                  {Array.from({ length: 24 }, (_, h) => {
                    const work = h >= workHours[0] && h < workHours[1];
                    const on = h === r.w.h;
                    return <span key={h} className="h-[18px] w-[8px] rounded-[2px] transition-colors duration-200" style={{ background: work ? r.tint.band : on ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.09)", opacity: work && !on ? 0.62 : 1 }} />;
                  })}
                  <span className="absolute -bottom-[5px] -top-[5px] w-[2px] rounded-full bg-[#fff6e6] shadow-[0_0_8px_rgba(255,246,230,.9)]" style={{ left: `calc(${(fh / 24) * 100}% - 1px)` }} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* plan a time on the sky */}
      <div className={narrow ? "mt-4" : "mt-5"}>
        <div className={`mb-10 flex items-center justify-between gap-3 px-1 ${narrow ? "min-h-[38px]" : ""}`}>
          <p className="m-0 min-w-0 text-[13px] leading-snug text-[#c9cdf5]">
            {live ? (
              <>
                {narrow ? "Live: " : "Live. Your time is "}
                <span className="font-semibold tabular-nums text-[#fff6e6]">
                  {me.wd} {clockText(me, hour12)}
                </span>
                {narrow ? " your time" : ""}
              </>
            ) : (
              <>
                {narrow ? "" : "Planning "}
                <span className="font-semibold tabular-nums text-[#fff6e6]">
                  {me.wd} {clockText(me, hour12)}
                </span>{" "}
                your time, {spanText((T - now) / 60000)}
              </>
            )}
          </p>
          <button
            type="button"
            data-now
            onClick={goNow}
            disabled={live}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#fff6e6] px-3 text-[13px] font-semibold text-[#161b52] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#ffc23d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b52] disabled:opacity-40"
          >
            {ic("now", 14)}
            Now
          </button>
        </div>
        <div
          ref={stripRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative h-11 cursor-ew-resize rounded-[14px] [touch-action:none]"
          style={{ background: sky.bg, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), inset 0 -10px 18px -10px rgba(0,0,0,.35), 0 8px 18px -12px rgba(0,0,0,.8)" }}
        >
          {sky.ticks.map((t) => (
            <span key={t.p} aria-hidden="true" className="pointer-events-none absolute bottom-0 w-px" style={{ left: `${t.p * 100}%`, height: t.h % every === 0 ? 14 : 7, background: "rgba(255,255,255,.55)" }} />
          ))}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-[5px] left-1/2 w-0 border-l-2 border-dashed border-white/60" />
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Plan a time"
            aria-valuemin={-DAY / 2}
            aria-valuemax={DAY / 2}
            aria-valuenow={offset}
            aria-valuetext={live ? `Now, ${me.wd} ${clockText(me, hour12)} your time` : `${me.wd} ${clockText(me, hour12)} your time, ${spanText((T - now) / 60000)}`}
            onKeyDown={onKey}
            className="absolute -bottom-[6px] -top-[6px] z-10 w-[18px] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ffc23d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b52]"
            style={{ left: handleLeft, x: "-50%" }}
            animate={{ scale: dragging ? 1.12 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <span className="absolute inset-0 rounded-full bg-[#fff6e6] shadow-[0_4px_12px_rgba(0,0,0,.45),inset_0_-2px_0_rgba(22,27,82,.18)]" />
            {[0, 1, 2].map((k) => (
              <span key={k} className="absolute left-1/2 h-[2px] w-[8px] -translate-x-1/2 rounded-full bg-[#161b52]/35" style={{ top: `calc(50% + ${(k - 1) * 5}px - 1px)` }} />
            ))}
            <motion.span
              aria-hidden="true"
              className="absolute bottom-[calc(100%+7px)] left-1/2 whitespace-nowrap rounded-[8px] bg-[#fff6e6] px-2 py-[3px] text-[12px] font-semibold tabular-nums text-[#161b52] shadow-[0_6px_14px_-6px_rgba(0,0,0,.6)]"
              style={{ x: bubbleX }}
            >
              {clockText(me, hour12)}
            </motion.span>
          </motion.div>
        </div>
        <div aria-hidden="true" className="relative mt-1.5 h-4">
          {sky.ticks
            .filter((t) => t.h % every === 0 && t.p > 0.05 && t.p < 0.95)
            .map((t) => (
              <span key={t.p} className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] tabular-nums text-[#aab0e6]" style={{ left: `${t.p * 100}%` }}>
                {hourLabel(t.h)}
              </span>
            ))}
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
