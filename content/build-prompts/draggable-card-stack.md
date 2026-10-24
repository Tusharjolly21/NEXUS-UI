Add the "Draggable Card Stack" component from Nexus UI to my project.

A pile of photo cards you can fling: grab the top card and throw it any direction and it leans into the throw, flies off, then tucks back under the pile while the next card pops up with a little overshoot. The right arrow sends the top card away and the left arrow pulls the bottom card back; images, videos or drawn scenes all work. Also includes Spread Deck, a photo pile that deals itself into a grid, then flies one photo to the front while the rest gather in the corner. Also includes Riffle Stack, a feature deck you shuffle like real cards: riffle bows two halves apart and falls them back in clumps, cut slides the top half under.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DraggableCardStack } from "@/components/draggable-card-stack/draggable-card-stack";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/draggable-card-stack/draggable-card-stack.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export type StackCard = {
  id: string;
  title?: string;
  subtitle?: string;
  /** Image or video URL. Without it the card shows `bg` or a drawn scene. */
  media?: string;
  type?: "image" | "video";
  /** CSS background used when there is no `media`. */
  bg?: string;
};

export type DraggableCardStackProps = {
  /** Cards from top to bottom. */
  cards?: StackCard[];
  className?: string;
  /** Card width in px. */
  cardWidth?: number;
  /** Card height in px. */
  cardHeight?: number;
  /** Corner radius in px. */
  borderRadius?: number;
  /** Drop-shadow strength, 0-1. */
  shadowStrength?: number;
  /** Extra downward offset per card in the pile, in px. */
  stackOffset?: number;
  /** Largest resting tilt of the cards underneath, in degrees. */
  maxRotation?: number;
  /** How much smaller each card underneath is (0.04 = 4%). */
  depthScale?: number;
  /** Title and subtitle over the top card. */
  showOverlay?: boolean;
  /** Scale of the top card under the pointer. */
  hoverScale?: number;
  /** @deprecated Motion is spring-driven now; kept so old code still compiles. */
  transitionDuration?: number;
  /** Called with the id of the new top card. */
  onChange?: (id: string) => void;
  /** Hint under the stack. Empty string hides it. */
  hint?: string;
  /** Flings the top card every `autoInterval` ms until someone touches the stack. */
  autoplay?: boolean;
  /** @deprecated Same as `autoplay`. */
  autoPlay?: boolean;
  /** Time between autoplay flings, in ms. */
  autoInterval?: number;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

type Scene = { sky: [string, string]; sun: string; hills: [string, string] };

const SCENES: Scene[] = [
  { sky: ["#ffd3a5", "#fd6585"], sun: "#fff4d6", hills: ["#c2416b", "#7a1f4b"] },
  { sky: ["#a1c4fd", "#c2e9fb"], sun: "#ffffff", hills: ["#5b8def", "#2c5ac9"] },
  { sky: ["#fbc2eb", "#a18cd1"], sun: "#fff0fb", hills: ["#7b5bd6", "#4a2f9c"] },
  { sky: ["#d4fc79", "#96e6a1"], sun: "#fffbe0", hills: ["#2f9e62", "#1b6b44"] },
  { sky: ["#fddb92", "#f6a04d"], sun: "#fff7e0", hills: ["#d0612d", "#8f3416"] },
];

const DEFAULT_CARDS: StackCard[] = [
  { id: "1", title: "Big Sur", subtitle: "Coast road at dusk" },
  { id: "2", title: "Lofoten", subtitle: "Blue hour over the bay" },
  { id: "3", title: "Kyoto", subtitle: "Lanterns after rain" },
  { id: "4", title: "Madeira", subtitle: "Above the cloud line" },
  { id: "5", title: "Wadi Rum", subtitle: "Sand at first light" },
];

/** Resting tilt per depth, as a share of maxRotation. Index 0 (top) is always flat. */
const TILT = [0, -0.6, 0.45, -0.3, 0.7, -0.5];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Art({ card, index, onVideo }: { card: StackCard; index: number; onVideo?: (el: HTMLVideoElement | null) => void }) {
  if (card.media && card.type === "video") {
    return <video ref={onVideo} src={card.media} className="absolute inset-0 h-full w-full object-cover" loop muted playsInline preload="metadata" />;
  }
  if (card.media) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={card.media} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />;
  }
  if (card.bg) return <span className="absolute inset-0" style={{ background: card.bg }} />;
  const s = SCENES[index % SCENES.length];
  return (
    <span className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]})` }} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice">
        <circle cx={30 + (index % 3) * 20} cy="48" r="13" fill={s.sun} opacity=".92" />
        <path d="M0 92 C 18 78, 32 88, 50 80 S 82 70, 100 82 V140 H0Z" fill={s.hills[0]} opacity=".85" />
        <path d="M0 108 C 22 98, 42 110, 64 102 S 90 96, 100 100 V140 H0Z" fill={s.hills[1]} />
      </svg>
    </span>
  );
}

function Item({
  card,
  index,
  depth,
  total,
  lift,
  width,
  height,
  radius,
  shadow,
  stackOffset,
  maxRotation,
  depthScale,
  showOverlay,
  hoverScale,
  still,
  incoming,
  register,
  onThrow,
  onVideo,
  play,
}: {
  card: StackCard;
  index: number;
  depth: number;
  total: number;
  lift: MotionValue<number>;
  width: number;
  height: number;
  radius: number;
  shadow: string;
  stackOffset: number;
  maxRotation: number;
  depthScale: number;
  showOverlay: boolean;
  hoverScale: number;
  still: boolean;
  incoming: number;
  register: (id: string, fn: ((dir: number) => void) | null) => void;
  onThrow: (id: string) => void;
  onVideo: (id: string, el: HTMLVideoElement | null) => void;
  play: (name: SoundName, volume?: number) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const depthMv = useMotionValue(depth);
  const vx = useVelocity(x);
  // Follow-through: the card leans into the direction it is moving, then springs flat.
  const lean = useSpring(useTransform(vx, (v) => (still ? 0 : clamp(v / 140, -12, 12))), { stiffness: 260, damping: 18 });
  const rotate = useTransform([x, lean], ([a, b]) => clamp((a as number) / 14, -16, 16) + (b as number));
  const liftScale = useTransform([lift, depthMv], ([l, d]) => ((d as number) === 1 ? 1 + (l as number) * depthScale : 1));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hover, setHover] = useState(false);
  const top = depth === 0;

  useEffect(() => {
    depthMv.set(depth);
  }, [depth, depthMv]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const fling = useCallback(
    (ux: number, uy: number, v = { x: 0, y: 0 }) => {
      const len = Math.hypot(ux, uy) || 1;
      const dist = Math.max(width, height) * 1.25;
      const cfg = { type: "spring" as const, stiffness: 110, damping: 20 };
      animate(x, (ux / len) * dist, { ...cfg, velocity: v.x });
      animate(y, (uy / len) * dist, { ...cfg, velocity: v.y });
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => {
          onThrow(card.id);
          const back = { type: "spring" as const, stiffness: 170, damping: 22 };
          animate(x, 0, back);
          animate(y, 0, back);
        },
        still ? 0 : 230,
      );
    },
    [x, y, width, height, onThrow, card.id, still],
  );

  useEffect(() => {
    if (!top) return;
    register(card.id, (dir) => fling(dir, dir === 0 ? -1 : -0.25));
    return () => register(card.id, null);
  }, [top, card.id, register, fling]);

  // Pulled back from the bottom of the pile: slide in from the left.
  useEffect(() => {
    if (!incoming || !top) return;
    x.set(-width * 1.3);
    y.set(-20);
    animate(x, 0, { type: "spring", stiffness: 200, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 200, damping: 20 });
  }, [incoming, top, x, y, width]);

  const end = (_: unknown, info: PanInfo) => {
    const far = Math.hypot(info.offset.x, info.offset.y) > 110 || Math.hypot(info.velocity.x, info.velocity.y) > 650;
    animate(lift, 0, { type: "spring", stiffness: 300, damping: 26 });
    if (far) {
      play("swipe");
      const ux = Math.abs(info.velocity.x) > 200 || Math.abs(info.velocity.y) > 200 ? info.velocity.x : info.offset.x;
      const uy = Math.abs(info.velocity.x) > 200 || Math.abs(info.velocity.y) > 200 ? info.velocity.y : info.offset.y;
      fling(ux, uy, info.velocity);
      return;
    }
    play("drop", 0.6);
    animate(x, 0, { type: "spring", stiffness: 420, damping: 26 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 26 });
  };

  const slotScale = 1 - Math.min(depth, 4) * depthScale;
  const slotY = Math.min(depth, 4) * stackOffset + (depth > 0 ? Math.min(depth, 3) * 4 : 0);
  const slotRot = (TILT[depth % TILT.length] ?? 0) * maxRotation;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: total - depth }}
      initial={false}
      animate={{ scale: slotScale, y: slotY, rotate: slotRot, opacity: depth > 4 ? 0 : 1 }}
      transition={{ type: "spring", stiffness: still ? 600 : 300, damping: still ? 60 : 15, mass: 0.8 }}
    >
      <motion.div
        className={`absolute inset-0 ${top ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ x, y, rotate, scale: liftScale, touchAction: top ? "none" : "auto" }}
        drag={top}
        dragMomentum={false}
        dragElastic={1}
        onDragStart={() => play("lift", 0.7)}
        onDrag={(_, info) => lift.set(Math.min(1, Math.hypot(info.offset.x, info.offset.y) / 160))}
        onDragEnd={end}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
      >
        <motion.div
          className="absolute inset-0 overflow-hidden bg-white dark:bg-[#2c2c2e]"
          style={{ borderRadius: radius, boxShadow: shadow }}
          animate={{ scale: top && hover ? hoverScale : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          <Art card={card} index={index} onVideo={(el) => onVideo(card.id, el)} />
          <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]" style={{ borderRadius: radius }} aria-hidden="true" />
          {showOverlay && (card.title || card.subtitle) ? (
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(0,0,0,.55),transparent)] px-4 pb-4 pt-12 text-white"
              initial={false}
              animate={{ opacity: top ? 1 : 0, y: top ? 0 : 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              {card.title ? <p className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">{card.title}</p> : null}
              {card.subtitle ? <p className="mt-0.5 text-[12px] text-white/85">{card.subtitle}</p> : null}
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * A pile of photo cards. Grab the top one and fling it any direction: it
 * leans into the throw, flies off, then tucks back under the pile while the
 * next card pops up with a little overshoot. Arrow keys send the top card
 * away or pull the bottom one back.
 */
export function DraggableCardStack({
  cards = DEFAULT_CARDS,
  className = "",
  cardWidth = 220,
  cardHeight = 296,
  borderRadius = 22,
  shadowStrength = 1,
  stackOffset = 0,
  maxRotation = 9,
  depthScale = 0.045,
  showOverlay = true,
  hoverScale = 1.03,
  onChange,
  hint = "Fling the top card. Arrow keys work too.",
  autoplay,
  autoPlay,
  autoInterval = 2400,
  enableSound = true,
}: DraggableCardStackProps) {
  const play = useSound(enableSound);
  const still = useReducedMotion() === true;
  const ids = cards.map((c) => c.id).join("\u0000");
  const [order, setOrder] = useState<string[]>(() => cards.map((c) => c.id));
  const [syncedIds, setSyncedIds] = useState(ids);
  const [incoming, setIncoming] = useState<{ id: string; n: number } | null>(null);
  const lift = useMotionValue(0);
  const throwers = useRef(new Map<string, (dir: number) => void>());
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const touched = useRef(false);
  const busy = useRef(false);

  // New `cards` prop: start over with its order (adjusting state during render, not in an effect).
  if (ids !== syncedIds) {
    setSyncedIds(ids);
    setOrder(cards.map((c) => c.id));
  }

  const byId = new Map(cards.map((c, i) => [c.id, { card: c, index: i }]));
  const live = order.filter((id) => byId.has(id));
  const topId = live[0];

  useEffect(() => {
    videos.current.forEach((v, id) => {
      if (id === topId) void v.play().catch(() => {});
      else v.pause();
    });
  }, [topId]);

  const register = useCallback((id: string, fn: ((dir: number) => void) | null) => {
    if (fn) throwers.current.set(id, fn);
    else throwers.current.delete(id);
  }, []);

  const onThrow = useCallback(
    (id: string) => {
      busy.current = false;
      lift.set(0);
      setIncoming(null);
      setOrder((o) => {
        const next = [...o.filter((x) => x !== id), id];
        if (next[0]) onChange?.(next[0]);
        return next;
      });
    },
    [lift, onChange],
  );

  const topRef = useRef(topId);
  useEffect(() => {
    topRef.current = topId;
  }, [topId]);

  const sendAway = useCallback((dir = 1) => {
    const id = topRef.current;
    if (busy.current || !id) return;
    const f = throwers.current.get(id);
    if (!f) return;
    busy.current = true;
    f(dir);
  }, []);

  const bringBack = () => {
    if (busy.current || live.length < 2) return;
    const last = live[live.length - 1];
    setOrder([last, ...live.slice(0, -1)]);
    setIncoming((p) => ({ id: last, n: (p?.n ?? 0) + 1 }));
    onChange?.(last);
  };

  const demo = autoplay ?? autoPlay ?? false;
  useEffect(() => {
    if (!demo) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      if (!busy.current) play.auto("swipe");
      sendAway(k++ % 2 === 0 ? 1 : -1);
    }, Math.max(900, autoInterval));
    return () => clearInterval(t);
  }, [demo, autoInterval, sendAway, play]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      touched.current = true;
      if (!busy.current) play("swipe");
      sendAway(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      touched.current = true;
      if (!busy.current && live.length > 1) play("swipe", 0.7);
      bringBack();
    }
  };

  const s = clamp(shadowStrength, 0, 1);
  const shadow = `0 0 0 1px rgba(0,0,0,.04), 0 ${Math.round(10 + s * 14)}px ${Math.round(20 + s * 30)}px -${Math.round(10 + s * 6)}px rgba(0,0,0,${(0.12 + s * 0.3).toFixed(2)})`;
  const top = topId ? byId.get(topId)?.card : undefined;
  const pos = topId ? (byId.get(topId)?.index ?? 0) + 1 : 0;

  return (
    <div className={`flex max-w-full flex-col items-center gap-4 ${className}`}>
      <div
        role="group"
        aria-roledescription="card stack"
        aria-label={`Card stack, ${top?.title ?? "card"} on top. Right arrow sends it to the back, left arrow brings the last card back.`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={() => {
          touched.current = true;
        }}
        className="relative select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-8 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        style={{ width: cardWidth, height: cardHeight, maxWidth: "100%" }}
      >
        {live.map((id, depth) => {
          const entry = byId.get(id);
          if (!entry) return null;
          return (
            <Item
              key={id}
              card={entry.card}
              index={entry.index}
              depth={depth}
              total={live.length}
              lift={lift}
              width={cardWidth}
              height={cardHeight}
              radius={borderRadius}
              shadow={shadow}
              stackOffset={stackOffset}
              maxRotation={maxRotation}
              depthScale={depthScale}
              showOverlay={showOverlay}
              hoverScale={hoverScale}
              still={still}
              incoming={incoming?.id === id ? incoming.n : 0}
              register={register}
              play={play}
              onThrow={onThrow}
              onVideo={(cid, el) => {
                if (el) videos.current.set(cid, el);
                else videos.current.delete(cid);
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-0.5" aria-live="polite">
        <span className="text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">
          {pos} <span className="font-normal text-[#86868b] dark:text-[#98989d]">/ {cards.length}</span>
        </span>
        {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
      </div>
    </div>
  );
}

export default DraggableCardStack;
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

# Spread Deck

Add the "Spread Deck" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { SpreadDeck } from "@/components/draggable-card-stack/spread-deck";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/draggable-card-stack/spread-deck.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface SpreadDeckPhoto {
  /** Caption under the picture. */
  title: string;
  /** Smaller line under the caption. */
  sub: string;
  /** Top and bottom colour of the sky. */
  sky: [string, string];
  /** Colour of the sun and its glow. */
  sun: string;
  /** Back and front colour of the two hills. */
  land: [string, string];
}

export interface SpreadDeckProps {
  /** The photos. They are drawn as gradient landscapes, so no images are loaded. Defaults to six demo places. */
  photos?: SpreadDeckPhoto[];
  /** Walks through pile, grid and focus by itself every 2.2s until someone touches the deck. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_PHOTOS: SpreadDeckPhoto[] = [
  { title: "Lofoten", sub: "Norway", sky: ["#a1c4fd", "#c2e9fb"], sun: "#ffffff", land: ["#4a6fa5", "#2d4a7a"] },
  { title: "Big Sur", sub: "California", sky: ["#ff9a8b", "#ffd3a5"], sun: "#fff3d6", land: ["#c45b7a", "#6b2c4a"] },
  { title: "Atacama", sub: "Chile", sky: ["#fbc2eb", "#a6c1ee"], sun: "#fff", land: ["#c28f6b", "#7a4e33"] },
  { title: "Kyoto", sub: "Japan", sky: ["#d4fc79", "#96e6a1"], sun: "#fffbe6", land: ["#3f8f5c", "#1f5a39"] },
  { title: "Patagonia", sub: "Argentina", sky: ["#89f7fe", "#66a6ff"], sun: "#ffffff", land: ["#e8eef7", "#9fb3cc"] },
  { title: "Sahara", sub: "Morocco", sky: ["#fddb92", "#f6a96b"], sun: "#fff8e1", land: ["#e0954f", "#a85c26"] },
];

const CW = 150;
const CH = 200;
const H = 440;
const GAP = 16;
const TILT = [-7, 5, -3, 8, -5, 2];
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Mode = { kind: "stack" } | { kind: "grid" } | { kind: "focus"; i: number };

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

function Scene({ p }: { p: SpreadDeckPhoto }) {
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.sky[0]}, ${p.sky[1]})` }}>
      <span className="absolute left-[58%] top-[22%] h-10 w-10 rounded-full" style={{ background: p.sun, boxShadow: `0 0 30px ${p.sun}` }} />
      <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full" viewBox="0 0 150 110" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C 30 30, 60 60, 90 40 S 140 30, 150 45 V110 H0Z" fill={p.land[0]} />
        <path d="M0 75 C 40 55, 70 85, 110 65 S 145 70, 150 72 V110 H0Z" fill={p.land[1]} />
      </svg>
    </div>
  );
}

/** Dealing out swipes, picking one up lifts, gathering the pile back up drops. */
function sound(m: Mode, say: (name: SoundName, volume?: number) => void) {
  if (m.kind === "grid") say("swipe", 0.7);
  else if (m.kind === "focus") say("lift", 0.7);
  else say("drop", 0.7);
}

/**
 * A photo deck with three states. Tap the pile and it deals itself out into a
 * grid; tap a photo and it flies to the middle and grows while the rest
 * gather into a little pile in the corner; tap again to go back, or stack it
 * all up. Every move is the same cards travelling, never a swap. The photos
 * are drawn from gradients, so nothing is fetched.
 */
export function SpreadDeck({ photos = DEFAULT_PHOTOS, autoplay = false, enableSound = true, className }: SpreadDeckProps) {
  const play = useSound(enableSound);
  const still = useReducedMotion() === true;
  const n = photos.length;
  const [mode, setMode] = useState<Mode>({ kind: "stack" });
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Unknown until the stage is measured, so the cards never travel from a guessed size.
  const [W, setW] = useState<number | null>(null);
  const touched = useRef(false);
  const onScreen = useOnScreen(box);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || still || n < 2) return;
    const seq: Mode[] = [{ kind: "grid" }, { kind: "focus", i: Math.min(1, n - 1) }, { kind: "grid" }, { kind: "focus", i: Math.min(4, n - 1) }, { kind: "stack" }];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (onScreen.current) {
        const m = seq[k++ % seq.length];
        sound(m, play.auto);
        setMode(m);
      }
    }, 2200);
    return () => window.clearInterval(id);
  }, [autoplay, still, n, onScreen, play]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };
  const go = (m: Mode) => {
    touch();
    sound(m, play);
    setMode(m);
  };

  const width = W ?? 560;
  const cols = width < 520 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  // Shrink the grid until it fits the stage in both directions.
  const gridScale = Math.min(1, (width - 32 - (cols - 1) * GAP) / (cols * CW), (H - 48 - (rows - 1) * GAP) / (rows * CH));
  const pileScale = width < 480 ? 0.78 : 1;

  const place = (i: number) => {
    if (mode.kind === "stack") {
      const k = n - 1 - i;
      return { x: width / 2 - CW / 2 + (i % 2 ? 4 : -4) * k * 0.5, y: H / 2 - CH / 2 - k * 3, rotate: TILT[i % TILT.length], scale: pileScale, z: i };
    }
    if (mode.kind === "grid") {
      const s = gridScale;
      const gw = cols * CW * s + (cols - 1) * GAP;
      const gh = rows * CH * s + (rows - 1) * GAP;
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { x: (width - gw) / 2 + c * (CW * s + GAP) - (CW - CW * s) / 2, y: (H - gh) / 2 + r * (CH * s + GAP) - (CH - CH * s) / 2, rotate: 0, scale: s, z: i };
    }
    if (i === mode.i) return { x: width / 2 - CW / 2, y: H / 2 - CH / 2 - 10, rotate: 0, scale: Math.min(1.7, (H - 60) / CH), z: 50 };
    const k = i < mode.i ? i : i - 1;
    return { x: 18 - (CW - CW * 0.42) / 2 + k * 6, y: H - CH * 0.42 - 18 - (CH - CH * 0.42) / 2 - k * 4, rotate: -12 + k * 5, scale: 0.42, z: i };
  };

  const click = (i: number) => {
    if (mode.kind === "stack") go({ kind: "grid" });
    else if (mode.kind === "grid") go({ kind: "focus", i });
    else go(mode.i === i ? { kind: "grid" } : { kind: "focus", i });
  };

  const hint = mode.kind === "stack" ? "Tap the pile" : mode.kind === "grid" ? "Tap a photo" : "Tap it again to go back";
  const status = mode.kind === "focus" ? `${photos[mode.i]?.title}, ${photos[mode.i]?.sub}. ${hint}.` : `${mode.kind === "stack" ? "Stacked" : "Spread"}. ${hint}.`;

  return (
    <div className={cn("flex w-full max-w-[600px] flex-col items-center gap-3 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div
        ref={box}
        className="relative w-full overflow-hidden rounded-[28px] bg-[#f5f5f7] dark:bg-[#1c1c1e]"
        style={{ height: H }}
        onPointerDown={touch}
        onKeyDown={(e) => {
          if (e.key === "Escape" && mode.kind === "focus") go({ kind: "grid" });
        }}
      >
        {W !== null &&
          photos.map((p, i) => {
            const pos = place(i);
            const focused = mode.kind === "focus" && mode.i === i;
            // In the pile only the top photo is a control; the rest sit behind it.
            const buried = mode.kind === "stack" && i !== n - 1;
            return (
              <motion.button
                key={p.title}
                type="button"
                onClick={() => click(i)}
                tabIndex={buried ? -1 : 0}
                aria-hidden={buried || undefined}
                aria-label={mode.kind === "stack" ? "Spread the photos" : focused ? `${p.title}, ${p.sub}. Back to the grid` : `Open ${p.title}`}
                className={cn(
                  "absolute left-0 top-0 overflow-hidden rounded-[16px] bg-white p-1.5 text-left shadow-[0_2px_4px_rgba(0,0,0,.08),0_18px_30px_-18px_rgba(0,0,0,.5)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_30px_-18px_rgba(0,0,0,.9)]",
                  FOCUS,
                )}
                style={{ width: CW, height: CH, zIndex: pos.z }}
                initial={false}
                animate={{ x: pos.x, y: pos.y, rotate: pos.rotate, scale: pos.scale }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 24, delay: mode.kind === "grid" ? i * 0.035 : mode.kind === "stack" ? (n - i) * 0.03 : 0 }}
                whileHover={mode.kind === "grid" && !still ? { y: pos.y - 6 } : undefined}
              >
                <span className="relative block h-[calc(100%-34px)] overflow-hidden rounded-[11px]">
                  <Scene p={p} />
                </span>
                <span className="flex h-[34px] flex-col justify-center px-1.5">
                  <span className="text-[12px] font-semibold leading-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{p.title}</span>
                  <motion.span className="text-[10px] leading-tight text-[#6e6e73] dark:text-[#a1a1a6]" animate={{ opacity: focused || mode.kind !== "focus" ? 1 : 0 }}>
                    {p.sub}
                  </motion.span>
                </span>
              </motion.button>
            );
          })}
        <span className="pointer-events-none absolute bottom-3 right-4 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
          {hint}
        </span>
        <span className="sr-only" aria-live={live ? "polite" : "off"}>
          {status}
        </span>
      </div>
      <div className="flex gap-2">
        {(["stack", "grid"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => go({ kind: k })}
            aria-pressed={mode.kind === k}
            className={cn(
              "h-9 rounded-full px-4 text-[13px] font-medium",
              FOCUS,
              mode.kind === k
                ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
            )}
          >
            {k === "stack" ? "Stack" : "Spread"}
          </button>
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

# Riffle Stack

Add the "Riffle Stack" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { RiffleStack } from "@/components/draggable-card-stack/riffle-stack";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/draggable-card-stack/riffle-stack.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface RiffleCard {
  /** Card title. */
  t: string;
  /** One line under the title. */
  d: string;
  /** Top-left and bottom-right colour of the card. */
  c: [string, string];
  /** SVG path data for the icon, drawn on a 24 by 24 grid. */
  icon: string;
}

export interface RiffleStackProps {
  /** The deck. Needs an even number of cards so the two halves match. Defaults to eight feature cards. */
  cards?: RiffleCard[];
  /** Riffles and cuts the deck by itself every 2.8s until someone presses a button. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Called with the title of the card that lands on top after each shuffle. */
  onShuffle?: (top: string) => void;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_CARDS: RiffleCard[] = [
  { t: "Spring physics", d: "Every move settles like it has weight.", c: ["#0a84ff", "#5e5ce6"], icon: "M4 12c3-6 5-6 8 0s5 6 8 0" },
  { t: "Layout morphs", d: "Elements travel instead of jumping.", c: ["#30d158", "#0a84ff"], icon: "M4 4h7v7H4zM13 13h7v7h-7z" },
  { t: "Gestures", d: "Drag, fling and pinch, out of the box.", c: ["#ff9f0a", "#ff375f"], icon: "M8 13V5a2 2 0 014 0v6m0 0V4a2 2 0 014 0v8m-8 1l-2-2a2 2 0 00-3 3l4 5a5 5 0 004 2h3a5 5 0 005-5v-4" },
  { t: "Scroll scenes", d: "Pin, scrub and reveal with scroll.", c: ["#bf5af2", "#ff375f"], icon: "M12 4v16M8 16l4 4 4-4" },
  { t: "Accessible", d: "Respects reduced motion and focus.", c: ["#64d2ff", "#30d158"], icon: "M12 4a2 2 0 110 4 2 2 0 010-4zM5 9l7 1 7-1M12 10v10M9 20l3-6 3 6" },
  { t: "Copy & own", d: "One file per component. Yours to edit.", c: ["#ffd60a", "#ff9f0a"], icon: "M8 8h10v12H8zM6 16H4V4h12v2" },
  { t: "Dark mode", d: "Every piece has a dark fill.", c: ["#1d1d1f", "#5e5ce6"], icon: "M20 14A8 8 0 1110 4a7 7 0 0010 10z" },
  { t: "Tiny bundle", d: "Only React and Framer Motion.", c: ["#ff375f", "#ff9f0a"], icon: "M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8" },
];

const W = 220;
const H = 300;
/** Layout width of the deck, and the room the split needs on either side. */
const DECK_W = W + 200;
const SPAN = 440;
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Phase = "idle" | "split" | "fall" | "cut";

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

/** Interleaves the two halves in random clumps of one or two, like real thumbs. Index 0 of the result is the top card. */
function interleave(order: number[]) {
  const n = order.length;
  const left = order.slice(0, n / 2);
  const right = order.slice(n / 2);
  const out: number[] = [];
  let side = Math.random() > 0.5;
  while (left.length || right.length) {
    const src = (side ? left : right).length ? (side ? left : right) : side ? right : left;
    const clump = Math.random() > 0.65 ? 2 : 1;
    for (let k = 0; k < clump && src.length; k++) out.unshift(src.pop() as number);
    side = !side;
  }
  return out;
}

function Face({ c }: { c: RiffleCard }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[20px] p-5 text-white" style={{ background: `linear-gradient(150deg, ${c.c[0]}, ${c.c[1]})` }}>
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/20 backdrop-blur">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={c.icon} />
        </svg>
      </span>
      <span>
        <span className="block text-[22px] font-semibold leading-tight tracking-[-0.02em]">{c.t}</span>
        <span className="mt-1 block text-[13px] leading-[1.35] text-white/80">{c.d}</span>
      </span>
    </div>
  );
}

/**
 * A feature deck you can shuffle like real cards. Riffle splits it into two
 * halves that bow apart, then cards fall back in alternately from each side
 * in little clumps and the deck squares itself up. Cut lifts the top half off
 * and slides it under. Whatever lands on top is the feature you see.
 */
export function RiffleStack({ cards = DEFAULT_CARDS, autoplay = false, onShuffle, enableSound = true, className }: RiffleStackProps) {
  const play = useSound(enableSound);
  const still = useReducedMotion() === true;
  const n = cards.length;
  const [order, setOrder] = useState(() => cards.map((_, i) => i)); // order[0] is the top card
  const [phase, setPhase] = useState<Phase>("idle");
  const [scale, setScale] = useState(1);
  const [live, setLive] = useState(false);
  const deck = useAnimationControls();
  const root = useRef<HTMLDivElement>(null);
  const orderRef = useRef(order);
  const busy = useRef(false);
  const touched = useRef(false);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const onShuffleRef = useRef(onShuffle);
  const onScreen = useOnScreen(root);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);
  useEffect(() => {
    onShuffleRef.current = onShuffle;
  }, [onShuffle]);
  useEffect(() => {
    alive.current = true;
    const t = timers;
    return () => {
      alive.current = false;
      t.current.forEach((id) => window.clearTimeout(id));
      t.current = [];
    };
  }, []);

  // Fit the whole spread inside narrow containers by scaling the deck down.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / SPAN)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Resolves true after `ms`, or never if the component unmounts first. */
  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        timers.current.push(window.setTimeout(() => resolve(alive.current), ms));
      }),
    [],
  );

  const report = useCallback((o: number[]) => {
    const top = cards[o[0]];
    if (top) onShuffleRef.current?.(top.t);
  }, [cards]);

  const riffle = useCallback(async (byUser = false) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const say = byUser ? play : play.auto;
    if (still) {
      say("drop", 0.7);
      const out = interleave(orderRef.current);
      setOrder(out);
      report(out);
      busy.current = false;
      return;
    }
    say("lift", 0.7);
    setPhase("split");
    if (!(await wait(520))) return;
    const out = interleave(orderRef.current);
    setOrder(out);
    setPhase("fall");
    say("swipe", 0.7);
    if (!(await wait(70 * n + 350))) return;
    say("drop", 0.7);
    await deck.start({ scaleY: [1, 0.94, 1.02, 1], transition: { duration: 0.35 } });
    if (!alive.current) return;
    setPhase("idle");
    busy.current = false;
    report(out);
  }, [n, still, wait, deck, report, play]);

  const cut = useCallback(async (byUser = false) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const say = byUser ? play : play.auto;
    const cutOrder = (o: number[]) => [...o.slice(n / 2), ...o.slice(0, n / 2)];
    if (still) {
      say("drop", 0.7);
      const out = cutOrder(orderRef.current);
      setOrder(out);
      report(out);
      busy.current = false;
      return;
    }
    say("lift", 0.7);
    setPhase("cut");
    if (!(await wait(420))) return;
    say("drop", 0.7);
    const out = cutOrder(orderRef.current);
    setOrder(out);
    setPhase("idle");
    report(out);
    if (!(await wait(450))) return;
    busy.current = false;
  }, [n, still, wait, report, play]);

  // Autoplay shuffles while the deck is on screen and the tab is visible: riffle, riffle, cut.
  useEffect(() => {
    if (!autoplay || still) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!onScreen.current) return;
      void (k++ % 3 === 2 ? cut(false) : riffle(false));
    }, 2800);
    return () => window.clearInterval(id);
  }, [autoplay, still, riffle, cut, onScreen]);

  const press = (action: (byUser: boolean) => Promise<void>) => {
    touched.current = true;
    setLive(true);
    void action(true);
  };

  const top = cards[order[0]];
  if (!top) return null;

  return (
    <div ref={root} className={cn("flex w-full max-w-[440px] flex-col items-center gap-5 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div style={{ transform: `scale(${scale})`, marginBlock: (-(H + 40) * (1 - scale)) / 2 }} className="flex w-full justify-center">
        <motion.div animate={deck} className="relative max-w-full" style={{ width: DECK_W, height: H + 40 }} role="img" aria-label={`Top card: ${top.t}. ${top.d}`}>
          {order.map((ci, pos) => {
            const depth = n - 1 - pos; // 0 at the bottom
            const half = pos < n / 2 ? -1 : 1; // which hand it's in during the split
            let x = 0;
            let y = -depth * 2;
            let rotate = 0;
            let rotateY = 0;
            let delay = 0;
            if (phase === "split") {
              x = half * 105;
              y = -((pos % (n / 2)) * 2) - 6;
              rotate = half * 7;
              rotateY = half * -18;
              delay = (pos % (n / 2)) * 0.02;
            }
            if (phase === "fall") delay = (n - 1 - pos) * 0.07;
            if (phase === "cut" && pos < n / 2) {
              x = 120;
              y = -60 - depth * 2;
              rotate = 6;
            }
            return (
              <motion.div
                key={ci}
                aria-hidden="true"
                className="absolute left-1/2 top-[20px] shadow-[0_1px_0_rgba(255,255,255,.4)_inset,0_1px_2px_rgba(0,0,0,.12),0_16px_30px_-18px_rgba(0,0,0,.45)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_1px_0_rgba(255,255,255,.2)_inset,0_16px_30px_-18px_rgba(0,0,0,.9)]"
                style={{ width: W, height: H, marginLeft: -W / 2, zIndex: depth, borderRadius: 20, transformPerspective: 900 }}
                initial={false}
                animate={phase === "fall" ? { x: [null, 0], y: [null, -30, y], rotate: [null, 0], rotateY: [null, 0] } : { x, y, rotate, rotateY }}
                transition={{ type: phase === "fall" ? "tween" : "spring", duration: phase === "fall" ? 0.32 : undefined, stiffness: 300, damping: 26, delay, ease: [0.3, 0, 0.3, 1] }}
              >
                <Face c={cards[ci]} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <motion.button
          type="button"
          whileTap={still ? undefined : { scale: 0.95 }}
          onClick={() => press(riffle)}
          className={cn("h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          Riffle
        </motion.button>
        <motion.button
          type="button"
          whileTap={still ? undefined : { scale: 0.95 }}
          onClick={() => press(cut)}
          className={cn("h-10 rounded-full bg-white px-5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]", FOCUS)}
        >
          Cut
        </motion.button>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={top.t}
            aria-hidden="true"
            className="ml-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
            initial={still ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: -6 }}
          >
            On top: {top.t}
          </motion.span>
        </AnimatePresence>
        <span className="sr-only" aria-live={live ? "polite" : "off"}>
          On top: {top.t}
        </span>
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
