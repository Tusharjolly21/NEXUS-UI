# Lit Keyboard

Add the "Lit Keyboard" component from Nexus UI to my project.

A tilted keyboard that lights up under your typing or clicks and fades with a slow afterglow, with a recorded mechanical click on every key. Record a run and replay it with the original timing and sound.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. The code refers to these files in /public: `/sounds/keys.ogg`. Point them at the project's own files (or leave them out if they are optional).
6. Use it like this: `import { LitKeyboard } from "@/components/lit-keyboard";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/lit-keyboard/index.ts ---

```ts
export { LitKeyboard } from "./lit-keyboard";
export type { LitKeyboardProps, LitKeyboardHit } from "./lit-keyboard";
```

--- components/lit-keyboard/lit-keyboard.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_KEY_SOUND_SRC, playKeyTick, useKeySound } from "@/components/key-sound";
import { audioAwake, getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export interface LitKeyboardProps {
  /** Colour a key flashes to when it is pressed. Use a hex colour; the glow adds alpha to it. */
  glow?: string;
  /** Plays a recorded phrase by itself until the user types. */
  autoplay?: boolean;
  /**
   * Plays a key click with every press, click and replayed key. Follows the site-wide sound
   * switch (`ui-sounds`). Autoplay clicks too, once the visitor has used the page.
   */
  enableSound?: boolean;
  /**
   * Recorded Cherry MX clicks, one per key. Put keys.ogg in public/sounds or point this at
   * your own copy. Until it loads, or if it is missing, keys play a short synthesised tick.
   */
  soundSrc?: string;
  /** Click volume, 0 to 1. */
  volume?: number;
}

/** One recorded key press: the key and when it happened (performance.now()). */
export interface LitKeyboardHit {
  key: string;
  t: number;
}

const OFF_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function Key({ k, lit, glow, wide, onDown }: { k: string; lit: number; glow: string; wide?: boolean; onDown: (k: string) => void }) {
  const on = lit > 0;
  return (
    <motion.span
      aria-hidden="true"
      onPointerDown={(e) => {
        if (e.button === 0 && e.isTrusted) onDown(k);
      }}
      className="relative flex h-10 cursor-pointer select-none items-center justify-center rounded-[9px] text-[13px] font-medium uppercase"
      style={{
        width: wide ? 230 : 40,
        backgroundColor: on ? glow : "var(--lk-key)",
        color: on ? "#ffffff" : "var(--lk-ink)",
        boxShadow: on
          ? `0 0px 0 var(--lk-edge-on), 0 0 22px 2px ${glow}88, inset 0 1px 0 rgba(255,255,255,.4)`
          : "0 3px 0 var(--lk-edge), 0 4px 8px -3px rgba(0,0,0,.18), inset 0 1px 0 var(--lk-hi)",
        transition: on
          ? "background-color 50ms linear, color 50ms linear, box-shadow 50ms linear"
          : `background-color .9s ${OFF_EASE}, color .9s ${OFF_EASE}, box-shadow .9s ${OFF_EASE}`,
      }}
      initial={false}
      animate={{ y: on ? 3 : 0 }}
      transition={on ? { duration: 0.05 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {wide ? "" : k}
    </motion.span>
  );
}

/**
 * A tilted keyboard that lights up under your typing, with a soft afterglow.
 * Record a run and replay it with the original timing.
 */
export function LitKeyboard({ glow = "#ff9f0a", autoplay = false, enableSound = true, soundSrc = DEFAULT_KEY_SOUND_SRC, volume = 0.6 }: LitKeyboardProps) {
  const [lit, setLit] = useState<Record<string, number>>({});
  const [text, setText] = useState("");
  const [rec, setRec] = useState<"idle" | "recording" | "playing">("idle");
  const [hasTape, setHasTape] = useState(false);
  const tape = useRef<LitKeyboardHit[]>([]);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const area = useRef<HTMLDivElement>(null);
  const keySound = useKeySound({ enabled: enableSound, src: soundSrc, volume });
  const autoAllowed = useAutoplaySoundAllowed();

  /** The click for a key, played in the same event as the press so it lands with the light. */
  const click = (key: string, auto = false) => {
    if (!enableSound || !getSoundsEnabled()) return;
    // Autoplay stays silent until the browser lets audio start, while the tab is hidden, and where the site mutes demos.
    if (auto && (!autoAllowed || document.hidden || !audioAwake())) return;
    const code = key === "space" ? "Space" : key === "backspace" ? "Backspace" : `Key${key.toUpperCase()}`;
    if (!keySound.play(code)) playKeyTick(volume);
  };

  /** First real input ends the demo. */
  const begin = () => {
    if (touched.current) return;
    touched.current = true;
    timers.current.forEach(clearTimeout);
    setText("");
  };

  const flash = (key: string) => {
    const id = Date.now() + Math.random();
    setLit((l) => ({ ...l, [key]: id }));
    timers.current.push(window.setTimeout(() => setLit((l) => (l[key] === id ? { ...l, [key]: 0 } : l)), 140));
  };

  const press = (raw: string, record = true, sound: boolean | "auto" = false) => {
    const key = raw === " " ? "space" : raw.toLowerCase();
    if (key !== "space" && !/^[a-z]$/.test(key)) return false;
    if (sound) click(key, sound === "auto");
    flash(key);
    setText((t) => (t + (key === "space" ? " " : key)).slice(-34));
    if (record && rec === "recording") tape.current.push({ key: raw, t: performance.now() });
    return true;
  };

  // `sound` is true for a replay the visitor asked for and "auto" for the autoplay demo. The demo types about
  // seven keys a second, so it clicks only on the first letter and the space of each word, not on every key.
  const play = (hits: LitKeyboardHit[], sound: boolean | "auto" = false) => {
    if (!hits.length) return;
    setRec("playing");
    setText("");
    const t0 = hits[0].t;
    hits.forEach((h, i) => {
      const beat = sound !== "auto" || i === 0 || h.key === " " || hits[i - 1].key === " ";
      timers.current.push(window.setTimeout(() => press(h.key, false, beat && sound), h.t - t0));
    });
    timers.current.push(window.setTimeout(() => setRec("idle"), hits[hits.length - 1].t - t0 + 400));
  };

  useEffect(() => {
    if (!autoplay) return;
    const phrase = "motion is a material";
    const demo = () => {
      if (touched.current) return;
      let t = 0;
      play(phrase.split("").map((key) => ({ key, t: (t += 90 + Math.random() * 120) })), "auto");
    };
    const a = window.setTimeout(demo, 700);
    const b = window.setInterval(demo, 5200);
    return () => { clearTimeout(a); clearInterval(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  /** Clicking a key on screen types it, like pressing it. */
  const tapKey = (k: string) => {
    begin();
    press(k === "space" ? " " : k);
  };

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-5 [--lk-deck:#e8e8ed] [--lk-edge-on:#c7c7cc] [--lk-edge:#d2d2d7] [--lk-hi:#ffffff] [--lk-ink:#1d1d1f] [--lk-key:#ffffff] dark:[--lk-deck:#1c1c1e] dark:[--lk-edge-on:#2c2c2e] dark:[--lk-edge:#0b0b0c] dark:[--lk-hi:rgba(255,255,255,.08)] dark:[--lk-ink:#f5f5f7] dark:[--lk-key:#3a3a3c]">
      <div
        ref={area}
        tabIndex={0}
        role="textbox"
        aria-label="Type here to light up the keyboard"
        onPointerDown={() => area.current?.focus()}
        onPointerEnter={keySound.prime}
        onFocus={keySound.prime}
        onPointerUp={keySound.unlock}
        onKeyDown={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          begin();
          if (e.key === "Backspace") { if (!e.repeat) click("backspace"); setText((t) => t.slice(0, -1)); return; }
          if (press(e.key, true, !e.repeat)) e.preventDefault();
        }}
        className="group flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[24px] outline-none"
      >
        <div className="flex h-10 min-w-[260px] items-center justify-center rounded-full bg-white px-5 text-[17px] font-medium tracking-tight text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] group-focus-visible:shadow-[0_0_0_2px_#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:group-focus-visible:shadow-[0_0_0_2px_#0a84ff]">
          <AnimatePresence initial={false}>
            {text.split("").map((c, i) => (
              <motion.span key={`${i}-${c}`} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="whitespace-pre">
                {c}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span className="ml-0.5 h-5 w-[2px] rounded-full" style={{ background: glow }} animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
          {!text && <span className="text-[14px] font-normal text-[#a1a1a6] dark:text-[#8e8e93]">Click here, then type</span>}
        </div>
        <div
          className="rounded-[22px] p-3 shadow-[inset_0_1px_0_#fff,0_30px_50px_-30px_rgba(0,0,0,.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_30px_50px_-30px_rgba(0,0,0,.9)]"
          style={{ background: "var(--lk-deck)", transform: "perspective(900px) rotateX(24deg)", transformOrigin: "50% 100%" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            {ROWS.map((row, r) => (
              <div key={row} className="flex gap-1.5" style={{ paddingLeft: r * 14 }}>
                {row.split("").map((k) => <Key key={k} k={k} lit={lit[k] || 0} glow={glow} onDown={tapKey} />)}
              </div>
            ))}
            <Key k="space" lit={lit.space || 0} glow={glow} wide onDown={tapKey} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            touched.current = true;
            if (rec === "recording") { setRec("idle"); setHasTape(tape.current.length > 0); return; }
            tape.current = [];
            setHasTape(false);
            setText("");
            setRec("recording");
            area.current?.focus();
          }}
          className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:outline-[#0a84ff]"
        >
          <motion.span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30] dark:bg-[#ff453a]" animate={rec === "recording" ? { opacity: [1, 0.2, 1] } : { opacity: 1 }} transition={{ duration: 1, repeat: rec === "recording" ? Infinity : 0 }} />
          {rec === "recording" ? "Stop" : "Record"}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={!hasTape || rec !== "idle"}
          onClick={() => { touched.current = true; play(tape.current); }}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          Replay
        </motion.button>
      </div>
    </div>
  );
}
```

