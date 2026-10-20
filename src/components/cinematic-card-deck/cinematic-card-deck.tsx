"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type CinematicDeckCard = {
  title: string;
  description: string;
  /** Small pill in the top-right corner. */
  tag?: string;
  /** Base colour of the card. Dark colours get white text, light ones get dark text. */
  cardColor?: string;
  /** Glow, accent bar and ambient light colour while this card is in front. */
  accentColor?: string;
  /** Optional photo laid over the drawn art (any URL you host). */
  imageUrl?: string;
};

export type CinematicCardDeckProps = {
  /** Cards from front to back. */
  cards?: CinematicDeckCard[];
  /** How far the back cards recede and how hard the front card peels away. */
  intensity?: "subtle" | "standard" | "cinematic";
  /** Which way a finished card peels off. */
  exitDirection?: "up" | "down";
  /** Card width in px. The deck shrinks to fit narrower parents. */
  cardWidth?: number;
  /** Card height in px (kept as an aspect ratio when the deck shrinks). */
  cardHeight?: number;
  /** Card corner radius, any CSS length. */
  borderRadius?: string;
  /** 0 = snappy, 1 = floaty. Sets the spring that follows the target card. */
  smoothing?: number;
  /** Accent dot and bar on the front card. */
  showAccent?: boolean;
  /** Progress pills that show and pick the front card. */
  showProgress?: boolean;
  /** Where the progress pills sit. */
  progressPosition?: "bottom" | "left" | "right";
  /** Soft light in the front card's accent colour behind the deck. */
  showAmbientGlow?: boolean;
  /** Opacity of the ambient light, 0-1. */
  glowIntensity?: number;
  /** Colour of the active progress pill. Defaults to the text colour. */
  indicatorColor?: string;
  /** Background behind the deck. Transparent by default. */
  backgroundColor?: string;
  /** Drive the deck from page scroll: the root becomes `sectionHeight`vh tall with a sticky stage. */
  scrollLinked?: boolean;
  /** Scroll distance in viewport heights when `scrollLinked`. */
  sectionHeight?: number;
  /** Scrolling element to track when `scrollLinked` (defaults to the window). */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Height of the sticky stage when `scrollLinked`. */
  viewportHeight?: string;
  /** Card shown first. */
  defaultIndex?: number;
  /** Called with the new front card index. */
  onChange?: (index: number) => void;
  /** Caption under the deck. Empty string hides it. */
  hint?: string;
  /** Deals through the deck every 2.4s until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

const DEFAULT_CARDS: CinematicDeckCard[] = [
  {
    title: "Launch Systems",
    description: "Reusable sections, shared spacing and motion that feels designed from the first frame.",
    tag: "Foundation",
    cardColor: "#16161a",
    accentColor: "#ff6b4a",
  },
  {
    title: "Motion Stories",
    description: "Layer depth and perspective to turn a feature list into a short film.",
    tag: "Animation",
    cardColor: "#1d1438",
    accentColor: "#b49bff",
  },
  {
    title: "Fast Interfaces",
    description: "Transform-only motion keeps the deck smooth on every screen.",
    tag: "Engineering",
    cardColor: "#0c2340",
    accentColor: "#4adbff",
  },
  {
    title: "Human Details",
    description: "Calm pacing, real contrast and keyboard support baked in.",
    tag: "Experience",
    cardColor: "#0f2a1c",
    accentColor: "#5ee38a",
  },
];

const PRESETS = {
  subtle: { scaleBack: 0.92, zBack: -120, rotExit: -42, yBack: 12 },
  standard: { scaleBack: 0.89, zBack: -180, rotExit: -58, yBack: 16 },
  cinematic: { scaleBack: 0.85, zBack: -260, rotExit: -72, yBack: 20 },
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function luminance(hex = "#000000") {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Drawn poster art: horizon arcs and a light leak, placed per card so no two match. */
function CardArt({ index, accent }: { index: number; accent: string }) {
  const cx = [78, 22, 64, 34][index % 4];
  const cy = [24, 70, 82, 30][index % 4];
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 75% at ${cx}% ${cy}%, ${accent}55 0%, transparent 70%), radial-gradient(40% 50% at ${100 - cx}% ${100 - cy}%, ${accent}22 0%, transparent 70%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 340 220" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <circle
            key={k}
            cx={r3((cx / 100) * 340)}
            cy={r3((cy / 100) * 220)}
            r={40 + k * 34}
            fill="none"
            stroke={accent}
            strokeOpacity={r3(0.22 - k * 0.035)}
            strokeWidth="1"
          />
        ))}
      </svg>
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.10)_0%,transparent_1.5px),linear-gradient(180deg,transparent_40%,rgba(0,0,0,.35)_100%)]" />
    </span>
  );
}

