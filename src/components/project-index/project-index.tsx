"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type IndexProject = {
  name: string;
  kind: string;
  year: string;
  image?: string;
  href?: string;
};
export type ProjectIndexProps = {
  projects?: IndexProject[];
  /** pictures to use when a project has none, in order */
  photos?: { src: string; title: string }[];
  title?: string;
  onOpen?: (p: IndexProject) => void;
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

const DEFAULT: IndexProject[] = [
  { name: "Tidewater", kind: "Identity", year: "2026" },
  { name: "Still Water", kind: "Editorial", year: "2026" },
  { name: "Cold Front", kind: "Campaign", year: "2025" },
  { name: "Long Road Home", kind: "Film", year: "2025" },
  { name: "Above", kind: "Exhibition", year: "2024" },
  { name: "First Ascent", kind: "Book", year: "2024" },
  { name: "Moss and River", kind: "Packaging", year: "2023" },
];
const HUES = [200, 160, 210, 30, 20, 190, 120];

const IW = 220;
const IH = 290;
const BLOCK = 11; // the size of the squares the picture changes in

function painted(i: number) {
  const c = document.createElement("canvas");
  c.width = IW;
  c.height = IH;
  const g = c.getContext("2d")!;
  const h = HUES[i % HUES.length];
  const gr = g.createLinearGradient(0, 0, IW, IH);
  gr.addColorStop(0, `hsl(${h} 45% 70%)`);
  gr.addColorStop(1, `hsl(${h + 30} 50% 30%)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, IW, IH);
  g.fillStyle = `hsla(${h} 40% 92% / 0.7)`;
  g.beginPath();
  g.arc(IW * 0.65, IH * 0.35, 34, 0, Math.PI * 2);
  g.fill();
  return c;
}

/**
 * An editorial index of projects in big type. Point at a project and its picture arrives beside your pointer and
 * follows it, leaning with your movement; move to another and the picture changes square by square in a sweeping,
 * slightly scattered order, like a screen redrawing, with grain over it. The other names fade back so the one you
 * are on stands out. Works by keyboard too: focus a row and its picture appears beside it.
 */
export default function ProjectIndex({
  projects = DEFAULT,
  photos,
  title = "Selected work",
  onOpen,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ProjectIndexProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [cur, setCur] = useState<number | null>(null);
  const curRef = useRef<number | null>(null);
  const touched = useRef(false);
  const imgs = useRef<(HTMLCanvasElement | HTMLImageElement)[]>([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.7 });
  const vx = useVelocity(sx);
  const rot = useSpring(
    useTransform(vx, (v) => Math.max(-9, Math.min(9, v / 120))),
    { stiffness: 200, damping: 20 },
  );
  const shown = useMotionValue(0);
  const scale = useSpring(
    useTransform(shown, (v) => 0.86 + v * 0.14),
    { stiffness: 300, damping: 24 },
  );
  const opacity = useSpring(shown, { stiffness: 300, damping: 30 });

  // load the pictures
  const srcs = useMemo(
    () => projects.map((p, i) => p.image ?? photos?.[i % (photos?.length || 1)]?.src ?? null),
    [projects, photos],
  );
  useEffect(() => {
    imgs.current = projects.map((_, i) => painted(i));
    srcs.forEach((s, i) => {
      if (!s) return;
      const im = new Image();
      im.decoding = "async";
      // drawn once at twice the frame's size (cropped to fill it), so a 4K photo stays sharp and each frame's
      // squares are cut from a small picture rather than the full-size one
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = IW * 2;
        c.height = IH * 2;
        const g = c.getContext("2d");
        if (!g) return void (imgs.current[i] = im);
        const k = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);
        g.imageSmoothingQuality = "high";
        g.drawImage(
          im,
          (c.width - im.naturalWidth * k) / 2,
          (c.height - im.naturalHeight * k) / 2,
          im.naturalWidth * k,
          im.naturalHeight * k,
        );
        imgs.current[i] = c;
      };
      im.src = s;
    });
  }, [srcs, projects]);

  // the change: each square switches from the old picture to the new one at its own moment
  const anim = useRef({ from: -1, to: -1, t: 1 });
  const order = useMemo(() => {
    const cols = Math.ceil(IW / BLOCK);
    const rows = Math.ceil(IH / BLOCK);
    const o: number[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        // a diagonal sweep, scattered
        const s = (c / cols) * 0.45 + (r / rows) * 0.35;
        const n = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
        o.push(Math.min(0.98, s + (n - Math.floor(n)) * 0.3));
      }
    return o;
  }, []);
  useEffect(() => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    c.width = IW * 2;
    c.height = IH * 2;
    ctx.scale(2, 2);
    ctx.imageSmoothingQuality = "high";
    let raf = 0;
    let last = performance.now();
    const cols = Math.ceil(IW / BLOCK);
    const draw = (i: number, bx: number, by: number) => {
      const im = imgs.current[i];
      if (!im) return;
      const iw = (im as HTMLImageElement).naturalWidth || im.width;
      const ih = (im as HTMLImageElement).naturalHeight || im.height;
      const k = Math.max(IW / iw, IH / ih);
      const ox = (IW - iw * k) / 2;
      const oy = (IH - ih * k) / 2;
      ctx.drawImage(im, (bx - ox) / k, (by - oy) / k, BLOCK / k, BLOCK / k, bx, by, BLOCK, BLOCK);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const a = anim.current;
      if (a.t < 1) {
        a.t = Math.min(1, a.t + dt / (reduce ? 0.001 : 0.5));
        ctx.clearRect(0, 0, IW, IH);
        for (let b = 0; b < order.length; b++) {
          const bx = (b % cols) * BLOCK;
          const by = Math.floor(b / cols) * BLOCK;
          const which = a.t > order[b] ? a.to : a.from;
          if (which >= 0) draw(which, bx, by);
          // a square that has just switched flashes light for a moment
          const since = a.t - order[b];
          if (since > 0 && since < 0.08 && a.to >= 0 && a.t < 1) {
            ctx.fillStyle = `rgba(255,255,255,${(0.35 * (1 - since / 0.08)).toFixed(3)})`;
            ctx.fillRect(bx, by, BLOCK, BLOCK);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [order, reduce]);

  const show = (i: number | null) => {
    if (i === curRef.current) return;
    const prev = curRef.current;
    curRef.current = i;
    setCur(i);
    const a = anim.current;
    a.from = prev ?? -1;
    a.to = i ?? -1;
    a.t = 0;
    shown.set(i === null ? 0 : 1);
    if (i !== null) sfx.tick({ freq: 2200 + i * 120, gain: 0.03 });
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    if (e.pointerType === "mouse") touched.current = true;
    // the picture sits to the right of the pointer, and keeps inside the frame
    const px = e.clientX - r.left + 28;
    x.set(Math.min(r.width - IW - 8, Math.max(8, px)));
    y.set(Math.min(r.height - IH - 8, Math.max(8, e.clientY - r.top - IH / 2)));
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      const r = wrap.current?.getBoundingClientRect();
      const i = k % (projects.length + 1);
      k++;
      if (i === projects.length || !r) return show(null);
      const row = wrap.current?.querySelectorAll("[data-row]")[i] as HTMLElement | undefined;
      if (row) {
        const rr = row.getBoundingClientRect();
        x.set(Math.min(r.width - IW - 8, r.width * 0.42 + i * 22));
        y.set(Math.min(r.height - IH - 8, Math.max(8, rr.top - r.top + rr.height / 2 - IH / 2)));
      }
      show(i);
    }, 1300);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, projects.length]);

  const GRAIN =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

  return (
    <div
      ref={wrap}
      onPointerMove={onMove}
      onPointerLeave={() => show(null)}
      className={`relative w-full overflow-hidden rounded-[24px] ${className}`}
      style={{
        background: "#f4f2ee",
        padding: "28px clamp(18px, 4vw, 40px) 30px",
        color: "#1b1a18",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 13,
          color: "#76726b",
          paddingBottom: 14,
          borderBottom: "1px solid rgba(27,26,24,0.14)",
        }}
      >
        <span>{title}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{projects.length} projects</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {projects.map((p, i) => {
          const on = cur === i;
          const dim = cur !== null && !on;
          return (
            <li key={p.name} data-row style={{ borderBottom: "1px solid rgba(27,26,24,0.14)" }}>
              <a
                href={p.href ?? "#"}
                onClick={(e) => {
                  if (!p.href) e.preventDefault();
                  onOpen?.(p);
                }}
                onPointerEnter={() => {
                  touched.current = true;
                  show(i);
                }}
                onFocus={(e) => {
                  const r = wrap.current?.getBoundingClientRect();
                  const rr = e.currentTarget.getBoundingClientRect();
                  if (r) {
                    x.set(r.width - IW - 24);
                    y.set(Math.min(r.height - IH - 8, Math.max(8, rr.top - r.top + rr.height / 2 - IH / 2)));
                  }
                  show(i);
                }}
                onBlur={() => show(null)}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#1b1a18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f2ee] rounded-md"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "baseline",
                  gap: "clamp(10px, 3vw, 28px)",
                  padding: "12px 0",
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <motion.span
                  animate={{ x: on ? 14 : 0, opacity: dim ? 0.28 : 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{
                    fontSize: "clamp(24px, 4.6vw, 44px)",
                    fontWeight: 500,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                  }}
                >
                  {p.name}
                </motion.span>
                <motion.span animate={{ opacity: dim ? 0.28 : 1 }} style={{ fontSize: 13, color: "#76726b" }}>
                  {p.kind}
                </motion.span>
                <motion.span
                  animate={{ opacity: dim ? 0.28 : 1 }}
                  style={{
                    fontSize: 13,
                    color: "#76726b",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {p.year}
                </motion.span>
              </a>
            </li>
          );
        })}
      </ul>
      {/* the picture that follows the pointer */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          x: sx,
          y: sy,
          rotate: rot,
          scale,
          opacity,
          width: IW,
          height: IH,
          borderRadius: 6,
          overflow: "hidden",
          pointerEvents: "none",
          boxShadow: "0 30px 60px -28px rgba(30,20,10,0.55)",
          zIndex: 3,
        }}
      >
        <canvas ref={cv} style={{ width: IW, height: IH, display: "block" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRAIN,
            opacity: 0.14,
            mixBlendMode: "overlay",
          }}
        />
      </motion.div>
    </div>
  );
}
