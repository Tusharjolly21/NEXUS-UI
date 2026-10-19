"use client";

import * as React from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Motion ───────────────────────────────────────────────────────────────────

const SPRING_UI = { type: "spring", stiffness: 420, damping: 34 } as const;
const SPRING_LAYOUT = { type: "spring", stiffness: 230, damping: 30 } as const;

const RISE: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 240, damping: 30 } },
};
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};
const STAGGER = (stagger: number, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

// ── product images ────────────────────────────────────────────────────────

const MACBOOK_IMG =
  "https://images.unsplash.com/photo-1540726811314-7648cc1b4426?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const IPHONE_IMG =
  "https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const MACBOOK_PRO_IMG =
  "https://images.unsplash.com/photo-1605784401368-5af1d9d6c4dc?fm=jpg&q=85&w=900&auto=format&fit=crop";

const IPAD_IMG =
  "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// ── card data ─────────────────────────────────────────────────────────────────

interface CardDef {
  id: string;
  tag: string;
  title: string;
  description: string;
  stat: { value: string; unit: string; label: string };
  imgSrc: string;
  imgAlt: string;
}

const CARDS: CardDef[] = [
  {
    id: "smart-interface",
    tag: "Laptop",
    title: "Atlas 16",
    description:
      "A 16-inch workstation with a silent fan curve and a display calibrated for colour work.",
    stat: { value: "22", unit: "hrs", label: "battery life" },
    imgSrc: MACBOOK_PRO_IMG,
    imgAlt: "A 16-inch laptop on a desk",
  },
  {
    id: "realtime-insights",
    tag: "Phone",
    title: "Pocket Pro",
    description:
      "Brushed aluminium and a three-lens camera that holds detail from midday sun to candlelight.",
    stat: { value: "48", unit: "MP", label: "main camera" },
    imgSrc: IPHONE_IMG,
    imgAlt: "A phone held in one hand",
  },
  {
    id: "seamless-sync",
    tag: "Laptop",
    title: "Atlas Air 13",
    description:
      "No fan at all, and a battery that lasts a full working day with change to spare.",
    stat: { value: "11", unit: "mm", label: "thin" },
    imgSrc: MACBOOK_IMG,
    imgAlt: "A thin laptop, half open",
  },
  {
    id: "personalized-workflow",
    tag: "Tablet",
    title: "Slate 11",
    description:
      "A matte, paper-like screen and a stylus that charges when it snaps to the side.",
    stat: { value: "9", unit: "ms", label: "pen latency" },
    imgSrc: IPAD_IMG,
    imgAlt: "A tablet with a stylus",
  },
];

// ── layout tables ─────────────────────────────────────────────────────────────

type Layout = { span: 1 | 2 | 3; order: number };

const DEFAULT_LAYOUTS: Layout[] = [
  { span: 2, order: 0 },
  { span: 1, order: 1 },
  { span: 1, order: 2 },
  { span: 2, order: 3 },
];

const ACTIVE_LAYOUTS: Record<number, Layout[]> = {
  0: [
    { span: 3, order: 0 },
    { span: 1, order: 3 },
    { span: 1, order: 1 },
    { span: 1, order: 2 },
  ],
  1: [
    { span: 1, order: 1 },
    { span: 3, order: 0 },
    { span: 1, order: 2 },
    { span: 1, order: 3 },
  ],
  2: [
    { span: 1, order: 0 },
    { span: 1, order: 1 },
    { span: 3, order: 3 },
    { span: 1, order: 2 },
  ],
  3: [
    { span: 1, order: 1 },
    { span: 1, order: 2 },
    { span: 1, order: 0 },
    { span: 3, order: 3 },
  ],
};

// ── pieces ────────────────────────────────────────────────────────────────────

function ProductImage({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  const reduced = useReducedMotion() === true;
  const [loaded, setLoaded] = React.useState(false);

  return (
    <motion.div
      layout
      className="absolute inset-0 bg-[#e8e8ed] dark:bg-[#2c2c2e]"
      transition={SPRING_LAYOUT}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: active && !reduced ? 1.04 : 1 }}
        transition={SPRING_LAYOUT}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className={cn("object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          priority={false}
        />
      </motion.div>
    </motion.div>
  );
}

function StatLine({ stat }: { stat: CardDef["stat"] }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <span className="text-[40px] tabular-nums">{stat.value}</span>
      <span className="text-[20px] tracking-[-0.02em]">{stat.unit}</span>
      <span className="ml-1 text-[13px] font-normal tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]">{stat.label}</span>
    </p>
  );
}

const SURFACE =
  "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

/** Top scrim for narrow tiles, side scrim for the spotlit one. Both fade from the tile colour. */
function Scrims({ active }: { active: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[68%] bg-gradient-to-b from-white via-white/85 to-transparent transition-opacity duration-500 dark:from-[#1c1c1e] dark:via-[#1c1c1e]/85",
          active ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[72%] bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-500 dark:from-[#1c1c1e] dark:via-[#1c1c1e]/90",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}

// ── desktop tile ─────────────────────────────────────────────────────────────

function SpotlightTile({
  card,
  layout,
  isActive,
  dimmed,
  onActivate,
  onDeactivate,
}: {
  card: CardDef;
  layout: Layout;
  isActive: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const reduced = useReducedMotion() === true;

  return (
    <motion.div
      layout
      variants={reduced ? FADE : RISE}
      transition={SPRING_LAYOUT}
      onHoverStart={onActivate}
      onHoverEnd={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      tabIndex={0}
      role="group"
      aria-label={`${card.title}, ${card.tag.toLowerCase()}`}
      style={{ gridColumn: `span ${layout.span}`, order: layout.order, borderRadius: 28 }}
      className={cn(
        "relative h-[280px] min-w-0 cursor-default overflow-hidden outline-offset-2 transition-shadow duration-500 focus-visible:outline-2 focus-visible:outline-[#0071e3] lg:h-[300px]",
        SURFACE,
        isActive &&
          "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_30px_60px_-30px_rgba(0,0,0,.9)]",
      )}
    >
      <div className={cn("absolute inset-0 transition-opacity duration-500", dimmed ? "opacity-55" : "opacity-100")}>
        <ProductImage src={card.imgSrc} alt={card.imgAlt} active={isActive} />
        <Scrims active={isActive} />

        <motion.div layout="position" transition={SPRING_LAYOUT} className="absolute inset-x-0 top-0 p-6 lg:p-7">
          <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{card.tag}</p>
          <h3 className="mt-1 text-[24px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {card.title}
          </h3>
          <AnimatePresence initial={false}>
            {isActive ? (
              <motion.div
                key="detail"
                className="max-w-[44%]"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...SPRING_UI, delay: reduced ? 0 : 0.08 } }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)", transition: { duration: 0.15 } }}
              >
                <div className="mt-5">
                  <StatLine stat={card.stat} />
                </div>
                <p className="mt-4 text-pretty text-[15px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {card.description}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── mobile tile ──────────────────────────────────────────────────────────────

function StackedTile({ card }: { card: CardDef }) {
  const reduced = useReducedMotion() === true;
  return (
    <motion.article
      variants={reduced ? FADE : RISE}
      className={cn("relative h-[360px] overflow-hidden rounded-[28px]", SURFACE)}
    >
      <ProductImage src={card.imgSrc} alt={card.imgAlt} active={false} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[78%] bg-gradient-to-b from-white via-white/90 to-transparent dark:from-[#1c1c1e] dark:via-[#1c1c1e]/90"
      />
      <div className="relative p-6">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{card.tag}</p>
        <h3 className="mt-1 text-[24px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          {card.title}
        </h3>
        <div className="mt-4">
          <StatLine stat={card.stat} />
        </div>
        <p className="mt-3 text-pretty text-[15px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">{card.description}</p>
      </div>
    </motion.article>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export interface SpotlightBentoGridProps {
  /** Section headline. Pass an empty string to hide the header. */
  title?: string;
  description?: string;
  className?: string;
}

export default function SpotlightBentoGrid({
  title = "Find the one that fits.",
  description = "Four devices, one family. Hover a tile to bring it forward.",
  className,
}: SpotlightBentoGridProps = {}) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const reduced = useReducedMotion() === true;
  const rise = reduced ? FADE : RISE;
  const layouts =
    activeIdx === null || reduced
      ? DEFAULT_LAYOUTS
      : (ACTIVE_LAYOUTS[activeIdx] ?? DEFAULT_LAYOUTS);
  const id = React.useId();

  return (
    <section className={cn("w-full bg-[#f5f5f7] px-4 py-14 dark:bg-black sm:px-6 sm:py-20", className)}>
      <motion.div
        className="mx-auto w-full max-w-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={STAGGER(0.07)}
      >
        {title ? (
          <div className="mb-8 sm:mb-10">
            <motion.h2
              variants={rise}
              className="text-balance text-[32px] font-semibold leading-[1.07] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[44px]"
            >
              {title}
            </motion.h2>
            {description ? (
              <motion.p
                variants={rise}
                className="mt-3 max-w-lg text-pretty text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]"
              >
                {description}
              </motion.p>
            ) : null}
          </div>
        ) : null}

        {/* Desktop: interactive spotlight grid */}
        <LayoutGroup id={id}>
          <motion.div
            variants={STAGGER(0.07)}
            className="hidden gap-4 md:grid"
            style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {CARDS.map((card, i) => (
              <SpotlightTile
                key={card.id}
                card={card}
                layout={layouts[i]}
                isActive={activeIdx === i}
                dimmed={activeIdx !== null && activeIdx !== i}
                onActivate={() => setActiveIdx(i)}
                onDeactivate={() => setActiveIdx((current) => (current === i ? null : current))}
              />
            ))}
          </motion.div>
        </LayoutGroup>

        {/* Mobile: stacked */}
        <motion.div variants={STAGGER(0.07)} className="flex flex-col gap-3 md:hidden">
          {CARDS.map((card) => (
            <StackedTile key={card.id} card={card} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
