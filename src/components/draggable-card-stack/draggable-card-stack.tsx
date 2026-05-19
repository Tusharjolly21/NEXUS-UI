"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export type StackCard = {
  id: string;
  title?: string;
  subtitle?: string;
  /** Image or video URL */
  media: string;
  type?: "image" | "video";
};

export type DraggableCardStackProps = {
  cards?: StackCard[];
  className?: string;
  /** Card width in px */
  cardWidth?: number;
  /** Card height in px */
  cardHeight?: number;
  /** Border radius in px */
  borderRadius?: number;
  /** Shadow intensity 0–1 */
  shadowStrength?: number;
  /** Y offset per depth level in px */
  stackOffset?: number;
  /** Max resting rotation in degrees */
  maxRotation?: number;
  /** Scale reduction per depth level */
  depthScale?: number;
  /** Show gradient overlay with title/subtitle on hover */
  showOverlay?: boolean;
  /** Scale applied on hover (top card only) */
  hoverScale?: number;
  /** Overlay fade + hover scale transition duration in seconds */
  transitionDuration?: number;
  /** Auto-cycle cards */
  autoPlay?: boolean;
  /** Auto-cycle interval in ms */
  autoInterval?: number;
};

const DEFAULT_CARDS: StackCard[] = [
  {
    id: "1",
    title: "Soft Elegance",
    subtitle: "Graceful pose with gentle tones",
    media: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
    type: "image",
  },
  {
    id: "2",
    title: "Urban Edge",
    subtitle: "Bold style in city light",
    media: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    type: "image",
  },
  {
    id: "3",
    title: "Golden Hour",
    subtitle: "Warm tones at dusk",
    media: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    type: "image",
  },
  {
    id: "4",
    title: "Minimal Mood",
    subtitle: "Clean lines, quiet confidence",
    media: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
    type: "image",
  },
  {
    id: "5",
    title: "Studio Light",
    subtitle: "Portrait in perfect light",
    media: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    type: "image",
  },
];

// Resting rotation ratios per depth level (index 0 = top, always 0)
const ROTATION_RATIOS = [0, -0.857, 0.571, -0.429, 1.0];

function getStackRotation(index: number, maxRotation: number) {
  return (ROTATION_RATIOS[index % ROTATION_RATIOS.length] ?? 0) * maxRotation;
}