--- components/key-sound/index.ts ---

```ts
export { DEFAULT_KEY_SOUND_SRC, fetchKeySound, primeKeySound, playKeySound, playKeyTick, unlockKeySound } from "./key-sound";
export { useKeySound } from "./use-key-sound";
export type { UseKeySoundOptions } from "./use-key-sound";
export { KEY_SOUND_SLICES } from "./key-sound-slices";
```

--- components/key-sound/key-sound-slices.ts ---

```ts
/**
 * Where each key's click sits in /sounds/keys.ogg: KeyboardEvent.code -> [offset ms, length ms].
 * Every slice starts within 5 ms of the click's attack, so the sound lands with the press.
 * Cut from a Cherry MX Black recording (see public/sounds/README.md).
 */
export const KEY_SOUND_SLICES: Record<string, readonly [number, number]> = {
  Escape: [60.0, 192.6],
  Minus: [312.6, 166.3],
  Equal: [538.9, 144.6],
  Backspace: [743.5, 216.3],
  Tab: [1019.8, 230.7],
  BracketLeft: [1310.5, 155.8],
  BracketRight: [1526.3, 176.6],
  Enter: [1762.9, 233.5],
  ControlLeft: [2056.5, 164.5],
  Semicolon: [2281.0, 184.1],
  Quote: [2525.1, 172.7],
  Backquote: [2757.8, 183.5],
  ShiftLeft: [3001.3, 262.3],
  Backslash: [3323.6, 181.5],
  Comma: [3565.1, 180.4],
  Period: [3805.4, 152.4],
  Slash: [4017.8, 161.9],
  ShiftRight: [4239.7, 270.0],
  AltLeft: [4569.7, 161.1],
  Space: [4790.7, 261.5],
  CapsLock: [5112.3, 217.3],
  F11: [5389.5, 187.0],
  F12: [5636.5, 187.4],
  ControlRight: [5883.9, 163.4],
  AltRight: [6107.3, 143.4],
  MetaLeft: [6310.7, 169.8],
  MetaRight: [6540.4, 144.1],
  ArrowUp: [6744.5, 199.7],
  ArrowLeft: [7004.3, 175.1],
  ArrowRight: [7239.4, 192.1],
  ArrowDown: [7491.5, 157.3],
  Digit1: [7708.8, 190.6],
  Digit2: [7959.5, 185.4],
  Digit3: [8204.9, 199.0],
  Digit4: [8463.9, 183.3],
  Digit5: [8707.1, 153.1],
  Digit6: [8920.3, 185.5],
  Digit7: [9165.8, 163.3],
  Digit8: [9389.0, 159.1],
  Digit9: [9608.1, 165.7],
  Digit0: [9833.9, 154.6],
  KeyQ: [10048.4, 186.8],
  KeyW: [10295.2, 171.9],
  KeyE: [10527.1, 159.1],
  KeyR: [10746.2, 154.5],
  KeyT: [10960.7, 178.6],
  KeyY: [11199.3, 173.7],
  KeyU: [11433.0, 156.3],
  KeyI: [11649.3, 178.7],
  KeyO: [11888.0, 147.7],
  KeyP: [12095.6, 165.2],
  KeyA: [12320.8, 166.9],
  KeyS: [12547.7, 172.1],
  KeyD: [12779.8, 169.0],
  KeyF: [13008.8, 171.2],
  KeyG: [13240.0, 162.0],
  KeyH: [13461.9, 182.8],
  KeyJ: [13704.7, 172.2],
  KeyK: [13937.0, 148.9],
  KeyL: [14145.9, 157.6],
  KeyZ: [14363.5, 159.8],
  KeyX: [14583.2, 150.6],
  KeyC: [14793.9, 185.6],
  KeyV: [15039.5, 179.8],
  KeyB: [15279.3, 210.2],
  KeyN: [15549.5, 176.6],
  KeyM: [15786.1, 182.4],
  F1: [16028.5, 191.3],
  F2: [16279.8, 165.9],
  F3: [16505.7, 154.8],
  F4: [16720.5, 172.7],
  F5: [16953.2, 167.3],
  F6: [17180.4, 207.6],
  F7: [17448.0, 179.1],
  F8: [17687.1, 216.3],
  F9: [17963.4, 179.1],
  F10: [18202.4, 204.8],
};
```

