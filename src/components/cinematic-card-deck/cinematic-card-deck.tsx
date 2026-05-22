"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type CinematicDeckCard = {
  title: string;
  description: string;
  tag?: string;
  cardColor?: string;
  accentColor?: string;
  imageUrl?: string;
};

export type CinematicCardDeckProps = {
  cards?: CinematicDeckCard[];
  intensity?: "subtle" | "standard" | "cinematic";
  exitDirection?: "up" | "down";
  cardWidth?: number;
  cardHeight?: number;
  borderRadius?: string;
  sectionHeight?: number;
  smoothing?: number;
  showAccent?: boolean;
  showProgress?: boolean;
  progressPosition?: "left" | "right";
  showAmbientGlow?: boolean;
  glowIntensity?: number;
  indicatorColor?: string;
  backgroundColor?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  viewportHeight?: string;
  className?: string;
};

const defaultCards: CinematicDeckCard[] = [
  {
    title: "Launch Systems",
    description:
      "Ship cohesive landing pages with reusable sections, shared spacing rules, and motion that feels designed from the first scroll.",
    tag: "Foundation",
    cardColor: "#0A0A0A",
    accentColor: "#FF6B4A",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Motion Stories",
    description:
      "Layer cards, depth, and scroll-linked perspective to turn feature explanations into a cinematic product narrative.",
    tag: "Animation",
    cardColor: "#1A1235",
    accentColor: "#A78BFF",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fast Interfaces",
    description:
      "GPU-friendly transforms keep the deck smooth while content stays readable, responsive, and ready for production pages.",
    tag: "Engineering",
    cardColor: "#0C2340",
    accentColor: "#4ADBFF",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Human Details",
    description:
      "Balanced contrast, calm pacing, and keyboard-safe layouts make the visual system feel premium without sacrificing usability.",
    tag: "Experience",
    cardColor: "#0E2418",
    accentColor: "#7DFF8A",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
  },
];

const intensityPresets = {
  subtle: { scaleBack: 0.9, zBack: -180, rotExit: -38, yBack: 18, blurMax: 4 },
  standard: { scaleBack: 0.87, zBack: -240, rotExit: -52, yBack: 24, blurMax: 6 },
  cinematic: { scaleBack: 0.82, zBack: -340, rotExit: -64, yBack: 34, blurMax: 9 },
};

