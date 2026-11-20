# Folder Upload

Add the "Folder Upload" component from Nexus UI to my project.

An upload card built around a glass folder. Pick or drop files and each little document drops in from above behind the frosted front, which dips as it lands, while its row fills; cancel one and it lifts back out. When all are in, they settle low and the folder glows green.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FolderUpload } from "@/components/folder-upload";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/folder-upload/folder-upload.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type UploadFile = { name: string; size: number };
export type FolderUploadProps = {
  folder?: string;
  /** files the Browse button pretends to pick, in bytes */
  demoFiles?: UploadFile[];
  /** bytes per second the upload pretends to move */
  speed?: number;
  maxSize?: number;
  onDone?: (files: UploadFile[]) => void;
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
  folder:
    "M216 72h-85.33l-27.74-20.8a16.12 16.12 0 0 0-9.6-3.2H40a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h176.89A15.13 15.13 0 0 0 232 200.89V88a16 16 0 0 0-16-16m0 128H40V64h53.33l29.87 22.4A8 8 0 0 0 128 88h88Z",
  upload:
    "M228 144v64a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12v-64a12 12 0 0 1 24 0v52h152v-52a12 12 0 0 1 24 0M96.49 80.49L116 61v83a12 12 0 0 0 24 0V61l19.51 19.52a12 12 0 1 0 17-17l-40-40a12 12 0 0 0-17 0l-40 40a12 12 0 1 0 17 17Z",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  pdf: "M232 164H70.38c2.2-4.42 4.41-8.94 6.59-13.52l.79-1.66c13.52-1.65 28.69-11.3 45.38-28.87c5.31 12 14 24.73 27.59 27.29c5.26 1 13.51.79 22.93-5.82a58 58 0 0 0 9-7.91C190.9 141.2 205.68 148 232 148a12 12 0 0 0 0-24c-31 0-35.42-10.49-36-12.38c.49-5.37-2.75-9.76-7.88-11.63s-11.17.78-14.22 5.46c-10 15.32-16.62 18.62-18.75 18.21c-4.88-.91-12.39-15.54-15.44-30.09a12 12 0 0 0-21.13-5c-10.3 12.92-19.16 21.79-26.47 27.56c21.19-52.94 17-72.22 11.37-82.25C98.48 24.91 89.41 20 78 20c-18.08 0-32.64 16.55-39 44.26c-3.45 15.1-4 31.81-1.46 45.85c2.65 14.71 8.36 25.7 16.68 32.23c-3.53 7.44-7.22 14.72-10.75 21.66H24a12 12 0 0 0 0 24h6.7c-9.7 17.67-16.85 29.6-17 29.81a12 12 0 1 0 20.56 12.38C34.91 229.15 45.23 212 58 188h174a12 12 0 0 0 0-24M62.43 69.6C65.77 55 72.45 44 78 44c3.71 0 4.29 1 4.64 1.64c1.43 2.53 6.55 17.07-17.44 72.78a44.6 44.6 0 0 1-4-12.56c-1.97-10.97-1.52-24.19 1.23-36.26",
  play: "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128",
  image:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 112H40v-39.31l46.34-46.35a8 8 0 0 1 11.32 0L165 181.66a8 8 0 0 0 11.32-11.32l-17.66-17.65L173 138.34a8 8 0 0 1 11.31 0L216 170.07z",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
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

const DEFAULT_FILES: UploadFile[] = [
  { name: "Brand guidelines.pdf", size: 4.1e6 },
  { name: "Launch teaser.mp4", size: 18.6e6 },
  { name: "Hero shot.png", size: 2.4e6 },
];
const KIND = (n: string) => {
  const e = n.split(".").pop()?.toLowerCase() ?? "";
  if (e === "pdf") return { label: "PDF", color: "#f04452", icon: I.pdf };
  if (["mp4", "mov", "webm"].includes(e))
    return {
      label: e.toUpperCase().slice(0, 3),
      color: "#8b5cf6",
      icon: I.play,
    };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(e))
    return {
      label: e === "jpeg" ? "JPG" : e.toUpperCase().slice(0, 4),
      color: "#2f8cf0",
      icon: I.image,
    };
  return {
    label: (e || "file").toUpperCase().slice(0, 4),
    color: "#64748b",
    icon: I.doc,
  };
};
const mb = (b: number) => (b / 1e6).toFixed(1);

