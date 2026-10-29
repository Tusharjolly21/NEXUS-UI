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
