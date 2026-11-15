"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability, react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type RefObject,
  type MouseEvent as RMouseEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CtxFile = {
  id: string;
  name: string;
  kind: "pdf" | "folder" | "image" | "doc";
  meta: string;
  tag?: string;
  pinned?: boolean;
  sidebar?: boolean;
};
export type DesktopContextMenuProps = {
  files?: CtxFile[];
  onAction?: (action: string, file: CtxFile) => void;
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
  pdf: "M44 120h168a4 4 0 0 0 4-4V88a8 8 0 0 0-2.34-5.66l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v76a4 4 0 0 0 4 4m108-76l44 44h-44Zm72 108.53a8.18 8.18 0 0 1-8.25 7.47H192v16h15.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53H192v15.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V152a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8.53M64 144H48a8 8 0 0 0-8 8v55.73a8.17 8.17 0 0 0 7.47 8.27a8 8 0 0 0 8.53-8v-8h7.4c15.24 0 28.14-11.92 28.59-27.15A28 28 0 0 0 64 144m-.35 40H56v-24h8a12 12 0 0 1 12 13.16A12.25 12.25 0 0 1 63.65 184M128 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h15.32c19.66 0 36.21-15.48 36.67-35.13A36 36 0 0 0 128 144m-.49 56H120v-40h8a20 20 0 0 1 20 20.77c-.42 10.82-9.66 19.23-20.49 19.23",
  folder:
    "M232 88v112.89A15.13 15.13 0 0 1 216.89 216H40a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h53.33a16.12 16.12 0 0 1 9.6 3.2L130.67 72H216a16 16 0 0 1 16 16",
  image:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 112H40v-39.31l46.34-46.35a8 8 0 0 1 11.32 0L165 181.66a8 8 0 0 0 11.32-11.32l-17.66-17.65L173 138.34a8 8 0 0 1 11.31 0L216 170.07z",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  open: "M228 104a12 12 0 0 1-24 0V69l-59.51 59.51a12 12 0 0 1-17-17L187 52h-35a12 12 0 0 1 0-24h64a12 12 0 0 1 12 12Zm-44 24a12 12 0 0 0-12 12v64H52V84h64a12 12 0 0 0 0-24H48a20 20 0 0 0-20 20v128a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20v-68a12 12 0 0 0-12-12",
  openWith:
    "M216 36H40a20 20 0 0 0-20 20v144a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20m-4 160H44V60h168ZM60 92a16 16 0 1 1 16 16a16 16 0 0 1-16-16m48 0a16 16 0 1 1 16 16a16 16 0 0 1-16-16",
  rename:
    "m230.14 70.54l-44.68-44.69a20 20 0 0 0-28.29 0L33.86 149.17A19.85 19.85 0 0 0 28 163.31V208a20 20 0 0 0 20 20h44.69a19.86 19.86 0 0 0 14.14-5.86L230.14 98.82a20 20 0 0 0 0-28.28M91 204H52v-39l84-84l39 39Zm101-101l-39-39l18.34-18.34l39 39Z",
  dup: "M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z",
  share:
    "M220 112v96a20 20 0 0 1-20 20H56a20 20 0 0 1-20-20v-96a20 20 0 0 1 20-20h20a12 12 0 0 1 0 24H60v88h136v-88h-16a12 12 0 0 1 0-24h20a20 20 0 0 1 20 20M96.49 72.49L116 53v83a12 12 0 0 0 24 0V53l19.51 19.52a12 12 0 1 0 17-17l-40-40a12 12 0 0 0-17 0l-40 40a12 12 0 1 0 17 17Z",
  pin: "m238.15 78.54l-60.69-60.68a20 20 0 0 0-28.3 0L97.2 70c-12.43-3.33-36.68-5.72-61.74 14.5a20 20 0 0 0-1.6 29.73l45.46 45.47l-39.8 39.8a12 12 0 0 0 17 17l39.8-39.81l45.47 45.46a20 20 0 0 0 14.12 5.85c.46 0 .93 0 1.4-.05a20 20 0 0 0 14.56-7.95c4.69-6.23 11-16.13 14.44-28s3.45-22.88.16-33.4l51.7-51.87a20 20 0 0 0-.02-28.19m-74.26 68.79a12 12 0 0 0-2.23 13.84c3.43 6.86 6.9 21-6.28 40.65L54.08 100.53c21.09-14.59 39.53-6.64 41-6a11.67 11.67 0 0 0 13.81-2.29l54.43-54.61l55 55Z",
  pinFill:
    "m235.33 104l-53.47 53.65c4.56 12.67 6.45 33.89-13.19 60A15.93 15.93 0 0 1 157 224h-1.13a16 16 0 0 1-11.32-4.69L96.29 171l-42.63 42.66a8 8 0 0 1-11.32-11.32L85 159.71l-48.3-48.3A16 16 0 0 1 38 87.63c25.42-20.51 49.75-16.48 60.4-13.14L152 20.7a16 16 0 0 1 22.63 0l60.69 60.68a16 16 0 0 1 .01 22.62",
  sidebar:
    "M216 36H40a20 20 0 0 0-20 20v144a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20M44 60h32v136H44Zm168 136H100V60h112Z",
  trash:
    "M216 48h-36V36a28 28 0 0 0-28-28h-48a28 28 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20V72h4a12 12 0 0 0 0-24M100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0m48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0",
  caret: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  link: "M117.18 188.74a12 12 0 0 1 0 17l-5.12 5.12A58.26 58.26 0 0 1 70.6 228a58.62 58.62 0 0 1-41.46-100.08l34.75-34.75a58.64 58.64 0 0 1 98.56 28.11a12 12 0 1 1-23.37 5.44a34.65 34.65 0 0 0-58.22-16.58l-34.75 34.75A34.62 34.62 0 0 0 70.57 204a34.4 34.4 0 0 0 24.49-10.14l5.11-5.12a12 12 0 0 1 17.01 0M226.83 45.17a58.65 58.65 0 0 0-82.93 0l-5.11 5.11a12 12 0 0 0 17 17l5.12-5.12a34.63 34.63 0 1 1 49 49l-34.81 34.7A34.4 34.4 0 0 1 150.61 156a34.63 34.63 0 0 1-33.69-26.72a12 12 0 0 0-23.38 5.44A58.64 58.64 0 0 0 150.56 180h.05a58.28 58.28 0 0 0 41.47-17.17l34.75-34.75a58.62 58.62 0 0 0 0-82.91",
  mail: "M224 44H32a12 12 0 0 0-12 12v136a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a12 12 0 0 0-12-12m-30.85 24L128 127.72L62.85 68ZM44 188V83.28l75.89 69.57a12 12 0 0 0 16.22 0L212 83.28V188Z",
  chat: "M128 20a108 108 0 0 0-96.15 157.23L21 209.66A20 20 0 0 0 46.34 235l32.43-10.81A108 108 0 1 0 128 20m0 192a84 84 0 0 1-42.06-11.27a12 12 0 0 0-6-1.62a12.1 12.1 0 0 0-3.8.62l-29.79 9.93l9.93-29.79a12 12 0 0 0-1-9.81A84 84 0 1 1 128 212",
  eye: "M251 123.13c-.37-.81-9.13-20.26-28.48-39.61C196.63 57.67 164 44 128 44S59.37 57.67 33.51 83.52C14.16 102.87 5.4 122.32 5 123.13a12.08 12.08 0 0 0 0 9.75c.37.82 9.13 20.26 28.49 39.61C59.37 198.34 92 212 128 212s68.63-13.66 94.48-39.51c19.36-19.35 28.12-38.79 28.49-39.61a12.08 12.08 0 0 0 .03-9.75m-46.06 33C183.47 177.27 157.59 188 128 188s-55.47-10.73-76.91-31.88A130.4 130.4 0 0 1 29.52 128a130.5 130.5 0 0 1 21.57-28.11C72.54 78.73 98.41 68 128 68s55.46 10.73 76.91 31.89A130.4 130.4 0 0 1 226.48 128a130.5 130.5 0 0 1-21.57 28.12ZM128 84a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 64a20 20 0 1 1 20-20a20 20 0 0 1-20 20",
  pen: "M252 92.68a19.86 19.86 0 0 0-5.86-14.14L177.46 9.85a20 20 0 0 0-28.29 0l-27.82 27.82l-57.24 21.47A20 20 0 0 0 51.4 74.58L28.16 214A12 12 0 0 0 40 228a12 12 0 0 0 2-.16l139.45-23.25a20.07 20.07 0 0 0 15.44-12.7l21.46-57.25l27.82-27.82A19.85 19.85 0 0 0 252 92.68m-76.8 88.62L75 198l33-33a34 34 0 1 0-17-17l-33 33L74.7 80.8L125 61.94L194.05 131ZM112 134a10 10 0 1 1 10 10a10 10 0 0 1-10-10m96-23l-63-63l18.34-18.34l63 63Z",
  brush:
    "M236 32a12 12 0 0 0-12-12c-44.78 0-90 48.54-115.9 82a64 64 0 0 0-80 62c0 12-3.1 22.71-9.23 31.76a43 43 0 0 1-9.47 10.29a11.88 11.88 0 0 0-4.91 13.38A12.07 12.07 0 0 0 16.11 228h76A64 64 0 0 0 154 148c33.49-25.95 82-71.2 82-116m-26.38 14.39c-4 12.92-13.15 27.49-26.92 42.91c-3 3.39-6.16 6.7-9.35 9.89a104.3 104.3 0 0 0-16.5-16.51c3.19-3.19 6.49-6.32 9.88-9.35c15.42-13.78 29.98-22.9 42.89-26.94M92.07 204H42a80.17 80.17 0 0 0 10.14-40a40 40 0 1 1 40 40Zm38.18-91.32c3.12-3.93 6.55-8.09 10.23-12.35a80.5 80.5 0 0 1 15.23 15.24a388 388 0 0 1-12.35 10.23a64.4 64.4 0 0 0-13.11-13.12",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const FILES: CtxFile[] = [
  { id: "f1", name: "Q3 report.pdf", kind: "pdf", meta: "2.4 MB" },
  {
    id: "f2",
    name: "Brand assets",
    kind: "folder",
    meta: "18 files",
    sidebar: true,
  },
  {
    id: "f3",
    name: "Launch hero.png",
    kind: "image",
    meta: "840 KB",
    tag: "#0a84ff",
  },
  { id: "f4", name: "Release notes.txt", kind: "doc", meta: "6 KB" },
];
const TAGS = ["#ff3b30", "#ff9f0a", "#30d158", "#0a84ff", "#bf5af2"];

type Item =
  | {
      kind: "item";
      id: string;
      label: string;
      icon: string;
      keys?: string;
      sub?: Item[];
      danger?: boolean;
    }
  | { kind: "check"; id: string; label: string; icon: string; on: boolean }
  | { kind: "tags" }
  | { kind: "sep" };

/**
 * A context menu that opens where you are.
 *
 * Right-click a file (or long-press it, or focus it and press Shift F10) and the menu springs out of the point you
 * clicked, from the corner nearest the cursor, flipping to stay on screen. A soft highlight slides from row to row.
 * Submenus open on a short hover and stay open while you head toward them, even across a corner of another row, so
 * you never lose them on the way. Everything works: open, rename in place, duplicate, share, pin to the top, show in
 * the sidebar, colour tags, and delete, which asks once more and then offers Undo. With a keyboard: arrows to move,
 * Right to open a submenu, Left or Escape to leave it, Enter to choose, or type a letter to jump.
 *   <DesktopContextMenu files={files} onAction={(action, file) => run(action, file)} />
 */
export default function DesktopContextMenu({
  files = FILES,
  onAction,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: DesktopContextMenuProps) {
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
  const menuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  // true while the demo itself is acting, so it never moves anyone's focus
  const demo = useRef(false);
  const [list, setList] = useState(files);
  const [menu, setMenu] = useState<{
    file: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [hl, setHl] = useState<string | null>(null);
  const [sub, setSub] = useState<{
    id: string;
    top: number;
    left: boolean;
  } | null>(null);
  const [subHl, setSubHl] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    text: string;
    undo?: () => void;
    key: number;
  } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const file = menu ? (list.find((f) => f.id === menu.file) ?? null) : null;

  const items: Item[] = file
    ? [
        { kind: "item", id: "open", label: "Open", icon: I.open, keys: "⌘O" },
        {
          kind: "item",
          id: "openWith",
          label: "Open with",
          icon: I.openWith,
          sub: [
            { kind: "item", id: "with:Preview", label: "Preview", icon: I.eye },
            { kind: "item", id: "with:Figma", label: "Figma", icon: I.pen },
            {
              kind: "item",
              id: "with:Photoshop",
              label: "Photoshop",
              icon: I.brush,
            },
          ],
        },
        {
          kind: "item",
          id: "rename",
          label: "Rename",
          icon: I.rename,
          keys: "↩",
        },
        {
          kind: "item",
          id: "dup",
          label: "Duplicate",
          icon: I.dup,
          keys: "⌘D",
        },
        {
          kind: "item",
          id: "share",
          label: "Share",
          icon: I.share,
          sub: [
            {
              kind: "item",
              id: "share:link",
              label: "Copy link",
              icon: I.link,
              keys: "⌘L",
            },
            { kind: "item", id: "share:mail", label: "Email", icon: I.mail },
            { kind: "item", id: "share:msg", label: "Messages", icon: I.chat },
          ],
        },
        { kind: "sep" },
        {
          kind: "check",
          id: "pin",
          label: "Pin to top",
          icon: I.pin,
          on: !!file.pinned,
        },
        {
          kind: "check",
          id: "sidebar",
          label: "Show in sidebar",
          icon: I.sidebar,
          on: !!file.sidebar,
        },
        { kind: "tags" },
        { kind: "sep" },
        {
          kind: "item",
          id: "delete",
          label: "Delete",
          icon: I.trash,
          keys: "⌘⌫",
          danger: true,
        },
      ]
    : [];
  const rows = items.filter((i): i is Extract<Item, { id: string }> => "id" in i);
  const subItems = sub
    ? ((rows.find((r) => r.id === sub.id) as Extract<Item, { kind: "item" }>)?.sub ?? []).filter(
        (i): i is Extract<Item, { kind: "item" }> => i.kind === "item",
      )
    : [];

  const say = (text: string, undo?: () => void) => setToast({ text, undo, key: Date.now() });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.undo ? 4200 : 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // ------------------------------------------------------------ opening and closing
  const openAt = (fileId: string, clientX: number, clientY: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    if (!demo.current) touched.current = true;
    const MW = 236;
    const MH = 372;
    let x = clientX - r.left;
    let y = clientY - r.top;
    let ox = 0;
    let oy = 0;
    // flip so it stays inside the card, growing from the corner nearest the pointer
    if (x + MW > r.width - 8) {
      x = Math.max(8, x - MW);
      ox = 1;
    }
    if (y + MH > r.height - 8) {
      y = Math.max(8, y - MH);
      oy = 1;
    }
    setMenu({ file: fileId, x, y, ox, oy });
    setHl(null);
    setSub(null);
    setArmed(false);
    sfx.tick({ freq: 2200, gain: 0.05 });
    sfx.whoosh(1400, 2600, { dur: 0.12, gain: 0.02 });
    if (!demo.current) setTimeout(() => menuRef.current?.focus({ preventScroll: true }), 10);
  };
  const close = (refocus = true) => {
    const f = menu?.file;
    setMenu(null);
    setSub(null);
    setHl(null);
    setArmed(false);
    if (refocus && f && !demo.current)
      setTimeout(
        () => rootRef.current?.querySelector<HTMLElement>(`[data-file="${f}"]`)?.focus({ preventScroll: true }),
        20,
      );
  };
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !subRef.current?.contains(e.target as Node)) close(false);
    };
    window.addEventListener("pointerdown", down, true);
    return () => window.removeEventListener("pointerdown", down, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  // ------------------------------------------------------------ doing things
  const run = (id: string) => {
    if (!file) return;
    const f = file;
    const act = (name: string) => onAction?.(name, f);
    if (id === "delete") {
      if (!armed) {
        setArmed(true);
        sfx.note(330, { dur: 0.18, gain: 0.05, bell: 0.2 });
        return;
      }
      const at = list.findIndex((x) => x.id === f.id);
      setList((l) => l.filter((x) => x.id !== f.id));
      sfx.whoosh(1600, 300, { dur: 0.35, gain: 0.05 });
      say(`Deleted ${f.name}`, () => {
        setList((l) => {
          const c = l.slice();
          c.splice(at, 0, f);
          return c;
        });
        setToast(null);
      });
      act("delete");
      close(false);
      return;
    }
    if (id === "pin") {
      setList((l) => {
        const next = l.map((x) => (x.id === f.id ? { ...x, pinned: !x.pinned } : x));
        return [...next.filter((x) => x.pinned), ...next.filter((x) => !x.pinned)];
      });
      sfx.note(f.pinned ? 523 : 784, { dur: 0.2, gain: 0.05, bell: 0.4 });
      act(f.pinned ? "unpin" : "pin");
      close();
      return;
    }
    if (id === "sidebar") {
      setList((l) => l.map((x) => (x.id === f.id ? { ...x, sidebar: !x.sidebar } : x)));
      sfx.tick({ freq: f.sidebar ? 1800 : 2800, gain: 0.05 });
      act("sidebar");
      return; // a checkbox row leaves the menu open, as on the Mac
    }
    if (id.startsWith("tag:")) {
      const c = id.slice(4);
      setList((l) => l.map((x) => (x.id === f.id ? { ...x, tag: x.tag === c ? undefined : c } : x)));
      sfx.note(660 + TAGS.indexOf(c) * 80, {
        dur: 0.16,
        gain: 0.04,
        bell: 0.5,
      });
      act("tag");
      return;
    }
    if (id === "rename") {
      setRenaming(f.id);
      close(false);
      return;
    }
    if (id === "dup") {
      const dot = f.name.lastIndexOf(".");
      const name = dot > 0 ? `${f.name.slice(0, dot)} copy${f.name.slice(dot)}` : `${f.name} copy`;
      const nf = { ...f, id: `${f.id}-${Date.now()}`, name, pinned: false };
      setList((l) => {
        const i = l.findIndex((x) => x.id === f.id);
        const c = l.slice();
        c.splice(i + 1, 0, nf);
        return c;
      });
      setFresh(nf.id);
      setTimeout(() => setFresh(null), 900);
      sfx.note(880, { dur: 0.2, gain: 0.05, bell: 0.5 });
      act("duplicate");
      close();
      return;
    }
    if (id.startsWith("with:")) say(`Opening ${f.name} in ${id.slice(5)}`);
    else if (id === "open") say(`Opened ${f.name}`);
    else if (id === "share:link") say("Link copied");
    else if (id.startsWith("share:")) say(`Sharing ${f.name} by ${id === "share:mail" ? "email" : "Messages"}`);
    else return;
    sfx.note(988, { dur: 0.18, gain: 0.04, bell: 0.5 });
    act(id);
    close();
  };

  // ------------------------------------------------------------ submenus, and the corridor to them
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPt = useRef<{ x: number; y: number }[]>([]);
  const openSub = (id: string, rowEl: HTMLElement, immediate = false) => {
    if (subTimer.current) clearTimeout(subTimer.current);
    const go = () => {
      const m = menuRef.current?.getBoundingClientRect();
      const rr = rowEl.getBoundingClientRect();
      const root = rootRef.current?.getBoundingClientRect();
      if (!m || !root) return;
      const left = m.right + 200 > root.right - 6;
      setSub({ id, top: rr.top - m.top - 6, left });
      setSubHl(null);
      sfx.tick({ freq: 2600, gain: 0.03 });
    };
    if (immediate) go();
    else subTimer.current = setTimeout(go, 120);
  };
  // while the pointer heads for an open submenu it may cross other rows: if it's inside the triangle from where it
  // was to the submenu's near edge, those rows don't take over
  const headingToSub = (x: number, y: number) => {
    const s = subRef.current?.getBoundingClientRect();
    const prev = lastPt.current[0];
    if (!s || !prev || !sub) return false;
    const ex = sub.left ? s.right : s.left;
    const a = { x: prev.x, y: prev.y };
    const b = { x: ex, y: s.top - 8 };
    const c = { x: ex, y: s.bottom + 8 };
    const sign = (p1: typeof a, p2: typeof a, p3: typeof a) =>
      (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const p = { x, y };
    const d1 = sign(p, a, b);
    const d2 = sign(p, b, c);
    const d3 = sign(p, c, a);
    const neg = d1 < 0 || d2 < 0 || d3 < 0;
    const pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  };
  const onRowEnter = (e: RPointerEvent<HTMLElement>, r: Extract<Item, { id: string }>) => {
    if (e.pointerType !== "mouse") return;
    if (sub && sub.id !== r.id && headingToSub(e.clientX, e.clientY)) {
      // check again in a moment: if the pointer stopped here, it meant this row
      if (subTimer.current) clearTimeout(subTimer.current);
      const el = e.currentTarget;
      subTimer.current = setTimeout(() => {
        setHl(r.id);
        if (r.kind === "item" && r.sub) openSub(r.id, el, true);
        else setSub(null);
      }, 260);
      return;
    }
    setHl(r.id);
    if (r.kind === "item" && r.sub) openSub(r.id, e.currentTarget);
    else {
      if (subTimer.current) clearTimeout(subTimer.current);
      if (sub) subTimer.current = setTimeout(() => setSub(null), 80);
    }
  };
  const onMenuMove = (e: RPointerEvent<HTMLDivElement>) => {
    lastPt.current = [{ x: e.clientX, y: e.clientY }, ...lastPt.current].slice(0, 4);
  };

  // ------------------------------------------------------------ keyboard
  const typeahead = useRef({ s: "", t: 0 });
  const onMenuKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const inSub = !!sub && subHl != null;
    const pool = inSub ? subItems : rows;
    const cur = inSub ? subHl : hl;
    const i = pool.findIndex((r) => r.id === cur);
    const move = (to: number) => {
      const id = pool[(to + pool.length) % pool.length].id;
      if (inSub) setSubHl(id);
      else {
        setHl(id);
        setSub(null);
      }
      sfx.tick({ freq: 2400, gain: 0.025 });
    };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i < 0 ? pool.length - 1 : i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(pool.length - 1);
    else if (e.key === "ArrowRight" && !inSub) {
      const r = rows[i];
      if (r && r.kind === "item" && r.sub) {
        const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
        if (el) openSub(r.id, el, true);
        setTimeout(() => setSubHl(r.sub![0] && "id" in r.sub![0] ? (r.sub![0] as { id: string }).id : null), 0);
      }
    } else if ((e.key === "ArrowLeft" || e.key === "Escape") && inSub) {
      setSub(null);
      setSubHl(null);
    } else if (e.key === "Escape") close();
    else if (e.key === "Enter" || e.key === " ") {
      if (cur) {
        const r = pool[i];
        if (r && r.kind === "item" && r.sub) {
          const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
          if (el) openSub(r.id, el, true);
          setTimeout(() => setSubHl((r.sub![0] as { id: string }).id), 0);
        } else run(cur);
      }
    } else if (e.key === "Tab") close();
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typeahead.current = {
        s: now - typeahead.current.t < 600 ? typeahead.current.s + e.key.toLowerCase() : e.key.toLowerCase(),
        t: now,
      };
      const hit = pool.find((r) => r.label.toLowerCase().startsWith(typeahead.current.s));
      if (hit) inSub ? setSubHl(hit.id) : setHl(hit.id);
    } else return;
    e.preventDefault();
  };

  // ------------------------------------------------------------ the tiles
  const press = useRef<{
    t: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  const onTileDown = (e: RPointerEvent<HTMLElement>, id: string) => {
    if (e.pointerType === "mouse") return;
    const x = e.clientX;
    const y = e.clientY;
    press.current = { t: setTimeout(() => openAt(id, x, y), 480), x, y };
  };
  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.t);
    press.current = null;
  };
  const onTileKey = (e: RKeyboardEvent<HTMLElement>, id: string) => {
    if ((e.shiftKey && e.key === "F10") || e.key === "DesktopContextMenu") {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      openAt(id, r.left + r.width * 0.6, r.top + r.height * 0.55);
    } else if (e.key === "Enter" && !renaming) {
      say(`Opened ${list.find((f) => f.id === id)?.name}`);
    }
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ openAt, setHl, setSub, openSub, run, close, setList });
  ap.current = { openAt, setHl, setSub, openSub, run, close, setList };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const act = (f: () => void) => {
      demo.current = true;
      f();
      demo.current = false;
    };
    const tile = (id: string) => rootRef.current?.querySelector<HTMLElement>(`[data-file="${id}"]`);
    (async () => {
      while (alive) {
        await sleep(1300);
        if (!ok()) break;
        let el = tile("f1");
        if (!el) break;
        let r = el.getBoundingClientRect();
        act(() => ap.current.openAt("f1", r.left + r.width * 0.55, r.top + r.height * 0.5));
        for (const id of ["open", "openWith", "rename", "dup", "share"]) {
          await sleep(260);
          if (!ok()) break;
          act(() => ap.current.setHl(id));
        }
        await sleep(200);
        const row = menuRef.current?.querySelector<HTMLElement>('[data-row="share"]');
        if (row && ok()) act(() => ap.current.openSub("share", row, true));
        await sleep(1100);
        if (!ok()) break;
        act(() => ap.current.setSub(null));
        act(() => ap.current.setHl("pin"));
        await sleep(500);
        act(() => ap.current.run("tag:#30d158"));
        await sleep(900);
        if (!ok()) break;
        act(() => ap.current.close(false));
        await sleep(900);
        el = tile("f3");
        if (!el || !ok()) break;
        r = el.getBoundingClientRect();
        act(() => ap.current.openAt("f3", r.left + r.width * 0.5, r.top + r.height * 0.45));
        await sleep(500);
        act(() => ap.current.setHl("pin"));
        await sleep(600);
        if (!ok()) break;
        act(() => ap.current.run("pin"));
        await sleep(2200);
        if (!ok()) break;
        act(() => ap.current.setList(files));
        await sleep(600);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const [w, setW] = useState(560);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cols = w < 420 ? 2 : 4;

  const row = (r: Extract<Item, { id: string }>, inSubmenu: boolean, active: boolean, idx: number) => {
    const isCheck = r.kind === "check";
    const danger = r.kind === "item" && r.danger;
    const hasSub = r.kind === "item" && !!r.sub;
    const label = r.id === "delete" && armed ? "Delete? Click again" : r.label;
    return (
      <motion.div
        key={r.id}
        data-row={r.id}
        role={isCheck ? "menuitemcheckbox" : "menuitem"}
        aria-checked={isCheck ? (r as { on: boolean }).on : undefined}
        aria-haspopup={hasSub ? "menu" : undefined}
        aria-expanded={hasSub ? sub?.id === r.id : undefined}
        id={`${uid}-${r.id.replace(/[^a-z0-9]/gi, "")}`}
        onPointerEnter={(e) => (inSubmenu ? e.pointerType === "mouse" && setSubHl(r.id) : onRowEnter(e, r))}
        onClick={() => {
          if (hasSub) {
            const el = menuRef.current?.querySelector<HTMLElement>(`[data-row="${r.id}"]`);
            if (el) openSub(r.id, el, true);
          } else run(r.id);
        }}
        className={`relative flex h-[32px] cursor-default items-center gap-2.5 rounded-[8px] px-2.5 text-[13.5px] ${danger ? "text-[#d70015]" : "text-[#1d1d1f]"}`}
        initial={reduce || inSubmenu ? false : { opacity: 0, y: -3 }}
        animate={
          r.id === "delete" && armed && !reduce ? { opacity: 1, y: 0, x: [0, -3, 3, -2, 0] } : { opacity: 1, y: 0 }
        }
        transition={{
          delay: reduce || inSubmenu ? 0 : 0.012 * idx,
          duration: 0.16,
        }}
      >
        <span className={`relative ${active ? "text-white" : danger ? "text-[#d70015]" : "text-[#6e6e73]"}`}>
          <Ico d={r.icon} size={15} />
        </span>
        <span className={`relative flex-1 truncate ${active ? "text-white" : ""}`}>{label}</span>
        {isCheck && (r as { on: boolean }).on && (
          <span className={`relative ${active ? "text-white" : "text-[#0a84ff]"}`}>
            <Ico d={I.check} size={13} />
          </span>
        )}
        {r.kind === "item" && r.keys && (
          <span className={`relative text-[12px] tabular-nums ${active ? "text-white/80" : "text-[#86868b]"}`}>
            {r.keys}
          </span>
        )}
        {hasSub && (
          <span className={`relative ${active ? "text-white" : "text-[#86868b]"}`}>
            <Ico d={I.caret} size={10} />
          </span>
        )}
      </motion.div>
    );
  };

  const panel =
    "rounded-[14px] bg-[rgba(248,248,250,0.7)] p-[5px] shadow-[0_0_0_.5px_rgba(0,0,0,.22),inset_0_.5px_0_rgba(255,255,255,.9),inset_0_0_0_.5px_rgba(255,255,255,.35),0_2px_4px_rgba(0,0,0,.06),0_18px_44px_-8px_rgba(20,10,60,.45)] backdrop-blur-[28px] backdrop-saturate-[1.9] outline-none";

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={(e) => {
        if (e.isTrusted) touched.current = true;
      }}
      className={`relative w-full max-w-[600px] select-none overflow-hidden rounded-[28px] p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.45)] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        minHeight: 380,
      }}
    >
      {/* the wallpaper: a dusk over hills, soft enough to read on, rich enough for the glass to blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 85% 10%, #ffb88a 0%, rgba(255,184,138,0) 55%), radial-gradient(80% 60% at 10% 20%, #7b6cf6 0%, rgba(123,108,246,0) 60%), radial-gradient(120% 90% at 50% 120%, #1e2a78 0%, rgba(30,42,120,0) 60%), linear-gradient(180deg, #5b5bd6 0%, #c16ba8 48%, #f39a7b 100%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${uid}-h1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2f8f" stopOpacity=".55" />
            <stop offset="1" stopColor="#1b1650" stopOpacity=".9" />
          </linearGradient>
          <linearGradient id={`${uid}-h2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24205e" stopOpacity=".8" />
            <stop offset="1" stopColor="#0f0c33" />
          </linearGradient>
        </defs>
        <path d="M0 120 C 90 70 160 90 240 105 S 420 60 600 95 L600 200 L0 200 Z" fill={`url(#${uid}-h1)`} />
        <path d="M0 160 C 120 120 210 150 300 140 S 500 115 600 145 L600 200 L0 200 Z" fill={`url(#${uid}-h2)`} />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      <div className="relative flex items-baseline justify-between">
        <h3
          className="text-[17px] font-semibold tracking-[-0.02em] text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.4)" }}
        >
          Desktop
        </h3>
        <p className="text-[12px] text-white/80" style={{ textShadow: "0 1px 2px rgba(0,0,0,.45)" }}>
          {cols === 2 ? "Long-press a file" : "Right-click a file, or focus it and press Shift F10"}
        </p>
      </div>

      <div
        className="relative mt-4 grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="list"
      >
        <AnimatePresence initial={false}>
          {list.map((f) => {
            const open = menu?.file === f.id;
            return (
              <motion.div
                key={f.id}
                layout={reduce ? false : "position"}
                role="listitem"
                initial={fresh === f.id && !reduce ? { opacity: 0, scale: 0.6, y: 10 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.5,
                        filter: "blur(6px)",
                        rotate: -6,
                        transition: { duration: 0.3 },
                      }
                }
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <div
                  data-file={f.id}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="menu"
                  aria-label={`${f.name}, ${f.meta}${f.pinned ? ", pinned" : ""}. Press Shift F10 for actions.`}
                  onContextMenu={(e: RMouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    openAt(f.id, e.clientX, e.clientY);
                  }}
                  onPointerDown={(e) => onTileDown(e, f.id)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onPointerMove={(e) =>
                    press.current &&
                    Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8 &&
                    cancelPress()
                  }
                  onKeyDown={(e) => onTileKey(e, f.id)}
                  className="group relative flex flex-col items-center rounded-[16px] px-1 pb-2 pt-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  style={{ WebkitTouchCallout: "none" }}
                >
                  {f.pinned && (
                    <motion.span
                      className="absolute right-2.5 top-2.5 text-[#ff9f0a]"
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      }}
                      aria-hidden="true"
                    >
                      <Ico d={I.pinFill} size={13} />
                    </motion.span>
                  )}
                  <span
                    className={`relative grid h-[76px] w-[76px] place-items-center rounded-[14px] transition-colors ${open ? "bg-black/[0.22]" : ""}`}
                  >
                    <FileArt kind={f.kind} uid={`${uid}${f.id}`} />
                  </span>
                  {renaming === f.id ? (
                    <input
                      autoFocus
                      defaultValue={f.name}
                      onFocus={(e) => {
                        const dot = f.name.lastIndexOf(".");
                        e.currentTarget.setSelectionRange(0, dot > 0 ? dot : f.name.length);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                          e.currentTarget.value = f.name;
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim() || f.name;
                        setList((l) => l.map((x) => (x.id === f.id ? { ...x, name: v } : x)));
                        setRenaming(null);
                        if (v !== f.name) say(`Renamed to ${v}`);
                      }}
                      aria-label="New name"
                      className="mt-2.5 w-full rounded-[6px] bg-white px-1 py-0.5 text-center text-[12.5px] font-medium outline-none ring-2 ring-[#0a84ff]"
                    />
                  ) : (
                    <span
                      className={`mt-1.5 flex max-w-full items-center gap-1 rounded-[5px] px-1.5 py-[1px] text-[12.5px] font-medium text-white ${open ? "bg-[#0a84ff]" : ""}`}
                      style={{
                        textShadow: open ? "none" : "0 1px 2px rgba(0,0,0,.55), 0 0 8px rgba(0,0,0,.25)",
                      }}
                    >
                      {f.tag && (
                        <motion.span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: f.tag }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 18,
                          }}
                        />
                      )}
                      <span className="truncate">{f.name}</span>
                    </span>
                  )}
                  <span className="mt-0.5 text-[11px] text-white/75" style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
                    {f.meta}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* the menu */}
      <AnimatePresence>
        {menu && file && (
          <motion.div
            key={menu.file + menu.x}
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${file.name}`}
            aria-activedescendant={hl ? `${uid}-${hl.replace(/[^a-z0-9]/gi, "")}` : undefined}
            tabIndex={-1}
            onKeyDown={onMenuKey}
            onPointerMove={onMenuMove}
            onPointerLeave={() => !sub && setHl(null)}
            className={`absolute z-30 w-[236px] ${panel}`}
            style={{
              left: menu.x,
              top: menu.y,
              transformOrigin: `${menu.ox ? "100%" : "0%"} ${menu.oy ? "100%" : "0%"}`,
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{
              type: "spring",
              stiffness: 620,
              damping: 34,
              filter: { duration: 0.14 },
              opacity: { duration: 0.1 },
            }}
          >
            <Highlight panel={menuRef} id={hl} danger={hl === "delete"} reduce={reduce} />
            {items.map((it, k) => {
              if (it.kind === "sep")
                return <div key={`s${k}`} role="separator" className="mx-2.5 my-[5px] h-px bg-black/[0.08]" />;
              if (it.kind === "tags")
                return (
                  <div key="tags" className="flex items-center gap-2 px-2.5 py-2" role="group" aria-label="Colour tag">
                    {TAGS.map((c) => {
                      const on = file.tag === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="menuitemradio"
                          aria-checked={on}
                          aria-label={`Tag ${["red", "orange", "green", "blue", "purple"][TAGS.indexOf(c)]}`}
                          onPointerEnter={() => {
                            setHl(null);
                            if (sub) setSub(null);
                          }}
                          onClick={() => run(`tag:${c}`)}
                          className="grid h-[22px] w-[22px] place-items-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                          style={{
                            background: c,
                            boxShadow: on ? `0 0 0 2px #fff, 0 0 0 3.5px ${c}` : "inset 0 0 0 1px rgba(0,0,0,.08)",
                          }}
                        >
                          {on && <Ico d={I.check} size={11} />}
                        </button>
                      );
                    })}
                  </div>
                );
              return row(it, false, hl === it.id, k);
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the submenu */}
      <AnimatePresence>
        {menu && sub && subItems.length > 0 && (
          <motion.div
            key={sub.id}
            ref={subRef}
            role="menu"
            aria-label={rows.find((r) => r.id === sub.id)?.label}
            className={`absolute z-40 w-[196px] ${panel}`}
            style={{
              left: sub.left ? menu.x - 196 + 4 : menu.x + 236 - 4,
              top: menu.y + sub.top,
              transformOrigin: sub.left ? "100% 0%" : "0% 0%",
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: sub.left ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
              opacity: { duration: 0.1 },
            }}
            onPointerEnter={() => {
              if (subTimer.current) clearTimeout(subTimer.current);
              setHl(sub.id);
            }}
            onPointerLeave={() => setSubHl(null)}
          >
            <Highlight panel={subRef} id={subHl} danger={false} reduce={reduce} />
            {subItems.map((it, k) => row(it, true, subHl === it.id, k))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* what happened */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            role="status"
            className="absolute bottom-4 left-1/2 z-50 flex items-center gap-3 whitespace-nowrap rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,.6)]"
            style={{ x: "-50%" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
          >
            <span className="max-w-[260px] truncate">{toast.text}</span>
            {toast.undo ? (
              <button
                type="button"
                onClick={toast.undo}
                className="rounded-full bg-white/[0.15] px-3 py-1 text-[12.5px] font-semibold outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Undo
              </button>
            ) : (
              <span className="w-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** the highlight behind the active row: one element that springs to wherever that row is */
function Highlight({
  panel,
  id,
  danger,
  reduce,
}: {
  panel: RefObject<HTMLDivElement | null>;
  id: string | null;
  danger: boolean;
  reduce: boolean;
}) {
  const [box, setBox] = useState<{ top: number; h: number } | null>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const el = id ? panel.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`) : null;
    setBox(el ? { top: el.offsetTop, h: el.offsetHeight } : null);
  }, [id, panel]);
  const jump = first.current || reduce;
  useEffect(() => {
    if (box) first.current = false;
  }, [box]);
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute left-[5px] right-[5px] top-0 rounded-[8px]"
      style={{
        background: danger ? "linear-gradient(180deg,#ff5b52,#e8322a)" : "linear-gradient(180deg,#2a95ff,#0a74ec)",
        boxShadow: "inset 0 .5px 0 rgba(255,255,255,.35), 0 1px 2px rgba(0,60,160,.25)",
      }}
      initial={false}
      animate={{ y: box?.top ?? 0, height: box?.h ?? 32, opacity: box ? 1 : 0 }}
      transition={
        jump
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 700,
              damping: 46,
              opacity: { duration: 0.08 },
            }
      }
    />
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** file icons drawn as the things they are: a page with its corner folded, a folder with its tab, a photo print */
function FileArt({ kind, uid }: { kind: CtxFile["kind"]; uid: string }) {
  const id = uid.replace(/[^a-z0-9]/gi, "");
  const drop = "drop-shadow(0 3px 4px rgba(10,5,40,.35)) drop-shadow(0 1px 1px rgba(10,5,40,.25))";
  if (kind === "folder")
    return (
      <svg width="64" height="52" viewBox="0 0 64 52" style={{ filter: drop }} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fb4ff" />
            <stop offset="1" stopColor="#2f8fe8" />
          </linearGradient>
          <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd0ff" />
            <stop offset=".12" stopColor="#6cbcff" />
            <stop offset="1" stopColor="#3b9af0" />
          </linearGradient>
        </defs>
        <path
          d="M3 9a4 4 0 0 1 4-4h14.5c1.3 0 2.5.6 3.2 1.7L27 10h30a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"
          fill={`url(#${id}b)`}
        />
        <rect x="6" y="12" width="52" height="8" rx="2" fill="#fff" opacity=".85" />
        <path d="M3 18.5a4 4 0 0 1 4-4h50a4 4 0 0 1 4 4V46a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill={`url(#${id}f)`} />
        <path d="M7 15h50a3.5 3.5 0 0 1 3.5 3.5" stroke="#d6efff" strokeWidth=".8" fill="none" opacity=".9" />
        <path d="M24 33h16" stroke="#2a7fd6" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (kind === "image")
    return (
      <svg
        width="62"
        height="50"
        viewBox="0 0 62 50"
        style={{ filter: drop, transform: "rotate(-3deg)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9a76" />
            <stop offset=".55" stopColor="#ffc78f" />
            <stop offset="1" stopColor="#ffe3b3" />
          </linearGradient>
          <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d5bd0" />
            <stop offset="1" stopColor="#3b2f8f" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="60" height="48" rx="2.5" fill="#fff" />
        <rect x="4.5" y="4.5" width="53" height="35" rx="1" fill={`url(#${id}s)`} />
        <circle cx="42" cy="17" r="5" fill="#fff6e0" />
        <path d="M4.5 33 L18 20 L27 28 L35 21 L57.5 37 V39.5 H4.5 Z" fill={`url(#${id}m)`} />
        <path d="M4.5 36 L22 27 L38 34 L57.5 30 V39.5 H4.5 Z" fill="#241d63" opacity=".85" />
        <rect x="4.5" y="4.5" width="53" height="35" rx="1" fill="none" stroke="rgba(0,0,0,.08)" />
      </svg>
    );
  const pdf = kind === "pdf";
  return (
    <svg width="46" height="58" viewBox="0 0 46 58" style={{ filter: drop }} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef0f4" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset="1" stopColor="#c9ced8" />
        </linearGradient>
      </defs>
      <path
        d="M4 1h27l14 14v39a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"
        fill={`url(#${id}p)`}
        stroke="rgba(0,0,0,.12)"
        strokeWidth=".6"
      />
      <path d="M31 1v11a3 3 0 0 0 3 3h11z" fill={`url(#${id}c)`} />
      <path d="M31 12a3 3 0 0 0 3 3h11" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
      {[22, 27, 32, 37, 42].map((y, i) => (
        <rect key={y} x="8" y={y} width={i % 2 ? 22 : 30} height="1.6" rx=".8" fill="#c3c8d2" />
      ))}
      {pdf ? (
        <g>
          <rect x="1" y="44" width="32" height="10" rx="2" fill="#ff3b30" />
          <text
            x="17"
            y="51.6"
            textAnchor="middle"
            fontSize="7"
            fontWeight="800"
            fill="#fff"
            fontFamily="-apple-system, system-ui, sans-serif"
            letterSpacing=".3"
          >
            PDF
          </text>
        </g>
      ) : (
        <text
          x="8"
          y="53"
          fontSize="6.5"
          fontWeight="700"
          fill="#8e94a0"
          fontFamily="-apple-system, system-ui, sans-serif"
        >
          TXT
        </text>
      )}
    </svg>
  );
}