function CardMedia({
  card,
  onVideoRef,
}: {
  card: StackCard;
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}) {
  if (card.type === "video") {
    return (
      <video
        ref={onVideoRef}
        src={card.media}
        className="h-full w-full object-cover object-top"
        loop
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <img
      src={card.media}
      alt={card.title ?? ""}
      className="h-full w-full object-cover object-top"
      draggable={false}
    />
  );
}

export function DraggableCardStack({
  cards = DEFAULT_CARDS,
  className,
  cardWidth = 300,
  cardHeight = 420,
  borderRadius = 24,
  shadowStrength = 1,
  stackOffset = 0,
  maxRotation = 14,
  depthScale = 0.04,
  showOverlay = true,
  hoverScale = 1.03,
  transitionDuration = 0.25,
  autoPlay = false,
  autoInterval = 3000,
}: DraggableCardStackProps) {
  const [deck, setDeck] = React.useState(cards);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [incomingId, setIncomingId] = React.useState<string | null>(null);
  const isAnimating = React.useRef(false);
  const isDraggingRef = React.useRef(false);
  const videoRefs = React.useRef<Map<string, HTMLVideoElement>>(new Map());

  // Motion values for the top-card slot
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const topOpacity = useMotionValue(1);
  const topScale = useMotionValue(1);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

  // Derived shadow from strength
  const shadowAlpha = +(0.1 + shadowStrength * 0.5).toFixed(2);
  const shadowBlur = Math.round(20 + shadowStrength * 40);
  const shadowOffsetY = Math.round(8 + shadowStrength * 17);
  const boxShadow = `0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`;

  // ── Video play/pause ──────────────────────────────────────────────────
  React.useEffect(() => {
    const topCard = deck[0];
    videoRefs.current.forEach((video, id) => {
      if (topCard?.type === "video" && id === topCard.id) {
        void video.play();
      } else {
        video.pause();
      }
    });
  }, [deck]);

  const registerVideo = React.useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  }, []);

  // ── Send top card to back ─────────────────────────────────────────────
  const sendToBack = React.useCallback(async () => {
    if (isAnimating.current || isDraggingRef.current) return;
    isAnimating.current = true;
    setIsHovered(false);

    await Promise.all([
      animate(x, 0, { duration: 0.3, ease: [0.76, 0, 0.24, 1] }),
      animate(y, 14, { duration: 0.3, ease: [0.76, 0, 0.24, 1] }),
      animate(topScale, 0.72, { duration: 0.3, ease: [0.76, 0, 0.24, 1] }),
      animate(topOpacity, 0, { duration: 0.22, ease: "easeIn" }),
    ]);

    setDeck((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first!];
    });

    x.set(0);
    y.set(0);
    topScale.set(1);
    topOpacity.set(1);
    isAnimating.current = false;
  }, [x, y, topScale, topOpacity]);

  // ── Bring bottom card to front ────────────────────────────────────────
  const bringToFront = React.useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsHovered(false);

    setDeck((prev) => {
      const last = prev[prev.length - 1]!;
      setIncomingId(last.id);
      return [last, ...prev.slice(0, -1)];
    });
    // isAnimating unlocked inside onAnimationComplete of the incoming card
  }, []);

  // ── Snap back to center ───────────────────────────────────────────────
  const snapBack = React.useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
    animate(topScale, 1, { duration: 0.2, ease: "easeOut" });
  }, [x, y, topScale]);

  // ── Drag end ──────────────────────────────────────────────────────────
  const handleDragEnd = React.useCallback(
    (_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      const { offset, velocity } = info;
      const flung =
        Math.abs(offset.x) > 120 ||
        Math.abs(offset.y) > 120 ||
        Math.abs(velocity.x) > 400 ||
        Math.abs(velocity.y) > 400;
      if (flung) void sendToBack();
      else snapBack();
    },
    [sendToBack, snapBack],
  );

  // ── Hover: scale up/down the top card ────────────────────────────────
  const handleHoverStart = React.useCallback(() => {
    if (isDraggingRef.current || isAnimating.current) return;
    setIsHovered(true);
    animate(topScale, hoverScale, { duration: transitionDuration, ease: "easeOut" });
  }, [topScale, hoverScale, transitionDuration]);

  const handleHoverEnd = React.useCallback(() => {
    setIsHovered(false);
    if (!isAnimating.current) {
      animate(topScale, 1, { duration: transitionDuration, ease: "easeOut" });
    }
  }, [topScale, transitionDuration]);

  // ── Auto-play ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => void sendToBack(), autoInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoInterval, sendToBack]);

  // ── Keyboard ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        void sendToBack();
      }
      if (e.key === "ArrowLeft") bringToFront();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sendToBack, bringToFront]);

  return (
    <div
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]",
        className,
      )}
    >
      <div className="relative" style={{ width: cardWidth, height: cardHeight }}>
        {/* Bottom-up so top card paints last */}
        {[...deck].reverse().map((card, reversedIdx) => {
          const index = deck.length - 1 - reversedIdx;
          const isTop = index === 0;
          const isIncoming = card.id === incomingId;
          const rotation = isTop ? 0 : getStackRotation(index, maxRotation);
          const stackScale = 1 - index * depthScale;
          const restingY = index * stackOffset;
          const zIndex = deck.length - index;

          // ── Incoming card springs from back to front ─────────────────
          if (isTop && isIncoming) {
            return (
              <motion.div
                key={card.id}
                className="absolute inset-0 overflow-hidden"
                style={{ zIndex, borderRadius, boxShadow }}
                initial={{
                  scale: 0.72,
                  rotate: getStackRotation(deck.length - 1, maxRotation),
                  opacity: 0,
                  y: 0,
                }}
                animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                onAnimationComplete={() => {
                  setIncomingId(null);
                  isAnimating.current = false;
                }}
              >
                <CardMedia card={card} onVideoRef={(el) => registerVideo(card.id, el)} />
              </motion.div>
            );
          }

          // ── Normal draggable top card ─────────────────────────────────
          if (isTop) {
            return (
              <motion.div
                key={card.id}
                className="absolute inset-0 overflow-hidden"
                style={{
                  x,
                  y,
                  scale: topScale,
                  opacity: topOpacity,
                  rotate,
                  zIndex,
                  borderRadius,
                  boxShadow,
                  cursor: "grab",
                  touchAction: "none",
                }}
                drag={!isAnimating.current}
                dragElastic={0.8}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                whileDrag={{ cursor: "grabbing" }}
                onDragStart={() => {
                  isDraggingRef.current = true;
                  setIsDragging(true);
                  setIsHovered(false);
                  animate(topScale, 1, { duration: 0.15 });
                }}
                onDragEnd={handleDragEnd}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              >
                <CardMedia card={card} onVideoRef={(el) => registerVideo(card.id, el)} />
                {showOverlay && (card.title ?? card.subtitle) && (
                  <motion.div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col justify-end p-5"
                    style={{
                      height: 140,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: transitionDuration }}
                  >
                    {card.title && (
                      <p className="text-xl font-bold text-white">{card.title}</p>
                    )}
                    {card.subtitle && (
                      <p className="mt-1 text-sm text-white/60">{card.subtitle}</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          }

          // ── Stack card (behind top) ───────────────────────────────────
          return (
            <motion.div
              key={card.id}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex, borderRadius, boxShadow }}
              animate={{
                rotate: rotation,
                scale: isDragging ? stackScale + 0.02 : stackScale,
                y: isDragging ? restingY - 8 : restingY,
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <CardMedia card={card} onVideoRef={(el) => registerVideo(card.id, el)} />
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="mt-10 text-center text-xs text-white/30"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        → send to back &nbsp;·&nbsp; ← bring to front &nbsp;·&nbsp; drag to fling
      </motion.p>
    </div>
  );
}

export default DraggableCardStack;
