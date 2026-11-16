"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  type PanInfo,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ToastKind = "success" | "error" | "upload" | "undo";
export type TimedToastStackProps = {
  /** how long a toast stays, ms (paused while you hover the stack) */
  duration?: number;
  /** Soft sounds: a pop as each arrives. They also follow the site-wide sound switch. */
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
  ok: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  err: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-8 56a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm8 104a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  trash:
    "M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16M112 168a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm0-120H96v-8a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8Z",
  up: "M247.93 124.52C246.11 77.54 207.07 40 160.06 40a88.1 88.1 0 0 0-78.77 48.67A87.5 87.5 0 0 0 72 127.73a8.18 8.18 0 0 1-7.43 8.27a8 8 0 0 1-8.57-8a103.7 103.7 0 0 1 5.34-32.92a4 4 0 0 0-4.75-5.18A64.09 64.09 0 0 0 8 152c0 35.19 29.75 64 65 64h87a88.09 88.09 0 0 0 87.93-91.48m-50.27 9.14a8 8 0 0 1-11.32 0L168 115.31V176a8 8 0 0 1-16 0v-60.69l-18.34 18.35a8 8 0 0 1-11.32-11.32l32-32a8 8 0 0 1 11.32 0l32 32a8 8 0 0 1 0 11.32",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  undo: "M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

type T = {
  id: number;
  kind: ToastKind;
  title: string;
  body: string;
  phase: "busy" | "done";
  out?: number;
};
const H = 64,
  GAP = 10;
const PRESETS: Record<ToastKind, Omit<T, "id" | "phase">> = {
  success: {
    kind: "success",
    title: "Changes saved",
    body: "Your profile is up to date.",
  },
  error: {
    kind: "error",
    title: "Couldn't reach the server",
    body: "We'll try again in a moment.",
  },
  upload: {
    kind: "upload",
    title: "Uploading 3 photos",
    body: "Keep this tab open.",
  },
  undo: {
    kind: "undo",
    title: "Message deleted",
    body: "It's in the bin for 30 days.",
  },
};

/**
 * Toasts that stack like cards.
 *
 * New ones rise in at the front and push the others back into a neat stack, each one smaller and dimmer than the one
 * before. Point at the stack and it fans out so you can read them all, and their timers pause. Each toast's time left
 * runs round its edge as a thin line. Swipe one away (it flies off with your speed and a little spin) or let it run
 * out. An upload toast spins and then turns into a done toast in place; an error shakes as it arrives; a delete toast
 * has Undo, which takes it back.
 *   <TimedToastStack duration={5000} />
 */
export default function TimedToastStack({
  duration = 5000,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: TimedToastStackProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [list, setList] = useState<T[]>([]);
  const [fan, setFan] = useState(false);
  const nextId = useRef(1);

  const push = (kind: ToastKind, extra?: Partial<T>) => {
    const t: T = {
      ...PRESETS[kind],
      phase: kind === "upload" ? "busy" : "done",
      id: nextId.current++,
      ...extra,
    };
    setList((l) => [t, ...l].slice(0, 6));
    sfx.note(kind === "error" ? 330 : 740, {
      glide: kind === "error" ? 260 : 990,
      dur: 0.12,
      gain: 0.04,
      bell: 0.2,
    });
    if (kind === "upload")
      window.setTimeout(() => {
        setList((l) =>
          l.map((x) =>
            x.id === t.id
              ? {
                  ...x,
                  phase: "done",
                  title: "3 photos uploaded",
                  body: "They're in your library now.",
                }
              : x,
          ),
        );
        sfx.note(988, { dur: 0.3, gain: 0.03, bell: 0.6 });
      }, 2200);
  };
  // when one is thrown out, the rest wait a beat before closing the gap, so the leaving card isn't run over
  const thrownAt = useRef(0);
  const drop = (id: number, out = 0) => {
    if (out) thrownAt.current = performance.now();
    setList((l) => l.map((x) => (x.id === id ? { ...x, out } : x)));
    // let the exit read its direction, then remove
    window.setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 16);
  };
  const undo = (id: number) => {
    drop(id);
    window.setTimeout(
      () =>
        push("success", {
          title: "Message restored",
          body: "It's back in your inbox.",
        }),
      120,
    );
  };

  // autoplay: a little afternoon of notifications
  useEffect(() => {
    if (!autoplay || !inView) return;
    const seq: ToastKind[] = ["success", "upload", "undo", "error", "success"];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      push(seq[k++ % seq.length]);
    }, 1700);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`relative w-full max-w-[460px] overflow-hidden rounded-[28px] text-[#1d1d1f] ${className}`}
      style={{
        height: 420,
        background: "linear-gradient(180deg, #ffffff 0%, #f2f2f6 100%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 30px 60px -40px rgba(0,0,0,.35)",
      }}
    >
      <div className="p-5">
        <div className="text-[17px] font-semibold tracking-[-0.01em]">Notifications</div>
        <div className="mt-1 text-[13px] text-[#86868b]">
          Make some toast. Point at the stack to fan it out; swipe one away.
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["success", "Save", "#30d158"],
              ["upload", "Upload", "#0a84ff"],
              ["undo", "Delete", "#8e8e93"],
              ["error", "Fail", "#ff453a"],
            ] as const
          ).map(([k, l, c]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                touched.current = true;
                unlockAudio();
                push(k);
              }}
              className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium outline-none shadow-[0_0_0_1px_rgba(0,0,0,.08),0_2px_6px_-3px_rgba(0,0,0,.2)] transition active:scale-95 focus-visible:shadow-[0_0_0_2px_#0071e3]"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: c }} />
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* the stack */}
      <ol
        aria-label="Notifications"
        className="absolute inset-x-4 bottom-4"
        style={{ height: fan ? Math.min(list.length, 4) * (H + GAP) : H + 24 }}
        onPointerEnter={() => setFan(true)}
        onPointerLeave={() => setFan(false)}
        onFocusCapture={() => setFan(true)}
        onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFan(false)}
      >
        <AnimatePresence initial={false}>
          {list.map((t, i) => (
            <Toast
              key={t.id}
              t={t}
              i={i}
              fan={fan}
              count={list.length}
              duration={duration}
              reduce={reduce}
              onDrop={drop}
              onUndo={undo}
              sfx={sfx}
              late={performance.now() - thrownAt.current < 80}
            />
          ))}
        </AnimatePresence>
      </ol>
      <div className="sr-only" aria-live="polite">
        {list[0] ? `${list[0].title}. ${list[0].body}` : ""}
      </div>
    </div>
  );
}

