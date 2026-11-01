/**
 * A tiny sound engine for the animated icons. It has no dependencies: copy this file, sound-kit.ts and the
 * score of every icon you want to hear, and call playIconScore(score). Nothing is downloaded: every sound
 * is synthesised in the browser with the Web Audio API, note by note, against the animation it belongs to.
 */

/** Stretches or squeezes time, so a sound follows the icon's `speed` prop. */
export type ScoreTime = (seconds: number) => number;

/** What every icon's sound file exports. */
export type IconScore = {
  /** How long it plays at normal speed, in seconds. */
  length: number;
  /** How loud it is next to the other icons (measured, so they all sound about equally loud). */
  level: number;
  play: (c: AudioContext, out: AudioNode, t: ScoreTime) => void;
};

const STORAGE_KEY = "nx-icon-sounds";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let enabled: boolean | null = null;
const listeners = new Set<() => void>();

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
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

/** One note: an oscillator with a quick attack and an exponential fade. `to` glides the pitch. */
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };

/** A burst of filtered noise: a click, a rustle, a puff of air. `to` sweeps the filter. */
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
  g.gain.value = 0.0001;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

function load() {
  if (enabled !== null) return;
  enabled = true;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "off") enabled = false;
  } catch {
    // storage is blocked: sounds stay on until switched off for this visit
  }
}

/** Whether icon sounds are on. They are on by default; give visitors a switch (see setIconSoundsEnabled). */
export function getIconSoundsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  load();
  return enabled ?? true;
}

/** Turns icon sounds on or off for this browser. The choice is remembered. */
export function setIconSoundsEnabled(on: boolean) {
  load();
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

/** Calls you back when the switch changes. Returns an unsubscribe function (handy for useSyncExternalStore). */
export function subscribeIconSounds(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Plays an icon's sound. Call it from an event handler (a click, a tap, a key press): browsers only let a page
 * make sound after the visitor has interacted with it.
 *
 * - speed: match the icon's speed prop so picture and sound stay in step.
 * - volume: 0 to 1, on top of the icon's own measured level.
 * - force: play even if the visitor has sounds switched off (for a button whose job is to play the sound).
 */
export function playIconScore(score: IconScore, opts: { speed?: number; volume?: number; force?: boolean } = {}) {
  if (!opts.force && !getIconSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const c = audio();
  if (!c || !master) return;
  const speed = Math.min(4, Math.max(0.25, opts.speed ?? 1));
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, (opts.volume ?? 0.9) * score.level));
  g.connect(master);
  score.play(c, g, (s) => s / speed);
  window.setTimeout(() => g.disconnect(), (score.length / speed + 1.2) * 1000);
}
