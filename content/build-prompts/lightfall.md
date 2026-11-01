# Lightfall

Add the "Lightfall" component from Nexus UI to my project.

A WebGL background. Lanes of light pour down a wall, round a cove and run out across a glossy floor towards you, with pulses streaking along every lane and the wall faintly mirrored in the floor. Move over it and the lanes part around your cursor like water around a finger; click, or press Space, to send a surge of light down every lane at once. Three palettes (Dusk, Tide, Ember) ease into each other from a built-in switcher. Until you touch it an invisible hand drifts across it and surges fire on their own. It has its own sound: a slow drone that changes with the palette, a note for each lane your cursor crosses (left to right climbs the scale), a run of notes falling down the wall with every surge, and a sting when you switch palette. Put your own content on top with children.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { Lightfall } from "@/components/lightfall";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/lightfall/index.ts ---

```ts
export { Lightfall } from "./lightfall";
export type { LightfallProps, LightfallMode } from "./lightfall";
```

--- components/lightfall/lightfall-sound.ts ---

```ts
/**
 * Lightfall's sound, made with the Web Audio API (no audio files).
 *
 * It is a small instrument, not a list of clips. The three palettes are three different rooms:
 *
 *   Dusk   glass bells in D Lydian over a warm, slow drone
 *   Tide   water drops in A minor pentatonic over a deep, breathing swell
 *   Ember  soft kalimba plucks in C Phrygian over a low glow with a faint crackle
 *
 * What you hear follows what you see. The lanes are strings: drag across them and each one you cross
 * plucks a note (left to right climbs the scale, faster means louder and a little strummed). The drone
 * brightens and the air opens up where your cursor is, and pans with it. A click or Space sends a surge
 * down every lane, so it is a run of notes falling down the wall, a rush of air, and a swell that
 * arrives with the light at the floor. Switching palette retunes the drone and plays that palette's
 * own sting.
 *
 * The component calls `frame()` once per animation frame with where the cursor is. Browsers only let
 * audio start after a click or key press, so `createLightfallSound()` is called from one (see `wake()`).
 */

export type LightfallSoundMode = "dusk" | "tide" | "ember";

export type LightfallFrame = {
  /** Cursor across the stage, -1 (left) to 1 (right). */
  x: number;
  /** Cursor up the stage, -1 (bottom) to 1 (top). */
  y: number;
  /** 0 to 1: how much the lanes are parting around a cursor right now. */
  presence: number;
  /** The speed multiplier the pulses are travelling at. */
  speed: number;
  mode: LightfallSoundMode;
};

export type LightfallSound = {
  /** Called every frame. `on` false fades everything out (muted, hidden or off screen). */
  frame: (f: LightfallFrame, on: boolean) => void;
  /** A surge of light down every lane: 0 to 1 strength. */
  surge: (strength: number) => void;
  /** The palette changed: retune the drone and play that palette's sting. */
  mode: (m: LightfallSoundMode) => void;
  /** Starts the audio context if the browser put it to sleep. Call from a click or key press. */
  wake: () => void;
  /** Whether the browser lets audio play yet. */
  awake: () => boolean;
  /** Silences the continuous layers right now, e.g. when the tab is hidden. */
  hush: () => void;
  setVolume: (v: number) => void;
  close: () => void;
};

type AudioContextCtor = typeof AudioContext;
type Kind = "glass" | "drop" | "kalimba";

const ROOM: Record<LightfallSoundMode, { root: number; kind: Kind; scale: number[] }> = {
  // D Lydian: bright and open, the raised fourth gives it its shimmer
  dusk: { root: 146.83, kind: "glass", scale: [293.66, 329.63, 369.99, 415.3, 440, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61, 880, 987.77, 1108.73] },
  // A minor pentatonic: no half steps, so every drop sits with every other
  tide: { root: 110, kind: "drop", scale: [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51] },
  // C Phrygian: the flat second is the warm, slightly dark colour
  ember: { root: 130.81, kind: "kalimba", scale: [261.63, 277.18, 311.13, 349.23, 392, 415.3, 466.16, 523.25, 554.37, 622.25, 698.46, 783.99, 830.61, 932.33] },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function createLightfallSound(volume = 0.7): LightfallSound | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  let c: AudioContext;
  try {
    c = new Ctor({ latencyHint: "interactive" });
  } catch {
    return null;
  }

  const level = Math.max(0, Math.min(1, volume));
  const master = c.createGain();
  master.gain.value = 0.9 * level;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master.connect(comp).connect(c.destination);

  // one bus for everything: a dry path and a long, dark-ish room (made from decaying noise)
  const bus = c.createGain();
  bus.connect(master);
  const room = c.createConvolver();
  {
    const len = Math.floor(c.sampleRate * 2.8);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // the tail darkens as it fades: a gentle one-pole low-pass that closes with time
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (0.25 + 0.75 * (1 - t));
      }
    }
    room.buffer = ir;
  }
  const wet = c.createGain();
  wet.gain.value = 0.42;
  bus.connect(room).connect(wet).connect(master);

  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  {
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const noise = (loop = true) => {
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = loop;
    return s;
  };
  const panner = (p: number) => {
    if (typeof c.createStereoPanner !== "function") return null;
    const n = c.createStereoPanner();
    n.pan.value = Math.max(-1, Math.min(1, p));
    return n;
  };
  const ramp = (p: AudioParam, v: number, tc = 0.05) => p.setTargetAtTime(v, c.currentTime, tc);

  let mode: LightfallSoundMode = "dusk";
  let closed = false;

  // ── Drone: a root, a fifth and two detuned octaves, through a low-pass that breathes ────────
  const bedOut = c.createGain();
  bedOut.gain.value = 0;
  const bedLP = c.createBiquadFilter();
  bedLP.type = "lowpass";
  bedLP.frequency.value = 420;
  bedLP.Q.value = 0.7;
  const oRoot = c.createOscillator();
  oRoot.type = "sine";
  const oFifth = c.createOscillator();
  oFifth.type = "sine";
  const fifthG = c.createGain();
  fifthG.gain.value = 0.5;
  const oOct1 = c.createOscillator();
  oOct1.type = "triangle";
  oOct1.detune.value = 7;
  const oOct2 = c.createOscillator();
  oOct2.type = "triangle";
  oOct2.detune.value = -7;
  const octG = c.createGain();
  octG.gain.value = 0.34;
  const tune = (m: LightfallSoundMode, tc: number) => {
    const r = ROOM[m].root;
    ramp(oRoot.frequency, r, tc);
    ramp(oFifth.frequency, r * 1.5, tc);
    ramp(oOct1.frequency, r * 2, tc);
    ramp(oOct2.frequency, r * 2, tc);
  };
  tune(mode, 0.001);
  oRoot.connect(bedLP);
  oFifth.connect(fifthG).connect(bedLP);
  oOct1.connect(octG).connect(bedLP);
  oOct2.connect(octG);
  octG.connect(bedLP);
  bedLP.connect(bedOut).connect(bus);
  // the low-pass slowly opens and closes, so the drone never sits still
  const breath = c.createOscillator();
  breath.frequency.value = 0.11;
  const breathDepth = c.createGain();
  breathDepth.gain.value = 130;
  breath.connect(breathDepth).connect(bedLP.frequency);
  for (const o of [oRoot, oFifth, oOct1, oOct2, breath]) o.start();

  // ── Air: noise that opens where the cursor is and pans with it ──────────────────────────────
  const airOut = c.createGain();
  airOut.gain.value = 0;
  const airBP = c.createBiquadFilter();
  airBP.type = "bandpass";
  airBP.frequency.value = 900;
  airBP.Q.value = 0.9;
  const airNoise = noise();
  const airPan = panner(0);
  airNoise.connect(airBP).connect(airOut);
  if (airPan) airOut.connect(airPan).connect(bus);
  else airOut.connect(bus);
  airNoise.start(0, Math.random() * 1.5);

  // ── Crackle (Ember only): sparse little ticks, like a banked fire ───────────────────────────
  const tick = (at: number, f: number, g: number, pan = 0) => {
    const s = noise(false);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = 2.4;
    const gn = c.createGain();
    gn.gain.setValueAtTime(g, at);
    gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.012 + Math.random() * 0.02);
    s.connect(bp).connect(gn);
    const p = panner(pan);
    if (p) gn.connect(p).connect(bus);
    else gn.connect(bus);
    s.start(at, Math.random() * 1.8);
    s.stop(at + 0.06);
  };

  // ── One note: the timbre depends on the palette ─────────────────────────────────────────────
  let live = 0;
  const note = (freq: number, o: { at?: number; gain?: number; pan?: number; kind?: Kind; long?: number } = {}) => {
    if (live > 18) return;
    const t = c.currentTime + (o.at ?? 0);
    const g = o.gain ?? 0.1;
    const kind = o.kind ?? ROOM[mode].kind;
    const long = o.long ?? 1;
    const out = c.createGain();
    out.gain.value = 1;
    const p = panner(o.pan ?? 0);
    if (p) out.connect(p).connect(bus);
    else out.connect(bus);
    const stops: OscillatorNode[] = [];
    const voice = (type: OscillatorType, f: number, gain: number, attack: number, decay: number, dest: AudioNode = out) => {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      const e = c.createGain();
      e.gain.setValueAtTime(0.0001, t);
      e.gain.linearRampToValueAtTime(gain, t + attack);
      e.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      osc.connect(e).connect(dest);
      osc.start(t);
      osc.stop(t + attack + decay + 0.05);
      stops.push(osc);
      return osc;
    };
    if (kind === "glass") {
      // a struck glass: the fundamental, then inharmonic partials that die faster, a bell not a flute
      voice("sine", freq, g, 0.003, 1.7 * long);
      voice("sine", freq * 2.76, g * 0.28, 0.002, 0.8 * long);
      voice("sine", freq * 5.4, g * 0.1, 0.002, 0.34 * long);
    } else if (kind === "drop") {
      // a water drop: the pitch falls a little as the bubble closes, with a short FM splash on the front
      const carrier = voice("sine", freq, g * 1.1, 0.002, 0.95 * long);
      carrier.frequency.setValueAtTime(freq * 1.06, t);
      carrier.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
      const mod = c.createOscillator();
      mod.type = "sine";
      mod.frequency.value = freq * 2;
      const md = c.createGain();
      md.gain.setValueAtTime(freq * 1.4, t);
      md.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
      mod.connect(md).connect(carrier.frequency);
      mod.start(t);
      mod.stop(t + 0.3);
      stops.push(mod);
      voice("sine", freq * 3, g * 0.12, 0.002, 0.22 * long);
    } else {
      // a kalimba tine: soft triangle through a low-pass that closes, a woody tick on the front
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(3200, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + 0.5);
      lp.connect(out);
      voice("triangle", freq, g * 1.1, 0.004, 0.9 * long, lp);
      voice("sine", freq * 3.01, g * 0.16, 0.002, 0.18 * long, lp);
      tick(t, 3400, g * 0.5, o.pan ?? 0);
    }
    live++;
    const done = stops[0];
    if (done) done.onended = () => { live--; };
    else live--;
  };

  // ── State the frame loop keeps ──────────────────────────────────────────────────────────────
  let lastT = c.currentTime;
  let px = 0;
  let py = 0;
  let velS = 0;
  let lastIdx = -1;
  let lastPluck = 0;
  let nextPulse = 0;
  let nextCrackle = 0;

  const surgeSound = (strength: number) => {
    const s = clamp01(strength);
    const sc = ROOM[mode].scale;
    const t0 = c.currentTime;
    // 1. light falling down the wall (about a second): a run of notes from the top of the scale to the bottom
    const n = 11;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const at = 1.0 * (1 - Math.pow(1 - u, 1.6));
      const idx = sc.length - 1 - Math.round(u * (sc.length - 1));
      note(sc[idx], { at, gain: (0.035 + 0.05 * s) * (0.65 + 0.35 * (1 - u)), pan: Math.sin(i * 1.7) * 0.45 });
    }
    // 2. a rush of air that closes as the front reaches the floor
    {
      const src = noise(false);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(7000, t0);
      bp.frequency.exponentialRampToValueAtTime(520, t0 + 1.7);
      const gn = c.createGain();
      gn.gain.setValueAtTime(0.0001, t0);
      gn.gain.linearRampToValueAtTime(0.1 * s, t0 + 0.35);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.9);
      src.connect(bp).connect(gn).connect(bus);
      src.start(t0, Math.random() * 1.5);
      src.stop(t0 + 2);
    }
    // 3. a chord that swells as the light runs out across the floor towards you, and a soft landing
    const r = ROOM[mode].root;
    for (const m of [2, 3, 4, 5]) {
      const o = c.createOscillator();
      o.type = m === 2 ? "triangle" : "sine";
      o.frequency.value = r * m;
      const e = c.createGain();
      e.gain.setValueAtTime(0.0001, t0 + 0.15);
      e.gain.linearRampToValueAtTime(0.03 * s, t0 + 1.7);
      e.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6);
      o.connect(e).connect(bus);
      o.start(t0 + 0.15);
      o.stop(t0 + 3.7);
    }
    const thump = c.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(r, t0 + 1.8);
    thump.frequency.exponentialRampToValueAtTime(r * 0.5, t0 + 2.15);
    const te = c.createGain();
    te.gain.setValueAtTime(0.0001, t0 + 1.8);
    te.gain.linearRampToValueAtTime(0.2 * s, t0 + 1.83);
    te.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.5);
    thump.connect(te).connect(bus);
    thump.start(t0 + 1.8);
    thump.stop(t0 + 2.6);
  };

  const sting = (m: LightfallSoundMode) => {
    const sc = ROOM[m].scale;
    if (m === "dusk") {
      // two glass bells a fifth apart, then a high shimmer
      note(sc[7], { kind: "glass", gain: 0.12, pan: -0.2, long: 1.2 });
      note(sc[11], { kind: "glass", gain: 0.1, at: 0.09, pan: 0.2, long: 1.2 });
      note(sc[13], { kind: "glass", gain: 0.05, at: 0.2, pan: 0, long: 1.3 });
    } else if (m === "tide") {
      // a big drop, and two small ones a moment behind it
      note(sc[4], { kind: "drop", gain: 0.16, pan: 0.1, long: 1.3 });
      note(sc[9], { kind: "drop", gain: 0.08, at: 0.14, pan: -0.35 });
      note(sc[7], { kind: "drop", gain: 0.06, at: 0.27, pan: 0.4 });
    } else {
      // an ember settling: a low pop, a crackle, then a warm tine
      const t0 = c.currentTime;
      const pop = c.createOscillator();
      pop.type = "sine";
      pop.frequency.setValueAtTime(110, t0);
      pop.frequency.exponentialRampToValueAtTime(52, t0 + 0.14);
      const pe = c.createGain();
      pe.gain.setValueAtTime(0.0001, t0);
      pe.gain.linearRampToValueAtTime(0.22, t0 + 0.006);
      pe.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      pop.connect(pe).connect(bus);
      pop.start(t0);
      pop.stop(t0 + 0.35);
      for (let i = 0; i < 7; i++) tick(t0 + 0.03 + i * 0.045 + Math.random() * 0.03, 1800 + Math.random() * 2600, 0.16, (Math.random() - 0.5) * 1.2);
      note(sc[3], { kind: "kalimba", gain: 0.12, at: 0.16, pan: 0 });
      note(sc[7], { kind: "kalimba", gain: 0.07, at: 0.3, pan: 0.2 });
    }
  };

  return {
    frame(f, on) {
      if (closed) return;
      const now = c.currentTime;
      const dt = Math.min(0.05, now - lastT);
      lastT = now;
      if (f.mode !== mode) {
        mode = f.mode;
        tune(mode, 0.5);
      }
      const pres = on ? clamp01(f.presence) : 0;
      const vel = dt > 0 ? Math.hypot(f.x - px, f.y - py) / dt : 0;
      velS += (vel - velS) * (1 - Math.exp(-dt * 8));
      px = f.x;
      py = f.y;
      const move = clamp01(velS * 0.5);

      // drone and air follow the cursor
      ramp(bedOut.gain, on ? 0.07 : 0, on ? 0.4 : 0.06);
      ramp(bedLP.frequency, 380 + 760 * pres + 300 * move, 0.12);
      ramp(airOut.gain, on ? 0.004 + 0.02 * pres * (0.25 + move) : 0, 0.12);
      ramp(airBP.frequency, 600 + (900 + 2800 * pres) * (0.4 + 0.6 * clamp01((f.y + 1) / 2)), 0.1);
      if (airPan) ramp(airPan.pan, Math.max(-1, Math.min(1, f.x)) * 0.85, 0.1);

      if (!on) {
        lastIdx = -1;
        return;
      }

      // the lanes are strings: each one the cursor crosses plucks a note, left to right climbs the scale
      const sc = ROOM[mode].scale;
      const idx = Math.max(0, Math.min(sc.length - 1, Math.floor(clamp01((f.x + 1) / 2) * sc.length)));
      if (pres < 0.25) lastIdx = -1;
      else {
        if (lastIdx >= 0 && idx !== lastIdx && now - lastPluck > 0.05) {
          lastPluck = now;
          const dir = idx > lastIdx ? 1 : -1;
          // a quick sweep across several strings is strummed: up to three notes, a hair apart
          const steps = Math.min(3, Math.abs(idx - lastIdx));
          for (let i = 1; i <= steps; i++) {
            const k = idx - dir * (steps - i);
            note(sc[k], { at: (i - 1) * 0.022, gain: (0.035 + 0.075 * move) * (0.85 + 0.15 * pres), pan: Math.max(-1, Math.min(1, (k / (sc.length - 1)) * 1.6 - 0.8)) });
          }
        }
        lastIdx = idx;
      }

      // pulses streaking down the lanes: now and then a very quiet high note somewhere in the stage
      if (now > nextPulse) {
        nextPulse = now + (1.2 + Math.random() * 2.2) / Math.max(0.3, f.speed);
        const k = sc.length - 1 - Math.floor(Math.random() * 5);
        note(sc[k], { gain: 0.022 + 0.01 * Math.random(), pan: Math.random() * 1.6 - 0.8, long: 0.8 });
      }
      // Ember also crackles like a banked fire
      if (mode === "ember" && now > nextCrackle) {
        nextCrackle = now + 0.25 + Math.random() * 1.1;
        tick(now, 1600 + Math.random() * 3000, 0.05 + 0.05 * Math.random(), (Math.random() - 0.5) * 1.4);
      }
    },
    surge(strength) {
      if (closed) return;
      surgeSound(strength);
    },
    mode(m) {
      if (closed) return;
      mode = m;
      tune(m, 0.35);
      lastIdx = -1;
      sting(m);
    },
    wake() {
      if (!closed && c.state === "suspended") void c.resume().catch(() => {});
    },
    awake: () => !closed && c.state === "running",
    setVolume(v) {
      if (!closed) ramp(master.gain, 0.9 * Math.max(0, Math.min(1, v)), 0.02);
    },
    hush() {
      if (closed) return;
      const t = c.currentTime;
      for (const g of [bedOut, airOut]) {
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(0, t, 0.015);
      }
    },
    close() {
      if (closed) return;
      closed = true;
      for (const n of [oRoot, oFifth, oOct1, oOct2, breath, airNoise]) {
        try {
          n.stop();
        } catch {
          // already stopped
        }
      }
      void c.close().catch(() => {});
    },
  };
}
```