--- components/key-sound/key-sound.ts ---

```ts
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
```

--- components/key-sound/use-key-sound.ts ---

```ts
"use client";

import * as React from "react";
import { getSoundsEnabled } from "@/lib/ui-sounds";
import { DEFAULT_KEY_SOUND_SRC, fetchKeySound, playKeySound, primeKeySound, unlockKeySound } from "./key-sound";

export interface UseKeySoundOptions {
  /** Turns the clicks on or off. */
  enabled?: boolean;
  /** The recorded clicks. An empty string means "no recording". */
  src?: string;
  /** 0 to 1. */
  volume?: number;
}

/**
 * Recorded key clicks for an on-screen keyboard. The file downloads quietly after mount
 * and is decoded on the first hover or focus, so the first press already plays in time.
 */
export function useKeySound({ enabled = true, src = DEFAULT_KEY_SOUND_SRC, volume = 0.6 }: UseKeySoundOptions = {}) {
  const opts = React.useRef({ enabled, src, volume });
  React.useEffect(() => {
    opts.current = { enabled, src, volume };
  });

  React.useEffect(() => {
    if (!enabled || !src) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(() => void fetchKeySound(src)) : window.setTimeout(() => void fetchKeySound(src), 1200);
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (idle && cancel) cancel(t);
      else window.clearTimeout(t);
    };
  }, [enabled, src]);

  /** Call on hover or focus: decodes the clicks ahead of the first press. */
  const prime = React.useCallback(() => {
    const o = opts.current;
    if (o.enabled && o.src) void primeKeySound(o.src);
  }, []);

  /**
   * Plays the click for a KeyboardEvent.code. False means nothing recorded played (so the caller
   * may synthesise one). While the site-wide sound switch is off it plays nothing and returns true.
   */
  const play = React.useCallback((code: string) => {
    const o = opts.current;
    if (!o.enabled || !o.src) return false;
    if (!getSoundsEnabled()) return true;
    return playKeySound(code, { src: o.src, volume: o.volume });
  }, []);

  /** Call on pointerup: lets touch screens start audio. */
  const unlock = React.useCallback(() => {
    if (opts.current.enabled) unlockKeySound();
  }, []);

  return { play, prime, unlock };
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
