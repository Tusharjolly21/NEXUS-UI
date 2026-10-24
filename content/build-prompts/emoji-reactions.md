Add the "Emoji Reactions" component from Nexus UI to my project.

A message with reaction chips that pop and roll their counts when tapped, plus a spring picker that adds new reactions with a layout animation. Also includes the Motion Kit Spark Reactions variant.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { EmojiReactions } from "@/components/emoji-reactions/emoji-reactions";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/emoji-reactions/emoji-reactions.tsx ---

```tsx
"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type Reaction = {
  emoji: string;
  count: number;
  /** Whether the current person has reacted with this emoji. */
  reacted?: boolean;
};

export type EmojiReactionsProps = {
  /** Text in the message bubble. Pass `null` to show only the reaction row. */
  message?: React.ReactNode;
  /** Starting reactions. */
  reactions?: Reaction[];
  /** Emojis offered in the picker. */
  emojis?: string[];
  /** Called whenever the reaction list changes. */
  onChange?: (reactions: Reaction[]) => void;
  /** Ring and tint colour for reactions you have added. */
  accent?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2 },
];

const DEFAULT_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"];

const spring = { type: "spring", stiffness: 520, damping: 32 } as const;

/** A key that changes every time the digit changes, so a digit that returns to an earlier value still rolls. */
function useDigitVersion(digit: string) {
  const [state, setState] = React.useState({ digit, version: 0 });
  if (state.digit !== digit) {
    const next = { digit, version: state.version + 1 };
    setState(next);
    return next.version;
  }
  return state.version;
}

function RollDigit({ digit, dir }: { digit: string; dir: number }) {
  const reduce = useReducedMotion();
  const version = useDigitVersion(digit);
  return (
    <span className="relative inline-flex h-[1.25em] w-[1ch] justify-center overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={dir}>
        <motion.span
          key={version}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: 0 }),
            center: { y: "0%", opacity: 1 },
            exit: (d: number) => ({ y: reduce ? 0 : `${-d * 100}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 460, damping: 34 }}
          className="inline-block leading-[1.25em]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** +1 when the value went up since the last render, -1 when it went down. */
function useRollDirection(value: number): 1 | -1 {
  const [state, setState] = React.useState<{ value: number; dir: 1 | -1 }>({ value, dir: 1 });
  if (state.value !== value) {
    const next = { value, dir: (value > state.value ? 1 : -1) as 1 | -1 };
    setState(next);
    return next.dir;
  }
  return state.dir;
}

function RollCount({ value }: { value: number }) {
  const dir = useRollDirection(value);
  const text = String(value);
  return (
    <span aria-hidden className="inline-flex tabular-nums">
      {text.split("").map((d, i) => (
        <RollDigit key={text.length - i} digit={d} dir={dir} />
      ))}
    </span>
  );
}

