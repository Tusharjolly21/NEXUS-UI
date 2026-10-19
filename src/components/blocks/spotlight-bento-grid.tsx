"use client";

import * as React from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";

const SPRING = { type: "spring" as const, bounce: 0.12, duration: 0.45 };

// ── product images ────────────────────────────────────────────────────────

const MACBOOK_IMG =
  // "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?fm=jpg&q=85&w=900&auto=format&fit=crop";
  "https://images.unsplash.com/photo-1540726811314-7648cc1b4426?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const IPHONE_IMG =
  // "https://images.unsplash.com/photo-1576103200868-2dd3eec3f333?fm=jpg&q=85&w=900&auto=format&fit=crop";
  "https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const MACBOOK_PRO_IMG =
  "https://images.unsplash.com/photo-1605784401368-5af1d9d6c4dc?fm=jpg&q=85&w=900&auto=format&fit=crop";

const IPAD_IMG =
  // "https://images.unsplash.com/photo-1651747137395-065bd3af97bb?fm=jpg&q=85&w=900&auto=format&fit=crop";
  "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// ── image visual ──────────────────────────────────────────────────────────────

function ProductImage({
  src,
  alt,
  objectFit = "contain",
  className,
}: {
  src: string;
  alt: string;
  objectFit?: "contain" | "cover";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0"
        animate={reduced ? {} : { scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-700"
          style={{ objectFit }}
          onLoad={() => setLoaded(true)}
          priority={false}
        />
      </motion.div>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
      )}
    </div>
  );
}

// ── card data ─────────────────────────────────────────────────────────────────

interface CardDef {
  id: string;
  tag: string;
  title: string;
  description: string;
  bg?: string;
  glow: string;
  visual: React.ReactElement;
  imgSrc?: string;
  imgAlt?: string;
}

const CARDS: CardDef[] = [
  {
    id: "smart-interface",
    tag: "Laptop",
    title: "Atlas 16",
    description:
      "A 16-inch workstation with a 22-hour battery, a silent fan curve and a display calibrated for colour work.",
    glow: "#6366f1",
    imgSrc: MACBOOK_PRO_IMG,
    imgAlt: "A 16-inch laptop on a desk",
    visual: (
      <ProductImage
        src={MACBOOK_PRO_IMG}
        alt="A 16-inch laptop on a desk"
        className="h-full w-full"
      />
    ),
  },
  {
    id: "realtime-insights",
    tag: "Phone",
    title: "Pocket Pro",
    description:
      "A brushed-aluminium phone with a three-lens camera that holds detail from midday sun to candlelight.",
    glow: "#10b981",
    imgSrc: IPHONE_IMG,
    imgAlt: "A phone held in one hand",
    visual: (
      <ProductImage src={IPHONE_IMG} alt="A phone held in one hand" className="h-full w-full" />
    ),
  },
  {
    id: "seamless-sync",
    tag: "Laptop",
    title: "Atlas Air 13",
    description:
      "Eleven millimetres thin, no fan at all, and a battery that lasts a full working day with change to spare.",
    glow: "#8b5cf6",
    imgSrc: MACBOOK_IMG,
    imgAlt: "A thin laptop, half open",
    visual: (
      <ProductImage
        src={MACBOOK_IMG}
        alt="A thin laptop, half open"
        className="h-full w-full"
      />
    ),
  },
  {
    id: "personalized-workflow",
    tag: "Tablet",
    title: "Slate 11",
    description:
      "An 11-inch tablet with a matte, paper-like screen and a stylus that charges when it snaps to the side.",
    glow: "#f97316",
    imgSrc: IPAD_IMG,
    imgAlt: "A tablet with a stylus",
    visual: (
      <ProductImage src={IPAD_IMG} alt="A tablet with a stylus" className="h-full w-full" />
    ),
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

// ── single card ───────────────────────────────────────────────────────────────

function SpotlightCardItem({
  card,
  isActive,
  hasAnyActive,
  mobile = false,
}: {
  card: CardDef;
  isActive: boolean;
  hasAnyActive: boolean;
  mobile?: boolean;
}) {
  const dimmed = hasAnyActive && !isActive && !mobile;

  return (
    <div
      className="relative h-[280px] w-full overflow-hidden rounded-[20px]"
      style={{
        background: card.bg ?? "rgba(255,255,255,0.04)",
        border: `1px solid ${isActive ? `${card.glow}55` : "rgba(255,255,255,0.07)"}`,
        boxShadow: isActive
          ? `0 0 0 1px ${card.glow}28, 0 8px 64px 0 ${card.glow}22`
          : "none",
        filter: dimmed ? "saturate(0.15) brightness(0.42)" : "none",
        transition:
          "filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute size-44 rounded-full"
        style={{
          background: card.glow,
          filter: "blur(72px)",
          opacity: isActive ? 0.28 : 0.1,
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Abstract visual */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isActive || mobile ? 1 : 0.5,
          transition: "opacity 0.35s ease",
        }}
      >
        {card.visual}
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          opacity: isActive || mobile ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Text reveal */}
      <AnimatePresence>
        {(isActive || mobile) && (
          <motion.div
            className="absolute inset-x-0 bottom-0 p-5"
            initial={mobile ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRING}
          >
            <span
              className="mb-2.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `${card.glow}22`,
                color: card.glow,
                border: `1px solid ${card.glow}44`,
              }}
            >
              {card.tag}
            </span>
            <h3 className="text-[15px] font-semibold leading-snug text-white">
              {card.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              {card.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export default function SpotlightBentoGrid() {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const reduced = useReducedMotion();
  const layouts =
    activeIdx === null || reduced
      ? DEFAULT_LAYOUTS
      : (ACTIVE_LAYOUTS[activeIdx] ?? DEFAULT_LAYOUTS);
  const id = React.useId();

  return (
    <div className="p-6 sm:p-8">
      {/* Desktop: interactive spotlight grid */}
      <LayoutGroup id={id}>
        <div
          className="hidden gap-3 md:grid"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              layout
              transition={SPRING}
              style={{
                gridColumn: `span ${layouts[i].span}`,
                order: layouts[i].order,
              }}
              onHoverStart={() => setActiveIdx(i)}
              onHoverEnd={() => setActiveIdx(null)}
              className="min-w-0"
            >
              <SpotlightCardItem
                card={card}
                isActive={activeIdx === i}
                hasAnyActive={activeIdx !== null}
              />
            </motion.div>
          ))}
        </div>
      </LayoutGroup>

      {/* Mobile: stacked */}
      <div className="flex flex-col gap-3 md:hidden">
        {CARDS.map((card) => (
          <SpotlightCardItem
            key={card.id}
            card={card}
            isActive={false}
            hasAnyActive={false}
            mobile
          />
        ))}
      </div>
    </div>
  );
}
