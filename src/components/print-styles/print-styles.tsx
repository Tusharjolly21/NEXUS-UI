"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { motion, useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PrintStyle = "original" | "mac" | "pocket" | "newsprint" | "riso";

export type PrintStylesProps = {
  defaultStyle?: PrintStyle;
  onChange?: (style: PrintStyle) => void;
  /** an image to print instead of the painted demo scene (must allow cross-origin use) */
  src?: string;
  title?: string;
  /** Soft synthesised sounds: the print head running across. They also follow the site-wide sound switch. */
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

const STYLES: { id: PrintStyle; name: string; note: string; swatch: string[] }[] = [
  { id: "original", name: "Photo", note: "As shot", swatch: ["#e9875a", "#4a6fa5"] },
  { id: "mac", name: "1-bit", note: "Black and paper, dithered on an 8 by 8 grid", swatch: ["#1d1d1f", "#f3f0e8"] },
  { id: "pocket", name: "Pocket", note: "Four greens, like an old handheld", swatch: ["#0f380f", "#9bbc0f"] },
  { id: "newsprint", name: "Newsprint", note: "Cyan, magenta, yellow and black dots at their screen angles", swatch: ["#00a0dc", "#e0218a"] },
  { id: "riso", name: "Riso", note: "Two inks, a little off register, with grain", swatch: ["#ff48b0", "#0078bf"] },
];
const IDX: Record<PrintStyle, number> = { original: 0, mac: 1, pocket: 2, newsprint: 3, riso: 4 };

/**
 * A cover-image style picker that prints the picture as you choose.
 *
 * Pick a style and a print head runs across the image, laying the new print down behind it through an ordered-dither
 * dissolve: 1-bit black and paper, four handheld greens, newsprint (four inks screened at their real angles, 15, 75, 0
 * and 45 degrees, so the dots fall into rosettes), or risograph (two fluorescent inks with grain, slightly off
 * register). Move over the picture and a printer's loupe magnifies the dots under it; press and hold to see the
 * original through the loupe. Every style is computed live in a WebGL shader from the source image; without WebGL a
 * simpler version is drawn on a 2D canvas.
 *   <PrintStyles defaultStyle="newsprint" onChange={(s) => setCoverStyle(s)} />
 */
export default function PrintStyles({ defaultStyle = "newsprint", onChange, src, title = "Cover style", enableSound = true, volume = 0.8, autoplay = false, className = "" }: PrintStylesProps) {
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
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(rootRef, { margin: "100px" });
  const [style, setStyle] = useState<PrintStyle>(defaultStyle);
  const styleRef = useRef(style);
  styleRef.current = style;
  const [width, setWidth] = useState(400);
  const [img, setImg] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
  const cb = useRef({ onChange });
  cb.current = { onChange };
  const H = Math.round(width * 0.66);

  const sim = useRef({
    from: IDX[defaultStyle],
    to: IDX[defaultStyle],
    mix: 1,
    loupe: { x: 0, y: 0, on: 0, show: 0, orig: 0 },
    dirty: true,
    tickAt: 0,
  });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the picture: a painted scene, or the image you give it
  useEffect(() => {
    if (!src) {
      setImg(paintScene(1200, 792));
      return;
    }
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => setImg(im);
    im.onerror = () => setImg(paintScene(1200, 792));
    im.src = src;
  }, [src]);

  const choose = (id: PrintStyle, user = true) => {
    if (user) touched.current = true;
    if (id === styleRef.current) return;
    const s = sim.current;
    // a choice mid-run starts from wherever the run had got to
    s.from = s.mix > 0.5 ? s.to : s.from;
    s.to = IDX[id];
    s.mix = reduce ? 1 : 0;
    s.dirty = true;
    styleRef.current = id;
    setStyle(id);
    cb.current.onChange?.(id);
    unlockAudio();
    sfx.whoosh(1800, 900, { dur: 0.5, gain: 0.025 });
  };

  const onKey = (e: RKeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + STYLES.length) % STYLES.length;
    btnRefs.current[n]?.focus();
    choose(STYLES[n].id);
  };

  // ── the loupe ──
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const L = sim.current.loupe;
    L.x = e.clientX - r.left;
    L.y = e.clientY - r.top;
    L.on = 1;
    sim.current.dirty = true;
    touched.current = true;
  };
  const onLeave = () => {
    sim.current.loupe.on = 0;
    sim.current.loupe.orig = 0;
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    onMove(e);
    sim.current.loupe.orig = 1;
    sfx.tick({ freq: 1800, gain: 0.025 });
  };
  const onUp = () => {
    sim.current.loupe.orig = 0;
    sim.current.dirty = true;
  };

  // ── the loop ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current;
    if (!gl0 || !cv || !inView || !img) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const pr = makePrint(gl0, img);
    const flat = pr ? null : makeFlatPrint(cv, img, W, H, dpr);
    s.dirty = true;
    let raf = 0,
      last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = s.loupe;
      const showT = L.on ? 1 : 0;
      if (Math.abs(L.show - showT) > 0.001) {
        L.show += (showT - L.show) * (1 - Math.exp(-dt * 12));
        s.dirty = true;
      }
      if (s.mix < 1) {
        s.mix = Math.min(1, s.mix + dt / 1.1);
        s.dirty = true;
        // the head ratchets as it runs
        if (now > s.tickAt) {
          s.tickAt = now + 55;
          sfx.tick({ freq: 900 + Math.random() * 500, gain: 0.012 });
        }
        if (s.mix >= 1) s.from = s.to;
      }
      if (!s.dirty) return;
      s.dirty = false;
      const ease = s.mix;
      if (pr) pr.render({ W, H, dpr, from: s.from, to: s.to, mix: ease, loupe: [L.x, L.y, 58 * L.show, L.orig], t: now / 1000 });
      else if (flat) flat.render(s.mix > 0.5 ? s.to : s.from);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      pr?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, img, reduce]);

  // ── autoplay: run through the styles, with the loupe wandering over the picture ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let k = IDX[styleRef.current];
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      k = (k + 1) % STYLES.length;
      choose(STYLES[k].id, false);
    }, 3200);
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touched.current || reduce) return;
      const L = sim.current.loupe;
      const t = now / 1000;
      const on = Math.sin(t * 0.7) > -0.2;
      L.on = on ? 1 : 0;
      L.x = width * (0.5 + Math.sin(t * 0.53) * 0.32);
      L.y = H * (0.5 + Math.sin(t * 0.81 + 1) * 0.28);
      sim.current.dirty = true;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
      sim.current.loupe.on = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, width, H, reduce]);

  const cur = STYLES[IDX[style]];

  return (
    <div ref={rootRef} className={`w-full max-w-[460px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
      <div className="mt-0.5 min-h-[20px] text-[13px] text-[#6e6e73]">{cur.note}</div>
      <div
        ref={boxRef}
        role="img"
        aria-label={`Cover image printed in the ${cur.name} style`}
        className="relative mt-3 select-none overflow-hidden rounded-[14px] bg-[#f3f0e8]"
        style={{ height: H, cursor: "zoom-in", touchAction: "none" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={glRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>
      <div role="radiogroup" aria-label="Print style" className="mt-4 grid grid-cols-5 gap-1.5">
        {STYLES.map((st, i) => {
          const on = st.id === style;
          return (
            <button
              key={st.id}
              ref={(el) => {
            btnRefs.current[i] = el;
          }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(st.id)}
              onKeyDown={(e) => onKey(e, i)}
              className="relative flex flex-col items-center gap-1.5 rounded-[12px] px-1 py-2 outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
            >
              {on && <motion.span layoutId="print-style-pill" className="absolute inset-0 rounded-[12px] bg-[#f5f5f7]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              <span className="relative flex h-5 w-5 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(0,0,0,.08)]" aria-hidden="true">
                <span className="h-full w-1/2" style={{ background: st.swatch[0] }} />
                <span className="h-full w-1/2" style={{ background: st.swatch[1] }} />
              </span>
              <span className={`relative text-[11px] tracking-[-0.02em] sm:text-[12px] ${on ? "font-semibold text-[#1d1d1f]" : "font-medium text-[#6e6e73]"}`}>{st.name}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">Move over the picture to look through the loupe. Press to see the original.</div>
    </div>
  );
}

/** the demo picture: a lake at sunset under layered mountains, painted in code */
function paintScene(W: number, H: number) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const horizon = H * 0.6;
  // sky
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#5a78c0");
  sky.addColorStop(0.42, "#d98aa6");
  sky.addColorStop(0.76, "#ffb48a");
  sky.addColorStop(1, "#ffe4b4");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, horizon);
  // sun and its glow
  const sx = W * 0.62,
    sy = horizon - H * 0.07;
  const glow = g.createRadialGradient(sx, sy, 10, sx, sy, W * 0.45);
  glow.addColorStop(0, "rgba(255,240,200,.95)");
  glow.addColorStop(0.15, "rgba(255,200,140,.55)");
  glow.addColorStop(1, "rgba(255,160,120,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, horizon);
  g.fillStyle = "#fff4d6";
  g.beginPath();
  g.arc(sx, sy, H * 0.07, 0, Math.PI * 2);
  g.fill();
  // clouds: soft bands lit from below
  for (let i = 0; i < 9; i++) {
    const y = H * (0.1 + rnd() * 0.32),
      x = rnd() * W,
      w = W * (0.18 + rnd() * 0.3);
    const cg = g.createLinearGradient(0, y - 12, 0, y + 14);
    cg.addColorStop(0, "rgba(120,70,110,0)");
    cg.addColorStop(0.5, "rgba(140,80,120,.55)");
    cg.addColorStop(0.8, "rgba(255,170,130,.6)");
    cg.addColorStop(1, "rgba(255,170,130,0)");
    g.fillStyle = cg;
    g.beginPath();
    g.ellipse(x, y, w / 2, 9 + rnd() * 10, 0, 0, Math.PI * 2);
    g.fill();
  }
  // ridges, far to near, each paler with distance
  const ridges = [
    { base: horizon - H * 0.2, amp: H * 0.1, col: "#c49ab6", f: 3 },
    { base: horizon - H * 0.12, amp: H * 0.12, col: "#957fb0", f: 5 },
    { base: horizon - H * 0.04, amp: H * 0.1, col: "#635e92", f: 8 },
  ];
  for (const r of ridges) {
    const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    g.fillStyle = r.col;
    g.beginPath();
    g.moveTo(0, horizon);
    for (let x = 0; x <= W; x += 4) {
      const t = x / W;
      const y = r.base - r.amp * (0.55 * Math.abs(Math.sin(t * r.f + ph[0])) + 0.3 * Math.abs(Math.sin(t * r.f * 2.3 + ph[1])) + 0.15 * Math.sin(t * r.f * 6.1 + ph[2]));
      g.lineTo(x, y);
    }
    g.lineTo(W, horizon);
    g.closePath();
    g.fill();
  }
  // the lake: the sky mirrored, darker, broken by ripples
  g.save();
  g.translate(0, horizon * 2);
  g.scale(1, -1);
  g.globalAlpha = 0.75;
  g.drawImage(c, 0, 0, W, horizon, 0, 0, W, horizon);
  g.restore();
  g.fillStyle = "rgba(40,50,110,.16)";
  g.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 220; i++) {
    const y = horizon + Math.pow(rnd(), 1.6) * (H - horizon),
      x = rnd() * W,
      w = 10 + rnd() * 70 * (1 + (y - horizon) / 200);
    const near = Math.abs(x - sx) < W * 0.12;
    g.fillStyle = near ? `rgba(255,220,170,${0.35 + rnd() * 0.4})` : `rgba(255,255,255,${0.04 + rnd() * 0.08})`;
    g.fillRect(x, y, w, 1.5 + (y - horizon) / 120);
  }
  // pines on the near shore
  const shore = H * 0.9;
  g.fillStyle = "#26304f";
  g.beginPath();
  g.moveTo(0, H);
  g.lineTo(0, shore);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, shore + Math.sin(x / 90) * 8 - (x < W * 0.3 ? (W * 0.3 - x) * 0.12 : 0));
  g.lineTo(W, H);
  g.fill();
  for (let i = 0; i < 26; i++) {
    const x = rnd() < 0.6 ? rnd() * W * 0.32 : W * (0.82 + rnd() * 0.18);
    const h = H * (0.1 + rnd() * 0.18);
    const y = shore + 10 - (x < W * 0.3 ? (W * 0.3 - x) * 0.12 : 0);
    g.beginPath();
    for (let k = 0; k < 7; k++) {
      const yy = y - h * (k / 7),
        ww = h * 0.22 * (1 - k / 7.5);
      g.moveTo(x, yy - h / 7 - 6);
      g.lineTo(x - ww, yy + 4);
      g.lineTo(x + ww, yy + 4);
    }
    g.fill();
  }
  // birds
  g.strokeStyle = "#2a2440";
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const x = W * (0.25 + rnd() * 0.25),
      y = H * (0.15 + rnd() * 0.15),
      s = 6 + rnd() * 6;
    g.beginPath();
    g.moveTo(x - s, y);
    g.quadraticCurveTo(x - s / 2, y - s / 2, x, y);
    g.quadraticCurveTo(x + s / 2, y - s / 2, x + s, y);
    g.stroke();
  }
  return c;
}

// ───────────── the presses, in WebGL ─────────────
const PRINT_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const PRINT_FS = `precision highp float;
uniform sampler2D uImg, uBayer;
uniform vec2 uRes, uImgSize; uniform float uDpr, uMix, uT;
uniform float uFrom, uTo;
uniform vec4 uLoupe; // x, y, radius, show original
const vec3 PAPER = vec3(0.953, 0.94, 0.91);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// cover-fit the image into the box
vec2 fit(vec2 p){
  float sa = uRes.x / uRes.y, ia = uImgSize.x / uImgSize.y;
  vec2 uv = p / uRes;
  if (ia > sa) uv.x = (uv.x - 0.5) * sa / ia + 0.5; else uv.y = (uv.y - 0.5) * ia / sa + 0.5;
  return clamp(uv, 0.001, 0.999);
}
vec3 img(vec2 p){ return texture2D(uImg, fit(p)).rgb; }
float bayer(vec2 cell){ return texture2D(uBayer, (mod(cell, 8.0) + 0.5) / 8.0).r; }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 macStyle(vec2 p){
  float c = 2.0;
  vec2 cell = floor(p / c);
  float l = lum(img((cell + 0.5) * c));
  l = clamp((l - 0.5) * 1.3 + 0.56, 0.0, 1.0);
  return l > bayer(cell) ? PAPER : vec3(0.11, 0.11, 0.12);
}
vec3 pocketStyle(vec2 p){
  float c = 3.0;
  vec2 cell = floor(p / c);
  float l = lum(img((cell + 0.5) * c));
  float v = clamp(floor(l * 3.0 + bayer(cell) * 0.98), 0.0, 3.0);
  vec3 a = vec3(0.059, 0.22, 0.059), b = vec3(0.19, 0.384, 0.19), cc = vec3(0.545, 0.675, 0.059), d = vec3(0.608, 0.737, 0.059);
  vec3 col = v < 0.5 ? a : v < 1.5 ? b : v < 2.5 ? cc : d;
  // the screen's pixel grid
  vec2 f = fract(p / c);
  col *= 0.9 + 0.1 * step(0.18, min(f.x, f.y));
  return col;
}
vec4 cmyk(vec3 c){
  float k = 1.0 - max(max(c.r, c.g), c.b);
  vec3 cmy = (1.0 - c - k) / max(1.0 - k, 0.001);
  return vec4(cmy * 0.92, k * 0.55);
}
float screen(vec2 p, float ang, int ch){
  float s = 4.4;
  float ca = cos(ang), sa = sin(ang);
  mat2 R = mat2(ca, -sa, sa, ca);
  vec2 q = R * p;
  vec2 cell = floor(q / s) + 0.5;
  vec2 center = (cell * s) * R; // back to the page
  vec4 v4 = cmyk(img(center));
  float v = ch == 0 ? v4.x : ch == 1 ? v4.y : ch == 2 ? v4.z : v4.w;
  float r = sqrt(clamp(v, 0.0, 1.0)) * s * 0.7;
  float d = length(q - cell * s);
  return smoothstep(r + 0.6, r - 0.6, d);
}
vec3 newsStyle(vec2 p){
  vec3 col = PAPER;
  col *= mix(vec3(1.0), vec3(0.0, 0.63, 0.86), screen(p, 0.2618, 0) * 0.92);
  col *= mix(vec3(1.0), vec3(0.88, 0.13, 0.54), screen(p, 1.309, 1) * 0.9);
  col *= mix(vec3(1.0), vec3(1.0, 0.9, 0.0), screen(p, 0.0, 2) * 0.9);
  col *= mix(vec3(1.0), vec3(0.12, 0.12, 0.14), screen(p, 0.7854, 3));
  // the newsprint's grey and its fibres
  col *= 0.97 + 0.03 * hash(floor(p * 1.5));
  return col;
}
vec3 risoStyle(vec2 p){
  vec3 base = img(p);
  float l = lum(base);
  // blue takes the shadows; pink takes the warm light
  float blue = clamp((0.82 - l) * 1.35, 0.0, 1.0) * (0.55 + 0.45 * clamp(base.b - base.r + 0.6, 0.0, 1.0));
  vec3 b2 = img(p + vec2(1.8, -1.1));
  float pink = clamp((b2.r - b2.b) * 1.6 + 0.15 + (0.55 - lum(b2)) * 0.4, 0.0, 1.0);
  // stochastic screening with a coarser grain over it
  // the screen is blobby, like a riso's stencil: smooth noise at about a pixel and a half, with fine speckle
  float n1 = vnoise(p * 0.8 + 3.0) * 0.75 + hash(floor(p * 2.0) + 3.0) * 0.25;
  vec2 pp = p + vec2(1.8, -1.1);
  float n2 = vnoise(pp * 0.8 + 41.0) * 0.75 + hash(floor(pp * 2.0) + 9.0) * 0.25;
  float grain = hash(floor(p / 3.0)) * 0.25;
  float inkB = smoothstep(n1 - 0.04, n1 + 0.04, blue * (0.95 + grain) * 1.05 - 0.02);
  float inkP = smoothstep(n2 - 0.04, n2 + 0.04, pink * (0.95 + grain) * 1.05 - 0.02);
  vec3 col = PAPER;
  col *= mix(vec3(1.0), vec3(0.0, 0.47, 0.75), inkB * 0.9);
  col *= mix(vec3(1.0), vec3(1.0, 0.28, 0.69), inkP * 0.85);
  return col;
}
vec3 styled(float s, vec2 p){
  if (s < 0.5) return img(p);
  if (s < 1.5) return macStyle(p);
  if (s < 2.5) return pocketStyle(p);
  if (s < 3.5) return newsStyle(p);
  return risoStyle(p);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  // the loupe: inside it the page is magnified three times, bowed a little at the rim
  vec2 L = uLoupe.xy;
  float lr = uLoupe.z;
  float ld = length(p - L);
  vec2 q = p;
  bool inL = lr > 1.0 && ld < lr;
  if (inL) {
    float k = ld / lr;
    q = L + (p - L) / (3.0 * (1.0 + 0.18 * k * k));
  }
  // the run: the new print is laid down behind a head moving across the page, through a dither dissolve
  float front = uMix * 1.35 - 0.12;
  float along = (p.x / uRes.x) * 0.8 + (p.y / uRes.y) * 0.2;
  float m = clamp((front - along) * 6.0, 0.0, 1.0);
  bool useTo = bayer(floor(p / 2.0)) < m;
  vec3 col;
  if (inL && uLoupe.w > 0.5) col = img(q);
  else col = styled(useTo ? uTo : uFrom, q);
  // the head: a soft bright bar with its shadow, while it runs
  if (uMix > 0.0 && uMix < 1.0) {
    float hd = (front - along) * uRes.x;
    col += vec3(1.0) * exp(-hd * hd / 30.0) * 0.35;
    col *= 1.0 - exp(-pow((hd + 6.0) / 5.0, 2.0)) * 0.15;
  }
  if (lr > 1.0) {
    // the loupe's rim, its shadow on the page, and a highlight on the glass
    float rim = smoothstep(lr - 3.0, lr - 1.0, ld) * smoothstep(lr + 2.0, lr, ld);
    float shadow = smoothstep(lr + 10.0, lr, ld) * step(lr, ld);
    col *= 1.0 - shadow * 0.18;
    col = mix(col, vec3(0.12, 0.12, 0.14), rim * 0.85);
    if (inL) {
      vec2 hv = (p - L) / lr;
      col += vec3(1.0) * smoothstep(0.85, 0.95, length(hv + vec2(0.0, 0.0))) * smoothstep(-0.2, -0.7, hv.y) * smoothstep(0.2, -0.5, hv.x) * 0.35;
      col *= 1.0 - smoothstep(0.75, 1.0, length(hv)) * 0.1;
    }
  }
  gl_FragColor = vec4(col, 1.0);
}`;
const BAYER8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
function makePrint(canvas: HTMLCanvasElement, src: HTMLCanvasElement | HTMLImageElement) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, PRINT_VS),
    fs = sh(gl.FRAGMENT_SHADER, PRINT_FS);
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
  const tex = (unit: number, filter: number) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const tImg = tex(0, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  const tB = tex(1, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(BAYER8.map((v) => Math.round(((v + 0.5) / 64) * 255))));
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(u("uImg"), 0);
  gl.uniform1i(u("uBayer"), 1);
  const iw = src instanceof HTMLImageElement ? src.naturalWidth : src.width,
    ih = src instanceof HTMLImageElement ? src.naturalHeight : src.height;
  gl.uniform2f(u("uImgSize"), iw, ih);
  const U = { res: u("uRes"), dpr: u("uDpr"), mix: u("uMix"), t: u("uT"), from: u("uFrom"), to: u("uTo"), loupe: u("uLoupe") };
  return {
    render(o: { W: number; H: number; dpr: number; from: number; to: number; mix: number; loupe: number[]; t: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.mix, o.mix);
      gl.uniform1f(U.t, o.t);
      gl.uniform1f(U.from, o.from);
      gl.uniform1f(U.to, o.to);
      gl.uniform4f(U.loupe, o.loupe[0], o.loupe[1], o.loupe[2], o.loupe[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tImg);
      gl.deleteTexture(tB);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

/** without WebGL: each style approximated on a small 2D canvas and scaled up crisply */
function makeFlatPrint(cv: HTMLCanvasElement, src: HTMLCanvasElement | HTMLImageElement, W: number, H: number, dpr: number) {
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const sw = Math.round(W / 2),
    shh = Math.round(H / 2);
  const small = document.createElement("canvas");
  small.width = sw;
  small.height = shh;
  const sc = small.getContext("2d", { willReadFrequently: true })!;
  sc.drawImage(src, 0, 0, sw, shh);
  const base = sc.getImageData(0, 0, sw, shh);
  return {
    render(style: number) {
      ctx.imageSmoothingEnabled = style === 0;
      if (style === 0) {
        ctx.drawImage(src, 0, 0, cv.width, cv.height);
        return;
      }
      const out = sc.createImageData(sw, shh);
      for (let y = 0; y < shh; y++)
        for (let x = 0; x < sw; x++) {
          const i = (y * sw + x) * 4;
          const r = base.data[i] / 255,
            g = base.data[i + 1] / 255,
            b = base.data[i + 2] / 255;
          const l = 0.299 * r + 0.587 * g + 0.114 * b;
          const t = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
          let c: number[];
          if (style === 1) c = l > t ? [243, 240, 232] : [28, 28, 31];
          else if (style === 2) c = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]][Math.min(3, Math.floor(l * 3 + t))];
          else if (style === 3) c = l > t ? [243, 240, 232] : [Math.round(40 + r * 120), Math.round(40 + g * 80), Math.round(60 + b * 120)];
          else c = l > t ? [243, 240, 232] : r > b ? [255, 72, 176] : [0, 120, 191];
          out.data[i] = c[0];
          out.data[i + 1] = c[1];
          out.data[i + 2] = c[2];
          out.data[i + 3] = 255;
        }
      sc.putImageData(out, 0, 0);
      ctx.drawImage(small, 0, 0, cv.width, cv.height);
      sc.putImageData(base, 0, 0);
    },
  };
}
