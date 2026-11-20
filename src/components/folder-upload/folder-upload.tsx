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
