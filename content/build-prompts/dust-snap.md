# Dust Snap

Add the "Dust Snap" component from Nexus UI to my project.

A word that turns to dust when you snap, the way it happens on film. It shivers; then, from one end, the surface goes dark and grainy in creeping patches and gives way. It does not vanish as smoke: it becomes a dense cloud of dry, earthy specks that holds the word's shape for a beat before a wind carries it off to the right in wisps. Snap again and the dust is drawn back in against the wind, last gone first home. The sound is built from the animation itself: a dry finger snap, crackle and grains that follow the crumbling front, a breath of air that swells and thins with the cloud, and a soft knock when the word is whole again.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DustSnap } from "@/components/dust-snap";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/dust-snap/dust-snap-sound.ts ---

```ts
/**
 * Dust Snap's sound, made with the Web Audio API (no audio files).
 *
 * It is driven by the picture, not by a timer. The component reports what the word is doing on every
 * animation frame and the sound follows it:
 *
 *   the snap      a dry finger snap (a sharp clack, the ring of the hand, a small knock), then a
 *                 tremble of fine rustle for as long as the word shivers
 *   the crumble   as the surface goes dark and grainy it crackles like dry earth, and every speck that
 *                 breaks away is a tiny grain of sound, panned to where the front is crossing the word.
 *                 The more specks leave in a frame, the more grains you hear
 *   the cloud     a soft, gusting breath of air that swells with the cloud and thins as the cloud does,
 *                 drifting to the right with the wind
 *   coming back   the air gathers upward (a rising swell), specks land one by one as light ticks, and
 *                 when the last one is home the word is set down with a soft low knock
 *
 * The component calls `frame()` once per animation frame and `snap()` at the moment of the snap.
 * Browsers only let audio start after a click or key press, so `createDustSound()` is called from one.
 */

export type DustPhase = "whole" | "going" | "gone" | "coming";

export type DustFrame = {
  phase: DustPhase;
  /** Seconds since the last frame. */
  dt: number;
  /** Specks that broke away from the word in this frame. */
  emitted: number;
  /** Specks that reached home in this frame. */
  landed: number;
  /** 0 to 1: how much of the word is dark and grainy right now. */
  ashen: number;
  /** 0 to 1: how much of the dust is in the air, blowing away. */
  airborne: number;
  /** 0 to 1: how much of the dust is flying home right now (the part you can see moving). */
  returning: number;
  /** 0 to 1: how much of the dust has got home so far. */
  home: number;
  /** -1 (left) to 1 (right): where the crumbling or landing is happening. */
  x: number;
};

export type DustSound = {
  /** Called every frame. `on` false fades every continuous layer out (muted, hidden or off screen). */
  frame: (f: DustFrame, on: boolean) => void;
  /** The finger snap. `again` is the second snap, which brings the word back. */
  snap: (again?: boolean) => void;
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

export function createDustSound(volume = 0.7): DustSound | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  let c: AudioContext;
  try {
    c = new Ctor({ latencyHint: "interactive" });
  } catch {
    return null;
  }

  const level = (v: number) => Math.max(0, Math.min(1, v));
  const master = c.createGain();
  master.gain.value = 0.9 * level(volume);
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 4;
  master.connect(comp).connect(c.destination);

  // a short, dry, dark room: dust does not ring
  const bus = c.createGain();
  bus.connect(master);
  const room = c.createConvolver();
  {
    const len = Math.floor(c.sampleRate * 0.9);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * 0.8;
      }
    }
    room.buffer = ir;
  }
  const wet = c.createGain();
  wet.gain.value = 0.16;
  bus.connect(room).connect(wet).connect(master);

  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  {
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  // sparse clicks: when played through a filter they sound like grit shifting, and playing them faster makes more of them
  const gritBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  {
    const d = gritBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0045 ? (Math.random() * 2 - 1) * (0.4 + Math.random() * 0.6) : 0;
  }
  const loopSrc = (buf: AudioBuffer) => {
    const s = c.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.loopStart = 0;
    s.start(0, Math.random() * 1.5);
    return s;
  };
  const panner = (p: number) => {
    if (typeof c.createStereoPanner !== "function") return null;
    const n = c.createStereoPanner();
    n.pan.value = Math.max(-1, Math.min(1, p));
    return n;
  };
  const to = (p: AudioParam, v: number, tc = 0.06) => p.setTargetAtTime(v, c.currentTime, tc);
  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  let closed = false;

  // ── Continuous layers: always running, silent until the picture asks for them ──────────────────
  // grit: the dry crackle of a surface that is going dark and coming apart
  const grit = loopSrc(gritBuf);
  const gritHp = c.createBiquadFilter();
  gritHp.type = "highpass";
  gritHp.frequency.value = 1500;
  const gritLp = c.createBiquadFilter();
  gritLp.type = "lowpass";
  gritLp.frequency.value = 7200;
  const gritG = c.createGain();
  gritG.gain.value = 0;
  const gritPan = panner(0);
  grit.connect(gritHp).connect(gritLp).connect(gritG);
  if (gritPan) gritG.connect(gritPan).connect(bus);
  else gritG.connect(bus);

  // sand: the fine hiss under the crackle, while specks are leaving
  const sand = loopSrc(noiseBuf);
  const sandBp = c.createBiquadFilter();
  sandBp.type = "bandpass";
  sandBp.frequency.value = 3600;
  sandBp.Q.value = 0.6;
  const sandG = c.createGain();
  sandG.gain.value = 0;
  const sandPan = panner(0);
  sand.connect(sandBp).connect(sandG);
  if (sandPan) sandG.connect(sandPan).connect(bus);
  else sandG.connect(bus);

  // air: the breath of the cloud (and, coming back, the swell that gathers it). It gusts slowly
  const air = loopSrc(noiseBuf);
  const airBp = c.createBiquadFilter();
  airBp.type = "bandpass";
  airBp.frequency.value = 600;
  airBp.Q.value = 0.7;
  const airLp = c.createBiquadFilter();
  airLp.type = "lowpass";
  airLp.frequency.value = 2600;
  const airG = c.createGain();
  airG.gain.value = 0;
  const gust = c.createOscillator();
  gust.type = "sine";
  gust.frequency.value = 0.42;
  const gustDepth = c.createGain();
  gustDepth.gain.value = 0.012;
  gust.connect(gustDepth).connect(airG.gain);
  gust.start();
  const airPan = panner(0);
  air.connect(airBp).connect(airLp).connect(airG);
  if (airPan) airG.connect(airPan).connect(bus);
  else airG.connect(bus);

  // a low breath under the air so a big cloud has some weight
  const body = loopSrc(noiseBuf);
  const bodyLp = c.createBiquadFilter();
  bodyLp.type = "lowpass";
  bodyLp.frequency.value = 260;
  const bodyG = c.createGain();
  bodyG.gain.value = 0;
  body.connect(bodyLp).connect(bodyG).connect(bus);

  const layers = [gritG, sandG, airG, bodyG];

  // ── One-shot grains ─────────────────────────────────────────────────────────────────────────────
  const grain = (when: number, freq: number, q: number, dur: number, gain: number, pan: number) => {
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.0012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const p = panner(pan);
    s.connect(bp).connect(g);
    if (p) g.connect(p).connect(bus);
    else g.connect(bus);
    s.start(when, Math.random() * 1.8, dur + 0.02);
  };

  let budget = 0; // grains we may still make this second, so a long crumble cannot flood the audio thread
  let budgetAt = 0;
  const spend = (n: number) => {
    const now = c.currentTime;
    if (now - budgetAt >= 1) {
      budgetAt = now;
      budget = 150;
    }
    const k = Math.min(n, budget);
    budget -= k;
    return k;
  };

  // ── The snap ────────────────────────────────────────────────────────────────────────────────────
  const snapNow = (again: boolean) => {
    if (closed || c.state !== "running") return;
    const t = c.currentTime + 0.004;
    const v = again ? 0.82 : 1;
    // the clack: a hard transient, a few thousandths of a second
    grain(t, 4200, 0.9, 0.028, 0.95 * v, 0);
    // the ring of the hand: two small hollow resonances
    grain(t + 0.002, 2300, 5, 0.085, 0.62 * v, 0.04);
    grain(t + 0.003, 1250, 7, 0.12, 0.34 * v, -0.04);
    // the knock: the finger landing on the palm
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(215, t);
    o.frequency.exponentialRampToValueAtTime(92, t + 0.075);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55 * v, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.16);
    if (!again) {
      // the word shivers: a tremble of fine rustle for as long as it does (0.28 s)
      for (let i = 0; i < 9; i++) {
        grain(t + 0.035 + i * 0.027 + Math.random() * 0.01, 4800 + Math.random() * 2400, 1.6, 0.03, 0.1 + Math.random() * 0.07, (Math.random() - 0.5) * 0.4);
      }
    }
  };

  // a context made on this very click may take a moment to start; the snap plays as soon as it does
  const snap = (again = false) => {
    if (closed) return;
    if (c.state === "running") snapNow(again);
    else void c.resume().then(() => snapNow(again)).catch(() => {});
  };

  // the word is set down: a soft low knock and a puff of fine dust
  const settle = () => {
    if (closed || c.state !== "running") return;
    const t = c.currentTime + 0.01;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(128, t);
    o.frequency.exponentialRampToValueAtTime(66, t + 0.22);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.34);
    grain(t, 1500, 1.2, 0.09, 0.16, 0);
    grain(t + 0.01, 3600, 1, 0.14, 0.07, 0);
  };

  // ── Every frame ─────────────────────────────────────────────────────────────────────────────────
  let prev: DustPhase = "whole";
  let smoothE = 0; // emitted specks per second, smoothed
  let smoothL = 0;
  const frame = (f: DustFrame, on: boolean) => {
    if (closed) return;
    const dt = Math.max(0.001, f.dt);
    const live = on && c.state === "running";
    if (!live) {
      for (const g of layers) to(g.gain, 0, 0.08);
      prev = f.phase;
      return;
    }
    smoothE += (f.emitted / dt - smoothE) * Math.min(1, dt * 7);
    smoothL += (f.landed / dt - smoothL) * Math.min(1, dt * 7);
    // 1 when specks are leaving fast (a few thousand a second at the busiest)
    const busy = clamp(smoothE / 2200);
    const home = clamp(smoothL / 1800);
    const going = f.phase === "going" || f.phase === "gone";
    const coming = f.phase === "coming";
    const pan = clamp(f.x, -0.9, 0.9);

    // the crackle: the surface is dark and grainy, then breaking away. Faster clicks the busier it is
    to(gritG.gain, going ? (0.1 + 0.9 * busy) * 0.2 * (0.5 + 0.5 * f.ashen) : coming ? home * 0.08 : 0, 0.05);
    grit.playbackRate.setTargetAtTime(0.55 + 1.6 * (going ? busy : home), c.currentTime, 0.08);
    to(sandG.gain, going ? busy * 0.085 : coming ? home * 0.03 : 0, 0.06);
    to(sandBp.frequency, 2600 + busy * 1900, 0.1);
    if (gritPan) to(gritPan.pan, pan, 0.05);
    if (sandPan) to(sandPan.pan, pan, 0.05);

    // the cloud: air that swells with it and thins as it thins, leaning right with the wind
    if (going) {
      const a = Math.pow(clamp(f.airborne), 0.8);
      to(airG.gain, a * 0.16, 0.12);
      to(airBp.frequency, 380 + a * 900, 0.2);
      to(bodyG.gain, a * 0.11, 0.15);
      if (airPan) to(airPan.pan, 0.15 + 0.6 * (1 - a * 0.4), 0.3);
    } else if (coming) {
      // gathering back against the wind: the air rises as the dust comes home, and opens as it arrives
      // the swell follows the dust you can see flying, and opens upward as more of it arrives
      const r = Math.pow(clamp(f.returning * 1.8), 1.15);
      const p = clamp(f.home);
      to(airG.gain, r * 0.15, 0.08);
      to(airBp.frequency, 340 + 2100 * Math.pow(p, 1.1), 0.14);
      to(bodyG.gain, r * 0.07, 0.12);
      if (airPan) to(airPan.pan, -0.3 * (1 - p), 0.3);
    } else {
      to(airG.gain, 0, 0.12);
      to(bodyG.gain, 0, 0.12);
    }

    // grains: each speck that breaks away is a tiny tick; the more that leave, the more you hear
    if (going && f.emitted > 0) {
      const n = spend(Math.min(12, Math.round(Math.sqrt(f.emitted) * 0.85)));
      for (let i = 0; i < n; i++) {
        const chunk = Math.random() < 0.07;
        const at = c.currentTime + Math.random() * Math.min(0.03, dt);
        if (chunk) grain(at, 520 + Math.random() * 900, 2.2, 0.03 + Math.random() * 0.03, 0.2 + Math.random() * 0.14, pan + (Math.random() - 0.5) * 0.3);
        else grain(at, 1800 + Math.random() * 5200, 1.4 + Math.random() * 1.6, 0.007 + Math.random() * 0.016, 0.07 + Math.random() * 0.1, pan + (Math.random() - 0.5) * 0.5);
      }
    }
    // coming home: each speck that lands is a lighter, lower tick
    if (coming && f.landed > 0) {
      const n = spend(Math.min(8, Math.round(Math.sqrt(f.landed) * 0.55)));
      for (let i = 0; i < n; i++) {
        const at = c.currentTime + Math.random() * Math.min(0.03, dt);
        grain(at, 900 + Math.random() * 2600, 1.8, 0.012 + Math.random() * 0.014, 0.05 + Math.random() * 0.07, pan + (Math.random() - 0.5) * 0.4);
      }
    }
    if (prev === "coming" && f.phase === "whole") settle();
    prev = f.phase;
  };

  return {
    frame,
    snap,
    wake() {
      if (!closed && c.state === "suspended") void c.resume().catch(() => {});
    },
    awake: () => c.state === "running",
    hush() {
      for (const g of layers) to(g.gain, 0, 0.03);
    },
    setVolume(v: number) {
      to(master.gain, 0.9 * level(v), 0.05);
    },
    close() {
      if (closed) return;
      closed = true;
      for (const g of layers) to(g.gain, 0, 0.02);
      window.setTimeout(() => {
        for (const s of [grit, sand, air, body]) {
          try {
            s.stop();
          } catch {
            /* already stopped */
          }
        }
        try {
          gust.stop();
        } catch {
          /* already stopped */
        }
        void c.close().catch(() => {});
      }, 120);
    },
  };
}
```

