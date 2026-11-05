# Piano Text

Add the "Piano Text" component from Nexus UI to my project.

Piano Text: words you can play. Every letter is a key, climbing a scale from the first letter to the last. Glide the pointer across the words and each letter you cross plays its note and dances: it's pressed down, springs up, wobbles and lands, while its neighbours sway along and it flashes its colour. The faster you glide, the louder and higher it jumps. The line underneath vibrates like a plucked string where you play, and with sound on it also traces the real waveform. Browsers keep pages silent until a click, so the first click on the words turns sound on with a run up the scale. On touch screens, drag a finger along the words. Keyboard: focus the words and press Enter to turn sound on, Arrow Left or Right to play letter by letter, or type a letter to play it.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PianoText } from "@/components/piano-text";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/piano-text/index.ts ---

```ts
export { PianoText } from "./piano-text";
export type { PianoScale, PianoTextProps } from "./piano-text";
```

--- components/piano-text/piano-text.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  speaker_2_fill: "<path fill=\"currentColor\" d=\"M26 49.451c1.581 0 2.721-1.163 2.721-2.721V9.637c0-1.558-1.14-2.86-2.767-2.86c-1.14 0-1.907.511-3.14 1.674l-10.256 9.698a.9.9 0 0 1-.604.209H5.046C1.768 18.358 0 20.148 0 23.637v9.023c0 3.489 1.767 5.28 5.047 5.28h6.907c.232 0 .441.07.604.209l10.256 9.79c1.116 1.047 2.046 1.512 3.186 1.512m22.489-4.744c.906.604 2.023.372 2.674-.558c3.07-4.28 4.837-9.977 4.837-15.93c0-5.977-1.744-11.675-4.837-15.954c-.674-.907-1.768-1.14-2.674-.535c-.884.605-1.024 1.744-.326 2.744c2.535 3.721 4.093 8.605 4.093 13.744c0 5.14-1.512 10.07-4.117 13.745c-.65 1-.534 2.14.35 2.744m-9.28-6.28c.791.559 1.93.373 2.605-.534c1.814-2.442 2.907-6.024 2.907-9.675c0-3.65-1.116-7.209-2.907-9.697c-.674-.907-1.79-1.093-2.605-.535c-1.023.674-1.14 1.86-.395 2.883c1.349 1.814 2.163 4.582 2.163 7.35s-.86 5.534-2.186 7.371c-.698 1-.582 2.14.418 2.838\"/>",
  speaker_slash_fill: "<path fill=\"currentColor\" d=\"M39.18 33.402V8.207c0-1.57-1.149-2.883-2.79-2.883c-1.148 0-1.921.516-3.163 1.688l-9.61 9.093c-.14.141-.281.235-.445.282l-.938.07Zm7.593 16.57c.727.704 1.875.704 2.555 0c.703-.726.727-1.85 0-2.554L9.203 7.293a1.84 1.84 0 0 0-2.578 0c-.68.68-.68 1.875 0 2.555Zm-10.336-1.64c1.383 0 2.344-.82 2.649-2.203l-27.68-27.633c-.75.89-1.172 2.18-1.172 3.82v9.094c0 3.516 1.781 5.32 5.086 5.32h6.961c.235 0 .446.07.586.211l10.36 9.868c1.125 1.054 2.062 1.523 3.21 1.523\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type PianoScale = "major" | "minor" | "pentatonic";

export type PianoTextProps = {
  /** the words; every letter becomes a key, spaces are rests */
  text?: string;
  /** the scale the letters climb, left to right */
  scale?: PianoScale;
  /** MIDI note of the first letter; 60 is middle C */
  root?: number;
  /** a line under the words */
  caption?: string;
  /** called for every note, with the letter's index among the letters and its MIDI note */
  onNote?: (index: number, midi: number) => void;
  /** Demo itself until someone touches it. Off by default. Sound plays once the page has had a click. */
  autoplay?: boolean;
  className?: string;
};

