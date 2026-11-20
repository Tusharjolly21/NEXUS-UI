"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ReelItem = {
  id: string;
  title: string;
  icon: keyof typeof I;
  who?: { name: string; role: string; face: string };
  meta?: string;
  body: ReactNode;
  dark?: boolean;
};
export type StackReelProps = {
  items?: ReelItem[];
  start?: number;
  onOpen?: (item: ReelItem) => void;
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
  heart:
    "M72 144H32a8 8 0 0 1 0-16h35.72l13.62-20.44a8 8 0 0 1 13.32 0l25.34 38l9.34-14A8 8 0 0 1 136 128h24a8 8 0 0 1 0 16h-19.72l-13.62 20.44a8 8 0 0 1-13.32 0L88 126.42l-9.34 14A8 8 0 0 1 72 144M178 40c-20.65 0-38.73 8.88-50 23.89C116.73 48.88 98.65 40 78 40a62.07 62.07 0 0 0-62 62v2.25a8 8 0 1 0 16-.5V102a46.06 46.06 0 0 1 46-46c19.45 0 35.78 10.36 42.6 27a8 8 0 0 0 14.8 0c6.82-16.67 23.15-27 42.6-27a46.06 46.06 0 0 1 46 46c0 53.61-77.76 102.15-96 112.8c-10.83-6.31-42.63-26-66.68-52.21a8 8 0 1 0-11.8 10.82c31.17 34 72.93 56.68 74.69 57.63a8 8 0 0 0 7.58 0C136.21 228.66 240 172 240 102a62.07 62.07 0 0 0-62-62",
  tooth:
    "M171 71.42L149.54 80L171 88.57a8 8 0 1 1-6 14.85l-37-14.81l-37 14.81a8 8 0 1 1-6-14.85L106.46 80L85 71.42a8 8 0 1 1 6-14.85l37 14.81l37-14.81a8 8 0 1 1 6 14.85m53 8.33c0 42.72-8 75.4-14.69 95.28c-8.73 25.8-20.63 45.49-32.65 54a15.69 15.69 0 0 1-15.95 1.41a16.09 16.09 0 0 1-9.18-13.36c-.85-11.5-5.05-49.08-23.53-49.08s-22.68 37.59-23.53 49.11a16.09 16.09 0 0 1-16 14.9a15.67 15.67 0 0 1-9.13-2.95c-12-8.53-23.92-28.22-32.65-54C40 155.15 32 122.47 32 79.75A56 56 0 0 1 88 24h80a56 56 0 0 1 56 55.75m-16 0A40 40 0 0 0 168 40H88a40 40 0 0 0-40 39.76c0 40.55 7.51 71.4 13.85 90.14c11.05 32.66 23 43.37 26.61 46C91.57 174.67 105.59 152 128 152s36.45 22.71 39.49 63.94c3.6-2.59 15.57-13.26 26.66-46c6.34-18.78 13.85-49.63 13.85-90.18Z",
  flask:
    "M221.69 199.77L160 96.92V40h8a8 8 0 0 0 0-16H88a8 8 0 0 0 0 16h8v56.92L34.31 199.77A16 16 0 0 0 48 224h160a16 16 0 0 0 13.72-24.23Zm-110.83-96.52a7.93 7.93 0 0 0 1.14-4.11V40h32v59.14a7.93 7.93 0 0 0 1.14 4.11L183.36 167c-12 2.37-29.07 1.37-51.75-10.11c-15.91-8.05-31.05-12.32-45.22-12.81ZM48 208l28.54-47.58c14.25-1.74 30.31 1.85 47.82 10.72c19 9.61 35 12.88 48 12.88a69.9 69.9 0 0 0 19.55-2.7L208 208Z",
  spark:
    "M197.58 129.06L146 110l-19-51.62a15.92 15.92 0 0 0-29.88 0L78 110l-51.62 19a15.92 15.92 0 0 0 0 29.88L78 178l19 51.62a15.92 15.92 0 0 0 29.88 0L146 178l51.62-19a15.92 15.92 0 0 0 0-29.88ZM137 164.22a8 8 0 0 0-4.74 4.74L112 223.85L91.78 169a8 8 0 0 0-4.78-4.78L32.15 144L87 123.78a8 8 0 0 0 4.78-4.78L112 64.15L132.22 119a8 8 0 0 0 4.74 4.74L191.85 144ZM144 40a8 8 0 0 1 8-8h16V16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16h-16v16a8 8 0 0 1-16 0V48h-16a8 8 0 0 1-8-8m104 48a8 8 0 0 1-8 8h-8v8a8 8 0 0 1-16 0v-8h-8a8 8 0 0 1 0-16h8v-8a8 8 0 0 1 16 0v8h8a8 8 0 0 1 8 8",
  bell: "M168 224a8 8 0 0 1-8 8H96a8 8 0 1 1 0-16h64a8 8 0 0 1 8 8m53.85-32a15.8 15.8 0 0 1-13.85 8H48a16 16 0 0 1-13.8-24.06C39.75 166.38 48 139.34 48 104a80 80 0 1 1 160 0c0 35.33 8.26 62.38 13.81 71.94a15.89 15.89 0 0 1 .03 16.06ZM208 184c-7.73-13.27-16-43.95-16-80a64 64 0 1 0-128 0c0 36.06-8.28 66.74-16 80Z",
  caret: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
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

const FACE = {
  kim: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
  prime:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
  smith:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20white%20hair/Medium-Light/3D/man_white_hair_3d_medium-light.png",
};

// an ECG trace that draws itself
function Pulse() {
  const d =
    "M0 30 L40 30 L48 22 L54 30 L66 30 L72 6 L80 48 L86 30 L100 30 L108 24 L114 30 L150 30 L158 22 L164 30 L176 30 L182 6 L190 48 L196 30 L210 30 L218 24 L224 30 L240 30";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
      <svg viewBox="0 0 240 54" width="100%" height="54" style={{ flex: 1 }} aria-hidden="true">
        <motion.path
          d={d}
          fill="none"
          stroke="#ff4d5e"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>72</div>
        <div style={{ fontSize: 10.5, color: "#8e8e93" }}>bpm, resting</div>
      </div>
    </div>
  );
}
function Bars() {
  const v = [0.42, 0.6, 0.38, 0.7, 0.52, 0.86, 0.48, 0.64, 0.4, 0.74];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 10.5 }}>
        <span
          style={{
            padding: "3px 7px",
            borderRadius: 7,
            background: "#e8f8ec",
            color: "#1f8a3d",
          }}
        >
          Dental health +9%
        </span>
        <span
          style={{
            padding: "3px 7px",
            borderRadius: 7,
            background: "#fdecec",
            color: "#c4271c",
          }}
        >
          LDL 158
        </span>
        <span
          style={{
            padding: "3px 7px",
            borderRadius: 7,
            background: "#fff4e0",
            color: "#a35a00",
          }}
        >
          Vitamin D low
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: 50,
          marginTop: 12,
        }}
      >
        {v.map((h, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 + i * 0.03,
            }}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 4,
              background: i === 5 ? "#2f6bff" : i % 3 === 0 ? "#d9e4ff" : "#eef1f6",
              transformOrigin: "50% 100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
function Results() {
  const r = [
    ["Glucose", 0.62, "92 mg/dL"],
    ["Iron", 0.38, "54 ug/dL"],
    ["B12", 0.8, "610 pg/mL"],
  ] as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {r.map(([n, p, v], i) => (
        <div
          key={n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11.5,
          }}
        >
          <span style={{ width: 52, color: "#6e6e73" }}>{n}</span>
          <span
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: "#eef0f3",
              overflow: "hidden",
            }}
          >
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${p * 100}%` }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                delay: 0.1 + i * 0.08,
              }}
              style={{
                display: "block",
                height: "100%",
                borderRadius: 3,
                background: p < 0.45 ? "#ff9f0a" : "#34c759",
              }}
            />
          </span>
          <span
            style={{
              width: 64,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
function Teeth() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 3,
          flex: 1,
        }}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 22,
              delay: 0.05 + i * 0.02,
            }}
            style={{
              height: 18,
              borderRadius: i < 8 ? "6px 6px 3px 3px" : "3px 3px 6px 6px",
              background: i === 5 || i === 12 ? "#ffd8a8" : "#f1f3f6",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", lineHeight: 1.35 }}>
        Next visit
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>Mar 3, 9:30</div>
      </div>
    </div>
  );
}
function Reminder() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 19,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Annual health check reminder
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "rgba(255,255,255,0.7)",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          Regular check-ups catch problems early. Put yours on the calendar.
        </div>
      </div>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: "rgba(255,255,255,0.18)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          flex: "none",
        }}
      >
        <Ico d={I.caret} size={14} />
      </span>
    </div>
  );
}

const DEFAULT_ITEMS: ReelItem[] = [
  {
    id: "heart",
    title: "Heart Check",
    icon: "heart",
    who: { name: "Dr. Alicia Kim", role: "Cardiologist", face: FACE.kim },
    body: <Pulse />,
  },
  {
    id: "remind",
    title: "Jan 24, Wed",
    icon: "bell",
    meta: "In 6 days",
    dark: true,
    body: <Reminder />,
  },
  {
    id: "report",
    title: "AI Report",
    icon: "spark",
    meta: "8 issues found",
    body: <Bars />,
  },
  {
    id: "dental",
    title: "Dental Check",
    icon: "tooth",
    who: { name: "Dr. Alex Prime", role: "Dentist", face: FACE.prime },
    body: <Teeth />,
  },
  {
    id: "labs",
    title: "Labs",
    icon: "flask",
    who: { name: "Dr. John Smith", role: "Phlebotomist", face: FACE.smith },
    body: <Results />,
  },
];

const OPEN_H = 168;
const PILL_H = 46;
const GAP = 10;

/**
 * A reel of health cards. The one in the middle is open, showing its details; the ones around it fold to slim pills
 * with just the name and who it's with, fading out towards the edges. Scroll, drag or use the arrow keys and the
 * reel rolls round: the open card folds as the next one grows out of its pill on a spring and fills in.
 */
export default function StackReel({
  items = DEFAULT_ITEMS,
  start = 0,
  onOpen,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: StackReelProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [act, setAct] = useState(start);
  const actRef = useRef(act);
  actRef.current = act;
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const n = items.length;

  const go = (k: number) => {
    const v = ((k % n) + n) % n;
    if (v === actRef.current) return;
    setAct(v);
    onOpen?.(items[v]);
    sfx.tick({ freq: 1300 + v * 120, gain: 0.04 });
    sfx.whoosh(900, 1600, { dur: 0.25, gain: 0.015 });
  };

  const wheel = useRef(0);
  const drag = useRef<{ y: number; k: number } | null>(null);

  // autoplay: roll down through a few, then back up
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const run = async () => {
      await wait(1300);
      const W = box.current?.clientWidth ?? 320;
      const Hh = box.current?.clientHeight ?? 400;
      while (ok()) {
        for (let k = 0; k < 3 && ok(); k++) {
          go(actRef.current + 1);
          await wait(1700);
        }
        if (!ok()) return;
        // click the pill above
        setGhost(true);
        const y = Hh / 2 - OPEN_H / 2 - GAP - PILL_H / 2;
        await Promise.all([animate(gx, W / 2 + 40, { duration: 0.6 }), animate(gy, y, { duration: 0.6 })]);
        setGhostDown(true);
        await wait(110);
        setGhostDown(false);
        go(actRef.current - 1);
        await wait(1500);
        setGhost(false);
        go(actRef.current + 1);
        await wait(1500);
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

  const offset = (i: number) => {
    let d = i - act;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };
  const yOf = (d: number) => {
    if (d === 0) return 0;
    const s = Math.sign(d);
    const a = Math.abs(d);
    return s * (OPEN_H / 2 + GAP + PILL_H / 2 + (a - 1) * (PILL_H + GAP));
  };
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 32 };
  const ids = useMemo(() => items.map((it) => it.id).join(), [items]);

  return (
    <div
      className={`relative w-full max-w-[420px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={box}
        key={ids}
        role="listbox"
        aria-label="Health"
        aria-activedescendant={`reel-${items[act].id}`}
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.isTrusted) touched.current = true;
          drag.current = { y: e.clientY, k: act };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || e.buttons === 0) return;
          const step = Math.round((d.y - e.clientY) / 60);
          if (step) {
            go(d.k + step);
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onWheel={(e) => {
          touched.current = true;
          wheel.current += e.deltaY;
          if (Math.abs(wheel.current) > 50) {
            go(actRef.current + Math.sign(wheel.current));
            wheel.current = 0;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            touched.current = true;
            go(actRef.current + (e.key === "ArrowDown" ? 1 : -1));
          }
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-black/15"
        style={{
          position: "relative",
          height: 420,
          borderRadius: 28,
          background: "#f0f0f0",
          overflow: "hidden",
          touchAction: "none",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 22%, #000 78%, transparent 100%)",
          maskImage: "linear-gradient(180deg, transparent 0, #000 22%, #000 78%, transparent 100%)",
        }}
      >
        {items.map((it, i) => {
          const d = offset(i);
          const open = d === 0;
          const a = Math.abs(d);
          if (a > 3) return null;
          return (
            <motion.div
              key={it.id}
              id={`reel-${it.id}`}
              role="option"
              aria-selected={open}
              onClick={() => {
                touched.current = true;
                if (!open) go(i);
              }}
              initial={false}
              animate={{
                y: yOf(d) - (open ? OPEN_H : PILL_H) / 2,
                height: open ? OPEN_H : PILL_H,
                width: open ? 280 : 250,
                opacity: a >= 3 ? 0 : a === 2 ? 0.55 : 1,
                borderRadius: open ? 26 : 23,
                backgroundColor: open && it.dark ? "#10294d" : "#ffffff",
              }}
              transition={spring}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                x: "-50%",
                boxShadow: open
                  ? "0 18px 40px -22px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.03)"
                  : "0 0 0 1px rgba(0,0,0,0.04)",
                overflow: "hidden",
                cursor: open ? "default" : "pointer",
                zIndex: 10 - a,
                color: open && it.dark ? "#fff" : "#1d1d1f",
              }}
            >
              {open && it.dark && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(120% 80% at 85% 10%, rgba(91,169,255,0.55), transparent 60%), radial-gradient(80% 60% at 10% 100%, rgba(30,90,200,0.6), transparent 70%)",
                  }}
                />
              )}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: PILL_H,
                  padding: "0 12px 0 14px",
                }}
              >
                <span style={{ color: open && it.dark ? "#fff" : "#3a3a3c" }}>
                  <Ico d={I[it.icon]} size={15} />
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 550,
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.title}
                </span>
                {it.who ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: "#f2f2f5",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <img
                        src={it.who.face}
                        alt=""
                        width={17}
                        height={17}
                        draggable={false}
                        style={{ width: 17, height: 17 }}
                      />
                    </span>
                    <span style={{ lineHeight: 1.15 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {it.who.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#8e8e93",
                        }}
                      >
                        {it.who.role}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10.5,
                      color: open && it.dark ? "rgba(255,255,255,0.7)" : "#8e8e93",
                    }}
                  >
                    {it.meta}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {open && (
                  <motion.div
                    key="body"
                    initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ delay: 0.12, duration: 0.3 }}
                    style={{ position: "relative", padding: "6px 16px 16px" }}
                  >
                    {it.body}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(0,0,0,0.16)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 30,
            }}
          />
        )}
      </div>
    </div>
  );
}
