"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { KeyboardKey } from "./keyboard-key";
import { useKeyboardSound, type SoundType } from "./use-keyboard-sound";
import { useKeySound, DEFAULT_KEY_SOUND_SRC } from "@/components/key-sound";
import { MAC_ROWS, COMPACT_ROWS, CODE_ALIASES, type KeyDef } from "./keyboard-layout";
import { cn } from "@/lib/utils";

export interface KeyboardProps {
  /** Full layout with the Esc and F-key row, or compact without it. */
  layout?: "mac" | "compact";
  /** Plays a key click the moment a key is pressed (not during autoplay). */
  enableSound?: boolean;
  /**
   * Recorded Cherry MX clicks, one per key. Put keys.ogg in public/sounds or point this at
   * your own copy. Until it loads, or if it is missing, keys use the synthesised click.
   * Pass "" to always synthesise.
   */
  soundSrc?: string;
  /** Click volume, 0 to 1. */
  volume?: number;
  /** Timbre of the synthesised click (used when there is no recording). */
  soundType?: SoundType;
  /** KeyboardEvent.code values to show as held, e.g. from `usePhysicalKeyboard()`. */
  activeKeys?: string[];
  /**
   * Also react to the real keyboard: keys sink, ripple, click and type while the page has focus.
   * With several listening keyboards on a page, only one answers: the last one pressed or
   * hovered, else the one nearest the middle of the screen.
   */
  listen?: boolean;
  /** Shows a strip above the keys with what has been typed. Return clears it. */
  showOutput?: boolean;
  /** Text in the strip before anything is typed. */
  placeholder?: string;
  /** Types `autoplayText` on the keys, again and again, until someone presses a key. */
  autoplay?: boolean;
  /** What the demo types. */
  autoplayText?: string;
  /** Colour of the backlight ripple. */
  accent?: string;
  /** Extra classes on the keyboard body. */
  className?: string;
  /** Extra classes on every keycap. */
  keyClassName?: string;
  /** Silver or space grey. `auto` follows the page's `dark` class. */
  theme?: "dark" | "light" | "auto";
  /** Shows the Esc and F-key row (mac layout only). */
  showFunctionRow?: boolean;
  /** Fires when a key on screen is pressed. */
  onKeyPress?: (key: KeyDef) => void;
}

type Ripple = { id: number; x: number; y: number };

const SKIN = {
  light: {
    body: "bg-[linear-gradient(180deg,#ececef,#d9d9de)] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(0,0,0,.06),0_24px_44px_-28px_rgba(0,0,0,.45)]",
    cap: "bg-[linear-gradient(180deg,#ffffff,#f4f4f6)] text-[#1d1d1f] shadow-[0_1px_0_rgba(0,0,0,.18),0_1px_2px_rgba(0,0,0,.12),inset_0_-1px_0_rgba(0,0,0,.04)]",
    on: "text-[#0071e3]",
    strip: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_24px_-18px_rgba(0,0,0,.35)]",
    dim: "text-[#86868b]",
    caret: "bg-[#0071e3]",
  },
  dark: {
    body: "bg-[linear-gradient(180deg,#2c2c2e,#1d1d1f)] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(255,255,255,.06),0_24px_44px_-24px_rgba(0,0,0,.9)]",
    cap: "bg-[linear-gradient(180deg,#3a3a3c,#2f2f31)] text-[#f5f5f7] shadow-[0_1px_0_rgba(0,0,0,.7),0_1px_3px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06)]",
    on: "text-[#0a84ff]",
    strip: "bg-[#1c1c1e] text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_24px_-18px_rgba(0,0,0,.9)]",
    dim: "text-[#98989d]",
    caret: "bg-[#0a84ff]",
  },
  auto: {
    body: "bg-[linear-gradient(180deg,#ececef,#d9d9de)] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(0,0,0,.06),0_24px_44px_-28px_rgba(0,0,0,.45)] dark:bg-[linear-gradient(180deg,#2c2c2e,#1d1d1f)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(255,255,255,.06),0_24px_44px_-24px_rgba(0,0,0,.9)]",
    cap: "bg-[linear-gradient(180deg,#ffffff,#f4f4f6)] text-[#1d1d1f] shadow-[0_1px_0_rgba(0,0,0,.18),0_1px_2px_rgba(0,0,0,.12),inset_0_-1px_0_rgba(0,0,0,.04)] dark:bg-[linear-gradient(180deg,#3a3a3c,#2f2f31)] dark:text-[#f5f5f7] dark:shadow-[0_1px_0_rgba(0,0,0,.7),0_1px_3px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06)]",
    on: "text-[#0071e3] dark:text-[#0a84ff]",
    strip: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_24px_-18px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_24px_-18px_rgba(0,0,0,.9)]",
    dim: "text-[#86868b] dark:text-[#98989d]",
    caret: "bg-[#0071e3] dark:bg-[#0a84ff]",
  },
} as const;

