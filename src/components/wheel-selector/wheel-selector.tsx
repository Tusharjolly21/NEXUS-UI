"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Transition } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Brush,
  Code2,
  Compass,
  Cpu,
  Globe,
  Layers3,
  Lightbulb,
  Megaphone,
  PenTool,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WheelTheme = "obsidian" | "midnight" | "arctic" | "ember" | "custom";
export type WheelVariant = "responsive" | "desktop" | "mobile";
export type WheelContentMode = "minimal" | "detailed" | "hidden";
export type WheelAnimationSpeed = "slow" | "medium" | "fast";
export type WheelIconName =
  | "analytics"
  | "boxes"
  | "brush"
  | "code"
  | "compass"
  | "cpu"
  | "globe"
  | "layers"
  | "idea"
  | "marketing"
  | "pen"
  | "rocket"
  | "search"
  | "security"
  | "sparkles"
  | "target";

export type WheelItem = {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  description?: string;
  accentColor?: string;
  icon?: WheelIconName;
  iconImageUrl?: string;
  image?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export type WheelSelectorProps = {
  items?: WheelItem[];
  theme?: WheelTheme;
  variant?: WheelVariant;
  contentMode?: WheelContentMode;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  ringRadius?: number;
  tickCount?: number;
  showTicks?: boolean;
  showCounter?: boolean;
  showCTA?: boolean;
  autoRotate?: boolean;
  autoRotateInterval?: number;
  animationSpeed?: WheelAnimationSpeed;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  cardColor?: string;
  ringStrokeColor?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  titleFontFamily?: string;
  bodyFontFamily?: string;
  labelFontFamily?: string;
  fontFamily?: string;
  className?: string;
};

type ThemeTokens = {
  background: string;
  card: string;
  text: string;
  muted: string;
  ring: string;
  accent: string;
  ctaBackground: string;
  ctaText: string;
  ctaBorder: string;
};

const ICONS: Record<WheelIconName, LucideIcon> = {
  analytics: BarChart3,
  boxes: Boxes,
  brush: Brush,
  code: Code2,
  compass: Compass,
  cpu: Cpu,
  globe: Globe,
  layers: Layers3,
  idea: Lightbulb,
  marketing: Megaphone,
  pen: PenTool,
  rocket: Rocket,
  search: Search,
  security: ShieldCheck,
  sparkles: Sparkles,
  target: Target,
};

const THEMES: Record<Exclude<WheelTheme, "custom">, ThemeTokens> = {
  obsidian: {
    background: "#111112",
    card: "#181819",
    text: "#f5f4f7",
    muted: "#929097",
    ring: "#2b2a30",
    accent: "#8b5cf6",
    ctaBackground: "#f5f4f7",
    ctaText: "#151318",
    ctaBorder: "#f5f4f7",
  },
  midnight: {
    background: "#07111d",
    card: "#0b1827",
    text: "#eef7ff",
    muted: "#8192a8",
    ring: "#203247",
    accent: "#38bdf8",
    ctaBackground: "#38bdf8",
    ctaText: "#07111d",
    ctaBorder: "#38bdf8",
  },
  arctic: {
    background: "#eef4f8",
    card: "#ffffff",
    text: "#152333",
    muted: "#68798c",
    ring: "#cfd9e2",
    accent: "#0284c7",
    ctaBackground: "#152333",
    ctaText: "#ffffff",
    ctaBorder: "#152333",
  },
  ember: {
    background: "#150e0c",
    card: "#201512",
    text: "#fff3eb",
    muted: "#b1978b",
    ring: "#423029",
    accent: "#f97316",
    ctaBackground: "#f97316",
    ctaText: "#fff7ed",
    ctaBorder: "#f97316",
  },
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=960&q=80",
];

export const DEFAULT_WHEEL_ITEMS: WheelItem[] = [
  {
    id: "strategy",
    label: "Strategy",
    title: "Product Strategy",
    subtitle: "Direction",
    description: "Define positioning, product narratives, and roadmaps that align teams around measurable outcomes.",
    accentColor: "#38bdf8",
    icon: "compass",
    image: FALLBACK_IMAGES[0],
    ctaHref: "#",
  },
  {
    id: "design",
    label: "Design",
    title: "Experience Design",
    subtitle: "Craft",
    description: "Shape clear interfaces and expressive visual systems that make sophisticated products effortless to use.",
    accentColor: "#f97316",
    icon: "pen",
    image: FALLBACK_IMAGES[1],
    ctaHref: "#",
  },
  {
    id: "engineering",
    label: "Engineering",
    title: "Digital Platforms",
    subtitle: "Build",
    description: "Create reliable, responsive experiences with scalable frontend systems and thoughtful motion.",
    accentColor: "#22c55e",
    icon: "code",
    image: FALLBACK_IMAGES[2],
    ctaHref: "#",
  },
  {
    id: "growth",
    label: "Growth",
    title: "Launch Campaigns",
    subtitle: "Reach",
    description: "Translate your product story into launch moments that attract attention and turn interest into action.",
    accentColor: "#f43f5e",
    icon: "rocket",
    image: FALLBACK_IMAGES[3],
    ctaHref: "#",
  },
  {
    id: "insights",
    label: "Insights",
    title: "User Research",
    subtitle: "Learn",
    description: "Deep-dive user studies and analytics that inform product decisions and drive meaningful engagement.",
    accentColor: "#8b5cf6",
    icon: "analytics",
    image: FALLBACK_IMAGES[0],
    ctaHref: "#",
  },
  {
    id: "systems",
    label: "Systems",
    title: "Design Systems",
    subtitle: "Scale",
    description: "Unify components, tokens, and documentation into a coherent system your product teams can extend.",
    accentColor: "#eab308",
    icon: "layers",
    image: FALLBACK_IMAGES[1],
    ctaHref: "#",
  },
];

const SPEEDS: Record<WheelAnimationSpeed, { duration: number; spring: number }> = {
  slow: { duration: 0.68, spring: 0.8 },
  medium: { duration: 0.46, spring: 1 },
  fast: { duration: 0.26, spring: 1.35 },
};

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

function getShortestOffset(index: number, activeIndex: number, total: number) {
  const raw = index - activeIndex;
  if (raw > total / 2) return raw - total;
  if (raw < -total / 2) return raw + total;
  return raw;
}

function ItemIcon({ item }: { item: WheelItem }) {
  if (item.iconImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- registry components accept arbitrary customer-hosted icon URLs
    return <img src={item.iconImageUrl} alt="" className="size-6 object-contain" />;
  }
  const Icon = ICONS[item.icon ?? "sparkles"];
  return <Icon className="size-6" strokeWidth={1.7} />;
}

export function WheelSelector({
  items = DEFAULT_WHEEL_ITEMS,
  theme = "obsidian",
  variant = "responsive",
  contentMode = "detailed",
  activeIndex: controlledIndex,
  onActiveChange,
  ringRadius = 186,
  tickCount = 48,
  showTicks = true,
  showCounter = true,
  showCTA = false,
  autoRotate = false,
  autoRotateInterval = 4500,
  animationSpeed = "medium",
  backgroundColor,
  accentColor,
  textColor,
  mutedTextColor,
  cardColor,
  ringStrokeColor,
  ctaBackgroundColor,
  ctaTextColor,
  ctaBorderColor,
  titleFontFamily,
  bodyFontFamily,
  labelFontFamily,
  fontFamily,
  className,
}: WheelSelectorProps) {
  const safeItems = items.length ? items : DEFAULT_WHEEL_ITEMS;
  const total = safeItems.length;
  const [internalIndex, setInternalIndex] = React.useState(0);
  const activeIndex = wrapIndex(controlledIndex ?? internalIndex, total);
  const activeItem = safeItems[activeIndex];
  const reducedMotion = useReducedMotion() === true;
  const interactedRef = React.useRef(false);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const lastWheelRef = React.useRef(0);
  const speed = SPEEDS[animationSpeed];
  const selectedAccent = activeItem.accentColor ?? accentColor;
  const baseTokens = THEMES[theme === "custom" ? "obsidian" : theme];
  const tokens: ThemeTokens = {
    background: backgroundColor ?? baseTokens.background,
    card: cardColor ?? baseTokens.card,
    text: textColor ?? baseTokens.text,
    muted: mutedTextColor ?? baseTokens.muted,
    ring: ringStrokeColor ?? baseTokens.ring,
    accent: selectedAccent ?? baseTokens.accent,
    ctaBackground: ctaBackgroundColor ?? baseTokens.ctaBackground,
    ctaText: ctaTextColor ?? baseTokens.ctaText,
    ctaBorder: ctaBorderColor ?? baseTokens.ctaBorder,
  };
  const radius = Math.max(100, Math.min(ringRadius, 400));
  const ticks = Math.max(10, Math.min(tickCount, 80));

  const goTo = React.useCallback(
    (nextIndex: number, byUser = true) => {
      if (byUser) interactedRef.current = true;
      const next = wrapIndex(nextIndex, total);
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveChange?.(next);
    },
    [controlledIndex, onActiveChange, total],
  );

  const next = React.useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const previous = React.useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  React.useEffect(() => {
    if (!autoRotate) return;
    const interval = window.setInterval(() => {
      if (!interactedRef.current) goTo(activeIndex + 1, false);
    }, Math.max(1000, Math.min(autoRotateInterval, 15000)));
    return () => window.clearInterval(interval);
  }, [activeIndex, autoRotate, autoRotateInterval, goTo]);

  React.useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - lastWheelRef.current < 300) return;
      lastWheelRef.current = now;
      goTo(activeIndex + (event.deltaY > 0 || event.deltaX > 0 ? 1 : -1));
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [activeIndex, goTo]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const axisMovement =
      Math.abs(info.offset.x) >= Math.abs(info.offset.y) ? info.offset.x : -info.offset.y;
    if (Math.abs(axisMovement) > 28) goTo(activeIndex + (axisMovement < 0 ? 1 : -1));
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      previous();
    }
  }

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: speed.duration, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={stageRef}
      tabIndex={0}
      aria-label="Wheel selector"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      style={{
        background: tokens.background,
        borderColor: tokens.ring,
        color: tokens.text,
        fontFamily,
        ["--wheel-accent" as string]: tokens.accent,
      }}
    >
      <div
        className={cn(
          "min-h-[610px] items-center gap-12 px-14 py-12 grid-cols-[minmax(430px,1fr)_minmax(390px,0.92fr)]",
          variant === "responsive" && "hidden lg:grid",
          variant === "desktop" && "grid",
          variant === "mobile" && "hidden",
        )}
      >
        <WheelContent
          item={activeItem}
          activeIndex={activeIndex}
          total={total}
          mode={contentMode}
          tokens={tokens}
          showCTA={showCTA}
          transition={transition}
          titleFontFamily={titleFontFamily}
          bodyFontFamily={bodyFontFamily}
          labelFontFamily={labelFontFamily}
        />
        <DesktopWheel
          items={safeItems}
          activeIndex={activeIndex}
          radius={radius}
          ticks={ticks}
          showTicks={showTicks}
          showCounter={showCounter}
          tokens={tokens}
          onSelect={goTo}
          onDragEnd={handleDragEnd}
          transition={transition}
          labelFontFamily={labelFontFamily}
        />
      </div>

      <div
        className={cn(
          "min-h-[680px] flex-col px-5 pb-7 pt-5",
          variant === "responsive" && "flex lg:hidden",
          variant === "mobile" && "flex",
          variant === "desktop" && "hidden",
        )}
      >
        <MobileWheel
          items={safeItems}
          activeIndex={activeIndex}
          showCounter={showCounter}
          tokens={tokens}
          onSelect={goTo}
          onDragEnd={handleDragEnd}
          transition={transition}
          labelFontFamily={labelFontFamily}
        />
        <WheelContent
          item={activeItem}
          activeIndex={activeIndex}
          total={total}
          mode={contentMode}
          tokens={tokens}
          showCTA={showCTA}
          transition={transition}
          titleFontFamily={titleFontFamily}
          bodyFontFamily={bodyFontFamily}
          labelFontFamily={labelFontFamily}
          compact
        />
      </div>
    </section>
  );
}