function DeckCard({
  progress,
  lean,
  index,
  total,
  card,
  radius,
  preset,
  exitDirection,
  showAccent,
  tiltX,
  tiltY,
  isActive,
}: {
  isActive: boolean;
  progress: MotionValue<number>;
  lean: MotionValue<number>;
  index: number;
  total: number;
  card: CinematicDeckCard;
  radius: string;
  preset: (typeof PRESETS)["standard"];
  exitDirection: "up" | "down";
  showAccent: boolean;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  // depth < 0: waiting behind. 0: in front. > 0: peeling away.
  const depth = useTransform(progress, (v) => v - index);
  const dir = exitDirection === "down" ? 1 : -1;
  const { scaleBack: sb, zBack: zb, yBack: yb } = preset;
  const scale = useTransform(depth, [-3, -2, -1, 0, 0.5, 1], [sb - 0.12, sb - 0.06, sb, 1, 1.02, 0.94]);
  const y = useTransform(depth, [-3, -2, -1, 0, 1], [yb * 3, yb * 2, yb, 0, dir * 260]);
  const z = useTransform(depth, [-3, -1, 0, 0.5, 1], [zb * 1.6, zb * 0.5, 0, 90, 160]);
  const opacity = useTransform(depth, [-3.6, -3, -1, 0, 0.55, 0.95], [0, 0.6, 1, 1, 1, 0]);
  const peel = useTransform(depth, [0, 1], [0, dir === -1 ? preset.rotExit : -preset.rotExit]);
  const near = useTransform(depth, [-1, 0, 1], [0, 1, 0]);
  const behind = useTransform(depth, (d) => (d < 0 ? Math.min(1, -d) : 0));
  const rotateX = useTransform([peel, lean, tiltX, near, behind], ([p, l, tx, n, b]) =>
    (p as number) + (l as number) * (b as number) + (tx as number) * (n as number),
  );
  const rotateY = useTransform([tiltY, near], ([ty, n]) => (ty as number) * (n as number));
  const scrim = useTransform(depth, [-3, -1, 0, 1], [0.55, 0.3, 0, 0.2]);
  const glare = useTransform(
    [tiltY, tiltX],
    ([ty, tx]) => `radial-gradient(60% 60% at ${50 + (ty as number) * 4}% ${50 - (tx as number) * 4}%, rgba(255,255,255,.14), transparent 70%)`,
  );
  const shadow = useTransform(depth, (d) => {
    const a = d < -0.5 ? 0.18 : d > 0.3 ? 0.1 : 0.42;
    return `0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -24px rgba(0,0,0,${a})`;
  });

  const light = luminance(card.cardColor ?? "#16161a") > 150;
  const ink = light ? "#1d1d1f" : "#ffffff";
  const muted = light ? "rgba(29,29,31,.72)" : "rgba(255,255,255,.74)";
  const accent = card.accentColor ?? "#0a84ff";

  return (
    <motion.article
      aria-hidden={!isActive}
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: radius,
        background: card.cardColor ?? "#16161a",
        color: ink,
        transformOrigin: exitDirection === "down" ? "50% 0%" : "50% 100%",
        zIndex: total - index,
        scale,
        y,
        z,
        opacity,
        rotateX,
        rotateY,
        boxShadow: shadow,
      }}
    >
      <CardArt index={index} accent={accent} />
      {card.imageUrl ? (
        <span
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url(${card.imageUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      <motion.span
        className="pointer-events-none absolute inset-0"
        style={{
          background: glare,
          opacity: near,
        }}
        aria-hidden="true"
      />
      <div className="relative flex h-full flex-col justify-between p-[clamp(16px,6cqw,26px)]">
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-baseline gap-1.5 text-[12px] font-semibold tabular-nums tracking-[0.08em]">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span style={{ color: muted }}>/ {String(total).padStart(2, "0")}</span>
          </span>
          {card.tag ? (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em]"
              style={{ background: light ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.12)" }}
            >
              {card.tag}
            </span>
          ) : null}
        </div>
        <div>
          {showAccent ? (
            <motion.span
              className="mb-3 block h-[3px] w-9 rounded-full"
              style={{ background: accent, boxShadow: `0 0 14px ${accent}`, opacity: near, scaleX: near, originX: 0 }}
              aria-hidden="true"
            />
          ) : null}
          <h3 className="text-[clamp(20px,8cqw,30px)] font-semibold leading-[1.05] tracking-[-0.035em]">{card.title}</h3>
          <p className="mt-2 max-w-[92%] text-[13px] leading-[1.45]" style={{ color: muted }}>
            {card.description}
          </p>
        </div>
      </div>
      <motion.span className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: scrim }} aria-hidden="true" />
    </motion.article>
  );
}

function ProgressPill({
  progress,
  index,
  vertical,
  color,
  label,
  onPick,
}: {
  progress: MotionValue<number>;
  index: number;
  vertical: boolean;
  color?: string;
  label: string;
  onPick: () => void;
}) {
  const dist = useTransform(progress, (v) => Math.min(1, Math.abs(v - index)));
  const len = useTransform(dist, [0, 1], [22, 7]);
  const opacity = useTransform(dist, [0, 1], [1, 0.35]);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={label}
      className="grid place-items-center rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
    >
      <motion.span
        className="block rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
        style={{
          width: vertical ? 7 : len,
          height: vertical ? len : 7,
          opacity,
          background: color,
        }}
      />
    </button>
  );
}