// a little document: a rounded sheet with a folded corner, its kind on it
function Doc({ name, w = 46, style }: { name: string; w?: number; style?: CSSProperties }) {
  const k = KIND(name);
  const h = w * 1.22;
  return (
    <div style={{ position: "relative", width: w, height: h, ...style }}>
      <svg
        viewBox="0 0 46 56"
        width={w}
        height={h}
        style={{
          position: "absolute",
          inset: 0,
          filter: "drop-shadow(0 6px 10px rgba(15,23,42,0.18))",
        }}
        aria-hidden="true"
      >
        <path d="M8 0 H32 L46 14 V48 Q46 56 38 56 H8 Q0 56 0 48 V8 Q0 0 8 0 Z" fill={k.color} />
        <path d="M32 0 V9 Q32 14 37 14 H46 Z" fill="rgba(255,255,255,0.45)" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: h * 0.2,
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <Ico d={k.icon} size={w * 0.32} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: h * 0.12,
          textAlign: "center",
          fontSize: w * 0.22,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.02em",
        }}
      >
        {k.label}
      </div>
    </div>
  );
}

type Item = {
  id: number;
  name: string;
  size: number;
  sent: number;
  state: "up" | "done" | "gone";
  d: number;
};

/**
 * An upload card built around a glass folder. Pick or drop files and each one flies up out of the list as a little
 * document and drops into the folder, sliding down behind its frosted front while its row fills. Cancel a file and
 * its document lifts back out and falls away. When everything is in, the documents settle low in the folder, the
 * front glass glows green for a moment and the heading changes to how much was added.
 */