const BY_CODE = new Map(MAC_ROWS.flat().map((k) => [k.code, k]));
const BY_CHAR = new Map(MAC_ROWS.flat().filter((k) => k.char && k.char.length === 1).map((k) => [k.char, k]));

const MAX_CHARS = 32;

// Several keyboards can listen on one page. Each key press goes to exactly one of them: the one
// the visitor last pressed or hovered, if it is still on screen, otherwise the one nearest the
// middle of the viewport. Every listener runs the same check, so they agree without talking.
const listening = new Map<number, () => HTMLElement | null>();
let lastUsed: number | null = null;
let nextId = 0;

function onScreen(el: HTMLElement | null) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const h = window.innerHeight;
  if (r.bottom <= 0 || r.top >= h || r.width === 0) return null;
  return Math.abs((r.top + r.bottom) / 2 - h / 2);
}

function ownsKeys(id: number) {
  if (lastUsed !== null && listening.has(lastUsed) && onScreen(listening.get(lastUsed)!()) !== null) return lastUsed === id;
  let best: number | null = null;
  let bestDist = Infinity;
  listening.forEach((get, k) => {
    const d = onScreen(get());
    if (d !== null && d < bestDist) {
      bestDist = d;
      best = k;
    }
  });
  return best === id;
}

/**
 * A Mac keyboard drawn in HTML. Press a key and it sinks, squashes and springs
 * back while a ring of backlight spreads out from it through the gaps between
 * the keys (the signature move). It can listen to the real keyboard, click
 * with synthesised sound and show what you type in a strip above.
 */
