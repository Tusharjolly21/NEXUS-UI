Add the "Card Stack Rotator" component from Nexus UI to my project.

A stack of testimonial cards: flick the top card away and it flies out, drops behind the pile and slides home into the back slot with a wobble. The next card rises and its **highlighted** words get a fresh highlighter stroke. Also includes Rolodex Testimonials, quotes on a 3D rolodex drum that clicks to the next one, spins when dragged, coasts when flicked and always lands square on a card.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/card-stack-rotator/card-stack-rotator.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface CardData {
  id: string;
  /** Quote text. Wrap words in **double asterisks** to highlight them. */
  content: string;
  name: string;
  designation: string;
  avatarUrl?: string;
  initials?: string;
  company?: string;
  /** Kept for compatibility; not drawn. */
  companyLogoUrl?: string;
}

export interface CardStackRotatorProps {
  cards: CardData[];
  /** Throw the front card to the back every this many ms (paused on hover). 0 turns it off. */
  rotationInterval?: number;
  /** How many cards are drawn in the stack. */
  maxVisible?: number;
  /** How far each card behind peeks out below the one in front, in px. */
  stackOffset?: number;
  /** How much smaller each card behind is. */
  scaleStep?: number;
  /** CSS width of the stack. */
  cardWidth?: string;
  /** CSS height of each card. "auto" sizes to the tallest card. */
  cardHeight?: string;
  /** Overrides the card surface colour (defaults follow light and dark mode). */
  cardBackground?: string;
  /** Overrides the hairline around each card. */
  cardBorderColor?: string;
  /** Overrides the quote and name colour. */
  textColor?: string;
  /** Overrides the role and counter colour. */
  mutedColor?: string;
  /** Overrides the highlighter colour behind **highlighted** words. */
  highlightBackground?: string;
  /** Overrides the colour of **highlighted** words. */
  highlightTextColor?: string;
  contentFontSize?: string;
  nameFontSize?: string;
  designationFontSize?: string;
  borderRadius?: string;
  /** Shadow strength, 0–1. */
  shadowIntensity?: number;
  /** Pause `rotationInterval` while the pointer is over the stack. */
  pauseOnHover?: boolean;
  /** Which way cards are thrown: "forward" flicks left, "backward" flicks right. */
  direction?: "forward" | "backward";
  /** Hint under the stack. An empty string hides it. */
  hint?: string;
  /** Called with the id of the card that comes to the front. */
  onChange?: (id: string) => void;
  /** Flicks the top card away every 2.6s until someone touches the stack. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

const SETTLE = { type: "spring" as const, stiffness: 300, damping: 26 };
const TUCK = { type: "spring" as const, stiffness: 190, damping: 17, mass: 0.9 };
const SWIPE = 90;

/** Splits **marked** words out so they can be drawn with a highlighter. */
function parts(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((seg) => {
    const m = seg.match(/^\*\*([^*]+)\*\*$/);
    return m ? { mark: true, text: m[1] } : { mark: false, text: seg };
  });
}

function initialsOf(card: CardData) {
  return (
    card.initials ??
    card.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
  );
}

const TONES = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

type Look = Pick<
  CardStackRotatorProps,
  | "cardBackground"
  | "cardBorderColor"
  | "textColor"
  | "mutedColor"
  | "highlightBackground"
  | "highlightTextColor"
  | "contentFontSize"
  | "nameFontSize"
  | "designationFontSize"
  | "borderRadius"
>;

function Card({
  card,
  tone,
  slot,
  count,
  total,
  position,
  look,
  shadow,
  offset,
  scaleStep,
  throwDir,
  reduce,
  fixedHeight,
  onThrown,
  pulse,
  play,
}: {
  card: CardData;
  tone: string[];
  slot: number;
  count: number;
  total: number;
  position: number;
  look: Look;
  shadow: number;
  offset: number;
  scaleStep: number;
  throwDir: number;
  reduce: boolean;
  fixedHeight: boolean;
  onThrown: (dir: number) => void;
  /** Bumped by the parent to throw the front card programmatically. */
  pulse: number;
  play: (name: SoundName, volume?: number) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-14, 0, 14]);
  const front = slot === 0;
  const hidden = slot >= count;
  const seen = useRef(pulse);

