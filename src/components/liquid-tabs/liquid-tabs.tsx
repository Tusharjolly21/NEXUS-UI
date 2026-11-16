"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type LiquidTab = {
  id: string;
  label: string;
  icon: string;
  content?: ReactNode;
};
export type LiquidTabsProps = {
  tabs?: LiquidTab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
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
  user: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M74.08 197.5a64 64 0 0 1 107.84 0a87.83 87.83 0 0 1-107.84 0M96 120a32 32 0 1 1 32 32a32 32 0 0 1-32-32m97.76 66.41a79.66 79.66 0 0 0-36.06-28.75a48 48 0 1 0-59.4 0a79.66 79.66 0 0 0-36.06 28.75a88 88 0 1 1 131.52 0",
  bell: "M168 224a8 8 0 0 1-8 8H96a8 8 0 1 1 0-16h64a8 8 0 0 1 8 8m53.85-32a15.8 15.8 0 0 1-13.85 8H48a16 16 0 0 1-13.8-24.06C39.75 166.38 48 139.34 48 104a80 80 0 1 1 160 0c0 35.33 8.26 62.38 13.81 71.94a15.89 15.89 0 0 1 .03 16.06ZM208 184c-7.73-13.27-16-43.95-16-80a64 64 0 1 0-128 0c0 36.06-8.28 66.74-16 80Z",
  shield:
    "M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m0 72c0 37.07-13.66 67.16-40.6 89.42a129.3 129.3 0 0 1-39.4 22.2a128.3 128.3 0 0 1-38.92-21.81C61.82 179.51 48 149.3 48 112V56h160ZM82.34 141.66a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32l-56 56a8 8 0 0 1-11.32 0Z",
  chart:
    "M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v108.69l50.34-50.35a8 8 0 0 1 11.32 0L128 132.69L180.69 80H160a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8v40a8 8 0 0 1-16 0V91.31l-58.34 58.35a8 8 0 0 1-11.32 0L96 123.31l-56 56V200h184a8 8 0 0 1 8 8",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  key: "M216.57 39.43a80 80 0 0 0-132.66 81.35L28.69 176A15.86 15.86 0 0 0 24 187.31V216a16 16 0 0 0 16 16h32a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 5.66-2.34l9.56-9.57A79.7 79.7 0 0 0 160 176h.1a80 80 0 0 0 56.47-136.57M224 98.1c-1.09 34.09-29.75 61.86-63.89 61.9H160a63.7 63.7 0 0 1-23.65-4.51a8 8 0 0 0-8.84 1.68L116.69 168H96a8 8 0 0 0-8 8v16H72a8 8 0 0 0-8 8v16H40v-28.69l58.83-58.82a8 8 0 0 0 1.68-8.84A63.7 63.7 0 0 1 96 95.92c0-34.14 27.81-62.8 61.9-63.89A64 64 0 0 1 224 98.1M192 76a12 12 0 1 1-12-12a12 12 0 0 1 12 12",
  device:
    "M176 16H80a24 24 0 0 0-24 24v176a24 24 0 0 0 24 24h96a24 24 0 0 0 24-24V40a24 24 0 0 0-24-24M72 64h112v128H72Zm8-32h96a8 8 0 0 1 8 8v8H72v-8a8 8 0 0 1 8-8m96 192H80a8 8 0 0 1-8-8v-8h112v8a8 8 0 0 1-8 8",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const W = 360; // the card
const TOP = 66; // where the panel begins under the bump
const BUMP = 58; // how far the bump rises
const PANEL = 214;
const R = 26; // the panel's corners
const RT = 24; // the bump's shoulders
const RF = 14; // the fillets where the bump grows out of the panel
const TAB = 52; // a tab
const GAP = 14;
const X0 = 56;

/** one continuous outline: the panel and the bump that grows out of its top */
function outline(a: number, b: number, h: number) {
  const T = TOP;
  const H = TOP + PANEL;
  const rt = Math.min(RT, (b - a) / 2, h);
  return [
    `M ${R} ${T}`,
    `L ${a - RF} ${T}`,
    `Q ${a} ${T} ${a} ${T - RF}`,
    `L ${a} ${T - h + rt}`,
    `Q ${a} ${T - h} ${a + rt} ${T - h}`,
    `L ${b - rt} ${T - h}`,
    `Q ${b} ${T - h} ${b} ${T - h + rt}`,
    `L ${b} ${T - RF}`,
    `Q ${b} ${T} ${b + RF} ${T}`,
    `L ${W - R} ${T}`,
    `Q ${W} ${T} ${W} ${T + R}`,
    `L ${W} ${H - R}`,
    `Q ${W} ${H} ${W - R} ${H}`,
    `L ${R} ${H}`,
    `Q 0 ${H} 0 ${H - R}`,
    `L 0 ${T + R}`,
    `Q 0 ${T} ${R} ${T}`,
    "Z",
  ].join(" ");
}

function Segmented() {
  const opts = [
    { k: "Available", c: "#30d158" },
    { k: "Focusing", c: "#ff9f0a" },
    { k: "Away", c: "#8e8e93" },
  ];
  const [v, setV] = useState(0);
  const uid = useId();
  return (
    <div
      role="radiogroup"
      aria-label="Status"
      style={{
        display: "flex",
        background: "#f2f2f5",
        borderRadius: 14,
        padding: 4,
        gap: 2,
      }}
    >
      {opts.map((o, i) => (
        <button
          key={o.k}
          type="button"
          role="radio"
          aria-checked={v === i}
          onClick={() => setV(i)}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          style={{
            position: "relative",
            flex: 1,
            height: 34,
            border: 0,
            background: "transparent",
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 600,
            color: v === i ? "#1d1d1f" : "#6e6e73",
            cursor: "pointer",
          }}
        >
          {v === i && (
            <motion.span
              layoutId={`seg-${uid}`}
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 11,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 10px -6px rgba(0,0,0,0.25)",
              }}
            />
          )}
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 4, background: o.c }} />
            {o.k}
          </span>
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, on: start }: { label: string; on: boolean }) {
  const [on, setOn] = useState(start);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: "1px solid #f0f0f3",
      }}
    >
      <span style={{ fontSize: 14, color: "#1d1d1f" }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          border: 0,
          padding: 3,
          background: on ? "#30d158" : "#e3e3e8",
          transition: "background 0.25s",
          cursor: "pointer",
          display: "flex",
        }}
      >
        <motion.span
          animate={{ x: on ? 18 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

/** Fluent Emoji 3D by Microsoft (MIT) */
const JORDAN =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Person/Light/3D/person_3d_light.png";

const DEFAULT_TABS: LiquidTab[] = [
  {
    id: "profile",
    label: "Profile",
    icon: I.user,
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: 54,
                height: 54,
                borderRadius: 27,
                background: "#dfe6ff",
                overflow: "hidden",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={JORDAN}
                alt="Jordan Lee"
                decoding="async"
                style={{
                  position: "absolute",
                  left: "8%",
                  bottom: "-6%",
                  width: "84%",
                  maxWidth: "none",
                  height: "auto",
                }}
              />
            </div>
            <span
              style={{
                position: "absolute",
                right: -1,
                bottom: -1,
                width: 15,
                height: 15,
                borderRadius: 8,
                background: "#30d158",
                border: "3px solid #fff",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#1d1d1f",
              }}
            >
              Jordan Lee
            </div>
            <div style={{ fontSize: 13, color: "#6e6e73" }}>jordan@lumen.app</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#86868b", margin: "18px 0 8px" }}>Status</div>
        <Segmented />
      </div>
    ),
  },
  {
    id: "alerts",
    label: "Notifications",
    icon: I.bell,
    content: (
      <div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#1d1d1f",
            marginBottom: 6,
          }}
        >
          Tell me about
        </div>
        <Toggle label="Mentions and replies" on />
        <Toggle label="New sign-ins" on />
        <Toggle label="Weekly summary" on={false} />
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: I.shield,
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#e8f8ed",
              color: "#1fa846",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Ico d={I.shield} size={24} />
          </div>
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#1d1d1f",
              }}
            >
              Your account is protected
            </div>
            <div style={{ fontSize: 13, color: "#6e6e73" }}>Last checked a minute ago</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {[
            { i: I.key, t: "Passkey on this Mac" },
            { i: I.device, t: "Two-step codes by app" },
          ].map((r) => (
            <div
              key={r.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                background: "#f5f5f7",
                fontSize: 14,
                color: "#1d1d1f",
              }}
            >
              <span style={{ color: "#6e6e73" }}>
                <Ico d={r.i} size={18} />
              </span>
              <span style={{ flex: 1 }}>{r.t}</span>
              <span style={{ color: "#1fa846" }}>
                <Ico d={I.check} size={14} />
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "usage",
    label: "Usage",
    icon: I.chart,
    content: (
      <div>
        <div style={{ fontSize: 13, color: "#6e6e73" }}>Credits used this month</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#1d1d1f",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            1,282
          </span>
          <span style={{ fontSize: 13, color: "#6e6e73" }}>of 2,000 on Pro</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            height: 78,
            marginTop: 10,
          }}
        >
          {[34, 48, 40, 66, 58, 92, 74].map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <motion.div
                initial={{ height: 4 }}
                animate={{ height: `${v * 0.62}px` }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  delay: 0.12 + i * 0.04,
                }}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  background: i === 5 ? "#6e5df6" : "#d9d5fb",
                }}
              />
              <span style={{ fontSize: 11, color: "#86868b" }}>{"MTWTFSS"[i]}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