function Toast({
  t,
  i,
  fan,
  count,
  duration,
  reduce,
  onDrop,
  onUndo,
  sfx,
  late,
}: {
  late: boolean;
  t: T;
  i: number;
  fan: boolean;
  count: number;
  duration: number;
  reduce: boolean;
  onDrop: (id: number, out?: number) => void;
  onUndo: (id: number) => void;
  sfx: Sound;
}) {
  // the time left runs round the edge; it waits while the stack is fanned out, and until an upload is done
  const left = useMotionValue(1);
  const paused = fan || t.phase === "busy";
  useEffect(() => {
    if (paused || reduce) return;
    const a = animate(left, 0, {
      duration: (left.get() * duration) / 1000,
      ease: "linear",
    });
    a.then(() => left.get() <= 0.001 && onDrop(t.id, 0));
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reduce]);
  const dash = useMotionValue(0);
  useEffect(() => left.on("change", (v) => dash.set(1 - v)), [left, dash]);

  const tone =
    t.kind === "error" ? "#ff453a" : t.kind === "undo" ? "#8e8e93" : t.phase === "busy" ? "#0a84ff" : "#30d158";
  // stacked: smaller, dimmer and tucked behind; fanned: in a column
  const target = fan
    ? { y: -i * (H + GAP), scale: 1, opacity: 1 }
    : { y: -i * 12, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 - i * 0.18 };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 90 || info.velocity.x > 600) {
      sfx.whoosh(900, 300, { dur: 0.25, gain: 0.03 });
      onDrop(t.id, Math.max(info.velocity.x, 900));
    }
  };
  return (
    <motion.li
      layout={false}
      role="status"
      initial={reduce ? { opacity: 0 } : { y: 60, scale: 0.9, opacity: 0, x: t.kind === "error" ? 0 : 0 }}
      animate={{
        ...target,
        x: 0,
        zIndex: count - i,
        ...(t.kind === "error" && i === 0 && !reduce ? { x: [0, -8, 7, -5, 3, 0] } : {}),
      }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.2 } }
          : t.out === -1
            ? // the close button: a small pull back, then it glides off to the right, gathering speed, tilting a touch
              // and fading as it goes, while the cards behind rise to take its place
              {
                x: [0, -8, 470],
                rotate: [0, -0.6, 4],
                scale: [1, 1.01, 0.96],
                opacity: [1, 1, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(1.5px)"],
                transition: {
                  duration: 0.5,
                  times: [0, 0.16, 1],
                  ease: ["easeOut", [0.45, 0, 0.25, 1]],
                },
              }
            : t.out
              ? // swiped: it keeps the speed your finger gave it; only its travel is a spring, so nothing jumps
                {
                  x: 480,
                  rotate: 7,
                  opacity: 0,
                  transition: {
                    x: {
                      type: "spring",
                      stiffness: 170,
                      damping: 26,
                      velocity: t.out,
                    },
                    rotate: { duration: 0.5, ease: "easeOut" },
                    opacity: { duration: 0.42, delay: 0.06, ease: "easeIn" },
                  },
                }
              : // timed out: it sinks into the stack and fades
                {
                  y: target.y + 20,
                  scale: 0.9,
                  opacity: 0,
                  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                }
      }
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 32,
        delay: late ? 0.17 : 0,
        x: { duration: 0.45 },
      }}
      drag={i === 0 || fan ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.08, right: 0.9 }}
      onDragEnd={onDragEnd}
      className="absolute inset-x-0 bottom-0 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ height: H, transformOrigin: "50% 100%" }}
    >
      <div
        className="relative h-full overflow-hidden rounded-[18px] text-white"
        style={{
          background: "linear-gradient(180deg, rgba(44,44,48,.96), rgba(28,28,31,.96))",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.06) inset, 0 1px 0 rgba(255,255,255,.08) inset, 0 16px 32px -14px rgba(0,0,0,.55)",
        }}
      >
        {/* the time left, round the edge */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <motion.rect
            x="0.75"
            y="0.75"
            rx="17.25"
            ry="17.25"
            fill="none"
            stroke={tone}
            strokeOpacity={0.75}
            strokeWidth={1.5}
            pathLength={1}
            strokeDasharray="1 1"
            style={{
              width: "calc(100% - 1.5px)",
              height: "calc(100% - 1.5px)",
              strokeDashoffset: dash,
            }}
          />
        </svg>
        {/* a card tucked behind shows only its edge; its words come back when the stack fans out */}
        <motion.div
          className="relative flex h-full items-center gap-3 pl-3.5 pr-2"
          initial={false}
          animate={{ opacity: fan || i === 0 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ background: `${tone}26`, color: tone }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {t.phase === "busy" ? (
                <motion.span
                  key="busy"
                  className="block h-[18px] w-[18px] rounded-full border-2 border-[#0a84ff]/30 border-t-[#0a84ff]"
                  animate={reduce ? undefined : { rotate: 360 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                />
              ) : (
                <motion.span
                  key="icon"
                  initial={{ scale: 0.3, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 18 }}
                >
                  <Ico
                    d={t.kind === "error" ? I.err : t.kind === "undo" ? I.trash : t.kind === "upload" ? I.ok : I.ok}
                    size={18}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <div className="relative min-w-0 flex-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="truncate text-[14px] font-semibold">{t.title}</div>
                <div className="truncate text-[12.5px] text-white/60">{t.body}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          {t.kind === "undo" && (
            <button
              type="button"
              onClick={() => onUndo(t.id)}
              className="relative flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold outline-none transition hover:bg-white/15 focus-visible:shadow-[0_0_0_2px_#0a84ff]"
            >
              <Ico d={I.undo} size={12} />
              Undo
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              sfx.whoosh(700, 260, { dur: 0.4, gain: 0.03 });
              onDrop(t.id, -1);
            }}
            className="relative grid h-7 w-7 place-items-center rounded-full text-white/50 outline-none transition hover:bg-white/10 hover:text-white focus-visible:shadow-[0_0_0_2px_#0a84ff]"
          >
            <Ico d={I.x} size={12} />
          </button>
        </motion.div>
      </div>
    </motion.li>
  );
}
