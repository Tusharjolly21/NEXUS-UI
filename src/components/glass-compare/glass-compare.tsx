"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type GlassCompareProps = {
  /** two images to compare (they must allow cross-origin use); without them it paints a city by day and by night */
  before?: string;
  after?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  /** where the divider starts, 0 to 1 */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Soft synthesised sounds: the glass sliding, droplets. They also follow the site-wide sound switch. */
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

const ICON_ARROWS = "m213.66 181.66l-32 32a8 8 0 0 1-11.32-11.32L188.69 184H48a8 8 0 0 1 0-16h140.69l-18.35-18.34a8 8 0 0 1 11.32-11.32l32 32a8 8 0 0 1 0 11.32m-139.32-64a8 8 0 0 0 11.32-11.32L67.31 88H208a8 8 0 0 0 0-16H67.31l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32Z";
const ICON_SUN = "M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m8 24a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64m-69.66 5.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16";
const ICON_MOON = "M235.54 150.21a104.84 104.84 0 0 1-37 52.91A104 104 0 0 1 32 120a103.1 103.1 0 0 1 20.88-62.52a104.84 104.84 0 0 1 52.91-37a8 8 0 0 1 10 10a88.08 88.08 0 0 0 109.8 109.8a8 8 0 0 1 10 10Z";
const BAR = 11; // half the glass bar's width, css px
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type Drop = { x: number; y: number; vx: number; vy: number; r: number; age: number; life: number };

/**
 * A before-and-after slider whose divider is a bar of glass.
 *
 * Drag the bar, or anywhere on the picture, and the view behind the glass is bent through it like a lens: thick in the
 * middle, with a bright edge, a streak of reflected light and a faint rainbow fringe where the colours split. Move it
 * quickly and the bar bends like a ribbon, its ends trailing your hand, then springs straight with a wobble; the side
 * it's sweeping toward smears with motion blur and a colour split, and droplets of glass spray off the bar and fall.
 * By default it compares one harbour street at two in the afternoon and ten at night, both painted in code; pass two
 * images to compare your own. It's drawn in a WebGL shader; without WebGL the bar is a plain line. It's a slider, so
 * the arrow keys move it.
 *   <GlassCompare before="/light.png" after="/dark.png" beforeLabel="Light" afterLabel="Dark" />
 */
