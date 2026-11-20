# Odds Chart

Add the "Odds Chart" section from Nexus UI to my project.

A prediction market at a glance. Yes and No are two mirrored lines, and new prices keep arriving: each slides in from the right as the line moves along and the end pulses. Switch the range and the lines reshape into that history; move across to read any moment, and choose a side to bring its line forward.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { OddsChart } from "@/components/blocks/motion-kit/odds-chart";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/odds-chart/index.ts ---

```ts
export { default as OddsChart } from "./odds-chart";
export type { OddsChartProps } from "./odds-chart";
```

--- components/blocks/motion-kit/odds-chart/odds-chart.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type OddsRange = { id: string; label: string; span: string };
export type OddsChartProps = {
  question?: string;
  /** chance of yes now, 0 to 100 */
  chance?: number;
  ranges?: OddsRange[];
  /** keep adding new prices while it is on screen */
  live?: boolean;
  onRangeChange?: (id: string) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const DEFAULT_RANGES: OddsRange[] = [
  { id: "1d", label: "1D", span: "today" },
  { id: "1w", label: "1W", span: "this week" },
  { id: "1m", label: "1M", span: "this month" },
  { id: "all", label: "All", span: "since it opened" },
];

const N = 90;
const W = 400;
const H = 150;

/** a seeded walk that ends on `end`, gentler for short ranges */
function walk(seed0: number, end: number, rough: number) {
  let seed = seed0;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const out = new Array<number>(N);
  let v = end;
  out[N - 1] = v;
  for (let i = N - 2; i >= 0; i--) {
    v += (r() - 0.5) * rough + (50 - v) * 0.004;
    v = Math.max(6, Math.min(94, v));
    out[i] = v;
  }
  return out;
}

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  const box = {
    display: "inline-block",
    height: "1.1em",
    lineHeight: 1.1,
    overflow: "hidden",
  } as const;
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true" style={box}>
              {ch}
            </span>
          );
        return (
          <span key={`d${key}`} aria-hidden="true" style={{ ...box, position: "relative" }}>
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 26, mass: 0.5 }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.1em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

const yOf = (v: number) => 8 + (1 - v / 100) * (H - 16);

// prefers-reduced-motion as an external store: the server and the first client render agree on "no preference",
// then the real value is read right after hydration, so reduced-motion visitors don't get a hydration mismatch
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (notify: () => void) => {
  const q = window.matchMedia(REDUCE_QUERY);
  q.addEventListener("change", notify);
  return () => q.removeEventListener("change", notify);
};
const getReduce = () => window.matchMedia(REDUCE_QUERY).matches;
const getReduceOnServer = () => false;

/**
 * A prediction market at a glance. The chance of Yes and of No are drawn as two lines that mirror each other, and new
 * prices keep arriving: the lines slide left as each one lands and the ends pulse. Switch the range and the lines
 * reshape into the new history. Move across the chart to read any moment, with both chances rolling to it. Choose Yes
 * or No to bring that line forward.
 */
