"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers, clocks and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { motion, useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SilkColourway = { id: string; name: string; ground: string; mid: string; ink: string; accent: string };

export type SilkPrintProps = {
  name?: string;
  detail?: string;
  price?: string;
  colourways?: SilkColourway[];
  defaultColourway?: string;
  onChange?: (id: string) => void;
  /** Soft synthesised sounds: a rustle when the wind or your hand moves it. They also follow the site-wide sound switch. */
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
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
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

const COLOURWAYS: SilkColourway[] = [
  { id: "indigo", name: "Indigo", ground: "#f3eee3", mid: "#8fa8c8", ink: "#1f3466", accent: "#d9613f" },
  { id: "saffron", name: "Saffron", ground: "#fbf1dc", mid: "#f0b85c", ink: "#7a2e1a", accent: "#2f6f6a" },
  { id: "moss", name: "Moss", ground: "#eef0e4", mid: "#a8b98a", ink: "#2c4231", accent: "#c4884a" },
];

const STAGE = 380; // css px
const CW = 230; // the silk, in its own units (css px when face on)
const CHT = 290;
const GX = 46; // the mesh
const GY = 58;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * A silk scarf hanging from a rod, for a product page.
 *
 * The print hangs in a soft draught: slow waves roll down it from the rod, bigger toward the free hem, and its surface
 * catches the light the way silk does, a bright sheen that runs along the threads and slides across the folds as they
 * move. Move your pointer over it and you're a breath of air: ripples spread out from where you are and the cloth
 * billows back. Drag sideways and it turns on the rod so you can see the back, the print showing through faintly in
 * reverse, and swings back when you let go. Pick a colourway and the print changes. It's a 2,700-point mesh in WebGL,
 * lit per pixel with a sheen along the weave; the print is painted in code. Without WebGL it's a flat picture that
 * sways a little. The arrow keys turn it.
 *   <SilkPrint name="Tidewater scarf" price="$185" onChange={(id) => setColourway(id)} />
 */
export default function SilkPrint({
  name = "Tidewater scarf",
  detail = "Mulberry silk twill, 90 × 90 cm, hand-rolled hem",
  price = "$185",
  colourways = COLOURWAYS,
  defaultColourway = "indigo",
  onChange,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: SilkPrintProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const flatRef = useRef<HTMLCanvasElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(420);
  const [cw, setCw] = useState(colourways.find((c) => c.id === defaultColourway) ?? colourways[0]);
  const [gl, setGl] = useState(true);
  const cb = useRef({ onChange });
  cb.current = { onChange };

  const sim = useRef({
    yaw: 0,
    yawV: 0,
    drag: false,
    lastX: 0,
    gusts: [] as { u: number; v: number; t0: number; s: number }[],
    lastGustAt: 0,
    rustleAt: 0,
    swing: 0, // extra wave amplitude after a gust or a turn
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const print = useMemo(() => (typeof document === "undefined" ? null : paintPrint(512, 640, cw)), [cw]);

  const choose = (c: SilkColourway, user = true) => {
    if (user) touched.current = true;
    if (c.id === cw.id) return;
    setCw(c);
    cb.current.onChange?.(c.id);
    sim.current.swing = Math.min(1, sim.current.swing + 0.6);
    sfx.whoosh(700, 300, { dur: 0.4, gain: 0.025 });
  };
  const onKeyRadio = (e: RKeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + colourways.length) % colourways.length;
    btnRefs.current[n]?.focus();
    choose(colourways[n]);
  };

  // ── the hand: a breath of air where the pointer goes, and a turn when you drag ──
  const toUV = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    const s = fitScale(width);
    return { u: (x - width / 2) / (CW * s) + 0.5, v: (y - (STAGE - CHT * s) / 2 + 6) / (CHT * s) };
  };
  const gust = (u: number, v: number, strength: number) => {
    const s = sim.current;
    s.gusts.push({ u, v, t0: performance.now(), s: strength });
    if (s.gusts.length > 6) s.gusts.shift();
    if (performance.now() > s.rustleAt) {
      s.rustleAt = performance.now() + 220;
      sfx.whoosh(1600, 900, { dur: 0.35, gain: 0.012 + strength * 0.012 });
    }
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = sim.current;
    if (s.drag) {
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.yawV = dx * 0.6;
      s.yaw = clamp(s.yaw + dx * 0.012, -2.6, 2.6);
      return;
    }
    const q = toUV(e);
    if (q.u < -0.1 || q.u > 1.1 || q.v < 0 || q.v > 1.1) return;
    const now = performance.now();
    if (now - s.lastGustAt > 110) {
      s.lastGustAt = now;
      gust(q.u, q.v, 0.6);
    }
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    unlockAudio();
    const s = sim.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.yawV = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onUp = () => {
    sim.current.drag = false;
  };
  const onKey = (e: RKeyboardEvent) => {
    const s = sim.current;
    if (e.key === "ArrowLeft") s.yaw -= 0.5;
    else if (e.key === "ArrowRight") s.yaw += 0.5;
    else return;
    e.preventDefault();
    touched.current = true;
    s.yaw = clamp(s.yaw, -2.6, 2.6);
    s.swing = Math.min(1, s.swing + 0.3);
  };

  // ── the loop ──
  useEffect(() => {
    const cv = glRef.current;
    if (!cv || !inView || !print) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = makeSilk(cv, print);
    if (!r) {
      setGl(false);
      return;
    }
    let raf = 0,
      last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!s.drag) {
        // it swings back to face you, with a little overshoot
        s.yawV += (-s.yaw * 16 - s.yawV * 3.2) * dt;
        s.yaw += s.yawV * dt * (reduce ? 4 : 1);
        if (reduce && Math.abs(s.yaw) < 0.01) s.yaw = 0;
      }
      s.swing = Math.max(0, s.swing - dt * 0.35);
      s.gusts = s.gusts.filter((g) => now - g.t0 < 2600);
      const gu = new Float32Array(24);
      s.gusts.forEach((g, i) => {
        gu[i * 4] = g.u;
        gu[i * 4 + 1] = g.v;
        gu[i * 4 + 2] = (now - g.t0) / 1000;
        gu[i * 4 + 3] = g.s;
      });
      for (let i = s.gusts.length; i < 6; i++) gu[i * 4 + 2] = 99;
      r.render({ W: width, dpr, t: reduce ? 0 : (now - t0) / 1000, yaw: s.yaw, gusts: gu, swing: reduce ? 0 : s.swing + Math.min(0.6, Math.abs(s.yawV) * 0.08), calm: reduce ? 0.15 : 1 });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      r.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, print, reduce]);

  // without WebGL: the print, flat
  useEffect(() => {
    if (gl || !print) return;
    const cv = flatRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = fitScale(width);
    cv.width = Math.round(CW * s * dpr);
    cv.height = Math.round(CHT * s * dpr);
    cv.getContext("2d")!.drawImage(print, 0, 0, cv.width, cv.height);
  }, [gl, print, width]);

  // ── autoplay: now and then a breath of air, and once in a while a turn to show the back ──
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      k++;
      const s = sim.current;
      if (k % 4 === 0) {
        s.yawV = (k % 8 === 0 ? -1 : 1) * 14;
        s.swing = 0.8;
      } else if (k % 5 === 0) {
        const i = (colourways.findIndex((c) => c.id === cw.id) + 1) % colourways.length;
        choose(colourways[i], false);
      } else gust(0.2 + Math.random() * 0.6, 0.3 + Math.random() * 0.5, 0.9);
    }, 1400);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce, cw]);

  const fs = fitScale(width);

  return (
    <div ref={rootRef} className={`w-full max-w-[460px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div
        ref={stageRef}
        role="img"
        tabIndex={0}
        aria-label={`${name} in ${cw.name}. Drag or use the arrow keys to turn it.`}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="relative cursor-grab select-none overflow-hidden rounded-[18px] outline-none focus-visible:shadow-[0_0_0_3px_#0071e3] active:cursor-grabbing"
        style={{ height: STAGE, touchAction: "pan-y", background: "radial-gradient(90% 70% at 50% 35%, #fbfaf7 0%, #ece8e1 70%, #e2ddd4 100%)" }}
      >
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {!gl && (
          <motion.canvas
            ref={flatRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 shadow-[0_18px_30px_-16px_rgba(0,0,0,.4)]"
            style={{ width: CW * fs, height: CHT * fs, top: (STAGE - CHT * fs) / 2, x: "-50%", originY: 0 }}
            animate={reduce ? undefined : { rotate: [-0.8, 0.8, -0.8], skewX: [0.6, -0.6, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[17px] font-semibold tracking-[-0.02em]">{name}</div>
          <div className="mt-0.5 text-[13px] text-[#6e6e73]">{detail}</div>
        </div>
        <div className="shrink-0 text-[17px] font-semibold tabular-nums">{price}</div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Colourway" className="flex gap-2">
          {colourways.map((c, i) => {
            const on = c.id === cw.id;
            return (
              <button
                key={c.id}
                ref={(el) => {
            btnRefs.current[i] = el;
          }}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={c.name}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(c)}
                onKeyDown={(e) => onKeyRadio(e, i)}
                className="relative grid h-8 w-8 place-items-center rounded-full outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
              >
                {on && <motion.span layoutId="silk-cw" className="absolute inset-0 rounded-full shadow-[0_0_0_1.5px_#1d1d1f]" transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
                <span className="h-6 w-6 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)]" style={{ background: `linear-gradient(135deg, ${c.ink} 0 50%, ${c.mid} 50% 75%, ${c.accent} 75%)` }} />
              </button>
            );
          })}
        </div>
        <span className="text-[13px] text-[#6e6e73]">{cw.name}</span>
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">Move over the silk to stir it. Drag to turn it round.</div>
    </div>
  );
}

const fitScale = (w: number) => Math.min(1, (w - 24) / (CW + 60), (STAGE - 50) / CHT);

/** the print: tide lines and a low sun over layered water, a border and a signature, painted in code */
function paintPrint(W: number, H: number, c: SilkColourway) {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = c.ground;
  g.fillRect(0, 0, W, H);
  // the border: a band of ink with a thin inner line
  g.fillStyle = c.ink;
  g.fillRect(0, 0, W, H);
  g.fillStyle = c.ground;
  g.fillRect(22, 22, W - 44, H - 44);
  g.strokeStyle = c.ink;
  g.lineWidth = 2;
  g.strokeRect(32, 32, W - 64, H - 64);
  // a ticked edge on the border, like a hand-rolled print
  g.fillStyle = c.ground;
  for (let x = 30; x < W - 30; x += 14) {
    g.fillRect(x, 9, 6, 4);
    g.fillRect(x, H - 13, 6, 4);
  }
  for (let y = 30; y < H - 30; y += 14) {
    g.fillRect(9, y, 4, 6);
    g.fillRect(W - 13, y, 4, 6);
  }
  g.save();
  g.beginPath();
  g.rect(36, 36, W - 72, H - 72);
  g.clip();
  // the sun, low, in the accent colour, with rings
  const sx = W * 0.64,
    sy = H * 0.36;
  g.fillStyle = c.accent;
  g.beginPath();
  g.arc(sx, sy, 62, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = c.accent;
  g.lineWidth = 2;
  for (let r = 78; r < 150; r += 14) {
    g.globalAlpha = 1 - (r - 78) / 90;
    g.beginPath();
    g.arc(sx, sy, r, Math.PI * 1.05, Math.PI * 1.95);
    g.stroke();
  }
  g.globalAlpha = 1;
  // waves, layer over layer, each a band of curls drawn with an ink line
  for (let k = 0; k < 9; k++) {
    const y0 = H * 0.42 + k * 36;
    const amp = 10 + k * 2.2;
    const ph = k * 1.7;
    g.fillStyle = k % 3 === 0 ? c.mid : k % 3 === 1 ? c.ground : mix(c.mid, c.ground, 0.5);
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) g.lineTo(x, y0 + Math.sin(x / 34 + ph) * amp + Math.sin(x / 13 + ph * 2) * 3);
    g.lineTo(W, H);
    g.closePath();
    g.fill();
    g.strokeStyle = c.ink;
    g.lineWidth = 2.2;
    g.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const y = y0 + Math.sin(x / 34 + ph) * amp + Math.sin(x / 13 + ph * 2) * 3;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    // curls at the crests
    g.lineWidth = 1.6;
    for (let x = (k * 23) % 68; x < W; x += 68) {
      const y = y0 + Math.sin(x / 34 + ph) * amp + Math.sin(x / 13 + ph * 2) * 3;
      g.beginPath();
      g.arc(x, y + 9, 8, Math.PI * 1.1, Math.PI * 2.6);
      g.stroke();
      g.beginPath();
      g.arc(x + 2, y + 10, 4, Math.PI * 1.2, Math.PI * 2.5);
      g.stroke();
    }
  }
  // birds
  g.strokeStyle = c.ink;
  g.lineWidth = 2;
  for (const [bx, by, s] of [
    [140, 150, 12],
    [176, 128, 9],
    [210, 160, 10],
  ]) {
    g.beginPath();
    g.moveTo(bx - s, by);
    g.quadraticCurveTo(bx - s / 2, by - s * 0.6, bx, by);
    g.quadraticCurveTo(bx + s / 2, by - s * 0.6, bx + s, by);
    g.stroke();
  }
  g.restore();
  // the signature seal
  g.fillStyle = c.accent;
  g.fillRect(W - 92, H - 88, 30, 30);
  g.fillStyle = c.ground;
  g.font = "bold 16px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("T", W - 77, H - 72);
  // the weave: very fine cross threads
  for (let y = 0; y < H; y += 2) {
    g.fillStyle = `rgba(255,255,255,${0.025 + (y % 4 ? 0 : 0.02)})`;
    g.fillRect(0, y, W, 1);
  }
  return cv;
}
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a),
    B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

// ───────────── the silk, in WebGL ─────────────
const SILK_VS = `precision highp float;
attribute vec2 aUV;
uniform vec2 uRes; uniform float uScale, uT, uYaw, uSwing, uCalm;
uniform vec4 uG[6];
varying vec2 vUV; varying vec3 vN, vP, vT; varying float vFold;
const vec2 SIZE = vec2(${CW.toFixed(1)}, ${CHT.toFixed(1)});
// how far the cloth stands out of its plane at (u, v): pinned along the rod, freer toward the hem
float disp(vec2 q){
  float free = smoothstep(0.0, 0.35, q.y) * (0.45 + 0.55 * q.y);
  float t = uT;
  float w = sin(q.x * 6.0 - t * 1.1 + q.y * 2.0) * 7.0
          + sin(q.x * 11.0 + t * 1.7 - q.y * 5.0) * 3.0
          + sin(q.y * 9.0 - t * 1.9 + q.x * 3.0) * 4.0;
  // vertical folds, hanging from the rod's weight
  w += sin(q.x * 18.0 + 0.6) * 2.5 * q.y;
  w *= uCalm * (1.0 + uSwing * 1.6);
  // breaths of air: rings that spread out from where they were and fade
  for (int i = 0; i < 6; i++) {
    vec4 g = uG[i];
    if (g.z > 3.0) continue;
    vec2 d = (q - g.xy) * vec2(SIZE.x / SIZE.y, 1.0);
    float r = length(d);
    float ring = sin(r * 22.0 - g.z * 9.0) * exp(-g.z * 1.6) * exp(-r * 3.0);
    w += ring * 16.0 * g.w + exp(-r * r * 30.0) * exp(-g.z * 2.5) * 18.0 * g.w;
  }
  return w * free;
}
vec3 place(vec2 q){
  // the hem sways sideways and swings in a little as the cloth moves
  float sway = sin(uT * 0.7 + q.y * 1.5) * 5.0 * q.y * q.y * uCalm;
  return vec3((q.x - 0.5) * SIZE.x + sway, -q.y * SIZE.y, disp(q));
}
void main(){
  vec2 q = aUV;
  vec3 p = place(q);
  float e = 0.01;
  vec3 du = place(q + vec2(e, 0.0)) - place(q - vec2(e, 0.0));
  vec3 dv = place(q + vec2(0.0, e)) - place(q - vec2(0.0, e));
  vec3 n = normalize(cross(dv, du));
  // turn on the rod
  float c = cos(uYaw), s = sin(uYaw);
  mat3 R = mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
  p = R * p;
  n = R * n;
  vT = normalize(R * dv);
  vP = p;
  vN = n;
  vUV = q;
  vFold = disp(q);
  // a gentle perspective, looking at the middle of the cloth
  float f = 900.0;
  vec3 cam = vec3(0.0, -SIZE.y * 0.5, f);
  vec3 v = p - cam;
  vec2 sp = v.xy * (f / -v.z) * uScale;
  vec2 ndc = vec2(sp.x / (uRes.x * 0.5), sp.y / (uRes.y * 0.5) - 0.02);
  gl_Position = vec4(ndc, (-v.z - f * 0.5) / (f * 2.0), 1.0);
}`;
const SILK_FS = `precision highp float;
uniform sampler2D uTex;
varying vec2 vUV; varying vec3 vN, vP, vT; varying float vFold;
void main(){
  vec3 n = normalize(vN);
  // which side faces the camera (worked out from the normal, so it doesn't depend on the winding)
  bool front = dot(n, vec3(0.0, -${(CHT/2).toFixed(1)}, 900.0) - vP) > 0.0;
  if (!front) n = -n;
  // the print: on the back it shows through faintly, mirrored and paler
  vec3 tex = texture2D(uTex, vUV).rgb;
  vec3 base = front ? tex : mix(tex, vec3(0.95, 0.93, 0.9), 0.55);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
  vec3 V = vec3(0.0, 0.0, 1.0);
  float ndl = dot(n, L);
  float diff = 0.55 + 0.45 * clamp(ndl, -0.3, 1.0);
  // silk: light runs along the threads (Kajiya-Kay on the warp, which hangs down the cloth), so the highlight is a
  // soft band that slides across the folds as they move, rather than a spot
  vec3 T = normalize(vT - n * dot(vT, n));
  vec3 H = normalize(L + V);
  float th = dot(T, H);
  float aniso = pow(sqrt(max(0.0, 1.0 - th * th)), 90.0) * smoothstep(-0.2, 0.4, ndl);
  vec3 sheen = mix(vec3(1.0, 0.98, 0.95), base, 0.35) * aniso * 0.3;
  // a soft lift at grazing angles, and darker in the troughs of the folds
  float rim = pow(1.0 - abs(dot(n, V)), 3.0) * 0.1;
  float trough = clamp(-vFold / 30.0, 0.0, 1.0) * 0.12;
  vec3 col = base * diff * (1.0 - trough) + sheen + rim * base;
  // a hint of the twill
  col *= 0.985 + 0.015 * sin((vUV.x + vUV.y) * 900.0);
  gl_FragColor = vec4(col, 1.0);
}`;
const ROD_VS = `precision highp float;
attribute vec3 aP;
uniform vec2 uRes; uniform float uScale, uYaw;
varying vec3 vN;
const vec2 SIZE = vec2(${CW.toFixed(1)}, ${CHT.toFixed(1)});
void main(){
  float c = cos(uYaw * 0.15), s = sin(uYaw * 0.15);
  // the rod: a cylinder along x just above the cloth; aP.x is its length, aP.y the angle round it
  float r = 4.5;
  vec3 p = vec3(aP.x * (SIZE.x * 0.5 + 18.0), 4.0 + cos(aP.y) * r, sin(aP.y) * r);
  vec3 n = vec3(0.0, cos(aP.y), sin(aP.y));
  // its rounded end caps
  if (abs(aP.x) > 1.0) { p.x = sign(aP.x) * (SIZE.x * 0.5 + 18.0 + 5.0 * (abs(aP.x) - 1.0) / 0.2); p.yz = vec2(4.0 + cos(aP.y) * 6.5, sin(aP.y) * 6.5); }
  mat3 R = mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
  p = R * p;
  vN = R * n;
  float f = 900.0;
  vec3 v = p - vec3(0.0, -SIZE.y * 0.5, f);
  vec2 sp = v.xy * (f / -v.z) * uScale;
  gl_Position = vec4(sp.x / (uRes.x * 0.5), sp.y / (uRes.y * 0.5) - 0.02, (-v.z - f * 0.5) / (f * 2.0) - 0.001, 1.0);
}`;
const ROD_FS = `precision highp float;
varying vec3 vN;
void main(){
  vec3 n = normalize(vN);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
  float d = 0.45 + 0.55 * max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);
  vec3 wood = vec3(0.36, 0.24, 0.15);
  gl_FragColor = vec4(wood * d + spec * 0.35, 1.0);
}`;
function makeSilk(canvas: HTMLCanvasElement, print: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const link = (v: string, f: string, attr: string) => {
    const vs = sh(gl.VERTEX_SHADER, v),
      fs = sh(gl.FRAGMENT_SHADER, f);
    if (!vs || !fs) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, attr);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const cloth = link(SILK_VS, SILK_FS, "aUV"),
    rod = link(ROD_VS, ROD_FS, "aP");
  if (!cloth || !rod) return null;
  // the cloth's mesh
  const uv = new Float32Array((GX + 1) * (GY + 1) * 2);
  for (let j = 0; j <= GY; j++)
    for (let i = 0; i <= GX; i++) {
      uv[(j * (GX + 1) + i) * 2] = i / GX;
      uv[(j * (GX + 1) + i) * 2 + 1] = j / GY;
    }
  const idx = new Uint16Array(GX * GY * 6);
  let k = 0;
  for (let j = 0; j < GY; j++)
    for (let i = 0; i < GX; i++) {
      const a = j * (GX + 1) + i;
      idx.set([a, a + 1, a + GX + 1, a + 1, a + GX + 2, a + GX + 1], k);
      k += 6;
    }
  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  // the rod's mesh: rings along its length, with end caps
  const RS = 24,
    RL = 14;
  const rp: number[] = [];
  for (let j = 0; j <= RL; j++) {
    const x = -1.2 + (2.4 * j) / RL;
    for (let i = 0; i <= RS; i++) rp.push(x, (i / RS) * Math.PI * 2, 0);
  }
  const ri: number[] = [];
  for (let j = 0; j < RL; j++)
    for (let i = 0; i < RS; i++) {
      const a = j * (RS + 1) + i;
      ri.push(a, a + 1, a + RS + 1, a + 1, a + RS + 2, a + RS + 1);
    }
  const rodBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rodBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rp), gl.STATIC_DRAW);
  const rodIdx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rodIdx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ri), gl.STATIC_DRAW);
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, print);
  const C = (n: string) => gl.getUniformLocation(cloth, n),
    Rr = (n: string) => gl.getUniformLocation(rod, n);
  gl.enable(gl.DEPTH_TEST);
  return {
    render(o: { W: number; dpr: number; t: number; yaw: number; gusts: Float32Array; swing: number; calm: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(STAGE * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const scale = fitScale(o.W);
      gl.useProgram(cloth);
      gl.uniform2f(C("uRes"), o.W, STAGE);
      gl.uniform1f(C("uScale"), scale);
      gl.uniform1f(C("uT"), o.t);
      gl.uniform1f(C("uYaw"), o.yaw);
      gl.uniform1f(C("uSwing"), o.swing);
      gl.uniform1f(C("uCalm"), o.calm);
      gl.uniform4fv(C("uG"), o.gusts);
      gl.uniform1i(C("uTex"), 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      gl.useProgram(rod);
      gl.uniform2f(Rr("uRes"), o.W, STAGE);
      gl.uniform1f(Rr("uScale"), scale);
      gl.uniform1f(Rr("uYaw"), o.yaw);
      gl.bindBuffer(gl.ARRAY_BUFFER, rodBuf);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rodIdx);
      gl.drawElements(gl.TRIANGLES, ri.length, gl.UNSIGNED_SHORT, 0);
    },
    dispose() {
      gl.deleteTexture(tex);
      [uvBuf, idxBuf, rodBuf, rodIdx].forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(cloth);
      gl.deleteProgram(rod);
    },
  };
}
