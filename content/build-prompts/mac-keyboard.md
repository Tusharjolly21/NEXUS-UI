Add the "Mac Keyboard" component from Nexus UI to my project.

A Mac keyboard drawn in HTML, in silver or space grey. Press a key and it sinks, squashes and springs back while a ring of backlight spreads out from it through the gaps; it can listen to the real keyboard, plays a recorded mechanical click for each key the instant it goes down, and shows what you type in a strip above.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. The code refers to these files in /public: `/sounds/keys.ogg`. Point them at the project's own files (or leave them out if they are optional).
7. Use it like this: `import { MacKeyboard } from "@/components/mac-keyboard";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/keyboard/index.ts ---

```ts
export { MacKeyboard, usePhysicalKeyboard } from "./keyboard";
export type { KeyboardProps } from "./keyboard";
export { useKeyboardSound } from "./use-keyboard-sound";
export type { SoundType } from "./use-keyboard-sound";
export type { KeyDef, KeyKind, SoundVariant } from "./keyboard-layout";
export { MAC_ROWS, COMPACT_ROWS } from "./keyboard-layout";
```

--- components/keyboard/keyboard-key.tsx ---

```tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { KeyDef } from "./keyboard-layout";
import { cn } from "@/lib/utils";

export interface KeyboardKeyProps {
  keyDef: KeyDef;
  /** Held down: by the visitor, the physical keyboard or the demo. */
  isActive: boolean;
  /** Function row keys are shorter. */
  isFnRow?: boolean;
  /** Classes for the cap face (colours for the chosen theme). */
  capClassName: string;
  /** Classes for the legend while the key is held. */
  activeClassName: string;
  /** Extra classes from the `keyClassName` prop. */
  keyClassName?: string;
  /** Turns off the press spring. */
  still?: boolean;
  onPress: (key: KeyDef, el: HTMLElement) => void;
  /** Registers the element so ripples can start from its centre. */
  register: (code: string, el: HTMLElement | null) => void;
}

const NAMES: Record<string, string> = {
  Backspace: "Delete",
  Tab: "Tab",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  MetaLeft: "Command",
  MetaRight: "Command",
  ArrowLeft: "Left arrow",
  ArrowRight: "Right arrow",
  Space: "Space",
  Enter: "Return",
  CapsLock: "Caps Lock",
  Escape: "Escape",
};

/** Press: the cap sinks and squashes a touch, then springs back up. */
const PRESS = { type: "spring" as const, stiffness: 700, damping: 26, mass: 0.5 };

export const KeyboardKey = React.memo(function KeyboardKey({
  keyDef,
  isActive,
  isFnRow = false,
  capClassName,
  activeClassName,
  keyClassName = "",
  still = false,
  onPress,
  register,
}: KeyboardKeyProps) {
  const mod = keyDef.kind === "modifier" || keyDef.kind === "nav" || keyDef.kind === "enter" || keyDef.kind === "delete";
  const fn = isFnRow || keyDef.kind === "fn";
  const wordy = keyDef.label.length > 1 && !/^F\d+$/.test(keyDef.label);
  return (
    <motion.button
      type="button"
      ref={(el) => register(keyDef.code, el)}
      aria-label={NAMES[keyDef.code] ?? (keyDef.label || keyDef.id)}
      aria-pressed={isActive}
      // Press on the way down, like a real key: the cap, the letter and the click all start together.
      // Only real pointers: framer-motion dispatches a synthetic pointerdown for Enter on a
      // focused key, and that press already arrives below as a click.
      onPointerDown={(e) => {
        if (e.button === 0 && e.isTrusted) onPress(keyDef, e.currentTarget);
      }}
      // Keyboard activation (Enter or Space on a focused key) has no pointer, so it arrives as a click.
      onClick={(e) => {
        if (e.detail === 0) onPress(keyDef, e.currentTarget);
      }}
      initial={false}
      animate={still ? undefined : isActive ? { y: 1.5, scaleY: 0.94, scaleX: 0.985 } : { y: 0, scaleY: 1, scaleX: 1 }}
      whileTap={still ? undefined : { y: 1.5, scaleY: 0.94, scaleX: 0.985 }}
      transition={PRESS}
      style={{ flex: keyDef.width, originY: 1 }}
      className={cn(`relative z-10 flex min-w-0 select-none rounded-[0.32em] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${
        fn ? "h-[max(16px,3.6cqw)]" : "h-[max(24px,5.6cqw)]"
      } ${capClassName}`, keyClassName)}
    >
      {keyDef.kind !== "space" && (
        <span
          className={`pointer-events-none absolute inset-0 flex px-[0.45em] leading-none transition-colors duration-150 ${
            mod ? (keyDef.code.endsWith("Right") || keyDef.kind === "enter" || keyDef.kind === "delete" ? "items-end justify-end pb-[0.45em]" : "items-end justify-start pb-[0.45em]") : "items-center justify-center"
          } ${fn || wordy ? "text-[max(7px,1.15cqw)] font-medium" : "text-[max(9px,1.9cqw)]"} ${isActive ? activeClassName : ""}`}
        >
          {keyDef.sub && !mod && !fn ? (
            <span className="flex flex-col items-center gap-[0.15em]">
              <span className="text-[0.72em] opacity-60">{keyDef.sub}</span>
              <span>{keyDef.label}</span>
            </span>
          ) : (
            keyDef.label
          )}
        </span>
      )}
    </motion.button>
  );
});
```

--- components/keyboard/keyboard-layout.ts ---

```ts
export type KeyKind = "normal" | "modifier" | "space" | "enter" | "delete" | "fn" | "nav";
export type SoundVariant = "normal" | "space" | "enter" | "delete" | "modifier";

