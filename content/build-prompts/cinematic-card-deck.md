Add the "Cinematic Card Deck" component from Nexus UI to my project.

A deck of poster cards in 3D: the front card peels away on its bottom edge while the cards behind rise to take its place, leaning back as the deck moves and springing upright when it stops. Swipe or fling it, scroll the wheel over it, use the arrow keys or the progress pills, or set scrollLinked to deal it from page scroll.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CinematicCardDeck } from "@/components/cinematic-card-deck";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cinematic-card-deck/cinematic-card-deck.tsx ---

```tsx
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
import { useSound } from "@/lib/ui-sounds";

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
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
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

/** Read the clock from event handlers only. */
const clock = () => performance.now();
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
  enableSound = true,
  className = "",
}: CinematicCardDeckProps) {
  const play = useSound(enableSound);
  // When the visitor last moved the deck, and when autoplay last did. Page scroll sets neither, so it stays silent.
  const userAt = useRef(-Infinity);
  const autoAt = useRef(-Infinity);
  const lastTick = useRef(0);
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
      const now = performance.now();
      if (now - lastTick.current > 40) {
        if (now - userAt.current < 1600) {
          lastTick.current = now;
          play("tick", 0.4);
        } else if (now - autoAt.current < 1600) {
          lastTick.current = now;
          play.auto("tick", 0.4);
        }
      }
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
    userAt.current = clock();
    run.current?.stop();
    target.set(clamp(Math.round(i), 0, last));
  };
  const touch = () => {
    touched.current = true;
    userAt.current = clock();
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
      userAt.current = clock();
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
      autoAt.current = clock();
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
            userAt.current = clock();
            target.set(clamp(panFrom.current + info.offset.y / step, -0.3, last + 0.3));
          }}
          onPanEnd={(_, info) => {
            if (scrollLinked) return;
            userAt.current = clock();
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
```

--- components/cinematic-card-deck/index.ts ---

```ts
export { CinematicCardDeck, default } from "./cinematic-card-deck";
export type { CinematicCardDeckProps, CinematicDeckCard } from "./cinematic-card-deck";
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
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
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

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
