# Soap Bubble

Add the "Soap Bubble" component from Nexus UI to my project.

A kudos button you blow like a soap bubble. Hold the wand and a bubble swells and wobbles; let go and it floats off, its skin swirling with thin-film colours as the soap drains, then pops into droplets at the top and leaves the message behind. Hold too long and it bursts. The bubble is a WebGL shader, and Space or Enter works the wand the same way as a press.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SoapBubble } from "@/components/soap-bubble";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/soap-bubble/index.ts ---

```ts
export { default as SoapBubble } from "./soap-bubble";
export type { SoapBubbleProps } from "./soap-bubble";
```

--- components/soap-bubble/soap-bubble.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers, clocks and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SoapBubbleProps = {
  /** who the kudos go to */
  to?: string;
  /** called with how big the bubble was, 0 to 1 */
  onSend?: (size: number) => void;
  /** Soft synthesised sounds: breath through the wand, the bubble letting go, the pop. They also follow the site-wide sound switch. */
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

const ICON_HEART = "M240 102c0 70-103.79 126.66-108.21 129a8 8 0 0 1-7.58 0C119.79 228.66 16 172 16 102a62.07 62.07 0 0 1 62-62c20.65 0 38.73 8.88 50 23.89C139.27 48.88 157.35 40 178 40a62.07 62.07 0 0 1 62 62";

const SH = 280; // the stage's height
const WAND_Y = SH - 40; // the wand's ring, centre
const RING = 24; // its radius
const RMIN = 14;
const RMAX = 86; // past this it bursts
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const tier = (r: number) => (r < 40 ? "Kudos" : r < 62 ? "Big kudos" : "Huge kudos");

type Drop = { x: number; y: number; vx: number; vy: number; r: number; age: number; life: number };

/**
 * A kudos button you blow like a soap bubble.
 *
 * Press and hold the wand and a bubble swells out of its ring, wobbling as it fills; the longer you hold, the bigger
 * the kudos. Let go and it breaks free with a shiver, floats up drifting and turning, its skin swirling with the
 * colours of a thin film (they thin and shift as the soap drains to the bottom), and pops at the top into a spray of
 * droplets, leaving the message behind. Blow too long and it bursts in your face. The bubble is a WebGL shader: its
 * outline wobbles in a few modes, its colour comes from light interfering in a film a few hundred nanometres thick,
 * strongest at the rim where the film is seen edge-on, with the room's window reflected in it and the heart inside
 * seen through it. Space or Enter works like holding the wand.
 *   <SoapBubble to="Priya" onSend={(size) => sendKudos(size)} />
 */
export default function SoapBubble({ to = "Priya", onSend, enableSound = true, volume = 0.8, autoplay = false, className = "" }: SoapBubbleProps) {
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
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(400);
  const [phase, setPhase] = useState<"idle" | "blowing" | "floating" | "sent" | "burst">("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [label, setLabel] = useState("Kudos");
  const [sent, setSent] = useState<{ word: string; x: number; y: number } | null>(null);
  const cb = useRef({ onSend });
  cb.current = { onSend };

  const sim = useRef({
    x: 200,
    y: WAND_Y,
    r: 0,
    vx: 0,
    vy: 0,
    // the wobble: amplitudes and speeds of the n = 2, 3, 4 modes, and their phases
    a: [0, 0, 0],
    av: [0, 0, 0],
    ph: [0, 1.3, 2.1],
    spin: 0,
    film: 0, // film age: it drains while floating
    pop: null as null | { x: number; y: number; t: number },
    drops: [] as Drop[],
    floatT: 0,
    breathAt: 0,
    holdT: 0,
    alive: false,
  });
  const labelRef = useRef("Kudos");

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const begin = (user: boolean) => {
    if (user) touched.current = true;
    const p = phaseRef.current;
    if (p === "blowing" || p === "floating") return;
    unlockAudio();
    const s = sim.current;
    s.x = width / 2;
    s.y = WAND_Y;
    s.r = RMIN * 0.6;
    s.vx = s.vy = 0;
    s.a = [0.04, 0.02, 0];
    s.av = [0, 0, 0];
    s.film = 0;
    s.pop = null;
    s.holdT = 0;
    s.alive = true;
    setSent(null);
    setLabel("Kudos");
    labelRef.current = "Kudos";
    setPhase("blowing");
    phaseRef.current = "blowing";
  };
  const release = (user: boolean) => {
    if (user) touched.current = true;
    if (phaseRef.current !== "blowing") return;
    const s = sim.current;
    if (s.r < RMIN + 2) {
      // too little to hold together: the film just breaks off the ring
      popAt(s.x, s.y - s.r, false);
      return;
    }
    if (reduce) {
      // no drifting: it's sent where it is
      popAt(s.x, s.y, true);
      return;
    }
    setPhase("floating");
    phaseRef.current = "floating";
    s.floatT = 0;
    s.vy = -40;
    s.vx = (Math.random() - 0.5) * 30;
    // pinching off the ring sets it shivering
    s.av = [1.1, -0.8, 0.55];
    sfx.whoosh(900, 500, { dur: 0.25, gain: 0.035 });
    sfx.note(520, { dur: 0.18, gain: 0.03, glide: 760, bell: 0 });
  };

  const popAt = (x: number, y: number, send: boolean) => {
    const s = sim.current;
    s.pop = { x, y, t: 0 };
    // droplets fly off the rim
    const n = reduce ? 0 : Math.round(14 + s.r * 0.35);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
      const v = 90 + Math.random() * 160;
      s.drops.push({ x: s.x + Math.cos(a) * s.r, y: s.y + Math.sin(a) * s.r, vx: Math.cos(a) * v + s.vx, vy: Math.sin(a) * v + s.vy - 40, r: 0.8 + Math.random() * 1.6, age: 0, life: 0.5 + Math.random() * 0.4 });
    }
    sfx.whoosh(5200, 2400, { dur: 0.06, gain: 0.07 });
    sfx.tick({ freq: 3200, gain: 0.05 });
    const size = clamp((s.r - RMIN) / (RMAX - RMIN));
    if (send) {
      const word = tier(s.r);
      setSent({ word, x: s.x, y: s.y });
      setPhase("sent");
      phaseRef.current = "sent";
      cb.current.onSend?.(size);
      [784, 988, 1175].forEach((f, i) => sfx.note(f, { at: 0.08 + i * 0.06, dur: 0.5, gain: 0.04, bell: 0.4 }));
    } else {
      setPhase("burst");
      phaseRef.current = "burst";
    }
  };

  // keyboard: holding Space or Enter is holding the wand
  const onKeyDown = (e: RKeyboardEvent) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (!e.repeat) begin(true);
  };
  const onKeyUp = (e: RKeyboardEvent) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    release(true);
  };

  // ── the loop ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current,
      fx = fxRef.current;
    if (!gl0 || !cv || !fx || !inView) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const lens = makeBubble(gl0);
    const flat = lens ? null : cv.getContext("2d");
    const fctx = fx.getContext("2d")!;
    fx.width = Math.round(W * dpr);
    fx.height = Math.round(SH * dpr);
    let raf = 0,
      last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const ph = phaseRef.current;
      if (ph === "blowing") {
        // the bubble fills, quickly at first, then slower as the film stretches; it sits on the ring
        s.holdT += dt;
        s.r += (reduce ? 40 : 17 + 22 / (1 + s.holdT)) * dt * (1 - s.r / (RMAX * 1.6));
        s.y = WAND_Y - s.r * 0.92 + RING * 0.15;
        s.x = W / 2 + Math.sin(now / 260) * 1.2;
        // breath pushes it about
        s.av[0] += (Math.random() - 0.5) * 9 * dt;
        s.av[1] += (Math.random() - 0.5) * 7 * dt;
        const w = s.r > RMAX * 0.9 ? "Careful, it's full" : tier(s.r);
        if (w !== labelRef.current) {
          labelRef.current = w;
          setLabel(w);
          sfx.note(w === "Kudos" ? 660 : w === "Big kudos" ? 880 : w === "Huge kudos" ? 1100 : 1320, { dur: 0.2, gain: 0.03, bell: 0.3 });
        }
        if (now > s.breathAt) {
          s.breathAt = now + 260;
          sfx.whoosh(350, 520, { dur: 0.3, gain: 0.018 });
        }
        if (s.r > RMAX) popAt(s.x, s.y - s.r * 0.5, false);
      } else if (ph === "floating") {
        // it rises, drifts, turns; the soap drains and the film thins
        s.floatT += dt;
        s.film += dt;
        s.vy += (-26 - s.vy * 0.6) * dt;
        s.vx += (Math.sin(now / 700) * 18 - s.vx * 0.5) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.spin += dt * 0.5;
        s.x = clamp(s.x, s.r + 4, W - s.r - 4);
        if (s.y < s.r + 26 || s.floatT > 3.2) popAt(s.x, s.y - s.r * 0.6, true);
      }
      // the wobble modes ring and settle
      for (let i = 0; i < 3; i++) {
        // each mode a damped spring, higher modes quicker and quicker to settle
        const k = [520, 950, 1500][i],
          c = [4.5, 6.5, 9][i];
        s.av[i] += (-k * s.a[i] - c * s.av[i]) * dt;
        s.a[i] = clamp(s.a[i] + s.av[i] * dt, -0.12, 0.12);
        s.ph[i] += dt * (0.3 + i * 0.25);
      }
      if (s.pop) {
        s.pop.t += dt;
        if (s.pop.t > 0.25) {
          s.pop = null;
          s.alive = false;
          if (phaseRef.current === "burst") {
            window.setTimeout(() => {
              if (phaseRef.current === "burst") {
                setPhase("idle");
                phaseRef.current = "idle";
              }
            }, 1400);
          }
        }
      }
      const bub = s.alive ? { x: s.x, y: s.y, r: s.r, a: s.a, ph: s.ph, spin: s.spin, film: s.film, pop: s.pop, neck: ph === "blowing" ? 1 : 0 } : null;
      if (lens) lens.render({ W, dpr, t: (now - t0) / 1000, bub });
      else if (flat) drawFlatBubble(flat, cv, W, dpr, bub);
      // droplets
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, SH);
      s.drops = s.drops.filter((d) => (d.age += dt) < d.life);
      for (const d of s.drops) {
        d.vy += 520 * dt;
        d.vx *= Math.exp(-dt * 2);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const k = 1 - d.age / d.life;
        fctx.fillStyle = `rgba(120,170,220,${0.45 * k})`;
        fctx.beginPath();
        fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        fctx.fill();
        fctx.fillStyle = `rgba(255,255,255,${0.9 * k})`;
        fctx.beginPath();
        fctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.4, 0, Math.PI * 2);
        fctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      lens?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, reduce]);

  // after it's sent, the wand is ready again
  useEffect(() => {
    if (phase !== "sent") return;
    const t = window.setTimeout(() => {
      setPhase("idle");
      phaseRef.current = "idle";
    }, 2600);
    return () => window.clearTimeout(t);
  }, [phase]);

  // ── autoplay: blow bubbles of different sizes; now and then one too many ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let t = 0,
      k = 0;
    const holds = [1.2, 2.8, 0.8, 5.8, 1.9];
    const go = () => {
      if (touched.current) return;
      if (phaseRef.current === "idle") {
        begin(false);
        const h = holds[k++ % holds.length];
        t = window.setTimeout(() => {
          if (!touched.current) release(false);
          t = window.setTimeout(go, 3400);
        }, h * 1000);
      } else t = window.setTimeout(go, 600);
    };
    t = window.setTimeout(go, 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, width, reduce]);

  const blowing = phase === "blowing";
  return (
    <div ref={rootRef} className={`w-full max-w-[440px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="text-[17px] font-semibold tracking-[-0.02em]">Send {to} kudos</div>
      <div className="mt-0.5 text-[13px] text-[#6e6e73]">For the launch notes. The bigger the bubble, the bigger the thanks.</div>
      <div ref={stageRef} className="relative mt-3 select-none overflow-hidden rounded-[18px]" style={{ height: SH, background: "linear-gradient(180deg,#dde7f3 0%,#e9eff7 55%,#f5f7fb 100%)" }}>
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={fxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {/* what it said, left where it popped */}
        <AnimatePresence>
          {sent && phase === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="pointer-events-none absolute flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_20px_-8px_rgba(0,0,0,.25)]"
              style={{ left: clamp(sent.x, 80, width - 80), top: clamp(sent.y, 24, SH - 120), x: "-50%", y: "-50%" }}
            >
              <svg viewBox="0 0 256 256" className="h-3.5 w-3.5 text-[#ff375f]" aria-hidden="true">
                <path fill="currentColor" d={ICON_HEART} />
              </svg>
              {sent.word} sent to {to}
            </motion.div>
          )}
          {phase === "burst" && (
            <motion.div key="burst" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-[13px] text-[#6e6e73]">
              Too much air. Try a gentler hold.
            </motion.div>
          )}
        </AnimatePresence>
        {/* the size it's reached, while you blow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 text-center text-[12px] font-medium tabular-nums text-[#6e6e73] transition-opacity duration-200" style={{ top: 12, opacity: blowing ? 1 : 0 }}>
          {label}
        </div>
        {/* the wand */}
        <button
          type="button"
          aria-label={`Hold to blow a kudos bubble for ${to}, let go to send it`}
          aria-pressed={blowing}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            begin(true);
          }}
          onPointerUp={() => release(true)}
          onPointerCancel={() => release(true)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute rounded-full outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
          style={{ left: "50%", top: WAND_Y - RING - 6, width: RING * 2 + 12, height: RING * 2 + 12, marginLeft: -(RING + 6), touchAction: "none" }}
        >
          <span className="absolute inset-[6px] rounded-full transition-transform duration-200" style={{ boxShadow: "inset 0 0 0 3.5px #5ac8fa, inset 0 0 0 5px rgba(0,80,140,.25), 0 1px 2px rgba(0,0,0,.15)", transform: blowing ? "scale(1.04)" : "scale(1)" }} />
        </button>
        {/* its handle */}
        <span aria-hidden="true" className="pointer-events-none absolute w-[5px] rounded-full bg-[#5ac8fa]" style={{ left: "calc(50% - 2.5px)", top: WAND_Y + RING - 1, height: 40, boxShadow: "inset -1px 0 0 rgba(0,80,140,.25)" }} />
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">Hold the ring to blow. Let go to send it.</div>
    </div>
  );
}

type BubbleState = { x: number; y: number; r: number; a: number[]; ph: number[]; spin: number; film: number; pop: { x: number; y: number; t: number } | null; neck: number } | null;

/** without WebGL: the bubble as a ring of colour with a highlight */
function drawFlatBubble(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, dpr: number, b: BubbleState) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(SH * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, SH);
  if (!b || b.pop) return;
  const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.75, "rgba(180,140,255,.18)");
  g.addColorStop(0.9, "rgba(120,220,255,.35)");
  g.addColorStop(1, "rgba(255,170,120,.5)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.beginPath();
  ctx.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.45, b.r * 0.16, b.r * 0.09, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff375f";
  ctx.font = `${Math.round(b.r * 0.7)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♥", b.x, b.y + b.r * 0.04);
}

// ───────────── the bubble, in WebGL ─────────────
const BUB_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const BUB_FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr, uT;
uniform vec4 uB; // x, y, radius, alive
uniform vec3 uA, uPh; // wobble amplitudes and phases (n = 2, 3, 4)
uniform vec4 uMisc; // spin, film age, neck, unused
uniform vec3 uPop; // where it's popping, and how long ago (negative: not popping)
float dot2(vec2 v){ return dot(v, v); }
float sdHeart(vec2 p){
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - 0.353553;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// light reflected from a film of soapy water, h nanometres thick, at a given cosine of the angle inside it
vec3 film(float h, float c){
  vec3 lam = vec3(650.0, 532.0, 450.0);
  vec3 ph = 6.28318 * 2.0 * 1.33 * h * c / lam;
  return 0.5 - 0.5 * cos(ph);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  if (uB.w < 0.5) { gl_FragColor = vec4(0.0); return; }
  vec2 d = p - uB.xy;
  float ang = atan(d.y, d.x);
  // the wobbling outline
  float rb = uB.z * (1.0 + uA.x * cos(2.0 * ang + uPh.x) + uA.y * cos(3.0 * ang + uPh.y) + uA.z * cos(4.0 * ang + uPh.z));
  float rho = length(d) / rb;
  if (rho > 1.04) { gl_FragColor = vec4(0.0); return; }
  float aa = clamp((1.0 - rho) * rb + 0.5, 0.0, 1.0);
  float z = sqrt(max(0.0, 1.0 - rho * rho));
  vec3 n = vec3(d / rb, z);
  // the film: thinner at the top as the soap drains, with swirls that turn slowly
  vec2 sw = vec2(cos(uMisc.x), sin(uMisc.x));
  vec2 q = mat2(sw.x, -sw.y, sw.y, sw.x) * n.xy;
  float swirl = vnoise(q * 2.2 + vec2(uT * 0.15, -uT * 0.1)) * 0.6 + vnoise(q * 4.7 - uT * 0.2) * 0.4;
  float drain = clamp(uMisc.y / 3.0, 0.0, 1.0);
  float h = 300.0 + 200.0 * n.y - 150.0 * drain * (1.0 - n.y) + (swirl - 0.5) * 380.0;
  h = max(h, 40.0);
  vec3 irid = film(h, mix(0.55, 1.0, z));
  irid = clamp(mix(vec3(dot(irid, vec3(0.333))), irid, 1.5), 0.0, 1.0);
  // reflectance: much stronger where the film is seen edge-on
  float F = 0.03 + 0.97 * pow(1.0 - z, 3.0);
  // the film barely dims what's behind it; what it reflects is coloured by interference
  float alpha = 0.02 + 0.5 * F;
  vec3 col = irid * alpha;
  // the window reflected in the front, and a smaller one on the far side
  vec2 w1 = (n.xy - vec2(-0.4, -0.44)) / vec2(0.17, 0.12);
  float win = smoothstep(1.0, 0.55, length(pow(abs(w1), vec2(3.0))) * 1.0) * 0.85;
  vec2 w2 = (n.xy - vec2(0.42, 0.52)) / vec2(0.12, 0.05);
  float win2 = smoothstep(1.0, 0.3, length(w2)) * 0.4;
  col += vec3(1.0) * win + vec3(0.95, 0.97, 1.0) * win2;
  alpha = clamp(alpha + win + win2 * 0.6, 0.0, 1.0);
  // the heart inside, seen through the film (a little magnified toward the middle)
  vec2 hp = d / (uB.z * 0.4) * (0.9 + 0.1 * (1.0 - z));
  hp.y = -hp.y + 0.58;
  float hd = sdHeart(hp);
  float heart = smoothstep(0.03, -0.03, hd) * smoothstep(0.35, 0.6, uB.z / 60.0 + 0.3);
  vec3 hcol = mix(vec3(1.0, 0.2, 0.36), vec3(1.0, 0.58, 0.66), clamp(hp.y * 0.45 - hp.x * 0.25, 0.0, 1.0));
  hcol = mix(hcol, irid, 0.12);
  col = mix(col, hcol * 0.9, heart * 0.9);
  alpha = mix(alpha, 0.9, heart * 0.9);
  // a thin darker line at the very rim
  col *= 1.0 - smoothstep(0.93, 1.0, rho) * 0.25;
  // where it meets the wand's ring as it's blown, the film necks down into it
  // popping: a hole races across from where it broke, with a thickened lip
  if (uPop.z >= 0.0) {
    float hr = uPop.z * 1500.0;
    float pd = length(p - uPop.xy);
    float lip = exp(-pow((pd - hr) / 3.0, 2.0));
    alpha *= smoothstep(hr - 2.0, hr + 2.0, pd);
    col *= smoothstep(hr - 2.0, hr + 2.0, pd);
    col += vec3(0.9, 0.95, 1.0) * lip * 0.6;
    alpha = max(alpha, lip * 0.5);
  }
  gl_FragColor = vec4(col, alpha) * aa;
}`;
function makeBubble(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const sh = (t: number, src: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, src);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, BUB_VS),
    fs = sh(gl.FRAGMENT_SHADER, BUB_FS);
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
  const U = { res: u("uRes"), dpr: u("uDpr"), t: u("uT"), b: u("uB"), a: u("uA"), ph: u("uPh"), misc: u("uMisc"), pop: u("uPop") };
  return {
    render(o: { W: number; dpr: number; t: number; bub: BubbleState }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(SH * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      const b = o.bub;
      gl.uniform2f(U.res, o.W, SH);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.t, o.t);
      gl.uniform4f(U.b, b?.x ?? 0, b?.y ?? 0, b?.r ?? 0, b ? 1 : 0);
      gl.uniform3f(U.a, b?.a[0] ?? 0, b?.a[1] ?? 0, b?.a[2] ?? 0);
      gl.uniform3f(U.ph, b?.ph[0] ?? 0, b?.ph[1] ?? 0, b?.ph[2] ?? 0);
      gl.uniform4f(U.misc, b?.spin ?? 0, b?.film ?? 0, b?.neck ?? 0, 0);
      gl.uniform3f(U.pop, b?.pop?.x ?? 0, b?.pop?.y ?? 0, b?.pop ? b.pop.t : -1);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
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