export function MacKeyboard({
  layout = "mac",
  enableSound = true,
  soundSrc = DEFAULT_KEY_SOUND_SRC,
  volume = 0.6,
  soundType = "mechanical",
  activeKeys = [],
  listen = false,
  showOutput = true,
  placeholder = "Start typing...",
  autoplay = false,
  autoplayText = "hello, nexus",
  accent = "#0a84ff",
  className = "",
  keyClassName,
  theme = "auto",
  showFunctionRow = true,
  onKeyPress,
}: KeyboardProps) {
  const still = useReducedMotion() === true;
  const skin = SKIN[theme] ?? SKIN.auto;
  const { play: synth } = useKeyboardSound({ enabled: enableSound, volume, soundType });
  const { play: playRecorded, prime: primeSound, unlock: unlockSound } = useKeySound({ enabled: enableSound, src: soundSrc, volume });
  const body = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef(new Set<number>());
  const els = React.useRef(new Map<string, HTMLElement>());
  const touched = React.useRef(false);
  const seq = React.useRef(0);
  const [id] = React.useState(() => ++nextId);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const [held, setHeld] = React.useState<string[]>([]);
  const [text, setText] = React.useState("");
  const [sent, setSent] = React.useState(0);

  const rows = React.useMemo(() => {
    const base = layout === "compact" ? COMPACT_ROWS : MAC_ROWS;
    return showFunctionRow || layout === "compact" ? base : base.slice(1);
  }, [layout, showFunctionRow]);

  const register = React.useCallback((code: string, el: HTMLElement | null) => {
    if (el) els.current.set(code, el);
    else els.current.delete(code);
  }, []);

  /** Light ring from the key's centre, plus the text and sound. */
  const strike = React.useCallback(
    (key: KeyDef, sound: boolean) => {
      const el = els.current.get(key.code);
      const host = body.current;
      if (el && host && !still) {
        const a = el.getBoundingClientRect();
        const b = host.getBoundingClientRect();
        const id = ++seq.current;
        setRipples((r) => [...r.slice(-5), { id, x: Math.round(a.left - b.left + a.width / 2), y: Math.round(a.top - b.top + a.height / 2) }]);
      }
      // Sound first, in the same event as the press, so it lands with the key going down.
      if (sound && !playRecorded(key.code)) synth(key.sound);
      if (key.code === "Enter") {
        setText("");
        setSent((n) => n + 1);
        return;
      }
      setText((t) => {
        if (key.code === "Backspace") return t.slice(0, -1);
        if (key.char && key.char !== "\t" && key.char !== "\n") return (t + key.char).slice(-MAX_CHARS);
        return t;
      });
    },
    [playRecorded, synth, still],
  );

  const tap = React.useCallback((key: KeyDef) => {
    setHeld((h) => [...h, key.code]);
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      setHeld((h) => h.filter((c, i) => c !== key.code || i !== h.indexOf(key.code)));
    }, 130);
    timers.current.add(t);
  }, []);

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  /** The first real press ends the demo and clears what it typed. */
  const takeOver = React.useCallback(() => {
    lastUsed = id;
    if (touched.current) return;
    touched.current = true;
    if (autoplay) setText("");
  }, [id, autoplay]);

  const onPress = React.useCallback(
    (key: KeyDef) => {
      takeOver();
      tap(key);
      strike(key, true);
      onKeyPress?.(key);
    },
    [takeOver, tap, strike, onKeyPress],
  );

  // Real keyboard.
  React.useEffect(() => {
    if (listen) primeSound();
  }, [listen, primeSound]);

  React.useEffect(() => {
    if (!listen) return;
    listening.set(id, () => body.current);
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey) return;
      const code = CODE_ALIASES[e.code] ?? e.code;
      const key = BY_CODE.get(code);
      if (!key || !ownsKeys(id)) return;
      takeOver();
      if (code === "Space" || code === "Backspace" || code === "Tab" || code === "Quote" || code === "Slash") e.preventDefault();
      if (!e.repeat) strike(key, true);
      setHeld((h) => (h.includes(code) ? h : [...h, code]));
    };
    const up = (e: KeyboardEvent) => {
      const code = CODE_ALIASES[e.code] ?? e.code;
      setHeld((h) => h.filter((c) => c !== code));
    };
    const blur = () => setHeld([]);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      listening.delete(id);
      if (lastUsed === id) lastUsed = null;
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [listen, strike, id, takeOver]);

  // Demo: type the text on the keys, send it with Return, pause, repeat.
  React.useEffect(() => {
    if (!autoplay || !autoplayText) return;
    const keys = Array.from(autoplayText.toLowerCase())
      .map((c) => BY_CHAR.get(c))
      .filter((k): k is KeyDef => !!k);
    const enter = BY_CODE.get("Enter");
    if (enter) keys.push(enter);
    let i = 0;
    let t = 0;
    const step = () => {
      if (touched.current) return;
      const k = keys[i % keys.length];
      i++;
      tap(k);
      strike(k, false);
      const pause = k.code === "Enter" ? 1700 : k.char === " " ? 210 : 120 + ((i * 37) % 90);
      t = window.setTimeout(step, pause);
    };
    t = window.setTimeout(step, 700);
    return () => window.clearTimeout(t);
  }, [autoplay, autoplayText, tap, strike]);

  const active = React.useMemo(() => {
    const s = new Set([...activeKeys, ...held]);
    if (s.has("OSLeft")) s.add("MetaLeft");
    if (s.has("OSRight")) s.add("MetaRight");
    return s;
  }, [activeKeys, held]);

  const chars = Array.from(text);

  return (
    <div className={`mx-auto flex w-full max-w-[780px] flex-col items-center gap-4 [container-type:inline-size]`}>
      {showOutput && (
        <div className={`relative flex h-11 w-full max-w-[420px] items-center overflow-hidden rounded-full px-5 text-[15px] tracking-[-0.01em] ${skin.strip}`} aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sent}
              className="flex min-w-0 items-center whitespace-pre"
              exit={still ? { opacity: 0 } : { y: -26, opacity: 0, scale: 0.96, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            >
              {chars.length === 0 ? (
                <span className={skin.dim}>{placeholder}</span>
              ) : (
                chars.map((c, i) => (
                  <motion.span
                    key={i}
                    initial={still ? false : { y: 8, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 700, damping: 22 }}
                    className="inline-block"
                  >
                    {c}
                  </motion.span>
                ))
              )}
              <motion.span
                aria-hidden="true"
                className={`ml-0.5 inline-block h-5 w-[2px] rounded-full ${skin.caret}`}
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
              />
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      <div
        ref={body}
        role="group"
        aria-label="Mac keyboard"
        onPointerEnter={() => {
          primeSound();
          if (listen) lastUsed = id;
        }}
        onFocus={primeSound}
        onPointerUp={unlockSound}
        className={cn(`relative w-full select-none overflow-hidden rounded-[min(22px,3cqw)] p-[min(14px,1.8cqw)] ${skin.body}`, className)}
      >
        {/* Backlight: rings drawn under the caps, so the light shows through the gaps. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="absolute h-[80px] w-[80px] rounded-full"
                style={{
                  left: r.x - 40,
                  top: r.y - 40,
                  background: `radial-gradient(circle, transparent 38%, ${accent} 52%, transparent 70%)`,
                }}
                initial={{ scale: 0.2, opacity: 0.95 }}
                animate={{ scale: 9, opacity: 0 }}
                transition={{ scale: { type: "spring", stiffness: 40, damping: 16 }, opacity: { duration: 1.1, ease: "easeOut" } }}
                onAnimationComplete={() => setRipples((list) => list.filter((x) => x.id !== r.id))}
              />
            ))}
            {ripples.length > 0 && (
              <motion.span
                key={`glow-${ripples[ripples.length - 1].id}`}
                className="absolute h-[60px] w-[60px] rounded-full blur-md"
                style={{ left: ripples[ripples.length - 1].x - 30, top: ripples[ripples.length - 1].y - 30, background: accent }}
                initial={{ opacity: 0.8, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
        </div>
        <div className="relative flex flex-col gap-[max(3px,0.65cqw)]">
          {rows.map((row, ri) => {
            const fnRow = layout === "mac" && showFunctionRow && ri === 0;
            return (
              <div key={ri} className="relative flex gap-[max(3px,0.65cqw)]">
                {row.map((k) => (
                  <React.Fragment key={k.id}>
                    {k.groupGap && fnRow && <span className="w-[max(3px,0.8cqw)] shrink-0" />}
                    <KeyboardKey
                      keyDef={k}
                      isActive={active.has(k.code)}
                      isFnRow={fnRow}
                      capClassName={skin.cap}
                      activeClassName={skin.on}
                      keyClassName={keyClassName}
                      still={still}
                      onPress={onPress}
                      register={register}
                    />
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{listen ? "Type on your keyboard, or tap the keys." : "Tap the keys."}</span>
    </div>
  );
}

/** Tracks which physical keys are held, as KeyboardEvent.code values, for `activeKeys`. */
export function usePhysicalKeyboard() {
  const [pressed, setPressed] = React.useState<string[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const code = CODE_ALIASES[e.code] ?? e.code;
      setPressed((p) => (p.includes(code) ? p : [...p, code]));
    };
    const up = (e: KeyboardEvent) => {
      const code = CODE_ALIASES[e.code] ?? e.code;
      setPressed((p) => p.filter((c) => c !== code));
    };
    const blur = () => setPressed([]);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return pressed;
}
