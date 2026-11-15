"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type ChangeEvent,
  type ReactNode,
  forwardRef,
  type DragEvent,
  type KeyboardEvent as RKeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ComposerModel = {
  id: string;
  name: string;
  note: string;
  icon: "quick" | "balanced" | "deep";
};
export type ComposerFile = {
  id: string;
  name: string;
  size: number;
  kind: "pdf" | "image" | "doc" | "link";
};
export type OrbComposerProps = {
  placeholder?: string;
  models?: ComposerModel[];
  suggestions?: string[];
  /** your model call: resolve with the reply's text. Leave out for a canned reply. */
  onSend?: (message: { text: string; files: ComposerFile[]; model: string; web: boolean }) => Promise<string> | string;
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
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
  clip: "m212.48 136.49l-82.06 82a60 60 0 0 1-84.85-84.88l98.16-97.89a40 40 0 0 1 56.56 56.59l-.17.16l-95.8 92.22a12 12 0 1 1-16.64-17.3l95.71-92.12a16 16 0 0 0-22.7-22.56l-98.16 97.86a36 36 0 0 0 50.93 50.91l82.06-82a12 12 0 0 1 17 17Z",
  image:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 112H40v-39.31l46.34-46.35a8 8 0 0 1 11.32 0L165 181.66a8 8 0 0 0 11.32-11.32l-17.66-17.65L173 138.34a8 8 0 0 1 11.31 0L216 170.07z",
  link: "M117.18 188.74a12 12 0 0 1 0 17l-5.12 5.12A58.26 58.26 0 0 1 70.6 228a58.62 58.62 0 0 1-41.46-100.08l34.75-34.75a58.64 58.64 0 0 1 98.56 28.11a12 12 0 1 1-23.37 5.44a34.65 34.65 0 0 0-58.22-16.58l-34.75 34.75A34.62 34.62 0 0 0 70.57 204a34.4 34.4 0 0 0 24.49-10.14l5.11-5.12a12 12 0 0 1 17.01 0M226.83 45.17a58.65 58.65 0 0 0-82.93 0l-5.11 5.11a12 12 0 0 0 17 17l5.12-5.12a34.63 34.63 0 1 1 49 49l-34.81 34.7A34.4 34.4 0 0 1 150.61 156a34.63 34.63 0 0 1-33.69-26.72a12 12 0 0 0-23.38 5.44A58.64 58.64 0 0 0 150.56 180h.05a58.28 58.28 0 0 0 41.47-17.17l34.75-34.75a58.62 58.62 0 0 0 0-82.91",
  mic: "M80 128V64a48 48 0 0 1 96 0v64a48 48 0 0 1-96 0m128 0a8 8 0 0 0-16 0a64 64 0 0 1-128 0a8 8 0 0 0-16 0a80.11 80.11 0 0 0 72 79.6V240a8 8 0 0 0 16 0v-32.4a80.11 80.11 0 0 0 72-79.6",
  up: "M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17",
  stop: "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16",
  globe:
    "M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m83.13 96h-31.57a144.3 144.3 0 0 0-21.35-66.36A84.22 84.22 0 0 1 211.13 116M128 207c-9.36-10.81-24.46-33.13-27.45-67h54.94a119.74 119.74 0 0 1-17.11 52.77A108.6 108.6 0 0 1 128 207m-27.45-91a119.74 119.74 0 0 1 17.11-52.77A108.6 108.6 0 0 1 128 49c9.36 10.81 24.46 33.13 27.45 67Zm-2.76-66.36A144.3 144.3 0 0 0 76.44 116H44.87a84.22 84.22 0 0 1 52.92-66.36M44.87 140h31.57a144.3 144.3 0 0 0 21.35 66.36A84.22 84.22 0 0 1 44.87 140m113.34 66.36A144.3 144.3 0 0 0 179.56 140h31.57a84.22 84.22 0 0 1-52.92 66.36",
  caret: "m216.49 104.49l-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 0 1 17-17L128 159l71.51-71.52a12 12 0 0 1 17 17Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  pdf: "M44 120h168a4 4 0 0 0 4-4V88a8 8 0 0 0-2.34-5.66l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v76a4 4 0 0 0 4 4m108-76l44 44h-44Zm72 108.53a8.18 8.18 0 0 1-8.25 7.47H192v16h15.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53H192v15.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V152a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8.53M64 144H48a8 8 0 0 0-8 8v55.73a8.17 8.17 0 0 0 7.47 8.27a8 8 0 0 0 8.53-8v-8h7.4c15.24 0 28.14-11.92 28.59-27.15A28 28 0 0 0 64 144m-.35 40H56v-24h8a12 12 0 0 1 12 13.16A12.25 12.25 0 0 1 63.65 184M128 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h15.32c19.66 0 36.21-15.48 36.67-35.13A36 36 0 0 0 128 144m-.49 56H120v-40h8a20 20 0 0 1 20 20.77c-.42 10.82-9.66 19.23-20.49 19.23",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  quick:
    "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  balanced:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M40 128a88.1 88.1 0 0 1 88-88v176a88.1 88.1 0 0 1-88-88",
  deep: "M212 76v-4a44 44 0 0 0-74.86-31.31a3.93 3.93 0 0 0-1.14 2.8v88.72a4 4 0 0 0 6.2 3.33a47.67 47.67 0 0 1 25.48-7.54a8.18 8.18 0 0 1 8.31 7.58a8 8 0 0 1-8 8.42a32 32 0 0 0-32 32v33.88a4 4 0 0 0 1.49 3.12a47.92 47.92 0 0 0 74.21-17.16a4 4 0 0 0-4.49-5.56A68 68 0 0 1 192 192h-7.73a8.18 8.18 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h8a51.6 51.6 0 0 0 24-5.88A52 52 0 0 0 212 76m-12 36h-4a36 36 0 0 1-36-36v-4a8 8 0 0 1 16 0v4a20 20 0 0 0 20 20h4a8 8 0 0 1 0 16M88 28a44.05 44.05 0 0 0-44 44v4a52 52 0 0 0-4 94.12A51.6 51.6 0 0 0 64 176h7.73a8.18 8.18 0 0 1 8.27 7.47a8 8 0 0 1-8 8.53h-8a67.5 67.5 0 0 1-15.21-1.73a4 4 0 0 0-4.5 5.55A47.93 47.93 0 0 0 118.51 213a4 4 0 0 0 1.49-3.12V176a32 32 0 0 0-32-32a8 8 0 0 1-8-8.42a8.18 8.18 0 0 1 8.32-7.58a47.67 47.67 0 0 1 25.48 7.54a4 4 0 0 0 6.2-3.33V43.49a4 4 0 0 0-1.14-2.81A43.85 43.85 0 0 0 88 28m8 48a36 36 0 0 1-36 36h-4a8 8 0 0 1 0-16h4a20 20 0 0 0 20-20v-4a8 8 0 0 1 16 0Z",
  copy: "M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z",
  again:
    "M228 48v48a12 12 0 0 1-12 12h-48a12 12 0 0 1 0-24h19l-7.8-7.8a75.55 75.55 0 0 0-53.32-22.26h-.43a75.5 75.5 0 0 0-53.06 21.63a12 12 0 1 1-16.78-17.16a99.38 99.38 0 0 1 69.87-28.47h.52a99.42 99.42 0 0 1 70.2 29.29L204 67V48a12 12 0 0 1 24 0m-44.39 132.43a75.5 75.5 0 0 1-53.09 21.63h-.43a75.55 75.55 0 0 1-53.32-22.26L69 172h19a12 12 0 0 0 0-24H40a12 12 0 0 0-12 12v48a12 12 0 0 0 24 0v-19l7.8 7.8a99.42 99.42 0 0 0 70.2 29.26h.56a99.38 99.38 0 0 0 69.87-28.47a12 12 0 0 0-16.78-17.16Z",
  good: "M237 77.47A28 28 0 0 0 216 68h-52V56a44.05 44.05 0 0 0-44-44a12 12 0 0 0-10.73 6.63L72.58 92H32a20 20 0 0 0-20 20v88a20 20 0 0 0 20 20h172a28 28 0 0 0 27.78-24.53l12-96a28 28 0 0 0-6.78-22M36 116h32v80H36Zm184-19.5l-12 96a4 4 0 0 1-4 3.5H92v-89.17l34.82-69.63A20 20 0 0 1 140 56v24a12 12 0 0 0 12 12h64a4 4 0 0 1 4 4.5",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const MODELS: ComposerModel[] = [
  {
    id: "quick",
    name: "Quick",
    note: "Fast answers for everyday things",
    icon: "quick",
  },
  {
    id: "balanced",
    name: "Balanced",
    note: "Careful and still quick",
    icon: "balanced",
  },
  {
    id: "deep",
    name: "Deep think",
    note: "Takes its time on hard problems",
    icon: "deep",
  },
];
const SUGGESTIONS = [
  "Summarise the attached brief in five bullets",
  "Draft a launch email for the new pricing",
  "Find three risks in this rollout plan",
];
const DEMO_FILES: ComposerFile[] = [
  { id: "f1", name: "Q4 brief.pdf", size: 482000, kind: "pdf" },
  { id: "f2", name: "pricing-hero.png", size: 1260000, kind: "image" },
];
const REPLY =
  "Here's the short version. The brief asks for one clear pricing story across the site by mid-December. Three things matter most: a single headline price on the hero, the annual discount shown as months free rather than a percentage, and a comparison table that fits on a phone. The riskiest part is the migration for existing teams, so I'd ship that behind a banner a week early and watch support volume before the full switch.";

const fileKind = (f: File): ComposerFile["kind"] =>
  f.type.startsWith("image/") ? "image" : f.type === "application/pdf" || f.name.endsWith(".pdf") ? "pdf" : "doc";
const size = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const KIND_COL: Record<ComposerFile["kind"], string> = {
  pdf: "#ff3b30",
  image: "#0071e3",
  doc: "#5e5ce6",
  link: "#30d158",
};

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  files?: ComposerFile[];
  state?: "thinking" | "writing" | "done" | "stopped";
  secs?: number;
};

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/**
 * The box you talk to an AI through, and the first reply.
 *
 * Attach files with the plus, or drop them anywhere on the composer (it lights up to take them); each arrives as a
 * chip. Pick a model from a menu that grows out of its pill, and turn web search on and off. The box grows with your
 * words. The microphone turns the box into a live waveform of your voice, and in browsers that can, writes what you
 * say into it. Send, and the chips fly up into your message while the send button turns into a stop button with a
 * ring running round it; a glass orb with light swirling inside quickens while it thinks, then the reply writes itself in, word by word. Enter sends, Shift and Enter
 * starts a new line.
 *   <OrbComposer onSend={async ({ text }) => (await api.chat(text)).reply} />
 */
