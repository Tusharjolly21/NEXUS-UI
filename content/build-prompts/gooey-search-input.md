Add the "Gooey Search Input" component from Nexus UI to my project.

A search pill whose icon pinches off into its own bubble through an SVG goo filter when you open it, while the field grows with a springy overshoot. Pass suggestions and the matches drip out of the underside of the field through the same goo, with arrow-key navigation.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. Use it like this: `import { GooeyInput } from "@/components/gooey-input/gooey-input";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/gooey-input/gooey-input.tsx ---

```tsx
"use client";

/**
 * Gooey search input: a pill whose search icon pinches off into its own
 * bubble through an SVG goo filter, with suggestions that ooze out below.
 * Live demo: `/demos/gooey-input`
 */

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type GooeyInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "size" | "value" | "defaultValue" | "width" | "onSelect"> & {
  placeholder?: string;
  /** Width (px) of the pill while collapsed. */
  collapsedWidth?: number;
  /** Width (px) of the field once open. */
  expandedWidth?: number;
  /** Room (px) left of the open field for the icon bubble. */
  expandedOffset?: number;
  /** Blur radius of the goo filter; higher melts the shapes together more. */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  /** Words to suggest while typing; matches drip out of the field in a list. */
  suggestions?: string[];
  /** Called when a suggestion is picked with a click or Enter. */
  onSelect?: (value: string) => void;
  /** Label on the collapsed pill. */
  collapsedLabel?: string;
  /** Opens, types a query and closes again on a loop until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

const H = 44;
const ROW = 36;
const GAP = 8;

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} className={cn("size-[17px] shrink-0", className)} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

/**
 * Gooey search input. Click the pill and its search icon stretches, necks
 * and pinches off to the left as a separate bubble while the field grows
 * with a springy overshoot. Type, and matching suggestions drip out of the
 * underside of the field through the same goo.
 */
export function GooeyInput({
  placeholder = "Type to search...",
  className,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 56,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  suggestions,
  onSelect,
  collapsedLabel = "Search",
  autoplay = false,
  disabled = false,
  enableSound = true,
  id,
  onChange: onChangeProp,
  onKeyDown: onKeyDownProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  ...restInput
}: GooeyInputProps) {
  const safeId = React.useId().replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const inputId = id ?? `gooey-input-${safeId}`;
  const listId = `gooey-list-${safeId}`;
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const touched = React.useRef(false);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() => defaultValue ?? "");
  const [active, setActive] = React.useState(0);

  const isControlled = valueProp !== undefined;
  const searchText = (isControlled ? (valueProp ?? "") : uncontrolledValue) ?? "";
  useTypedText(searchText, enableSound);

  const W = expandedOffset + expandedWidth;
  const collapsedLeft = Math.max(0, (W - collapsedWidth) / 2);

  const q = searchText.trim().toLowerCase();
  const matches = React.useMemo(() => (q && suggestions ? suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 4) : []), [q, suggestions]);
  const showList = isExpanded && matches.length > 0;

  const open = useSpring(0, still ? { stiffness: 1000, damping: 100 } : { stiffness: 240, damping: 17, mass: 0.9 });
  const panel = useSpring(0, still ? { stiffness: 1000, damping: 100 } : { stiffness: 260, damping: 20 });
  React.useEffect(() => {
    open.set(isExpanded ? 1 : 0);
  }, [isExpanded, open]);
  React.useEffect(() => {
    panel.set(showList ? matches.length * ROW + 12 : 0);
  }, [showList, matches.length, panel]);

  const pillLeft = useTransform(open, (o) => collapsedLeft + (expandedOffset - collapsedLeft) * o);
  const pillWidth = useTransform(open, (o) => Math.max(H, collapsedWidth + (expandedWidth - collapsedWidth) * o));
  const bubbleX = useTransform(open, (o) => collapsedLeft + 2 + (0 - collapsedLeft - 2) * o);
  const bubbleScale = useTransform(open, (o) => 0.55 + 0.45 * Math.min(1, Math.max(0, o)));
  const innerIcon = useTransform(open, [0, 0.35], [1, 0]);
  const fieldOpacity = useTransform(open, [0.45, 0.9], [0, 1]);
  const bubbleIcon = useTransform(open, [0.4, 0.8], [0, 1]);
  const panelHeight = useTransform(panel, (h) => Math.max(0, h));
  const panelY = useTransform(panel, (h) => (h > 1 ? 0 : -GAP));
  const listOpacity = useTransform(panel, [0, 30], [0, 1]);

  const setSearchText = React.useCallback(
    (next: string, notify = true) => {
      if (!isControlled) setUncontrolledValue(next);
      if (notify) onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = React.useCallback(
    (next: boolean, notify = true) => {
      setIsExpanded(next);
      if (!next) setSearchText("", notify);
      setActive(0);
      if (notify) onOpenChange?.(next);
    },
    [onOpenChange, setSearchText],
  );

  const expand = () => {
    touched.current = true;
    if (disabled) return;
    play("pop");
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  // Closing that the visitor caused (Escape, clicking away from an empty field) says "off"; autoplay calls setExpanded directly and answers through `play.auto`.
  const closeByUser = () => {
    if (isExpanded) play("off");
    setExpanded(false);
  };

  const pick = (s: string) => {
    play("tap");
    setSearchText(s);
    onSelect?.(s);
  };

  React.useEffect(() => {
    if (!autoplay || disabled) return;
    const word = "motion";
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      at(700, () => {
        playRef.current.auto("pop");
        setExpanded(true, false);
      });
      for (let i = 1; i <= word.length; i++) at(1300 + i * 120, () => setSearchText(word.slice(0, i), false));
      at(2700, () => setActive(1));
      at(3200, () => setActive(2));
      at(4600, () => {
        playRef.current.auto("off");
        setExpanded(false, false);
      });
      at(6200, loop);
    };
    loop();
    return () => timers.forEach(clearTimeout);
  }, [autoplay, disabled, setExpanded, setSearchText]);

  const shape = "absolute bg-[#1d1d1f] dark:bg-[#f5f5f7]";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />
      <div className={cn("relative shrink-0", disabled && "opacity-50")} style={{ width: W, height: H }}>
        {/* Goo layer: only the shapes, so text stays crisp. */}
        <div
          className="pointer-events-none absolute inset-0 [--goo-shadow:drop-shadow(0_10px_14px_rgba(0,0,0,.22))] dark:[--goo-shadow:drop-shadow(0_10px_14px_rgba(0,0,0,.6))]"
          style={{ filter: `url(#${filterId}) var(--goo-shadow)` }}
          aria-hidden="true"
        >
          <motion.div className={cn(shape, "top-0 rounded-full")} style={{ left: pillLeft, width: pillWidth, height: H }} />
          <motion.div className={cn(shape, "left-0 top-0 rounded-full")} style={{ x: bubbleX, scale: bubbleScale, width: H, height: H }} />
          <motion.div className={cn(shape, "rounded-[20px]")} style={{ left: pillLeft, width: pillWidth, top: H + GAP, y: panelY, height: panelHeight }} />
        </div>

        {/* Content layer, riding the same motion values. */}
        <motion.div className="absolute left-0 top-0 grid place-items-center text-white dark:text-[#1d1d1f]" style={{ x: bubbleX, scale: bubbleScale, width: H, height: H, opacity: bubbleIcon }} aria-hidden="true">
          <SearchIcon />
        </motion.div>
        <motion.div className="absolute top-0 flex items-center" style={{ left: pillLeft, width: pillWidth, height: H }}>
          {!isExpanded ? (
            <button
              type="button"
              disabled={disabled}
              onClick={expand}
              aria-expanded={false}
              aria-controls={inputId}
              className="absolute inset-0 flex items-center justify-center gap-2 rounded-full text-[15px] font-semibold tracking-[-0.01em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
            >
              <motion.span className="flex items-center gap-2" style={{ opacity: innerIcon }}>
                <SearchIcon />
                {collapsedLabel}
              </motion.span>
            </button>
          ) : null}
          <motion.input
            {...(restInput as React.ComponentPropsWithoutRef<typeof motion.input>)}
            ref={inputRef}
            id={inputId}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            role={suggestions ? "combobox" : undefined}
            aria-expanded={suggestions ? showList : undefined}
            aria-controls={suggestions ? listId : undefined}
            aria-autocomplete={suggestions ? "list" : undefined}
            aria-activedescendant={showList && matches[active] ? `${listId}-${active}` : undefined}
            aria-label={restInput["aria-label"] ?? "Search"}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setActive(0);
              onChangeProp?.(e);
            }}
            onFocus={onFocusProp}
            onBlur={(e) => {
              if (!searchText) closeByUser();
              onBlurProp?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                closeByUser();
                e.currentTarget.blur();
              } else if (showList && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                const d = e.key === "ArrowDown" ? 1 : -1;
                setActive((a) => (a + d + matches.length) % matches.length);
              } else if (showList && e.key === "Enter" && matches[active]) {
                e.preventDefault();
                pick(matches[active]);
              }
              onKeyDownProp?.(e);
            }}
            disabled={disabled || !isExpanded}
            placeholder={placeholder}
            tabIndex={isExpanded ? 0 : -1}
            style={{ opacity: fieldOpacity }}
            className={cn(
              "h-full w-full min-w-0 appearance-none rounded-full border-0 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-white/55 dark:text-[#1d1d1f] dark:placeholder:text-[#1d1d1f]/50 [&::-webkit-search-cancel-button]:hidden",
              !isExpanded && "pointer-events-none",
            )}
          />
        </motion.div>
        {suggestions ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="absolute overflow-hidden py-1.5"
            style={{ left: pillLeft, width: pillWidth, top: H + GAP, height: panelHeight, opacity: listOpacity }}
          >
            {showList
              ? matches.map((m, i) => {
                  const at = m.toLowerCase().indexOf(q);
                  return (
                    <li
                      key={m}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onPointerDown={(e) => e.preventDefault()}
                      onPointerMove={() => setActive(i)}
                      onClick={() => pick(m)}
                      className="relative mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-[14px] px-2.5 text-[14px] text-white/70 dark:text-[#1d1d1f]/70"
                      style={{ height: ROW }}
                    >
                      {i === active ? (
                        <motion.span layoutId={`gooey-hl-${safeId}`} className="absolute inset-0 rounded-[14px] bg-white/[0.12] dark:bg-black/[0.08]" transition={{ type: "spring", stiffness: 600, damping: 40 }} />
                      ) : null}
                      <SearchIcon className="relative size-[13px] opacity-60" />
                      <span className="relative truncate">
                        {m.slice(0, at)}
                        <span className="font-semibold text-white dark:text-[#1d1d1f]">{m.slice(at, at + q.length)}</span>
                        {m.slice(at + q.length)}
                      </span>
                    </li>
                  );
                })
              : null}
          </motion.ul>
        ) : null}
      </div>
    </div>
  );
}
```

--- components/gooey-input/index.ts ---

```ts
export type { GooeyInputProps } from "./gooey-input";
export { GooeyInput } from "./gooey-input";
```

--- components/gooey-input.tsx ---

```tsx
/** Re-export shim: some bundlers resolve `@/components/gooey-input` to this file before the directory. */
export type { GooeyInputProps } from "./gooey-input/gooey-input";
export { GooeyInput } from "./gooey-input/gooey-input";
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
    playbackSession();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

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