export interface KeyDef {
  id: string;
  label: string;
  sub?: string;       // shift-layer label shown smaller
  code: string;       // KeyboardEvent.code
  char: string;       // character to insert
  width: number;      // flex units
  kind: KeyKind;
  sound: SoundVariant;
  groupGap?: boolean; // add extra gap before this key (fn row groups)
}

type Row = KeyDef[];

const k = (
  id: string,
  label: string,
  sub: string | undefined,
  code: string,
  char: string,
  width: number,
  kind: KeyKind = "normal",
  sound: SoundVariant = "normal",
  groupGap = false,
): KeyDef => ({ id, label, sub, code, char, width, kind, sound, groupGap });

// Every row except fn sums to 15 flex-units so rows stay aligned.
export const MAC_ROWS: Row[] = [
  // ── Function row ─────────────────────────────────────────────
  // Esc=1.5u + 12 F-keys=1u each + 3 inter-group gaps → fills naturally via flex
  [
    k("Escape", "esc", undefined, "Escape", "", 1.5, "modifier", "modifier"),
    k("F1",  "F1",  undefined, "F1",  "", 1, "fn", "modifier", true),
    k("F2",  "F2",  undefined, "F2",  "", 1, "fn", "modifier"),
    k("F3",  "F3",  undefined, "F3",  "", 1, "fn", "modifier"),
    k("F4",  "F4",  undefined, "F4",  "", 1, "fn", "modifier"),
    k("F5",  "F5",  undefined, "F5",  "", 1, "fn", "modifier", true),
    k("F6",  "F6",  undefined, "F6",  "", 1, "fn", "modifier"),
    k("F7",  "F7",  undefined, "F7",  "", 1, "fn", "modifier"),
    k("F8",  "F8",  undefined, "F8",  "", 1, "fn", "modifier"),
    k("F9",  "F9",  undefined, "F9",  "", 1, "fn", "modifier", true),
    k("F10", "F10", undefined, "F10", "", 1, "fn", "modifier"),
    k("F11", "F11", undefined, "F11", "", 1, "fn", "modifier"),
    k("F12", "F12", undefined, "F12", "", 1, "fn", "modifier"),
  ],

  // ── Number row (15u) ─────────────────────────────────────────
  [
    k("Backquote",   "`",  "~",  "Backquote",   "`",  1),
    k("Digit1",      "1",  "!",  "Digit1",      "1",  1),
    k("Digit2",      "2",  "@",  "Digit2",      "2",  1),
    k("Digit3",      "3",  "#",  "Digit3",      "3",  1),
    k("Digit4",      "4",  "$",  "Digit4",      "4",  1),
    k("Digit5",      "5",  "%",  "Digit5",      "5",  1),
    k("Digit6",      "6",  "^",  "Digit6",      "6",  1),
    k("Digit7",      "7",  "&",  "Digit7",      "7",  1),
    k("Digit8",      "8",  "*",  "Digit8",      "8",  1),
    k("Digit9",      "9",  "(",  "Digit9",      "9",  1),
    k("Digit0",      "0",  ")",  "Digit0",      "0",  1),
    k("Minus",       "-",  "_",  "Minus",       "-",  1),
    k("Equal",       "=",  "+",  "Equal",       "=",  1),
    k("Backspace",   "⌫",  undefined, "Backspace", "", 2, "delete", "delete"),
  ],

  // ── QWERTY row (15u) ─────────────────────────────────────────
  [
    k("Tab",          "⇥",  undefined, "Tab",          "\t", 1.5, "modifier", "modifier"),
    k("KeyQ",         "Q",  undefined, "KeyQ",         "q",  1),
    k("KeyW",         "W",  undefined, "KeyW",         "w",  1),
    k("KeyE",         "E",  undefined, "KeyE",         "e",  1),
    k("KeyR",         "R",  undefined, "KeyR",         "r",  1),
    k("KeyT",         "T",  undefined, "KeyT",         "t",  1),
    k("KeyY",         "Y",  undefined, "KeyY",         "y",  1),
    k("KeyU",         "U",  undefined, "KeyU",         "u",  1),
    k("KeyI",         "I",  undefined, "KeyI",         "i",  1),
    k("KeyO",         "O",  undefined, "KeyO",         "o",  1),
    k("KeyP",         "P",  undefined, "KeyP",         "p",  1),
    k("BracketLeft",  "[",  "{",  "BracketLeft",  "[",  1),
    k("BracketRight", "]",  "}",  "BracketRight", "]",  1),
    k("Backslash",    "\\", "|",  "Backslash",    "\\", 1.5, "modifier", "modifier"),
  ],

  // ── ASDF row (15u) ───────────────────────────────────────────
  [
    k("CapsLock", "caps",   undefined, "CapsLock", "",   1.75, "modifier", "modifier"),
    k("KeyA",     "A",      undefined, "KeyA",     "a",  1),
    k("KeyS",     "S",      undefined, "KeyS",     "s",  1),
    k("KeyD",     "D",      undefined, "KeyD",     "d",  1),
    k("KeyF",     "F",      undefined, "KeyF",     "f",  1),
    k("KeyG",     "G",      undefined, "KeyG",     "g",  1),
    k("KeyH",     "H",      undefined, "KeyH",     "h",  1),
    k("KeyJ",     "J",      undefined, "KeyJ",     "j",  1),
    k("KeyK",     "K",      undefined, "KeyK",     "k",  1),
    k("KeyL",     "L",      undefined, "KeyL",     "l",  1),
    k("Semicolon",";" ,     ":",  "Semicolon",";" , 1),
    k("Quote",    "'",      "\"", "Quote",    "'",  1),
    k("Enter",    "return", undefined, "Enter",    "\n", 2.25, "enter", "enter"),
  ],

  // ── ZXCV row (15u) ───────────────────────────────────────────
  [
    k("ShiftLeft",  "⇧", undefined, "ShiftLeft",  "",  2.25, "modifier", "modifier"),
    k("KeyZ",       "Z", undefined, "KeyZ",       "z", 1),
    k("KeyX",       "X", undefined, "KeyX",       "x", 1),
    k("KeyC",       "C", undefined, "KeyC",       "c", 1),
    k("KeyV",       "V", undefined, "KeyV",       "v", 1),
    k("KeyB",       "B", undefined, "KeyB",       "b", 1),
    k("KeyN",       "N", undefined, "KeyN",       "n", 1),
    k("KeyM",       "M", undefined, "KeyM",       "m", 1),
    k("Comma",      ",", "<",  "Comma",      ",", 1),
    k("Period",     ".", ">",  "Period",     ".", 1),
    k("Slash",      "/", "?",  "Slash",      "/", 1),
    k("ShiftRight", "⇧", undefined, "ShiftRight", "",  2.75, "modifier", "modifier"),
  ],

  // ── Bottom row (15u) ─────────────────────────────────────────
  [
    k("Fn",          "fn",      undefined, "Fn",          "", 1,    "modifier", "modifier"),
    k("ControlLeft", "control", undefined, "ControlLeft", "", 1.5,  "modifier", "modifier"),
    k("AltLeft",     "option",  undefined, "AltLeft",     "", 1.5,  "modifier", "modifier"),
    k("MetaLeft",    "⌘",       undefined, "MetaLeft",    "", 1.75, "modifier", "modifier"),
    k("Space",       "",        undefined, "Space",       " ", 5,   "space",    "space"),
    k("MetaRight",   "⌘",       undefined, "MetaRight",   "", 1.75, "modifier", "modifier"),
    k("AltRight",    "option",  undefined, "AltRight",    "", 1.5,  "modifier", "modifier"),
    k("ArrowLeft",   "←",       undefined, "ArrowLeft",   "", 1,    "nav",      "modifier"),
    k("ArrowRight",  "→",       undefined, "ArrowRight",  "", 1,    "nav",      "modifier"),
  ],
];

