# Income Stream

Add the "Income Stream" component from Nexus UI to my project.

Income drawn as a stream. Each month's money flows as a band mirrored about its centre, the steady salary inside and the extras around it, breathing a little as it flows. Move along it and a hairline picks out the month: the total rolls to it, the month before is compared and the band brightens under the line.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { IncomeStream } from "@/components/income-stream";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/income-stream/income-stream.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type IncomeSource = { id: string; name: string; color: string };
export type IncomeMonth = { month: string; values: Record<string, number> };
export type IncomeStreamProps = {
  title?: string;
  sources?: IncomeSource[];
  months?: IncomeMonth[];
  currency?: string;
  onMonthChange?: (index: number) => void;
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

const DEFAULT_SOURCES: IncomeSource[] = [
  { id: "salary", name: "Salary", color: "#0071e3" },
  { id: "freelance", name: "Freelance", color: "#5aa6ff" },
  { id: "other", name: "Interest", color: "#b9dbff" },
];
const DEFAULT_MONTHS: IncomeMonth[] = [
  ["Aug", 2600, 520, 140],
  ["Sep", 2600, 880, 150],
  ["Oct", 2600, 610, 155],
  ["Nov", 2750, 1240, 160],
  ["Dec", 3300, 1010, 172],
  ["Jan", 2750, 640, 168],
  ["Feb", 2750, 980, 176],
  ["Mar", 2750, 1280, 182],
].map(([month, a, b, c]) => ({
  month: month as string,
  values: { salary: a as number, freelance: b as number, other: c as number },
}));

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
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 210,
                      damping: 26,
                      mass: 0.6 + (key % 3) * 0.1,
                    }
              }
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

const W = 400;
const H = 150;
const SAMPLES = 160;

/** monotone cubic through the month values, so the band never overshoots or flattens at a month */
function monotone(ys: number[], samples: number) {
  const n = ys.length;
  if (n < 2) return Array.from({ length: samples + 1 }, () => ys[0] ?? 0);
  const d = ys.slice(1).map((y, i) => y - ys[i]);
  const m = ys.map((_, i) =>
    i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2,
  );
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return Array.from({ length: samples + 1 }, (_, j) => {
    const f = (j / samples) * (n - 1);
    const i = Math.min(n - 2, Math.floor(f));
    const t = f - i;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * m[i + 1]
    );
  });
}

/** a slow surface made of a few travelling waves, flowing left to right */
const surface = (u: number, t: number, seed: number) =>
  0.55 * Math.sin(u * 7.1 - t * 1.25 + seed) +
  0.3 * Math.sin(u * 13.3 - t * 2.05 + seed * 2.3) +
  0.15 * Math.sin(u * 23.7 - t * 3.1 + seed * 4.1);

type Ripple = { x: number; t0: number; a: number };

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
 * Income as a stream. Each month's money flows left to right as a band that swells and narrows with the total,
 * mirrored about its centre, with the steady part on the inside and the extras around it. The band breathes a little
 * as it flows. Move along it (or use the arrow keys) and a hairline picks out the month: the total rolls to it, the
 * month beside it is compared, and the band brightens under the line while the rest dims.
 */