--- lib/typing-sound.ts ---

```ts
import * as React from "react";
import { getSoundsEnabled, setSoundsEnabled, useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/**
 * Typing sound. One recorded key click per character, played in the same frame the character
 * appears, for every component that types by itself (typewriters, terminals, chat answers). The
 * clicks come from one OGG sprite (public/sounds/sound.ogg) and its timing map
 * (public/sounds/sprite-config.json); without them a short synthesised click plays instead.
 *
 *   const typing = useTypingSound();
 *   typing.type(char);       // a character landed
 *   typing.backspace();      // a character was removed
 *
 * It follows the site-wide sound switch and has a switch of its own (useTypingSoundEnabled), both
 * remembered in this browser. Self-playing demos stay silent until the visitor has used the page once,
 * and inside <AutoplaySound allow={false}>.
 */

const STORE_KEY = "ui-typing-sound";
let chosen: boolean | null = null; // the visitor's saved or runtime choice; typing is on until they say otherwise
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

/** The typing switch on its own (true until the visitor turns it off). The site-wide sound switch is separate. */
export function getTypingSoundChoice(): boolean {
  load();
  return chosen ?? true;
}

/** Whether typing is audible right now: the typing switch and the site-wide sound switch are both on. */
export function getTypingSoundEnabled(): boolean {
  return getSoundsEnabled() && getTypingSoundChoice();
}

/** Turn the typing sound on or off. The choice is remembered in this browser unless `persist` is false. */
export function setTypingSoundChoice(on: boolean, persist = true) {
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
 * The typing switch as React state: `[on, setOn]`. `on` is what the visitor hears (typing choice and
 * the site-wide switch both on). Turning it on also turns the site-wide sound on, because a typing
 * switch that stays silent is no switch; turning it off only silences typing.
 */
export function useTypingSoundEnabled(): [boolean, (on: boolean) => void] {
  const choice = React.useSyncExternalStore(subscribe, getTypingSoundChoice, () => false);
  const [master] = useSoundsEnabled();
  const set = React.useCallback((on: boolean) => {
    if (on) setSoundsEnabled(true);
    setTypingSoundChoice(on);
  }, []);
  return [choice && master, set];
}

// ── The recording ───────────────────────────────────────────────────

/** The key-click sprite and its timing map ({ defines: { keyCode: [offset ms, length ms] } }). */
export const TYPING_SPRITE_URL = "/sounds/sound.ogg";
export const TYPING_SPRITE_CONFIG_URL = "/sounds/sprite-config.json";

type AudioCtor = typeof AudioContext;
let context: AudioContext | null = null;
let sprite: { buffer: AudioBuffer; defines: Record<string, [number, number]> } | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

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
 * Downloads and decodes the clicks so the first character is in time. It needs no user gesture
 * (it decodes offline) and does nothing twice. The hooks call it once typing is audible.
 */
export function primeTypingSound(): Promise<void> {
  if (typeof window === "undefined" || sprite || failed) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const [audio, cfg] = await Promise.all([fetch(TYPING_SPRITE_URL), fetch(TYPING_SPRITE_CONFIG_URL)]);
        if (!audio.ok || !cfg.ok) throw new Error("typing sprite missing");
        const defines = ((await cfg.json()) as { defines?: Record<string, [number, number]> }).defines;
        if (!defines) throw new Error("typing sprite config has no defines");
        const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (!Offline) throw new Error("no offline audio");
        const buffer = await new Offline(2, 1, 44100).decodeAudioData(await audio.arrayBuffer());
        sprite = { buffer, defines };
      } catch {
        failed = true; // the synthesised click covers it
      }
    })();
  }
  return loading;
}

/** The slice for a character: its own key, else the letter in capitals, else the space bar. */
function sliceFor(defines: Record<string, [number, number]>, char: string, kind: "key" | "enter" | "backspace"): [number, number] | null {
  if (kind === "enter") return defines["13"] ?? defines["10"] ?? null;
  if (kind === "backspace") return defines["8"] ?? defines["32"] ?? null;
  const code = char.charCodeAt(0);
  return defines[String(code)] ?? (code >= 97 && code <= 122 ? defines[String(code - 32)] : undefined) ?? defines["32"] ?? defines["65"] ?? null;
}

function synthClick(ctx: AudioContext, volume: number, heavy: boolean) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.08 : 0.04));
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(heavy ? 165 : 245 + Math.random() * 60, t);
  o.connect(g);
  o.start(t);
  o.stop(t + (heavy ? 0.08 : 0.04));
}

function playClick(char: string, kind: "key" | "enter" | "backspace", volume: number) {
  const ctx = liveContext();
  if (!ctx || ctx.state !== "running") return false; // never queue clicks that would burst out later
  try {
    const slice = sprite ? sliceFor(sprite.defines, char, kind) : null;
    if (sprite && slice && slice[0] / 1000 < sprite.buffer.duration) {
      const node = ctx.createBufferSource();
      node.buffer = sprite.buffer;
      // A hair of pitch variation so fast typing does not sound like a loop.
      node.playbackRate.value = 0.98 + Math.random() * 0.04;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(0, slice[0] / 1000, Math.min(slice[1] / 1000, sprite.buffer.duration - slice[0] / 1000));
    } else {
      synthClick(ctx, volume, kind !== "key");
    }
    return true;
  } catch {
    return false;
  }
}

// ── Playing ─────────────────────────────────────────────────────────

let lastAt = -1e9;

function userHasActed() {
  if (typeof navigator === "undefined") return false;
  const a = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Browsers without the API only let audio start after a gesture anyway.
  return a ? a.hasBeenActive : true;
}

/**
 * Plays the key click for a typed character (a "\n" is the Enter key). Set `auto: false` for a key
 * the visitor pressed; a component typing on its own (the default) stays silent until the visitor has
 * used the page once. Returns whether a click was started.
 */
export function playTypingSound(char: string, opts: { auto?: boolean; volume?: number; backspace?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !getTypingSoundEnabled()) return false;
  if (document.hidden) return false;
  if (opts.auto !== false && !userHasActed()) return false;
  // A run of characters landing in one frame (streamed text) is one click, not a buzz.
  const now = performance.now();
  if (now - lastAt < 24) return false;
  lastAt = now;
  void primeTypingSound();
  const kind = opts.backspace ? "backspace" : char === "\n" ? "enter" : "key";
  return playClick(char, kind, opts.volume ?? 0.45);
}

export type TypingSound = {
  /** A character landed. */
  type: (char: string) => void;
  /** A character was removed. */
  backspace: () => void;
};

/**
 * For a component that types by itself. `enabled` is the component's own `sound` option. The sound
 * follows the typing switch and the site-wide sound switch, and stays silent where autoplay sound
 * is not allowed (a grid of previews).
 */
export function useTypingSound(enabled = true): TypingSound {
  const allowed = useAutoplaySoundAllowed();
  const [on] = useTypingSoundEnabled();
  const live = React.useRef(false);
  React.useEffect(() => {
    live.current = enabled && allowed && on;
    // Download and decode the clicks once typing is audible, so the first character is in time.
    if (live.current) {
      void primeTypingSound();
      // Build the audio context now (a page that has been used allows it), so the first character is heard.
      if (userHasActed()) liveContext();
    }
  }, [enabled, allowed, on]);
  return React.useMemo<TypingSound>(
    () => ({
      type: (char) => {
        if (live.current) playTypingSound(char);
      },
      backspace: () => {
        if (live.current) playTypingSound("", { backspace: true });
      },
    }),
    [],
  );
}

/**
 * The simplest way to give a typing animation its sound: pass the text that is on screen right now.
 * A click plays each time it grows by a character, a Backspace each time it shrinks, and nothing when
 * the whole line is swapped or first appears.
 *
 *   useTypedText(visibleText, enableSound);
 */
export function useTypedText(text: string, enabled = true) {
  const typing = useTypingSound(enabled);
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.length > before.length && text.startsWith(before)) typing.type(text[text.length - 1] ?? "");
    else if (text.length < before.length && before.startsWith(text)) typing.backspace();
  }, [text, typing]);
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
