"use client";
/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type VoiceMorphProps = {
  /** what the field says before anyone records */
  placeholder?: string;
  /** a message already in the thread, from the other person */
  incoming?: string;
  /** called with the length and a loudness trace (0 to 1, ten a second) when a voice message is sent */
  onSend?: (seconds: number, levels: number[]) => void;
  maxSeconds?: number;
  /** Soft synthesised sounds, scored to the motion. They also follow the site-wide sound switch. */
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
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
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


// Framework7 Icons (MIT) via Iconify, inlined
const ICON = {
  play: "<path fill=\"currentColor\" d=\"M13.094 47.84c.937 0 1.734-.375 2.672-.914l27.328-15.797c1.945-1.149 2.625-1.899 2.625-3.14c0-1.243-.68-1.993-2.625-3.118L15.766 9.051c-.938-.54-1.735-.89-2.672-.89c-1.735 0-2.813 1.312-2.813 3.35v32.954c0 2.039 1.078 3.375 2.813 3.375\"/>",
  pause: "<path fill=\"currentColor\" d=\"M16.832 47.09h5.32c2.063 0 3.117-1.078 3.117-3.14V12.026c0-2.132-1.054-3.117-3.117-3.117h-5.32c-2.062 0-3.14 1.078-3.14 3.117V43.95c0 2.063 1.078 3.14 3.14 3.14m17.016 0h5.32c2.063 0 3.14-1.078 3.14-3.14V12.026c0-2.132-1.078-3.117-3.14-3.117h-5.32c-2.063 0-3.117 1.078-3.117 3.117V43.95c0 2.063 1.054 3.14 3.117 3.14\"/>",
} as const;

function Icon({ name, className = "" }: { name: keyof typeof ICON; className?: string }) {
  return <svg viewBox="0 0 56 56" aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

type Mode = "idle" | "recording" | "sending";
type Shape = { cx: number; cy: number; w: number; h: number; rot: number; o: number };

// ───────────── five bars are the whole glyph: stacked they are the mic's head, spread they are the waveform,
// and three of them fold into the send arrow ─────────────

const MIC: Shape = { cx: 0, cy: -4.5, w: 9.5, h: 17, rot: 0, o: 1 };
const REC = (i: number): Shape => ({ cx: (i - 2) * 5.6, cy: 0, w: 3.2, h: 5, rot: 0, o: 1 });
const WING = 12;
const TIP = -10;
const ARROW: Shape[] = [
  { cx: 0, cy: 1, w: 3.2, h: 3.2, rot: 0, o: 0 },
  { cx: -(WING / 2) * Math.SQRT1_2, cy: TIP + (WING / 2) * Math.SQRT1_2, w: 3.2, h: WING, rot: 45, o: 1 },
  { cx: 0, cy: 0.5, w: 3.2, h: 21, rot: 0, o: 1 },
  { cx: (WING / 2) * Math.SQRT1_2, cy: TIP + (WING / 2) * Math.SQRT1_2, w: 3.2, h: WING, rot: -45, o: 1 },
  { cx: 0, cy: 1, w: 3.2, h: 3.2, rot: 0, o: 0 },
];
const shapeFor = (mode: Mode, i: number) => (mode === "idle" ? MIC : mode === "recording" ? REC(i) : ARROW[i]!);

/** a rounded bar centred on its origin */
function capsule(w: number, h: number) {
  const r = w / 2, hh = Math.max(h, w) / 2 - r;
  return `M${-r},${-hh} L${-r},${hh} A${r},${r} 0 0 0 ${r},${hh} L${r},${-hh} A${r},${r} 0 0 0 ${-r},${-hh} Z`;
}

function Bar({ shape, level, reduce }: { shape: Shape; level: MotionValue<number> | null; reduce: boolean }) {
  const cx = useMotionValue(shape.cx), cy = useMotionValue(shape.cy), w = useMotionValue(shape.w), h = useMotionValue(shape.h);
  const rot = useMotionValue(shape.rot), o = useMotionValue(shape.o);
  useEffect(() => {
    const s = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 420, damping: 26 } as const);
    animate(cx, shape.cx, s);
    animate(cy, shape.cy, s);
    animate(w, shape.w, s);
    animate(rot, shape.rot, s);
    animate(o, shape.o, reduce ? { duration: 0 } : { duration: 0.18 });
    if (!level) animate(h, shape.h, s);
  }, [shape.cx, shape.cy, shape.w, shape.h, shape.rot, shape.o, level, reduce, cx, cy, w, h, rot, o]);
  // while recording, the height follows the voice
  useEffect(() => {
    if (!level) return;
    return level.on("change", (v) => h.set(h.get() + (v - h.get()) * 0.45));
  }, [level, h]);
  const d = useTransform([w, h] as MotionValue<number>[], ([a, b]) => capsule(a as number, b as number));
  return (
    <motion.g style={{ x: cx, y: cy, rotate: rot, opacity: o }}>
      <motion.path d={d} fill="currentColor" />
    </motion.g>
  );
}

