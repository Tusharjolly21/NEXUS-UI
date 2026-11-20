"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PrivateSendProps = {
  amount?: number;
  currency?: string;
  to?: { name: string; address: string; avatar: string };
  from?: { name: string; address: string };
  /** the one-time address used when sending privately */
  relay?: string;
  defaultPrivate?: boolean;
  onPrivateChange?: (on: boolean) => void;
  onSend?: (privately: boolean) => void;
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

const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
const HEX = "0123456789abcdef";

/** an address that re-types itself: each character flickers through a few others before landing, left to right */
function Scramble({ text, reduce, onStep }: { text: string; reduce: boolean; onStep?: (i: number) => void }) {
  const [shown, setShown] = useState(text);
  const prev = useRef(text);
  useEffect(() => {
    if (reduce || prev.current === text) {
      setShown(text);
      prev.current = text;
      return;
    }
    const from = prev.current;
    prev.current = text;
    const n = Math.max(from.length, text.length);
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      let out = "";
      let done = true;
      for (let i = 0; i < n; i++) {
        const start = i * 0.028;
        const end = start + 0.22;
        const target = text[i] ?? "";
        if (t >= end) out += target;
        else if (t < start) out += from[i] ?? "";
        else {
          done = false;
          out +=
            target === "." || target === "x" || target === "" || target === from[i]
              ? target
              : HEX[Math.floor(Math.random() * 16)];
        }
        if (t >= start && t - 0.017 < start) onStep?.(i);
      }
      setShown(out);
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduce]);
  return (
    <span
      aria-label={text}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        fontSize: "0.92em",
        letterSpacing: "-0.01em",
      }}
    >
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/**
 * Send with a one-time address. Switch on Send privately and three things move together: the address you send from
 * re-types itself into a fresh relay address, character by character; the shield fills; and the button grows from
 * Send into Send privately, the word Send sliding over to make room while the rest arrives letter by letter behind
 * it. Switch it off and it all runs back.
 */