function luminance(hex = "#000000") {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function DeckCard({
  activeIndex,
  index,
  total,
  card,
  cardWidth,
  cardHeight,
  borderRadius,
  preset,
  exitDirection,
  showAccent,
  cursorX,
  cursorY,
}: {
  activeIndex: MotionValue<number>;
  index: number;
  total: number;
  card: CinematicDeckCard;
  cardWidth: number;
  cardHeight: number;
  borderRadius: string;
  preset: (typeof intensityPresets)["standard"];
  exitDirection: "up" | "down";
  showAccent: boolean;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
}) {
  const depth = useTransform(activeIndex, (value) => value - index);
  const dir = exitDirection === "down" ? 1 : -1;
  const yExit = dir * cardHeight * 0.9;
  const rotateBase = exitDirection === "down" ? -preset.rotExit : preset.rotExit;
  const scale = useTransform(depth, [-4, -3, -2, -1, 0, 0.32, 0.72], [
    preset.scaleBack - 0.1,
    preset.scaleBack - 0.05,
    preset.scaleBack,
    preset.scaleBack + (1 - preset.scaleBack) * 0.6,
    1,
    0.96,
    0.76,
  ]);
  const y = useTransform(depth, [-4, -3, -2, -1, 0, 0.72], [
    preset.yBack * 3,
    preset.yBack * 2.3,
    preset.yBack * 1.5,
    preset.yBack * 0.75,
    0,
    yExit * 1.35,
  ]);
  const z = useTransform(depth, [-4, -3, -2, -1, 0, 0.28, 0.72], [
    preset.zBack * 1.6,
    preset.zBack * 1.15,
    preset.zBack * 0.75,
    preset.zBack * 0.35,
    0,
    90,
    220,
  ]);
  const opacity = useTransform(depth, [-4, -3.2, -3, -1, 0, 0.4, 0.72], [0, 0.25, 0.55, 0.95, 1, 0.55, 0]);
  const rotateX = useTransform(depth, [0, 0.72], [0, rotateBase]);
  const blurAmount = useTransform(depth, [-4, -3, -2, -1, 0, 0.4, 0.72], [
    preset.blurMax,
    preset.blurMax * 0.7,
    preset.blurMax * 0.45,
    preset.blurMax * 0.2,
    0,
    preset.blurMax,
    preset.blurMax * 1.2,
  ]);
  const filter = useMotionTemplate`blur(${blurAmount}px)`;
  const shadowOpacity = useTransform(depth, [-3, -1, 0, 1], [0, 0.2, 0.45, 0]);
  const boxShadow = useMotionTemplate`0 40px 80px rgba(0, 0, 0, ${shadowOpacity})`;
  const proximity = useTransform(depth, [-1, 0, 1], [0, 1, 0]);
  const tiltX = useTransform([cursorY, proximity], ([cy, p]) => Number(cy) * 5 * Number(p));
  const tiltY = useTransform([cursorX, proximity], ([cx, p]) => -Number(cx) * 6 * Number(p));
  const finalRotX = useTransform([rotateX, tiltX], ([rx, tx]) => Number(rx) + Number(tx));
  const innerP = useTransform(depth, [-1, 0, 1], [14, 0, -10]);
  const titleP = useTransform(innerP, (value) => value * 1.6);
  const descP = useTransform(innerP, (value) => value * 0.7);
  const accentOp = proximity;

  const isLight = luminance(card.cardColor ?? "#0A0A0A") > 145;
  const textPrimary = isLight ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.97)";
  const textMuted = isLight ? "rgba(0,0,0,0.52)" : "rgba(255,255,255,0.62)";
  const textDim = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.24)";
  const tagBg = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.10)";
  const edgeHigh = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.14)";
  const accent = card.accentColor ?? "#FFFFFF";

  return (
    <motion.article
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: cardWidth,
        height: cardHeight,
        borderRadius,
        backgroundColor: card.cardColor ?? "#0A0A0A",
        padding: "clamp(30px, 5.5%, 52px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transformOrigin: "50% 100%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        willChange: "transform, opacity, filter",
        scale,
        y,
        z,
        opacity,
        rotateX: finalRotX,
        rotateY: tiltY,
        filter,
        boxShadow,
        zIndex: total - index,
        overflow: "hidden",
        backgroundImage: `linear-gradient(180deg, ${edgeHigh} 0%, transparent 2px)`,
      }}
    >
      {card.imageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity"
            style={{ backgroundImage: `url(${card.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/72" />
        </>
      ) : null}

      <motion.div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", y: innerP, zIndex: 2 }}>
        <div className="flex items-baseline gap-2 text-[11px] font-medium tracking-[0.14em] [font-variant-numeric:tabular-nums]">
          <span style={{ color: textPrimary }}>{String(index + 1).padStart(2, "0")}</span>
          <span style={{ color: textDim }}>—</span>
          <span style={{ color: textMuted }}>{String(total).padStart(2, "0")}</span>
        </div>
        {card.tag ? (
          <span
            className="rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur"
            style={{ color: textPrimary, background: tagBg }}
          >
            {card.tag}
          </span>
        ) : null}
      </motion.div>

      {showAccent ? (
        <motion.div
          style={{
            position: "absolute",
            top: "clamp(30px, 5.5%, 52px)",
            left: "50%",
            width: 5,
            height: 5,
            marginLeft: -2.5,
            borderRadius: 99,
            background: accent,
            boxShadow: `0 0 20px ${accent}, 0 0 8px ${accent}`,
            opacity: accentOp,
          }}
        />
      ) : null}

      <div className="relative z-[2]">
        <motion.h3
          style={{ color: textPrimary, y: titleP }}
          className="mb-5 text-[clamp(2rem,4.4vw,3rem)] font-bold leading-[1.04] tracking-[-0.035em]"
        >
          {card.title}
        </motion.h3>
        <motion.p style={{ color: textMuted, y: descP }} className="max-w-[88%] text-sm leading-7">
          {card.description}
        </motion.p>
      </div>

      {showAccent ? (
        <motion.div
          style={{
            position: "absolute",
            left: "clamp(30px, 5.5%, 52px)",
            bottom: "clamp(30px, 5.5%, 52px)",
            width: 40,
            height: 2,
            borderRadius: 99,
            background: accent,
            boxShadow: `0 0 14px ${accent}`,
            opacity: accentOp,
          }}
        />
      ) : null}
    </motion.article>
  );
}

function ProgressDot({
  activeIndex,
  index,
  indicatorColor,
}: {
  activeIndex: MotionValue<number>;
  index: number;
  indicatorColor: string;
}) {
  const distance = useTransform(activeIndex, (value) => Math.abs(value - index));
  const scale = useTransform(distance, [0, 1, 3], [2.4, 1, 0.8]);
  const opacity = useTransform(distance, [0, 1, 3], [1, 0.4, 0.15]);

  return <motion.div style={{ width: 4, height: 4, borderRadius: 99, background: indicatorColor, scale, opacity }} />;
}

function AmbientGlow({
  activeIndex,
  data,
  glowOpacity,
}: {
  activeIndex: MotionValue<number>;
  data: CinematicDeckCard[];
  glowOpacity: number;
}) {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    return activeIndex.on("change", (value) => {
      const nextIndex = Math.round(Math.max(0, Math.min(data.length - 1, value)));
      setIdx(nextIndex);
    });
  }, [activeIndex, data.length]);

  const color = data[idx]?.accentColor ?? "#FFFFFF";

  return (
    <motion.div
      key={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: glowOpacity }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        inset: "-20%",
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 55%)`,
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(40px)",
      }}
    />
  );
}