function Sparks({ color }: { color: string }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-1 -ml-0.5 -mt-0.5 rounded-full"
            style={{ background: i % 2 ? color : "#ffc94d" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 15, y: Math.sin(a) * 15, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

function Chip({
  reaction,
  accent,
  onToggle,
  popKey,
}: {
  reaction: Reaction;
  accent: string;
  onToggle: () => void;
  popKey: number;
}) {
  const reduce = useReducedMotion();
  const on = !!reaction.reacted;
  return (
    <motion.button
      layout
      type="button"
      aria-pressed={on}
      aria-label={`${reaction.emoji} ${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"}${on ? ", including yours" : ""}`}
      onClick={onToggle}
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={spring}
      className={cn(
        "relative inline-flex h-8 items-center gap-1.5 rounded-full border pl-2 pr-2.5 text-[13px] font-medium outline-none",
        "transition-[background-color,border-color,box-shadow] duration-200",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        on
          ? "text-[#17181a] dark:text-zinc-50"
          : "border-black/[0.07] bg-white text-[#3c3b37] shadow-[0_1px_2px_rgba(16,17,20,0.05)] hover:bg-neutral-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
      style={
        on
          ? {
              borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${accent} 30%, transparent)`,
              ["--tw-ring-color" as string]: accent,
            }
          : { ["--tw-ring-color" as string]: accent }
      }
    >
      <span className="relative grid size-[18px] place-items-center">
        {popKey > 0 && on && !reduce ? <Sparks key={`sparks-${popKey}`} color={accent} /> : null}
        <motion.span
          key={popKey}
          initial={popKey === 0 || reduce ? false : { scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 14 }}
          className="text-[16px] leading-none"
        >
          {reaction.emoji}
        </motion.span>
      </span>
      <RollCount value={reaction.count} />
    </motion.button>
  );
}

export function EmojiReactions({
  message = "Shipped the new onboarding flow",
  reactions: initial = DEFAULT_REACTIONS,
  emojis = DEFAULT_EMOJIS,
  onChange,
  accent = "#5b8def",
  enableSound = true,
  className,
}: EmojiReactionsProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion();
  const [list, setList] = React.useState<Reaction[]>(initial);
  const [pops, setPops] = React.useState<Record<string, number>>({});
  const [open, setOpen] = React.useState(false);
  // only move focus around when the picker is driven from the keyboard
  const [viaKeyboard, setViaKeyboard] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const pickerId = React.useId();

  const commit = (next: Reaction[]) => {
    setList(next);
    onChange?.(next);
  };

  const toggle = (emoji: string) => {
    const existing = list.find((r) => r.emoji === emoji);
    let next: Reaction[];
    let added = false;
    if (!existing) {
      next = [...list, { emoji, count: 1, reacted: true }];
      added = true;
    } else if (existing.reacted) {
      next = list
        .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r))
        .filter((r) => r.count > 0);
    } else {
      next = list.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r));
      added = true;
    }
    if (added) setPops((p) => ({ ...p, [emoji]: (p[emoji] ?? 0) + 1 }));
    if (added) play("pop");
    else play("off", 0.5);
    commit(next);
  };

  const pick = (emoji: string) => {
    const existing = list.find((r) => r.emoji === emoji);
    if (!existing?.reacted) toggle(emoji);
    setOpen(false);
    if (viaKeyboard) triggerRef.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (pickerRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("inline-flex flex-col items-start gap-2.5", className)}>
      {message !== null ? (
        <div className="rounded-[20px] rounded-bl-md border border-black/[0.06] bg-white px-4 py-2.5 text-[15px] leading-snug text-[#17181a] shadow-[0_1px_2px_rgba(16,17,20,0.05),0_8px_24px_-12px_rgba(16,17,20,0.18)] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50">
          {message}
        </div>
      ) : null}

      <LayoutGroup>
        <motion.div layout className="relative flex flex-wrap items-center gap-1.5" role="group" aria-label="Reactions">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((r) => (
              <Chip key={r.emoji} reaction={r} accent={accent} popKey={pops[r.emoji] ?? 0} onToggle={() => toggle(r.emoji)} />
            ))}
          </AnimatePresence>

          <motion.div layout transition={spring} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-label="Add reaction"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={open ? pickerId : undefined}
              onPointerDown={() => setViaKeyboard(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") setViaKeyboard(true);
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "grid size-8 place-items-center rounded-full border text-[#73726d] outline-none transition-colors",
                "border-black/[0.07] bg-white hover:bg-neutral-50 hover:text-[#17181a] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                open && "bg-neutral-100 text-[#17181a] dark:bg-zinc-800 dark:text-zinc-100",
              )}
              style={{ ["--tw-ring-color" as string]: accent }}
            >
              <SmilePlus className="size-[17px]" strokeWidth={1.8} />
            </button>

            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={pickerRef}
                  id={pickerId}
                  role="menu"
                  aria-label="Pick a reaction"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -6 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30 }}
                  style={{ transformOrigin: "calc(100% - 16px) 0%" }}
                  className="absolute right-0 top-[calc(100%+8px)] z-20 flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white p-1 shadow-[0_2px_6px_rgba(16,17,20,0.06),0_16px_36px_-12px_rgba(16,17,20,0.28)] dark:border-white/10 dark:bg-zinc-900"
                >
                  {emojis.map((emoji, i) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      role="menuitem"
                      aria-label={`React with ${emoji}`}
                      autoFocus={viaKeyboard && i === 0}
                      onClick={() => pick(emoji)}
                      initial={reduce ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : 0.02 * i, type: "spring", stiffness: 600, damping: 30 }}
                      whileHover={reduce ? undefined : { scale: 1.35, y: -4 }}
                      whileTap={reduce ? undefined : { scale: 0.9 }}
                      className="grid size-9 place-items-center rounded-full text-[20px] leading-none outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
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

# Spark Reactions

Add the "Spark Reactions" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `lucide-react` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DEFAULT_SPARK_OPTIONS, DEFAULT_SPARK_REACTIONS, SparkReactions } from "@/components/emoji-reactions/spark-reactions";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/emoji-reactions/spark-reactions.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SparkReactionOption {
  /** Stable key. */
  id: string;
  /** Accessible name, e.g. "Rocket". */
  label: string;
  /** SVG path data on a 24×24 grid, drawn as a 2px round stroke. */
  d: string;
  /** Stroke colour; also the colour of its sparks. */
  color: string;
  /** Stroke colour in dark mode, for icons drawn in a near-black. Defaults to `color`. */
  darkColor?: string;
}

export interface SparkReaction {
  /** Option id this count belongs to. */
  id: string;
  /** How many people reacted, including you. */
  count: number;
  /** Whether you are one of them. */
  mine: boolean;
}

export const DEFAULT_SPARK_OPTIONS: SparkReactionOption[] = [
  { id: "rocket", label: "Rocket", color: "#5e5ce6", d: "M12 2c3 2 5 6 4 11l-2 3h-4l-2-3C7 8 9 4 12 2zM9 16l-3 3 1-4M15 16l3 3-1-4M12 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { id: "fire", label: "Fire", color: "#ff9f0a", d: "M12 22c4 0 7-3 7-7 0-4-3-6-4-10-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 7-4 13 0 4 3 7 7 7zM12 22c-2 0-3-1.5-3-3.5S11 15 12 13c1 2 3 3.5 3 5.5S14 22 12 22z" },
  { id: "heart", label: "Heart", color: "#ff375f", d: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" },
  { id: "eyes", label: "Eyes", color: "#1d1d1f", darkColor: "#f5f5f7", d: "M7 12a3 4 0 1 0 0 .01M17 12a3 4 0 1 0 0 .01M2 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7zM12 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7z" },
  { id: "check", label: "Done", color: "#30d158", d: "M5 12.5l4.5 4.5L19 7.5" },
  { id: "party", label: "Party", color: "#bf5af2", d: "M3 21l5-14 9 9zM14 3v3M19 5l-2 2M21 10h-3M8 7l9 9" },
];

export const DEFAULT_SPARK_REACTIONS: SparkReaction[] = [
  { id: "rocket", count: 3, mine: false },
  { id: "fire", count: 2, mine: false },
];

export interface SparkReactionsProps {
  /** The message the reactions belong to. */
  message?: string;
  /** Starting reactions, in row order. */
  reactions?: SparkReaction[];
  /** Reactions offered in the picker; also the icon set for `reactions`. */
  options?: SparkReactionOption[];
  /** Called with the new row after the user adds or removes a reaction. */
  onChange?: (reactions: SparkReaction[]) => void;
  /** Reacts, opens the picker and un-reacts on a loop until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** Adds yours to a reaction (appending it if new) or takes yours away, dropping empty ones. */
function applyToggle(l: SparkReaction[], id: string): SparkReaction[] {
  const ex = l.find((r) => r.id === id);
  if (!ex) return [...l, { id, count: 1, mine: true }];
  return l
    .map((r) => (r.id === id ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) } : r))
    .filter((r) => r.count > 0);
}

function Icon({ option, dark, size = 16 }: { option: SparkReactionOption; dark: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={dark ? option.darkColor ?? option.color : option.color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={option.d} />
    </svg>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="relative inline-flex h-5 min-w-[10px] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={n}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {n}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

/**
 * Message reactions. Tap a pill to add or remove yours: the count rolls and
 * the icon pops with a few sparks. The smiley opens a picker; a new reaction
 * slides into the row and the others make room.
 */
export function SparkReactions({
  message = "Shipped the new onboarding flow",
  reactions = DEFAULT_SPARK_REACTIONS,
  options = DEFAULT_SPARK_OPTIONS,
  onChange,
  autoplay = false,
  enableSound = true,
  className = "",
}: SparkReactionsProps) {
  const play = useSound(enableSound);
  const [list, setList] = useState<SparkReaction[]>(reactions);
  const [picker, setPicker] = useState(false);
  const [pop, setPop] = useState<{ id: string; n: number } | null>(null);
  const touched = useRef(false);
  const listNow = useRef(list);
  useEffect(() => {
    listNow.current = list;
  });
  const addBtn = useRef<HTMLButtonElement>(null);
  const dark = useIsDark();
  const byId = new Map(options.map((o) => [o.id, o]));

  const sparkle = (id: string) => setPop((p) => ({ id, n: (p?.n ?? 0) + 1 }));

  const toggle = (id: string) => {
    touched.current = true;
    if (list.find((r) => r.id === id)?.mine) play("off", 0.5);
    else play("pop");
    const next = applyToggle(list, id);
    setList(next);
    sparkle(id);
    onChange?.(next);
  };

  useEffect(() => {
    if (!autoplay) return;
    const bump = (id: string) => {
      if (listNow.current.find((r) => r.id === id)?.mine) play.auto("off", 0.5);
      else play.auto("pop");
      setList((l) => applyToggle(l, id));
      setPop((p) => ({ id, n: (p?.n ?? 0) + 1 }));
    };
    const steps = [
      () => bump("rocket"),
      () => setPicker(true),
      () => {
        setPicker(false);
        bump("heart");
      },
      () => bump("fire"),
      () => bump("heart"),
      () => bump("rocket"),
      () => bump("fire"),
    ];
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      steps[k++ % steps.length]();
    }, 1300);
    return () => window.clearInterval(t);
  }, [autoplay, play]);

  const closeOnEscape = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !picker) return;
    e.preventDefault();
    setPicker(false);
    addBtn.current?.focus();
  };

  return (
    <div
      className={`flex w-[300px] max-w-full flex-col items-start gap-2 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        closeOnEscape(e);
      }}
    >
      <div className="rounded-[20px] rounded-bl-md bg-[#f0f0f3] px-4 py-2.5 text-[15px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
        {message}
      </div>
      <motion.div layout className="relative flex flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((r) => {
            const o = byId.get(r.id);
            if (!o) return null;
            const popping = pop?.id === r.id;
            return (
              <motion.button
                layout
                key={r.id}
                type="button"
                aria-pressed={r.mine}
                aria-label={`${o.label}, ${r.count}`}
                onClick={() => toggle(r.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: r.mine ? (dark ? "#0f2c4d" : "#e8f1fd") : dark ? "#1c1c1e" : "#ffffff",
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className={`relative flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] ${FOCUS} ${
                  r.mine
                    ? "shadow-[inset_0_0_0_1.5px_#0071e3] dark:shadow-[inset_0_0_0_1.5px_#0a84ff]"
                    : "shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
                }`}
              >
                <motion.span
                  key={popping ? `${r.id}-${pop.n}` : r.id}
                  className="relative flex"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.5, 1], rotate: [0, -12, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon option={o} dark={dark} />
                  {popping &&
                    Array.from({ length: 6 }, (_, k) => (
                      <motion.span
                        key={k}
                        className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                        style={{ background: dark ? o.darkColor ?? o.color : o.color }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos((k / 6) * 6.28) * 16, y: Math.sin((k / 6) * 6.28) * 16, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                </motion.span>
                <Count n={r.count} />
              </motion.button>
            );
          })}
        </AnimatePresence>
        <motion.button
          ref={addBtn}
          layout
          type="button"
          aria-label="Add reaction"
          aria-expanded={picker}
          onClick={() => {
            touched.current = true;
            setPicker((p) => !p);
          }}
          whileTap={{ scale: 0.88 }}
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:text-[#a1a1a6] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] ${FOCUS}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
          </svg>
        </motion.button>
        <AnimatePresence>
          {picker && (
            <motion.div
              role="group"
              aria-label="Pick a reaction"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0 top-10 z-10 flex max-w-full flex-wrap gap-1 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-12px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-12px_rgba(0,0,0,.8)]"
              style={{ transformOrigin: "left top" }}
            >
              {options.map((o, k) => (
                <motion.button
                  key={o.id}
                  type="button"
                  aria-label={o.label}
                  onClick={() => {
                    toggle(o.id);
                    setPicker(false);
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: k * 0.03, type: "spring", stiffness: 600, damping: 20 }}
                  whileHover={{ scale: 1.3, y: -3 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
                >
                  <Icon option={o} dark={dark} size={18} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
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
