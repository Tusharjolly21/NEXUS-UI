# Warp CTA

Add the "Warp CTA" component from Nexus UI to my project.

A deploy button that goes to warp. Hover and the drive spools up on a smooth spring: stars drifting toward you draw out into streaks of true motion blur from a vanishing point that eases after your pointer, and a hairline of light on the rim follows you round. Click and the streaks run long into a bloom while the deploy runs, then draw back into stars when it lands. Give it onDeploy and the jump lasts until your promise settles.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { WarpCTA } from "@/components/warp-cta";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/warp-cta/index.ts ---

```ts
export { default as WarpCTA } from "./warp-cta";
export type { WarpCTAProps } from "./warp-cta";
```

--- components/warp-cta/warp-cta.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type WarpCTAProps = {
  title?: string;
  detail?: string;
  /** the words on the button */
  label?: string;
  /** runs when it's pressed; if it returns a promise, the jump lasts until it settles (at least a second) */
  onDeploy?: () => Promise<unknown> | void;
  /** Soft synthesised sounds: the drive spooling up, the jump, arrival. They also follow the site-wide sound switch. */
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

const ICON_ROCKET = "M101.85 191.14C97.34 201 82.29 224 40 224a8 8 0 0 1-8-8c0-42.29 23-57.34 32.86-61.85a8 8 0 0 1 6.64 14.56c-6.43 2.93-20.62 12.36-23.12 38.91c26.55-2.5 36-16.69 38.91-23.12a8 8 0 1 1 14.56 6.64m122-144a16 16 0 0 0-15-15c-12.58-.75-44.73.4-71.4 27.07L88 108.7a8 8 0 0 1-11.33-11.31l26.56-26.57a4 4 0 0 0-2.82-6.82H74.35A15.9 15.9 0 0 0 63 68.68L28.7 103a16 16 0 0 0 9.07 27.16l38.47 5.37l44.21 44.21l5.37 38.49a15.94 15.94 0 0 0 10.78 12.92a16.1 16.1 0 0 0 5.1.83a15.9 15.9 0 0 0 11.3-4.68l34.32-34.3a16 16 0 0 0 4.68-11.35v-26.06a4 4 0 0 0-6.83-2.82l-26.57 26.56a8 8 0 0 1-11.71-.42a8.2 8.2 0 0 1 .6-11.1l49.27-49.27c26.69-26.68 27.84-58.83 27.09-71.42Z";
const ICON_CHECK = "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32";
const ICON_BRANCH = "M232 64a32 32 0 1 0-40 31v17a8 8 0 0 1-8 8H96a23.8 23.8 0 0 0-8 1.38V95a32 32 0 1 0-16 0v66a32 32 0 1 0 16 0v-17a8 8 0 0 1 8-8h88a24 24 0 0 0 24-24V95a32.06 32.06 0 0 0 24-31M64 64a16 16 0 1 1 16 16a16 16 0 0 1-16-16m32 128a16 16 0 1 1-16-16a16 16 0 0 1 16 16M200 80a16 16 0 1 1 16-16a16 16 0 0 1-16 16";

const BH = 168; // the button's height
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type Phase = "idle" | "jump" | "done";

/**
 * A deploy button that goes to warp.
 *
 * The button is a window onto space. Move over it and the drive spools up on a smooth spring: the stars, which drift
 * toward you as points, draw out into streaks of true motion blur that pour from a vanishing point easing after your
 * pointer, and the light ahead turns faintly blue; a hairline of light on the rim follows the pointer. Press it and it
 * jumps: the streaks run long and a bloom opens from the centre while the deploy runs, then the drive spools down and
 * the streaks draw back into stars beside the result. The starfield is a WebGL shader (each star travels its own ray
 * from the vanishing point under perspective and is smeared back to where it was a moment ago); without WebGL it's
 * drawn as lines on a 2D canvas. Works from the keyboard like any button.
 *   <WarpCTA label="Deploy to production" onDeploy={() => api.deploy()} />
 */
export default function WarpCTA({
  title = "Ready to ship",
  detail = "main is 3 commits ahead of production",
  label = "Deploy at warp speed",
  onDeploy,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: WarpCTAProps) {
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(400);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const [took, setTook] = useState(0);
  const cb = useRef({ onDeploy });
  cb.current = { onDeploy };

  const sim = useRef({
    hover: false,
    vp: { x: 0.5, y: 0.5 }, // vanishing point, 0..1
    vpT: { x: 0.5, y: 0.5 },
    speed: 0.04, // 0: drifting, 1: full warp, beyond: the jump
    speedV: 0,
    jump: 0, // 0..1: the white-out
    spool: 0,
    t: 0,
    humAt: 0,
  });

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = async (user: boolean) => {
    if (user) touched.current = true;
    if (phaseRef.current !== "idle") return;
    unlockAudio();
    phaseRef.current = "jump";
    setPhase("jump");
    const t0 = performance.now();
    sfx.whoosh(120, 2400, { dur: 0.9, gain: 0.07 });
    sfx.note(55, { dur: 0.9, gain: 0.12, type: "sine", glide: 40, bell: 0 });
    try {
      const r = cb.current.onDeploy?.();
      await Promise.all([r, new Promise((res) => setTimeout(res, reduce ? 500 : 1150))]);
    } catch {
      /* the result line shows the time either way */
    }
    const dt = (performance.now() - t0) / 1000;
    setTook(dt);
    phaseRef.current = "done";
    setPhase("done");
    sfx.whoosh(1800, 300, { dur: 0.5, gain: 0.05 });
    [784, 1175, 1568].forEach((f, i) => sfx.note(f, { at: 0.1 + i * 0.07, dur: 0.6, gain: 0.04, bell: 0.4 }));
  };

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
    }, 2800);
    return () => window.clearTimeout(t);
  }, [phase]);

  // ── the hand ──
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = sim.current;
    s.vpT = { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
    if (e.pointerType === "mouse" || e.buttons) s.hover = true;
    touched.current = true;
  };
  const onEnter = () => {
    sim.current.hover = true;
    touched.current = true;
    unlockAudio();
  };
  const onLeave = () => {
    const s = sim.current;
    s.hover = false;
    s.vpT = { x: 0.5, y: 0.5 };
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") sim.current.hover = true;
  };

  // ── the loop ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current;
    if (!gl0 || !cv || !inView) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const warp = makeWarp(gl0);
    const ctx = warp ? null : cv.getContext("2d");
    const stars = warp ? null : Array.from({ length: 160 }, () => ({ a: Math.random() * Math.PI * 2, z: Math.random(), k: Math.random() }));
    let raf = 0,
      last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phaseRef.current;
      // the drive: spools up while you're over it, drops back when you leave
      const focused = typeof document !== "undefined" && document.activeElement === btnRef.current;
      const want = ph === "jump" ? 3.2 : ph === "done" ? 0.04 : s.hover || focused ? 1 : 0.04;
      // a critically damped spring, so it spools and settles without lurching
      const stiff = ph === "jump" ? 9 : want > s.speed ? 2.6 : 3.4;
      s.speedV += (stiff * stiff * (want - s.speed) - 2 * stiff * s.speedV) * dt;
      s.speed = Math.max(0, s.speed + s.speedV * dt);
      if (reduce) {
        s.speed = 0.04;
        s.speedV = 0;
      }
      s.jump += ((ph === "jump" ? 1 : 0) - s.jump) * (1 - Math.exp(-dt * (ph === "jump" ? 2.6 : 3.5)));
      // the vanishing point drifts after the pointer, and only part of the way, like looking through a window
      const tx = 0.5 + (s.vpT.x - 0.5) * 0.6,
        ty = 0.5 + (s.vpT.y - 0.5) * 0.6;
      s.vp.x += (tx - s.vp.x) * (1 - Math.exp(-dt * 2.2));
      s.vp.y += (ty - s.vp.y) * (1 - Math.exp(-dt * 2.2));
      s.t += dt * (0.06 + s.speed * 0.9);
      // the hum climbs with the speed
      if (s.speed > 0.15 && now > s.humAt && ph === "idle") {
        s.humAt = now + 420;
        sfx.whoosh(140 + s.speed * 420, 220 + s.speed * 700, { dur: 0.7, gain: 0.008 + s.speed * 0.012 });
      }
      // the label stays still and crisp; it just picks up a little of the light as the drive spools
      const el = textRef.current;
      if (el) {
        const k = reduce ? 0 : clamp(s.speed);
        el.style.textShadow = k > 0.02 ? `0 1px 12px rgba(5,8,25,${0.25 + s.jump * 0.55}), 0 0 ${10 + k * 18}px rgba(150,190,255,${0.12 + k * 0.35})` : "none";
        el.style.letterSpacing = `${-0.02 + k * 0.012}em`;
      }
      // the light on the button's rim follows the pointer
      const b = btnRef.current;
      if (b) {
        b.style.setProperty("--mx", `${s.vp.x * 100}%`);
        b.style.setProperty("--my", `${s.vp.y * 100}%`);
        b.style.setProperty("--glow", String(0.25 + clamp(s.speed) * 0.55 + s.jump * 0.3));
      }
      if (warp) warp.render({ W, H: BH, dpr, t: s.t, speed: s.speed, vp: s.vp, jump: s.jump });
      else if (ctx && stars) {
        if (cv.width !== Math.round(W * dpr)) {
          cv.width = Math.round(W * dpr);
          cv.height = Math.round(BH * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#05060f";
        ctx.fillRect(0, 0, W, BH);
        const cx = s.vp.x * W,
          cy = s.vp.y * BH;
        for (const st of stars) {
          st.z -= dt * (0.04 + s.speed * 0.9);
          if (st.z < 0.02) {
            st.z = 1;
            st.a = Math.random() * Math.PI * 2;
          }
          const r0 = (40 * (0.3 + st.k)) / st.z;
          const r1 = r0 * (1 + s.speed * 0.25);
          ctx.strokeStyle = `rgba(200,220,255,${clamp(1.2 - st.z)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(st.a) * r0, cy + Math.sin(st.a) * r0);
          ctx.lineTo(cx + Math.cos(st.a) * r1 + 0.5, cy + Math.sin(st.a) * r1);
          ctx.stroke();
        }
        if (s.jump > 0.01) {
          ctx.fillStyle = `rgba(230,240,255,${s.jump * 0.8})`;
          ctx.fillRect(0, 0, W, BH);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      warp?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, reduce]);

  // ── autoplay: a pointer wanders in, lingers, presses ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let raf = 0;
    const t0 = performance.now();
    let pressedAt = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touched.current) return;
      const s = sim.current;
      const t = ((now - t0) / 1000) % 9;
      s.hover = t > 1 && t < 5.2;
      s.vpT = { x: 0.5 + Math.sin(now / 900) * 0.28, y: 0.5 + Math.sin(now / 1300) * 0.25 };
      if (t > 4.6 && t < 5 && pressedAt < 0 && phaseRef.current === "idle") {
        pressedAt = now;
        void go(false);
      }
      if (t < 1) pressedAt = -1;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  return (
    <div ref={rootRef} className={`w-full max-w-[440px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-[230px]">
          <div className="text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
          <div className="mt-0.5 flex items-start gap-1 text-[13px] text-[#6e6e73]">
            <svg viewBox="0 0 256 256" className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <path fill="currentColor" d={ICON_BRANCH} />
            </svg>
            {detail}
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium tabular-nums text-[#424245]">Checks passed</div>
      </div>
      <button
        ref={btnRef}
        type="button"
        onClick={() => go(true)}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onKeyDown={onKey}
        onBlur={onLeave}
        disabled={phase === "jump"}
        aria-label={phase === "done" ? `Deployed in ${took.toFixed(1)} seconds` : label}
        className="group relative mt-4 block w-full overflow-hidden rounded-[18px] bg-[#05060f] text-white outline-none focus-visible:shadow-[0_0_0_3px_#0071e3] disabled:cursor-wait"
        style={{ height: BH }}
      >
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.07),inset_0_1px_0_rgba(255,255,255,.1)]" />
        {/* a hairline of light on the rim, brightest nearest the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[18px]"
          style={{
            padding: 1,
            background: "radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(170,200,255,var(--glow,.3)), rgba(170,200,255,0) 70%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <span className="pointer-events-none relative flex h-full flex-col items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "done" ? (
              <motion.span key="done" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex flex-col items-center">
                <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em] sm:text-[22px]">
                  <svg viewBox="0 0 256 256" className="h-6 w-6 text-[#30d158]" aria-hidden="true">
                    <path fill="currentColor" d={ICON_CHECK} />
                  </svg>
                  Live in {took.toFixed(1)} s
                </span>
                <span className="mt-1 text-[13px] text-white/65">production is on the new build</span>
              </motion.span>
            ) : (
              <motion.span key="go" initial={{ opacity: 0 }} animate={{ opacity: phase === "jump" ? 0.85 : 1 }} exit={{ opacity: 0, scale: 1.08 }} className="flex flex-col items-center">
                <span ref={textRef} className="flex items-center gap-2 text-[19px] font-semibold sm:text-[22px] tracking-[-0.02em]" style={{ willChange: "transform" }}>
                  <svg viewBox="0 0 256 256" className="h-6 w-6" aria-hidden="true">
                    <path fill="currentColor" d={ICON_ROCKET} />
                  </svg>
                  {phase === "jump" ? "Deploying" : label}
                </span>
                <span className="mt-1 text-[13px] text-white/60">{phase === "jump" ? "Hold on" : "Hover to spool up, click to jump"}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 text-[12px] text-[#86868b]">
        <span className="whitespace-nowrap">3 files changed, 2 migrations</span>
        <span className="whitespace-nowrap tabular-nums">Last deploy 2 h ago</span>
      </div>
    </div>
  );
}

// ───────────── the starfield, in WebGL ─────────────
const WARP_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const WARP_FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr, uT, uSpeed, uJump;
uniform vec2 uVp;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 vp = uVp * uRes;
  vec2 q = px - vp;
  float r = length(q);
  float th = atan(q.y, q.x);
  float diag = length(uRes);
  float sp = clamp(uSpeed, 0.0, 4.0);
  vec3 col = vec3(0.0);
  // stars travel straight out from the vanishing point, each along its own ray, accelerating as they come near
  // (a star at distance d from you sits at K (1/d - 1) on screen). Each is smeared back to where it was a moment
  // ago, so the streaks are true motion blur: dots when drifting, long lines at warp. Looking up a star by the angle
  // of its ray means a streak is never cut off, however long it gets.
  float K = diag * 0.05;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float N = 70.0 + fi * 31.0;
    float a = (th / 6.28318 + 0.5) * N + fi * 0.37;
    float bin = floor(a);
    float h = hash(vec2(bin, fi));
    if (h < 0.35) continue;
    float h2 = hash(vec2(bin, fi + 9.1)), h3 = hash(vec2(bin, fi + 3.7));
    float off = 0.25 + 0.5 * h2;
    float d = 1.0 - fract(h3 + uT * (0.18 + 0.05 * fi) * (0.7 + 0.6 * h));
    d = max(d, 0.015);
    float rs = K * (1.0 / d - 1.0);
    float rt = K * (1.0 / min(d + 0.006 + sp * 0.11 * (0.6 + 0.4 * h), 1.0) - 1.0);
    float near = 1.0 - d;
    float w = 0.45 + 1.3 * near * near; // px, half-width
    float across = (a - bin - off) / N * 6.28318 * r;
    float lat = exp(-across * across / (w * w));
    if (lat < 0.002) continue;
    // along the streak: brightest at the head, fading toward the tail; and a round head of its own
    float along = clamp((r - rt) / max(rs - rt, 0.001), 0.0, 1.0) * step(rt, r) * step(r, rs);
    float head = exp(-pow((r - rs) / w, 2.0));
    float b = max(pow(along, 1.6), head) * lat;
    float bright = smoothstep(0.08, 0.5, near) * (0.35 + 1.1 * pow(near, 1.4)) * (0.6 + 0.4 * h);
    // a little colour: most stars white, some warm, some blue; at speed the light ahead turns bluer
    vec3 tint = mix(vec3(1.0, 0.86, 0.72), vec3(0.75, 0.85, 1.0), h2);
    tint = mix(tint, vec3(0.62, 0.78, 1.0), clamp(sp * 0.25, 0.0, 0.5) * (1.0 - smoothstep(0.0, diag * 0.45, r)));
    col += tint * b * bright;
  }
  // deep space: soft clouds of colour that drift past slowly
  vec2 nq = (px + (uVp - 0.5) * 40.0) / diag;
  float neb = vnoise(nq * 3.0 + vec2(uT * 0.08, 0.0)) * 0.6 + vnoise(nq * 7.0 - uT * 0.05) * 0.4;
  col += mix(vec3(0.05, 0.03, 0.12), vec3(0.02, 0.06, 0.14), neb) * (0.6 + 0.5 * neb);
  // the vanishing point glows as it speeds up; the jump blooms out from it
  float rn = r / diag;
  col += vec3(0.35, 0.5, 1.0) * exp(-rn * rn * 90.0) * clamp(sp, 0.0, 1.5) * 0.18;
  col += vec3(0.7, 0.82, 1.0) * exp(-rn * rn * mix(40.0, 5.0, uJump)) * uJump * 0.6;
  col += vec3(0.55, 0.65, 0.9) * uJump * 0.18;
  // a vignette, so the edges fall away into the dark
  col *= 1.0 - 0.35 * smoothstep(0.25, 0.75, length((px / uRes - 0.5) * vec2(1.0, 0.8)));
  // filmic tone: bright streaks roll off rather than clip
  col = col / (1.0 + col * 0.6);
  gl_FragColor = vec4(vec3(0.012, 0.014, 0.035) + col, 1.0);
}`;
function makeWarp(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, src: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, src);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, WARP_VS),
    fs = sh(gl.FRAGMENT_SHADER, WARP_FS);
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
  const U = { res: u("uRes"), dpr: u("uDpr"), t: u("uT"), speed: u("uSpeed"), jump: u("uJump"), vp: u("uVp") };
  return {
    render(o: { W: number; H: number; dpr: number; t: number; speed: number; vp: { x: number; y: number }; jump: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.t, o.t);
      gl.uniform1f(U.speed, o.speed);
      gl.uniform1f(U.jump, o.jump);
      gl.uniform2f(U.vp, o.vp.x, o.vp.y);
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
