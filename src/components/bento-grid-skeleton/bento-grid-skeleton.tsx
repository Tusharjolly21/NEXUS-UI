"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BentoSkeletonCard {
  id: string;
  title: string;
  description: string;
  tag?: string;
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  skeletonType: SkeletonType;
}

export type SkeletonType =
  | "chat"
  | "dashboard"
  | "avatar"
  | "workflow"
  | "calendar"
  | "code";

export interface BentoGridSkeletonProps {
  cards: BentoSkeletonCard[];
  animated?: boolean;
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function spanClasses(span?: BentoSkeletonCard["span"]) {
  switch (span) {
    case "2x1": return "col-span-2 row-span-1";
    case "1x2": return "col-span-1 row-span-2";
    case "2x2": return "col-span-2 row-span-2";
    default:   return "col-span-1 row-span-1";
  }
}

function minH(span?: BentoSkeletonCard["span"]) {
  if (span === "1x2" || span === "2x2") return "min-h-[280px]";
  return "min-h-[220px]";
}

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

// ── Shimmer base ───────────────────────────────────────────────────────────────

function ShimmerBar({
  className,
  delay = 0,
  duration = 1.6,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-white/[0.07]", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ["0%", "200%"] }}
        transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{ width: "50%", height: "100%" }}
      />
    </div>
  );
}

