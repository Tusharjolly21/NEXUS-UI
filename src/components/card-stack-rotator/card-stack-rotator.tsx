"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CardData {
  id: string;
  content: string;
  name: string;
  designation: string;
  avatarUrl?: string;
  initials?: string;
  company?: string;
  companyLogoUrl?: string;
}

export interface CardStackRotatorProps {
  cards: CardData[];
  rotationInterval?: number;
  maxVisible?: number;
  stackOffset?: number;
  scaleStep?: number;
  cardWidth?: string;
  cardHeight?: string;
  cardBackground?: string;
  cardBorderColor?: string;
  textColor?: string;
  mutedColor?: string;
  highlightBackground?: string;
  highlightTextColor?: string;
  contentFontSize?: string;
  nameFontSize?: string;
  designationFontSize?: string;
  borderRadius?: string;
  shadowIntensity?: number;
  pauseOnHover?: boolean;
  direction?: "forward" | "backward";
  className?: string;
}

// ── Highlight parser ───────────────────────────────────────────────────────────

function parseHighlights(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const segments = text.split(/(\*\*[^*]+\*\*)/);
  let key = 0;
  for (const seg of segments) {
    const match = seg.match(/^\*\*([^*]+)\*\*$/);
    if (match) {
      parts.push(
        <mark
          key={key++}
          style={{
            background: "rgba(129,140,248,0.18)",
            color: "#a5b4fc",
            borderRadius: "4px",
            padding: "0 2px",
          }}
        >
          {match[1]}
        </mark>,
      );
    } else if (seg) {
      parts.push(seg);
    }
  }
  return parts;
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: number;
  background?: string;
  textColor?: string;
}

function Avatar({ src, initials, size = 40, background, textColor }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials ?? "avatar"}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: background ?? "rgba(129,140,248,0.2)",
        color: textColor ?? "#a5b4fc",
        fontSize: size * 0.36,
        fontWeight: 600,
      }}
    >
      {initials ?? "?"}
    </div>
  );
}

// ── Spring config ──────────────────────────────────────────────────────────────

const SPRING_ENTER = { type: "spring" as const, stiffness: 280, damping: 30, mass: 1 };
const SPRING_EXIT = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.8 };

// ── Main component ─────────────────────────────────────────────────────────────

export function CardStackRotator({
  cards,
  rotationInterval = 3000,
  maxVisible = 4,
  stackOffset = 16,
  scaleStep = 0.04,
  cardWidth = "420px",
  cardHeight = "260px",
  cardBackground = "#111113",
  cardBorderColor = "rgba(255,255,255,0.07)",
  textColor = "#fafafa",
  mutedColor = "rgba(250,250,250,0.45)",
  highlightTextColor = "#a5b4fc",
  contentFontSize = "15px",
  nameFontSize = "15px",
  designationFontSize = "12px",
  borderRadius = "16px",
  shadowIntensity = 0.55,
  pauseOnHover = true,
  className,
}: CardStackRotatorProps) {
  const reduceMotion = useReducedMotion() === true;
  const [frontIndex, setFrontIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCards = cards.length;
  const visibleCount = Math.min(maxVisible, totalCards);

  // Visible window: front card at position 0, subsequent cards behind
  const visibleCards = React.useMemo(() => {
    if (!totalCards) return [];
    const front = frontIndex % totalCards;
    return Array.from({ length: visibleCount }, (_, i) => {
      const cardIdx = (front + i) % totalCards;
      return { card: cards[cardIdx], stackIndex: i };
    });
  }, [cards, frontIndex, visibleCount, totalCards]);

  React.useEffect(() => {
    if (isPaused || reduceMotion) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const id = setTimeout(() => {
      setFrontIndex((prev) => (prev + 1) % totalCards);
    }, rotationInterval);
    timerRef.current = id;
    return () => clearTimeout(id);
  }, [isPaused, reduceMotion, frontIndex, rotationInterval, totalCards]);

  if (!totalCards) return null;

  const shadowBlur = 20 + shadowIntensity * 30;
  const shadowOpacity = 0.12 + shadowIntensity * 0.28;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: cardWidth, height: cardHeight }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <AnimatePresence mode="popLayout">
        {visibleCards.map(({ card, stackIndex }) => {
          const yOffset = stackIndex * stackOffset;
          const scale = 1 - stackIndex * scaleStep;
          const zBase = visibleCount - stackIndex;

          return (
            <motion.div
              key={card.id}
              layout
              // Initial state for cards entering the stack
              initial={{
                y: yOffset + 56,
                scale: scale - 0.07,
                opacity: 0,
                zIndex: zBase,
              }}
              // Animate to final stacked position
              animate={{
                y: yOffset,
                scale,
                opacity: 1,
                zIndex: zBase,
                transition: {
                  ...SPRING_ENTER,
                  delay: stackIndex * 0.04, // slight cascade for depth feel
                },
              }}
              // Exit animation — front card exits upward
              exit={{
                y: yOffset - 75,
                scale: 1.05,
                opacity: 0,
                zIndex: 0,
                transition: {
                  ...SPRING_EXIT,
                },
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: cardWidth,
                height: cardHeight,
                transformOrigin: "center bottom",
                willChange: "transform, opacity",
              }}
            >
              <div
                className="flex h-full flex-col justify-between rounded-2xl p-6"
                style={{
                  background: cardBackground,
                  border: `1px solid ${cardBorderColor}`,
                  borderRadius,
                  boxShadow: `0 ${shadowBlur}px ${shadowBlur * 1.5}px rgba(0,0,0,${shadowOpacity}), 0 2px 8px rgba(0,0,0,${shadowOpacity * 0.5})`,
                  color: textColor,
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Content */}
                <div
                  style={{
                    fontSize: contentFontSize,
                    color: textColor,
                    lineHeight: 1.65,
                  }}
                >
                  {parseHighlights(card.content)}
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center gap-3">
                  <Avatar
                    src={card.avatarUrl}
                    initials={
                      card.initials ??
                      card.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    }
                    size={40}
                    background="rgba(129,140,248,0.15)"
                    textColor={highlightTextColor}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: nameFontSize,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {card.name}
                    </p>
                    <p
                      style={{
                        fontSize: designationFontSize,
                        color: mutedColor,
                        marginTop: 2,
                      }}
                    >
                      {card.designation}
                      {card.company ? ` · ${card.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}