export default function OddsChart({
  question = "Will it snow in the city before Dec 31?",
  chance = 74,
  ranges = DEFAULT_RANGES,
  live = true,
  onRangeChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: OddsChartProps) {
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, getReduceOnServer);
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [range, setRange] = useState(ranges[0]?.id ?? "1d");
  const [hover, setHover] = useState<number | null>(null);
  const [side, setSide] = useState<"yes" | "no" | null>(null);
  const [nowYes, setNowYes] = useState(chance);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const yesPath = useRef<SVGPathElement>(null);
  const noPath = useRef<SVGPathElement>(null);
  const yesFill = useRef<SVGPathElement>(null);
  const endYes = useRef<SVGGElement>(null);
  const endNo = useRef<SVGGElement>(null);

  const histories = useMemo(() => {
    const m: Record<string, number[]> = {};
    ranges.forEach((r, i) => (m[r.id] = walk(97 + i * 131, chance, 2.2 + i * 1.6)));
    return m;
  }, [ranges, chance]);
  const shown = useRef<number[]>(histories[range].slice());
  const from = useRef<number[]>(shown.current.slice());
  const to = useRef<number[]>(shown.current.slice());
  const mix = useMotionValue(1);
  const slide = useMotionValue(0);
  // the newest price, drawn just past the right edge until the line slides it in
  const pending = useRef<number | null>(null);

  const draw = () => {
    const m = mix.get();
    const s = slide.get();
    const a = from.current;
    const b = to.current;
    const cur = shown.current;
    for (let i = 0; i < N; i++) cur[i] = a[i] + (b[i] - a[i]) * m;
    let dy = "";
    let dn = "";
    const pend = pending.current;
    const pts = pend === null ? cur : cur.concat(pend);
    for (let i = 0; i < pts.length; i++) {
      const x = ((i - s) / (N - 1)) * W;
      dy += `${i ? "L" : "M"}${x.toFixed(1)} ${yOf(pts[i]).toFixed(1)}`;
      dn += `${i ? "L" : "M"}${x.toFixed(1)} ${yOf(100 - pts[i]).toFixed(1)}`;
    }
    yesPath.current?.setAttribute("d", dy);
    noPath.current?.setAttribute("d", dn);
    yesFill.current?.setAttribute(
      "d",
      `${dy}L${(((pts.length - 1 - s) / (N - 1)) * W).toFixed(1)} ${H}L${((-s / (N - 1)) * W).toFixed(1)} ${H}Z`,
    );
    // the end dot stays on the right edge and rides the newest segment as it slides in
    const endV = pend === null ? cur[N - 1] : cur[N - 1] + (pend - cur[N - 1]) * s;
    endYes.current?.setAttribute("transform", `translate(${W} ${yOf(endV).toFixed(1)})`);
    endNo.current?.setAttribute("transform", `translate(${W} ${yOf(100 - endV).toFixed(1)})`);
  };

  useEffect(() => {
    draw();
    const a = mix.on("change", draw);
    const b = slide.on("change", draw);
    return () => {
      a();
      b();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickRange = (id: string) => {
    if (id === range) return;
    setRange(id);
    onRangeChange?.(id);
    from.current = shown.current.slice();
    to.current = histories[id].slice();
    to.current[N - 1] = shown.current[N - 1];
    pending.current = null;
    slide.stop();
    slide.set(0);
    mix.set(0);
    void animate(mix, 1, reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 });
    sfx.whoosh(1000, 2400, { dur: 0.25, gain: 0.03 });
  };

  // live prices: a new one lands, the line slides one step left
  useEffect(() => {
    if (!live || reduce) return;
    let seed = 11;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const id = setInterval(() => {
      if (hover !== null || mix.get() < 0.98) return;
      const last = shown.current[N - 1];
      const next = Math.max(6, Math.min(94, last + (r() - 0.48) * 3.2 + (chance - last) * 0.12));
      pending.current = next;
      void animate(slide, 1, { duration: 0.7, ease: [0.35, 0, 0.25, 1] }).then(() => {
        const arr = shown.current.slice(1).concat(next);
        pending.current = null;
        from.current = arr.slice();
        to.current = arr.slice();
        shown.current = arr;
        slide.set(0);
        draw();
        setNowYes(Math.round(next));
      });
      sfx.tick({ freq: 2600, gain: 0.006 });
    }, 1700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, reduce, hover, chance]);

  const fromX = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return Math.max(0, Math.min(N - 1, Math.round(((clientX - r.left) / r.width) * (N - 1))));
  };
  const move = (e: RPointerEvent) => {
    if (e.isTrusted) touched.current = true;
    const i = fromX(e.clientX);
    setHover((h) => {
      if (h !== i && i % 6 === 0) sfx.tick({ freq: 2000 + shown.current[i] * 8, gain: 0.006 });
      return i;
    });
  };
  const key = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (d) setHover((h) => Math.max(0, Math.min(N - 1, (h ?? N - 1) + d * 3)));
    else if (e.key === "Escape") setHover(null);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  // autoplay: change ranges, read a few moments, choose a side
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const root = box.current?.closest("[data-odds]") as HTMLElement | null;
    const go = async (el: Element | null | undefined, fx = 0.5, fy = 0.5, ms = 550) => {
      if (!root || !el) return;
      const r = el.getBoundingClientRect();
      const cb = root.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width * fx, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height * fy, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const run = async () => {
      await wait(1500);
      while (ok()) {
        for (const id of ranges
          .slice(1)
          .map((r) => r.id)
          .concat(ranges[0].id)) {
          await go(root?.querySelector(`[data-range="${id}"]`));
          if (!ok()) return;
          pickRange(id);
          await wait(1300);
        }
        for (const f of [0.2, 0.45, 0.7]) {
          await go(box.current, f, 0.5, 500);
          if (!ok()) return;
          setHover(Math.round(f * (N - 1)));
          await wait(900);
        }
        setHover(null);
        await go(root?.querySelector('[data-side="yes"]'));
        if (!ok()) return;
        setSide("yes");
        await wait(1600);
        setSide(null);
        setGhost(false);
        await wait(2500);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const yes = hover !== null ? Math.round(shown.current[hover]) : nowYes;
  const no = 100 - yes;
  const rangeInfo = ranges.find((r) => r.id === range) ?? ranges[0];
  const startYes = Math.round(histories[range][0]);
  const delta = nowYes - startYes;
  const hx = hover !== null ? (hover / (N - 1)) * 100 : 0;
  const yesOp = side === "no" ? 0.25 : 1;
  const noOp = side === "yes" ? 0.25 : 1;

  return (
    <div
      data-odds
      className={`relative mx-auto my-10 w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "22px 22px 18px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "#f2f2f7",
              color: "#1d1d1f",
              flexShrink: 0,
            }}
          >
            <svg width="19" height="19" viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M223.77 150.09a8 8 0 0 1-5.86 9.68l-24.64 6l6.46 24.11a8 8 0 0 1-5.66 9.8a8.3 8.3 0 0 1-2.07.32a8 8 0 0 1-7.72-5.93l-7.72-28.8L136 141.86v46.83l21.66 21.65a8 8 0 0 1-11.32 11.32L128 203.31l-18.34 18.35a8 8 0 0 1-11.32-11.32L120 188.69v-46.83l-40.55 23.41l-7.72 28.8A8 8 0 0 1 64 200a8.3 8.3 0 0 1-2.08-.27a8 8 0 0 1-5.66-9.8l6.46-24.11l-24.64-6a8 8 0 0 1 3.82-15.54l29.45 7.23L112 128l-40.64-23.46l-29.45 7.23A8 8 0 0 1 40 112a8 8 0 0 1-1.91-15.77l24.64-6l-6.46-24.16a8 8 0 0 1 15.46-4.14l7.72 28.8L120 114.14V67.31L98.34 45.66a8 8 0 0 1 11.32-11.32L128 52.69l18.34-18.35a8 8 0 0 1 11.32 11.32L136 67.31v46.83l40.55-23.41l7.72-28.8a8 8 0 0 1 15.46 4.14l-6.46 24.11l24.64 6A8 8 0 0 1 216 112a8 8 0 0 1-1.91-.23l-29.45-7.23L144 128l40.64 23.46l29.45-7.23a8 8 0 0 1 9.68 5.86"
                fill="currentColor"
              />
            </svg>
          </span>
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              lineHeight: 1.3,
            }}
          >
            {question}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexWrap: "wrap",
            columnGap: 10,
            rowGap: 2,
            marginTop: 16,
          }}
        >
          <div aria-live="polite" style={{ display: "flex", alignItems: "flex-end" }}>
            <Roll
              text={`${yes}%`}
              reduce={reduce}
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.035em",
                color: "#0071e3",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 13,
              color: "#86868b",
              marginBottom: 6,
              whiteSpace: "nowrap",
            }}
          >
            chance of yes
          </span>
          <span
            style={{
              marginLeft: "auto",
              marginBottom: 6,
              fontSize: 12.5,
              fontWeight: 500,
              color: delta >= 0 ? "#1a7f37" : "#c4271d",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {delta >= 0 ? "+" : "-"}
            {Math.abs(delta)}% {rangeInfo.span}
          </span>
        </div>

        {/* the chart */}
        <div
          ref={box}
          role="img"
          tabIndex={0}
          aria-label={`Chance of yes ${rangeInfo.span}, now ${nowYes}%`}
          onPointerMove={move}
          onPointerLeave={() => setHover(null)}
          onKeyDown={key}
          onBlur={() => setHover(null)}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
          style={{
            position: "relative",
            marginTop: 14,
            borderRadius: 6,
            cursor: "crosshair",
            touchAction: "pan-y",
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="odds-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0071e3" stopOpacity="0.12" />
                <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
              </linearGradient>
              <clipPath id="odds-clip">
                <rect x="0" y="-10" width={W} height={H + 20} />
              </clipPath>
            </defs>
            {[25, 50, 75].map((v) => (
              <line
                key={v}
                x1="0"
                x2={W}
                y1={yOf(v)}
                y2={yOf(v)}
                stroke="#000"
                strokeOpacity={v === 50 ? 0.08 : 0.04}
                strokeDasharray="2 4"
              />
            ))}
            <g clipPath="url(#odds-clip)">
              <path ref={yesFill} fill="url(#odds-fill)" style={{ opacity: yesOp, transition: "opacity 0.35s" }} />
              <path
                ref={noPath}
                fill="none"
                stroke="#aeaeb2"
                strokeWidth="1.8"
                strokeLinejoin="round"
                style={{ opacity: noOp, transition: "opacity 0.35s" }}
              />
              <path
                ref={yesPath}
                fill="none"
                stroke="#0071e3"
                strokeWidth="2.2"
                strokeLinejoin="round"
                style={{ opacity: yesOp, transition: "opacity 0.35s" }}
              />
            </g>
            <g
              ref={endNo}
              style={{
                opacity: noOp * (hover === null ? 1 : 0.4),
                transition: "opacity 0.3s",
              }}
            >
              <circle r="3.5" fill="#aeaeb2" />
            </g>
            <g
              ref={endYes}
              style={{
                opacity: yesOp * (hover === null ? 1 : 0.4),
                transition: "opacity 0.3s",
              }}
            >
              {!reduce && (
                <circle r="4" fill="#0071e3" opacity="0.25">
                  <animate attributeName="r" values="4;11;4" dur="1.7s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="1.7s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r="4" fill="#0071e3" stroke="#fff" strokeWidth="1.5" />
            </g>
          </svg>
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                key="hair"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${hx}%`,
                    width: 1,
                    background: "rgba(0,0,0,0.18)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${hx}%`,
                    top: `${(yOf(shown.current[hover]) / H) * 100}%`,
                    width: 9,
                    height: 9,
                    margin: "-4.5px 0 0 -4.5px",
                    borderRadius: 5,
                    background: "#0071e3",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${hx}%`,
                    top: `${(yOf(100 - shown.current[hover]) / H) * 100}%`,
                    width: 8,
                    height: 8,
                    margin: "-4px 0 0 -4px",
                    borderRadius: 4,
                    background: "#aeaeb2",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div role="tablist" aria-label="Range" style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {ranges.map((r) => {
            const on = r.id === range;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={on}
                data-range={r.id}
                onClick={() => {
                  touched.current = true;
                  pickRange(r.id);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  position: "relative",
                  height: 28,
                  padding: "0 12px",
                  borderRadius: 14,
                  border: 0,
                  background: "transparent",
                  color: on ? "#1d1d1f" : "#86868b",
                  fontSize: 12.5,
                  fontWeight: on ? 600 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {on && (
                  <motion.span
                    layoutId="odds-range"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background: "#f2f2f7",
                    }}
                  />
                )}
                <span style={{ position: "relative", fontSize: 12.5 }}>{r.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 14,
          }}
        >
          {(["yes", "no"] as const).map((k) => {
            const on = side === k;
            const val = k === "yes" ? yes : no;
            const c = k === "yes" ? "#0071e3" : "#6e6e73";
            return (
              <button
                key={k}
                type="button"
                data-side={k}
                aria-pressed={on}
                onClick={() => {
                  touched.current = true;
                  setSide((s) => (s === k ? null : k));
                  sfx.note(k === "yes" ? 880 : 660, { dur: 0.2, gain: 0.05 });
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 46,
                  padding: "0 16px",
                  borderRadius: 14,
                  border: 0,
                  background: on ? c : k === "yes" ? "rgba(0,113,227,0.08)" : "#f2f2f7",
                  color: on ? "#fff" : c,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.25s, color 0.25s",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>{k === "yes" ? "Yes" : "No"}</span>
                <Roll text={`${val}¢`} reduce={reduce} style={{ fontSize: 15, fontWeight: 600 }} />
              </button>
            );
          })}
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -11,
              top: -11,
              x: gx,
              y: gy,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "rgba(0,0,0,0.08)",
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35), 0 4px 10px -3px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