/**
 * Settings tabs where the chosen tab is part of the card itself: a white bump that grows out of the panel's top
 * with soft fillets at its foot. Pick another tab and the bump runs across like a drop of liquid: its leading edge
 * races ahead, the trailing edge lets go late, it thins as it stretches and then gathers itself round under the new
 * icon with a little overshoot. The content below changes with a soft blur. Arrow keys move between tabs.
 */
export default function LiquidTabs({
  tabs = DEFAULT_TABS,
  defaultTab,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: LiquidTabsProps) {
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
  const start = Math.max(
    0,
    tabs.findIndex((t) => t.id === defaultTab),
  );
  const [active, setActive] = useState(start);
  const activeRef = useRef(start);
  const touched = useRef(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  const slot = (i: number) => X0 + i * (TAB + GAP) - 10;
  const slotW = TAB + 20;
  // the two edges of the bump, on springs of different speeds
  const lead = useMotionValue(slot(start));
  const ta = useMotionValue(slot(start));
  const fast = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 34, mass: 0.8 };
  const slow = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 190, damping: 17, mass: 1 };
  const rightTarget = useTransform(ta, (v) => v + slotW);
  const lf = useSpring(lead, fast);
  const ls = useSpring(lead, slow);
  const rf = useSpring(rightTarget, fast);
  const rs = useSpring(rightTarget, slow);
  // +1 when moving right: the right edge leads
  const dir = useMotionValue(1);
  const left = useTransform([lf, ls, dir], ([f, s2, k]: number[]) => (k > 0 ? s2 : f));
  const right = useTransform([rf, rs, dir], ([f, s2, k]: number[]) => (k > 0 ? f : s2));
  const wobble = useMotionValue(0);
  const d = useTransform([left, right, wobble], ([l, r, w]: number[]) => {
    const a = Math.min(l, r - 30);
    const b = Math.max(r, a + 30);
    // a stretched drop is thinner
    const stretch = Math.max(0, b - a - slotW);
    const h = Math.max(30, BUMP - stretch * 0.07 + w);
    return outline(a, b, h);
  });

  const go = (i: number) => {
    const from = activeRef.current;
    if (i === from) return;
    activeRef.current = i;
    setActive(i);
    onChange?.(tabs[i].id);
    // the edge in the direction of travel leads, the other lets go late
    dir.set(i > from ? 1 : -1);
    lead.set(slot(i));
    ta.set(slot(i));
    sfx.note(380 + i * 70, {
      dur: 0.22,
      gain: 0.05,
      glide: 520 + i * 70,
      bell: 0.15,
    });
    sfx.note(1100 + i * 40, { at: 0.26, dur: 0.12, gain: 0.025, bell: 0.7 });
    if (!reduce)
      animate(wobble, [0, 7, -3, 1.5, 0], {
        duration: 0.75,
        delay: 0.18,
        ease: "easeOut",
      });
  };

  const onKey = (e: RKeyboardEvent) => {
    let n = activeRef.current;
    if (e.key === "ArrowRight") n = (n + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (n - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    else return;
    e.preventDefault();
    touched.current = true;
    go(n);
    btns.current[n]?.focus();
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const order = [3, 1, 2, 0];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      go(order[k++ % order.length] % tabs.length);
    }, 2300);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const tab = tabs[active];
  const H = TOP + PANEL;
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 24) / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outer}
      className={`relative w-full rounded-[24px] bg-[#ececf0] ${className}`}
      style={{
        padding: "44px 12px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <div style={{ width: W * scale, height: H * scale }}>
        <div
          style={{
            position: "relative",
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            aria-hidden="true"
          >
            <defs>
              <filter id={`sh-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.12" />
                <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="#000" floodOpacity="0.07" />
              </filter>
            </defs>
            <motion.path d={d} fill="#ffffff" filter={`url(#sh-${uid})`} />
          </svg>
          <div
            role="tablist"
            aria-label="Account"
            onKeyDown={onKey}
            style={{
              position: "absolute",
              left: X0,
              top: TOP - BUMP + 3,
              display: "flex",
              gap: GAP,
            }}
          >
            {tabs.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    btns.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`t-${uid}-${t.id}`}
                  aria-selected={on}
                  aria-controls={`p-${uid}`}
                  aria-label={t.label}
                  tabIndex={on ? 0 : -1}
                  onClick={() => {
                    touched.current = true;
                    go(i);
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  style={{
                    position: "relative",
                    width: TAB,
                    height: TAB,
                    borderRadius: TAB / 2,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    color: on ? "#1d1d1f" : "#6e6e73",
                  }}
                >
                  <motion.span
                    aria-hidden="true"
                    animate={{ opacity: on ? 0 : 1, scale: on ? 0.6 : 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: TAB,
                      background: "#f9f9fb",
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  />
                  <motion.span
                    animate={on && !reduce ? { y: [0, -3, 0], scale: [1, 1.12, 1] } : { y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: on ? 0.2 : 0 }}
                    style={{ position: "relative" }}
                  >
                    <Ico d={t.icon} size={22} />
                  </motion.span>
                </button>
              );
            })}
          </div>
          <div
            id={`p-${uid}`}
            role="tabpanel"
            aria-labelledby={`t-${uid}-${tab?.id}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: TOP,
              height: PANEL,
              padding: "22px 24px",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={tab?.id}
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {tab?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
