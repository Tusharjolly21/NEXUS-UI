/**
 * The shredder's sound, made with the Web Audio API (no audio files).
 *
 * It is a small engine, not a list of clips, because a shredder is not a click: the motor hums for as
 * long as it runs and the pitch follows its speed, the cutters chew while paper is going through, and
 * the strips rustle as they flutter into the bin. The component calls `frame()` once per animation
 * frame with what the machine is doing right now, so what you hear is always what you see. `hit()`
 * adds the one-off sounds: the motor biting the sheet, the sheet sliding in, the slot arming.
 *
 * Browsers only let audio start after a click or key press, so `createShredderSound()` is called from
 * one (see `wake()`).
 */

export type ShredderFrame = {
  /** 0 to 1: how fast the motor is turning. */
  motor: number;
  /** 1 shredding, -1 running backwards for Undo. */
  dir: number;
  /** 0 to 1: how much paper is in the cutters (0 when the motor runs empty). */
  paper: number;
  /** 0 to 1: how many strips are fluttering down into the bin. */
  rustle: number;
  /** 0 to 1: how far through the sheet the cutters are. Shapes the grind a little. */
  progress: number;
};

export type ShredderHit = "bite" | "bite-reverse" | "arm" | "slide" | "done" | "land";

export type ShredderSound = {
  /** Called every frame. `on` false fades everything out (muted, hidden or off screen). */
  frame: (f: ShredderFrame, on: boolean) => void;
  hit: (name: ShredderHit) => void;
  /** Starts the audio context if the browser put it to sleep. Call from a click or key press. */
  wake: () => void;
  /** Whether the browser lets audio play yet. */
  awake: () => boolean;
  /** Silences everything right now, e.g. when the tab is hidden. */
  hush: () => void;
  setVolume: (v: number) => void;
  close: () => void;
};

type AudioContextCtor = typeof AudioContext;