export default function GlassCompare({
  before,
  after,
  beforeLabel = "2 PM",
  afterLabel = "10 PM",
  title = "Harbour Street, day and night",
  defaultValue = 0.5,
  onChange,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: GlassCompareProps) {
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
  const boxRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const labRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(420);
  const H = Math.round(width * 0.62);
  const [value, setValue] = useState(defaultValue);
  const cb = useRef({ onChange });
  cb.current = { onChange };

  const sim = useRef({
    x: defaultValue, // where the bar is, 0..1 (eased toward the target)
    target: defaultValue,
    hy: 0.5, // where along the bar it's held, 0..1
    vel: 0, // px per second
    bend: 0,
    bendV: 0,
    drag: false,
    drops: [] as Drop[],
    hissAt: 0,
    lastX: 0,
  });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the two pictures
  const [pics, setPics] = useState<[HTMLCanvasElement | HTMLImageElement, HTMLCanvasElement | HTMLImageElement] | null>(null);
  useEffect(() => {
    if (!before || !after) {
      setPics([paintHarbour(1200, 744, false), paintHarbour(1200, 744, true)]);
      return;
    }
    let ok = 0;
    const load = (src: string) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        ok++;
        if (ok === 2) setPics([a, b]);
      };
      im.onerror = () => setPics([paintHarbour(1200, 744, false), paintHarbour(1200, 744, true)]);
      im.src = src;
      return im;
    };
    const a = load(before),
      b = load(after);
  }, [before, after]);

  const report = (v: number) => {
    setValue(v);
    cb.current.onChange?.(v);
  };

  // ── the hand ──
  const at = (e: { clientX: number; clientY: number }) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height, 0.08, 0.92) };
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    unlockAudio();
    const s = sim.current;
    const q = at(e);
    s.drag = true;
    s.target = q.x;
    s.hy = q.y;
    e.currentTarget.setPointerCapture(e.pointerId);
    sfx.tick({ freq: 2200, gain: 0.03 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (!s.drag) return;
    const q = at(e);
    s.target = q.x;
    s.hy += (q.y - s.hy) * 0.3;
  };
  const onUp = () => {
    const s = sim.current;
    if (!s.drag) return;
    s.drag = false;
    report(Math.round(s.target * 100) / 100);
  };
  const onKey = (e: RKeyboardEvent) => {
    const s = sim.current;
    const step = e.shiftKey ? 0.1 : 0.04;
    let t = s.target;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") t -= step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") t += step;
    else if (e.key === "Home") t = 0;
    else if (e.key === "End") t = 1;
    else return;
    e.preventDefault();
    touched.current = true;
    s.target = clamp(t);
    report(Math.round(s.target * 100) / 100);
  };

  // ── the loop ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current,
      fx = fxRef.current;
    if (!gl0 || !cv || !fx || !inView || !pics) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const r = makeGlass(gl0, pics[0], pics[1]);
    const flat = r ? null : cv.getContext("2d");
    const fctx = fx.getContext("2d")!;
    fx.width = Math.round(W * dpr);
    fx.height = Math.round(H * dpr);
    let raf = 0,
      last = performance.now();
    const t0 = last;
    s.lastX = s.x * W;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // the bar follows the hand closely, the keys and autoplay with a glide
      const k = s.drag ? 22 : 9;
      s.x += (s.target - s.x) * (1 - Math.exp(-dt * (reduce ? 60 : k)));
      const px = s.x * W;
      const v = (px - s.lastX) / Math.max(dt, 1e-3);
      s.lastX = px;
      s.vel += (v - s.vel) * (1 - Math.exp(-dt * 14));
      // the bar bends: its ends trail behind the hand, then it springs straight
      if (!reduce) {
        const want = clamp(-s.vel * 0.07, -56, 56);
        s.bendV += (180 * (want - s.bend) - 9 * s.bendV) * dt;
        s.bend += s.bendV * dt;
      } else s.bend = 0;
      // droplets of glass flung off a fast bar
      const speed = Math.abs(s.vel);
      if (!reduce && speed > 500) {
        const n = Math.min(4, Math.floor(speed / 600));
        for (let i = 0; i < n; i++) {
          const y = Math.random() * H;
          const sy = (y / H - s.hy) / Math.max(s.hy, 1 - s.hy);
          s.drops.push({ x: px - s.bend * sy * sy, y, vx: s.vel * (0.25 + Math.random() * 0.35), vy: -60 - Math.random() * 120, r: 1 + Math.random() * 2.4, age: 0, life: 0.7 + Math.random() * 0.5 });
        }
        if (now > s.hissAt) {
          s.hissAt = now + 90;
          sfx.whoosh(2600, 4400, { dur: 0.12, gain: Math.min(0.03, speed / 80000) });
        }
      }
      // the knob and the labels
      const kn = knobRef.current;
      if (kn) kn.style.transform = `translate(${px - 22}px, ${s.hy * H - 22}px)`;
      labRefs.current.forEach((el, i) => {
        if (!el) return;
        const near = i === 0 ? px < 90 : px > W - 90;
        el.style.opacity = near ? "0" : "1";
      });
      if (r) r.render({ W, H, dpr, x: px, hy: s.hy * H, bend: s.bend, vel: reduce ? 0 : s.vel, t: (now - t0) / 1000 });
      else if (flat) drawFlat(flat, cv, W, H, dpr, pics, px);
      // droplets
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, H);
      s.drops = s.drops.filter((d) => (d.age += dt) < d.life && d.y < H + 10);
      for (const d of s.drops) {
        d.vy += 700 * dt;
        d.vx *= Math.exp(-dt * 2.5);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const a = 1 - d.age / d.life;
        fctx.fillStyle = `rgba(255,255,255,${0.18 * a})`;
        fctx.beginPath();
        fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        fctx.fill();
        fctx.strokeStyle = `rgba(20,30,50,${0.35 * a})`;
        fctx.lineWidth = 0.6;
        fctx.stroke();
        fctx.fillStyle = `rgba(255,255,255,${0.9 * a})`;
        fctx.beginPath();
        fctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.35, d.r * 0.35, 0, Math.PI * 2);
        fctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      r?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, pics, reduce]);

  // ── autoplay: sweep slowly, then a quick flick so the glass bends and sprays ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const seq = [0.3, 0.7, 0.15, 0.85, 0.5];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      const s = sim.current;
      s.target = seq[k++ % seq.length];
      s.hy = 0.35 + Math.random() * 0.3;
    }, 1700);
    return () => window.clearInterval(id);
  }, [autoplay, inView, reduce]);

  const pct = Math.round(value * 100);

  return (
    <div ref={rootRef} className={`w-full max-w-[520px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
        <div className="shrink-0 text-[12px] tabular-nums text-[#86868b]">{pct}%</div>
      </div>
      <div
        ref={boxRef}
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% ${beforeLabel}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="relative mt-3 cursor-ew-resize select-none overflow-hidden rounded-[16px] bg-[#e8e8ed] outline-none focus-visible:shadow-[0_0_0_3px_#0071e3]"
        style={{ height: H, touchAction: "pan-y" }}
      >
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={fxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {[beforeLabel, afterLabel].map((l, i) => (
          <div key={l} ref={(el) => {
            labRefs.current[i] = el;
          }} aria-hidden="true" className={`pointer-events-none absolute top-3 flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur-md transition-opacity duration-200 ${i ? "right-3" : "left-3"}`}>
            <svg viewBox="0 0 256 256" className="h-3 w-3" aria-hidden="true">
              <path fill="currentColor" d={i ? ICON_MOON : ICON_SUN} />
            </svg>
            {l}
          </div>
        ))}
        {/* the knob: a bead of the same glass */}
        <div ref={knobRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.7),inset_0_-2px_4px_rgba(0,0,0,.2),0_6px_14px_-4px_rgba(0,0,0,.45)] backdrop-blur-[3px]" style={{ willChange: "transform" }}>
          <svg viewBox="0 0 256 256" className="h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,.4)]">
            <path fill="currentColor" d={ICON_ARROWS} />
          </svg>
        </div>
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">Drag the glass, or anywhere on the picture. Flick it to see it bend.</div>
    </div>
  );
}

/** without WebGL: the two pictures split by a line */
function drawFlat(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, H: number, dpr: number, pics: [CanvasImageSource, CanvasImageSource], x: number) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(pics[1], 0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, x, H);
  ctx.clip();
  ctx.drawImage(pics[0], 0, 0, W, H);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(x - 1, 0, 2, H);
}

/** a harbour street painted in code, by day or by night; the buildings are the same in both */
function paintHarbour(W: number, H: number, night: boolean) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const wl = H * 0.7; // the waterline
  // sky
  const sky = g.createLinearGradient(0, 0, 0, wl);
  if (night) {
    sky.addColorStop(0, "#070b1e");
    sky.addColorStop(0.6, "#1b1f48");
    sky.addColorStop(1, "#3b2a55");
  } else {
    sky.addColorStop(0, "#4f8fe0");
    sky.addColorStop(0.7, "#a9cdf2");
    sky.addColorStop(1, "#e3eef8");
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, W, wl);
  const sr = mulberry(9);
  if (night) {
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(255,255,240,${0.3 + sr() * 0.6})`;
      g.fillRect(sr() * W, sr() * wl * 0.6, 1.6, 1.6);
    }
    const m = g.createRadialGradient(W * 0.8, H * 0.14, 10, W * 0.8, H * 0.14, 120);
    m.addColorStop(0, "rgba(240,240,255,.5)");
    m.addColorStop(1, "rgba(240,240,255,0)");
    g.fillStyle = m;
    g.fillRect(W * 0.8 - 120, H * 0.14 - 120, 240, 240);
    g.fillStyle = "#f2f0e6";
    g.beginPath();
    g.arc(W * 0.8, H * 0.14, 26, 0, Math.PI * 2);
    g.fill();
  } else {
    const s = g.createRadialGradient(W * 0.2, H * 0.12, 10, W * 0.2, H * 0.12, 220);
    s.addColorStop(0, "rgba(255,250,225,.95)");
    s.addColorStop(1, "rgba(255,250,225,0)");
    g.fillStyle = s;
    g.fillRect(0, 0, W * 0.6, H * 0.5);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "rgba(255,255,255,.85)";
      const cx = sr() * W,
        cy = H * (0.08 + sr() * 0.22);
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.arc(cx + k * 22 - 55, cy + Math.sin(k * 1.7) * 7, 20 + sr() * 14, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  // the buildings along the quay
  let x = -10;
  const blds: { x: number; w: number; h: number; hue: number; roof: number }[] = [];
  while (x < W) {
    const w = 70 + rnd() * 90,
      h = H * (0.18 + rnd() * 0.36);
    blds.push({ x, w, h, hue: rnd(), roof: rnd() });
    x += w + 2;
  }
  const facadesDay = ["#e8d7c3", "#d9a98f", "#c9d3d8", "#efe4d0", "#b9c7b0", "#e2c49a"];
  for (const b of blds) {
    const top = wl - b.h;
    const col = facadesDay[Math.floor(b.hue * facadesDay.length)];
    if (night) {
      g.fillStyle = `hsl(${235 + b.hue * 30},22%,${10 + b.hue * 8}%)`;
    } else g.fillStyle = col;
    g.fillRect(b.x, top, b.w, b.h);
    // shaded side
    g.fillStyle = night ? "rgba(0,0,0,.25)" : "rgba(60,50,40,.12)";
    g.fillRect(b.x + b.w * 0.82, top, b.w * 0.18, b.h);
    // roof
    g.fillStyle = night ? "#0c0f22" : b.roof > 0.5 ? "#8c4b3d" : "#56606b";
    g.beginPath();
    if (b.roof > 0.5) {
      g.moveTo(b.x - 3, top);
      g.lineTo(b.x + b.w / 2, top - 26);
      g.lineTo(b.x + b.w + 3, top);
    } else g.rect(b.x - 2, top - 8, b.w + 4, 8);
    g.fill();
    // windows: sky-coloured glass by day, some lit by night
    const wr = mulberry(Math.floor(b.x * 13 + 7));
    for (let wy = top + 14; wy < wl - 24; wy += 26)
      for (let wx = b.x + 10; wx < b.x + b.w - 16; wx += 20) {
        const lit = wr() < 0.45;
        if (night) g.fillStyle = lit ? (wr() < 0.8 ? "#ffcf7a" : "#a9dcff") : "#141833";
        else g.fillStyle = "#6f95b8";
        g.fillRect(wx, wy, 10, 14);
        if (night && lit) {
          g.fillStyle = "rgba(255,200,110,.18)";
          g.fillRect(wx - 4, wy - 4, 18, 22);
        } else if (!night) {
          g.fillStyle = "rgba(255,255,255,.35)";
          g.fillRect(wx, wy, 4, 14);
        }
      }
  }
  // the quay and its lamps
  g.fillStyle = night ? "#15182c" : "#8d8a83";
  g.fillRect(0, wl - 10, W, 12);
  for (let lx = 60; lx < W; lx += 180) {
    g.fillStyle = night ? "#2a2d44" : "#3a3a3c";
    g.fillRect(lx, wl - 62, 3, 52);
    if (night) {
      const gl = g.createRadialGradient(lx + 1, wl - 64, 2, lx + 1, wl - 64, 46);
      gl.addColorStop(0, "rgba(255,214,140,.9)");
      gl.addColorStop(1, "rgba(255,214,140,0)");
      g.fillStyle = gl;
      g.fillRect(lx - 45, wl - 110, 92, 92);
    }
    g.fillStyle = night ? "#ffe2a6" : "#d0d0d0";
    g.beginPath();
    g.arc(lx + 1.5, wl - 64, 4, 0, Math.PI * 2);
    g.fill();
  }
  // the water: the street mirrored, darker, broken into ripples
  g.save();
  g.translate(0, wl * 2);
  g.scale(1, -1);
  g.globalAlpha = night ? 0.7 : 0.55;
  g.drawImage(c, 0, 0, W, wl, 0, 0, W, wl);
  g.restore();
  g.fillStyle = night ? "rgba(5,8,25,.45)" : "rgba(40,90,130,.35)";
  g.fillRect(0, wl, W, H - wl);
  const rr = mulberry(77);
  for (let i = 0; i < 420; i++) {
    const y = wl + Math.pow(rr(), 1.3) * (H - wl);
    g.fillStyle = night ? `rgba(255,${190 + rr() * 50},${110 + rr() * 60},${0.08 + rr() * 0.22})` : `rgba(255,255,255,${0.06 + rr() * 0.14})`;
    g.fillRect(rr() * W, y, 10 + rr() * 40, 1.5);
  }
  // a boat moored at the quay
  g.fillStyle = night ? "#20243e" : "#c43b32";
  g.beginPath();
  g.moveTo(W * 0.58, wl + 8);
  g.lineTo(W * 0.78, wl + 8);
  g.lineTo(W * 0.75, wl + 30);
  g.lineTo(W * 0.61, wl + 30);
  g.fill();
  g.fillStyle = night ? "#ffcf7a" : "#f3efe6";
  g.fillRect(W * 0.64, wl - 10, W * 0.08, 18);
  return c;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────── the glass, in WebGL ─────────────
const GC_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const GC_FS = `precision highp float;
uniform sampler2D uA, uB;
uniform vec2 uRes, uSizeA, uSizeB; uniform float uDpr, uX, uHy, uBend, uVel, uT;
const float BAR = ${BAR.toFixed(1)};
vec2 fit(vec2 p, vec2 sz){
  float sa = uRes.x / uRes.y, ia = sz.x / sz.y;
  vec2 uv = p / uRes;
  if (ia > sa) uv.x = (uv.x - 0.5) * sa / ia + 0.5; else uv.y = (uv.y - 0.5) * ia / sa + 0.5;
  return clamp(uv, 0.001, 0.999);
}
float barAt(float y){
  float s = (y - uHy) / max(uHy, uRes.y - uHy);
  return uX - uBend * s * s;
}
vec3 pic(vec2 p, float xb){ return p.x < xb ? texture2D(uA, fit(p, uSizeA)).rgb : texture2D(uB, fit(p, uSizeB)).rgb; }
// the side the bar is sweeping toward smears, and its colours split, more the faster it goes and the nearer the bar
vec3 smeared(vec2 p, float xb){
  float d = abs(p.x - xb);
  float amt = clamp(abs(uVel) / 1600.0, 0.0, 1.0) * exp(-d / 110.0);
  if (amt < 0.01) return pic(p, xb);
  float dir = sign(uVel);
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float o = float(i) / 5.0 * 22.0 * amt * dir;
    acc += pic(p - vec2(o, 0.0), xb);
  }
  acc /= 6.0;
  vec3 split = vec3(pic(p + vec2(4.0 * amt * dir, 0.0), xb).r, acc.g, pic(p - vec2(4.0 * amt * dir, 0.0), xb).b);
  return mix(acc, split, 0.6);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  float xb = barAt(p.y);
  // the bar's slope, so its edges lean as it bends
  float slope = (barAt(p.y + 1.0) - barAt(p.y - 1.0)) * 0.5;
  float u = (p.x - xb) / (BAR * sqrt(1.0 + slope * slope));
  vec3 col;
  if (abs(u) < 1.0) {
    // through the glass: a cylinder lens that turns the view over and magnifies it, splitting colour at its edges
    float z = sqrt(1.0 - u * u);
    float bendLight = -u * 15.0 * (1.0 - z * 0.5);
    vec2 q = vec2(xb + u * BAR * 0.35 + bendLight, p.y);
    float disp = u * u * 3.0;
    col = vec3(pic(q + vec2(disp, 0.0), xb).r, pic(q, xb).g, pic(q - vec2(disp, 0.0), xb).b);
    col = mix(col, col * vec3(0.92, 0.96, 1.04), 0.6);
    // light: a bright rim where the glass is seen edge-on, a streak of reflection, a shadowed far edge
    col += vec3(1.0) * pow(abs(u), 7.0) * 0.55;
    col += vec3(1.0) * exp(-pow((u + 0.42) / 0.12, 2.0)) * 0.32;
    col += vec3(1.0) * exp(-pow((u - 0.55) / 0.06, 2.0)) * 0.12;
    col *= 1.0 - smoothstep(0.75, 1.0, u) * 0.18;
  } else {
    col = smeared(p, xb);
    // the glass casts a faint shadow and a caustic beside it
    float d = abs(p.x - xb) - BAR;
    col *= 1.0 - exp(-d / 5.0) * 0.18 * step(0.0, u);
    col += vec3(1.0, 0.98, 0.92) * exp(-pow((d - 6.0) / 3.0, 2.0)) * 0.06 * step(u, 0.0);
  }
  gl_FragColor = vec4(col, 1.0);
}`;
function makeGlass(canvas: HTMLCanvasElement, a: HTMLCanvasElement | HTMLImageElement, b: HTMLCanvasElement | HTMLImageElement) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, GC_VS),
    fs = sh(gl.FRAGMENT_SHADER, GC_FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const size = (im: HTMLCanvasElement | HTMLImageElement) => (im instanceof HTMLImageElement ? [im.naturalWidth, im.naturalHeight] : [im.width, im.height]);
  const texs = [a, b].map((im, i) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    return t;
  });
  gl.uniform1i(u("uA"), 0);
  gl.uniform1i(u("uB"), 1);
  const [aw, ah] = size(a),
    [bw, bh] = size(b);
  gl.uniform2f(u("uSizeA"), aw, ah);
  gl.uniform2f(u("uSizeB"), bw, bh);
  const U = { res: u("uRes"), dpr: u("uDpr"), x: u("uX"), hy: u("uHy"), bend: u("uBend"), vel: u("uVel"), t: u("uT") };
  return {
    render(o: { W: number; H: number; dpr: number; x: number; hy: number; bend: number; vel: number; t: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.x, o.x);
      gl.uniform1f(U.hy, o.hy);
      gl.uniform1f(U.bend, o.bend);
      gl.uniform1f(U.vel, o.vel);
      gl.uniform1f(U.t, o.t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      texs.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