--- components/lightfall/lightfall.tsx ---

```tsx
"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { createLightfallSound, type LightfallFrame, type LightfallSound } from "./lightfall-sound";

// ─── Palettes ──────────────────────────────────────────────────────────────────

export type LightfallMode = "dusk" | "tide" | "ember";

const MODES: Record<LightfallMode, { label: string; bg: string; haze: string; c: [string, string, string, string] }> = {
  dusk: { label: "Dusk", bg: "#06040d", haze: "#5b3bd6", c: ["#8b5cff", "#ff5fa2", "#ffb35c", "#ffffff"] },
  tide: { label: "Tide", bg: "#02070d", haze: "#1a6fd6", c: ["#1fb6ff", "#2ee6c5", "#6c7bff", "#e8fbff"] },
  ember: { label: "Ember", bg: "#0a0503", haze: "#c2410c", c: ["#ff6a2b", "#ffb000", "#ff3d6e", "#fff1d6"] },
};
const rgb = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

// ─── Scene ─────────────────────────────────────────────────────────────────────
// One path per lane: down the wall, a quarter-round cove, then out across the
// floor towards the camera, fanning wider as it comes. Everything is measured
// in arc length s so pulses travel the bend at the same speed as the straights.

const TOP = 7.2;
const R = 1.7;
const ZW = -6;
const LW = TOP - R;
const LB = (Math.PI * R) / 2;
const LF = 7.6;
const LTOTAL = LW + LB + LF;
const LANES = 140;
const SEG = 96;

const VS = `
attribute vec2 a_v;      // s (0..1 of the whole path), side (-1 or 1)
attribute vec4 a_lane;   // x, seed, speed, pick
uniform mat4 u_vp;
uniform vec2 u_res;
uniform float u_width, u_minw, u_mirror;
uniform vec3 u_cur;      // cursor in NDC, strength
uniform float u_rad;     // parting radius in device px
varying float v_s, v_side, v_fade, v_near;
varying vec4 v_lane;
const float TOP = ${TOP.toFixed(3)};
const float R = ${R.toFixed(3)};
const float ZW = ${ZW.toFixed(3)};
const float LW = ${LW.toFixed(4)};
const float LB = ${LB.toFixed(4)};
const float LT = ${LTOTAL.toFixed(4)};
vec3 path(float s, float x){
  if (s < LW) return vec3(x, TOP - s, ZW);
  s -= LW;
  if (s < LB) { float th = s / R; return vec3(x, R - R * sin(th), ZW + R - R * cos(th)); }
  s -= LB;
  return vec3(x * (1.0 + 0.12 * s), 0.0, ZW + R + s);
}
void main(){
  float s = a_v.x * LT;
  vec3 p = path(s, a_lane.x);
  vec3 q = path(min(LT, s + 0.05), a_lane.x);
  vec3 b = path(max(0.0, s - 0.05), a_lane.x);
  if (u_mirror > 0.5) { p.y = -p.y; q.y = -q.y; b.y = -b.y; }
  vec4 cp = u_vp * vec4(p, 1.0);
  vec4 cq = u_vp * vec4(q, 1.0);
  vec4 cb = u_vp * vec4(b, 1.0);
  vec2 np = cp.xy / cp.w;
  vec2 dir = (cq.xy / cq.w - cb.xy / cb.w) * u_res;
  dir = normalize(dir + vec2(1e-6, 0.0));
  vec2 n = vec2(-dir.y, dir.x);
  // width follows perspective but never drops below a hairline
  float wpx = max(u_minw, u_width * u_res.y * 0.5 / cp.w);
  // the cursor bends the lanes like a soft lens in running water: every lane leans away in
  // proportion to how far it is from the cursor, so there is no hard split down the middle
  vec2 d = (np - u_cur.xy) * u_res * 0.5;
  float f = exp(-dot(d, d) / (u_rad * u_rad)) * u_cur.z;
  float push = dot(d, n) * f * 0.5;
  vec2 offPx = n * (a_v.y * wpx * 0.5 + push);
  gl_Position = vec4((np + offPx / (u_res * 0.5)) * cp.w, cp.z, cp.w);
  v_s = s;
  v_side = a_v.y;
  v_lane = a_lane;
  v_near = f;
  float top = smoothstep(0.0, 1.7, s);
  float sides = 1.0 - smoothstep(3.0, 4.3, abs(a_lane.x));
  float near = smoothstep(LT, LT - 2.2, s);
  float m = 1.0;
  if (u_mirror > 0.5) m = 0.22 * (1.0 - smoothstep(LW + LB - 0.6, LW + LB + 0.4, s)) * smoothstep(LW - 2.0, LW + LB * 0.5, s);
  v_fade = top * mix(1.0, sides, step(s, LW + LB * 0.6)) * near * m;
}`;

const FS = `
precision mediump float;
varying float v_s, v_side, v_fade, v_near;
varying vec4 v_lane;
uniform float u_time, u_glow;
uniform vec3 u_c0, u_c1, u_c2, u_c3;
uniform vec3 u_surge[3];   // start time, strength, unused
float h(float n){ return fract(sin(n * 127.1) * 43758.5453); }
void main(){
  float seed = v_lane.y;
  float speed = v_lane.z;
  float spacing = mix(2.6, 5.2, h(seed * 3.1));
  float q = (v_s - u_time * speed) / spacing + seed * 7.0;
  float id = floor(q);
  float u = fract(q);
  float on = step(0.32, h(id * 1.31 + seed * 13.0));
  float len = mix(0.25, 0.85, h(id * 1.7 + seed));
  float head = smoothstep(1.0, 0.965, u);
  float tail = pow(clamp((u - (1.0 - len)) / len, 0.0, 1.0), 2.2);
  float pulse = on * tail * head;
  float surge = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = u_time - u_surge[i].x;
    if (age > 0.0 && age < 4.0) {
      float front = age * 8.5;
      float g = (v_s - front) / 0.7;
      surge += exp(-g * g) * u_surge[i].y * exp(-age * 0.35);
    }
  }
  float pick = v_lane.w;
  vec3 col = pick < 0.55 ? u_c0 : pick < 0.8 ? u_c1 : pick < 0.93 ? u_c2 : u_c3;
  float prof = u_glow > 0.5 ? exp(-v_side * v_side * 2.2) * 0.16 : exp(-v_side * v_side * 1.6);
  float laneGain = 0.55 + 0.9 * h(seed * 5.3);
  float b = (0.13 + pulse * 1.5) * laneGain + surge * 1.4 + v_near * (0.07 + pulse * 0.5);
  vec3 c = mix(col, vec3(1.0), clamp(pow(pulse, 3.0) * 0.55 + surge * 0.5, 0.0, 1.0)) * b * prof * v_fade;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}`;

function mat4Perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function mat4LookAt(e: number[], c: number[], up: number[]) {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const norm = (a: number[]) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = norm(sub(e, c));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
}
function mul(a: number[], b: number[]) {
  const o = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return o;
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const mk = (t: number, src: string) => {
    const s = gl.createShader(t)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

// ─── Sound ─────────────────────────────────────────────────────────────────────

/**
 * Owns the sound engine for one stage. It is made on the visitor's first click or key press (browsers
 * only allow audio after one), or, for the self-playing demo, once the visitor has used the page and the
 * site lets demos be heard. It follows the site-wide sound switch, and goes quiet when the stage is off
 * screen or the tab is hidden.
 */
function useLightfallAudio(enableSound: boolean, volume: number, inViewRef: RefObject<boolean>, engaged: RefObject<boolean>) {
  const autoOk = useAutoplaySoundAllowed();
  const cfg = useRef({ enableSound, volume, autoOk });
  const eng = useRef<LightfallSound | null>(null);
  const tried = useRef(false);
  useEffect(() => {
    cfg.current = { enableSound, volume, autoOk };
    eng.current?.setVolume(volume);
  }, [enableSound, volume, autoOk]);
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) eng.current?.hush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      eng.current?.close();
      eng.current = null;
      tried.current = false;
    };
  }, []);
  return useMemo(() => {
    /** Whether the stage may make sound right now: asked for, switched on, on screen, and used or allowed to demo. */
    const on = () => {
      const c = cfg.current;
      if (!c.enableSound || !getSoundsEnabled() || document.hidden || !inViewRef.current) return false;
      return engaged.current || c.autoOk;
    };
    const wake = (gesture: boolean) => {
      if (eng.current) {
        eng.current.wake();
        return;
      }
      if (tried.current || !cfg.current.enableSound) return;
      if (!gesture && !navigator.userActivation?.hasBeenActive) return;
      tried.current = true;
      eng.current = createLightfallSound(cfg.current.volume);
      eng.current?.wake();
    };
    return {
      wake,
      /** Once per animation frame, with where the cursor is. */
      frame(f: LightfallFrame) {
        const live = on();
        if (live && !eng.current) wake(false);
        const e = eng.current;
        if (e) e.frame(f, live && e.awake());
      },
      /** The stage is off screen: let go of the drone. */
      idle() {
        eng.current?.hush();
      },
      surge(strength: number) {
        if (!on()) return;
        wake(false);
        const e = eng.current;
        // a context made on this very click may take a moment to start; its notes are queued and play when it does
        e?.surge(strength);
      },
      mode(m: LightfallMode) {
        if (!on()) return;
        wake(false);
        const e = eng.current;
        e?.mode(m);
      },
    };
  }, [inViewRef, engaged]);
}

export interface LightfallProps {
  /** Stage height in px. */
  height?: number;
  /** Starting palette. The built-in switcher can change it afterwards. */
  mode?: LightfallMode;
  /** Pulse speed multiplier. */
  speed?: number;
  /** Until the first touch, an invisible hand drifts across the lanes and surges fire on their own. */
  autoplay?: boolean;
  /** Show the Dusk / Tide / Ember palette switcher. */
  showModes?: boolean;
  /** Plays the sound: a drone and a note for each lane you cross, a falling run of notes on a surge, and a sting when the palette changes. It follows the visitor's sound switch (off until switched on on this site) and starts after the first click or key press. */
  enableSound?: boolean;
  /** How loud the sound is, 0 to 1. */
  volume?: number;
  /** Optional caption under the stage. */
  hint?: ReactNode;
  /** Content layered over the lights. Defaults to a small title; pass `null` for none. */
  children?: ReactNode;
  className?: string;
}

/**
 * Lightfall: a WebGL background. Lanes of light pour down a back wall, round a
 * cove and run out across a glossy floor towards you, pulses streaking along
 * every lane, the wall faintly mirrored in the floor. Move over it and the
 * lanes part around your cursor like water around a finger; click (or press
 * Space) to send a surge of light down every lane at once. Three palettes.
 * Until you touch it, an invisible hand drifts across it and surges fire on
 * their own. Put any content on top with `children`.
 *
 * It has its own sound, made with the Web Audio API (no files): a slow drone
 * that changes with the palette, a note each time the cursor crosses a lane
 * (left to right climbs the scale), a run of notes falling with each surge and a
 * sting when you switch palette. It follows the site-wide sound switch; pass
 * `enableSound={false}` to keep it silent.
 */
export function Lightfall({
  height = 500,
  mode: modeProp = "dusk",
  speed = 1,
  autoplay = true,
  showModes = true,
  enableSound = true,
  volume = 0.7,
  hint,
  children,
  className = "",
}: LightfallProps) {
  const reduce = useReducedMotion();
  const pillId = `lightfall-pill-${useId().replace(/:/g, "")}`;
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.2 });
  const inViewRef = useRef(false);
  const speedRef = useRef(speed);
  const reduceRef = useRef(false);
  const [mode, setMode] = useState<LightfallMode>(modeProp);
  const [prevModeProp, setPrevModeProp] = useState(modeProp);
  if (prevModeProp !== modeProp) {
    setPrevModeProp(modeProp);
    setMode(modeProp);
  }
  const [failed, setFailed] = useState(false);
  const touched = useRef(!autoplay);
  // the visitor has clicked or pressed a key on this stage: it may make sound even where demos are muted
  const engaged = useRef(false);
  const modeRef = useRef(mode);
  const audio = useLightfallAudio(enableSound, volume, inViewRef, engaged);
  const sim = useRef({
    t: 0,
    pal: MODES[modeProp].c.map(rgb),
    target: MODES[modeProp].c.map(rgb),
    cur: { x: 0, y: -0.4, s: 0 },
    want: { x: 0, y: -0.4, s: 0 },
    surges: [-99, 0, 0, -99, 0, 0, -99, 0, 0],
    nextSurge: 0,
    lastAuto: 0,
    cam: 0,
  });

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);
  useEffect(() => {
    speedRef.current = speed;
    reduceRef.current = !!reduce;
  }, [speed, reduce]);
  useEffect(() => {
    touched.current = !autoplay;
  }, [autoplay]);
  useEffect(() => {
    sim.current.target = MODES[mode].c.map(rgb);
    modeRef.current = mode;
  }, [mode]);

  const surge = (strength = 1) => {
    const S = sim.current;
    const i = S.nextSurge % 3;
    S.surges[i * 3] = S.t;
    S.surges[i * 3 + 1] = strength;
    S.nextSurge++;
    audio.surge(strength);
  };

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    // The canvas is created here, not in JSX: releasing a WebGL context for good
    // (so a page of tiles never runs out of them) must not leave a dead canvas
    // behind for a remount, which is what React Strict Mode does in development.
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    mount.appendChild(cv);
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
    const prog = gl ? program(gl, VS, FS) : null;
    if (!gl || !prog) {
      // No WebGL: leave a quiet pinstripe instead of an empty box.
      cv.style.background = `repeating-linear-gradient(90deg, transparent 0 9px, ${MODES[modeProp].c[0]}22 9px 10px)`;
      return () => cv.remove();
    }

    // geometry: every lane is a ribbon of SEG segments; lane data rides on each vertex
    let seed = 99;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const per = (SEG + 1) * 2;
    const verts = new Float32Array(LANES * per * 6);
    const idx = new Uint16Array(LANES * SEG * 6);
    let vi = 0;
    let ii = 0;
    for (let l = 0; l < LANES; l++) {
      const x = -4.3 + ((l + 0.5) / LANES) * 8.6 + (rand() - 0.5) * 0.04;
      const sd = rand();
      const sp = 3.4 + rand() * 1.4;
      const pick = rand();
      for (let k = 0; k <= SEG; k++) {
        const u = k / SEG;
        for (const side of [-1, 1]) {
          verts.set([u, side, x, sd, sp, pick], vi);
          vi += 6;
        }
      }
      const base = l * per;
      for (let k = 0; k < SEG; k++) {
        const a = base + k * 2;
        idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], ii);
        ii += 6;
      }
    }
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.useProgram(prog);
    const aV = gl.getAttribLocation(prog, "a_v");
    const aL = gl.getAttribLocation(prog, "a_lane");
    gl.enableVertexAttribArray(aV);
    gl.vertexAttribPointer(aV, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aL);
    gl.vertexAttribPointer(aL, 4, gl.FLOAT, false, 24, 8);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      vp: U("u_vp"), res: U("u_res"), width: U("u_width"), minw: U("u_minw"), mirror: U("u_mirror"),
      cur: U("u_cur"), rad: U("u_rad"), time: U("u_time"), glow: U("u_glow"), surge: U("u_surge[0]"),
      c: [U("u_c0"), U("u_c1"), U("u_c2"), U("u_c3")],
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    cv.addEventListener("webglcontextlost", onLost);

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    let raf = 0;
    let last = performance.now();
    const S = sim.current;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) {
        audio.idle();
        return;
      }
      const slow = reduceRef.current;
      S.t += dt * speedRef.current * (slow ? 0.18 : 1);

      // palette eases between modes
      const k = 1 - Math.exp(-dt * 4);
      S.pal.forEach((c, i) => c.forEach((_, j) => (c[j] += (S.target[i][j] - c[j]) * k)));

      // invisible hand until the first touch
      if (!touched.current && !slow) {
        const tt = S.t * 0.35;
        S.want.x = Math.sin(tt) * 0.45;
        S.want.y = -0.5 + Math.sin(tt * 1.7) * 0.15;
        S.want.s = 0.8;
        if (S.t - S.lastAuto > 3.6) {
          S.lastAuto = S.t;
          surge(0.9);
        }
      }
      const kc = 1 - Math.exp(-dt * 5.5);
      S.cur.x += (S.want.x - S.cur.x) * kc;
      S.cur.y += (S.want.y - S.cur.y) * kc;
      S.cur.s += (S.want.s - S.cur.s) * (1 - Math.exp(-dt * 4));
      S.cam += (S.cur.x * S.cur.s - S.cam) * (1 - Math.exp(-dt * 1.5));
      audio.frame({ x: S.cur.x, y: S.cur.y, presence: S.cur.s, speed: speedRef.current, mode: modeRef.current });

      const W = cv.width;
      const H = cv.height;
      const aspect = W / H;
      const proj = mat4Perspective((52 * Math.PI) / 180, aspect, 0.1, 60);
      const view = mat4LookAt([S.cam * 0.35, 2.1, 4.4], [0, 1.7, -6], [0, 1, 0]);
      const vp = mul(proj, view);

      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(u.vp, false, new Float32Array(vp));
      gl.uniform2f(u.res, W, H);
      gl.uniform3f(u.cur, S.cur.x, S.cur.y, S.cur.s);
      gl.uniform1f(u.rad, 92 * (W / Math.max(1, cv.clientWidth)));
      gl.uniform1f(u.time, S.t);
      gl.uniform3fv(u.surge, new Float32Array(S.surges));
      S.pal.forEach((c, i) => gl.uniform3f(u.c[i], c[0], c[1], c[2]));
      const dpr = W / Math.max(1, cv.clientWidth);
      const pass = (mirror: number, glow: number) => {
        gl.uniform1f(u.mirror, mirror);
        gl.uniform1f(u.glow, glow);
        gl.uniform1f(u.width, glow ? 0.16 : 0.026);
        gl.uniform1f(u.minw, (glow ? 6 : 1.1) * dpr);
        gl.drawElements(gl.TRIANGLES, LANES * SEG * 6, gl.UNSIGNED_SHORT, 0);
      };
      pass(1, 1);
      pass(1, 0);
      pass(0, 1);
      pass(0, 0);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNdc = (e: RPointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 2 - 1, y: 1 - ((e.clientY - b.top) / b.height) * 2 };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen" && !e.isPrimary) return;
    const p = toNdc(e);
    const S = sim.current;
    S.want.x = p.x;
    S.want.y = p.y;
    S.want.s = 1;
    if (e.pointerType === "mouse") touched.current = true;
  };
  const onLeave = () => {
    if (touched.current) sim.current.want.s = 0;
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    engaged.current = true;
    audio.wake(true);
    const p = toNdc(e);
    Object.assign(sim.current.want, { x: p.x, y: p.y, s: 1 });
    surge(1);
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      touched.current = true;
      engaged.current = true;
      audio.wake(true);
      surge(1);
    }
  };

  const M = MODES[mode];
  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      <div
        ref={stage}
        tabIndex={0}
        role="img"
        aria-label="Lanes of light pouring down a wall and across a floor. Click or press Space to send a surge of light."
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onKeyDown={onKey}
        className="relative w-full cursor-crosshair overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none transition-[background-color] duration-700 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]"
        style={{ height, background: M.bg, touchAction: "pan-y" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(34% 46% at 50% 40%, ${M.haze}55, transparent 70%), radial-gradient(60% 30% at 50% 78%, ${M.haze}26, transparent 70%)` }}
        />
        <div ref={host} aria-hidden="true" className="absolute inset-0" />
        {failed && (
          <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg, transparent 0 9px, ${M.c[0]}22 9px 10px)` }} aria-hidden="true" />
        )}
        {children === undefined ? (
          <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-1.5 sm:left-8 sm:top-7">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">Background</span>
            <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">Lightfall</span>
          </div>
        ) : (
          children
        )}
        {showModes && (
          <div role="radiogroup" aria-label="Palette" className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-[rgba(10,10,18,.6)] p-1 shadow-[0_0_0_1px_rgba(255,255,255,.12)]" onPointerDown={(e) => e.stopPropagation()}>
            {(Object.keys(MODES) as LightfallMode[]).map((m) => {
              const on = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    touched.current = true;
                    engaged.current = true;
                    audio.wake(true);
                    if (m !== mode) audio.mode(m);
                    setMode(m);
                  }}
                  className="relative flex h-8 items-center gap-2 rounded-full border-0 bg-transparent px-2.5 text-[12.5px] font-medium text-white outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-white"
                >
                  {on && <motion.span layoutId={pillId} className="absolute inset-0 rounded-full bg-white/[.16]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative h-3 w-3 rounded-full" style={{ background: `linear-gradient(135deg, ${MODES[m].c[0]}, ${MODES[m].c[1]})`, boxShadow: on ? "0 0 0 2px rgba(255,255,255,.9)" : "0 0 0 1px rgba(255,255,255,.35)" }} />
                  <span className="relative">{MODES[m].label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {hint != null && <p className="m-0 px-1 text-[12.5px] text-[#86868b]">{hint}</p>}
    </div>
  );
}

export default Lightfall;
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
