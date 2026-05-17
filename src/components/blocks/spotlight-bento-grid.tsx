"use client";

import * as React from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

const SPRING = { type: "spring" as const, bounce: 0.12, duration: 0.45 };

// ── abstract animated visuals ─────────────────────────────────────────────────

function PulseRings({ color }: { color: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[72, 120, 168].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ width: size, height: size, borderColor: color }}
          animate={reduced ? {} : { scale: [1, 1.07, 1], opacity: [0.55, 0.18, 0.55] }}
          transition={{ duration: 2.6, delay: i * 0.72, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="size-9 rounded-full"
        style={{ background: color, filter: "blur(6px)", opacity: 0.55 }}
        animate={reduced ? {} : { scale: [1, 1.18, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function ChartBars({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const heights = [34, 58, 42, 74, 50, 66, 38];
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 px-10 pb-14">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${h}%`, background: color, opacity: 0.65 }}
          animate={reduced ? {} : { scaleY: [1, 1.16, 0.91, 1] }}
          transition={{ duration: 2.1, delay: i * 0.13, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function OrbitRings({ color }: { color: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[
        { size: 100, dur: 8, dir: 1, opacity: 0.35 },
        { size: 62, dur: 5, dir: -1, opacity: 0.25 },
      ].map(({ size, dur, dir, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ width: size, height: size, borderColor: color, opacity }}
          animate={reduced ? {} : { rotate: dir * 360 }}
          transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute left-1/2 -top-1.5 size-3 -translate-x-1/2 rounded-full"
            style={{ background: color }}
          />
        </motion.div>
      ))}
      <div
        className="size-8 rounded-full"
        style={{ background: color, opacity: 0.5, filter: "blur(5px)" }}
      />
    </div>
  );
}

function NodeGraph({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const lines = [
    { x1: 80, y1: 55, x2: 28, y2: 18 },
    { x1: 80, y1: 55, x2: 132, y2: 18 },
    { x1: 80, y1: 55, x2: 80, y2: 94 },
  ];
  const nodes = [
    { cx: 80, cy: 55, r: 10 },
    { cx: 28, cy: 18, r: 6 },
    { cx: 132, cy: 18, r: 6 },
    { cx: 80, cy: 94, r: 6 },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 160 112" width="160" height="112">
        {lines.map((l, i) => (
          <motion.line
            key={i}
            {...l}
            stroke={color}
            strokeWidth="1.5"
            animate={reduced ? {} : { strokeOpacity: [0.3, 0.75, 0.3] }}
            transition={{ duration: 2.1, delay: i * 0.42, repeat: Infinity }}
          />
        ))}
        {nodes.map(({ cx, cy, r }, i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={color}
            fillOpacity={i === 0 ? 0.6 : 0.4}
            animate={reduced ? {} : { r: [r, r * 1.22, r] }}
            transition={{ duration: 2.1, delay: i * 0.32, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── card data ─────────────────────────────────────────────────────────────────

interface CardDef {
  id: string;
  tag: string;
  title: string;
  description: string;
  bg: string;
  glow: string;
  visual: React.ReactElement;
}

const CARDS: CardDef[] = [
  {
    id: "smart-interface",
    tag: "Interface",
    title: "Smart Interface",
    description:
      "Adaptive UI that learns your workflow and surfaces the right tools at exactly the right moment.",
    bg: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f0f23 100%)",
    glow: "#6366f1",
    visual: <PulseRings color="#6366f1" />,
  },
  {
    id: "realtime-insights",
    tag: "Analytics",
    title: "Real-time Insights",
    description:
      "Live dashboards with zero-latency data streams so every decision is backed by now.",
    bg: "linear-gradient(135deg,#022c22 0%,#064e3b 50%,#0c4a6e 100%)",
    glow: "#10b981",
    visual: <ChartBars color="#10b981" />,
  },
  {
    id: "seamless-sync",
    tag: "Sync",
    title: "Seamless Sync",
    description:
      "One source of truth across every device, teammate, and integration you connect.",
    bg: "linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#1a1040 100%)",
    glow: "#8b5cf6",
    visual: <OrbitRings color="#8b5cf6" />,
  },
  {
    id: "personalized-workflow",
    tag: "Workflow",
    title: "Personalized Workflow",
    description:
      "AI-tuned pipelines that adapt to how your team actually works, not a template.",
    bg: "linear-gradient(135deg,#431407 0%,#7c2d12 50%,#451a03 100%)",
    glow: "#f97316",
    visual: <NodeGraph color="#f97316" />,
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
        background: card.bg,
        border: `1px solid ${isActive ? `${card.glow}55` : "rgba(255,255,255,0.07)"}`,
        boxShadow: isActive
          ? `0 0 0 1px ${card.glow}28, 0 8px 64px 0 ${card.glow}22`
          : "none",
        filter: dimmed ? "saturate(0.15) brightness(0.42)" : "none",
        transition: "filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
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
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
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
              style={{ gridColumn: `span ${layouts[i].span}`, order: layouts[i].order }}
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
