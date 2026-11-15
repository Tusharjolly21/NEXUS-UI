"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PaletteItem = {
  id: string;
  group: string;
  label: string;
  /** a line for the preview */
  hint: string;
  /** a Phosphor duotone icon, as [path, opacity] pairs; or initials for a person */
  icon?: [string, number][];
  initials?: string;
  /** a picture of a person (a cut-out sits best), shown instead of the initials */
  avatar?: string;
  color: string;
  /** keys shown at the end of the row, like ["⌘", "N"] */
  keys?: string[];
  /** what the trigger says when it's run */
  done: string;
  meta?: [string, string][];
};
export type PrismCommandPaletteProps = {
  items?: PaletteItem[];
  onRun?: (item: PaletteItem) => void;
  placeholder?: string;
  /** Soft sounds: opening, moving, running. They also follow the site-wide sound switch. */
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
  search:
    "m229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32M40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72",
  enter:
    "M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0",
  check:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  up: "M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32",
  down: "m205.66 149.66l-72 72a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 11.32-11.32L120 196.69V40a8 8 0 0 1 16 0v156.69l58.34-58.35a8 8 0 0 1 11.32 11.32",
};
const D = {
  house: [
    ["M216 120v96h-64v-64h-48v64H40v-96a8 8 0 0 1 2.34-5.66l80-80a8 8 0 0 1 11.32 0l80 80A8 8 0 0 1 216 120", 0.2],
    [
      "m219.31 108.68l-80-80a16 16 0 0 0-22.62 0l-80 80A15.87 15.87 0 0 0 32 120v96a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-56h32v56a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-96a15.87 15.87 0 0 0-4.69-11.32M208 208h-48v-56a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v56H48v-88l80-80l80 80Z",
      1,
    ],
  ],
  folder: [
    [
      "M224 88v112.89a7.11 7.11 0 0 1-7.11 7.11H40a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h53.33a8 8 0 0 1 4.8 1.6L128 80h88a8 8 0 0 1 8 8",
      0.2,
    ],
    [
      "M216 72h-85.33l-27.74-20.8a16.12 16.12 0 0 0-9.6-3.2H40a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h176.89A15.13 15.13 0 0 0 232 200.89V88a16 16 0 0 0-16-16m0 128H40V64h53.33l29.87 22.4A8 8 0 0 0 128 88h88Z",
      1,
    ],
  ],
  cal: [
    ["M216 48v40H40V48a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8", 0.2],
    [
      "M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M72 48v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48V48Zm136 160H48V96h160z",
      1,
    ],
  ],
  tray: [
    [
      "M216 48v112h-36.69a8 8 0 0 0-5.66 2.34l-19.31 19.32a8 8 0 0 1-5.66 2.34h-41.37a8 8 0 0 1-5.66-2.34l-19.31-19.32a8 8 0 0 0-5.66-2.34H40V48a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8",
      0.2,
    ],
    [
      "M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 16v104h-28.7a15.86 15.86 0 0 0-11.3 4.69L148.69 176h-41.38L88 156.68A15.9 15.9 0 0 0 76.69 152H48V48Zm0 160H48v-40h28.69L96 187.32a15.9 15.9 0 0 0 11.31 4.68h41.38a15.86 15.86 0 0 0 11.31-4.69L179.31 168H208z",
      1,
    ],
  ],
  plus: [
    ["M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96", 0.2],
    [
      "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m48-88a8 8 0 0 1-8 8h-32v32a8 8 0 0 1-16 0v-32H88a8 8 0 0 1 0-16h32V88a8 8 0 0 1 16 0v32h32a8 8 0 0 1 8 8",
      1,
    ],
  ],
  invite: [
    ["M168 100a60 60 0 1 1-60-60a60 60 0 0 1 60 60", 0.2],
    [
      "M256 136a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16v-16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-57.87 58.85a8 8 0 0 1-12.26 10.3C165.75 181.19 138.09 168 108 168s-57.75 13.19-77.87 37.15a8 8 0 0 1-12.25-10.3c14.94-17.78 33.52-30.41 54.17-37.17a68 68 0 1 1 71.9 0c20.65 6.76 39.23 19.39 54.18 37.17M108 152a52 52 0 1 0-52-52a52.06 52.06 0 0 0 52 52",
      1,
    ],
  ],
  moon: [
    ["M227.89 147.89A96 96 0 1 1 108.11 28.11a96.09 96.09 0 0 0 119.78 119.78", 0.2],
    [
      "M233.54 142.23a8 8 0 0 0-8-2a88.08 88.08 0 0 1-109.8-109.8a8 8 0 0 0-10-10a104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.1 103.1 0 0 0 62.52-20.88a104.84 104.84 0 0 0 37-52.91a8 8 0 0 0-1.98-7.98m-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104a106 106 0 0 0 14.92-1.06a89 89 0 0 1-26.02 31.4",
      1,
    ],
  ],
  export: [
    ["M208 104v112H48V104Z", 0.2],
    [
      "M216 112v96a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16v-96a16 16 0 0 1 16-16h24a8 8 0 0 1 0 16H56v96h144v-96h-24a8 8 0 0 1 0-16h24a16 16 0 0 1 16 16M93.66 69.66L120 43.31V136a8 8 0 0 0 16 0V43.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32",
      1,
    ],
  ],
  chart: [
    ["M224 64v144H32V48h176a16 16 0 0 1 16 16", 0.2],
    [
      "M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v108.69l50.34-50.35a8 8 0 0 1 11.32 0L128 132.69L180.69 80H160a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8v40a8 8 0 0 1-16 0V91.31l-58.34 58.35a8 8 0 0 1-11.32 0L96 123.31l-56 56V200h184a8 8 0 0 1 8 8",
      1,
    ],
  ],
  gear: [
    [
      "m230.1 108.76l-31.85-18.14c-.64-1.16-1.31-2.29-2-3.41l-.12-36A104.6 104.6 0 0 0 162 32l-32 17.89h-4L94 32a104.6 104.6 0 0 0-34.11 19.25l-.16 36c-.7 1.12-1.37 2.26-2 3.41l-31.84 18.1a99.2 99.2 0 0 0 0 38.46l31.85 18.14c.64 1.16 1.31 2.29 2 3.41l.12 36A104.6 104.6 0 0 0 94 224l32-17.87h4L162 224a104.6 104.6 0 0 0 34.08-19.25l.16-36c.7-1.12 1.37-2.26 2-3.41l31.84-18.1a99.2 99.2 0 0 0 .02-38.48M128 168a40 40 0 1 1 40-40a40 40 0 0 1-40 40",
      0.2,
    ],
    [
      "M128 80a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32m109.94-52.79a8 8 0 0 0-3.89-5.4l-29.83-17l-.12-33.62a8 8 0 0 0-2.83-6.08a111.9 111.9 0 0 0-36.72-20.67a8 8 0 0 0-6.46.59L128 41.85L97.88 25a8 8 0 0 0-6.47-.6a111.9 111.9 0 0 0-36.68 20.75a8 8 0 0 0-2.83 6.07l-.15 33.65l-29.83 17a8 8 0 0 0-3.89 5.4a106.5 106.5 0 0 0 0 41.56a8 8 0 0 0 3.89 5.4l29.83 17l.12 33.63a8 8 0 0 0 2.83 6.08a111.9 111.9 0 0 0 36.72 20.67a8 8 0 0 0 6.46-.59L128 214.15L158.12 231a7.9 7.9 0 0 0 3.9 1a8.1 8.1 0 0 0 2.57-.42a112.1 112.1 0 0 0 36.68-20.73a8 8 0 0 0 2.83-6.07l.15-33.65l29.83-17a8 8 0 0 0 3.89-5.4a106.5 106.5 0 0 0-.03-41.52m-15 34.91l-28.57 16.25a8 8 0 0 0-3 3c-.58 1-1.19 2.06-1.81 3.06a7.94 7.94 0 0 0-1.22 4.21l-.15 32.25a95.9 95.9 0 0 1-25.37 14.3L134 199.13a8 8 0 0 0-3.91-1h-3.83a8.1 8.1 0 0 0-4.1 1l-28.84 16.1A96 96 0 0 1 67.88 201l-.11-32.2a8 8 0 0 0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.1 8.1 0 0 0-3-3.06l-28.6-16.29a90.5 90.5 0 0 1 0-28.26l28.52-16.28a8 8 0 0 0 3-3c.58-1 1.19-2.06 1.81-3.06a7.94 7.94 0 0 0 1.22-4.21l.15-32.25a95.9 95.9 0 0 1 25.37-14.3L122 56.87a8 8 0 0 0 4.1 1h3.64a8 8 0 0 0 4.1-1l28.84-16.1A96 96 0 0 1 188.12 55l.11 32.2a8 8 0 0 0 1.22 4.22c.62 1 1.23 2 1.8 3.06a8.1 8.1 0 0 0 3 3.06l28.6 16.29a90.5 90.5 0 0 1 .05 28.29Z",
      1,
    ],
  ],
} as unknown as Record<string, [string, number][]>;
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);
const Duo = ({ p, size }: { p: [string, number][]; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    {p.map(([d, o], i) => (
      <path key={i} fill="currentColor" d={d} opacity={o} />
    ))}
  </svg>
);

const DEFAULT_ITEMS: PaletteItem[] = [
  {
    id: "home",
    group: "Go to",
    label: "Dashboard",
    hint: "Your week at a glance: revenue, orders and the team's activity.",
    icon: D.house,
    color: "#0071e3",
    keys: ["G", "D"],
    done: "Opened Dashboard",
    meta: [
      ["Updated", "2 min ago"],
      ["Widgets", "8"],
    ],
  },
  {
    id: "projects",
    group: "Go to",
    label: "Projects",
    hint: "Every project, with its owner, status and next deadline.",
    icon: D.folder,
    color: "#ff9f0a",
    keys: ["G", "P"],
    done: "Opened Projects",
    meta: [
      ["Active", "12"],
      ["Due this week", "3"],
    ],
  },
  {
    id: "calendar",
    group: "Go to",
    label: "Calendar",
    hint: "Meetings, launches and time off across the team.",
    icon: D.cal,
    color: "#ff375f",
    keys: ["G", "C"],
    done: "Opened Calendar",
    meta: [
      ["Today", "4 events"],
      ["Next", "Design review, 3 PM"],
    ],
  },
  {
    id: "inbox",
    group: "Go to",
    label: "Inbox",
    hint: "Mentions, approvals and messages waiting for you.",
    icon: D.tray,
    color: "#30d158",
    keys: ["G", "I"],
    done: "Opened Inbox",
    meta: [
      ["Unread", "7"],
      ["Mentions", "2"],
    ],
  },
  {
    id: "analytics",
    group: "Go to",
    label: "Analytics",
    hint: "Traffic, conversion and retention, with cohorts.",
    icon: D.chart,
    color: "#5e5ce6",
    done: "Opened Analytics",
    meta: [
      ["Visitors", "48.2k this week"],
      ["Conversion", "3.4%"],
    ],
  },
  {
    id: "new",
    group: "Actions",
    label: "New project",
    hint: "Start a project from scratch or from a template.",
    icon: D.plus,
    color: "#0071e3",
    keys: ["⌘", "N"],
    done: "Project created",
    meta: [["Templates", "Launch, Sprint, Research"]],
  },
  {
    id: "invite",
    group: "Actions",
    label: "Invite a teammate",
    hint: "Send an invite by email; they join as an editor.",
    icon: D.invite,
    color: "#bf5af2",
    keys: ["⌘", "I"],
    done: "Invite sent",
    meta: [["Seats left", "4 of 10"]],
  },
  {
    id: "export",
    group: "Actions",
    label: "Export report",
    hint: "This month's report as a PDF, ready to share.",
    icon: D.export,
    color: "#ff9f0a",
    keys: ["⌘", "E"],
    done: "Report exported",
    meta: [
      ["Format", "PDF"],
      ["Pages", "14"],
    ],
  },
  {
    id: "dark",
    group: "Actions",
    label: "Switch to dark mode",
    hint: "Easier on the eyes in the evening.",
    icon: D.moon,
    color: "#1d1d1f",
    keys: ["⌘", "⇧", "L"],
    done: "Dark mode on",
    meta: [["Follows system", "Off"]],
  },
  {
    id: "settings",
    group: "Actions",
    label: "Settings",
    hint: "Workspace, billing, notifications and security.",
    icon: D.gear,
    color: "#8e8e93",
    keys: ["⌘", ","],
    done: "Opened Settings",
  },
  {
    id: "mia",
    group: "People",
    label: "Amara Obi",
    hint: "Product designer. Usually replies within an hour.",
    initials: "AO",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Light/3D/woman_curly_hair_3d_light.png",
    color: "#ff375f",
    done: "Opened Amara's profile",
    meta: [
      ["Team", "Design"],
      ["Local time", "9:41 AM"],
    ],
  },
  {
    id: "theo",
    group: "People",
    label: "Theo Park",
    hint: "Engineering lead. In meetings until 2 PM.",
    initials: "TP",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    color: "#0a84ff",
    done: "Opened Theo's profile",
    meta: [
      ["Team", "Platform"],
      ["Local time", "5:41 PM"],
    ],
  },
  {
    id: "ana",
    group: "People",
    label: "Ana Souza",
    hint: "Marketing. Out of office this week.",
    initials: "AS",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
    color: "#30d158",
    done: "Opened Ana's profile",
    meta: [
      ["Team", "Growth"],
      ["Back", "Monday"],
    ],
  },
];

/** a loose match: the letters in order, scored for runs and word starts; returns the matched positions */
function match(q: string, text: string) {
  if (!q) return { score: 0, at: [] as number[] };
  const t = text.toLowerCase(),
    s = q.toLowerCase();
  const at: number[] = [];
  let score = 0,
    j = 0,
    prev = -2;
  for (let i = 0; i < t.length && j < s.length; i++) {
    if (t[i] === s[j]) {
      at.push(i);
      score += 1 + (i === prev + 1 ? 2 : 0) + (i === 0 || t[i - 1] === " " ? 3 : 0);
      prev = i;
      j++;
    }
  }
  return j === s.length ? { score: score - t.length * 0.02, at } : null;
}

/**
 * A command palette that opens out of its own trigger.
 *
 * Press ⌘K (or Ctrl K) or click the pill and the pill grows into the palette in one motion. Type a few letters: the
 * results narrow with a loose match, the matched letters lit in blue, best first. A pane of glass slides between
 * results as you move, with a faint prism along its edge, and the preview beside the list swaps to tell you what the
 * highlighted one is. Press Enter and the row flashes, the palette folds back down into the pill, and the pill tells
 * you what happened. Arrow keys wrap, Escape closes, and a click outside folds it away.
 *   <PrismCommandPalette onRun={(item) => router.push(item.id)} />
 */
export default function PrismCommandPalette({
  items = DEFAULT_ITEMS,
  onRun,
  placeholder = "Search or run a command",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: PrismCommandPaletteProps) {
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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [done, setDone] = useState<PaletteItem | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [wide, setWide] = useState(true);
  const cb = useRef(onRun);
  cb.current = onRun;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWide(el.clientWidth >= 520));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const results = useMemo(() => {
    const r = items
      .map((it) => ({ it, m: match(q, it.label) }))
      .filter((x) => x.m)
      .sort((a, b) => (q ? b.m!.score - a.m!.score : 0));
    // grouped, in the order the groups first appear
    const groups: {
      name: string;
      rows: { it: PaletteItem; at: number[] }[];
    }[] = [];
    r.forEach(({ it, m }) => {
      let g = groups.find((x) => x.name === it.group);
      if (!g) groups.push((g = { name: it.group, rows: [] }));
      g.rows.push({ it, at: m!.at });
    });
    return groups;
  }, [q, items]);
  const flat = results.flatMap((g) => g.rows);
  const current = flat[Math.min(sel, flat.length - 1)]?.it ?? null;

  const show = (v: boolean) => {
    setOpen(v);
    if (v) {
      setQ("");
      setSel(0);
      setDone(null);
      sfx.whoosh(500, 1300, { dur: 0.22, gain: 0.025 });
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else sfx.whoosh(1300, 500, { dur: 0.2, gain: 0.02 });
  };
  const move = (n: number) => {
    if (!flat.length) return;
    setSel((s) => (s + n + flat.length) % flat.length);
    sfx.tick({ freq: 2100, gain: 0.014 });
  };
  const run = (it: PaletteItem | null) => {
    if (!it) return;
    setFlash(it.id);
    sfx.note(880, { dur: 0.25, gain: 0.03, bell: 0.6 });
    sfx.note(1320, { at: 0.08, dur: 0.35, gain: 0.025, bell: 0.6 });
    cb.current?.(it);
    window.setTimeout(
      () => {
        setFlash(null);
        setOpen(false);
        setDone(it);
        window.setTimeout(() => setDone((d) => (d === it ? null : d)), 1900);
      },
      reduce ? 0 : 220,
    );
  };
  // keep the highlighted row in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [sel, q]);
  useEffect(() => setSel(0), [q]);

  // ⌘K anywhere, while it's on screen
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        touched.current = true;
        unlockAudio();
        show(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, open]);

  const onKeyDown = (e: RKeyboardEvent) => {
    touched.current = true;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(current);
    } else if (e.key === "Escape") {
      e.preventDefault();
      show(false);
    }
  };

  // autoplay: someone opens it, types, looks around, runs something
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const type = async (s: string) => {
      for (let i = 1; i <= s.length && ok(); i++) {
        setQ(s.slice(0, i));
        await wait(110 + Math.random() * 70);
      }
    };
    (async () => {
      const plays: [string, number][] = [
        ["pro", 0],
        ["inv", 0],
        ["", 3],
        ["mia", 0],
      ];
      let k = 0;
      await wait(900);
      while (ok()) {
        const [s, down] = plays[k++ % plays.length];
        setOpen(true);
        setQ("");
        setSel(0);
        setDone(null);
        await wait(700);
        await type(s);
        await wait(500);
        for (let i = 0; i < down && ok(); i++) {
          setSel((x) => x + 1);
          await wait(420);
        }
        await wait(900);
        if (!ok()) return;
        setFlash("auto");
        await wait(200);
        setFlash(null);
        setOpen(false);
        setDone({
          id: "auto",
          group: "",
          label: "",
          hint: "",
          color: "#30d158",
          done:
            s === "inv"
              ? "Invite sent"
              : s === "mia"
                ? "Opened Amara's profile"
                : s === "pro"
                  ? "Opened Projects"
                  : "Opened Inbox",
        });
        await wait(2400);
        setDone(null);
        await wait(700);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };
  let i = -1;

  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`relative w-full max-w-[640px] overflow-hidden rounded-[28px] text-[#1d1d1f] ${className}`}
      style={{
        height: 440,
        background: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f1f2f6 70%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 30px 60px -40px rgba(0,0,0,.35)",
      }}
    >
      {/* a quiet dot grid, the kind of surface a palette sits over */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,.08) 1px, transparent 1.2px)",
          backgroundSize: "18px 18px",
          maskImage: "radial-gradient(70% 70% at 50% 40%, #000, transparent)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 40%, #000, transparent)",
        }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            key="dim"
            aria-hidden="true"
            className="absolute inset-0 bg-[#f1f2f6]/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => show(false)}
          />
        )}
      </AnimatePresence>

      <LayoutGroup>
        <div className={`absolute inset-x-0 flex justify-center px-4 ${open ? "top-6" : "top-[42%]"}`}>
          {!open ? (
            <motion.button
              layoutId="prism-shell"
              transition={spring}
              type="button"
              aria-haspopup="dialog"
              aria-keyshortcuts="Meta+K Control+K"
              onClick={() => {
                touched.current = true;
                unlockAudio();
                show(true);
              }}
              className="relative flex h-11 items-center gap-2.5 overflow-hidden bg-white pl-3.5 pr-2 text-[14px] text-[#86868b] outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
              style={{
                borderRadius: 14,
                boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 8px 20px -10px rgba(0,0,0,.25)",
              }}
            >
              {/* the words wait until the palette has folded down, so they're never stretched by the morph */}
              <motion.span
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.26, duration: 0.18 }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {done ? (
                    <motion.span
                      key="done"
                      className="flex items-center gap-2 font-medium text-[#1d1d1f]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <motion.span
                        className="text-[#30d158]"
                        initial={{ scale: 0.4, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 18,
                        }}
                      >
                        <Ico d={I.check} size={18} />
                      </motion.span>
                      {done.done}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      className="flex items-center gap-2.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Ico d={I.search} size={17} />
                      {placeholder}
                      <span className="ml-3 flex gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>K</Kbd>
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </motion.button>
          ) : (
            <motion.div
              layoutId="prism-shell"
              transition={spring}
              role="dialog"
              aria-label="Command palette"
              className="relative w-full max-w-[600px] overflow-hidden bg-white/90 backdrop-blur-xl"
              style={{
                borderRadius: 20,
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset, 0 30px 70px -24px rgba(20,30,60,.35), 0 12px 24px -16px rgba(0,0,0,.2)",
              }}
            >
              {/* a prism catching the light along the top edge as it opens */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, #7dd3fc, #c4b5fd, #f9a8d4, #fde68a, transparent)",
                }}
                initial={{ opacity: 0, scaleX: 0.2 }}
                animate={{ opacity: [0, 1, 0.5], scaleX: 1 }}
                transition={{ duration: reduce ? 0 : 0.9 }}
              />
              <Grain />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: reduce ? 0 : 0.14, duration: 0.2 }}
              >
                <div className="flex items-center gap-3 border-b border-black/[.06] px-4">
                  <span className="text-[#86868b]">
                    <Ico d={I.search} size={18} />
                  </span>
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => {
                      touched.current = true;
                      setQ(e.target.value);
                      sfx.tick({ freq: 2600, gain: 0.008 });
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="prism-list"
                    aria-activedescendant={current ? `prism-${current.id}` : undefined}
                    className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6]"
                  />
                  <button
                    type="button"
                    onClick={() => show(false)}
                    className="shrink-0 rounded-md outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
                    aria-label="Close"
                  >
                    <Kbd>esc</Kbd>
                  </button>
                </div>
                <div className="flex" style={{ height: 300 }}>
                  <div
                    ref={listRef}
                    id="prism-list"
                    role="listbox"
                    aria-label="Results"
                    className={`relative overflow-y-auto overscroll-contain p-2 ${wide ? "w-[56%]" : "w-full"}`}
                    style={{ scrollbarWidth: "none" }}
                  >
                    {flat.length === 0 && (
                      <div className="grid h-full place-items-center text-center">
                        <div>
                          <div className="text-[15px] font-semibold">Nothing for “{q}”</div>
                          <div className="mt-1 text-[13px] text-[#86868b]">Try a page, an action or a name.</div>
                        </div>
                      </div>
                    )}
                    {results.map((g) => (
                      <div key={g.name} role="group" aria-label={g.name} className="mb-1">
                        <div className="px-2.5 pb-1 pt-2 text-[12px] font-medium text-[#86868b]">{g.name}</div>
                        {g.rows.map(({ it, at }) => {
                          i++;
                          const k = i;
                          const on = k === sel;
                          return (
                            <motion.div
                              key={it.id}
                              id={`prism-${it.id}`}
                              data-i={k}
                              role="option"
                              aria-selected={on}
                              layout={reduce ? false : "position"}
                              transition={spring}
                              onPointerMove={() => k !== sel && setSel(k)}
                              onClick={() => {
                                touched.current = true;
                                run(it);
                              }}
                              className="relative flex h-11 cursor-pointer items-center gap-3 rounded-[12px] px-2.5"
                            >
                              {on && (
                                <motion.div
                                  layoutId="prism-sel"
                                  transition={
                                    reduce
                                      ? { duration: 0 }
                                      : {
                                          type: "spring",
                                          stiffness: 520,
                                          damping: 40,
                                        }
                                  }
                                  aria-hidden="true"
                                  className="absolute inset-0 rounded-[12px]"
                                  style={{
                                    background: "linear-gradient(180deg, rgba(0,113,227,.10), rgba(0,113,227,.06))",
                                    boxShadow:
                                      "inset 0 0 0 1px rgba(0,113,227,.18), inset 0 1px 0 rgba(255,255,255,.7), 0 6px 14px -10px rgba(0,113,227,.6)",
                                  }}
                                >
                                  {/* the prism: a thin spectrum along the glass's leading edge */}
                                  <span
                                    className="absolute inset-y-2 left-0 w-[3px] rounded-full"
                                    style={{
                                      background: "linear-gradient(180deg, #7dd3fc, #a78bfa, #f472b6)",
                                    }}
                                  />
                                </motion.div>
                              )}
                              {flash === it.id && (
                                <motion.div
                                  aria-hidden="true"
                                  className="absolute inset-0 rounded-[12px] bg-[#0071e3]/25"
                                  initial={{ opacity: 0.9, scale: 0.96 }}
                                  animate={{ opacity: 0, scale: 1.03 }}
                                  transition={{ duration: 0.35 }}
                                />
                              )}
                              <Glyph it={it} size={28} />
                              <span className="relative min-w-0 flex-1 truncate text-[14px] font-medium">
                                {it.label.split("").map((ch, c) => (
                                  <span
                                    key={c}
                                    style={at.includes(c) ? { color: "#0071e3", fontWeight: 650 } : undefined}
                                  >
                                    {ch}
                                  </span>
                                ))}
                              </span>
                              {it.keys && (
                                <span className="relative flex gap-1">
                                  {it.keys.map((x) => (
                                    <Kbd key={x}>{x}</Kbd>
                                  ))}
                                </span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {wide && (
                    <div className="relative w-[44%] border-l border-black/[.06] p-5">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {current && (
                          <motion.div
                            key={current.id}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 34,
                              filter: { duration: 0.18 },
                            }}
                          >
                            <Glyph it={current} size={52} />
                            <div className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{current.label}</div>
                            <div className="mt-1.5 text-[13px] leading-[1.45] text-[#6e6e73]">{current.hint}</div>
                            {current.meta && (
                              <dl className="mt-4 space-y-2 border-t border-black/[.06] pt-3">
                                {current.meta.map(([k, v]) => (
                                  <div key={k} className="flex justify-between gap-3 text-[12px]">
                                    <dt className="text-[#86868b]">{k}</dt>
                                    <dd className="truncate font-medium">{v}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 border-t border-black/[.06] px-4 py-2.5 text-[12px] text-[#86868b]">
                  <span className={`items-center gap-1.5 ${wide ? "flex" : "hidden"}`}>
                    <Kbd>
                      <Ico d={I.up} size={11} />
                    </Kbd>
                    <Kbd>
                      <Ico d={I.down} size={11} />
                    </Kbd>
                    to move
                  </span>
                  <span className={`items-center gap-1.5 ${wide ? "flex" : "hidden"}`}>
                    <Kbd>
                      <Ico d={I.enter} size={11} />
                    </Kbd>
                    to run
                  </span>
                  <span className="ml-auto tabular-nums">{flat.length} results</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="grid h-[22px] min-w-[22px] place-items-center rounded-[6px] bg-white px-1.5 font-sans text-[11px] font-medium text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.1),0_1px_0_rgba(0,0,0,.08)]">
      {children}
    </kbd>
  );
}
function Glyph({ it, size }: { it: PaletteItem; size: number }) {
  const r = Math.round(size * 0.3);
  if (it.initials)
    return (
      <span
        className="relative grid shrink-0 place-items-center rounded-full font-semibold text-white"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          background: it.avatar ? `${it.color}33` : `linear-gradient(160deg, ${it.color}cc, ${it.color})`,
          boxShadow: it.avatar
            ? `inset 0 0 0 1px ${it.color}22`
            : `inset 0 1px 0 rgba(255,255,255,.35), 0 4px 10px -6px ${it.color}`,
          overflow: "hidden",
        }}
      >
        {it.avatar ? (
          <img
            src={it.avatar}
            alt=""
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
        ) : (
          it.initials
        )}
      </span>
    );
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        color: it.color,
        background: `${it.color}14`,
        boxShadow: `inset 0 0 0 1px ${it.color}22`,
      }}
    >
      {it.icon && <Duo p={it.icon} size={size * 0.56} />}
    </span>
  );
}
/** a whisper of paper grain on the glass */
function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
