"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

/** One commit row. `lane` 0 is main, 1 is the feature lane, 2 is the lab lane. */
export type RoadmapCommit = {
  lane: 0 | 1 | 2;
  /** Release tag drawn as a pill, e.g. `v2.0`. */
  tag?: string;
  title: string;
  /** Short status line under the title. */
  meta: string;
  /** Text shown in the commit message when the row is open. */
  body: string;
  /** `done` is solid, `head` is the pulsing current work, `next` is hollow. */
  state: "done" | "head" | "next";
};

/** A feature lane that forks off main at row `from` and merges back at row `to`. Row 0 is the top (newest). */
export type RoadmapBranch = { lane: 1 | 2; from: number; to: number; color: string };

export interface CommitGraphRoadmapProps {
  /** Commits, newest first, like `git log --graph`. Defaults to a sample product roadmap. */
  commits?: RoadmapCommit[];
  /** Branch lanes drawn between the commits. Must match the commit rows. */
  branches?: RoadmapBranch[];
  /** Row opened first. Defaults to the HEAD commit. */
  defaultOpen?: number;
  /** Opens each commit in turn, once the graph is on screen, until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

// newest at the top, like `git log --graph`
const COMMITS: RoadmapCommit[] = [
  { lane: 0, tag: "v3.0", title: "Motion Kit", meta: "Planned · Q1", body: "Templates, blocks and a tuning panel for every component.", state: "next" },
  { lane: 0, title: "Merge charts and sounds", meta: "Planned · Dec", body: "Both branches land on main together for the 2.5 release.", state: "next" },
  { lane: 1, title: "Charts", meta: "In progress", body: "Animated bar, line and ring charts that build as they enter.", state: "head" },
  { lane: 2, title: "Sounds", meta: "Ready · Oct", body: "Optional click and whoosh sounds, off by default.", state: "done" },
  { lane: 1, title: "Tune panel", meta: "Done · Sep", body: "Change springs and timing live, copy the result.", state: "done" },
  { lane: 0, tag: "v2.0", title: "Nexus Pro", meta: "Shipped · Aug", body: "Pro library with 60 premium blocks.", state: "done" },
  { lane: 1, title: "Origami, vinyl, sand", meta: "Done · Jul", body: "The rare set: odd interactions people stop for.", state: "done" },
  { lane: 0, tag: "v1.4", title: "Blocks", meta: "Shipped · Jun", body: "Hero, pricing, FAQ and footer blocks.", state: "done" },
];
// branch lane spans [from row (older, bottom) to row (newer, top)]
const BRANCHES: RoadmapBranch[] = [
  { lane: 1, from: 7, to: 1, color: "#bf5af2" },
  { lane: 2, from: 5, to: 1, color: "#ff9f0a" },
];

const LANE_COLOR = ["#0a84ff", "#bf5af2", "#ff9f0a"];
const LANE_NAME = ["main", "feature", "lab"];
const RH = 64;
const LX = 22;
const LW = 26;
const lx = (l: number) => LX + l * LW;
const ry = (r: number) => RH / 2 + r * RH;

function branchPath(b: RoadmapBranch) {
  // fork out of main at `from`, run up the lane, merge back at `to`
  const x0 = lx(0);
  const x1 = lx(b.lane);
  const y0 = ry(b.from);
  const y1 = ry(b.to);
  return `M ${x0} ${y0} C ${x0} ${y0 - RH * 0.55}, ${x1} ${y0 - RH * 0.45}, ${x1} ${y0 - RH} L ${x1} ${y1 + RH} C ${x1} ${y1 + RH * 0.45}, ${x0} ${y1 + RH * 0.55}, ${x0} ${y1}`;
}

const slug = (title: string) => title.toLowerCase().split(/[ ,]/)[0];
const branchName = (c: RoadmapCommit) => (c.lane === 0 ? "main" : `${c.lane === 1 ? "feature" : "lab"}/${slug(c.title)}`);

/**
 * A roadmap drawn as a commit graph. Main runs down the left with release
 * tags; feature work forks off on coloured lanes and merges back. The graph
 * draws itself when it scrolls in, the current HEAD pulses, hovering a commit
 * lights its whole branch, and clicking opens the commit message.
 */
export function CommitGraphRoadmap({ commits = COMMITS, branches = BRANCHES, defaultOpen, autoplay = false, className = "" }: CommitGraphRoadmapProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const seen = useInView(box, { once: true, amount: 0.3 });
  const visible = useInView(box, { amount: 0.3 });
  const headRow = commits.findIndex((c) => c.state === "head");
  const [hoverLane, setHoverLane] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(() => {
    const first = defaultOpen ?? (headRow >= 0 ? headRow : 0);
    return commits.length ? Math.min(commits.length - 1, Math.max(0, first)) : null;
  });

  const count = commits.length;
  useEffect(() => {
    if (!autoplay || reduce || !seen || !visible || count < 2) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setOpen((o) => (o === null ? 0 : (o + 1) % count));
    }, 2800);
    return () => clearInterval(t);
  }, [autoplay, reduce, seen, visible, count]);

  const H = count * RH;
  const dim = (lane: number) => hoverLane !== null && hoverLane !== lane;
  // drawing order: bottom (oldest) first
  const delayFor = (r: number) => (reduce ? 0 : (count - 1 - r) * 0.12);
  // main is solid up to the HEAD commit (or the newest finished one) and dashed above it
  const done = commits.findIndex((c) => c.state === "done");
  const boundary = headRow >= 0 ? headRow : done >= 0 ? done : 0;
  const openCommit = open !== null ? commits[open] : undefined;
  const panelId = `${uid}-panel`;

  return (
    <div
      ref={box}
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`w-full max-w-[560px] rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--surface:#ffffff] sm:p-6 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:[--surface:#1c1c1e] ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="m-0 font-mono text-[14px] font-semibold">
          git log --graph <span className="text-[#6e6e73] dark:text-[#a1a1a6]">roadmap</span>
        </h3>
        <div className="flex gap-3 text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
          {LANE_NAME.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: LANE_COLOR[i] }} />
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="relative" style={{ height: H }} onPointerLeave={() => setHoverLane(null)}>
        <svg className="absolute left-0 top-0" width={lx(2) + 14} height={H} aria-hidden="true">
          {/* main line: past is solid, future is dashed */}
          <motion.line
            x1={lx(0)}
            x2={lx(0)}
            y1={H}
            y2={ry(boundary)}
            stroke={LANE_COLOR[0]}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: seen ? 1 : 0, opacity: dim(0) ? 0.25 : 1 }}
            transition={{ pathLength: { duration: reduce ? 0 : 1.1, ease: "easeInOut" } }}
          />
          <motion.line
            x1={lx(0)}
            x2={lx(0)}
            y1={ry(boundary)}
            y2={ry(0)}
            stroke={LANE_COLOR[0]}
            strokeWidth="3"
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: seen ? (dim(0) ? 0.2 : 0.7) : 0 }}
            transition={{ delay: reduce ? 0 : 1.1 }}
          />
          {branches.map((b) => (
            <motion.path
              key={`${b.lane}-${b.from}-${b.to}`}
              d={branchPath(b)}
              fill="none"
              stroke={b.color}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: seen ? 1 : 0, opacity: dim(b.lane) ? 0.2 : 1 }}
              transition={{ pathLength: { duration: reduce ? 0 : 1, delay: delayFor(b.from) + (reduce ? 0 : 0.2), ease: "easeInOut" } }}
            />
          ))}
        </svg>
        {commits.map((r, i) => {
          const c = LANE_COLOR[r.lane];
          const isOpen = open === i;
          const wait = seen ? delayFor(i) : 0;
          return (
            <div key={`${r.title}-${i}`} className="absolute inset-x-0" style={{ top: i * RH, height: RH }} onPointerEnter={() => setHoverLane(r.lane)}>
              {/* commit dot */}
              <motion.span
                className="absolute rounded-full"
                style={{
                  left: lx(r.lane) - 8,
                  top: RH / 2 - 8,
                  width: 16,
                  height: 16,
                  background: r.state === "next" ? "var(--surface)" : c,
                  boxShadow: r.state === "next" ? `0 0 0 3px ${c}` : `0 0 0 3px var(--surface), 0 0 0 4.5px ${c}33`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: seen ? 1 : 0, opacity: dim(r.lane) ? 0.3 : 1 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22, delay: wait + (seen ? 0.15 : 0) }}
              />
              {r.state === "head" && seen && !reduce && (
                <motion.span
                  className="absolute rounded-full"
                  style={{ left: lx(r.lane) - 8, top: RH / 2 - 8, width: 16, height: 16, border: `2px solid ${c}` }}
                  animate={{ scale: [1, 2.3], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
                />
              )}
              <motion.button
                type="button"
                onClick={() => {
                  touched.current = true;
                  setOpen(isOpen ? null : i);
                }}
                onFocus={() => setHoverLane(r.lane)}
                onBlur={() => setHoverLane(null)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="absolute inset-y-1 right-0 flex items-center gap-2 rounded-[14px] px-3 py-2 text-left outline-none transition-colors hover:bg-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:hover:bg-[#2c2c2e] dark:focus-visible:outline-[#0a84ff]"
                style={{ left: lx(2) + 24 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: seen ? (dim(r.lane) ? 0.35 : 1) : 0, x: seen || reduce ? 0 : -10 }}
                transition={reduce ? { duration: 0 } : { delay: wait + (seen ? 0.25 : 0) }}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    {r.tag && (
                      <span className="rounded-full px-2 py-[1px] font-mono text-[11px] font-semibold text-white" style={{ background: LANE_COLOR[0] }}>
                        {r.tag}
                      </span>
                    )}
                    {r.state === "head" && (
                      <span className="rounded-full bg-[#1d1d1f] px-2 py-[1px] font-mono text-[11px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">HEAD</span>
                    )}
                    <span className={`truncate text-[15px] font-semibold tracking-[-0.01em] ${r.state === "next" ? "text-[#6e6e73] dark:text-[#a1a1a6]" : ""}`}>{r.title}</span>
                  </span>
                  <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{r.meta}</span>
                </span>
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8e8e93"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  className="flex-none"
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={reduce ? { duration: 0 } : undefined}
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </motion.svg>
              </motion.button>
            </div>
          );
        })}
      </div>
      <div id={panelId} role="region" aria-label="Commit message" aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {open !== null && openCommit && (
            <motion.div
              key={open}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-[16px] bg-[#f5f5f7] p-4 font-mono text-[12.5px] leading-[1.6] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
                <div className="text-[#6e6e73] dark:text-[#a1a1a6]">commit {(0x9f3a1c + open * 0x2b17).toString(16)}e{open}</div>
                <div className="break-words">
                  <span className="text-[#6e6e73] dark:text-[#a1a1a6]">branch </span>
                  <span style={{ color: LANE_COLOR[openCommit.lane] }}>{branchName(openCommit)}</span>
                </div>
                <div className="mt-2 font-sans text-[14px]">{openCommit.body}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