/**
 * A deck of poster cards in 3D. The front card peels away on its bottom edge
 * while the cards behind rise to take its place, leaning back when you move
 * fast and springing upright when you stop. Swipe, scroll the wheel, use the
 * arrow keys, or link it to page scroll.
 */
export function CinematicCardDeck({
  cards,
  intensity = "standard",
  exitDirection = "up",
  cardWidth = 340,
  cardHeight = 220,
  borderRadius = "24px",
  smoothing = 0.6,
  showAccent = true,
  showProgress = true,
  progressPosition = "bottom",
  showAmbientGlow = true,
  glowIntensity = 0.35,
  indicatorColor,
  backgroundColor = "transparent",
  scrollLinked = false,
  sectionHeight = 300,
  scrollContainerRef,
  viewportHeight = "100vh",
  defaultIndex = 0,
  onChange,
  hint = "Swipe, scroll or use the arrow keys.",
  autoplay = false,
  className = "",
}: CinematicCardDeckProps) {
  const data = cards && cards.length > 0 ? cards : DEFAULT_CARDS;
  const total = data.length;
  const last = Math.max(0, total - 1);
  const preset = PRESETS[intensity] ?? PRESETS.standard;
  const still = useReducedMotion() === true;
  const s = clamp(smoothing, 0, 1);
  const start = clamp(Math.round(defaultIndex), 0, last);

  const sectionRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panFrom = useRef(0);

  const target = useMotionValue(start);
  const progress = useSpring(
    target,
    still ? { stiffness: 1000, damping: 100 } : { stiffness: 260 - s * 170, damping: 22 - s * 8, mass: 0.9 },
  );
  // Follow-through: the waiting cards lean back while the deck moves and spring upright after.
  const velocity = useVelocity(progress);
  const lean = useSpring(
    useTransform(velocity, (v) => (still ? 0 : clamp(v * (exitDirection === "up" ? 5 : -5), -16, 16))),
    { stiffness: 180, damping: 14 },
  );

  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 150, damping: 18 });
  const tiltY = useSpring(rawTiltY, { stiffness: 150, damping: 18 });

  const [active, setActive] = useState(start);
  const lastReported = useRef(start);
  useMotionValueEvent(progress, "change", (v) => {
    const i = clamp(Math.round(v), 0, last);
    setActive(i);
    if (i !== lastReported.current) {
      lastReported.current = i;
      onChange?.(i);
    }
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (scrollLinked) target.set(v * last);
  });

  const goTo = (i: number) => {
    run.current?.stop();
    target.set(clamp(Math.round(i), 0, last));
  };
  const touch = () => {
    touched.current = true;
  };

  // Wheel scrubs the deck, then snaps to the nearest card. Lets the page scroll past either end.
  useEffect(() => {
    const el = deckRef.current;
    if (!el || scrollLinked) return;
    const onWheel = (e: WheelEvent) => {
      const v = target.get();
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if ((d < 0 && v <= 0) || (d > 0 && v >= last)) return;
      e.preventDefault();
      touched.current = true;
      run.current?.stop();
      target.set(clamp(v + d / 320, 0, last));
      clearTimeout(settle.current);
      settle.current = setTimeout(() => target.set(Math.round(target.get())), 120);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(settle.current);
    };
  }, [scrollLinked, last, target]);

  useEffect(() => () => run.current?.stop(), []);

  useEffect(() => {
    if (!autoplay || scrollLinked || total < 2) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const v = Math.round(target.get());
      target.set(v >= last ? 0 : v + 1);
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay, scrollLinked, total, last, target]);

  const onKey = (e: KeyboardEvent) => {
    const v = Math.round(target.get());
    let to: number | null = null;
    if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) to = v + 1;
    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) to = v - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = last;
    if (to === null || scrollLinked) return;
    e.preventDefault();
    touch();
    goTo(to);
  };

  const step = cardHeight * 0.7 * (exitDirection === "up" ? -1 : 1);
  const accent = data[active]?.accentColor ?? "#0a84ff";
  const vertical = progressPosition !== "bottom";

  const dots = showProgress ? (
    <div
      className={`flex items-center ${vertical ? "flex-col" : "flex-row"}`}
      onPointerDown={touch}
      role="group"
      aria-label="Choose card"
    >
      {data.map((c, i) => (
        <ProgressPill
          key={`${c.title}-${i}`}
          progress={progress}
          index={i}
          vertical={vertical}
          color={indicatorColor}
          label={`Show ${c.title}`}
          onPick={() => goTo(i)}
        />
      ))}
    </div>
  ) : null;

  const deckStyle: CSSProperties = {
    width: cardWidth,
    maxWidth: "100%",
    aspectRatio: `${cardWidth} / ${cardHeight}`,
    perspective: 1400,
    touchAction: scrollLinked ? "auto" : "none",
    // Room for the cards peeking out underneath.
    marginBottom: progressPosition === "bottom" ? preset.yBack * 2.2 : 0,
  };

  const stage = (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={`flex w-full items-center justify-center gap-4 ${progressPosition === "left" ? "flex-row-reverse" : "flex-row"}`}>
        <motion.div
          ref={deckRef}
          role="region"
          aria-roledescription="card deck"
          aria-label="Card deck"
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={touch}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            rawTiltY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
            rawTiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
          }}
          onPointerLeave={() => {
            rawTiltX.set(0);
            rawTiltY.set(0);
          }}
          onPanStart={() => {
            if (scrollLinked) return;
            run.current?.stop();
            panFrom.current = target.get();
          }}
          onPan={(_, info) => {
            if (scrollLinked) return;
            target.set(clamp(panFrom.current + info.offset.y / step, -0.3, last + 0.3));
          }}
          onPanEnd={(_, info) => {
            if (scrollLinked) return;
            const from = Math.round(target.get());
            run.current = animate(target, [target.get()], {
              type: "inertia",
              velocity: info.velocity.y / step,
              power: 0.2,
              timeConstant: 180,
              // A hard flick deals at most two cards.
              modifyTarget: (v) => clamp(Math.round(clamp(v, from - 2, from + 2)), 0, last),
              bounceStiffness: 300,
              bounceDamping: 30,
            });
          }}
          className="@container relative cursor-grab select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
          style={deckStyle}
        >
          {showAmbientGlow ? (
            <motion.div
              className="pointer-events-none absolute -inset-10 rounded-full blur-[48px]"
              animate={{ backgroundColor: accent }}
              transition={{ duration: 0.8 }}
              style={{ opacity: glowIntensity, scale: 0.75 }}
              aria-hidden="true"
            />
          ) : null}
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {data.map((card, index) => (
              <DeckCard
                key={`${card.title}-${index}`}
                progress={progress}
                lean={lean}
                index={index}
                total={total}
                card={card}
                radius={borderRadius}
                preset={preset}
                exitDirection={exitDirection}
                showAccent={showAccent}
                tiltX={tiltX}
                tiltY={tiltY}
                isActive={index === active}
              />
            ))}
          </div>
        </motion.div>
        <span className="sr-only" aria-live="polite">
          {`Card ${active + 1} of ${total}: ${data[active]?.title ?? ""}`}
        </span>
        {vertical ? dots : null}
      </div>
      {!vertical ? dots : null}
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{scrollLinked ? "Scroll to deal the deck." : hint}</span> : null}
    </div>
  );

  if (scrollLinked) {
    return (
      <div ref={sectionRef} className={`relative w-full ${className}`} style={{ height: `${sectionHeight}vh`, background: backgroundColor }}>
        <div className="sticky top-0 flex w-full items-center justify-center overflow-hidden px-4" style={{ height: viewportHeight }}>
          {stage}
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={`relative w-full max-w-full ${className}`} style={{ background: backgroundColor }}>
      {stage}
    </div>
  );
}

export default CinematicCardDeck;
