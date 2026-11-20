"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import {
  type CSSProperties,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DaysSliderProps = {
  min?: number;
  max?: number;
  value?: number;
  unit?: [string, string];
  title?: string;
  note?: (v: number) => string;
  onChange?: (v: number) => void;
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

const MIN_W = 132;
const H = 64;
const SPRING = { type: "spring", stiffness: 420, damping: 24 } as const;
const R = H / 2;

/** the capsule as a drop of liquid: the leading end stretches with speed and the long edges ripple */
function blobPath(w: number, lean: number, ripple: number, phase: number) {
  const len = Math.max(w, H * 0.9);
  const cx = len - R;
  const rx = R * Math.max(0.62, 1 + 0.6 * lean);
  const ry = R * (1 - 0.1 * Math.min(1, Math.abs(lean)));
  const straight = Math.max(0, cx - R);
  const edge = (x: number, sign: number) => {
    const u = straight > 0 ? (x - R) / straight : 0;
    const env = Math.sin(Math.PI * Math.min(1, Math.max(0, u))); // calm at both caps
    const wave = ripple * env * Math.sin(x * 0.045 - phase + (sign > 0 ? 0 : 1.3));
    // a soft neck just behind the leading end when it is pulled forward
    const neck = Math.max(0, lean) * 5 * Math.exp(-(((x - (cx - R * 0.9)) / (R * 0.9)) ** 2));
    const squash = (R - ry) * Math.min(1, Math.max(0, u * 1.6 - 0.6));
    return R - sign * (R - neck - squash) + wave;
  };
  let d = `M${R} ${H}`;
  for (let a = 1; a <= 14; a++) {
    const ph = (a / 14) * Math.PI;
    d += `L${(R - R * Math.sin(ph)).toFixed(2)} ${(R + R * Math.cos(ph)).toFixed(2)}`;
  }
  const n = Math.max(2, Math.ceil(straight / 8));
  for (let i = 1; i <= n; i++) {
    const x = R + (straight * i) / n;
    d += `L${x.toFixed(2)} ${edge(x, 1).toFixed(2)}`;
  }
  for (let a = 1; a <= 16; a++) {
    const th = -Math.PI / 2 + (a / 16) * Math.PI;
    d += `L${(cx + rx * Math.cos(th)).toFixed(2)} ${(R + ry * Math.sin(th)).toFixed(2)}`;
  }
  for (let i = n - 1; i >= 0; i--) {
    const x = R + (straight * i) / n;
    d += `L${x.toFixed(2)} ${edge(x, -1).toFixed(2)}`;
  }
  return d + "Z";
}
const defNote = (v: number) =>
  v === 1 ? "Deleted files are removed for good after a day." : `Deleted files are removed for good after ${v} days.`;

/**
 * A slider whose fill carries its own value. The dark capsule never gets smaller than its label, so the number is
 * always readable; drag it and the count rolls over as it passes each step, then the capsule settles onto the
 * nearest one with a little spring. Pull it past either end and it gives a bit before snapping back. Works with
 * the arrow keys, Home and End.
 */
export default function DaysSlider({
  min = 1,
  max = 7,
  value: valueProp = 2,
  unit = ["day", "days"],
  title = "Keep deleted files for",
  note = defNote,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DaysSliderProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const track = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(340);
  const [value, setValue] = useState(valueProp);
  const [dir, setDir] = useState(1);
  const [drag, setDrag] = useState(false);
  const width = useMotionValue(MIN_W);
  const endFade = useTransform(width, (w) => Math.max(0, Math.min(1, (W - 40 - w) / 90)));
  const gid = useId().replace(/:/g, "");
  const blob = useRef<SVGPathElement>(null);
  const gloss = useRef<SVGPathElement>(null);
  const touched = useRef(false);
  const valRef = useRef(value);
  valRef.current = value;
  const span = max - min;

  const widthFor = (v: number, w = W) => MIN_W + ((v - min) / span) * (w - MIN_W);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setW(w);
      width.set(MIN_W + ((valRef.current - min) / span) * (w - MIN_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // liquid: follow the capsule's speed with an underdamped spring so it leans, then wobbles as it settles
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let prevW = width.get();
    let lean = 0;
    let leanV = 0;
    let rip = 0;
    let phase = 0;
    let vS = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      const w = width.get();
      const v = (w - prevW) / dt;
      prevW = w;
      vS += (v - vS) * Math.min(1, dt * 18);
      if (!reduce) {
        const target = Math.max(-0.75, Math.min(0.75, vS / 1300));
        const acc = 260 * (target - lean) - 9 * leanV;
        leanV += acc * dt;
        lean += leanV * dt;
        rip += (Math.min(1.5, Math.abs(vS) / 700) - rip) * Math.min(1, dt * (Math.abs(vS) > 40 ? 10 : 2.2));
        phase += dt * (4 + Math.min(8, Math.abs(vS) / 120)) * (vS >= 0 ? 1 : -1);
      }
      const d = blobPath(w, lean, rip, phase);
      blob.current?.setAttribute("d", d);
      gloss.current?.setAttribute("d", d);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [width, reduce]);

  const commit = (v: number, settle = true) => {
    const c = Math.max(min, Math.min(max, Math.round(v)));
    if (c !== valRef.current) {
      setDir(c > valRef.current ? 1 : -1);
      setValue(c);
      onChange?.(c);
      sfx.tick({ freq: 1800 + (c - min) * 120, gain: 0.025 });
    }
    if (settle) animate(width, widthFor(c), reduce ? { duration: 0 } : SPRING);
  };
  useEffect(() => commit(valueProp), [valueProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const x = clientX - r.left;
    // rubber band past the ends
    let w = x;
    if (x > W) w = W + (x - W) * 0.12;
    if (x < MIN_W) w = MIN_W - (MIN_W - x) * 0.12;
    width.set(Math.max(MIN_W - 14, Math.min(W + 14, w)));
    const t = (Math.max(MIN_W, Math.min(W, x)) - MIN_W) / (W - MIN_W);
    commit(min + t * span, false);
  };

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag(true);
    fromPointer(e.clientX);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => drag && fromPointer(e.clientX);
  const up = () => {
    if (!drag) return;
    setDrag(false);
    commit(valRef.current);
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      const seq = [5, max, 3, min + 1];
      let i = 0;
      while (ok()) {
        await wait(1500);
        if (!ok()) break;
        const target = seq[i % seq.length];
        const from = valRef.current;
        const steps = Math.abs(target - from);
        for (let s = 1; s <= steps && ok(); s++) {
          commit(from + Math.sign(target - from) * s);
          await wait(140);
        }
        i++;
      }
    })().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const label = (v: number) => (v === 1 ? unit[0] : unit[1]);
  const digits = useMemo(() => String(value), [value]);
  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const txt: CSSProperties = {
    fontSize: 20,
    fontWeight: 650,
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  };

  return (
    <div className={`w-full ${className}`} style={{ maxWidth: 440, fontFamily: font }}>
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          padding: "24px 24px 22px",
          color: "#1d1d1f",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
        <div
          ref={track}
          role="slider"
          tabIndex={0}
          aria-label={title}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${label(value)}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={(e) => {
            const k: Record<string, number> = {
              ArrowRight: 1,
              ArrowUp: 1,
              ArrowLeft: -1,
              ArrowDown: -1,
            };
            touched.current = true;
            if (k[e.key]) {
              e.preventDefault();
              commit(valRef.current + k[e.key]);
            } else if (e.key === "Home") {
              e.preventDefault();
              commit(min);
            } else if (e.key === "End") {
              e.preventDefault();
              commit(max);
            }
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
          style={{
            position: "relative",
            height: H,
            borderRadius: 999,
            background: "#f2f2f4",
            marginTop: 16,
            cursor: drag ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <motion.span
            aria-hidden
            style={{
              ...txt,
              opacity: endFade,
              position: "absolute",
              right: 24,
              top: 0,
              height: H,
              display: "flex",
              alignItems: "center",
              color: "#aeaeb2",
            }}
          >
            {max} {label(max)}
          </motion.span>
          <svg
            aria-hidden
            width="100%"
            height={H}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            <defs>
              <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
                <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
                <stop offset="1" stopColor="#fff" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <path ref={blob} fill="#1d1d1f" style={{ filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.26))" }} />
            <path ref={gloss} fill={`url(#${gid}-g)`} />
          </svg>
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: H,
              width,
              display: "flex",
              alignItems: "center",
              padding: "0 18px 0 24px",
              color: "#fff",
              overflow: "hidden",
              borderRadius: 999,
            }}
          >
            <span className="tabular-nums" style={{ ...txt, display: "inline-flex", alignItems: "center" }}>
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  height: 26,
                  overflow: "hidden",
                }}
              >
                <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                  <motion.span
                    key={digits}
                    custom={dir}
                    variants={{
                      in: (d: number) => ({
                        y: d * 18,
                        opacity: 0,
                        filter: "blur(4px)",
                      }),
                      on: { y: 0, opacity: 1, filter: "blur(0px)" },
                      out: (d: number) => ({
                        y: d * -18,
                        opacity: 0,
                        filter: "blur(4px)",
                      }),
                    }}
                    initial="in"
                    animate="on"
                    exit="out"
                    transition={{
                      type: "spring",
                      stiffness: 600,
                      damping: 36,
                      filter: { type: "tween", duration: 0.18 },
                      opacity: { duration: 0.15 },
                    }}
                    style={{ display: "inline-block", lineHeight: "26px" }}
                  >
                    {digits}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span style={{ marginLeft: 6 }}>{label(value)}</span>
            </span>
            <span style={{ flex: 1 }} />
            <motion.span
              animate={{ opacity: drag ? 0.95 : 0.55, height: drag ? 26 : 20 }}
              style={{
                width: 4,
                borderRadius: 4,
                background: "#fff",
                flex: "none",
              }}
            />
          </motion.div>
        </div>
        <div
          aria-live="polite"
          style={{
            height: 20,
            marginTop: 14,
            position: "relative",
            fontSize: 13,
            color: "#6e6e73",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {note(value)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