  const fling = (dx: number, dy: number) => {
    const dir = Math.sign(dx) || throwDir;
    if (reduce) {
      onThrown(dir);
      return;
    }
    animate(x, dir * 300, { type: "spring", stiffness: 260, damping: 30, velocity: dx * 2 });
    animate(y, Math.max(-80, Math.min(40, dy * 0.4)) - 30, { type: "spring", stiffness: 260, damping: 30 });
    // Halfway out, drop behind the stack and slide home into the back slot.
    window.setTimeout(() => {
      onThrown(dir);
      animate(x, 0, TUCK);
      animate(y, 0, TUCK);
    }, 190);
  };
  const flingRef = useRef(fling);
  useEffect(() => {
    flingRef.current = fling;
  });

  useEffect(() => {
    if (pulse === seen.current) return;
    seen.current = pulse;
    if (front) flingRef.current(throwDir * 160, -40);
  }, [pulse, front, throwDir]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE || Math.abs(info.velocity.x) > 520) {
      play("swipe");
      fling(info.offset.x || info.velocity.x, info.offset.y);
    } else {
      animate(x, 0, SETTLE);
      animate(y, 0, SETTLE);
    }
  };

  const custom: CSSProperties = {
    background: look.cardBackground,
    color: look.textColor,
    borderRadius: look.borderRadius,
    boxShadow: `0 0 0 1px ${look.cardBorderColor ?? "var(--csr-line)"}, 0 ${Math.round(14 + shadow * 16)}px ${Math.round(28 + shadow * 30)}px -24px rgba(0,0,0,${(0.2 + shadow * 0.4).toFixed(2)})`,
  };
  const side = slot % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      className="col-start-1 row-start-1"
      style={{ zIndex: 50 - slot, transformOrigin: "50% 100%", height: fixedHeight ? "100%" : undefined }}
      initial={false}
      animate={{
        y: Math.min(slot, count - 1) * offset,
        scale: 1 - Math.min(slot, count - 1) * scaleStep,
        rotate: front || reduce ? 0 : side * Math.min(slot, 3) * 1.1,
        opacity: hidden ? 0 : 1,
      }}
      transition={TUCK}
      aria-hidden={!front}
    >
      <motion.figure
        drag={front && !reduce}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x, y, rotate, ...custom }}
        whileDrag={{ scale: 1.03 }}
        className="relative m-0 flex h-full cursor-grab touch-none select-none flex-col rounded-[24px] bg-white p-6 text-[#1d1d1f] [--csr-line:rgba(0,0,0,.05)] active:cursor-grabbing dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:[--csr-line:rgba(255,255,255,.08)]"
      >
        <motion.div className="flex h-full flex-col" animate={{ opacity: front ? 1 : slot === 1 ? 0.35 : 0 }} transition={{ duration: 0.25 }}>
          <div className="flex items-center justify-between">
            <svg width="20" height="15" viewBox="0 0 22 16" aria-hidden="true" className="fill-[#0071e3] dark:fill-[#0a84ff]">
              <path d="M0 16V9.6C0 4.2 2.6 1 7.8 0l1 2.2C5.9 3 4.5 4.8 4.4 7.4H9V16H0Zm12.6 0V9.6c0-5.4 2.6-8.6 7.8-9.6l1 2.2c-2.9.8-4.3 2.6-4.4 5.2h4.6V16h-9Z" />
            </svg>
            <span className="text-[12px] tabular-nums text-[#86868b] dark:text-[#a1a1a6]" style={{ color: look.mutedColor }}>
              {position} / {total}
            </span>
          </div>
          <blockquote
            className="m-0 mt-3 text-[17px] leading-[1.45] tracking-[-0.015em] [text-wrap:pretty]"
            style={{ fontSize: look.contentFontSize }}
          >
            {parts(card.content).map((p, i) =>
              p.mark ? (
                <Mark key={i} on={front} delay={0.25 + i * 0.08} bg={look.highlightBackground} ink={look.highlightTextColor} reduce={reduce}>
                  {p.text}
                </Mark>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )}
          </blockquote>
          <figcaption className="mt-auto flex items-center gap-3 pt-5">
            {card.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- consumer-supplied avatar of any origin
              <img src={card.avatarUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" draggable={false} />
            ) : (
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
                aria-hidden="true"
              >
                {initialsOf(card)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]" style={{ fontSize: look.nameFontSize }}>
                {card.name}
              </span>
              <span
                className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]"
                style={{ fontSize: look.designationFontSize, color: look.mutedColor }}
              >
                {card.designation}
                {card.company ? `, ${card.company}` : ""}
              </span>
            </span>
          </figcaption>
        </motion.div>
      </motion.figure>
    </motion.div>
  );
}

