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