const STEPS: Record<PianoScale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
};
const midiAt = (i: number, scale: PianoScale, root: number) => {
  const s = STEPS[scale];
  return root + Math.floor(i / s.length) * 12 + s[i % s.length];
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// the colour a key flashes, running blue → violet → pink → orange → green along the words
const HUES = ["#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f", "#ff9f0a", "#30d158"];
type RGB = [number, number, number];
function hueAt(t: number): RGB {
  const x = clamp(t) * (HUES.length - 1);
  const i = Math.min(HUES.length - 2, Math.floor(x));
  const f = x - i;
  const p = (h: string, k: number) => parseInt(h.slice(1 + k * 2, 3 + k * 2), 16);
  return [0, 1, 2].map((k) => Math.round(p(HUES[i], k) + (p(HUES[i + 1], k) - p(HUES[i], k)) * f)) as RGB;
}
const INK: RGB = [29, 29, 31];
const rgb = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixInk = (c: RGB, g: number): RGB => [0, 1, 2].map((k) => Math.round(INK[k] + (c[k] - INK[k]) * g)) as RGB;

// ─── The piano ─────────────────────────────────────────────────────────────────
// No samples: each note is six sine partials, slightly stretched like real piano strings and fading faster the
// higher they are, behind a filter that closes as the note dies, plus a tap of noise for the hammer. A short
// generated reverb gives it a room, and an analyser feeds the line under the words.

type AudioCtor = typeof AudioContext;
class Piano {
  ctx: AudioContext;
  master: GainNode;
  wet: GainNode;
  analyser: AnalyserNode;
  noise: AudioBuffer;
  voices: { gain: GainNode; end: number }[] = [];
  constructor() {
    const AC: AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
    const ctx = new AC({ latencyHint: "interactive" });
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(comp);
    comp.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    // a small room: two seconds of stereo noise, dying away
    const len = Math.round(ctx.sampleRate * 2.2);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        lp = lp * 0.6 + (Math.random() * 2 - 1) * 0.4;
        d[i] = lp * Math.pow(1 - i / len, 3.2);
      }
    }
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.32;
    this.wet.connect(verb);
    verb.connect(this.master);
    this.noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.06), ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = (Math.random() * 2 - 1) * (1 - i / n.length);
  }
  note(midi: number, vel: number) {
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.004;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const dur = clamp(3.4 - (midi - 60) * 0.07, 1.1, 3.8);
    const peak = 0.2 * (0.3 + 0.7 * vel);
    // too many notes ringing: let the oldest go
    this.voices = this.voices.filter((v) => v.end > t);
    while (this.voices.length > 14) {
      const old = this.voices.shift()!;
      old.gain.gain.cancelScheduledValues(t);
      old.gain.gain.setTargetAtTime(0.0001, t, 0.03);
    }
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    out.gain.setTargetAtTime(peak * 0.45, t + 0.005, 0.11); // the quick first drop of a struck string
    out.gain.setTargetAtTime(0.0001, t + 0.3, dur / 4.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.4;
    lp.frequency.setValueAtTime(Math.min(16000, f * (5 + 9 * vel)), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(f * 2.4, 700), t + 1.1);
    lp.connect(out);
    out.connect(this.master);
    out.connect(this.wet);
    const amps = [1, 0.48, 0.26, 0.14, 0.08, 0.045];
    const end = t + dur * 1.25;
    amps.forEach((a, k) => {
      const n = k + 1;
      const o = ctx.createOscillator();
      o.frequency.value = f * n * Math.sqrt(1 + 0.00038 * n * n);
      if (n === 1) o.detune.value = (Math.random() - 0.5) * 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(a, t);
      g.gain.setTargetAtTime(0, t, dur / (2.2 + n * 1.3));
      o.connect(g);
      g.connect(lp);
      o.start(t);
      o.stop(end);
    });
    const ham = ctx.createBufferSource();
    ham.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = Math.min(9000, f * 3.2);
    bp.Q.value = 1.2;
    const hg = ctx.createGain();
    hg.gain.value = 0.05 * vel;
    ham.connect(bp);
    bp.connect(hg);
    hg.connect(out);
    ham.start(t);
    this.voices.push({ gain: out, end });
  }
}

// ─── One letter ────────────────────────────────────────────────────────────────

type LetterApi = { hit: (vel: number, strength?: number, dir?: number) => void; el: HTMLSpanElement | null };