function PulseBar({
  className,
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={cn("rounded-md bg-white/[0.07]", className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeInOut" }}
      style={style}
    />
  );
}

// ── Chat Skeleton ─────────────────────────────────────────────────────────────

function ChatSkeleton() {
  const reduce = useReducedMotion() === true;
  const msgs = [
    { side: "left", w: "w-16", delay: 0 },
    { side: "right", w: "w-24", delay: 0.4 },
    { side: "left", w: "w-20", delay: 0.8 },
    { side: "right", w: "w-14", delay: 1.2 },
    { side: "left", w: "w-18", delay: 1.6 },
  ];

  return (
    <div className="flex h-full flex-col justify-end gap-2 px-3 pb-3">
      {/* header avatar */}
      <div className="mb-2 flex items-center gap-2">
        <div className="size-5 shrink-0 rounded-full bg-white/[0.12]" />
        <ShimmerBar className="h-2.5 w-20" />
      </div>
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          className={cn(
            "flex items-end gap-1.5",
            m.side === "right" && "self-end flex-row-reverse",
          )}
          initial={reduce ? {} : { opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: m.delay, duration: 0.4, ease: "easeOut" }}
        >
          {m.side === "left" && <div className="size-4 shrink-0 rounded-full bg-white/[0.1]" />}
          <div className={cn("h-6 rounded-xl rounded-bl-sm bg-white/[0.08]", m.w)} />
          {m.side === "right" && <div className="size-4 shrink-0 rounded-full bg-cyan-500/20" />}
        </motion.div>
      ))}
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  const bars = [
    { h: 18, delay: 0 },
    { h: 28, delay: 0.15 },
    { h: 22, delay: 0.3 },
    { h: 36, delay: 0.45 },
    { h: 26, delay: 0.6 },
    { h: 30, delay: 0.75 },
    { h: 20, delay: 0.9 },
    { h: 34, delay: 1.05 },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* top stat row */}
      <div className="flex gap-2">
        {["w-14", "w-16", "w-12"].map((w, i) => (
          <div key={i} className="flex-1 rounded-xl bg-white/[0.05] p-2">
            <ShimmerBar className="mb-1.5 h-2 w-8" />
            <PulseBar className="h-4" style={{ animationDelay: `${i * 0.3}s` } as React.CSSProperties} />
          </div>
        ))}
      </div>
      {/* bar chart */}
      <div className="lf-grid relative flex flex-1 items-end gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-cyan-500/30"
            style={{ height: b.h }}
            animate={{ scaleY: [1, 0.7, 1], originY: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Avatar / Community Skeleton ───────────────────────────────────────────────

function AvatarSkeleton() {
  const reduce = useReducedMotion() === true;
  const [active, setActive] = React.useState(0);
  const ids = [0, 1, 2, 3];

  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % ids.length), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const positions: Record<number, string> = {
    0: "top-4 left-4",
    1: "top-4 right-4",
    2: "bottom-12 left-6",
    3: "bottom-4 right-8",
  };

  return (
    <div className="relative h-full p-4">
      {ids.map((i) => {
        const isActive = active === i;
        return (
          <motion.div
            key={i}
            className={cn(
              "absolute flex size-10 items-center justify-center rounded-full text-xs font-semibold",
              positions[i],
              isActive
                ? "z-10 border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 shadow-lg shadow-cyan-500/20"
                : "z-[1] border border-white/10 bg-white/[0.07]",
            )}
            animate={
              reduce
                ? undefined
                : {
                    scale: isActive ? [1, 1.15, 1] : [1, 1.04, 1],
                    opacity: isActive ? [0.8, 1, 0.8] : [0.6, 0.75, 0.6],
                  }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {["NX", "PR", "BL", "UK"][i]}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Workflow / Steps Skeleton ──────────────────────────────────────────────────

function WorkflowSkeleton() {
  const reduce = useReducedMotion() === true;
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (reduce) return;
    setProgress(0);
    const id = setInterval(() => setProgress((p) => (p + 1) % 4), 1800);
    return () => clearInterval(id);
  }, [reduce]);

  const steps = ["Draft", "Review", "Deploy", "Live"];
  const nodes = [
    { cx: 28, cy: 56 },
    { cx: 72, cy: 56 },
    { cx: 116, cy: 56 },
    { cx: 160, cy: 56 },
  ];

  return (
    <div className="relative flex h-full items-center justify-center p-3">
      {/* connecting line */}
      <div className="absolute left-6 right-6 top-[56px] h-px bg-gradient-to-r from-white/10 via-cyan-500/30 to-white/10" />

      {steps.map((step, i) => {
        const isDone = progress > i;
        const isActive = progress === i;
        const isPending = progress < i;

        return (
          <React.Fragment key={step}>
            {/* node */}
            <motion.div
              className={cn(
                "absolute flex size-6 items-center justify-center rounded-full border text-[9px] font-bold",
                isDone && "border-emerald-500/60 bg-emerald-500/20 text-emerald-400",
                isActive && "border-cyan-400/60 bg-cyan-500/20 text-cyan-400",
                isPending && "border-white/10 bg-white/[0.04] text-white/20",
              )}
              style={{ left: nodes[i].cx - 12, top: nodes[i].cy - 12 }}
              animate={
                isActive && !reduce
                  ? { scale: [1, 1.2, 1] }
                  : {}
              }
              transition={{ duration: 1.4, repeat: isActive && !reduce ? Infinity : 0 }}
            >
              {isDone ? "✓" : isActive ? "●" : i + 1}
            </motion.div>

            {/* label */}
            <div
              className="absolute text-[8px] font-medium"
              style={{
                left: nodes[i].cx - 12,
                top: nodes[i].cy + 18,
                width: 24,
                textAlign: "center",
                color: isDone ? "rgba(52,211,153,0.7)" : isActive ? "rgba(34,211,240,0.7)" : "rgba(255,255,255,0.2)",
              }}
            >
              {step}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Calendar Skeleton ───────────────────────────────────────────────────────────

function CalendarSkeleton() {
  const days = Array.from({ length: 35 }, (_, i) => {
    const highlighted = [3, 7, 12, 16, 21, 25, 28].includes(i + 1);
    return { n: i + 1, highlighted };
  });

  const tasks = ["Design review", "Deploy", "QA check"];

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {/* header */}
      <div className="mb-1 flex items-center justify-between">
        <ShimmerBar className="h-2.5 w-24" />
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="size-1.5 rounded-full bg-white/[0.12]" />
          ))}
        </div>
      </div>

      {/* day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="flex items-center justify-center text-[7px] text-white/20">{d}</div>
        ))}
        {days.map((d, i) => (
          <motion.div
            key={i}
            className={cn(
              "flex items-center justify-center rounded-sm text-[8px]",
              d.highlighted
                ? "bg-cyan-500/25 text-cyan-300"
                : "text-white/25",
            )}
            animate={d.highlighted && !useReducedMotion() ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
          >
            {d.n}
          </motion.div>
        ))}
      </div>

      {/* task list */}
      <div className="mt-auto space-y-1.5">
        {tasks.map((task, i) => (
          <div key={task} className="flex items-center gap-1.5">
            <motion.div
              className="size-1.5 rounded-full bg-cyan-500/40"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
            />
            <ShimmerBar className="h-2 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Code Skeleton ─────────────────────────────────────────────────────────────

function CodeSkeleton() {
  const lines = [
    { w: "w-32", indent: 0 },
    { w: "w-20", indent: 1 },
    { w: "w-28", indent: 1 },
    { w: "w-14", indent: 2 },
    { w: "w-24", indent: 2 },
    { w: "w-10", indent: 3 },
    { w: "w-18", indent: 3 },
    { w: "w-6",  indent: 2 },
    { w: "w-22", indent: 1 },
    { w: "w-16", indent: 0 },
  ];

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-hidden p-3">
      {/* tab bar */}
      <div className="mb-1 flex items-center gap-1.5">
        {["app.tsx", "page.ts"].map((f, i) => (
          <div
            key={f}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-[8px]",
              i === 0
                ? "bg-white/[0.08] text-white/50 border border-white/[0.1]"
                : "text-white/20",
            )}
          >
            <div className="size-1 rounded-full bg-emerald-400/40" />
            {f}
          </div>
        ))}
      </div>

      {/* code lines */}
      {lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: l.indent * 8 }}>
          <span className="w-3 text-right text-[7px] text-white/[0.12]">{i + 1}</span>
          <ShimmerBar className={cn("h-2", l.w)} delay={i * 0.08} duration={1.4} />
        </div>
      ))}

      {/* lock badge */}
      <div className="mt-auto flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
        <div className="size-3 rounded-full border border-white/[0.15] bg-white/[0.06]" />
        <ShimmerBar className="h-1.5 w-16" />
      </div>
    </div>
  );
}

// ── Skeleton renderer ─────────────────────────────────────────────────────────

function renderSkeleton(type: SkeletonType) {
  switch (type) {
    case "chat":       return <ChatSkeleton />;
    case "dashboard":  return <DashboardSkeleton />;
    case "avatar":     return <AvatarSkeleton />;
    case "workflow":   return <WorkflowSkeleton />;
    case "calendar":   return <CalendarSkeleton />;
    case "code":       return <CodeSkeleton />;
  }
}

// ── Bento Card ─────────────────────────────────────────────────────────────────

function BentoSkeletonCard({
  card,
  index,
  reduce,
  isInView,
}: {
  card: BentoSkeletonCard;
  index: number;
  reduce: boolean;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={
        reduce
          ? {}
          : { delay: index * 0.06, duration: 0.44, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
      }
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/20 dark:from-white/[0.03] dark:to-transparent"
    >
      {/* skeleton preview */}
      <div className={cn("relative flex-1 overflow-hidden", minH(card.span))}>
        <div className="lf-grid absolute inset-0 opacity-40" />
        {renderSkeleton(card.skeletonType)}
      </div>

      {/* card footer */}
      <div className="relative z-10 border-t border-white/[0.06] bg-black/30 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            {card.tag && (
              <span className="mb-1.5 inline-block rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400/80">
                {card.tag}
              </span>
            )}
            <p className="text-sm font-semibold text-white">{card.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/40">{card.description}</p>
          </div>
          <div className="mt-1 shrink-0 size-5 rounded-full border border-white/10 bg-white/5" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BentoGridSkeleton({
  cards,
  animated = true,
  className,
}: BentoGridSkeletonProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion() === true;

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-3",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        "auto-rows-fr",
        className,
      )}
    >
      {cards.map((card, i) => (
        <div key={card.id} className={spanClasses(card.span)}>
          <BentoSkeletonCard
            card={card}
            index={i}
            reduce={reduce || !animated}
            isInView={isInView}
          />
        </div>
      ))}
    </div>
  );
}