export function CinematicCardDeck({
  cards,
  intensity = "standard",
  exitDirection = "up",
  cardWidth = 520,
  cardHeight = 360,
  borderRadius = "28px",
  sectionHeight = 400,
  smoothing = 0.7,
  showAccent = true,
  showProgress = true,
  progressPosition = "right",
  showAmbientGlow = true,
  glowIntensity = 0.18,
  indicatorColor = "#FFFFFF",
  backgroundColor = "#000000",
  scrollContainerRef,
  viewportHeight = "100vh",
  className,
}: CinematicCardDeckProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const data = cards && cards.length > 0 ? cards : defaultCards;
  const total = data.length;
  const preset = intensityPresets[intensity] ?? intensityPresets.standard;
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 40 + (1 - smoothing) * 200,
    damping: 16 + smoothing * 26,
    mass: 0.45,
  });
  const activeIndex = useTransform(smooth, [0, 1], [0, Math.max(total - 1, 0.0001)]);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const sCursorX = useSpring(cursorX, { stiffness: 130, damping: 22 });
  const sCursorY = useSpring(cursorY, { stiffness: 130, damping: 22 });

  const onMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      cursorX.set((event.clientX - rect.left) / rect.width - 0.5);
      cursorY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [cursorX, cursorY],
  );

  const onLeave = React.useCallback(() => {
    cursorX.set(0);
    cursorY.set(0);
  }, [cursorX, cursorY]);

  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ height: `${sectionHeight}vh` }}
    >
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: viewportHeight, perspective: "1600px", background: backgroundColor }}
      >
        {showAmbientGlow ? <AmbientGlow activeIndex={activeIndex} data={data} glowOpacity={glowIntensity} /> : null}

        <div style={{ position: "relative", width: cardWidth, height: cardHeight, transformStyle: "preserve-3d", zIndex: 1 }}>
          {data.map((card, index) => (
            <DeckCard
              key={`${card.title}-${index}`}
              activeIndex={activeIndex}
              index={index}
              total={total}
              card={card}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              borderRadius={borderRadius}
              preset={preset}
              exitDirection={exitDirection}
              showAccent={showAccent}
              cursorX={sCursorX}
              cursorY={sCursorY}
            />
          ))}
        </div>

        {showProgress ? (
          <div
            className="pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3.5"
            style={{
              left: progressPosition === "left" ? 36 : "auto",
              right: progressPosition === "right" ? 36 : "auto",
            }}
          >
            {data.map((_, index) => (
              <ProgressDot key={index} activeIndex={activeIndex} index={index} indicatorColor={indicatorColor} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CinematicCardDeck;
