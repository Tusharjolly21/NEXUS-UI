"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ProfileCardProps = {
  name?: string;
  role?: string;
  location?: string;
  bio?: string;
  /** a picture of the person, ideally a cut-out on a transparent background so it can rise out of its frame */
  avatar?: string;
  /** the colour of the disc behind the avatar */
  avatarTint?: string;
  /** the cover photo */
  cover?: string;
  /** a short line under the name, such as when they take new work; empty hides it */
  status?: string;
  skills?: string[];
  followers?: number;
  projects?: number;
  rating?: number;
  verified?: boolean;
  onFollow?: (following: boolean) => void;
  onMessage?: () => void;
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
  verified:
    "M225.86 102.82c-3.77-3.94-7.67-8-9.14-11.57c-1.36-3.27-1.44-8.69-1.52-13.94c-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52c-3.56-1.47-7.63-5.37-11.57-9.14C146.28 23.51 138.44 16 128 16s-18.27 7.51-25.18 14.14c-3.94 3.77-8 7.67-11.57 9.14c-3.25 1.36-8.69 1.44-13.94 1.52c-9.76.15-20.82.31-28.51 8s-7.8 18.75-8 28.51c-.08 5.25-.16 10.67-1.52 13.94c-1.47 3.56-5.37 7.63-9.14 11.57C23.51 109.72 16 117.56 16 128s7.51 18.27 14.14 25.18c3.77 3.94 7.67 8 9.14 11.57c1.36 3.27 1.44 8.69 1.52 13.94c.15 9.76.31 20.82 8 28.51s18.75 7.85 28.51 8c5.25.08 10.67.16 13.94 1.52c3.56 1.47 7.63 5.37 11.57 9.14c6.9 6.63 14.74 14.14 25.18 14.14s18.27-7.51 25.18-14.14c3.94-3.77 8-7.67 11.57-9.14c3.27-1.36 8.69-1.44 13.94-1.52c9.76-.15 20.82-.31 28.51-8s7.85-18.75 8-28.51c.08-5.25.16-10.67 1.52-13.94c1.47-3.56 5.37-7.63 9.14-11.57c6.63-6.9 14.14-14.74 14.14-25.18s-7.51-18.27-14.14-25.18m-52.2 6.84l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  pin: "M128 64a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m0-112a88.1 88.1 0 0 0-88 88c0 31.4 14.51 64.68 42 96.25a254.2 254.2 0 0 0 41.45 38.3a8 8 0 0 0 9.18 0a254.2 254.2 0 0 0 41.37-38.3c27.45-31.57 42-64.85 42-96.25a88.1 88.1 0 0 0-88-88m0 206c-16.53-13-72-60.75-72-118a72 72 0 0 1 144 0c0 57.23-55.47 105-72 118",
  follow:
    "M256 136a12 12 0 0 1-12 12h-8v8a12 12 0 0 1-24 0v-8h-8a12 12 0 0 1 0-24h8v-8a12 12 0 0 1 24 0v8h8a12 12 0 0 1 12 12m-54.81 56.28a12 12 0 1 1-18.38 15.44C169.12 191.42 145 172 108 172c-28.89 0-55.46 12.68-74.81 35.72a12 12 0 0 1-18.38-15.44a124.1 124.1 0 0 1 48.69-35.75a72 72 0 1 1 89 0a124 124 0 0 1 48.69 35.75M108 148a48 48 0 1 0-48-48a48.05 48.05 0 0 0 48 48",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  chat: "M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24m0 192a87.87 87.87 0 0 1-44.06-11.81a8 8 0 0 0-6.54-.67L40 216l12.47-37.4a8 8 0 0 0-.66-6.54A88 88 0 1 1 128 216",
  save: "M184 32H72a16 16 0 0 0-16 16v176a8 8 0 0 0 12.24 6.78L128 193.43l59.77 37.35A8 8 0 0 0 200 224V48a16 16 0 0 0-16-16m0 177.57l-51.77-32.35a8 8 0 0 0-8.48 0L72 209.57V48h112Z",
  saved:
    "M184 32H72a16 16 0 0 0-16 16v176a8 8 0 0 0 12.24 6.78L128 193.43l59.77 37.35A8 8 0 0 0 200 224V48a16 16 0 0 0-16-16",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

/** Fluent Emoji 3D by Microsoft (MIT) */
const AVATAR =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png";
/** an abstract render by Milad Fakurian on Unsplash */
const COVER = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?fm=jpg&q=80&fit=max&w=3840&h=3840";
const CONFETTI = ["#b9a6ff", "#8fd0ff", "#ffd28a", "#ff9fc4", "#1d1d1f"];

