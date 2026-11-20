"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type KnownHandle = {
  handle: string;
  address: string;
  name: string;
  face: string;
};
export type AddressFieldProps = {
  /** handles the field can resolve; anything else ending in .pay is reported as not found */
  directory?: KnownHandle[];
  /** shown under the field and used by Paste */
  recent?: string[];
  onContinue?: (r: { handle: string; address: string }) => void;
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
  scan: "M228 40v40a12 12 0 0 1-24 0V52h-28a12 12 0 0 1 0-24h40a12 12 0 0 1 12 12M80 204H52v-28a12 12 0 0 0-24 0v40a12 12 0 0 0 12 12h40a12 12 0 0 0 0-24m136-40a12 12 0 0 0-12 12v28h-28a12 12 0 0 0 0 24h40a12 12 0 0 0 12-12v-40a12 12 0 0 0-12-12M40 92a12 12 0 0 0 12-12V52h28a12 12 0 0 0 0-24H40a12 12 0 0 0-12 12v40a12 12 0 0 0 12 12m44-20h88a12 12 0 0 1 12 12v88a12 12 0 0 1-12 12H84a12 12 0 0 1-12-12V84a12 12 0 0 1 12-12m12 88h64V96H96Z",
  paste:
    "M168 152a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-8-40H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16m56-64v168a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h36.26a47.92 47.92 0 0 1 71.48 0H200a16 16 0 0 1 16 16M96 64h64a32 32 0 0 0-64 0m104-16h-26.75A47.9 47.9 0 0 1 176 64v8a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8v-8a47.9 47.9 0 0 1 2.75-16H56v168h144Z",
  spin: "M236 128a108 108 0 0 1-216 0c0-42.52 24.73-81.34 63-98.9a12 12 0 1 1 10 21.81C63.24 64.57 44 94.83 44 128a84 84 0 0 0 168 0c0-33.17-19.24-63.43-49-77.09a12 12 0 1 1 10-21.81c38.27 17.56 63 56.38 63 98.9",
  ok: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  clear:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m37.66 130.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32L139.31 128Z",
  warn: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-8 56a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm8 104a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const DIR: KnownHandle[] = [
  {
    handle: "mira.pay",
    address: "8xQ4mT9vLr2kWc5nHs7pYd3eFa6bJu1zN4gR2MMy",
    name: "Mira Okafor",
    face: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
  },
  {
    handle: "jonas.pay",
    address: "5Ht2pQw8sXk3LmN6vB9cR4dY7eZa1fG2hJ8uK3Lq",
    name: "Jonas Weber",
    face: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
  },
  {
    handle: "ana.pay",
    address: "3Kd9wE2rT5yU8iO1pA4sD7fG0hJ3kL6zX9cV2Bn5",
    name: "Ana Ruiz",
    face: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
  },
];

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;
type Phase = "empty" | "typing" | "resolving" | "found" | "missing";

/**
 * A recipient field that checks what you type. Enter a handle and the hint under the field turns into a small
 * spinner while it looks it up, then into the wallet address it found with a green tick, and Continue wakes up.
 * A handle that doesn't exist says so in place. Paste fills the last address you used, and the recent list
 * below fills the field with a tap.
 */
export default function AddressField({
  directory = DIR,
  recent = ["mira.pay", "jonas.pay"],
  onContinue,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: AddressFieldProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("empty");
  const [sent, setSent] = useState(false);
  const touched = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const byHandle = useMemo(() => new Map(directory.map((d) => [d.handle, d])), [directory]);
  const match = byHandle.get(value.trim().toLowerCase());

  const evaluate = (v: string) => {
    clearTimeout(timer.current);
    setSent(false);
    const t = v.trim().toLowerCase();
    if (!t) return setPhase("empty");
    if (!/^[a-z0-9_]+\.pay$/.test(t)) return setPhase("typing");
    setPhase("resolving");
    timer.current = setTimeout(() => {
      if (byHandle.has(t)) {
        setPhase("found");
        sfx.note(1318, { dur: 0.12, gain: 0.03 });
      } else {
        setPhase("missing");
        sfx.note(330, { dur: 0.14, gain: 0.03, type: "triangle" });
      }
    }, 850);
  };
  const set = (v: string) => {
    setValue(v);
    evaluate(v);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const fill = async (v: string, alive: () => boolean = () => true) => {
    setValue("");
    for (let i = 1; i <= v.length; i++) {
      if (!alive()) return;
      await new Promise((r) => setTimeout(r, 55));
      sfx.tick({ freq: 2600, gain: 0.012 });
      setValue(v.slice(0, i));
      evaluate(v.slice(0, i));
    }
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await wait(900);
        await fill("mir", ok);
        await wait(500);
        if (!ok()) break;
        let cur = "mir";
        for (const c of "a.pay") {
          if (!ok()) break;
          await wait(110);
          cur += c;
          sfx.tick({ freq: 2600, gain: 0.012 });
          set(cur);
        }
        await wait(2600);
        if (!ok()) break;
        set("");
        await wait(800);
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

  const ready = phase === "found" && !!match;
  const hint =
    phase === "resolving"
      ? {
          k: "r",
          color: "#0071e3",
          icon: I.spin,
          spin: true,
          text: "Looking up",
        }
      : phase === "found" && match
        ? {
            k: "f-" + match.handle,
            color: "#1f9d55",
            icon: I.ok,
            spin: false,
            text: `${match.name}, ${short(match.address)}`,
          }
        : phase === "missing"
          ? {
              k: "m",
              color: "#d70015",
              icon: I.warn,
              spin: false,
              text: `No wallet uses ${value.trim().toLowerCase()}`,
            }
          : {
              k: "e",
              color: "#86868b",
              icon: "",
              spin: false,
              text: "Enter a wallet address or a .pay handle",
            };

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const pill: CSSProperties = {
    height: 38,
    borderRadius: 999,
    border: 0,
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 420, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          padding: "20px 18px 18px",
          color: "#1d1d1f",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: 30,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>Choose recipient</span>
          <button
            type="button"
            aria-label="Scan a code"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              position: "absolute",
              right: 2,
              width: 30,
              height: 30,
              borderRadius: 10,
              border: 0,
              background: "transparent",
              color: "#1d1d1f",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.scan} size={20} />
          </button>
        </div>

        <motion.div
          animate={{
            boxShadow:
              phase === "missing"
                ? "0 0 0 1.5px rgba(215,0,21,0.35), 0 10px 30px -18px rgba(0,0,0,0.25)"
                : "0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px -18px rgba(0,0,0,0.25)",
          }}
          style={{
            marginTop: 16,
            borderRadius: 22,
            background: "#fff",
            padding: "14px 14px 14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor={`${uid}-in`} className="sr-only">
              Address or handle
            </label>
            <input
              id={`${uid}-in`}
              ref={input}
              value={value}
              onChange={(e) => set(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ready && match) {
                  setSent(true);
                  onContinue?.({
                    handle: match.handle,
                    address: match.address,
                  });
                }
              }}
              placeholder="Address or handle"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={`${uid}-hint`}
              style={{
                flex: 1,
                minWidth: 0,
                border: 0,
                outline: "none",
                background: "transparent",
                fontSize: 17,
                fontWeight: 500,
                color: "#1d1d1f",
                fontFamily: font,
                letterSpacing: "-0.01em",
                caretColor: "#0071e3",
              }}
            />
            <AnimatePresence>
              {value && (
                <motion.button
                  type="button"
                  aria-label="Clear"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={() => {
                    set("");
                    input.current?.focus();
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#c7c7cc",
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: 99,
                  }}
                >
                  <Ico d={I.clear} size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div id={`${uid}-hint`} aria-live="polite" style={{ height: 20, marginTop: 4, position: "relative" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={hint.k}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ type: "tween", duration: 0.22 }}
                className="tabular-nums"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: hint.k === "e" ? "#86868b" : hint.color,
                  whiteSpace: "nowrap",
                }}
              >
                {hint.icon && (
                  <motion.span
                    animate={hint.spin ? { rotate: 360 } : { rotate: 0 }}
                    transition={hint.spin ? { repeat: Infinity, ease: "linear", duration: 0.8 } : { duration: 0 }}
                    style={{ display: "grid" }}
                  >
                    <Ico d={hint.icon} size={14} />
                  </motion.span>
                )}
                <span
                  style={{
                    color: hint.k.startsWith("f") ? "#6e6e73" : undefined,
                  }}
                >
                  {hint.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <motion.button
              type="button"
              disabled={!ready}
              onClick={() => {
                if (!match) return;
                touched.current = true;
                setSent(true);
                sfx.note(988, { dur: 0.12, gain: 0.035 });
                onContinue?.({ handle: match.handle, address: match.address });
              }}
              animate={{
                background: ready ? "#111113" : "#ececf0",
                color: ready ? "#ffffff" : "#a1a1a6",
              }}
              whileTap={ready ? { scale: 0.96 } : undefined}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
              style={{ ...pill, cursor: ready ? "pointer" : "default" }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {sent ? (
                  <motion.span
                    key="s"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ico d={I.check} size={14} /> Selected
                  </motion.span>
                ) : (
                  <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Continue
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button
              type="button"
              onClick={() => {
                touched.current = true;
                void fill(recent[0] ?? "mira.pay");
                input.current?.focus();
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
              style={{
                ...pill,
                background: "#f2f2f4",
                color: "#1d1d1f",
                fontWeight: 500,
              }}
            >
              <Ico d={I.paste} size={15} /> Paste
            </button>
          </div>
        </motion.div>

        <div
          style={{
            marginTop: 20,
            fontSize: 13,
            fontWeight: 600,
            color: "#1d1d1f",
            padding: "0 4px",
          }}
        >
          Recent
        </div>
        <div style={{ marginTop: 6 }}>
          {recent.map((h) => {
            const d = byHandle.get(h);
            if (!d) return null;
            const on = match?.handle === h && phase === "found";
            return (
              <button
                key={h}
                type="button"
                onClick={() => {
                  touched.current = true;
                  void fill(h);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 4px",
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: 14,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: "#f2f2f4",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <img src={d.face} alt="" width={30} height={30} draggable={false} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1d1d1f",
                    }}
                  >
                    {d.name}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#86868b",
                      marginTop: 1,
                    }}
                  >
                    {d.handle}
                  </span>
                </span>
                <motion.span animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }} style={{ color: "#1f9d55" }}>
                  <Ico d={I.ok} size={18} />
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