export default function IncomeStream({
  title = "Income",
  sources = DEFAULT_SOURCES,
  months = DEFAULT_MONTHS,
  currency = "$",
  onMonthChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: IncomeStreamProps) {
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, getReduceOnServer);
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [idx, setIdx] = useState(months.length - 1);
  const [scrubbing, setScrubbing] = useState(false);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const rims = useRef<(SVGPathElement | null)[]>([]);
  const sheen = useRef<SVGPathElement>(null);
  const caustics = useRef<(SVGPathElement | null)[]>([]);
  const deep = useRef<SVGPathElement | null>(null);
  const sheenGrad = useRef<SVGLinearGradientElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const uid = useId().replace(/:/g, "");
  // where the pointer is, as a fraction of the width, and a soft spring that the water follows
  const focusTarget = useMotionValue(1);
  const focus = useSpring(
    focusTarget,
    reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 150, damping: 24, mass: 0.9 },
  );
  const lineLeft = useTransform(focus, (f) => `${f * 100}%`);
  const wash = useTransform(
    focus,
    (f) =>
      `linear-gradient(90deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.32) calc(${f * 100}% - 110px), rgba(255,255,255,0) calc(${f * 100}% - 26px), rgba(255,255,255,0) calc(${f * 100}% + 26px), rgba(255,255,255,0.32) calc(${f * 100}% + 110px), rgba(255,255,255,0.32) 100%)`,
  );
  const lit = useMotionValue(0);
  const grow = useMotionValue(reduce ? 1 : 0);

  const totals = useMemo(
    () => months.map((m) => sources.reduce((a, s) => a + (m.values[s.id] ?? 0), 0)),
    [months, sources],
  );
  const top = Math.max(...totals);

  // cumulative thickness per source, sampled smoothly along x (cosine between months)
  const cum = useMemo(() => {
    // outermost first: everything, then all but the last source, down to the first source alone in the middle
    return sources.map((_, k) => {
      const per = months.map(
        (m) => sources.slice(0, sources.length - k).reduce((a, s) => a + (m.values[s.id] ?? 0), 0) / top,
      );
      return monotone(per, SAMPLES);
    });
  }, [months, sources, top]);

  // the liquid: every frame the band edges are rebuilt from a flowing surface, a gentle sway of the whole river,
  // the scrub swell and any ripples still spreading from where the hairline last landed
  useEffect(() => {
    if (reduce) grow.set(1);
    else void animate(grow, 1, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    let raf = 0;
    const t0 = performance.now();
    const mid = H / 2;
    const maxHalf = H / 2 - 10;
    let vS = 0;
    let lastT = performance.now();
    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
      lastT = now;
      const t = reduce ? 0 : (now - t0) / 1000;
      const g = grow.get();
      const fx = focus.get();
      const L = lit.get();
      // the speed the hairline moves through the water, smoothed, drives the bow wave and the wake
      vS += (focus.getVelocity() - vS) * Math.min(1, dt * 10);
      const speed = reduce ? 0 : Math.max(-2.2, Math.min(2.2, vS));
      const dir = speed >= 0 ? 1 : -1;
      const live = ripples.current.filter((r) => now - r.t0 < 2600);
      ripples.current = live;
      const N = SAMPLES + 1;
      const ys = new Float32Array(N * 2 * cum.length);
      const ci = cum.length - 1;
      for (let i = 0; i < N; i++) {
        const u = i / SAMPLES;
        const m = reduce ? 0 : 1;
        // the river sways as a whole; edges near the ends are calmer
        const calm = Math.min(1, u * 6, (1 - u) * 6);
        const sway = 2.6 * m * Math.sin(u * 4.2 - t * 0.9) * calm;
        let ft = 0.075 * m * surface(u, t, 0.3) * (0.4 + 0.6 * calm);
        let fb = 0.075 * m * surface(u, t * 1.07, 2.1) * (0.4 + 0.6 * calm);
        // a swell under the hairline that leans the way it moves, and a wake that trails behind
        const c = fx + speed * 0.025;
        const swell = 1 + (0.1 + 0.03 * Math.abs(speed)) * L * Math.exp(-(((u - c) * 5.2) ** 2));
        const behind = (fx - u) * dir;
        if (behind > 0 && L > 0) {
          const wake = Math.abs(speed) * L * Math.exp(-behind * 6) * Math.sin(behind * 30 - t * 6);
          ft += 0.035 * wake;
          fb += 0.035 * wake;
        }
        // ripples: a damped ring travelling out from where the month was picked
        for (const r of live) {
          const age = (now - r.t0) / 1000;
          const dist = Math.abs(u - r.x);
          const front = Math.min(1, Math.max(0, (age * 0.38 - dist) * 14));
          const ring = Math.sin(dist * 24 - age * 8) * Math.exp(-age * 1.9) * Math.exp(-dist * 2.6) * front;
          ft += 0.15 * r.a * ring;
          fb += 0.15 * r.a * ring;
        }
        cum.forEach((row, k) => {
          const half = row[i] * maxHalf * g * swell;
          ys[(k * N + i) * 2] = mid + sway - half * (1 + ft);
          ys[(k * N + i) * 2 + 1] = mid + sway + half * (1 + fb);
        });
      }
      cum.forEach((_, k) => {
        let up = "";
        let dn = "";
        for (let i = 0; i < N; i++) {
          const x = ((i / SAMPLES) * W).toFixed(1);
          up += `${i ? "L" : "M"}${x} ${ys[(k * N + i) * 2].toFixed(2)}`;
          dn = `L${x} ${ys[(k * N + i) * 2 + 1].toFixed(2)}` + dn;
        }
        paths.current[k]?.setAttribute("d", `${up}${dn}Z`);
        rims.current[k]?.setAttribute("d", up);
        if (k === 0) sheen.current?.setAttribute("d", `${up}${dn}Z`);
        if (k === cum.length - 1) deep.current?.setAttribute("d", `${up}${dn}Z`);
      });
      // light lines refracting inside the deepest band, drifting downstream
      caustics.current.forEach((el, j) => {
        if (!el) return;
        const pos = [-0.42, 0.08, 0.5][j];
        let d = "";
        for (let i = 0; i < N; i += 2) {
          const u = i / SAMPLES;
          const a = ys[(ci * N + i) * 2];
          const b = ys[(ci * N + i) * 2 + 1];
          const c = (a + b) / 2;
          const h = (b - a) / 2;
          const y = c + h * (pos + 0.16 * surface(u * 1.4, t * 1.35, 5 + j * 1.9));
          d += `${i ? "L" : "M"}${((i / SAMPLES) * W).toFixed(1)} ${y.toFixed(2)}`;
        }
        el.setAttribute("d", d);
        el.setAttribute("stroke-opacity", (0.16 + 0.08 * Math.sin(t * 0.8 + j * 2)).toFixed(3));
      });
      // light drifting downstream across the water
      sheenGrad.current?.setAttribute(
        "gradientTransform",
        `translate(${(((t * 46) % (W * 1.6)) - W * 0.6).toFixed(1)} 0)`,
      );
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [cum, reduce, grow, focus, lit]);

  const setMonth = (v: number, ripple: boolean) => {
    setIdx((old) => {
      if (old !== v) {
        if (ripple)
          ripples.current.push({
            x: v / (months.length - 1),
            t0: performance.now(),
            a: Math.min(0.8, 0.4 + Math.abs(v - old) * 0.12),
          });
        onMonthChange?.(v);
        sfx.tick({ freq: 1500 + (totals[v] / top) * 900, gain: 0.018 });
      }
      return v;
    });
  };
  /** jump to a month (keys, taps, autoplay): the water glides there and rings once */
  const pick = (i: number) => {
    const v = Math.max(0, Math.min(months.length - 1, i));
    setMonth(v, true);
    focusTarget.set(v / (months.length - 1));
  };
  const frac = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  /** follow the pointer continuously; the month changes when it passes the halfway point between two */
  const follow = (clientX: number) => {
    const f = frac(clientX);
    focusTarget.set(f);
    setMonth(Math.round(f * (months.length - 1)), false);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.isTrusted) touched.current = true;
    if (e.pointerType === "touch" && !scrubbing) return;
    if (!scrubbing) {
      setScrubbing(true);
      void animate(lit, 1, { duration: 0.3 });
    }
    follow(e.clientX);
  };
  const leave = () => {
    setScrubbing(false);
    void animate(lit, 0, { duration: 0.5 });
    focusTarget.set(idxRef.current / (months.length - 1));
  };
  const key = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home") pick(0);
    else if (e.key === "End") pick(months.length - 1);
    else if (d) pick(idx + d);
    else return;
    e.preventDefault();
    touched.current = true;
    void animate(lit, 1, { duration: 0.3 });
  };

  // autoplay: walk back through the months and return
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const run = async () => {
      await wait(1800);
      while (ok()) {
        void animate(lit, 1, { duration: 0.4 });
        for (let i = months.length - 1; i >= 0 && ok(); i--) {
          pick(i);
          await wait(650);
        }
        for (let i = 1; i < months.length && ok(); i++) {
          pick(i);
          await wait(380);
        }
        void animate(lit, 0, { duration: 0.5 });
        await wait(2400);
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

  const total = totals[idx];
  const prev = idx > 0 ? totals[idx - 1] : null;
  const change = prev ? ((total - prev) / prev) * 100 : 0;
  const up = change >= 0;

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "24px 24px 20px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontSize: 13, color: "#86868b" }}>
          {title}, {months[idx].month}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 6,
          }}
        >
          <div aria-live="polite" style={{ display: "flex", alignItems: "flex-end" }}>
            <Roll
              text={`${currency}${total.toLocaleString("en-US")}`}
              reduce={reduce}
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.035em",
              }}
            />
          </div>
          {prev !== null && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
                fontSize: 12.5,
                color: "#86868b",
                whiteSpace: "nowrap",
              }}
            >
              vs {months[idx - 1].month}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "3px 8px",
                  borderRadius: 10,
                  background: up ? "rgba(48,209,88,0.12)" : "rgba(255,59,48,0.1)",
                  color: up ? "#1a7f37" : "#c4271d",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 256 256"
                  aria-hidden="true"
                  style={{ transform: up ? "none" : "rotate(180deg)" }}
                >
                  <path
                    d="M215.39 163.06A8 8 0 0 1 208 168H48a8 8 0 0 1-5.66-13.66l80-80a8 8 0 0 1 11.32 0l80 80a8 8 0 0 1 1.73 8.72"
                    fill="currentColor"
                  />
                </svg>
                {Math.abs(change).toFixed(1)}%
              </span>
            </span>
          )}
        </div>

        {/* the stream */}
        <div
          ref={box}
          role="slider"
          tabIndex={0}
          aria-label={`${title} by month`}
          aria-valuemin={0}
          aria-valuemax={months.length - 1}
          aria-valuenow={idx}
          aria-valuetext={`${months[idx].month}, ${currency}${total.toLocaleString("en-US")}`}
          onPointerMove={move}
          onPointerDown={(e) => {
            touched.current = true;
            setScrubbing(true);
            void animate(lit, 1, { duration: 0.3 });
            follow(e.clientX);
          }}
          onPointerLeave={leave}
          onKeyDown={key}
          onBlur={leave}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
          style={{
            position: "relative",
            marginTop: 18,
            borderRadius: 8,
            touchAction: "pan-y",
            cursor: "crosshair",
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
            aria-hidden="true"
          >
            <defs>
              {sources.map((src) => (
                <linearGradient
                  key={src.id}
                  id={`${uid}-${src.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={H}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.12" stopColor={src.color} stopOpacity={0.72} />
                  <stop offset="0.5" stopColor={src.color} stopOpacity={1} />
                  <stop offset="0.88" stopColor={src.color} stopOpacity={0.72} />
                </linearGradient>
              ))}
              <linearGradient id={`${uid}-deep`} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
                <stop offset="0.25" stopColor="#003f8f" stopOpacity={0} />
                <stop offset="0.5" stopColor="#003f8f" stopOpacity={0.22} />
                <stop offset="0.75" stopColor="#003f8f" stopOpacity={0} />
              </linearGradient>
              <filter id={`${uid}-soft`} x="-5%" y="-30%" width="110%" height="160%">
                <feGaussianBlur stdDeviation="0.9" />
              </filter>
              <linearGradient
                ref={sheenGrad}
                id={`${uid}-sheen`}
                x1="0"
                y1="0"
                x2={W * 0.6}
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#fff" stopOpacity={0} />
                <stop offset="0.5" stopColor="#fff" stopOpacity={0.22} />
                <stop offset="1" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            {sources.map((_, k) => {
              const src = sources[sources.length - 1 - k];
              return (
                <path
                  key={src.id}
                  ref={(el) => {
                    paths.current[k] = el;
                  }}
                  fill={`url(#${uid}-${src.id})`}
                />
              );
            })}
            <path
              ref={(el) => {
                deep.current = el;
              }}
              fill={`url(#${uid}-deep)`}
            />
            {!reduce && <path ref={sheen} fill={`url(#${uid}-sheen)`} style={{ mixBlendMode: "soft-light" }} />}
            {!reduce &&
              [0, 1, 2].map((j) => (
                <path
                  key={`c${j}`}
                  ref={(el) => {
                    caustics.current[j] = el;
                  }}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  filter={`url(#${uid}-soft)`}
                />
              ))}
            {sources.map((_, k) => {
              const src = sources[sources.length - 1 - k];
              return (
                <path
                  key={`rim-${src.id}`}
                  ref={(el) => {
                    rims.current[k] = el;
                  }}
                  fill="none"
                  stroke="#fff"
                  strokeOpacity={0.45}
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
          {/* dim everything but the chosen month */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrubbing ? 1 : 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: "absolute",
              inset: "-4px 0",
              pointerEvents: "none",
              background: wash,
            }}
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrubbing ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              top: -6,
              bottom: -6,
              left: lineLeft,
              width: 1,
              marginLeft: -0.5,
              background:
                "linear-gradient(rgba(29,29,31,0), rgba(29,29,31,0.75) 18%, rgba(29,29,31,0.75) 82%, rgba(29,29,31,0))",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            fontSize: 11.5,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {months.map((m, i) => (
            <span
              key={m.month}
              style={{
                width: 0,
                display: "flex",
                justifyContent: i === 0 ? "flex-start" : i === months.length - 1 ? "flex-end" : "center",
                color: i === idx ? "#1d1d1f" : "#aeaeb2",
                fontWeight: i === idx ? 600 : 400,
                transition: "color 0.2s",
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>{m.month}</span>
            </span>
          ))}
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(0,0,0,0.06)",
            margin: "18px 0 14px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 12.5,
            color: "#6e6e73",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {sources.map((s) => (
              <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: s.color,
                  }}
                />
                {s.name}
                <span
                  style={{
                    color: "#1d1d1f",
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currency}
                  {(months[idx].values[s.id] ?? 0).toLocaleString("en-US")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

--- components/income-stream/index.ts ---

```ts
export { default as IncomeStream } from "./income-stream";
export type { IncomeStreamProps } from "./income-stream";
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