export default function PrivateSend({
  amount = 1250,
  currency = "$",
  to = {
    name: "Maya Chen",
    address: "0x3a9F42d1E07b8c55A1e9f0D6b2c43E8d7a1c21B4",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
  },
  from = {
    name: "Everyday wallet",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
  relay = "0xA4e01fB2c9D85e3370aB64c1E9f2d07B5c3811d9",
  defaultPrivate = false,
  onPrivateChange,
  onSend,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PrivateSendProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [priv, setPriv] = useState(defaultPrivate);
  const [sent, setSent] = useState(false);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const flip = (v?: boolean) => {
    setPriv((p) => {
      const n = v ?? !p;
      if (n !== p) {
        onPrivateChange?.(n);
        sfx.tick({ freq: n ? 2300 : 1700, gain: 0.03 });
      }
      return n;
    });
    setSent(false);
  };
  const send = () => {
    if (sent) return;
    setSent(true);
    onSend?.(priv);
    sfx.note(784, { dur: 0.25, gain: 0.06 });
    sfx.note(1175, { at: 0.1, dur: 0.4, gain: 0.06 });
  };

  // the button comes back after a moment
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 2200);
    return () => clearTimeout(t);
  }, [sent]);

  // autoplay
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 600) => {
      const c = root.current;
      const el = c?.querySelector(sel);
      if (!c || !el) return;
      const r = el.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await go("[role=switch]");
        if (!ok()) return;
        flip(true);
        await wait(1800);
        await go("[data-send]");
        if (!ok()) return;
        send();
        await wait(2000);
        await go("[role=switch]");
        if (!ok()) return;
        flip(false);
        setGhost(false);
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

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };
  const tail = " privately";
  const [whole, cents] = amount.toFixed(2).split(".");
  const row = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
  } as const;

  return (
    <div
      ref={root}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
      className={`relative w-full max-w-[420px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "24px 22px 20px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontSize: 13, color: "#86868b", textAlign: "center" }}>Sending to {to.name}</div>
        <div
          style={{
            textAlign: "center",
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            marginTop: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currency}
          {Number(whole).toLocaleString("en-US")}
          <span style={{ color: "#c7c7cc" }}>.{cents}</span>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: "2px 14px",
            borderRadius: 18,
            background: "#f5f5f7",
          }}
        >
          <div style={row}>
            <span style={{ width: 38, fontSize: 13, color: "#86868b" }}>To</span>
            <img
              src={to.avatar}
              alt=""
              width={30}
              height={30}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: "#fff",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 14.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {to.name}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: "#86868b",
                  marginTop: 1,
                }}
              >
                <Scramble text={short(to.address)} reduce={reduce} />
              </span>
            </span>
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
          <div style={row}>
            <span style={{ width: 38, fontSize: 13, color: "#86868b" }}>From</span>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 30,
                height: 30,
                borderRadius: 15,
                background: "#fff",
                color: priv ? "#0071e3" : "#6e6e73",
                flexShrink: 0,
                transition: "color 0.3s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 256 256" aria-hidden="true">
                <path
                  d="M216 64H56a8 8 0 0 1 0-16h136a8 8 0 0 0 0-16H56a24 24 0 0 0-24 24v128a24 24 0 0 0 24 24h160a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m0 128H56a8 8 0 0 1-8-8V78.63A23.8 23.8 0 0 0 56 80h160Zm-48-60a12 12 0 1 1 12 12a12 12 0 0 1-12-12"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  position: "relative",
                  display: "block",
                  height: 19,
                  overflow: "hidden",
                  fontSize: 14.5,
                  fontWeight: 500,
                }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={priv ? "r" : "w"}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={spring}
                    style={{ display: "block", whiteSpace: "nowrap" }}
                  >
                    {priv ? "One-time address" : from.name}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: priv ? "#0071e3" : "#86868b",
                  marginTop: 1,
                  transition: "color 0.3s",
                }}
              >
                <Scramble
                  text={short(priv ? relay : from.address)}
                  reduce={reduce}
                  onStep={(i) => i % 3 === 0 && sfx.tick({ freq: 3000 + i * 40, gain: 0.004 })}
                />
              </span>
            </span>
          </div>
        </div>

        {/* the switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            padding: "0 4px",
          }}
        >
          <span
            style={{
              position: "relative",
              width: 28,
              height: 28,
              color: priv ? "#0071e3" : "#8e8e93",
              transition: "color 0.3s",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 256 256"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d="M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.27 47 25.53a8 8 0 0 0 4.2 0c1-.26 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m0 72c0 37.07-13.66 67.16-40.6 89.42a129.3 129.3 0 0 1-39.4 22.2a128.3 128.3 0 0 1-38.92-21.81C61.82 179.51 48 149.3 48 112V56h160Z"
                fill="currentColor"
              />
            </svg>
            <motion.svg
              width="28"
              height="28"
              viewBox="0 0 256 256"
              aria-hidden="true"
              initial={false}
              animate={{ scale: priv ? 1 : 0.4, opacity: priv ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 20 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d="M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m-34.32 69.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z"
                fill="currentColor"
              />
            </motion.svg>
          </span>
          <span style={{ flex: 1 }}>
            <span
              id={`ps-${uid}`}
              style={{
                display: "block",
                fontSize: 14.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Send privately
            </span>
            <span
              style={{
                display: "block",
                fontSize: 12.5,
                color: "#86868b",
                marginTop: 1,
              }}
            >
              {to.name.split(" ")[0]} sees a one-time address, not yours
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={priv}
            aria-labelledby={`ps-${uid}`}
            onClick={() => {
              touched.current = true;
              flip();
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{
              position: "relative",
              width: 51,
              height: 31,
              borderRadius: 16,
              border: 0,
              padding: 0,
              background: priv ? "#0071e3" : "#e9e9eb",
              transition: "background 0.25s",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <motion.span
              initial={false}
              animate={{ x: priv ? 20 : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 32 }}
              style={{
                position: "absolute",
                left: 2,
                top: 2,
                width: 27,
                height: 27,
                borderRadius: 14,
                background: "#fff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06)",
              }}
            />
          </button>
        </div>

        {/* the button that rewrites itself */}
        <motion.button
          type="button"
          data-send
          onClick={() => {
            touched.current = true;
            send();
          }}
          aria-label={sent ? "Sent" : priv ? "Send privately" : "Send"}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            width: "100%",
            height: 50,
            marginTop: 20,
            borderRadius: 16,
            border: 0,
            background: sent ? "#30d158" : "#0071e3",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 600,
            transition: "background 0.35s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <LayoutGroup id={`ps-btn-${uid}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {sent ? (
                <motion.span
                  key="sent"
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  transition={spring}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true">
                    <path
                      d="m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z"
                      fill="currentColor"
                    />
                  </svg>
                  Sent
                </motion.span>
              ) : (
                <motion.span
                  key="send"
                  layout
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  transition={spring}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "pre",
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {priv && (
                      <motion.svg
                        key="icon"
                        layout
                        width="18"
                        height="18"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                        initial={{
                          scale: 0,
                          opacity: 0,
                          width: 0,
                          marginRight: 0,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          width: 18,
                          marginRight: 8,
                        }}
                        exit={{
                          scale: 0,
                          opacity: 0,
                          width: 0,
                          marginRight: 0,
                        }}
                        transition={spring}
                      >
                        <path
                          d="M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m-34.32 69.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z"
                          fill="currentColor"
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                  <motion.span layout="position" transition={spring}>
                    Send
                  </motion.span>
                  <AnimatePresence initial={false} mode="popLayout">
                    {priv && (
                      <motion.span key="tail" layout style={{ display: "inline-flex" }}>
                        {[...tail].map((ch, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, x: -6, filter: "blur(3px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{
                              opacity: 0,
                              x: -4,
                              filter: "blur(3px)",
                              transition: {
                                type: "tween",
                                duration: 0.12,
                                delay: (tail.length - i) * 0.012,
                              },
                            }}
                            transition={{
                              type: "tween",
                              duration: 0.25,
                              delay: 0.05 + i * 0.022,
                              ease: [0.25, 0.8, 0.3, 1],
                            }}
                            style={{ display: "inline-block" }}
                          >
                            {ch}
                          </motion.span>
                        ))}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </motion.button>

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