/** A highlighter stroke that sweeps in behind the words each time the card reaches the front. */
function Mark({ children, on, delay, bg, ink, reduce }: { children: ReactNode; on: boolean; delay: number; bg?: string; ink?: string; reduce: boolean }) {
  return (
    <span className="relative inline whitespace-pre-wrap">
      <motion.span
        aria-hidden="true"
        className="absolute -inset-x-[3px] inset-y-[1px] rounded-[5px] bg-[rgba(0,113,227,.13)] dark:bg-[rgba(10,132,255,.26)]"
        style={{ originX: 0, background: bg }}
        initial={false}
        animate={{ scaleX: on || reduce ? 1 : 0 }}
        transition={on && !reduce ? { type: "spring", stiffness: 160, damping: 20, delay } : { duration: 0.15 }}
      />
      <span className="relative font-medium text-[#0059b3] dark:text-[#6cb6ff]" style={{ color: ink }}>
        {children}
      </span>
    </span>
  );
}

/**
 * A stack of testimonial cards. Flick the top card away (or press the arrow
 * keys) and it flies out, drops behind the stack and slides home into the
 * back slot with a little wobble, while the next card rises and its
 * **highlighted** words get a fresh highlighter stroke.
 */
export function CardStackRotator({
  cards,
  rotationInterval = 0,
  maxVisible = 3,
  stackOffset = 14,
  scaleStep = 0.05,
  cardWidth = "420px",
  cardHeight = "auto",
  cardBackground,
  cardBorderColor,
  textColor,
  mutedColor,
  highlightBackground,
  highlightTextColor,
  contentFontSize,
  nameFontSize,
  designationFontSize,
  borderRadius,
  shadowIntensity = 0.5,
  pauseOnHover = true,
  direction = "forward",
  hint = "Flick the top card away.",
  onChange,
  autoplay = false,
  enableSound = true,
  className = "",
}: CardStackRotatorProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() === true;
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pulse, setPulse] = useState(0);
  const [paused, setPaused] = useState(false);
  const touched = useRef(false);
  const throwDir = direction === "backward" ? 1 : -1;
  const n = cards.length;
  // Re-seed the order when the number of cards changes.
  const [seenN, setSeenN] = useState(n);
  if (seenN !== n) {
    setSeenN(n);
    setOrder(cards.map((_, i) => i));
  }
  const changeRef = useRef(onChange);
  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  const rotate = (dir: 1 | -1) => {
    setOrder((o) => (o.length < 2 ? o : dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]));
  };

  const frontId = cards[order[0]]?.id;
  const lastFront = useRef(frontId);
  useEffect(() => {
    if (frontId === undefined || frontId === lastFront.current) return;
    lastFront.current = frontId;
    changeRef.current?.(frontId);
  }, [frontId]);

  useEffect(() => {
    if (!autoplay || n < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      play.auto("swipe");
      setPulse((p) => p + 1);
    }, 2600);
    return () => window.clearInterval(t);
  }, [autoplay, n, play]);

  useEffect(() => {
    if (!rotationInterval || n < 2 || (pauseOnHover && paused)) return;
    const t = window.setInterval(() => {
      play.auto("swipe");
      setPulse((p) => p + 1);
    }, rotationInterval);
    return () => window.clearInterval(t);
  }, [rotationInterval, n, pauseOnHover, paused, play]);

  if (!n) return null;

  const count = Math.max(1, Math.min(maxVisible, n));
  const look: Look = {
    cardBackground,
    cardBorderColor,
    textColor,
    mutedColor,
    highlightBackground,
    highlightTextColor,
    contentFontSize,
    nameFontSize,
    designationFontSize,
    borderRadius,
  };
  const fixedHeight = cardHeight !== "auto";
  const frontCard = cards[order[0]] ?? cards[0];

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      touched.current = true;
      play("swipe");
      setPulse((p) => p + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      touched.current = true;
      play("swipe");
      rotate(-1);
    }
  };

  return (
    <div className={`flex max-w-full flex-col items-center gap-4 ${className}`} style={{ width: cardWidth }}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`Testimonials, ${(order[0] ?? 0) + 1} of ${n}: ${frontCard.name}`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={() => {
          touched.current = true;
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative grid w-full rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        style={{ height: fixedHeight ? cardHeight : undefined, marginBottom: (count - 1) * stackOffset }}
      >
        {cards.map((card, i) => {
          const slot = order.indexOf(i);
          return (
            <Card
              key={card.id}
              card={card}
              tone={TONES[i % TONES.length]}
              slot={slot < 0 ? n : slot}
              count={count}
              total={n}
              position={i + 1}
              look={look}
              shadow={Math.max(0, Math.min(1, shadowIntensity))}
              offset={stackOffset}
              scaleStep={scaleStep}
              throwDir={throwDir}
              reduce={reduce}
              fixedHeight={fixedHeight}
              pulse={pulse}
              play={play}
              onThrown={() => rotate(1)}
            />
          );
        })}
        <span className="sr-only" aria-live="polite">
          {`${frontCard.content.replace(/\*\*/g, "")} ${frontCard.name}, ${frontCard.designation}`}
        </span>
      </div>
      {hint ? <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p> : null}
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

# Rolodex Testimonials

Add the "Rolodex Testimonials" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { RolodexTestimonials } from "@/components/card-stack-rotator/rolodex-testimonials";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/card-stack-rotator/rolodex-testimonials.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface RolodexCard {
  /** The quote, without quotation marks. */
  quote: string;
  /** Who said it. */
  name: string;
  /** Their role and company. */
  role: string;
  /** Two colours for the avatar gradient. */
  hue: [string, string];
}

export interface RolodexTestimonialsProps {
  /** The testimonials, in drum order. Defaults to ten demo quotes. */
  cards?: RolodexCard[];
  /** Clicks the drum round to the next quote every 2.6s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Called with the index of the card that is square at the front. */
  onChange?: (index: number) => void;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_CARDS: RolodexCard[] = [
  { quote: "We rebuilt our onboarding in a weekend. It finally feels like us.", name: "Maya Chen", role: "Design lead, Loop", hue: ["#ff9f0a", "#ff375f"] },
  { quote: "The motion explains the product before anyone reads a word.", name: "Arjun Rao", role: "Founder, Tally", hue: ["#30d158", "#0a84ff"] },
  { quote: "Our pricing page went from fine to the thing people screenshot.", name: "Lena Ortiz", role: "Growth, Wayfare", hue: ["#bf5af2", "#5e5ce6"] },
  { quote: "Copy, paste, ship. Nothing to fight with.", name: "Tom Becker", role: "Engineer, Relay", hue: ["#64d2ff", "#30d158"] },
  { quote: "Visitors play with the hero. Time on page doubled.", name: "Sara Kim", role: "PM, Orbitly", hue: ["#ff375f", "#bf5af2"] },
  { quote: "It feels expensive. It wasn't.", name: "Dev Patel", role: "Indie maker", hue: ["#ffd60a", "#ff9f0a"] },
  { quote: "Finally a library that respects reduced motion.", name: "Noor Haddad", role: "Accessibility, Quadrant", hue: ["#0a84ff", "#64d2ff"] },
  { quote: "Our devs and designers stopped arguing about animation.", name: "Eli Novak", role: "CTO, Parallel", hue: ["#5e5ce6", "#ff375f"] },
  { quote: "The small details are where it wins.", name: "Ana Lima", role: "Brand, Vela", hue: ["#30d158", "#ffd60a"] },
  { quote: "Clients ask who built our site. I just smile.", name: "Kai Ito", role: "Studio owner", hue: ["#ff9f0a", "#5e5ce6"] },
];

/** Height of one card in px. */
const CH = 150;

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

function Card({ card, i, step, radius, rot }: { card: RolodexCard; i: number; step: number; radius: number; rot: MotionValue<number> }) {
  // angle of this card relative to the front of the drum
  const rel = useTransform(rot, (r) => {
    let a = (i * step + r) % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
  });
  const opacity = useTransform(rel, (a) => Math.max(0, 1 - Math.abs(a) / 95));
  const shade = useTransform(rel, (a) => Math.min(0.5, Math.abs(a) / 180));
  // place on the drum: rotate about the drum's axis, then push out to its surface
  const transform = useTransform(rel, (a) => `translateZ(${-radius}px) rotateX(${a}deg) translateZ(${radius}px)`);
  return (
    <motion.figure
      className="absolute inset-x-0 top-1/2 m-0 flex flex-col justify-between rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_30px_-18px_rgba(0,0,0,.35)] [backface-visibility:hidden] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_14px_30px_-18px_rgba(0,0,0,.9)]"
      style={{ height: CH, marginTop: -CH / 2, transform, opacity }}
    >
      <blockquote className="m-0 text-[16px] leading-[1.4] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">“{card.quote}”</blockquote>
      <figcaption className="flex items-center gap-2.5">
        <span className="h-8 w-8 flex-none rounded-full" style={{ background: `linear-gradient(135deg, ${card.hue[0]}, ${card.hue[1]})` }} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{card.name}</span>
          <span className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{card.role}</span>
        </span>
      </figcaption>
      <motion.span className="pointer-events-none absolute inset-0 rounded-[20px] bg-[#1d1d1f] dark:bg-black" style={{ opacity: shade }} />
    </motion.figure>
  );
}

/**
 * Testimonials on a rolodex. The cards ride round a drum that clicks to the
 * next quote every few seconds; the ones above and below tip away and fade.
 * Drag it to spin, flick it hard and it keeps going, and it always
 * comes to rest square on a card. Arrow up and down turn it from the keyboard.
 */
export function RolodexTestimonials({ cards = DEFAULT_CARDS, autoplay = false, enableSound = true, onChange, className }: RolodexTestimonialsProps) {
  const play = useSound(enableSound);
  const lastTick = useRef(0);
  const still = useReducedMotion() === true;
  const n = cards.length;
  const step = n > 0 ? 360 / n : 360;
  const radius = n > 2 ? Math.round(CH / 2 / Math.tan(Math.PI / n)) + 10 : 0;
  const rot = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const drag = useRef<{ y: number; r: number; t: number; v: number } | null>(null);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(root);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const last = useRef(0);

  useMotionValueEvent(rot, "change", (r) => {
    if (n === 0) return;
    const i = ((Math.round(-r / step) % n) + n) % n;
    setActive(i);
    if (i !== last.current) {
      last.current = i;
      onChangeRef.current?.(i);
      // Autoplay stops for good on the first touch, so once touched every card change is the visitor's own.
      const now = performance.now();
      if (now - lastTick.current > 40) {
        lastTick.current = now;
        (touched.current ? play : play.auto)("tick", 0.4);
      }
    }
  });

  const settle = (velocity = 0) => {
    const projected = rot.get() + velocity * 0.25;
    const snap = Math.round(projected / step) * step;
    animate(rot, snap, still ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, velocity });
  };
  const goBy = useCallback(
    (k: number) => {
      animate(rot, Math.round(rot.get() / step) * step - k * step, still ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 });
    },
    [rot, step, still],
  );

  // Autoplay clicks to the next quote while the drum is on screen and the tab is visible.
  useEffect(() => {
    if (!autoplay || still || n < 2) return;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (onScreen.current) goBy(1);
    }, 2600);
    return () => window.clearInterval(id);
  }, [autoplay, still, n, goBy, onScreen]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    touch();
    rot.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, r: rot.get(), t: performance.now(), v: 0 };
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const nr = d.r - (e.clientY - d.y) * 0.45;
    d.v = (nr - rot.get()) / Math.max(0.008, (now - d.t) / 1000);
    d.t = now;
    rot.set(nr);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d) {
      if (Math.abs(d.v) > 200) play("swipe", 0.5);
      settle(d.v);
    }
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      touch();
      goBy(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      touch();
      goBy(-1);
    }
  };

  if (n === 0) return null;
  const front = cards[active] ?? cards[0];

  return (
    <div ref={root} className={cn("flex w-[380px] max-w-full flex-col items-center gap-4 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div
        className="relative h-[380px] w-full cursor-grab touch-none select-none rounded-[24px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] active:cursor-grabbing dark:focus-visible:outline-[#0a84ff]"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Testimonials. Use the up and down arrow keys to browse."
        aria-keyshortcuts="ArrowUp ArrowDown"
        onKeyDown={key}
      >
        {/* The fade at the top and bottom is a mask, so it follows whatever sits behind the drum. */}
        <div
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_21%,#000_79%,transparent)]"
          style={{ perspective: 900 }}
          aria-hidden="true"
        >
          <div className="absolute inset-x-4 inset-y-0" style={{ transformStyle: "preserve-3d" }}>
            {cards.map((c, i) => (
              <Card key={`${i}-${c.name}`} card={c} i={i} step={step} radius={radius} rot={rot} />
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live={live ? "polite" : "off"}>
          Testimonial {active + 1} of {n}: {front.quote} {front.name}, {front.role}
        </p>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {cards.map((c, i) => (
          <motion.span
            key={`${i}-${c.name}`}
            className="h-1.5 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            initial={false}
            animate={{ width: i === active ? 18 : 6, opacity: i === active ? 1 : 0.2 }}
          />
        ))}
      </div>
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