type WheelPartProps = {
  items: WheelItem[];
  activeIndex: number;
  tokens: ThemeTokens;
  onSelect: (index: number) => void;
  onDragEnd: (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  transition: Transition;
  labelFontFamily?: string;
};

function DesktopWheel({
  items,
  activeIndex,
  radius,
  ticks,
  showTicks,
  showCounter,
  tokens,
  onSelect,
  onDragEnd,
  transition,
  labelFontFamily,
}: WheelPartProps & { radius: number; ticks: number; showTicks: boolean; showCounter: boolean }) {
  const dialSize = radius * 2 + 88;
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      className="relative mx-auto cursor-grab touch-none active:cursor-grabbing"
      style={{ width: dialSize, height: dialSize }}
    >
      <div
        className="absolute rounded-full border"
        style={{ inset: 44, borderColor: tokens.ring }}
      />
      {showTicks &&
        Array.from({ length: ticks }, (_, index) => {
          const angle = (360 / ticks) * index;
          const selectedAngle = 270;
          const difference = Math.abs(((angle - selectedAngle + 540) % 360) - 180);
          const nearActive = difference < 35;
          return (
            <span
              key={angle}
              className="absolute left-1/2 top-1/2 block origin-bottom rounded-full transition-colors duration-300"
              style={{
                width: 1,
                height: nearActive ? 12 : 7,
                background: nearActive ? tokens.accent : tokens.ring,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius + 44}px)`,
              }}
            />
          );
        })}

      {items.map((item, index) => {
        const offset = getShortestOffset(index, activeIndex, items.length);
        const angle = 180 + (offset * 360) / items.length;
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;
        const selected = index === activeIndex;
        return (
          <motion.button
            key={item.id}
            type="button"
            aria-label={`Select ${item.title}`}
            aria-current={selected}
            onClick={() => onSelect(index)}
            animate={{ x, y, scale: selected ? 1.08 : 1, opacity: selected ? 1 : 0.62 }}
            transition={transition}
            className="absolute left-1/2 top-1/2 grid size-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border"
            style={{
              background: tokens.card,
              borderColor: selected ? tokens.accent : tokens.ring,
              color: selected ? tokens.accent : tokens.muted,
              fontFamily: labelFontFamily,
              boxShadow: selected ? `0 0 0 1px ${tokens.accent}33, 0 18px 44px ${tokens.accent}18` : undefined,
            }}
          >
            <ItemIcon item={item} />
          </motion.button>
        );
      })}

      {showCounter && (
        <div
          className="absolute left-1/2 top-1/2 grid size-[108px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center"
          style={{ background: tokens.card, borderColor: tokens.ring }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={activeIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={transition}>
              <p className="text-[34px] font-semibold tabular-nums" style={{ color: tokens.accent }}>
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <p className="text-xs tabular-nums" style={{ color: tokens.muted }}>
                / {String(items.length).padStart(2, "0")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function MobileWheel({
  items,
  activeIndex,
  showCounter,
  tokens,
  onSelect,
  onDragEnd,
  transition,
  labelFontFamily,
}: WheelPartProps & { showCounter: boolean }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={onDragEnd}
      className="relative mb-7 h-48 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
    >
      <div
        className="absolute left-1/2 top-10 h-[230px] w-[430px] -translate-x-1/2 rounded-[50%] border"
        style={{ borderColor: tokens.ring }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12" style={{ background: `linear-gradient(90deg, ${tokens.background}, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12" style={{ background: `linear-gradient(270deg, ${tokens.background}, transparent)` }} />
      {items.map((item, index) => {
        const offset = getShortestOffset(index, activeIndex, items.length);
        const x = offset * 82;
        const y = Math.min(76, Math.abs(offset) * 34);
        const selected = index === activeIndex;
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Select ${item.title}`}
            aria-current={selected}
            animate={{ x, y, scale: selected ? 1.08 : 0.92, opacity: Math.abs(offset) > 2 ? 0 : selected ? 1 : 0.62 }}
            transition={transition}
            className="absolute left-1/2 top-8 grid size-16 -translate-x-1/2 place-items-center rounded-full border"
            style={{
              background: tokens.card,
              borderColor: selected ? tokens.accent : tokens.ring,
              color: selected ? tokens.accent : tokens.muted,
              fontFamily: labelFontFamily,
            }}
          >
            <ItemIcon item={item} />
          </motion.button>
        );
      })}
      {showCounter && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs tabular-nums" style={{ color: tokens.muted }}>
          <span className="text-base font-semibold" style={{ color: tokens.accent }}>{String(activeIndex + 1).padStart(2, "0")}</span>
          {" / "}
          {String(items.length).padStart(2, "0")}
        </p>
      )}
    </motion.div>
  );
}

function WheelContent({
  item,
  activeIndex,
  total,
  mode,
  tokens,
  showCTA,
  transition,
  titleFontFamily,
  bodyFontFamily,
  labelFontFamily,
  compact = false,
}: {
  item: WheelItem;
  activeIndex: number;
  total: number;
  mode: WheelContentMode;
  tokens: ThemeTokens;
  showCTA: boolean;
  transition: Transition;
  titleFontFamily?: string;
  bodyFontFamily?: string;
  labelFontFamily?: string;
  compact?: boolean;
}) {
  if (mode === "hidden") return null;
  return (
    <div className="relative pl-7" style={{ borderLeft: `3px solid ${tokens.ring}` }}>
      <motion.span
        layout
        className="absolute -left-[3px] inset-y-0 block w-[3px] origin-top rounded-full"
        initial={{ scaleY: 0.2 }}
        animate={{ scaleY: 1 }}
        transition={transition}
        style={{ background: tokens.accent }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
          transition={transition}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: `${tokens.accent}45`, color: tokens.accent, fontFamily: labelFontFamily }}
          >
            <span className="size-1.5 rounded-full" style={{ background: tokens.accent }} />
            {item.label}
          </div>
          <h3
            className={cn("mt-6 font-semibold tracking-tight", compact ? "text-3xl" : "text-4xl")}
            style={{ color: tokens.text, fontFamily: titleFontFamily }}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="mt-2 text-xs uppercase tracking-[0.16em]" style={{ color: tokens.accent, fontFamily: labelFontFamily }}>
              {item.subtitle}
            </p>
          )}
          {mode === "detailed" && item.description && (
            <p className="mt-4 max-w-[455px] text-[15px] leading-7" style={{ color: tokens.muted, fontFamily: bodyFontFamily }}>
              {item.description}
            </p>
          )}
          {mode === "detailed" && (
            // eslint-disable-next-line @next/next/no-img-element -- keeps copied registry source independent of Next Image configuration
            <img
              src={item.image ?? FALLBACK_IMAGES[activeIndex % FALLBACK_IMAGES.length]}
              alt=""
              draggable={false}
              className={cn("mt-6 w-full max-w-[468px] object-cover", compact ? "h-[206px] rounded-xl" : "h-[248px] rounded-2xl")}
            />
          )}
          {showCTA && item.ctaHref && (
            <a
              href={item.ctaHref}
              className="mt-6 inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: tokens.ctaBackground,
                borderColor: tokens.ctaBorder,
                color: tokens.ctaText,
                fontFamily: labelFontFamily,
              }}
            >
              {item.ctaLabel ?? "Learn More"}
            </a>
          )}
          <p className="mt-4 text-xs tabular-nums" style={{ color: tokens.muted, fontFamily: labelFontFamily }}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