type Sent = { id: number; seconds: number; levels: number[] };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * A voice-message button whose glyph takes itself apart to do the job.
 *
 * Tap the mic and its head splits into five bars that spread into a live waveform while the stand folds away; the
 * button turns red and a timer runs. Tap again and the bars pack themselves into the send arrow: three of them become
 * its shaft and wings, the other two fold away, the button turns blue, and the arrow shoots up out of it as the
 * message lands in the thread. The mic then rises back into place. Escape cancels a recording.
 * The loudness here is simulated, so it needs no microphone; it is decoration over a plain button.
 */
export default function VoiceMorph({
  placeholder = "Message",
  incoming = "Running five minutes late, save me a seat?",
  onSend,
  maxSeconds = 60,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: VoiceMorphProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [mode, setMode] = useState<Mode>("idle");
  const [seconds, setSeconds] = useState(0);
  const [sent, setSent] = useState<Sent[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const fly = useMotionValue(0);
  const startedAt = useRef(0);
  const trace = useRef<number[]>([]);
  const sentId = useRef(0);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  });

  // five levels, one per bar, from a voice-like envelope
  const l0 = useMotionValue(5), l1 = useMotionValue(5), l2 = useMotionValue(5), l3 = useMotionValue(5), l4 = useMotionValue(5);
  const levels = [l0, l1, l2, l3, l4];
  // a red halo breathes with the voice while it records
  const haloOn = useMotionValue(0);
  const haloScale = useTransform([l2, haloOn] as MotionValue<number>[], ([v, o]) => 1 + ((v as number) - 4) / 20 * 0.42 * (o as number));
  const haloOpacity = useTransform([l2, haloOn] as MotionValue<number>[], ([v, o]) => (0.1 + ((v as number) - 4) / 20 * 0.22) * (o as number));
  useEffect(() => {
    animate(haloOn, mode === "recording" && !reduce ? 1 : 0, { duration: 0.3 });
  }, [mode, reduce, haloOn]);
  useEffect(() => {
    if (mode !== "recording") return;
    startedAt.current = performance.now();
    trace.current = [];
    let raf = 0, lastTrace = 0;
    const seed = Math.random() * 100;
    const tick = (now: number) => {
      const t = (now - startedAt.current) / 1000;
      // syllables come and go; each bar sees them a little differently
      const syll = Math.abs(Math.sin(t * 5.2 + seed)) * 0.7 + Math.abs(Math.sin(t * 2.1 + seed * 1.7)) * 0.3;
      const pause = Math.sin(t * 0.8 + seed) > 0.85 ? 0.25 : 1; // the odd breath between phrases
      const env = Math.min(1, 0.22 + 0.78 * syll * pause);
      levels.forEach((lv, i) => {
        const wob = 0.55 + 0.45 * Math.abs(Math.sin(t * (9 + i * 2.7) + i * 1.9 + seed));
        const centre = 1 - Math.abs(i - 2) * 0.14;
        lv.set(reduce ? 9 : 4 + 20 * env * wob * centre);
      });
      if (t - lastTrace >= 0.1) {
        lastTrace = t;
        trace.current.push(Math.min(1, env * (0.7 + 0.3 * Math.random())));
      }
      setSeconds(Math.min(maxSeconds, t));
      if (t >= maxSeconds) void send();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, reduce ? 0 : ms));

  const record = () => {
    if (modeRef.current !== "idle") return;
    setSeconds(0);
    setMode("recording");
    // a rising bloop as the mic splits open
    sfx.note(523, { glide: 784, dur: 0.16, gain: 0.1, bell: 0.2 });
    sfx.note(1175, { at: 0.11, dur: 0.24, gain: 0.07 });
  };
  const cancel = () => {
    if (modeRef.current !== "recording") return;
    setMode("idle");
    sfx.note(784, { glide: 440, dur: 0.22, gain: 0.09, bell: 0.1 });
  };
  const send = async () => {
    if (modeRef.current !== "recording") return;
    const secs = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000));
    const lv = trace.current.length ? trace.current.slice() : [0.4, 0.6, 0.5];
    setMode("sending");
    // the bars snap together into the arrow
    sfx.tick({ freq: 2400 });
    sfx.note(1319, { dur: 0.1, gain: 0.07 });
    await sleep(320);
    // the arrow shoots up out of the button, and the message lands in the thread
    sfx.whoosh(700, 3400, { dur: 0.34, gain: 0.09 });
    if (!reduce) await animate(fly, -34, { duration: 0.24, ease: [0.5, 0, 0.9, 0.4] });
    sfx.note(1760, { at: 0.05, dur: 0.16, gain: 0.08, bell: 0.5 });
    sfx.note(2637, { at: 0.13, dur: 0.32, gain: 0.06, bell: 0.5 });
    const id = ++sentId.current;
    setSent((s) => [...s.slice(-1), { id, seconds: secs, levels: lv }]);
    onSend?.(secs, lv);
    fly.jump(30);
    setMode("idle");
    if (!reduce) await animate(fly, 0, { type: "spring", stiffness: 300, damping: 22 });
    else fly.set(0);
  };

  const onTap = () => {
    touched.current = true;
    if (mode === "idle") record();
    else if (mode === "recording") void send();
  };

  // autoplay: record a few seconds, send, and again, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    (async () => {
      await sleep(1100);
      while (ok()) {
        record();
        await sleep(2800 + Math.random() * 1200);
        if (!ok()) return;
        await send();
        await sleep(2600);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, inView]);

  const bg = mode === "idle" ? "#e8e8ed" : mode === "recording" ? "#ff3b30" : "#0071e3";
  const fg = mode === "idle" ? "#1d1d1f" : "#ffffff";
  const label = mode === "idle" ? "Record a voice message" : mode === "recording" ? `Recording, ${fmt(seconds)}. Send voice message` : "Sending";

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => {
  touched.current = true;
}}
      onKeyDown={(e) => {
        touched.current = true;
        if (e.key === "Escape") cancel();
      }}
      className={`flex w-full max-w-[380px] flex-col rounded-[24px] bg-white p-3 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      {/* the thread */}
      <div className="flex min-h-[188px] flex-col justify-end gap-2 px-1 pb-3 pt-2" aria-live="polite">
        <p className="m-0 max-w-[78%] self-start rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 py-2 text-[15px] leading-[1.35]">{incoming}</p>
        <AnimatePresence initial={false} mode="popLayout">
          {sent.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 66, x: 6, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{ originX: 1, originY: 1 }}
              className="self-end"
            >
              <Bubble
                msg={m}
                playing={playing === m.id}
                onPlay={() => {
                  sfx.tick({ freq: 2800, gain: 0.07 });
                  setPlaying((p) => (p === m.id ? null : m.id));
                }}
                onEnd={() => setPlaying(null)}
                reduce={reduce}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* the composer */}
      <div className="flex h-[54px] items-center gap-2 rounded-full bg-[#f5f5f7] pl-4 pr-[5px]">
        <div className="relative min-w-0 flex-1 overflow-hidden text-[15px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === "idle" ? (
              <motion.span key="ph" className="block text-[#86868b]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {placeholder}
              </motion.span>
            ) : (
              <motion.span key="rec" className="flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <motion.span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-[#ff3b30]"
                  animate={reduce || mode !== "recording" ? { opacity: 1 } : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
                <Rolling text={fmt(seconds)} still={!!reduce} />
                <span className="truncate text-[13px] text-[#6e6e73]">{mode === "recording" ? (<>Tap to send<span className="hidden sm:inline">, Esc to cancel</span></>) : "Sending"}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative shrink-0">
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[#ff3b30]" style={{ scale: haloScale, opacity: haloOpacity }} />
        <motion.button
          type="button"
          onClick={onTap}
          aria-label={label}
          disabled={mode === "sending"}
          className="relative grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2"
          initial={false}
          animate={{ backgroundColor: bg, color: fg }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.22 }}
        >
          <svg viewBox="-16 -16 32 32" className="h-[30px] w-[30px] overflow-visible" aria-hidden="true">
            <defs>
              <clipPath id={`btn-${uid}`}>
                <circle r={22} />
              </clipPath>
            </defs>
            <g clipPath={`url(#btn-${uid})`}>
              <motion.g style={{ y: fly }}>
                {/* the mic's stand, stem and foot, which fold away when the head splits */}
                <motion.g
                  initial={false}
                  animate={mode === "idle" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 28 }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                >
                  <path d="M-8.5,-3 A8.5,8.5 0 0 0 8.5,-3" />
                  <path d="M0,5.5 V10 M-5,10 H5" />
                </motion.g>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Bar key={i} shape={shapeFor(mode, i)} level={mode === "recording" ? levels[i]! : null} reduce={reduce} />
                ))}
              </motion.g>
            </g>
          </svg>
        </motion.button>
        </div>
      </div>
    </div>
  );
}