export const COMPACT_ROWS: Row[] = MAC_ROWS.slice(1);

// Maps alternate code names browsers emit for the same physical key
export const CODE_ALIASES: Record<string, string> = {
  OSLeft:  "MetaLeft",
  OSRight: "MetaRight",
};
```

--- components/keyboard/keyboard.tsx ---

```tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { KeyboardKey } from "./keyboard-key";
import { useKeyboardSound, type SoundType } from "./use-keyboard-sound";
import { useKeySound, DEFAULT_KEY_SOUND_SRC } from "@/components/key-sound";
import { MAC_ROWS, COMPACT_ROWS, CODE_ALIASES, type KeyDef } from "./keyboard-layout";
import { cn } from "@/lib/utils";
import { audioAwake, useAutoplaySoundAllowed } from "@/lib/ui-sounds";

export interface KeyboardProps {
  /** Full layout with the Esc and F-key row, or compact without it. */
  layout?: "mac" | "compact";
  /** Plays a key click the moment a key is pressed. Autoplay clicks too, once the visitor has used the page. */
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
  // Autoplay clicks follow the same rules as `play.auto` in `@/lib/ui-sounds`: the site must allow demo sound here.
  const autoAllowed = useAutoplaySoundAllowed();
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
    (key: KeyDef, sound: boolean | "auto") => {
      const el = els.current.get(key.code);
      const host = body.current;
      if (el && host && !still) {
        const a = el.getBoundingClientRect();
        const b = host.getBoundingClientRect();
        const id = ++seq.current;
        setRipples((r) => [...r.slice(-5), { id, x: Math.round(a.left - b.left + a.width / 2), y: Math.round(a.top - b.top + a.height / 2) }]);
      }
      // Sound first, in the same event as the press, so it lands with the key going down.
      // Autoplay clicks stay silent until the browser lets audio start (the visitor has used the page) and while the tab is hidden.
      if (sound === "auto" ? autoAllowed && !document.hidden && audioAwake() : sound) {
        if (!playRecorded(key.code)) synth(key.sound);
      }
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
    [playRecorded, synth, still, autoAllowed],
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
      // About seven keys a second is too busy to click on every one: click the first letter and the space of each word, and Return.
      const at = (i - 1) % keys.length;
      const beat = at === 0 || k.code === "Space" || k.code === "Enter" || keys[at - 1]?.code === "Space";
      strike(k, beat ? "auto" : false);
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
```

--- components/keyboard/use-keyboard-sound.ts ---

```ts
"use client";

import * as React from "react";
import { getSoundsEnabled } from "@/lib/ui-sounds";
import type { SoundVariant } from "./keyboard-layout";

export type SoundType = "mechanical" | "soft" | "clicky";

// Per-variant parameters tuned for each key type
type VParams = {
  // Click layer: the switch mechanism actuating (~first few ms)
  ckHz:  number; ckQ:  number; ckDcy: number; ckGn: number;
  // Thud layer: keycap bottom-out impact (~slightly delayed)
  tdHz:  number; tdQ:  number; tdDcy: number; tdGn: number;
  tdOff: number; // seconds after the click
  // Body-resonance tone
  bodyHz: number; bodyGn: number;
};

const VARIANT: Record<SoundVariant, VParams> = {
  normal:   { ckHz:5400, ckQ:4.2, ckDcy:0.0042, ckGn:0.50, tdHz:400, tdQ:1.1, tdDcy:0.022, tdGn:0.82, tdOff:0.007, bodyHz:280, bodyGn:0.22 },
  space:    { ckHz:2200, ckQ:2.2, ckDcy:0.010,  ckGn:0.28, tdHz:148, tdQ:0.8, tdDcy:0.048, tdGn:1.05, tdOff:0.012, bodyHz:118, bodyGn:0.30 },
  enter:    { ckHz:3700, ckQ:3.4, ckDcy:0.006,  ckGn:0.43, tdHz:275, tdQ:1.0, tdDcy:0.032, tdGn:0.92, tdOff:0.009, bodyHz:205, bodyGn:0.26 },
  delete:   { ckHz:6100, ckQ:4.8, ckDcy:0.0034, ckGn:0.55, tdHz:510, tdQ:1.3, tdDcy:0.017, tdGn:0.73, tdOff:0.005, bodyHz:345, bodyGn:0.18 },
  modifier: { ckHz:3000, ckQ:2.7, ckDcy:0.005,  ckGn:0.28, tdHz:210, tdQ:0.9, tdDcy:0.019, tdGn:0.60, tdOff:0.007, bodyHz:158, bodyGn:0.15 },
};

// Per-type multipliers
const TYPE_MULT: Record<SoundType, { ckScale: number; tdScale: number; bodyScale: number; ckQMult: number }> = {
  mechanical: { ckScale: 1.00, tdScale: 1.00, bodyScale: 1.00, ckQMult: 1.0 },
  soft:       { ckScale: 0.28, tdScale: 0.75, bodyScale: 0.60, ckQMult: 0.5 },
  clicky:     { ckScale: 1.55, tdScale: 0.85, bodyScale: 0.55, ckQMult: 1.9 },
};

function synthesise(ctx: AudioContext, variant: SoundVariant, type: SoundType, volume: number) {
  const now = ctx.currentTime;
  const sr  = ctx.sampleRate;
  const vol = Math.max(0, Math.min(1, volume));
  const p   = VARIANT[variant];
  const tm  = TYPE_MULT[type];

  // Slight per-hit randomisation — keeps rapid typing feeling organic
  const jitter = () => 0.92 + Math.random() * 0.16;

  function noiseBurst(t: number, hz: number, q: number, decaySec: number, gain: number) {
    if (gain < 0.001) return;
    const dur = Math.max(decaySec * 6.5, 0.014);
    const len = Math.ceil(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d   = buf.getChannelData(0);
    const tc  = decaySec * sr;
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / tc);

    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp  = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = hz * jitter(); bp.Q.value = q;
    const gn  = ctx.createGain();
    gn.gain.setValueAtTime(gain * vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(gn); gn.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.01);
  }

  // ── Layer 1: High-frequency click (switch actuation snap) ─────
  noiseBurst(now, p.ckHz, p.ckQ * tm.ckQMult, p.ckDcy, p.ckGn * tm.ckScale);

  // ── Layer 2: Low-frequency thud (bottom-out impact) ───────────
  const t2 = now + p.tdOff;
  noiseBurst(t2, p.tdHz * jitter(), p.tdQ, p.tdDcy, p.tdGn * tm.tdScale);

  // ── Layer 3: Pitched resonance (case / plate ring) ────────────
  const bodyGain = p.bodyGn * tm.bodyScale * vol;
  if (bodyGain > 0.01) {
    const osc = ctx.createOscillator();
    const gn  = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.bodyHz * 1.35 * jitter(), t2);
    osc.frequency.exponentialRampToValueAtTime(p.bodyHz * 0.52, t2 + 0.065);
    gn.gain.setValueAtTime(bodyGain, t2);
    gn.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.085);
    osc.connect(gn); gn.connect(ctx.destination);
    osc.start(t2); osc.stop(t2 + 0.1);
  }
}

export function useKeyboardSound(opts: {
  enabled: boolean;
  volume: number;
  soundType: SoundType;
}) {
  const ctxRef    = React.useRef<AudioContext | null>(null);
  const optsRef   = React.useRef(opts);
  // Synced after render so the latest volume / timbre is used on the next key.
  React.useEffect(() => {
    optsRef.current = opts;
  });

  const getCtx = React.useCallback((): AudioContext | null => {
    // The prop and the site-wide sound switch must both be on.
    if (!optsRef.current.enabled || !getSoundsEnabled()) return null;
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed")
        ctxRef.current = new AudioContext();
      if (ctxRef.current.state === "suspended")
        void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const play = React.useCallback(
    (variant: SoundVariant) => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        synthesise(ctx, variant, optsRef.current.soundType, optsRef.current.volume);
      } catch {
        // Silently absorb Web Audio errors (policy / SSR)
      }
    },
    [getCtx],
  );

  React.useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);

  return { play };
}
```

--- components/mac-keyboard.tsx ---

```tsx
export { MacKeyboard, usePhysicalKeyboard } from "./keyboard";
export type { KeyboardProps } from "./keyboard";
export type { KeyDef, KeyKind, SoundVariant } from "./keyboard/keyboard-layout";
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