/** a number whose digits roll like an odometer */
function Rolling({ value, format }: { value: number; format: (v: number) => string }) {
  const text = format(value);
  return (
    <span style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums" }} aria-label={text}>
      {[...text].map((ch, i) => {
        const key = `${text.length - i}`;
        if (!/\d/.test(ch))
          return (
            <span
              key={key + ch}
              aria-hidden="true"
              style={{
                display: "inline-block",
                height: "1.15em",
                lineHeight: "1.15em",
              }}
            >
              {ch}
            </span>
          );
        const d = Number(ch);
        return (
          <span
            key={key}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.15em",
              overflow: "hidden",
              width: "0.62em",
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-d * 1.15}em` }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                delay: (text.length - i) * 0.03,
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.15em",
              }}
            >
              {Array.from({ length: 10 }, (_, k) => (
                <span
                  key={k}
                  style={{
                    height: "1.15em",
                    textAlign: "center",
                    width: "0.62em",
                  }}
                >
                  {k}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

type Bit = {
  id: number;
  x: number;
  y: number;
  r: number;
  c: string;
  s: number;
};

/**
 * A creator's profile card, photo first. The cover is a full photo that drifts against the pointer like a window
 * you look through, while the avatar (a 3D cut-out) moves the other way and rises out of its round frame when you
 * point at it, so the card has real depth. Follow and the button turns into Following with a burst of confetti while
 * the follower count rolls up a digit; open the rest of the skills and they unfold; save it and the bookmark pops.
 */
export default function ProfileCard({
  name = "Lena Hartmann",
  role = "Brand and motion designer",
  location = "Lisbon",
  bio = "Identity and motion for software companies. Eight years in, mostly fintech and climate tools.",
  avatar = AVATAR,
  avatarTint = "#ffd9c7",
  cover = COVER,
  status = "Booking projects from March",
  skills = ["Motion", "Branding", "3D", "Type design", "Art direction", "Prototyping"],
  followers = 12480,
  projects = 86,
  rating = 4.9,
  verified = true,
  onFollow,
  onMessage,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ProfileCardProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [lift, setLift] = useState(false);
  const [coverReady, setCoverReady] = useState(false);
  const [bits, setBits] = useState<Bit[]>([]);
  const card = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 110, damping: 18 });
  const sy = useSpring(py, { stiffness: 110, damping: 18 });
  const rY = useTransform(sx, (v) => (reduce ? 0 : v * 4));
  const rX = useTransform(sy, (v) => (reduce ? 0 : -v * 3));
  // the cover sits deeper than the card, so it slides against the pointer; the avatar sits nearer and slides with it
  const cX = useTransform(sx, (v) => (reduce ? 0 : -v * 14));
  const cY = useTransform(sy, (v) => (reduce ? 0 : -v * 10));
  const aX = useTransform(sx, (v) => (reduce ? 0 : v * 5));
  const aY = useTransform(sy, (v) => (reduce ? 0 : v * 3));
  const glare = useMotionTemplate`radial-gradient(60% 40% at ${useTransform(sx, (v) => 50 + v * 50)}% ${useTransform(sy, (v) => 30 + v * 40)}%, rgba(255,255,255,0.3), transparent 70%)`;

  const burst = (el: HTMLElement | null) => {
    if (reduce || !el || !card.current) return;
    const r = el.getBoundingClientRect();
    const c = card.current.getBoundingClientRect();
    const ox = r.left - c.left + r.width / 2;
    const oy = r.top - c.top + r.height / 2;
    const now = Date.now();
    setBits(
      Array.from({ length: 36 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const v = 70 + Math.random() * 90;
        return {
          id: now + i,
          x: ox + Math.cos(a) * v,
          y: oy + Math.sin(a) * v,
          r: (Math.random() - 0.5) * 540,
          c: CONFETTI[i % 5],
          s: 0.6 + Math.random() * 0.8,
        };
      }),
    );
    window.setTimeout(() => setBits([]), 1300);
  };
  const followBtn = useRef<HTMLButtonElement>(null);
  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    onFollow?.(next);
    if (next) {
      burst(followBtn.current);
      sfx.note(659, { dur: 0.18, gain: 0.06 });
      sfx.note(988, { at: 0.08, dur: 0.4, gain: 0.06, bell: 0.6 });
    } else sfx.note(440, { dur: 0.2, gain: 0.05 });
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1200);
      while (alive && !touched.current) {
        px.set(-0.7);
        py.set(-0.3);
        await wait(900);
        px.set(0.7);
        py.set(0.2);
        setLift(true);
        await wait(1000);
        px.set(0);
        py.set(0);
        setLift(false);
        if (!alive || touched.current) return;
        toggleFollowRef.current();
        await wait(1500);
        setOpen(true);
        await wait(1600);
        setSaved(true);
        await wait(1600);
        if (!alive || touched.current) return;
        setOpen(false);
        setSaved(false);
        toggleFollowRef.current();
        await wait(1600);
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [autoplay, reduce]);
  const toggleFollowRef = useRef(toggleFollow);
  toggleFollowRef.current = toggleFollow;

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x * 2 - 1);
    py.set(y * 2 - 1);
  };

  const shownSkills = open ? skills : skills.slice(0, 3);
  const fmtK = (v: number) => v.toLocaleString("en-US");

  const btn = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2";

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] ${className}`}
      style={{
        padding: "40px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        perspective: 1200,
      }}
    >
      <motion.div
        ref={card}
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={{
          position: "relative",
          width: "min(100%, 340px)",
          background: "#fff",
          borderRadius: 30,
          padding: 8,
          rotateX: rX,
          rotateY: rY,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03), 0 40px 70px -40px rgba(30,20,60,0.45)",
        }}
      >
        {/* cover: a photo larger than its window, moved against the pointer */}
        <div
          style={{
            position: "relative",
            height: 188,
            borderRadius: 23,
            overflow: "hidden",
            background: "#e9e6f3",
          }}
        >
          <motion.img
            src={cover}
            alt=""
            decoding="async"
            onLoad={() => setCoverReady(true)}
            initial={false}
            animate={{
              opacity: coverReady ? 1 : 0,
              scale: coverReady ? 1 : 1.04,
            }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              position: "absolute",
              left: "-8%",
              top: "-10%",
              width: "116%",
              maxWidth: "none",
              height: "120%",
              objectFit: "cover",
              x: cX,
              y: cY,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.12))",
            }}
          />
          <motion.button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Saved" : "Save profile"}
            onClick={() => {
              touched.current = true;
              setSaved(!saved);
              sfx.tick({ freq: saved ? 900 : 2200, gain: 0.05 });
            }}
            whileTap={{ scale: 0.85 }}
            className={btn}
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              width: 36,
              height: 36,
              borderRadius: 18,
              border: 0,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              color: saved ? "#ff9f0a" : "#1d1d1f",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <AnimatePresence>
              {saved && !reduce && (
                <motion.span
                  key="ring"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid #ff9f0a",
                  }}
                />
              )}
            </AnimatePresence>
            <motion.span
              key={saved ? "s" : "u"}
              initial={{ scale: saved ? 0.4 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 12 }}
            >
              <Ico d={saved ? I.saved : I.save} size={17} />
            </motion.span>
          </motion.button>
        </div>
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            background: glare,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          }}
        />
        <div style={{ padding: "0 14px 14px" }}>
          {/* avatar: a round frame whose top is open, so the head can rise out of it */}
          <motion.div
            onPointerEnter={() => setLift(true)}
            onPointerLeave={() => setLift(false)}
            style={{
              position: "relative",
              width: 84,
              height: 84,
              marginTop: -46,
              x: aX,
              y: aY,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: avatarTint,
                boxShadow: "0 0 0 4px #fff, 0 12px 24px -12px rgba(40,20,60,0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: "inset(-60px 0 0 0 round 0 0 42px 42px)",
              }}
            >
              <motion.img
                src={avatar}
                alt={name}
                decoding="async"
                animate={reduce ? undefined : { y: lift ? -20 : 4, scale: lift ? 1.16 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                style={{
                  position: "absolute",
                  left: "6%",
                  bottom: -6,
                  width: "88%",
                  maxWidth: "none",
                  height: "auto",
                  transformOrigin: "50% 100%",
                  filter: "drop-shadow(0 6px 8px rgba(40,20,60,0.25))",
                }}
              />
            </div>
          </motion.div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#1d1d1f",
              }}
            >
              {name}
            </span>
            {verified && (
              <span title="Verified" style={{ color: "#0a84ff" }}>
                <Ico d={I.verified} size={19} />
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 10,
              rowGap: 2,
              fontSize: 13,
              color: "#6e6e73",
              marginTop: 2,
            }}
          >
            <span>{role}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Ico d={I.pin} size={13} />
              {location}
            </span>
          </div>
          {status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "#1f7a3a",
              }}
            >
              <span
                style={{
                  position: "relative",
                  width: 8,
                  height: 8,
                  flex: "none",
                }}
              >
                {!reduce && (
                  <motion.span
                    animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 4,
                      background: "#30d158",
                    }}
                  />
                )}
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 4,
                    background: "#30d158",
                  }}
                />
              </span>
              {status}
            </div>
          )}
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              lineHeight: 1.5,
              color: "#3a3a3c",
            }}
          >
            {bio}
          </p>
          {/* skills */}
          <LayoutGroup>
            <motion.div
              layout
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 14,
              }}
            >
              <AnimatePresence initial={false}>
                {shownSkills.map((s, i) => (
                  <motion.span
                    key={s}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: 6 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 28,
                        delay: i >= 3 ? (i - 3) * 0.05 : 0,
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    style={{
                      height: 28,
                      padding: "0 11px",
                      borderRadius: 14,
                      boxShadow: "inset 0 0 0 1px #e5e5ea",
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#3a3a3c",
                    }}
                  >
                    {s}
                  </motion.span>
                ))}
              </AnimatePresence>
              {skills.length > 3 && (
                <motion.button
                  layout
                  type="button"
                  onClick={() => {
                    touched.current = true;
                    setOpen(!open);
                    sfx.tick({ freq: 1800, gain: 0.04 });
                  }}
                  aria-expanded={open}
                  aria-label={open ? "Show fewer skills" : `Show ${skills.length - 3} more skills`}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  style={{
                    height: 28,
                    padding: "0 11px",
                    borderRadius: 14,
                    border: 0,
                    background: "#f2f2f5",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#6e6e73",
                    cursor: "pointer",
                  }}
                >
                  {open ? "Fewer" : `${skills.length - 3} more`}
                </motion.button>
              )}
            </motion.div>
            {/* stats */}
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid #eeeef1",
              }}
            >
              {[
                {
                  k: "followers",
                  v: <Rolling value={followers + (following ? 1 : 0)} format={fmtK} />,
                },
                {
                  k: "projects",
                  v: <Rolling value={projects} format={(v) => String(v)} />,
                },
                {
                  k: "average rating",
                  v: (
                    <span
                      style={{
                        fontVariantNumeric: "tabular-nums",
                        display: "inline-block",
                        height: "1.15em",
                        lineHeight: "1.15em",
                      }}
                    >
                      {rating.toFixed(1)}
                    </span>
                  ),
                },
              ].map((s, i) => (
                <div
                  key={s.k}
                  style={{
                    padding: "0 4px",
                    textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
                    borderLeft: i ? "1px solid #eeeef1" : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      color: "#1d1d1f",
                      letterSpacing: "-0.02em",
                      display: "flex",
                      justifyContent: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center",
                      alignItems: "center",
                      height: 24,
                      lineHeight: "1.15em",
                    }}
                  >
                    {s.v}
                  </div>
                  <div style={{ fontSize: 12, color: "#86868b", marginTop: 1 }}>{s.k}</div>
                </div>
              ))}
            </motion.div>
            {/* actions */}
            <motion.div layout style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <motion.button
                ref={followBtn}
                type="button"
                aria-pressed={following}
                onClick={() => {
                  touched.current = true;
                  toggleFollow();
                }}
                whileTap={{ scale: 0.97 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 23,
                  border: 0,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  overflow: "hidden",
                  color: following ? "#1d1d1f" : "#fff",
                  background: following ? "#f2f2f5" : "linear-gradient(180deg,#2c2c2e,#1d1d1f)",
                  boxShadow: following
                    ? "inset 0 0 0 1px #e3e3e8"
                    : "inset 0 1px 0 rgba(255,255,255,0.15), 0 10px 20px -12px rgba(0,0,0,0.6)",
                  transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={following ? "on" : "off"}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ico d={following ? I.check : I.follow} size={16} />
                    {following ? "Following" : "Follow"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <motion.button
                type="button"
                aria-label={`Message ${name}`}
                onClick={onMessage}
                whileTap={{ scale: 0.96 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  height: 46,
                  padding: "0 18px",
                  borderRadius: 23,
                  border: 0,
                  background: "#f2f2f5",
                  color: "#1d1d1f",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Ico d={I.chat} size={18} />
                Message
              </motion.button>
            </motion.div>
          </LayoutGroup>
        </div>
        {/* confetti */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {bits.map((b, i) => {
            const fb = followBtn.current?.getBoundingClientRect();
            const cr = card.current?.getBoundingClientRect();
            const ox = fb && cr ? fb.left - cr.left + fb.width / 2 : 100;
            const oy = fb && cr ? fb.top - cr.top + fb.height / 2 : 400;
            return (
              <motion.span
                key={b.id}
                initial={{ x: ox, y: oy, rotate: 0, opacity: 1, scale: b.s }}
                animate={{
                  x: [ox, b.x, b.x + (b.x - ox) * 0.15],
                  y: [oy, b.y, b.y + 70],
                  rotate: b.r,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.2,
                  times: [0, 0.4, 1],
                  ease: ["easeOut", "easeIn"],
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: i % 3 ? 9 : 6,
                  height: i % 3 ? 5 : 11,
                  borderRadius: i % 4 ? 1.5 : 4,
                  background: b.c,
                }}
              />
            );
          })}
        </div>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {following ? `You are following ${name}` : ""}
      </p>
    </div>
  );
}