--- components/dust-snap/dust-snap.tsx ---

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { createDustSound, type DustFrame, type DustSound } from "./dust-snap-sound";

/* ------------------------------------------------------------------ noise: smooth value noise and its octaves */
const P = new Uint8Array(512);
{
  let s = 1337;
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const h = (a: number, b: number) => P[(P[(a & 255)] + (b & 255)) & 511] / 255;
  const u = fade(xf), v = fade(yf);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v; // 0..1
}
const fbm = (x: number, y: number) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;

/* ------------------------------------------------------------------ timing and feel */
const SPREAD = 1.9; // seconds for the crumbling to cross the word
const ASHEN = 0.5; // how long a patch goes dark and grainy before it gives way
const LIFE = 3.4; // how long a speck lasts on the wind before it has thinned to nothing
const BACK = 1.2; // how long a speck takes to fly home
const PER_CELL = 5; // specks per cell of the word: enough that the cloud is dense, as it is on film

type Rgb = [number, number, number];
interface Look { bg: string; ink: string; ash: Rgb[]; fleck: Rgb[]; film: Rgb[] }
/** The dust is dry and earthy: dark browns, with a few lighter flecks catching the light. */
const LOOKS: Record<"dark" | "light", Look> = {
  light: {
    bg: "#f2f0ec", ink: "#1d1d1f",
    ash: [[42, 35, 30], [56, 46, 38], [32, 28, 25], [70, 57, 46], [26, 23, 21]],
    fleck: [[120, 100, 80], [142, 120, 96]],
    film: [[66, 55, 46], [52, 44, 38], [84, 70, 58]],
  },
  dark: {
    bg: "#0b0b0c", ink: "#f5f5f7",
    ash: [[126, 110, 94], [104, 90, 78], [146, 128, 110], [88, 76, 66], [116, 102, 88]],
    fleck: [[196, 178, 154], [176, 158, 136]],
    film: [[140, 124, 106], [118, 104, 90], [160, 142, 122]],
  },
};

