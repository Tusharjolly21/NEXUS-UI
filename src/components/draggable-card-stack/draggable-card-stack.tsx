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
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
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
      sendAway(k++ % 2 === 0 ? 1 : -1);
    }, Math.max(900, autoInterval));
    return () => clearInterval(t);
  }, [demo, autoInterval, sendAway]);

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
