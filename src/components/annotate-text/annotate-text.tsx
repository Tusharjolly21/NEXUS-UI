"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Mark = "highlight" | "circle" | "underline" | "strike" | "box";
export type AnnotateSegment = { text: string; mark?: Mark; color?: string };
export type AnnotateTextProps = {
  segments?: AnnotateSegment[];
  /** seconds between one mark and the next */
  stagger?: number;
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

const I = {
  replay:
    "M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128",
};

const DEFAULT: AnnotateSegment[] = [
  {
    text: "Most software asks for your attention. Good software earns it: it is ",
  },
  { text: "quiet", mark: "circle" },
  { text: ", it remembers where you left off, and it " },
  { text: "answers the question you were about to ask", mark: "highlight" },
  { text: ". Nothing about it is " },
  { text: "clever", mark: "strike" },
  { text: " for its own sake. It simply works, " },
  { text: "every single time", mark: "underline" },
  { text: ", and then it " },
  { text: "gets out of the way", mark: "box" },
  { text: "." },
];
const INK: Record<Mark, string> = {
  highlight: "#ffd426",
  circle: "#e5484d",
  underline: "#2f6fde",
  strike: "#e5484d",
  box: "#1f9d55",
};

type Rect = { x: number; y: number; w: number; h: number };
type Stroke = {
  d: string;
  width: number;
  opacity: number;
  dur: number;
  delay: number;
};

// a steady hand is never perfectly steady
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const line = (pts: [number, number][]) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  d += ` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
  return d;
};

function strokesFor(mark: Mark, rects: Rect[], seed: number): Stroke[] {
  const r = rng(seed);
  const out: Stroke[] = [];
  const all = rects.slice(0, 1).reduce(
    (a, b) => ({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x),
      h: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y),
    }),
    rects[0],
  );
  if (mark === "highlight") {
    rects.forEach((q, i) => {
      const n = Math.max(3, Math.round(q.w / 40));
      for (let pass = 0; pass < 2; pass++) {
        const pts: [number, number][] = [];
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          pts.push([q.x - 4 + t * (q.w + 8), q.y + q.h * (0.54 + pass * 0.06) - t * 2 + (r() - 0.5) * 2.2]);
        }
        out.push({
          d: line(pts),
          width: q.h * (0.86 - pass * 0.2),
          opacity: pass ? 0.4 : 0.62,
          dur: Math.min(1.1, 0.25 + q.w / 520),
          delay: i * 0.5 + pass * 0.1,
        });
      }
    });
  } else if (mark === "circle") {
    const cx = all.x + all.w / 2;
    const cy = all.y + all.h / 2;
    const rx = all.w / 2 + 12;
    const ry = all.h / 2 + 7;
    const a0 = -2.3 + r() * 0.4;
    const pts: [number, number][] = [];
    const N = 40;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const a = a0 + t * Math.PI * 2.16;
      // the loop does not close on itself: it drifts out and overshoots
      const grow = 1 + t * 0.12 + (r() - 0.5) * 0.03;
      pts.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow - t * 3]);
    }
    out.push({ d: line(pts), width: 2.4, opacity: 0.9, dur: 0.75, delay: 0 });
  } else if (mark === "underline") {
    rects.forEach((q, i) => {
      for (let pass = 0; pass < 2; pass++) {
        const y = q.y + q.h + 1 + pass * 5;
        const pts: [number, number][] = [];
        const n = Math.max(4, Math.round(q.w / 28));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          pts.push([
            q.x - 2 + t * (q.w + 6) + (pass ? -4 : 0),
            y + Math.sin(t * 3.1) * 1.6 * (pass ? -1 : 1) + (r() - 0.5) * 1.4,
          ]);
        }
        out.push({
          d: line(pts),
          width: 2.2 - pass * 0.4,
          opacity: 0.88,
          dur: 0.32 + q.w / 900,
          delay: i * 0.4 + pass * 0.34,
        });
      }
    });
  } else if (mark === "strike") {
    rects.forEach((q, i) => {
      for (let pass = 0; pass < 2; pass++) {
        const pts: [number, number][] = [];
        for (let k = 0; k <= 4; k++) {
          const t = k / 4;
          pts.push([
            q.x - 4 + t * (q.w + 8),
            q.y + q.h * 0.56 + (pass ? -2 : 1) - t * (pass ? -3 : 3) + (r() - 0.5) * 1.2,
          ]);
        }
        out.push({
          d: line(pts),
          width: 2.3,
          opacity: 0.9,
          dur: 0.22,
          delay: i * 0.3 + pass * 0.24,
        });
      }
    });
  } else if (mark === "box") {
    // a box round each line the phrase sits on
    rects.forEach((q, n) => {
      const x0 = q.x - 7;
      const y0 = q.y - 3;
      const x1 = q.x + q.w + 7;
      const y1 = q.y + q.h + 5;
      const j = () => (r() - 0.5) * 3;
      // four strokes, each overshooting its corner a little, as a quick hand draws them
      const sides: [number, number, number, number][] = [
        [x0 - 4, y0 + j(), x1 + 3, y0 + j() - 1],
        [x1 + j(), y0 - 5, x1 + j() + 1, y1 + 3],
        [x1 + 4, y1 + j(), x0 - 2, y1 + j() + 1],
        [x0 + j(), y1 + 4, x0 + j(), y0 - 2],
      ];
      sides.forEach(([ax, ay, bx, by], i) => {
        const mx = (ax + bx) / 2 + (r() - 0.5) * 3;
        const my = (ay + by) / 2 + (r() - 0.5) * 3;
        out.push({
          d: `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`,
          width: 2.2,
          opacity: 0.9,
          dur: 0.2,
          delay: n * 0.75 + i * 0.17,
        });
      });
    });
  }
  return out;
}

/**
 * A paragraph that someone marks up as you watch. A highlighter sweeps across one phrase, a red pen rings a word
 * and strikes out another, a blue pen underlines twice and a green one boxes off the last phrase, each stroke drawn
 * in at the speed of a hand with the wobble and overshoot of real ink. It starts when the paragraph scrolls into view;
 * Replay draws it again. Marks follow the text when it reflows.
 */
export default function AnnotateText({
  segments = DEFAULT,
  stagger = 0.75,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: AnnotateTextProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  // set on the first press or key inside the card, so its sounds play even where autoplay sound is not allowed
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const [rects, setRects] = useState<Record<number, Rect[]>>({});
  const [run, setRun] = useState(0); // 0 = not yet drawn
  const marks = useMemo(() => segments.map((s, i) => ({ ...s, i })).filter((s) => s.mark), [segments]);

  // measure where each marked phrase sits, line by line
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const next: Record<number, Rect[]> = {};
      marks.forEach((m) => {
        const sp = spans.current[m.i];
        if (!sp) return;
        next[m.i] = Array.from(sp.getClientRects()).map((r) => ({
          x: r.left - base.left,
          y: r.top - base.top,
          w: r.width,
          h: r.height,
        }));
      });
      setRects(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [marks]);

  // draw when it comes into view (or straight away in autoplay)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          setRun((r) => (r === 0 ? 1 : r));
          io.disconnect();
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => setRun((r) => r + 1), 9000);
    return () => window.clearInterval(id);
  }, [autoplay, reduce]);

  // the scratch of each mark, timed to its strokes
  useEffect(() => {
    if (!run || reduce) return;
    const timers: number[] = [];
    marks.forEach((m, k) => {
      const at = 0.35 + k * stagger;
      const type = m.mark as Mark;
      timers.push(
        window.setTimeout(() => {
          if (type === "highlight") sfx.whoosh(1800, 2600, { dur: 0.6, gain: 0.03 });
          else
            sfx.whoosh(3800, 5200, {
              dur: type === "circle" ? 0.6 : 0.3,
              gain: 0.02,
            });
        }, at * 1000),
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const layers = marks.map((m, k) => {
    const rs = rects[m.i];
    if (!rs || !rs.length) return null;
    const mark = m.mark as Mark;
    const color = m.color ?? INK[mark];
    const strokes = strokesFor(mark, rs, (m.i + 1) * 7919);
    const start = 0.35 + k * stagger;
    return { mark, color, strokes, start, k };
  });

  const draw = (under: boolean) =>
    layers.map((l) =>
      !l || (l.mark === "highlight") !== under ? null : (
        <g
          key={`${l.k}-${run}`}
          style={{
            mixBlendMode: l.mark === "highlight" ? "multiply" : "normal",
          }}
          filter={l.mark === "highlight" ? `url(#marker-${uid})` : `url(#ink-${uid})`}
        >
          {l.strokes.map((s, j) => (
            <motion.path
              key={j}
              d={s.d}
              fill="none"
              stroke={l.color}
              strokeWidth={s.width}
              strokeLinecap={l.mark === "highlight" ? "butt" : "round"}
              strokeLinejoin="round"
              initial={{
                pathLength: run && !reduce ? 0 : 1,
                opacity: run && !reduce ? 0 : run ? s.opacity : 0,
              }}
              animate={{ pathLength: 1, opacity: run ? s.opacity : 0 }}
              transition={{
                pathLength: {
                  duration: s.dur,
                  delay: l.start + s.delay,
                  ease: [0.45, 0.05, 0.3, 1],
                },
                opacity: {
                  duration: 0.01,
                  delay: run && !reduce ? l.start + s.delay : 0,
                },
              }}
            />
          ))}
        </g>
      ),
    );

  return (
    <div
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "clamp(24px, 6vw, 56px) 16px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(100%, 640px)",
          background: "#fffdf8",
          borderRadius: 22,
          padding: "clamp(24px, 5vw, 44px)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 50px -30px rgba(60,40,10,0.35)",
        }}
      >
        <div ref={box} style={{ position: "relative" }}>
          <svg
            aria-hidden="true"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            <defs>
              <filter id={`marker-${uid}`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="4000">
                <feTurbulence type="fractalNoise" baseFrequency="0.04 0.6" numOctaves="2" seed="3" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id={`ink-${uid}`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="4000">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            {draw(true)}
          </svg>
          <p
            style={{
              position: "relative",
              margin: 0,
              fontFamily: "'New York', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
              fontSize: "clamp(19px, 2.6vw, 24px)",
              lineHeight: 1.62,
              letterSpacing: "-0.005em",
              color: "#1d1d1f",
            }}
          >
            {segments.map((s, i) =>
              s.mark ? (
                <span
                  key={i}
                  ref={(el) => {
                    spans.current[i] = el;
                  }}
                >
                  {s.text}
                </span>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
          </p>
          <svg
            aria-hidden="true"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {draw(false)}
          </svg>
        </div>
        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setRun((r) => r + 1)}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 14px",
              borderRadius: 16,
              border: 0,
              background: "#f1efe9",
              color: "#1d1d1f",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 256 256" width="13" height="13" aria-hidden="true" style={{ display: "block" }}>
              <path fill="currentColor" d={I.replay} />
            </svg>
            Replay
          </motion.button>
        </div>
      </div>
    </div>
  );
}