/* ------------------------------------------------------------------ sound plumbing: when the picture may make noise */
function useDustAudio(enableSound: boolean, volume: number, inViewRef: RefObject<boolean>, engaged: RefObject<boolean>) {
  const autoOk = useAutoplaySoundAllowed();
  const cfg = useRef({ enableSound, volume, autoOk });
  const eng = useRef<DustSound | null>(null);
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
    /** Whether the word may make sound right now: asked for, switched on, on screen, and used or allowed to demo. */
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
      eng.current = createDustSound(cfg.current.volume);
      eng.current?.wake();
    };
    return {
      wake,
      /** Once per animation frame, with what the word is doing. */
      frame(f: DustFrame) {
        const live = on();
        if (live && !eng.current) wake(false);
        const e = eng.current;
        if (e) e.frame(f, live && e.awake());
      },
      snap(again: boolean) {
        if (!on()) return;
        wake(false);
        eng.current?.snap(again);
      },
      /** Off screen or unmounted: let go of the continuous layers. */
      idle() {
        eng.current?.hush();
      },
    };
  }, [inViewRef, engaged]);
}

/**
 * DustSnap: a word that turns to dust when you snap, the way it happens on film. A moment after the snap the word
 * shivers; then, starting from one end, the surface goes dark and grainy in creeping patches and gives way. It does
 * not vanish as smoke: it becomes a dense cloud of dry, earthy specks that holds the word's shape for a beat, then a
 * wind from the left picks it up and carries it off to the right in wisps, thinning as it goes, a few light flecks catching
 * the light. Snap again and the dust is drawn back in against the wind, last gone first home, landing dark before its colour returns.
 *
 * `text` is the word. `theme` is "light" (dark dust on a pale ground, as in the film) or "dark". `enableSound` plays a
 * dry finger snap, then crackle, grains and a breath of air that follow the picture frame by frame (it follows the
 * site-wide sound switch, and browsers only allow it after a click). `volume` is 0 to 1. `onChange(gone)` fires when
 * it finishes either way. `autoplay` loops it until the first real interaction. Reduced motion fades instead.
 */