function Letter({ ch, color, reduced, register }: { ch: string; color: RGB; reduced: boolean; register: (api: LetterApi | null) => void }) {
  const el = useRef<HTMLSpanElement>(null);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const sy = useMotionValue(1);
  const glow = useMotionValue(0);
  const sx = useTransform(sy, (v) => 1 / Math.sqrt(v)); // keeps its volume as it squashes
  const fill = useTransform(glow, (g) => (g < 0.01 ? "#1d1d1f" : rgb(mixInk(color, g))));
  const shadow = useTransform(glow, (g) => (g < 0.01 ? "0 0 0 transparent" : `0 0 ${Math.round(18 * g)}px ${rgb(color, 0.55 * g)}`));
  const running = useRef<AnimationPlaybackControls[]>([]);

  useEffect(() => {
    const api: LetterApi = {
      el: el.current,
      hit: (vel, strength = 1, dir = Math.random() < 0.5 ? -1 : 1) => {
        const k = strength * (0.5 + 0.5 * vel);
        glow.jump(Math.max(glow.get(), strength));
        running.current.forEach((c) => c.stop());
        running.current = [animate(glow, 0, { duration: 1.5, ease: [0.2, 0.6, 0.35, 1] })];
        if (reduced) return;
        // pressed like a key, then it springs up, wobbles and lands
        y.jump(Math.max(y.get(), 0) + 4 * k);
        sy.jump(1 - 0.16 * k);
        running.current.push(
          animate(y, 0, { type: "spring", stiffness: 380, damping: 8.5, velocity: -(520 + 900 * vel) * k }),
          animate(sy, 1, { type: "spring", stiffness: 650, damping: 11 }),
          animate(rotate, 0, { type: "spring", stiffness: 260, damping: 7, velocity: dir * (280 + 420 * vel) * k }),
        );
      },
    };
    register(api);
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <motion.span
      ref={el}
      aria-hidden="true"
      className="relative inline-block origin-bottom will-change-transform"
      style={{ y, rotate, scaleY: sy, scaleX: sx, color: fill, textShadow: shadow }}
    >
      {ch}
    </motion.span>
  );
}

// ─── The line under the words ──────────────────────────────────────────────────
// It vibrates like a string where each key is struck, and, with sound on, also traces the real waveform.

type Pluck = { x: number; t0: number; amp: number };
type Ring = { x: number; y: number; t0: number; color: string; size: number };

const STOP = Symbol("stop");

/**
 * Piano Text: words you can play.
 * Every letter is a key, climbing a scale from the first letter to the last. Glide the pointer across the words
 * and each letter you cross plays its note and dances: it's pressed down, springs up, wobbles and lands, while
 * its neighbours sway along and it flashes its colour. The faster you glide, the louder and higher it jumps.
 * The line underneath vibrates like a plucked string where you play, and with sound on it also traces the real
 * waveform. Browsers keep pages silent until a click, so the first click on the words turns sound on with a run
 * up the scale. On touch screens, drag a finger along the words.
 * Keyboard: focus the words and press Enter to turn sound on, Arrow Left or Right to play letter by letter, or
 * type a letter to play it.
 */
export function PianoText({
  text = "Click to hear music",
  scale = "major",
  root = 60,
  caption = "Glide across the letters. Each one is a key.",
  onNote,
  autoplay = false,
  className = "",
}: PianoTextProps) {
  const reduced = !!useReducedMotion();
  const piano = useRef<Piano | null>(null);
  const [sound, setSound] = useState<"locked" | "on" | "muted">("locked");
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const stageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letters = useRef<(LetterApi | null)[]>([]);
  const boxes = useRef<{ l: number; r: number; t: number; b: number; cx: number }[]>([]);
  const lastHit = useRef<number[]>([]);
  const plucks = useRef<Pluck[]>([]);
  const rings = useRef<Ring[]>([]);
  const lineY = useRef(0);
  const raf = useRef(0);
  const cursor = useRef(-1);
  const hintId = useId();

  // words → letters, keeping each word together so lines wrap between words
  const words = useMemo(() => {
    let i = 0;
    return text.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? { space: true as const, w } : { space: false as const, chars: [...w].map((ch) => ({ ch, i: i++ })) }));
  }, [text]);
  const count = useMemo(() => [...text].filter((c) => !/\s/.test(c)).length, [text]);
  const colors = useMemo(() => Array.from({ length: count }, (_, i) => hueAt(count > 1 ? i / (count - 1) : 0)), [count]);

  // ─── measuring the keys ───
  const measure = useCallback(() => {
    const st = stageRef.current;
    if (!st) return;
    const sb = st.getBoundingClientRect();
    boxes.current = letters.current.map((a) => {
      // measure the layout box, not the dancing transform
      const e = a?.el;
      if (!e) return { l: 0, r: 0, t: 0, b: 0, cx: 0 };
      const r = { left: e.offsetLeft, top: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight };
      let p = e.offsetParent as HTMLElement | null;
      let ox = 0;
      let oy = 0;
      while (p && p !== st && st.contains(p)) {
        ox += p.offsetLeft;
        oy += p.offsetTop;
        p = p.offsetParent as HTMLElement | null;
      }
      const l = r.left + ox;
      const t = r.top + oy;
      return { l, r: l + r.w, t, b: t + r.h, cx: l + r.w / 2 };
    });
    const tr = textRef.current?.getBoundingClientRect();
    lineY.current = tr ? tr.bottom - sb.top + 20 : 0;
    const cv = canvasRef.current;
    if (cv) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(st.clientWidth * dpr);
      cv.height = Math.round(st.clientHeight * dpr);
    }
  }, []);
  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, [measure, text]);

  // ─── drawing the string and the rings ───
  const scope = useRef<Float32Array<ArrayBuffer> | null>(null);
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = cv.width / Math.max(1, cv.clientWidth);
    const W = cv.clientWidth;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, cv.clientHeight);
    const now = performance.now();
    plucks.current = plucks.current.filter((p) => now - p.t0 < 2200);
    rings.current = rings.current.filter((r) => now - r.t0 < 700);
    const bx = boxes.current;
    const x0 = bx.length ? Math.min(...bx.map((b) => b.l)) : 0;
    const x1 = bx.length ? Math.max(...bx.map((b) => b.r)) : W;
    const y = lineY.current;
    // the real waveform, when there is sound
    const an = piano.current && soundRef.current === "on" ? piano.current.analyser : null;
    let energy = 0;
    if (an) {
      if (!scope.current || scope.current.length !== an.fftSize) scope.current = new Float32Array(an.fftSize);
      an.getFloatTimeDomainData(scope.current);
      for (let i = 0; i < scope.current.length; i += 8) energy = Math.max(energy, Math.abs(scope.current[i]));
    }
    const live = plucks.current.length > 0 || energy > 0.004;
    const last = plucks.current[plucks.current.length - 1];
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    HUES.forEach((h, i) => grad.addColorStop(i / (HUES.length - 1), h));
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = live ? grad : "rgba(29,29,31,.14)";
    ctx.globalAlpha = live ? 0.75 : 1;
    ctx.beginPath();
    const n = Math.max(2, Math.round((x1 - x0) / 3));
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      let dy = 0;
      for (const p of plucks.current) {
        const age = (now - p.t0) / 1000;
        const env = Math.exp(-age * 3.2) * Math.exp(-(((x - p.x) / 70) ** 2));
        dy += p.amp * env * Math.sin(age * 38 + (x - p.x) * 0.045);
      }
      if (an && scope.current) dy += scope.current[Math.floor((k / n) * (scope.current.length - 1))] * 34;
      // pinned at both ends, like a string
      const pin = Math.sin((Math.PI * k) / n);
      const yy = y + dy * pin;
      if (k === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    // a ring of sound off each key
    for (const r of rings.current) {
      const u = (now - r.t0) / 700;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4 + r.size * (1 - Math.pow(1 - u, 3)), 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.5 * (1 - u);
      ctx.lineWidth = 1.5 * (1 - u) + 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    raf.current = live || rings.current.length || last ? requestAnimationFrame(draw) : 0;
  }, []);
  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [draw]);
  useEffect(() => {
    kick();
    return () => cancelAnimationFrame(raf.current);
  }, [kick]);

  // ─── playing ───
  const play = useCallback(
    (i: number, vel: number, dir?: number) => {
      if (i < 0 || i >= count) return;
      const now = performance.now();
      if (now - (lastHit.current[i] ?? 0) < 60) return;
      lastHit.current[i] = now;
      const midi = midiAt(i, scale, root);
      letters.current[i]?.hit(vel, 1, dir);
      // neighbours sway along, a beat late
      [-2, -1, 1, 2].forEach((d) => {
        const j = i + d;
        if (j < 0 || j >= count) return;
        setTimeout(() => letters.current[j]?.hit(vel * 0.6, Math.abs(d) === 1 ? 0.3 : 0.12, dir), Math.abs(d) * 45);
      });
      const b = boxes.current[i];
      if (b) {
        plucks.current.push({ x: b.cx, t0: now, amp: 2 + 5 * vel });
        if (!reduced) rings.current.push({ x: b.cx, y: b.t + (b.b - b.t) * 0.18, t0: now, color: rgb(colors[i]), size: 14 + 14 * vel });
      }
      kick();
      if (soundRef.current === "on" && piano.current) piano.current.note(midi, vel);
      onNote?.(i, midi);
    },
    [count, scale, root, colors, reduced, kick, onNote],
  );

  const unlock = useCallback(async () => {
    try {
      if (!piano.current) piano.current = new Piano();
      if (piano.current.ctx.state !== "running") await piano.current.ctx.resume();
      return piano.current.ctx.state === "running";
    } catch {
      return false;
    }
  }, []);
  /** the first click: sound on, and a run up the scale to say so */
  const waking = useRef(false);
  const wake = useCallback(async () => {
    if (soundRef.current !== "locked" || waking.current) return;
    waking.current = true;
    const ok = await unlock();
    waking.current = false;
    if (!ok || soundRef.current !== "locked") return;
    setSound("on");
    soundRef.current = "on";
    for (let i = 0; i < count; i++) setTimeout(() => play(i, 0.45, 1), i * 48);
  }, [unlock, count, play]);

  const toggle = async () => {
    if (sound === "locked") return wake();
    if (sound === "on") return setSound("muted");
    if (await unlock()) setSound("on");
  };

  // ─── the pointer ───
  const track = useRef<{ i: number; x: number; t: number } | null>(null);
  const indexAt = (x: number, y: number) => {
    const bx = boxes.current;
    for (let i = 0; i < bx.length; i++) {
      const b = bx[i];
      if (y >= b.t - 8 && y <= b.b + 8 && x >= b.l && x < b.r) return i;
    }
    return -1;
  };
  const local = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const glide = (x: number, y: number) => {
    const now = performance.now();
    const i = indexAt(x, y);
    const prev = track.current;
    const speed = prev ? Math.abs(x - prev.x) / Math.max(1, now - prev.t) : 0;
    const vel = clamp(0.25 + speed / 2.2);
    const dir = prev ? Math.sign(x - prev.x) || 1 : 1;
    if (i >= 0 && (!prev || prev.i !== i)) {
      const bx = boxes.current;
      // crossed several keys between two events: play the ones in between too, so a fast glide never skips
      if (prev && prev.i >= 0 && Math.abs(bx[prev.i].t - bx[i].t) < 4) {
        const step = i > prev.i ? 1 : -1;
        for (let j = prev.i + step; j !== i; j += step) play(j, vel, dir);
      }
      play(i, vel, dir);
    }
    track.current = { i: i >= 0 ? i : prev?.i ?? -1, x, t: now };
    if (i < 0 && prev) track.current.i = -1;
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && e.buttons === 0) return;
    const p = local(e);
    glide(p.x, p.y);
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (soundRef.current === "locked") void wake();
    if (e.pointerType === "touch") stageRef.current?.setPointerCapture(e.pointerId);
    track.current = null;
    const p = local(e);
    glide(p.x, p.y);
  };
  const onLeave = () => {
    track.current = null;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (soundRef.current === "locked") return void wake();
      play(Math.max(0, cursor.current), 0.6);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      cursor.current = clamp(cursor.current + (e.key === "ArrowRight" ? 1 : -1), 0, count - 1);
      play(cursor.current, 0.55, e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const chars = [...text].filter((c) => !/\s/.test(c));
      const from = cursor.current + 1;
      const at = [...chars.slice(from), ...chars.slice(0, from)].findIndex((c) => c.toLowerCase() === e.key.toLowerCase());
      if (at >= 0) {
        cursor.current = (from + at) % chars.length;
        play(cursor.current, 0.6);
      }
    }
  };

  // ─── Autoplay: a ghost finger glides across, then picks out a tune; it's audible once the page has had a click ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const inView = useInView(stageRef, { amount: 0.5 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  useEffect(() => {
    if (!autoplay || reduced) return;
    const st = stageRef.current;
    if (!st) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      animate(gs, 1, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    st.addEventListener("pointerdown", onTouch, true);
    st.addEventListener("keydown", onTouch, true);
    // the demo may play sound only after the visitor has clicked somewhere on the page
    const arm = () => {
      if (soundRef.current === "locked")
        void unlock().then((ok) => {
          if (ok && soundRef.current === "locked") setSound("on");
        });
    };
    document.addEventListener("click", arm, { once: true });
    document.addEventListener("keydown", arm, { once: true });
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let last = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - last;
          last = t;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number, e: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease: e, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const follow = () => glide(gx.get(), gy.get());
    // Twinkle, Twinkle, Little Star: a traditional tune, as steps of the scale
    const TUNE = [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0];

    (async () => {
      await wait(700);
      while (alive) {
        const bx = boxes.current;
        if (!bx.length) {
          await wait(500);
          continue;
        }
        const first = bx[0];
        const lastB = bx[bx.length - 1];
        const lineMid = (b: (typeof bx)[number]) => b.t + (b.b - b.t) * 0.55;
        // a glide along the whole line
        gx.set(first.l - 40);
        gy.set(lineMid(first) + 30);
        await run(go, 1, 0.3);
        await Promise.all([run(gx, first.l - 6, 0.35), run(gy, lineMid(first), 0.35)]);
        const off = gx.on("change", follow);
        const offY = gy.on("change", follow);
        await Promise.all([run(gx, lastB.r + 10, 2.1, [0.45, 0.05, 0.55, 0.95]), run(gy, lineMid(lastB), 2.1)]);
        off();
        offY();
        track.current = null;
        await run(go, 0, 0.3);
        await wait(900);
        // then a tune, tapped key by key
        const tune = TUNE.filter((n) => n < count);
        await run(go, 1, 0.25);
        for (const n of tune) {
          if (n < 0) {
            await wait(260);
            continue;
          }
          const b = boxes.current[n];
          await Promise.all([run(gx, b.cx, 0.16, [0.3, 0, 0.3, 1]), run(gy, lineMid(b), 0.16, [0.3, 0, 0.3, 1])]);
          await run(gs, 0.78, 0.06);
          play(n, 0.55);
          await run(gs, 1, 0.1);
          await wait(110);
        }
        await run(go, 0, 0.3);
        await wait(2600);
      }
    })().catch((e) => e !== STOP && console.error(e));

    return () => {
      abort();
      document.removeEventListener("click", arm);
      document.removeEventListener("keydown", arm);
      st.removeEventListener("pointerdown", onTouch, true);
      st.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, count]);

  useEffect(
    () => () => {
      void piano.current?.ctx.close().catch(() => undefined);
    },
    [],
  );

  const label = sound === "locked" ? "Click the words for sound" : sound === "on" ? "Sound on" : "Sound off";

  return (
    <div className={`relative w-full max-w-[920px] rounded-[28px] bg-white px-6 pb-8 pt-12 text-center text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] sm:px-10 ${className}`}>
      <div
        ref={stageRef}
        role="group"
        tabIndex={0}
        aria-label={`${text}. A piano: each letter plays a note.`}
        aria-describedby={hintId}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerLeave={onLeave}
        onClick={() => soundRef.current === "locked" && void wake()}
        onKeyDown={onKey}
        className="relative mx-auto cursor-default select-none rounded-[18px] pb-12 pt-4 outline-none [-webkit-tap-highlight-color:transparent] [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
      >
        <div ref={textRef} className="relative z-10 text-[clamp(42px,8.2vw,92px)] font-semibold leading-[1.04] tracking-[-0.045em] [text-wrap:balance]">
          {words.map((w, k) =>
            w.space ? (
              <span key={k}> </span>
            ) : (
              <span key={k} className="inline-block whitespace-nowrap">
                {w.chars.map(({ ch, i }) => (
                  <Letter
                    key={i}
                    ch={ch}
                    color={colors[i]}
                    reduced={reduced}
                    register={(api) => {
                      letters.current[i] = api;
                    }}
                  />
                ))}
              </span>
            ),
          )}
          <span className="sr-only">{text}</span>
        </div>
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
        {/* ghost finger for the self-demo */}
        <motion.span
          aria-hidden="true"
          style={{ x: gx, y: gy, scale: gs, opacity: go }}
          className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
        />
      </div>
      <p id={hintId} className="m-0 text-[15px] text-[#6e6e73]">
        {caption}
      </p>
      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={sound === "on"}
        whileTap={{ scale: 0.95 }}
        animate={sound === "locked" ? { boxShadow: ["0 0 0 0 rgba(0,113,227,.0)", "0 0 0 6px rgba(0,113,227,.12)", "0 0 0 0 rgba(0,113,227,.0)"] } : { boxShadow: "0 0 0 0 rgba(0,113,227,0)" }}
        transition={sound === "locked" ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] outline-none transition-colors hover:bg-[#ebebef] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
      >
        <span className={sound === "on" ? "text-[#0071e3]" : "text-[#6e6e73]"}>
          <Icon name={sound === "on" ? "speaker_2_fill" : "speaker_slash_fill"} size={15} />
        </span>
        {label}
      </motion.button>
    </div>
  );
}
```
