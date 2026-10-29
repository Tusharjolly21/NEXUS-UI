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
