# Voice Morph

Add the "Voice Morph" component from Nexus UI to my project.

A voice-message button whose glyph takes itself apart to do the job. Tap the mic and its head splits into five bars that spread into a live waveform while the stand folds away; the button turns red and a timer runs. Tap again and the bars pack themselves into the send arrow: three become its shaft and wings, the other two fold away, the button turns blue and the arrow shoots up out of it as the message lands in the thread. Then the mic rises back into place. Escape cancels a recording. The loudness is simulated, so it needs no microphone; it is decoration over a plain button.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { VoiceMorph } from "@/components/voice-morph";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/voice-morph/index.ts ---

```ts
export { default as VoiceMorph } from "./voice-morph";
export type { VoiceMorphProps } from "./voice-morph";
```

--- components/voice-morph/voice-morph.tsx ---

```tsx
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