/** the timer, each digit rolling up as it changes */
function Rolling({ text, still }: { text: string; still: boolean }) {
  if (still) return <span className="font-medium tabular-nums" aria-hidden="true">{text}</span>;
  return (
    <span className="inline-flex font-medium tabular-nums" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden text-center" style={{ width: ch === ":" ? "0.32em" : "0.62em" }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              className="inline-block"
              initial={{ y: "90%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-90%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 34 }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/** a sent voice message: play it and a playhead runs along its waveform */
function Bubble({ msg, playing, onPlay, onEnd, reduce }: { msg: Sent; playing: boolean; onPlay: () => void; onEnd: () => void; reduce: boolean }) {
  const n = 26;
  const bars = Array.from({ length: n }, (_, i) => {
    const j = Math.floor((i / n) * msg.levels.length);
    return msg.levels[j] ?? 0.3;
  });
  const head = useMotionValue(0);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });
  useEffect(() => {
    if (!playing) {
      head.set(0);
      return;
    }
    const c = animate(head, 1, { duration: reduce ? 0 : msg.seconds, ease: "linear", onComplete: () => endRef.current() });
    return () => c.stop();
  }, [playing, msg.seconds, head, reduce]);
  const clip = useTransform(head, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  return (
    <div className="flex items-center gap-2.5 rounded-[18px] rounded-br-[6px] bg-[#0071e3] py-2 pl-2 pr-3.5 text-white">
      <button
        type="button"
        onClick={onPlay}
        aria-label={playing ? "Pause voice message" : `Play voice message, ${fmt(msg.seconds)}`}
        className="grid h-7 w-7 place-items-center rounded-full bg-white/20 outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Icon name={playing ? "pause" : "play"} className="h-3.5 w-3.5" />
      </button>
      <div className="relative h-[22px]" aria-hidden="true">
        <Wave bars={bars} className="text-white/45" />
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <Wave bars={bars} className="text-white" />
        </motion.div>
      </div>
      <span className="text-[13px] font-medium tabular-nums">{fmt(msg.seconds)}</span>
    </div>
  );
}

function Wave({ bars, className }: { bars: number[]; className: string }) {
  return (
    <svg viewBox={`0 0 ${bars.length * 4} 22`} className={`h-[22px] ${className}`} style={{ width: bars.length * 4 }}>
      {bars.map((v, i) => {
        const h = 3 + v * 17;
        return <rect key={i} x={i * 4} y={11 - h / 2} width={2.2} height={h} rx={1.1} fill="currentColor" />;
      })}
    </svg>
  );
}
