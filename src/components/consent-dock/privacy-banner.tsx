"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CookieGroup = {
  id: string;
  name: string;
  detail: string;
  locked?: boolean;
  default?: boolean;
};
export type PrivacyBannerProps = {
  groups?: CookieGroup[];
  /** a photo of a cookie, seen from above; a cut-out on a transparent background looks best */
  cookie?: string;
  title?: string;
  body?: string;
  onSave?: (choices: Record<string, boolean>) => void;
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
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Z",
  sliders:
    "M40 88h33a32 32 0 0 0 62 0h81a8 8 0 0 0 0-16h-81a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16m64-24a16 16 0 1 1-16 16a16 16 0 0 1 16-16m112 104h-17a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16h97a32 32 0 0 0 62 0h17a8 8 0 0 0 0-16m-48 24a16 16 0 1 1 16-16a16 16 0 0 1-16 16",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_GROUPS: CookieGroup[] = [
  {
    id: "essential",
    name: "Essential",
    detail: "Keep you signed in, hold your basket and protect the site. Always on.",
    locked: true,
    default: true,
  },
  {
    id: "preferences",
    name: "Preferences",
    detail: "Remember your language and display settings.",
    default: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    detail: "Count page visits without identifying you.",
    default: false,
  },
  {
    id: "marketing",
    name: "Marketing",
    detail: "Let ad partners show you our products on other sites.",
    default: false,
  },
];

/** a chocolate chip cookie from above, photo by Matt Reiter on Unsplash, cropped round it */
const COOKIE =
  "https://images.unsplash.com/photo-1611082191524-1c049443f288?fm=jpg&q=85&w=480&h=480&fit=crop&crop=focalpoint&fp-x=0.495&fp-y=0.501&fp-z=2.05";

// bites taken out of the cookie, in the order they are taken: centre and radius in a 64 box
const BITES = [
  { x: 58, y: 16, r: 11 },
  { x: 62, y: 38, r: 10 },
  { x: 44, y: 61, r: 12 },
  { x: 10, y: 52, r: 11 },
  { x: 9, y: 16, r: 13 },
  { x: 32, y: 32, r: 32 },
];
// the scalloped edge of a bite: each bite is a few overlapping circles, the way teeth leave it
const TEETH = [
  [0, 0, 1],
  [0.55, 0.35, 0.62],
  [-0.5, 0.42, 0.6],
  [0.3, -0.6, 0.55],
  [-0.4, -0.5, 0.58],
] as const;

function Cookie({ src, bites, hover, size }: { src: string; bites: number; hover: boolean; size: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      animate={hover && bites === 0 ? { rotate: [0, -8, 6, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "block",
        overflow: "visible",
        filter: "drop-shadow(0 6px 6px rgba(70,35,8,0.28)) drop-shadow(0 1px 1px rgba(70,35,8,0.3))",
      }}
    >
      <defs>
        <clipPath id={`cc-${uid}`}>
          <circle cx="32" cy="32" r="31" />
        </clipPath>
        <mask id={`bm-${uid}`}>
          <rect width="64" height="64" fill="#fff" />
          {BITES.slice(0, bites).map((b, i) =>
            TEETH.map(([dx, dy, k], j) => (
              <motion.circle
                key={`${i}-${j}`}
                cx={b.x + dx * b.r * 0.55}
                cy={b.y + dy * b.r * 0.55}
                initial={{ r: 0 }}
                animate={{ r: b.r * k }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 22,
                  delay: j * 0.015,
                }}
                fill="#000"
              />
            )),
          )}
        </mask>
      </defs>
      <g mask={`url(#bm-${uid})`}>
        <image
          href={src}
          x="0"
          y="0"
          width="64"
          height="64"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#cc-${uid})`}
        />
      </g>
    </motion.svg>
  );
}

type Crumb = { id: number; x: number; y: number; vx: number; r: number };

/**
 * A cookie consent card with a real cookie on it, a photo sitting on the card's corner. Point at it and it wobbles;
 * every choice takes bites out of it, with crumbs falling: accept everything and most of it goes, reject everything
 * and it loses one small bite. Customize grows the card into a list of switches, one per kind of cookie (the
 * essential ones locked on). A choice turns the card into a confirmation with a check that draws itself, then it
 * tucks away into a small pill that says what you chose and opens the settings again.
 */
export default function PrivacyBanner({
  groups = DEFAULT_GROUPS,
  cookie = COOKIE,
  title = "We use cookies",
  body = "Essential cookies keep you signed in and hold your basket. With your permission we also use a few to see which pages people read.",
  onSave,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PrivacyBannerProps) {
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
  const initial = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, !!g.default || !!g.locked])), [groups]);
  const [mode, setModeS] = useState<"ask" | "custom" | "done" | "pill">("ask");
  const modeRef = useRef(mode);
  const setMode = (m: typeof mode) => {
    modeRef.current = m;
    setModeS(m);
  };
  const [choice, setChoice] = useState<Record<string, boolean>>(initial);
  const [bites, setBites] = useState(0);
  const [hover, setHover] = useState(false);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [verdict, setVerdict] = useState("");
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const bite = (k = 1) => {
    if (reduce) {
      setBites((b) => Math.min(BITES.length, b + k));
      return;
    }
    for (let i = 0; i < k; i++)
      timers.current.push(
        window.setTimeout(() => {
          setBites((b) => {
            const nb = Math.min(BITES.length, b + 1);
            const at = BITES[nb - 1];
            if (at) {
              const now = Date.now();
              setCrumbs((cs) => [
                ...cs.slice(-18),
                ...Array.from({ length: 5 }, (_, j) => ({
                  id: now + j + Math.random(),
                  x: at.x * 1.44,
                  y: at.y * 1.44,
                  vx: (Math.random() - 0.5) * 40,
                  r: 1.4 + Math.random() * 2,
                })),
              ]);
            }
            return nb;
          });
          sfx.tick({ freq: 500 + Math.random() * 300, gain: 0.07 });
          sfx.whoosh(3000, 1200, { dur: 0.08, gain: 0.03 });
        }, i * 260),
      );
  };

  const finish = (c: Record<string, boolean>, label: string, bitesTaken: number) => {
    setChoice(c);
    onSave?.(c);
    bite(bitesTaken);
    const on = Object.values(c).filter(Boolean).length;
    setVerdict(label || `${on} of ${groups.length} allowed`);
    timers.current.push(
      window.setTimeout(
        () => {
          setMode("done");
          sfx.note(659, { dur: 0.2, gain: 0.05 });
          sfx.note(988, { at: 0.12, dur: 0.5, gain: 0.05, bell: 0.6 });
        },
        bitesTaken * 260 + 150,
      ),
      window.setTimeout(() => setMode("pill"), bitesTaken * 260 + 2300),
    );
  };
  const acceptAll = () => finish(Object.fromEntries(groups.map((g) => [g.id, true])), "All cookies allowed", 5);
  const rejectAll = () =>
    finish(Object.fromEntries(groups.map((g) => [g.id, !!g.locked])), "Only essential cookies", 1);
  const save = () => {
    const on = Object.values(choice).filter(Boolean).length;
    finish(choice, `${on} of ${groups.length} kinds allowed`, Math.max(1, Math.round((on / groups.length) * 5)));
  };
  const reopen = () => {
    setBites(0);
    setCrumbs([]);
    setMode("custom");
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1400);
      while (alive && !touched.current) {
        setHover(true);
        await wait(700);
        setHover(false);
        setMode("custom");
        sfx.whoosh(500, 1200, { dur: 0.3, gain: 0.03 });
        await wait(1200);
        if (!alive || touched.current) return;
        setChoice((c) => ({ ...c, analytics: true }));
        await wait(900);
        if (!alive || touched.current) return;
        save();
        await wait(4200);
        if (!alive || touched.current) return;
        setBites(0);
        setCrumbs([]);
        setChoice(initial);
        setMode("ask");
        await wait(1600);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const btn = (label: string, onClick: () => void, kind: "ghost" | "soft" | "dark", icon?: string) => (
    <motion.button
      layout
      type="button"
      onClick={() => {
        touched.current = true;
        onClick();
      }}
      whileTap={{ scale: 0.96 }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
      style={{
        height: 40,
        padding: "0 16px",
        borderRadius: 20,
        border: 0,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background:
          kind === "dark" ? "linear-gradient(180deg,#2c2c2e,#1d1d1f)" : kind === "soft" ? "#f2f2f5" : "transparent",
        color: kind === "dark" ? "#fff" : "#1d1d1f",
        boxShadow: kind === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 18px -10px rgba(0,0,0,0.6)" : "none",
      }}
    >
      {icon && <Ico d={icon} size={15} />}
      {label}
    </motion.button>
  );

  const on = Object.values(choice).filter(Boolean).length;

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] ${className}`}
      style={{
        minHeight: 420,
        padding: "32px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <LayoutGroup id={uid}>
        <AnimatePresence mode="popLayout">
          {mode !== "pill" ? (
            <motion.section
              key="card"
              layout
              role="dialog"
              aria-label="Cookie preferences"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, y: 60, filter: "blur(6px)" }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 32,
                filter: { duration: 0.3 },
              }}
              style={{
                position: "relative",
                width: "min(100%, 400px)",
                background: "#fff",
                borderRadius: mode === "done" ? 30 : 26,
                padding: 22,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -32px rgba(60,40,10,0.45)",
              }}
            >
              {mode !== "done" && (
                <motion.div
                  layout="position"
                  role="button"
                  tabIndex={-1}
                  aria-label="Take a bite"
                  onPointerEnter={() => setHover(true)}
                  onPointerLeave={() => setHover(false)}
                  onClick={() => {
                    touched.current = true;
                    if (bites < BITES.length - 1) bite(1);
                  }}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: -12, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: -26,
                    width: 92,
                    height: 92,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  <Cookie src={cookie} bites={bites} hover={hover} size={92} />
                  {crumbs.map((c) => (
                    <motion.span
                      key={c.id}
                      initial={{ x: c.x, y: c.y, opacity: 1 }}
                      animate={{
                        x: c.x + c.vx,
                        y: c.y + 70,
                        opacity: 0,
                        rotate: 200,
                      }}
                      transition={{ duration: 0.95, ease: [0.3, 0, 1, 0.6] }}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: c.r * 2,
                        height: c.r * 1.6,
                        borderRadius: "40% 60% 50% 45%",
                        background: c.r > 2.6 ? "#7a4518" : "#c98a3d",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </motion.div>
              )}
              <AnimatePresence mode="popLayout" initial={false}>
                {mode === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "grid",
                      justifyItems: "center",
                      textAlign: "center",
                      padding: "16px 0 8px",
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#30d158"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{ rotate: -90, transformOrigin: "32px 32px" }}
                      />
                      <motion.path
                        d="M20 33 L28 41 L45 23"
                        fill="none"
                        stroke="#30d158"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.4 }}
                      />
                    </svg>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "#1d1d1f",
                        marginTop: 10,
                      }}
                    >
                      Preferences saved
                    </div>
                    <div style={{ fontSize: 13.5, color: "#6e6e73", marginTop: 3 }}>
                      {verdict}. You can change this at any time.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="ask" layout exit={{ opacity: 0, filter: "blur(6px)" }}>
                    <motion.div layout style={{ paddingRight: 92 }}>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 650,
                          letterSpacing: "-0.025em",
                          color: "#1d1d1f",
                        }}
                      >
                        {title}
                      </div>
                    </motion.div>
                    <motion.p
                      layout
                      style={{
                        margin: "8px 0 0",
                        paddingRight: 40,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#424245",
                      }}
                    >
                      {body}
                    </motion.p>
                    <AnimatePresence initial={false}>
                      {mode === "custom" && (
                        <motion.div
                          key="list"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 30,
                          }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ display: "grid", gap: 8, paddingTop: 14 }}>
                            {groups.map((g, i) => {
                              const v = !!choice[g.id];
                              return (
                                <motion.label
                                  key={g.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.08 + i * 0.05 }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "11px 12px",
                                    borderRadius: 16,
                                    background: v ? "#f4faf6" : "#f7f7f9",
                                    transition: "background 0.3s",
                                    cursor: g.locked ? "default" : "pointer",
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "#1d1d1f",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                      }}
                                    >
                                      {g.name}
                                      {g.locked && (
                                        <span style={{ color: "#86868b" }}>
                                          <Ico d={I.lock} size={11} />
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12.5,
                                        color: "#6e6e73",
                                        lineHeight: 1.4,
                                        marginTop: 1,
                                      }}
                                    >
                                      {g.detail}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={v}
                                    aria-label={g.name}
                                    disabled={g.locked}
                                    onClick={() => {
                                      touched.current = true;
                                      setChoice((c) => ({
                                        ...c,
                                        [g.id]: !c[g.id],
                                      }));
                                      sfx.tick({
                                        freq: v ? 900 : 1600,
                                        gain: 0.05,
                                      });
                                    }}
                                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                                    style={{
                                      width: 46,
                                      height: 28,
                                      borderRadius: 14,
                                      border: 0,
                                      padding: 3,
                                      display: "flex",
                                      background: v ? "#30d158" : "#e3e3e8",
                                      opacity: g.locked ? 0.55 : 1,
                                      transition: "background 0.25s",
                                      cursor: g.locked ? "not-allowed" : "pointer",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <motion.span
                                      animate={{ x: v ? 18 : 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 600,
                                        damping: 32,
                                      }}
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 11,
                                        background: "#fff",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                      }}
                                    />
                                  </button>
                                </motion.label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      layout
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 16,
                      }}
                    >
                      {mode === "custom" ? (
                        <>
                          {btn("Back", () => setMode("ask"), "ghost")}
                          <span style={{ flex: 1 }} />
                          {btn("Reject all", rejectAll, "soft")}
                          {btn(`Allow ${on} of ${groups.length}`, save, "dark")}
                        </>
                      ) : (
                        <>
                          {btn(
                            "Customize",
                            () => {
                              setMode("custom");
                              sfx.whoosh(500, 1200, { dur: 0.3, gain: 0.03 });
                            },
                            "ghost",
                            I.sliders,
                          )}
                          <span style={{ flex: 1 }} />
                          {btn("Reject all", rejectAll, "soft")}
                          {btn("Accept all", acceptAll, "dark")}
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ) : (
            <motion.button
              key="pill"
              layout
              type="button"
              onClick={() => {
                touched.current = true;
                reopen();
              }}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
              style={{
                alignSelf: "end",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 50,
                padding: "0 18px 0 8px",
                borderRadius: 24,
                border: 0,
                background: "#fff",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 16px 30px -18px rgba(60,40,10,0.5)",
                cursor: "pointer",
                fontSize: 13.5,
                color: "#1d1d1f",
              }}
            >
              <Cookie src={cookie} bites={bites} hover={false} size={34} />
              <span style={{ fontWeight: 600 }}>{verdict}</span>
              <span style={{ color: "#0071e3", fontWeight: 600 }}>Change</span>
            </motion.button>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