export function DustSnap({ autoplay = false, text = "NexusUI", theme = "light", enableSound = true, volume = 0.7, onChange }: { autoplay?: boolean; text?: string; theme?: "dark" | "light"; enableSound?: boolean; volume?: number; onChange?: (gone: boolean) => void }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"whole" | "going" | "gone" | "coming">("whole");
  const cmd = useRef<null | "snap" | "back">(null);
  const touched = useRef(false);
  const inViewRef = useRef(true);
  const audio = useDustAudio(enableSound, volume, inViewRef, touched);
  const look = LOOKS[theme];

  useEffect(() => {
    const cv = canvas.current, box = wrap.current;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let W = 0, H = 0, dpr = 1, fs = 0;
    // the word as drawn, the word as it stands (cells are cleared as they give way), and the dust layer
    const src = document.createElement("canvas"), stand = document.createElement("canvas"), dust = document.createElement("canvas");
    const sx = src.getContext("2d")!, tx = stand.getContext("2d")!, dx = dust.getContext("2d")!;
    let img: ImageData, buf: Uint32Array;
    // the surface, pixel by pixel: each inked pixel has its own moment to go dark and grainy and its own moment to give way
    let simg: ImageData, sbuf: Uint32Array;
    let pIdx: Uint32Array, pInk: Uint32Array, pAsh: Uint32Array, pDark: Float32Array, pGone: Float32Array, pHome: Float32Array;
    let backAt = 0;
    // what the sound listens to: how much of the word is dark and grainy, and how many specks left the word or came home
    let ashenFrac = 0, leftN = 1, landedAcc = 0, panX = 0;
    // cells of the word
    let C = 0, step = 1.6;
    let cx: Float32Array, cy: Float32Array, ct: Float32Array;
    // specks
    let n = 0;
    let cid: Uint32Array, x: Float32Array, y: Float32Array, vx: Float32Array, vy: Float32Array, t0: Float32Array;
    let size: Float32Array, weight: Float32Array, life: Float32Array, bright: Float32Array, ang: Float32Array, spin: Float32Array;
    let fx: Float32Array, fy: Float32Array, rt: Float32Array, col: Uint32Array, state: Uint8Array;
    let mode: "whole" | "going" | "gone" | "coming" = "whole";
    let clock = 0, last = performance.now(), maxT = 0, shudder = 0, midX = 0, midY = 0;

    const pack = (r: number, g: number, b: number, a: number) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

    const layout = () => {
      const r = box.getBoundingClientRect();
      W = Math.max(280, Math.round(r.width)); H = Math.round(Math.min(320, Math.max(200, W * 0.4)));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [cv, src, stand, dust]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      cv.style.height = `${H}px`;
      fs = Math.min(150, W / (text.length * 0.62));
      sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sx.clearRect(0, 0, W, H);
      sx.fillStyle = look.ink;
      sx.textAlign = "center";
      sx.textBaseline = "middle";
      const setFont = () => {
        sx.font = `700 ${fs}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
        (sx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${-fs * 0.035}px`;
      };
      setFont();
      // fit the word to the card with room for the dust to drift, whatever the width
      const tw = sx.measureText(text).width;
      if (tw > W * 0.8) { fs *= (W * 0.8) / tw; setFont(); }
      sx.fillText(text, W / 2, H / 2 - fs * 0.06);
      tx.setTransform(1, 0, 0, 1, 0, 0);
      tx.clearRect(0, 0, stand.width, stand.height);
      tx.drawImage(src, 0, 0);
      img = dx.createImageData(dust.width, dust.height);
      buf = new Uint32Array(img.data.buffer);
      simg = tx.createImageData(stand.width, stand.height);
      sbuf = new Uint32Array(simg.data.buffer);
      sample();
      mode = "whole"; setPhase("whole");
    };

    const sample = () => {
      step = Math.max(1.4, Math.min(2.2, fs / 68));
      const data = sx.getImageData(0, 0, src.width, src.height).data;
      const cells: [number, number][] = [];
      const cw = step * dpr;
      for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) {
        // keep the cell if any of its pixels has ink, so no outline is left behind
        let hit = false;
        const px0 = Math.floor(xx * dpr), py0 = Math.floor(yy * dpr);
        for (let oy = 0; oy < cw && !hit; oy++) for (let ox = 0; ox < cw && !hit; ox++) {
          const px = px0 + ox, py = py0 + oy;
          if (px < src.width && py < src.height && data[(py * src.width + px) * 4 + 3] > 6) hit = true;
        }
        if (hit) cells.push([xx + step / 2, yy + step / 2]);
      }
      C = cells.length;
      cx = new Float32Array(C); cy = new Float32Array(C); ct = new Float32Array(C);
      let minX = 1e9, maxX = -1e9, sumY = 0;
      for (const [a, b] of cells) { minX = Math.min(minX, a); maxX = Math.max(maxX, a); sumY += b; }
      midX = (minX + maxX) / 2; midY = sumY / Math.max(1, C);
      let s = 99;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      maxT = 0;
      for (let i = 0; i < C; i++) {
        const [a, b] = cells[i];
        cx[i] = a; cy[i] = b;
        // it starts at the far end and creeps back across the word, in ragged patches rather than a straight line
        const across = 1 - (a - minX) / Math.max(1, maxX - minX);
        const patch = fbm(a / 34, b / 34);
        ct[i] = Math.max(0, (across * 0.66 + patch * 0.55 - 0.14) * SPREAD + rnd() * 0.06);
        maxT = Math.max(maxT, ct[i]);
      }
      // every inked pixel follows the same patchy front as the cells, with its own grain so the edge is crumbly, not stepped
      const PW = src.width;
      const ink: number[] = [];
      for (let k = 0; k < data.length / 4; k++) if (data[k * 4 + 3] > 6) ink.push(k);
      const m = ink.length;
      pIdx = new Uint32Array(ink); pInk = new Uint32Array(m); pAsh = new Uint32Array(m);
      pDark = new Float32Array(m); pGone = new Float32Array(m); pHome = new Float32Array(m);
      for (let j = 0; j < m; j++) {
        const k = ink[j], al = data[k * 4 + 3];
        const a = (k % PW) / dpr, b = Math.floor(k / PW) / dpr;
        pInk[j] = pack(data[k * 4], data[k * 4 + 1], data[k * 4 + 2], al);
        const across = 1 - (a - minX) / Math.max(1, maxX - minX);
        const tt = Math.max(0, (across * 0.66 + fbm(a / 34, b / 34) * 0.55 - 0.14) * SPREAD + rnd() * 0.1);
        pGone[j] = tt;
        // it darkens in grains, not as a wash: some grains turn early, most just before the patch goes
        const g = rnd();
        pDark[j] = tt - ASHEN * (0.15 + g * g * 0.85) * (0.6 + noise(a / 9, b / 9) * 0.8);
        const grain = noise(a / 2.2, b / 2.2) * 0.6 + rnd() * 0.4;
        const f = look.film[Math.min(look.film.length - 1, Math.floor(grain * look.film.length))];
        const sh = 0.82 + rnd() * 0.3;
        pAsh[j] = pack(Math.min(255, f[0] * sh) | 0, Math.min(255, f[1] * sh) | 0, Math.min(255, f[2] * sh) | 0, al);
        // on the way back it lands when its dust does (last gone, first home), dark at first, then its colour returns
        pHome[j] = (maxT - tt) * 0.5 + BACK * 0.92;
      }
      n = C * PER_CELL;
      cid = new Uint32Array(n); x = new Float32Array(n); y = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); t0 = new Float32Array(n);
      size = new Float32Array(n); weight = new Float32Array(n); life = new Float32Array(n); bright = new Float32Array(n); ang = new Float32Array(n); spin = new Float32Array(n);
      fx = new Float32Array(n); fy = new Float32Array(n); rt = new Float32Array(n); col = new Uint32Array(n); state = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const c = i % C;
        cid[i] = c;
        // the specks of a cell give way a beat apart, so a patch crumbles rather than lifting off in one piece
        t0[i] = ct[c] + rnd() * 0.18;
        const shard = rnd() < 0.05;
        size[i] = shard ? 2 + rnd() * 1.6 : 0.7 + rnd() * rnd() * 1.3;
        weight[i] = shard ? 1.5 + rnd() * 0.6 : 0.55 + rnd() * 0.9; // heavier specks fall sooner
        life[i] = LIFE * (0.45 + rnd() * 0.75);
        bright[i] = 0.78 + rnd() * 0.22;
        ang[i] = rnd() * Math.PI;
        spin[i] = shard ? (rnd() - 0.5) * 10 : 0;
        const fleck = rnd() < 0.09;
        const [r, g, b] = fleck ? look.fleck[Math.floor(rnd() * look.fleck.length)] : look.ash[Math.floor(rnd() * look.ash.length)];
        col[i] = pack(r, g, b, 255);
      }
    };

    // the word as it stands at this moment, written pixel by pixel
    const paintSurface = (going: boolean) => {
      sbuf.fill(0);
      const t = clock;
      let pending = 0, ash = 0;
      for (let j = 0; j < pIdx.length; j++) {
        let v = 0;
        if (going) {
          if (t < pDark[j]) v = pInk[j];
          else if (t < pGone[j]) { v = pAsh[j]; ash++; }
        } else {
          // coming back: what never left stays; what left returns when its dust arrives
          if (pGone[j] > backAt) v = pInk[j];
          else if (t >= pHome[j] + 0.45 + (j % 7) * 0.03) v = pInk[j];
          else if (t >= pHome[j]) { v = pAsh[j]; pending++; }
          else pending++;
        }
        if (v) sbuf[pIdx[j]] = v;
      }
      tx.putImageData(simg, 0, 0);
      ashenFrac = going ? ash / Math.max(1, pIdx.length) : 0;
      return pending;
    };
    const resetSurface = () => { tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, stand.width, stand.height); tx.drawImage(src, 0, 0); };

    const snap = () => {
      if (mode !== "whole") return;
      audio.snap(false);
      mode = "going"; setPhase("going"); clock = 0; shudder = 0.28;
      state.fill(0);
    };
    const back = () => {
      if (mode !== "gone" && mode !== "going") return;
      audio.snap(true);
      backAt = mode === "gone" ? 1e9 : clock;
      mode = "coming"; setPhase("coming"); clock = 0;
      // last gone, first home
      for (let i = 0; i < n; i++) {
        fx[i] = x[i]; fy[i] = y[i];
        rt[i] = state[i] === 0 ? -1 : Math.max(0, (maxT - t0[i]) * 0.5 + (i % 11) * 0.008);
      }
      leftN = 1; landedAcc = 0;
      for (let i = 0; i < n; i++) if (rt[i] >= 0) leftN++;
    };

    const move = (i: number, age: number, dt: number, t: number) => {
      // a steady wind from the left picks the dust up and carries it off to the right. It catches the fine dust first and
      // the heavier grains a beat later, gusts in slow waves, and curls it into wisps; a little lift keeps it airborne.
      const sc = 1 / 52;
      const nx = x[i] * sc - t * 0.9, ny = y[i] * sc + t * 0.15;
      const n0 = noise(nx, ny);
      const gx = (noise(nx + 0.05, ny) - n0) / 0.05, gy = (noise(nx, ny + 0.05) - n0) / 0.05;
      const gust = 0.75 + noise(t * 0.7, y[i] / 90) * 0.6;
      const pick = Math.min(1, age * (1.6 / weight[i]));
      const wind = (70 + 70 / weight[i]) * gust * pick;
      vx[i] += (wind + gy * 40 - vx[i]) * 1.6 * dt;
      vy[i] += (-gx * 44 - 13 / weight[i] - vy[i]) * 1.6 * dt;
      x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      ang[i] += spin[i] * dt;
      if (x[i] > W + 12) life[i] = Math.min(life[i], age); // blown off the card
    };

    const plot = (i: number, a: number, s: number) => {
      if (a <= 0.01) return;
      const c = col[i];
      const A = Math.round(Math.min(1, a) * 255);
      const v = ((c & 0x00ffffff) | (A << 24)) >>> 0;
      const px = Math.round(x[i] * dpr), py = Math.round(y[i] * dpr);
      const sp = Math.max(1, Math.round(s * dpr * 0.85));
      const w = dust.width, h = dust.height;
      for (let oy = 0; oy < sp; oy++) {
        const yy = py + oy;
        if (yy < 0 || yy >= h) continue;
        const row = yy * w;
        for (let ox = 0; ox < sp; ox++) { const xx = px + ox; if (xx >= 0 && xx < w) buf[row + xx] = v; }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      clock += dt;
      if (cmd.current === "snap") { cmd.current = null; snap(); }
      if (cmd.current === "back") { cmd.current = null; back(); }

      buf.fill(0);
      const shards: number[] = [];
      let emitted = 0, landed = 0, airN = 0, outN = 0, xs = 0, xn = 0;
      if (mode === "going" || mode === "gone") {
        // the surface darkens and gives way, grain by grain
        if (mode === "going") paintSurface(true);
        let live = 0;
        for (let i = 0; i < n; i++) {
          if (state[i] === 2) continue;
          if (state[i] === 0) {
            if (clock < t0[i]) { live++; continue; }
            state[i] = 1;
            emitted++; xs += cx[cid[i]]; xn++;
            const c = cid[i];
            x[i] = cx[c] + (Math.random() - 0.5) * step * 1.4;
            y[i] = cy[c] + (Math.random() - 0.5) * step * 1.4;
            // a small outward swell from the middle of the word, and a nudge in the direction it was going
            const ox = x[i] - midX, oy = y[i] - midY, ol = Math.hypot(ox, oy) || 1;
            const push = 4 + Math.random() * 12;
            vx[i] = (ox / ol) * push * 0.4 + 10 + (Math.random() - 0.5) * 8;
            vy[i] = (oy / ol) * push * 0.5 - 3 - Math.random() * 5;
          }
          const age = clock - t0[i];
          if (age > life[i]) { state[i] = 2; continue; }
          move(i, age, dt, clock);
          live++; airN++;
          // dense at first, thinning slowly to a haze, and the settled dust fades last
          // thick as it leaves, thinning to nothing as it streams away
          const a = bright[i] * Math.pow(Math.max(0, 1 - age / life[i]), 0.9);
          if (size[i] > 1.9) shards.push(i); else plot(i, a, size[i]);
        }
        if (mode === "going" && !live) { mode = "gone"; setPhase("gone"); onChange?.(true); ashenFrac = 0; }
      } else if (mode === "coming") {
        let out = paintSurface(false);
        for (let i = 0; i < n; i++) {
          if (rt[i] < 0) continue;
          const u = (clock - rt[i]) / BACK;
          if (u < 0) { out++; continue; }
          const c = cid[i];
          if (u >= 1) { rt[i] = -1; state[i] = 0; landed++; landedAcc++; xs += x[i]; xn++; continue; }
          out++; outN++;
          // home along a rising curve, swinging out and settling in, fading in as it comes
          const e = 1 - Math.pow(1 - u, 3);
          const hx = cx[c], hy = cy[c];
          const sw = Math.sin(u * Math.PI) * (14 + (i % 13) * 1.6) * (i % 2 ? 1 : -1);
          const ddx = hx - fx[i], ddy = hy - fy[i];
          const len = Math.hypot(ddx, ddy) || 1;
          x[i] = fx[i] + ddx * e + (-ddy / len) * sw * (1 - u);
          y[i] = fy[i] + ddy * e + (ddx / len) * sw * (1 - u);
          ang[i] += spin[i] * dt * (1 - u);
          const a = Math.min(1, u * 2.2) * bright[i];
          if (size[i] > 1.9) shards.push(i); else plot(i, a, size[i]);
        }
        if (!out) {
          mode = "whole"; setPhase("whole"); onChange?.(false);
          resetSurface();
        }
      }

      // tell the sound what just happened, so it stays in step with the picture
      if (xn) panX += ((xs / xn / Math.max(1, W)) * 2 - 1 - panX) * 0.6;
      const heard: DustFrame = {
        phase: mode, dt, emitted, landed,
        ashen: mode === "going" ? ashenFrac : 0,
        airborne: n ? airN / (n * 0.6) : 0,
        returning: mode === "coming" ? outN / leftN : 0,
        home: mode === "coming" ? landedAcc / leftN : 0,
        x: panX,
      };
      audio.frame(heard);

      // compose: ground, the word as it stands (shivering at the snap), the dust, then the tumbling shards
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = look.bg;
      ctx.fillRect(0, 0, cv.width, cv.height);
      let jx = 0, jy = 0;
      if (shudder > 0) { shudder -= dt; const k = Math.max(0, shudder / 0.28); jx = Math.sin(clock * 97) * 0.7 * dpr * k; jy = Math.cos(clock * 71) * 0.4 * dpr * k; }
      ctx.drawImage(stand, jx, jy);
      dx.putImageData(img, 0, 0);
      ctx.drawImage(dust, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const i of shards) {
        const c = col[i];
        const r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
        const age = mode === "coming" ? 0 : clock - t0[i];
        const a = mode === "coming" ? bright[i] : bright[i] * Math.pow(Math.max(0, 1 - age / life[i]), 0.9);
        // a shard tumbling: a little irregular sliver that narrows and widens as it turns
        const z = size[i], sq = 0.2 + Math.abs(Math.cos(ang[i])) * 0.8, k = (i % 5) / 5;
        ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
        ctx.save();
        ctx.translate(x[i], y[i]);
        ctx.rotate(ang[i] * 0.35 + i);
        ctx.scale(sq, 1);
        ctx.beginPath();
        ctx.moveTo(-z * 0.5, -z * (0.2 + k * 0.3));
        ctx.lineTo(z * (0.4 + k * 0.2), -z * 0.35);
        ctx.lineTo(z * 0.2, z * 0.45);
        ctx.lineTo(-z * 0.35, z * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };

    layout();
    const still = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = look.bg; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(stand, 0, 0); };
    if (reduce) still(); else raf = requestAnimationFrame(frame);
    let rw = box.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => { const w = box.getBoundingClientRect().width; if (Math.abs(w - rw) > 4 && mode === "whole") { rw = w; layout(); if (reduce) still(); } });
    ro.observe(box);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); inViewRef.current = en.isIntersecting; if (en.isIntersecting && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } else audio.idle(); });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); audio.idle(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, theme, reduce, audio]);

  // the demo: snap, let the dust settle, snap again
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1400);
      while (live && !touched.current) {
        cmd.current = "snap";
        await sleep(7000); if (!live || touched.current) break;
        cmd.current = "back";
        await sleep(4800);
      }
    })();
    return () => { live = false; };
  }, [autoplay, reduce]);

  const gone = phase === "gone" || phase === "going";
  const press = () => {
    touched.current = true;
    audio.wake(true);
    if (reduce) { audio.snap(gone); setPhase(gone ? "whole" : "gone"); onChange?.(!gone); return; }
    cmd.current = gone ? "back" : "snap";
  };
  const dark = theme === "dark";

  return (
    <div className="w-full max-w-[760px] select-none overflow-hidden rounded-[28px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-30px_rgba(0,0,0,.4)]" style={{ background: look.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      <div ref={wrap} className="relative w-full">
        <canvas ref={canvas} onClick={press} className="block w-full cursor-pointer" role="img" aria-label={gone ? `${text}, turned to dust` : text} style={reduce ? { opacity: phase === "gone" ? 0 : 1, transition: "opacity .6s" } : undefined} />
      </div>
      <div className="flex items-center justify-between gap-3 px-6 pb-6">
        <p className={`m-0 text-[12.5px] ${dark ? "text-white/45" : "text-[#86868b]"}`} aria-live="polite">
          {phase === "going" ? "Turning to dust" : phase === "gone" ? "Gone. Snap again to bring it back." : phase === "coming" ? "Coming back" : "Snap to turn it to dust."}
        </p>
        <motion.button
          type="button"
          onClick={press}
          whileTap={{ scale: 0.95 }}
          disabled={phase === "coming"}
          className={`inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium outline-none transition-colors focus-visible:ring-4 disabled:opacity-50 ${dark ? "bg-white text-[#1d1d1f] hover:bg-white/90 focus-visible:ring-white/30" : "bg-[#1d1d1f] text-white hover:bg-black focus-visible:ring-[#1d1d1f]/30"}`}
        >
          {gone ? "Snap again" : "Snap"}
        </motion.button>
      </div>
    </div>
  );
}
```

--- components/dust-snap/index.ts ---

```ts
import type { ComponentProps } from "react";
import { DustSnap } from "./dust-snap";

export { DustSnap };
export type DustSnapProps = ComponentProps<typeof DustSnap>;
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