export function createShredderSound(volume = 0.7): ShredderSound | null {
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
  comp.threshold.value = -16;
  comp.ratio.value = 5;
  master.connect(comp).connect(c.destination);

  // two seconds of noise, looped by every layer that needs it
  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  {
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const noise = () => {
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    s.start(0, Math.random() * 1.5);
    return s;
  };

  // ── Motor: a low saw and square pair with a whine above them ──────────────────────────────
  const motorOut = c.createGain();
  motorOut.gain.value = 0;
  const motorLP = c.createBiquadFilter();
  motorLP.type = "lowpass";
  motorLP.frequency.value = 260;
  motorLP.Q.value = 0.8;
  const saw = c.createOscillator();
  saw.type = "sawtooth";
  const sq = c.createOscillator();
  sq.type = "square";
  sq.detune.value = 9;
  const sqGain = c.createGain();
  sqGain.gain.value = 0.55;
  saw.connect(motorLP);
  sq.connect(sqGain).connect(motorLP);
  motorLP.connect(motorOut).connect(master);
  const whine = c.createOscillator();
  whine.type = "sine";
  const whineGain = c.createGain();
  whineGain.gain.value = 0;
  whine.connect(whineGain).connect(master);
  // a slow wobble so the motor never sounds like a test tone
  const wob = c.createOscillator();
  wob.frequency.value = 6.5;
  const wobDepth = c.createGain();
  wobDepth.gain.value = 1.6;
  wob.connect(wobDepth);
  wobDepth.connect(saw.frequency);
  wobDepth.connect(sq.frequency);
  saw.start();
  sq.start();
  whine.start();
  wob.start();

  // ── Cutters: noise chopped by the teeth passing the paper ────────────────────────────────
  const grindOut = c.createGain();
  grindOut.gain.value = 0;
  const grindBP = c.createBiquadFilter();
  grindBP.type = "bandpass";
  grindBP.frequency.value = 2200;
  grindBP.Q.value = 0.9;
  const teeth = c.createGain();
  teeth.gain.value = 0.5;
  const toothLfo = c.createOscillator();
  toothLfo.type = "sawtooth";
  const toothDepth = c.createGain();
  toothDepth.gain.value = 0.5;
  toothLfo.connect(toothDepth).connect(teeth.gain);
  const grindNoise = noise();
  grindNoise.connect(grindBP).connect(teeth).connect(grindOut).connect(master);
  toothLfo.start();

  // the paper itself tearing: a brighter, rougher layer riding on the cutters
  const tearOut = c.createGain();
  tearOut.gain.value = 0;
  const tearHP = c.createBiquadFilter();
  tearHP.type = "highpass";
  tearHP.frequency.value = 4200;
  const tearAm = c.createGain();
  tearAm.gain.value = 0.6;
  const tearLfo = c.createOscillator();
  tearLfo.type = "square";
  tearLfo.frequency.value = 71;
  const tearDepth = c.createGain();
  tearDepth.gain.value = 0.4;
  tearLfo.connect(tearDepth).connect(tearAm.gain);
  const tearNoise = noise();
  tearNoise.connect(tearHP).connect(tearAm).connect(tearOut).connect(master);
  tearLfo.start();

  // ── Strips fluttering into the bin: soft, uneven dry rustle ──────────────────────────────
  const rustleOut = c.createGain();
  rustleOut.gain.value = 0;
  const rustleBP = c.createBiquadFilter();
  rustleBP.type = "bandpass";
  rustleBP.frequency.value = 5200;
  rustleBP.Q.value = 0.55;
  const rustleAm = c.createGain();
  rustleAm.gain.value = 0.55;
  const rustleLfo = c.createOscillator();
  rustleLfo.type = "triangle";
  rustleLfo.frequency.value = 13;
  const rustleLfo2 = c.createOscillator();
  rustleLfo2.type = "sine";
  rustleLfo2.frequency.value = 4.3;
  const rd = c.createGain();
  rd.gain.value = 0.3;
  const rd2 = c.createGain();
  rd2.gain.value = 0.25;
  rustleLfo.connect(rd).connect(rustleAm.gain);
  rustleLfo2.connect(rd2).connect(rustleAm.gain);
  const rustleNoise = noise();
  rustleNoise.connect(rustleBP).connect(rustleAm).connect(rustleOut).connect(master);
  rustleLfo.start();
  rustleLfo2.start();

  const ramp = (p: AudioParam, v: number, tc = 0.035) => p.setTargetAtTime(v, c.currentTime, tc);
  let closed = false;

  // ── One-offs ─────────────────────────────────────────────────────────────────────────────
  const tone = (freq: number, to: number, decay: number, gain: number, type: OscillatorType = "sine", at = 0) => {
    const t0 = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + decay);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.004 + decay);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + decay + 0.06);
  };
  const burst = (type: BiquadFilterType, from: number, to: number, attack: number, decay: number, gain: number, q = 1, at = 0) => {
    const t0 = c.currentTime + at;
    const n = c.createBufferSource();
    n.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    const g = c.createGain();
    f.type = type;
    f.frequency.setValueAtTime(from, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + attack + decay);
    f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    n.connect(f).connect(g).connect(master);
    n.start(t0, Math.random() * 1.5);
    n.stop(t0 + attack + decay + 0.05);
  };

  const hits: Record<ShredderHit, () => void> = {
    // the sensor sees the sheet and the motor bites: a clunk and a rattle of teeth catching
    bite: () => {
      tone(150, 62, 0.14, 0.5, "triangle");
      burst("lowpass", 1500, 400, 0.002, 0.09, 0.4, 0.8);
      burst("bandpass", 3200, 1800, 0.004, 0.12, 0.2, 1.2, 0.03);
    },
    "bite-reverse": () => {
      tone(210, 110, 0.12, 0.42, "triangle");
      burst("lowpass", 1700, 500, 0.002, 0.08, 0.3, 0.8);
    },
    // the slot lights blue as a file is held over it
    arm: () => tone(1180, 840, 0.05, 0.1, "sine"),
    // the row turns into a sheet and slides to the slot
    slide: () => burst("bandpass", 500, 2600, 0.05, 0.17, 0.2, 0.8),
    // the last of the sheet goes through; the motor rattles empty for a moment
    done: () => {
      tone(110, 52, 0.16, 0.34, "triangle");
      burst("bandpass", 2400, 900, 0.003, 0.1, 0.16, 1.1);
    },
    // Undo: the page comes back out and settles
    land: () => {
      burst("bandpass", 900, 2400, 0.02, 0.1, 0.12, 0.9);
      tone(640, 520, 0.06, 0.1, "sine", 0.06);
    },
  };

  return {
    frame(f, on) {
      if (closed) return;
      const m = on ? Math.max(0, Math.min(1, f.motor)) : 0;
      const back = f.dir < 0;
      const paper = on ? Math.max(0, Math.min(1, f.paper)) * m : 0;
      const rustle = on ? Math.max(0, Math.min(1, f.rustle)) : 0;
      // swell through the middle of the sheet, as more teeth bite at once
      const swell = 0.8 + 0.2 * Math.sin(Math.PI * Math.max(0, Math.min(1, f.progress)));
      // motor: pitch follows speed, lower and heavier while it spins up
      const base = (46 + 58 * m) * (back ? 1.22 : 1);
      ramp(saw.frequency, base, 0.05);
      ramp(sq.frequency, base * 2.002, 0.05);
      ramp(motorLP.frequency, 190 + 420 * m, 0.05);
      ramp(motorOut.gain, 0.2 * m, 0.04);
      ramp(whine.frequency, 340 + 300 * m * (back ? 1.2 : 1), 0.05);
      ramp(whineGain.gain, 0.014 * m, 0.05);
      // cutters
      ramp(toothLfo.frequency, (30 + 34 * m) * (back ? 0.85 : 1), 0.05);
      ramp(grindBP.frequency, (1500 + 1500 * m) * (back ? 0.8 : 1) * (0.9 + 0.2 * swell), 0.05);
      ramp(grindOut.gain, 0.42 * paper * swell, 0.03);
      ramp(tearOut.gain, 0.15 * paper * swell, 0.03);
      ramp(tearLfo.frequency, 55 + 30 * m, 0.05);
      ramp(rustleOut.gain, 0.16 * rustle, 0.06);
    },
    hit(name) {
      if (closed) return;
      hits[name]();
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
      for (const g of [motorOut, whineGain, grindOut, tearOut, rustleOut]) {
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(0, t, 0.015);
      }
    },
    close() {
      if (closed) return;
      closed = true;
      for (const n of [saw, sq, whine, wob, toothLfo, tearLfo, rustleLfo, rustleLfo2, grindNoise, tearNoise, rustleNoise]) {
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
