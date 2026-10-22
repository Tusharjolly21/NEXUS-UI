import { KEY_SOUND_SLICES } from "./key-sound-slices";

/** The recorded key clicks. Put keys.ogg in public/sounds, or point `src` at your own copy. */
export const DEFAULT_KEY_SOUND_SRC = "/sounds/keys.ogg";

type AudioContextCtor = typeof AudioContext;

// One context and one decoded buffer per file, shared by every keyboard on the page.
let context: AudioContext | null = null;
const files = new Map<string, Promise<ArrayBuffer | null>>();
const decoding = new Map<string, Promise<AudioBuffer | null>>();
const buffers = new Map<string, AudioBuffer>();

function audioCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ?? null;
}

/** Created inside a press so the browser lets it start. */
function liveContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    if (!context || context.state === "closed") context = new Ctor({ latencyHint: "interactive" });
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/**
 * Touch screens only let audio start on the finger lifting, not landing. Call this from
 * pointerup so the next press is heard straight away.
 */
export function unlockKeySound() {
  liveContext();
}

/** Downloads the file once. Cheap to call; no audio context is created. */
export function fetchKeySound(src: string = DEFAULT_KEY_SOUND_SRC): Promise<ArrayBuffer | null> {
  let p = files.get(src);
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    files.set(src, p);
  }
  return p;
}

/**
 * Downloads and decodes the clicks so the first press is in time. Decodes with an
 * OfflineAudioContext, which needs no user gesture, so it is safe on hover or focus.
 */
export function primeKeySound(src: string = DEFAULT_KEY_SOUND_SRC): Promise<AudioBuffer | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  // Once the page has had a click or key press, an audio context may start freely, so build
  // it now rather than inside the first press (building one costs tens of milliseconds).
  const activation = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (activation?.hasBeenActive) liveContext();
  let p = decoding.get(src);
  if (!p) {
    p = fetchKeySound(src).then(async (data) => {
      if (!data) return null;
      const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
      if (!Offline) return null;
      try {
        const decoder = new Offline(2, 1, 44100);
        const buf = await decoder.decodeAudioData(data.slice(0));
        buffers.set(src, buf);
        return buf;
      } catch {
        return null;
      }
    });
    decoding.set(src, p);
  }
  return p;
}

/**
 * Plays the click for a KeyboardEvent.code (for example "KeyA", "Space", "Enter") right now.
 * Returns false when the recording is not ready yet (or failed to load), so the caller can
 * fall back to a synthesised click. Call it from the press handler itself (pointerdown or
 * keydown), never later, or it drifts out of sync with the key.
 */
export function playKeySound(code: string, options: { src?: string; volume?: number } = {}): boolean {
  const src = options.src ?? DEFAULT_KEY_SOUND_SRC;
  const buf = buffers.get(src);
  if (!buf) {
    void primeKeySound(src);
    return false;
  }
  const ctx = liveContext();
  if (!ctx) return false;
  const slice = KEY_SOUND_SLICES[code] ?? KEY_SOUND_SLICES.KeyA;
  try {
    const node = ctx.createBufferSource();
    node.buffer = buf;
    // A hair of pitch variation so fast typing does not sound like a loop.
    node.playbackRate.value = 0.97 + Math.random() * 0.06;
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, options.volume ?? 0.6));
    node.connect(gain);
    gain.connect(ctx.destination);
    node.start(0, slice[0] / 1000, slice[1] / 1000);
    return true;
  } catch {
    return false;
  }
}

/** A short synthesised tick for the moment before the recording has loaded. */
export function playKeyTick(volume = 0.6) {
  const ctx = liveContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const len = Math.ceil(ctx.sampleRate * 0.03);
    const noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.5, t);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctx.destination);
    src.start(t);
  } catch {
    // Audio is a nicety; never break typing over it.
  }
}