export default function OrbComposer({
  placeholder = "Ask anything",
  models = MODELS,
  suggestions = SUGGESTIONS,
  onSend,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: OrbComposerProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<ComposerFile[]>([]);
  const [model, setModel] = useState(models[1]?.id ?? models[0].id);
  const [web, setWeb] = useState(false);
  const [menu, setMenu] = useState<null | "model" | "add">(null);
  const [drag, setDrag] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<null | { live: boolean }>(null);
  const [taH, setTaH] = useState(24);
  const stopRef = useRef(false);
  const M = models.find((m) => m.id === model) ?? models[0];

  const touch = () => {
    touched.current = true;
  };

  // the box grows with the words, up to six lines
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    const h = Math.min(6 * 22 + 2, Math.max(24, ta.scrollHeight));
    ta.style.height = "";
    setTaH(h);
  }, [text]);

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el)
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reduce ? "auto" : "smooth",
      });
  }, [msgs, reduce]);

  // close a menu on a click elsewhere or Escape
  useEffect(() => {
    if (!menu) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.(`[data-menu="${uid}"]`)) setMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", esc);
    };
  }, [menu, uid]);

  const addFiles = (fs: ComposerFile[]) => {
    if (!fs.length) return;
    setFiles((cur) => [...cur, ...fs.filter((f) => !cur.some((c) => c.name === f.name))].slice(0, 6));
    fs.forEach((_, i) =>
      sfx.note(880 + i * 120, {
        dur: 0.16,
        gain: 0.05,
        at: i * 0.07,
        bell: 0.4,
      }),
    );
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    addFiles(
      list.map((f, i) => ({
        id: `${f.name}-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        kind: fileKind(f),
      })),
    );
    e.target.value = "";
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    touch();
    const list = Array.from(e.dataTransfer.files ?? []);
    addFiles(
      list.map((f, i) => ({
        id: `${f.name}-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        kind: fileKind(f),
      })),
    );
  };

  // ------------------------------------------------------------ sending, and the reply
  const send = async (override?: string) => {
    const body = (override ?? text).trim();
    if (busy) {
      stopRef.current = true;
      return;
    }
    if (!body && !files.length) return;
    const sent = files;
    const id = `${Date.now()}`;
    setMsgs((m) => [
      ...m.slice(-4),
      { id: `u${id}`, role: "user", text: body, files: sent },
      { id: `a${id}`, role: "ai", text: "", state: "thinking" },
    ]);
    setText("");
    setFiles([]);
    setBusy(true);
    stopRef.current = false;
    sfx.whoosh(600, 2200, { dur: 0.3, gain: 0.05 });
    sfx.note(988, { dur: 0.2, gain: 0.05, at: 0.05 });
    const t0 = performance.now();
    let reply = REPLY;
    try {
      const r = onSend ? await onSend({ text: body, files: sent, model, web }) : null;
      if (r) reply = r;
    } catch {
      reply = "That didn't go through. Check your connection and send it again.";
    }
    // think for a moment, longer for the deeper model
    const think = model === "deep" ? 2600 : model === "quick" ? 900 : 1700;
    const wait = Math.max(0, think - (performance.now() - t0));
    await new Promise((r) => setTimeout(r, reduce ? 0 : wait));
    const secs = Math.max(1, Math.round((performance.now() - t0) / 1000));
    const words = reply.split(/(\s+)/);
    let out = "";
    setMsgs((m) => m.map((x) => (x.id === `a${id}` ? { ...x, state: "writing", secs } : x)));
    for (let i = 0; i < words.length; i += 2) {
      if (stopRef.current) break;
      out += words[i] + (words[i + 1] ?? "");
      const now = out;
      setMsgs((m) => m.map((x) => (x.id === `a${id}` ? { ...x, text: now } : x)));
      if (!reduce) await new Promise((r) => setTimeout(r, 34 + Math.random() * 46));
    }
    const stopped = stopRef.current;
    setMsgs((m) =>
      m.map((x) =>
        x.id === `a${id}`
          ? {
              ...x,
              text: reduce && !stopped ? reply : x.text,
              state: stopped ? "stopped" : "done",
            }
          : x,
      ),
    );
    setBusy(false);
    if (!stopped) sfx.note(1319, { dur: 0.35, gain: 0.04, bell: 0.5 });
  };

  // ------------------------------------------------------------ the microphone
  const levels = useRef<Float32Array>(new Float32Array(48));
  const micStop = useRef<() => void>(() => {});
  const startMic = async (simulated = false) => {
    setMenu(null);
    const bars = levels.current;
    let raf = 0;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let rec2: SpeechRec | null = null;
    let analyser: AnalyserNode | null = null;
    if (!simulated && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
      } catch {
        stream = null;
      }
    }
    if (!stream && !simulated) {
      setRec(null);
      setNote("The microphone isn't available here.");
      return;
    }
    const W = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    const before = text;
    if (stream && SR) {
      try {
        rec2 = new SR();
        rec2.continuous = true;
        rec2.interimResults = true;
        rec2.lang = navigator.language || "en-US";
        rec2.onresult = (e) => {
          let said = "";
          for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
          setText((before ? before + " " : "") + said.trim());
        };
        rec2.start();
      } catch {
        rec2 = null;
      }
    }
    setRec({ live: !!stream });
    sfx.note(660, { dur: 0.18, gain: 0.05 });
    sfx.note(990, { dur: 0.22, gain: 0.05, at: 0.08 });
    const buf = new Uint8Array(128);
    let t = 0;
    const tick = () => {
      t += 1 / 60;
      let lvl: number;
      if (analyser) {
        analyser.getByteTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) s += ((buf[i] - 128) / 128) ** 2;
        lvl = Math.min(1, Math.sqrt(s / buf.length) * 5);
      } else {
        // the demo's voice: syllables in bursts with pauses between words
        const word = Math.max(0, Math.sin(t * 2.3)) ** 0.6;
        lvl = word * (0.35 + 0.65 * Math.abs(Math.sin(t * 13.7) * Math.sin(t * 7.1 + 1)));
      }
      bars.copyWithin(0, 1);
      bars[bars.length - 1] = lvl;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    micStop.current = () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
      void ctx?.close();
      rec2?.stop();
      bars.fill(0);
      setRec(null);
      sfx.note(990, { dur: 0.16, gain: 0.05 });
      sfx.note(660, { dur: 0.2, gain: 0.05, at: 0.07 });
      setTimeout(() => taRef.current?.focus(), 50);
    };
  };
  useEffect(() => () => micStop.current(), []);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 2600);
    return () => clearTimeout(t);
  }, [note]);

  // ------------------------------------------------------------ autoplay
  const typeInto = async (s: string, alive: () => boolean) => {
    for (let i = 1; i <= s.length; i++) {
      if (!alive()) return;
      setText(s.slice(0, i));
      if (i % 3 === 0) sfx.tick({ freq: 3200, gain: 0.015 });
      await new Promise((r) => setTimeout(r, 26 + Math.random() * 30));
    }
  };
  const ap = useRef({
    typeInto,
    addFiles,
    setMenu,
    setModel,
    setWeb,
    send,
    startMic,
    stopMic: () => micStop.current(),
    reset: () => {},
  });
  ap.current = {
    typeInto,
    addFiles,
    setMenu,
    setModel,
    setWeb,
    send,
    startMic,
    stopMic: () => micStop.current(),
    reset: () => {
      setMsgs([]);
      setText("");
      setFiles([]);
      setModel(models[1]?.id ?? models[0].id);
      setWeb(false);
    },
  };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(1200);
        if (!ok()) break;
        ap.current.addFiles([{ ...DEMO_FILES[0], id: `d1${Date.now()}` }]);
        await sleep(500);
        if (!ok()) break;
        await ap.current.typeInto(suggestions[0], ok);
        await sleep(500);
        if (!ok()) break;
        ap.current.setMenu("model");
        await sleep(900);
        if (!ok()) break;
        ap.current.setModel(models[2]?.id ?? models[0].id);
        await sleep(450);
        ap.current.setMenu(null);
        await sleep(500);
        if (!ok()) break;
        ap.current.setWeb(true);
        await sleep(700);
        if (!ok()) break;
        await ap.current.send();
        await sleep(1800);
        if (!ok()) break;
        await ap.current.startMic(true);
        await ap.current.typeInto("Make it shorter and friendlier", ok);
        await sleep(900);
        ap.current.stopMic();
        await sleep(1600);
        if (!ok()) break;
        ap.current.reset();
        await sleep(600);
      }
    })();
    return () => {
      alive = false;
      micStop.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const onKey = (e: RKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };
  const canSend = busy || !!text.trim() || files.length > 0;
  const empty = msgs.length === 0;

  return (
    <LayoutGroup id={uid}>
      <div
        ref={rootRef}
        onPointerDownCapture={touch}
        onKeyDownCapture={touch}
        onDragEnter={(e) => {
          if (Array.from(e.dataTransfer.types).includes("Files")) {
            e.preventDefault();
            setDrag(true);
          }
        }}
        onDragOver={(e) => {
          if (drag) e.preventDefault();
        }}
        onDragLeave={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node)) setDrag(false);
        }}
        onDrop={onDrop}
        className={`relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${className}`}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        }}
      >
        {/* the conversation */}
        <div
          ref={scrollRef}
          className="relative h-[340px] overflow-y-auto overscroll-contain px-4 pt-5 sm:px-6"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, #000 18px, #000 calc(100% - 18px), transparent)",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {empty ? (
              <motion.div
                key="hello"
                className="flex h-full flex-col items-center justify-center pb-6 text-center"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -12,
                  filter: "blur(4px)",
                  transition: { duration: 0.25 },
                }}
              >
                <Orb busy={false} reduce={reduce} size={40} />
                <p className="mt-4 text-[22px] font-semibold tracking-[-0.025em]">What are we working on?</p>
                <div className="mt-5 flex max-w-[480px] flex-wrap justify-center gap-2">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => {
                        setText(s);
                        taRef.current?.focus();
                      }}
                      className="rounded-full bg-[#f5f5f7] px-3.5 py-2 text-[13px] text-[#1d1d1f] outline-none transition-colors hover:bg-[#ececef] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduce ? 0 : 0.08 + i * 0.06,
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="thread" className="flex flex-col gap-5 pb-4" initial={false} aria-live="polite">
                {msgs.map((m) =>
                  m.role === "user" ? (
                    <motion.div
                      key={m.id}
                      className="flex flex-col items-end gap-2"
                      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 30,
                      }}
                      style={{ originX: 1, originY: 1 }}
                    >
                      {!!m.files?.length && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {m.files.map((f) => (
                            <Chip key={f.id} f={f} layoutId={`${uid}-f-${f.id}`} reduce={reduce} />
                          ))}
                        </div>
                      )}
                      {m.text && (
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-[6px] bg-[#f0f0f3] px-4 py-2.5 text-[14.5px] leading-[1.45]">
                          {m.text}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <Reply key={m.id} m={m} reduce={reduce} model={M.name} />
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the composer */}
        <div className="relative px-3 pb-3 sm:px-4 sm:pb-4">
          <motion.div
            className="relative rounded-[24px] bg-white"
            animate={{
              boxShadow: drag
                ? "0 0 0 2px #0071e3, 0 0 0 6px rgba(0,113,227,.15), 0 16px 36px -18px rgba(0,113,227,.6)"
                : rec
                  ? "0 0 0 1.5px rgba(255,59,48,.55), 0 0 0 5px rgba(255,59,48,.10), 0 14px 30px -18px rgba(0,0,0,.4)"
                  : "0 0 0 1px rgba(0,0,0,.09), 0 1px 0 rgba(255,255,255,1) inset, 0 14px 30px -20px rgba(0,0,0,.35)",
            }}
            transition={{ duration: 0.25 }}
          >
            {/* attachments */}
            <AnimatePresence initial={false}>
              {files.length > 0 && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                >
                  <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {files.map((f) => (
                        <Chip
                          key={f.id}
                          f={f}
                          layoutId={`${uid}-f-${f.id}`}
                          reduce={reduce}
                          onRemove={() => setFiles((c) => c.filter((x) => x.id !== f.id))}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* the words, or the voice */}
            <div className="relative px-4 pt-3">
              <motion.div
                animate={{ height: taH }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                className="relative"
              >
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                  aria-label="Message"
                  placeholder={placeholder}
                  className={`block h-full w-full resize-none bg-transparent text-[15px] leading-[22px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] ${rec ? "opacity-0" : ""}`}
                />
                <AnimatePresence>
                  {rec && (
                    <motion.div
                      className="absolute inset-0 flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Wave levels={levels.current} reduce={reduce} />
                      {text && (
                        <span className="min-w-0 max-w-[45%] truncate text-[13.5px] text-[#424245]">{text}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* the tools */}
            <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-2">
              <div className="relative" data-menu={uid}>
                <button
                  type="button"
                  aria-label="Attach"
                  aria-expanded={menu === "add"}
                  onClick={() => setMenu((m) => (m === "add" ? null : "add"))}
                  className="grid h-9 w-9 place-items-center rounded-full text-[#1d1d1f] outline-none transition hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                >
                  <motion.span
                    animate={{ rotate: menu === "add" ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  >
                    <Ico d={I.plus} size={17} />
                  </motion.span>
                </button>
                <Pop open={menu === "add"} reduce={reduce} originX={0}>
                  {[
                    {
                      label: "Upload a file",
                      icon: I.clip,
                      act: () => fileRef.current?.click(),
                    },
                    {
                      label: "Add a photo",
                      icon: I.image,
                      act: () => addFiles([{ ...DEMO_FILES[1], id: `p${Date.now()}` }]),
                    },
                    {
                      label: "Paste a link",
                      icon: I.link,
                      act: () =>
                        addFiles([
                          {
                            id: `l${Date.now()}`,
                            name: "nexus-ui.com/pricing",
                            size: 0,
                            kind: "link",
                          },
                        ]),
                    },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        o.act();
                        setMenu(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-[13.5px] outline-none hover:bg-black/[0.05] focus-visible:bg-black/[0.05]"
                    >
                      <span className="text-[#6e6e73]">
                        <Ico d={o.icon} size={16} />
                      </span>
                      {o.label}
                    </button>
                  ))}
                </Pop>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} />
              </div>

              <div className="relative" data-menu={uid}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={menu === "model"}
                  onClick={() => setMenu((m) => (m === "model" ? null : "model"))}
                  className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#1d1d1f] outline-none transition hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                >
                  <span className="text-[#6e6e73]">
                    <Ico d={I[M.icon]} size={14} />
                  </span>
                  <span className="relative overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={M.id}
                        className="block whitespace-nowrap"
                        initial={reduce ? false : { y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -14, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 34,
                        }}
                      >
                        {M.name}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <motion.span className="text-[#86868b]" animate={{ rotate: menu === "model" ? 180 : 0 }}>
                    <Ico d={I.caret} size={10} />
                  </motion.span>
                </button>
                <Pop open={menu === "model"} reduce={reduce} originX={0.2} wide>
                  <div role="listbox" aria-label="Model">
                    {models.map((m) => {
                      const on = m.id === model;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-selected={on}
                          onClick={() => {
                            setModel(m.id);
                            setMenu(null);
                            sfx.tick({ freq: 2400, gain: 0.04 });
                          }}
                          className="relative flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
                        >
                          {on && (
                            <motion.span
                              layoutId={`${uid}-msel`}
                              className="absolute inset-0 rounded-[12px] bg-black/[0.05]"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 38,
                              }}
                            />
                          )}
                          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f]">
                            <Ico d={I[m.icon]} size={15} />
                          </span>
                          <span className="relative min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium">{m.name}</span>
                            <span className="block truncate text-[12px] text-[#6e6e73]">{m.note}</span>
                          </span>
                          <span className="relative w-4 text-[#0071e3]">{on && <Ico d={I.check} size={14} />}</span>
                        </button>
                      );
                    })}
                  </div>
                </Pop>
              </div>

              <button
                type="button"
                aria-pressed={web}
                aria-label="Search the web"
                onClick={() => {
                  setWeb((w) => !w);
                  sfx.tick({ freq: web ? 1800 : 2800, gain: 0.05 });
                }}
                className={`relative flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${web ? "bg-[#0071e3]/10 text-[#0066cc]" : "text-[#6e6e73] hover:bg-black/[0.05]"}`}
              >
                <motion.span
                  animate={web && !reduce ? { rotate: [0, 360] } : { rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.3, 0, 0.2, 1] }}
                >
                  <Ico d={I.globe} size={14} />
                </motion.span>
                <span className="hidden sm:inline">Search</span>
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={rec ? "Stop dictating" : "Dictate"}
                  aria-pressed={!!rec}
                  onClick={() => (rec ? micStop.current() : void startMic())}
                  className={`grid h-9 w-9 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${rec ? "bg-[#ff3b30] text-white" : "text-[#1d1d1f] hover:bg-black/[0.05]"}`}
                >
                  {rec ? <span className="h-2.5 w-2.5 rounded-[3px] bg-white" /> : <Ico d={I.mic} size={16} />}
                </button>
                <motion.button
                  type="button"
                  aria-label={busy ? "Stop" : "Send"}
                  disabled={!canSend}
                  onClick={() => void send()}
                  className="relative grid h-9 w-9 place-items-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 focus-visible:ring-offset-2"
                  animate={{
                    backgroundColor: !canSend ? "#d2d2d7" : busy ? "#1d1d1f" : "#0071e3",
                    scale: 1,
                  }}
                  whileTap={reduce || !canSend ? undefined : { scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {busy && !reduce && (
                    <motion.svg
                      className="absolute -inset-[3px]"
                      viewBox="0 0 42 42"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      aria-hidden="true"
                    >
                      <circle
                        cx="21"
                        cy="21"
                        r="19.5"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="30 100"
                      />
                    </motion.svg>
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={busy ? "stop" : "up"}
                      initial={reduce ? false : { scale: 0.3, rotate: busy ? -90 : 90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 28,
                      }}
                    >
                      <Ico d={busy ? I.stop : I.up} size={busy ? 13 : 16} />
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {drag && (
                <motion.div
                  className="pointer-events-none absolute inset-0 grid place-items-center rounded-[24px] bg-[#0071e3]/[0.06] backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-[#0066cc] shadow-[0_6px_18px_-8px_rgba(0,113,227,.6)]">
                    <Ico d={I.clip} size={14} /> Drop to attach
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {note && (
              <motion.p
                role="status"
                className="absolute inset-x-0 -top-7 text-center text-[12.5px] text-[#6e6e73]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {note}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}

// ---------------------------------------------------------------- pieces

function Pop({
  open,
  reduce,
  originX,
  wide,
  children,
}: {
  open: boolean;
  reduce: boolean;
  originX: number;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          className={`absolute bottom-[calc(100%+10px)] left-0 z-40 rounded-[16px] bg-white/95 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_22px_44px_-18px_rgba(0,0,0,.4)] backdrop-blur-xl ${wide ? "w-[268px]" : "w-[200px]"}`}
          style={{ originX, originY: 1 }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 4, filter: "blur(2px)" }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 34,
            filter: { duration: 0.18 },
            opacity: { duration: 0.14 },
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// a ref, so AnimatePresence's popLayout can measure it on the way out
const Chip = forwardRef<HTMLDivElement, { f: ComposerFile; layoutId: string; reduce: boolean; onRemove?: () => void }>(
  function Chip({ f, layoutId, reduce, onRemove }, ref) {
    const col = KIND_COL[f.kind];
    return (
      <motion.div
        ref={ref}
        layoutId={reduce ? undefined : layoutId}
        className="group relative flex h-11 max-w-[220px] items-center gap-2.5 rounded-[14px] bg-[#f5f5f7] pl-1.5 pr-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]"
        initial={reduce ? false : { opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        style={{ borderRadius: 14 }}
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-white"
          style={{
            background: `linear-gradient(160deg, ${col}cc, ${col})`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
          }}
        >
          <Ico
            d={f.kind === "pdf" ? I.pdf : f.kind === "image" ? I.image : f.kind === "link" ? I.link : I.doc}
            size={15}
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-medium leading-tight text-[#1d1d1f]">{f.name}</span>
          <span className="block text-[11px] leading-tight text-[#86868b]">
            {f.kind === "link"
              ? "Link"
              : `${f.kind === "pdf" ? "PDF" : f.kind === "image" ? "Image" : "File"} · ${size(f.size)}`}
          </span>
        </span>
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${f.name}`}
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#1d1d1f] text-white opacity-0 shadow-[0_0_0_2px_#fff] outline-none transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Ico d={I.x} size={9} />
          </button>
        )}
      </motion.div>
    );
  },
);

// ---------------------------------------------------------------- the orb

// a tileable cloud texture, made once and shared by every orb on the page
const NT = 128;
let NOISE: Float32Array | null = null;
function noiseTex() {
  if (NOISE) return NOISE;
  let seed = 9;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out = new Float32Array(NT * NT);
  let amp = 1;
  for (const per of [4, 8, 16, 32, 64]) {
    const lat = new Float32Array(per * per).map(() => rnd());
    for (let y = 0; y < NT; y++)
      for (let x = 0; x < NT; x++) {
        const fx = (x / NT) * per;
        const fy = (y / NT) * per;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        let tx = fx - ix;
        let ty = fy - iy;
        tx = tx * tx * (3 - 2 * tx);
        ty = ty * ty * (3 - 2 * ty);
        const a = lat[iy * per + ix];
        const b = lat[iy * per + ((ix + 1) % per)];
        const c = lat[((iy + 1) % per) * per + ix];
        const d = lat[((iy + 1) % per) * per + ((ix + 1) % per)];
        out[y * NT + x] += (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty) * amp;
      }
    amp *= 0.52;
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of out) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / (hi - lo);
  NOISE = out;
  return out;
}
const samp = (T: Float32Array, u: number, v: number) => {
  const fu = Math.floor(u);
  const fv = Math.floor(v);
  const tu = u - fu;
  const tv = v - fv;
  const x0 = ((fu % NT) + NT) % NT;
  const y0 = ((fv % NT) + NT) % NT;
  const x1 = (x0 + 1) % NT;
  const y1 = (y0 + 1) % NT;
  const a = T[y0 * NT + x0];
  const b = T[y0 * NT + x1];
  const c = T[y1 * NT + x0];
  const d = T[y1 * NT + x1];
  return a + (b - a) * tu + (c - a) * tv + (a - b - c + d) * tu * tv;
};
/**
 * The assistant's orb: a small glass sphere with light moving inside it, drawn a pixel at a time.
 *
 * Inside, clouds of coloured light swirl, magnified toward the edge the way glass bends what's behind it, brightest
 * where the light pools at the bottom (a caustic) and thinnest at the rim. The glass has a bright Fresnel rim with a
 * faint oil-film sheen, a sharp reflection of a window up and to the left, a soft second glint below, and sits over a
 * contact shadow. While it works the swirl quickens and the core breathes.
 */
function Orb({ busy, reduce, size = 22 }: { busy: boolean; reduce: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const seen = useInView(wrap, { margin: "60px" });
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const T = noiseTex();
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const W = Math.max(16, Math.round(size * dpr));
    cv.width = W;
    cv.height = W;
    const img = ctx.createImageData(W, W);
    const px = img.data;
    let raf = 0;
    let t = Math.random() * 40;
    let speed = busyRef.current ? 1 : 0.35;
    let glow = busyRef.current ? 1 : 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = busyRef.current;
      speed += ((b ? 1 : 0.35) - speed) * Math.min(1, dt * 3);
      glow += ((b ? 1 : 0) - glow) * Math.min(1, dt * 3);
      if (!reduce) t += dt * speed;
      const breathe = 0.5 + 0.5 * Math.sin(now / 520);
      const rot = t * 0.9;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      for (let j = 0; j < W; j++) {
        const y = ((j + 0.5) / W) * 2 - 1;
        for (let i = 0; i < W; i++) {
          const x = ((i + 0.5) / W) * 2 - 1;
          const r2 = x * x + y * y;
          const o = (j * W + i) * 4;
          const r = Math.sqrt(r2);
          const edge = (1 - r) * W * 0.5 + 0.5; // antialiased silhouette
          if (edge <= 0) {
            px[o + 3] = 0;
            continue;
          }
          const z = Math.sqrt(Math.max(0, 1 - r2));
          // what's behind the glass, bent: magnified toward the rim, swirling faster near the middle
          const k = 1 / (0.42 + 0.58 * z);
          const sw = (1 - r) * 1.6;
          const cs = Math.cos(sw);
          const ss = Math.sin(sw);
          let qx = x * k;
          let qy = y * k;
          const ax = qx * cs - qy * ss;
          const ay = qx * ss + qy * cs;
          qx = ax * cr - ay * sr;
          qy = ax * sr + ay * cr;
          const u = qx * 34 + 64;
          const v = qy * 34 + 64;
          // domain-warped clouds
          const w1 = samp(T, u * 0.55 + t * 9, v * 0.55 + 17);
          const w2 = samp(T, u * 0.55 + 41, v * 0.55 - t * 7);
          const n = samp(T, u + (w1 - 0.5) * 52 + t * 5, v + (w2 - 0.5) * 52);
          // thin bright filaments where the clouds fold (ridged), over a dim haze deeper inside
          const ridge = 1 - Math.abs(2 * n - 1);
          const wisp = Math.pow(ridge, 5) * 1.7 + Math.pow(ridge, 14) * 1.4;
          const haze = Math.max(0, Math.min(1, (samp(T, x * 20 + 30 - t * 4, y * 20 + 90 + t * 3) - 0.3) * 1.7));
          // the filaments' colour drifts slowly between magenta, violet and a cold cyan
          const h = samp(T, u * 0.35 + 70 + t * 2, v * 0.35 + 10) * 2.2 + t * 0.08;
          // three inks, weighted round a slowly turning wheel: magenta, violet, cyan
          const k1 = Math.max(0, Math.cos(h * 2.4)) ** 2;
          const k2 = Math.max(0, Math.cos(h * 2.4 - 2.094)) ** 2;
          const k3 = Math.max(0, Math.cos(h * 2.4 + 2.094)) ** 2;
          const ks = k1 + k2 + k3 + 1e-4;
          const wr = (k1 * 1 + k2 * 0.52 + k3 * 0.22) / ks;
          const wg = (k1 * 0.28 + k2 * 0.32 + k3 * 0.86) / ks;
          const wb = (k1 * 0.78 + k2 * 1 + k3 * 1) / ks;
          // tiny sparks drifting in the depth
          const st = samp(T, x * 70 + 13 + t * 6, y * 70 + 57);
          const spark = st > 0.8 ? Math.pow((st - 0.8) * 5, 3) * (0.6 + 0.4 * Math.sin(now / 300 + st * 40)) : 0;
          // thicker glass at the middle holds more light; the inside is a deep ink
          const body = 0.35 + 0.75 * z;
          let R = (0.02 + haze * 0.14 + wisp * wr * 1.15) * body + spark * 0.9;
          let G = (0.012 + haze * 0.05 + wisp * wg * 1.15) * body + spark * 0.85;
          let B = (0.07 + haze * 0.32 + wisp * wb * 1.15) * body + spark;
          // a caustic: light focused through the sphere onto its lower inside
          const cx = x - 0.1;
          const cy = y - 0.55;
          const caus = Math.exp(-(cx * cx * 7 + cy * cy * 16)) * (0.3 + 0.22 * glow * breathe);
          R += caus * 0.7;
          G += caus * 0.55;
          B += caus * 1.0;
          // the core breathes while it works
          const core = Math.exp(-r2 * 4.2) * (0.05 + glow * (0.12 + 0.16 * breathe));
          R += core * 0.85;
          G += core * 0.8;
          B += core * 1.0;
          // a dark band just inside the rim gives the glass its thickness
          const band = Math.max(0, Math.min(1, (r - 0.8) / 0.12)) * Math.max(0, Math.min(1, (0.985 - r) / 0.04));
          R *= 1 - band * 0.35;
          G *= 1 - band * 0.35;
          B *= 1 - band * 0.3;
          // Fresnel rim, with a faint oil-film shift of hue round it
          const fr = Math.pow(1 - z, 3.2);
          const ang = Math.atan2(y, x);
          R += fr * (0.5 + 0.25 * Math.sin(ang * 2 + 0.5));
          G += fr * (0.58 + 0.25 * Math.sin(ang * 2 + 2.6));
          B += fr * (0.9 + 0.2 * Math.sin(ang * 2 + 4.7));
          // the window reflection up and to the left, sharp, and a soft sheen around it
          const sx = x + 0.36;
          const sy = y + 0.45;
          const spec = Math.exp(-(sx * sx * 30 + sy * sy * 48));
          const sheen = Math.exp(-(sx * sx * 4 + sy * sy * 6)) * 0.07;
          // a smaller, softer glint low on the right, where the room bounces back
          const gx = x - 0.42;
          const gy = y - 0.5;
          const glint = Math.exp(-(gx * gx * 60 + gy * gy * 60)) * 0.35;
          R += spec * 1.25 + sheen + glint;
          G += spec * 1.25 + sheen + glint;
          B += spec * 1.25 + sheen * 1.1 + glint;
          // filmic roll-off so the bright parts glow instead of clipping
          px[o] = 255 * (1 - Math.exp(-R * 1.35));
          px[o + 1] = 255 * (1 - Math.exp(-G * 1.35));
          px[o + 2] = 255 * (1 - Math.exp(-B * 1.35));
          px[o + 3] = 255 * Math.min(1, edge);
        }
      }
      ctx.putImageData(img, 0, 0);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    if (seen || reduce) raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, reduce, seen]);

  return (
    <span ref={wrap} className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* the light it throws around itself */}
      <motion.span
        className="absolute rounded-full"
        style={{
          inset: -size * 0.45,
          background: "radial-gradient(circle, rgba(140,92,255,.30), rgba(255,95,183,.10) 45%, rgba(140,92,255,0) 70%)",
          filter: `blur(${Math.max(3, size * 0.12)}px)`,
        }}
        animate={
          busy && !reduce ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1.08, 0.92] } : { opacity: 0.55, scale: 1 }
        }
        transition={busy && !reduce ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
      />
      {/* where it sits */}
      <span
        className="absolute left-1/2 rounded-full"
        style={{
          width: size * 0.8,
          height: size * 0.16,
          bottom: -size * 0.1,
          marginLeft: -size * 0.4,
          background: "radial-gradient(ellipse, rgba(40,20,90,.38), rgba(40,20,90,0) 70%)",
          filter: "blur(1.5px)",
        }}
      />
      <canvas ref={ref} className="relative block h-full w-full" />
    </span>
  );
}

function Reply({ m, reduce, model }: { m: Msg; reduce: boolean; model: string }) {
  const words = useMemo(() => m.text.split(/(\s+)/), [m.text]);
  const thinking = m.state === "thinking";
  return (
    <motion.div
      className="flex gap-3"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: reduce ? 0 : 0.12,
      }}
    >
      <div className="pt-0.5">
        <Orb busy={thinking || m.state === "writing"} reduce={reduce} />
      </div>
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {thinking ? (
            <motion.p
              key="t"
              className="text-[14px] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(3px)" }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #86868b 0%, #86868b 40%, #1d1d1f 50%, #86868b 60%, #86868b 100%)",
                  backgroundSize: "250% 100%",
                  animation: reduce ? undefined : "aic-shimmer 1.6s linear infinite",
                }}
              >
                {model} is thinking
              </span>
              <style>{"@keyframes aic-shimmer{from{background-position:100% 0}to{background-position:-150% 0}}"}</style>
            </motion.p>
          ) : (
            <motion.div key="a" initial={false}>
              <p className="mb-1.5 text-[12px] text-[#86868b]">Thought for {m.secs ?? 1}s</p>
              <p className="text-[14.5px] leading-[1.6] text-[#1d1d1f]">
                {words.map((w, i) =>
                  /^\s+$/.test(w) ? (
                    w
                  ) : (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={reduce ? false : { opacity: 0, filter: "blur(6px)", y: 3 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {w}
                    </motion.span>
                  ),
                )}
                {m.state === "writing" && (
                  <motion.span
                    className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-[#0071e3]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
                {m.state === "stopped" && <span className="ml-1 text-[12.5px] text-[#86868b]">(stopped)</span>}
              </p>
              <AnimatePresence>
                {(m.state === "done" || m.state === "stopped") && (
                  <motion.div
                    className="mt-2 flex gap-0.5 text-[#86868b]"
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {[
                      {
                        l: "Copy",
                        d: I.copy,
                        act: () => void navigator.clipboard?.writeText(m.text).catch(() => {}),
                      },
                      { l: "Good answer", d: I.good, act: () => {} },
                      { l: "Try again", d: I.again, act: () => {} },
                    ].map((b) => (
                      <button
                        key={b.l}
                        type="button"
                        aria-label={b.l}
                        onClick={b.act}
                        className="grid h-7 w-7 place-items-center rounded-full outline-none transition hover:bg-black/[0.05] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                      >
                        <Ico d={b.d} size={14} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** the live voice: the latest levels as bars, newest on the right, mirrored about the middle */
function Wave({ levels, reduce }: { levels: Float32Array; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const shown = new Float32Array(levels.length);
    const draw = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const n = levels.length;
      const step = w / n;
      for (let i = 0; i < n; i++) {
        shown[i] += (levels[i] - shown[i]) * (reduce ? 1 : 0.35);
        const bh = Math.max(3, shown[i] * (h - 2));
        const x = i * step + step / 2;
        // fade in from the left so old sound drifts away
        ctx.globalAlpha = 0.25 + 0.75 * (i / n);
        ctx.fillStyle = "#ff3b30";
        ctx.beginPath();
        ctx.roundRect(x - 1.25, h / 2 - bh / 2, 2.5, bh, 1.25);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [levels, reduce]);
  return <canvas ref={ref} aria-hidden="true" className="h-[24px] min-w-0 flex-1" />;
}