export default function FolderUpload({
  folder = "Brand assets",
  demoFiles = DEFAULT_FILES,
  speed = 4.5e6,
  maxSize = 50e6,
  onDone,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FolderUploadProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [over, setOver] = useState(false);
  const [gulp, setGulp] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const doneSent = useRef(false);

  const live = items.filter((i) => i.state !== "gone");
  const total = live.reduce((a, b) => a + b.size, 0);
  const sent = live.reduce((a, b) => a + b.sent, 0);
  const uploading = live.some((i) => i.state !== "done");
  const finished = live.length > 0 && !uploading;
  const secs = Math.max(0, Math.ceil((total - sent) / speed));

  const add = (files: UploadFile[]) => {
    const ok = files.filter((f) => f.size <= maxSize);
    if (ok.length < files.length) {
      setErr(
        `${files.length - ok.length} file${files.length - ok.length > 1 ? "s are" : " is"} over ${Math.round(maxSize / 1e6)} MB`,
      );
      sfx.note(220, { dur: 0.25, gain: 0.04, type: "triangle" });
      window.setTimeout(() => setErr(null), 2600);
    }
    if (!ok.length) return;
    doneSent.current = false;
    const fresh = ok.map((f, i) => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      sent: 0,
      state: "up" as const,
      d: i * 0.12,
    }));
    setItems((l) => [...l.filter((i) => i.state !== "gone" && !(finished && i.state === "done")), ...fresh]);
    fresh.forEach((_, i) => {
      sfx.whoosh(500, 1800, { at: i * 0.12, dur: 0.35, gain: 0.025 });
      sfx.tick({ at: 0.45 + i * 0.12, freq: 900, gain: 0.04 });
      // the folder takes it in: its front dips as the document lands
      window.setTimeout(() => setGulp((g) => g + 1), 330 + i * 120);
    });
  };
  const cancel = (id: number) => {
    setItems((l) => l.map((x) => (x.id === id ? { ...x, state: "gone" } : x)));
    sfx.whoosh(1600, 400, { dur: 0.3, gain: 0.025 });
  };
  const reset = () => {
    setItems([]);
    doneSent.current = false;
  };

  // the upload itself, pretended: bytes shared between the files still going
  useEffect(() => {
    if (!uploading) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setItems((l) => {
        const going = l.filter((x) => x.state === "up");
        if (!going.length) return l;
        const share = (speed * dt) / going.length;
        return l.map((x) => {
          if (x.state !== "up") return x;
          const s = Math.min(x.size, x.sent + share * (0.7 + (0.6 * ((x.id * 37) % 10)) / 10));
          if (s >= x.size) {
            sfx.note(880 + (x.id % 4) * 110, {
              dur: 0.18,
              gain: 0.03,
              bell: 0.4,
            });
            return { ...x, sent: x.size, state: "done" };
          }
          return { ...x, sent: s };
        });
      });
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [uploading, speed, sfx]);
  useEffect(() => {
    if (finished && !doneSent.current) {
      doneSent.current = true;
      onDone?.(live.map(({ name, size }) => ({ name, size })));
      sfx.note(659, { dur: 0.25, gain: 0.035, bell: 0.5 });
      sfx.note(988, { at: 0.12, dur: 0.4, gain: 0.035, bell: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // autoplay: browse, cancel nothing, wait, start over
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 600) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
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
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await go("[data-sample]");
        await tap();
        add(demoFiles);
        setGhost(false);
        await wait(3200);
        if (!ok()) return;
        while (ok() && itemsRef.current.some((i) => i.state !== "done" && i.state !== "gone")) await wait(300);
        await wait(2200);
        if (!ok()) return;
        await go("[data-again]");
        await tap();
        reset();
        setGhost(false);
        await wait(1400);
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

  const inFolder = live;
  const heading = finished
    ? `${live.length} file${live.length > 1 ? "s" : ""} uploaded`
    : live.length
      ? `Uploading ${live.length} file${live.length > 1 ? "s" : ""}`
      : "Upload files";
  const sub = finished
    ? `${mb(total)} MB added to ${folder}.`
    : live.length
      ? `${mb(sent)} of ${mb(total)} MB, ${secs} sec left`
      : "Drag files onto the folder, or browse.";

  return (
    <div
      className={`relative w-full max-w-[340px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          touched.current = true;
          add(
            [...e.dataTransfer.files].map((f) => ({
              name: f.name,
              size: f.size,
            })),
          );
        }}
        style={{
          position: "relative",
          borderRadius: 26,
          background: "#fbfcfd",
          boxShadow: "0 0 0 1px rgba(15,23,42,0.06), 0 24px 50px -30px rgba(15,23,42,0.35)",
          padding: 18,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 26,
            padding: "0 10px",
            borderRadius: 13,
            background: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.08)",
            fontSize: 12,
            fontWeight: 500,
            color: "#334155",
          }}
        >
          <Ico d={I.folder} size={13} />
          {folder}
        </span>

        {/* the glass folder */}
        <div data-folder style={{ position: "relative", height: 150, marginTop: 6 }}>
          <motion.div
            animate={{ scale: over ? 1.05 : 1, y: over ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              position: "absolute",
              left: "50%",
              top: 22,
              width: 156,
              height: 118,
              marginLeft: -78,
            }}
          >
            {/* back panel with its tab */}
            <svg
              viewBox="0 0 156 118"
              width="156"
              height="118"
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="fu-back" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d9eaf8" />
                  <stop offset="1" stopColor="#b9d3ea" />
                </linearGradient>
              </defs>
              <path
                d="M12 4 H56 Q62 4 66 9 L71 16 H144 Q152 16 152 24 V106 Q152 114 144 114 H12 Q4 114 4 106 V12 Q4 4 12 4 Z"
                fill="url(#fu-back)"
              />
              <path
                d="M12 4 H56 Q62 4 66 9 L71 16 H144 Q152 16 152 24"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1"
              />
            </svg>
            {/* the documents inside, dropped in from above */}
            <AnimatePresence>
              {inFolder.map((f, i) => {
                const n = inFolder.length;
                const spread = Math.min(30, 84 / Math.max(1, n - 1));
                const x = 78 - 23 + (i - (n - 1) / 2) * spread;
                const rot = (i - (n - 1) / 2) * 6;
                const rest = finished ? 32 : f.state === "done" ? 18 : 10;
                return (
                  <motion.div
                    key={f.id}
                    initial={
                      reduce
                        ? false
                        : {
                            y: -74,
                            x,
                            rotate: rot * 2 + (f.id % 2 ? 10 : -10),
                            opacity: 0,
                            scale: 0.92,
                          }
                    }
                    animate={{
                      y: rest,
                      x,
                      rotate: finished ? rot * 0.5 : rot,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : {
                            y: -80,
                            opacity: 0,
                            rotate: rot * 2.5,
                            transition: {
                              duration: 0.42,
                              ease: [0.4, 0, 0.6, 1],
                            },
                          }
                    }
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            y: {
                              type: "spring",
                              stiffness: 210,
                              damping: 19,
                              delay: f.d,
                            },
                            x: { type: "spring", stiffness: 260, damping: 26 },
                            rotate: {
                              type: "spring",
                              stiffness: 200,
                              damping: 18,
                            },
                            opacity: { duration: 0.25, delay: f.d },
                            scale: {
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: f.d,
                            },
                          }
                    }
                    style={{ position: "absolute", left: 0, top: 0 }}
                  >
                    <Doc name={f.name} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {/* the frosted front, which opens a little to take files and dips as each one lands */}
            <motion.div
              key={gulp}
              initial={reduce || gulp === 0 ? false : { scaleY: 0.9, y: 3 }}
              animate={{
                scaleY: over ? 0.86 : 1,
                y: 0,
                boxShadow: finished
                  ? "inset 0 0 0 1.5px rgba(52,199,89,0.55), 0 10px 30px -10px rgba(52,199,89,0.45)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.8), 0 14px 30px -14px rgba(30,64,120,0.35)",
              }}
              transition={{
                scaleY: { type: "spring", stiffness: 420, damping: 14 },
                y: { type: "spring", stiffness: 420, damping: 14 },
                boxShadow: { duration: 0.5 },
              }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 4,
                height: 72,
                borderRadius: 12,
                background: "linear-gradient(180deg, rgba(236,245,253,0.55), rgba(204,225,243,0.82))",
                backdropFilter: "blur(8px) saturate(1.2)",
                WebkitBackdropFilter: "blur(8px) saturate(1.2)",
                transformOrigin: "50% 100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  top: 6,
                  height: 1,
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                }}
              />
              <AnimatePresence>
                {finished && (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 18,
                      delay: 0.25,
                    }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      marginLeft: -14,
                      marginTop: -14,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      background: "#34c759",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 6px 14px -4px rgba(52,199,89,0.6)",
                    }}
                  >
                    <Ico d={I.check} size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div aria-live="polite" style={{ marginTop: 4 }}>
          <div style={{ position: "relative", height: 26, overflow: "hidden" }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={heading}
                initial={{ y: 22, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -22, opacity: 0, filter: "blur(4px)" }}
                transition={{
                  y: { type: "spring", stiffness: 380, damping: 30 },
                  opacity: { duration: 0.2 },
                  filter: { duration: 0.25 },
                }}
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {heading}
              </motion.div>
            </AnimatePresence>
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: err ? "#dc2626" : "#64748b",
              fontVariantNumeric: "tabular-nums",
              marginTop: 2,
              transition: "color 0.2s",
            }}
          >
            {err ?? sub}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {live.length === 0 ? (
              <motion.div
                key="drop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  borderRadius: 16,
                  border: `1.5px dashed ${over ? "#2f8cf0" : "rgba(100,116,139,0.3)"}`,
                  background: over ? "rgba(47,140,240,0.05)" : "#f8fafc",
                  padding: "14px 12px",
                  textAlign: "center",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    height: 46,
                  }}
                >
                  {["a.pdf", "b.png", "c.mp4"].map((n, i) => (
                    <motion.div
                      key={n}
                      animate={over ? { y: -6, rotate: (i - 1) * 14 } : { y: 0, rotate: (i - 1) * 9 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 16,
                      }}
                      style={{ margin: "0 -5px", zIndex: i === 1 ? 2 : 1 }}
                    >
                      <Doc name={n} w={34} />
                    </motion.div>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#64748b",
                    margin: "8px 0 10px",
                  }}
                >
                  PDF, PNG and MP4, up to {Math.round(maxSize / 1e6)} MB each
                </div>
                <motion.button
                  type="button"
                  data-browse
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    touched.current = true;
                    input.current?.click();
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 32,
                    padding: "0 14px",
                    borderRadius: 16,
                    border: 0,
                    background: "#0f172a",
                    color: "#fff",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Ico d={I.upload} size={13} />
                  Browse files
                </motion.button>
                <button
                  type="button"
                  data-sample
                  onClick={() => {
                    touched.current = true;
                    add(demoFiles);
                  }}
                  className="outline-none focus-visible:underline"
                  style={{
                    display: "block",
                    margin: "8px auto 0",
                    border: 0,
                    background: "transparent",
                    color: "#64748b",
                    fontSize: 11.5,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    cursor: "pointer",
                  }}
                >
                  or try three sample files
                </button>
                <input
                  ref={input}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const fs = [...(e.target.files ?? [])];
                    add(fs.length ? fs.map((f) => ({ name: f.name, size: f.size })) : demoFiles);
                    e.target.value = "";
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AnimatePresence initial={false}>
                  {live.map((f) => {
                    const k = KIND(f.name);
                    const done = f.state === "done";
                    const p = f.sent / f.size;
                    return (
                      <motion.div
                        key={f.id}
                        layout={!reduce}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 44 }}
                        exit={{ opacity: 0, height: 0, x: 30 }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 34,
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            width: 26,
                            height: 30,
                            borderRadius: 6,
                            background: k.color,
                            color: "#fff",
                            fontSize: 7.5,
                            fontWeight: 700,
                            display: "grid",
                            placeItems: "end center",
                            paddingBottom: 4,
                            flex: "none",
                          }}
                        >
                          {k.label}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.name}
                          </div>
                          <div
                            style={{
                              height: 3,
                              borderRadius: 2,
                              background: "#e2e8f0",
                              marginTop: 6,
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                width: `${p * 100}%`,
                                backgroundColor: done ? "#34c759" : "#a3e635",
                              }}
                              transition={{ duration: 0.2 }}
                              style={{ height: "100%", borderRadius: 2 }}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                            width: 74,
                            textAlign: "right",
                          }}
                        >
                          {done ? `${mb(f.size)} MB` : `${mb(f.sent)} of ${mb(f.size)} MB`}
                        </span>
                        <AnimatePresence mode="popLayout" initial={false}>
                          {done ? (
                            <motion.span
                              key="d"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 18,
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                background: "#34c759",
                                color: "#fff",
                                display: "grid",
                                placeItems: "center",
                                flex: "none",
                              }}
                            >
                              <Ico d={I.check} size={10} />
                            </motion.span>
                          ) : (
                            <motion.button
                              key="x"
                              type="button"
                              aria-label={`Cancel ${f.name}`}
                              exit={{ scale: 0 }}
                              onClick={() => {
                                touched.current = true;
                                cancel(f.id);
                              }}
                              className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                border: 0,
                                background: "transparent",
                                color: "#94a3b8",
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                                flex: "none",
                              }}
                            >
                              <Ico d={I.x} size={11} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <AnimatePresence>
                  {finished && (
                    <motion.button
                      key="again"
                      type="button"
                      data-again
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        touched.current = true;
                        reset();
                      }}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      style={{
                        marginTop: 10,
                        width: "100%",
                        height: 34,
                        borderRadius: 17,
                        border: 0,
                        background: "#f1f5f9",
                        color: "#0f172a",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Upload more
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              background: "rgba(15,23,42,0.16)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 99,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

--- components/folder-upload/index.ts ---

```ts
export { default as FolderUpload } from "./folder-upload";
export type { FolderUploadProps } from "./folder-upload";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
