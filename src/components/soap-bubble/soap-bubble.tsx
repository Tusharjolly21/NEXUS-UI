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
