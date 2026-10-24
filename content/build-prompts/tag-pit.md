Add the "Tag Pit" component from Nexus UI to my project.

An interests picker where every tag is a physical pill dropped into a tray. Grab and throw the pills, shake the tray, and tap one to pick it so it hops up and lights; Continue unlocks once enough are picked.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `matter-js` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { TagPit } from "@/components/tag-pit";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/tag-pit/index.ts ---

```ts
export { TagPit } from "./tag-pit";
export type { TagPitProps } from "./tag-pit";
```

--- components/tag-pit/tag-pit.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import Matter from "matter-js";
import { useSound, type SoundName } from "@/lib/ui-sounds";

const TAGS = ["Design", "Motion", "Typography", "3D", "Photography", "AI", "Music", "Startups", "Travel", "Coffee", "Gaming", "Writing", "Code", "Film", "Architecture", "Fitness"];
const STEP = 1000 / 60;
const PW = 340, PH = 260, TH = 36;
const SEP = "\u0000";
/** A random kick in [-s/2, s/2]; only ever called from event handlers and timers. */
const jitter = (s: number) => (Math.random() - 0.5) * s;

type PillBody = Matter.Body & { w: number };

export interface TagPitProps {
  /** The interests to pick from. Each one becomes a physical pill in the tray. */
  tags?: string[];
  /** How many picks unlock the Continue button. */
  min?: number;
  /** Colour of picked pills, the picked chips and the Continue button (6-digit hex). */
  accent?: string;
  /** Picks a few tags and shakes the tray by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/**
 * An interests picker where the options are real objects. Tags drop into a
 * tray as physical pills: grab and throw them, shake the tray, tap one to
 * pick it and it hops up and lights. Every pill is still a real button, so
 * keyboard and screen readers get a plain toggle list.
 */
export function TagPit({ tags = TAGS, min = 3, accent = "#0071e3", autoplay = false, enableSound = true }: TagPitProps) {
  const play = useSound(enableSound);
  const pit = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const bodies = useRef<Matter.Body[]>([]);
  const engine = useRef<Matter.Engine | null>(null);
  const grab = useRef<{ c: Matter.Constraint; i: number; x: number; y: number; moved: boolean } | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const pickedRef = useRef<number[]>([]);
  const tray = useAnimationControls();
  const touched = useRef(false);
  const reduce = useReducedMotion();
  const [k, setK] = useState(1);
  // A stable key so an inline `tags` array doesn't rebuild the world on every render.
  const tagKey = tags.join(SEP);

  useEffect(() => {
    const el = pit.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.offsetWidth / PW));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = pit.current;
    if (!el) return;
    const list = tagKey ? tagKey.split(SEP) : [];
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } });
    engine.current = e;
    const wall = { isStatic: true, friction: 0.4, restitution: 0.2 };
    Matter.Composite.add(e.world, [
      Matter.Bodies.rectangle(PW / 2, PH + 30, PW * 2, 60, wall),
      Matter.Bodies.rectangle(-30, PH / 2 - 200, 60, PH + 400, wall),
      Matter.Bodies.rectangle(PW + 30, PH / 2 - 200, 60, PH + 400, wall),
      Matter.Bodies.rectangle(PW / 2, -350, PW * 2, 60, wall),
    ]);
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    bodies.current = list.map((t, i) => {
      const w = Math.ceil(ctx ? ctx.measureText(t).width : t.length * 8) + 34;
      const b = Matter.Bodies.rectangle(w / 2 + 4 + ((i * 97) % (PW - w - 8)), -40 - i * 16, w, TH, { chamfer: { radius: TH / 2 - 0.5 }, restitution: 0.35, friction: 0.3, frictionAir: 0.012, density: 0.002 }) as PillBody;
      Matter.Body.setAngle(b, ((i % 5) - 2) * 0.2);
      b.w = w;
      return b;
    });
    Matter.Composite.add(e.world, bodies.current);

    let raf = 0, acc = 0, last = performance.now();
    let running = false, onScreen = false;
    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      // Fixed 60 Hz steps so slow frames don't turn into slow motion.
      acc += Math.min(100, now - last);
      last = now;
      for (let n = 0; acc >= STEP && n < 4; n++) { Matter.Engine.update(e, STEP); acc -= STEP; }
      if (acc > STEP) acc = 0;
      bodies.current.forEach((b, i) => {
        const pill = els.current[i];
        if (!pill) return;
        const w = (b as PillBody).w;
        pill.style.width = `${w}px`;
        pill.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - TH / 2}px) rotate(${b.angle}rad)`;
      });
    };
    // Only simulate while the tray is on screen and the tab is visible.
    const start = () => {
      if (running || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      grab.current = null;
      Matter.Engine.clear(e);
      Matter.Composite.clear(e.world, false);
      bodies.current = [];
      if (engine.current === e) engine.current = null;
    };
  }, [tagKey]);

  const local = (cx: number, cy: number) => {
    const r = pit.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * PW, y: ((cy - r.top) / r.height) * PH };
  };

  const hop = (i: number, up = true) => {
    const b = bodies.current[i];
    if (!b) return;
    Matter.Body.setVelocity(b, { x: jitter(3), y: up ? -6.5 : -2.5 });
    Matter.Body.setAngularVelocity(b, jitter(0.3));
  };
  const toggle = (i: number, jump = true) => {
    const p = pickedRef.current;
    const on = p.includes(i);
    if (jump) hop(i, !on);
    pickedRef.current = on ? p.filter((x) => x !== i) : [...p, i];
    setPicked(pickedRef.current);
  };
  // Picking a pill pops; putting it back ticks. `say` is play for the visitor's own picks, play.auto for autoplay.
  const cue = (i: number, say: (name: SoundName, volume?: number) => void = play) => (pickedRef.current.includes(i) ? say("tick", 0.5) : say("pop", 0.6));
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  }, [play]);
  const shake = () => {
    if (!reduce) void tray.start({ x: [0, -10, 9, -7, 5, -2, 0], rotate: [0, -1.2, 1, -0.6, 0.4, 0], transition: { duration: 0.6 } });
    bodies.current.forEach((b) => {
      Matter.Body.setVelocity(b, { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 4.5 });
      Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.4);
    });
  };

  const down = (i: number, ev: RPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    const e = engine.current;
    const b = bodies.current[i];
    if (!e || !b) return;
    ev.preventDefault(); // no text selection while dragging
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const p = local(ev.clientX, ev.clientY);
    const c = Matter.Constraint.create({ pointA: p, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.12, damping: 0.08, length: 0 });
    Matter.Composite.add(e.world, c);
    grab.current = { c, i, x: ev.clientX, y: ev.clientY, moved: false };
  };
  const move = (ev: RPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    if (Math.hypot(ev.clientX - g.x, ev.clientY - g.y) > 5) g.moved = true;
    g.c.pointA = local(ev.clientX, ev.clientY);
  };
  const up = () => {
    const g = grab.current;
    if (!g || !engine.current) return;
    Matter.Composite.remove(engine.current.world, g.c);
    grab.current = null;
    if (!g.moved) {
      cue(g.i);
      toggle(g.i);
    }
  };
  // Pointer taps are handled in up(); this catches keyboard and assistive-tech clicks.
  const click = (i: number, e: MouseEvent) => {
    if (e.detail === 0) {
      touched.current = true;
      cue(i);
      toggle(i);
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    const seq = [1, 3, 0, "shake", 5, 1, "shake"] as const;
    let n = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      const s = seq[n++ % seq.length];
      // Reduced motion: still demo the picking, but nothing gets thrown or shaken.
      if (s === "shake") {
        if (!reduce) shake();
      } else {
        cue(s, playRef.current.auto);
        toggle(s, !reduce);
      }
    }, 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const ready = picked.length >= min;
  return (
    <div
      className="w-[380px] max-w-full select-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--tp-pill-bg:#ffffff] [--tp-pill-fg:#1d1d1f] [--tp-pill-shadow:0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:[--tp-pill-bg:#2c2c2e] dark:[--tp-pill-fg:#f5f5f7] dark:[--tp-pill-shadow:0_1px_2px_rgba(0,0,0,.5),0_0_0_1px_rgba(255,255,255,.08)]"
      style={{ "--tp-accent": accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">What are you into?</h3>
          <p className="m-0 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Pick {min} or more. Throw the rest around.</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92, rotate: -8 }}
          onClick={() => { touched.current = true; shake(); }}
          className="flex h-8 flex-none items-center gap-1.5 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M3 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity=".4" /></svg>
          Shake
        </motion.button>
      </div>

      <motion.div
        ref={pit}
        animate={tray}
        className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-[18px] bg-[#f5f5f7] shadow-[inset_0_2px_6px_rgba(0,0,0,.08),inset_0_-1px_0_rgba(255,255,255,.8)] dark:bg-[#000000] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,.6),inset_0_-1px_0_rgba(255,255,255,.06)]"
        style={{ aspectRatio: `${PW} / ${PH}` }}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="group"
        aria-label="Interests"
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: PW, height: PH, transform: `scale(${k})` }}>
          {tags.map((t, i) => {
            const on = picked.includes(i);
            return (
              <button
                key={t}
                ref={(el) => {
                  els.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                onPointerDown={(ev) => down(i, ev)}
                onClick={(ev) => click(i, ev)}
                className="absolute left-0 top-0 flex cursor-grab items-center justify-center whitespace-nowrap rounded-full text-[14px] font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing dark:focus-visible:ring-offset-black"
                style={{
                  height: TH,
                  background: on ? accent : "var(--tp-pill-bg)",
                  color: on ? "#ffffff" : "var(--tp-pill-fg)",
                  boxShadow: on ? `0 6px 16px -6px ${accent}aa, inset 0 1px 0 rgba(255,255,255,.25)` : "var(--tp-pill-shadow)",
                  transform: "translate(-200px,-200px)",
                }}
              >
                {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5 mr-1" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                {t}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex h-7 min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {picked.length === 0 ? (
              <motion.span key="none" className="text-[13px] text-[#86868b] dark:text-[#8e8e93]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Nothing picked yet</motion.span>
            ) : (
              picked.slice(-4).map((i) => (
                <motion.span
                  key={i}
                  layout
                  className="flex-none rounded-full bg-[color-mix(in_srgb,var(--tp-accent)_8%,transparent)] px-2.5 py-1 text-[12px] font-medium text-[var(--tp-accent)] dark:bg-[color-mix(in_srgb,var(--tp-accent)_24%,transparent)] dark:text-[color-mix(in_srgb,var(--tp-accent)_55%,white)]"
                  initial={{ opacity: 0, y: -14, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                >
                  {tags[i]}
                </motion.span>
              ))
            )}
          </AnimatePresence>
          {picked.length > 4 && <span className="flex-none text-[12px] text-[#86868b] dark:text-[#8e8e93]">+{picked.length - 4}</span>}
        </div>
        <motion.button
          type="button"
          disabled={!ready}
          whileTap={ready ? { scale: 0.95 } : undefined}
          className="h-9 flex-none rounded-full bg-[#e8e8ed] px-4 text-[13px] font-semibold text-[#86868b] outline-none transition-[background-color,color] duration-300 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#2c2c2e] dark:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
          style={ready ? { backgroundColor: accent, color: "#ffffff" } : undefined}
        >
          {ready ? "Continue" : `${picked.length}/${min}`}
        </motion.button>
      </div>
    </div>
  );
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
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
