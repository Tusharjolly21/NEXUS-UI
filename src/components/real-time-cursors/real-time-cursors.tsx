"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code2, MessageSquareText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code-block/code-block";
import { ChatMessages } from "@/components/chat-messages";
import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";
import type { CardData } from "@/components/card-stack-rotator/card-stack-rotator";
import { EncryptedText } from "@/components/encrypted-text";
import { TypewriterEffect } from "@/components/typewriter-effect";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LiveCursor = {
  name: string;
  color: string;
  textColor?: string;
  path: Array<{ x: number; y: number }>;
  duration?: number;
  delay?: number;
  note?: string;
};

export type RealTimeCursorsProps = {
  cursors?: LiveCursor[];
  className?: string;
};

// ── Cursor data ───────────────────────────────────────────────────────────────

const defaultCursors: LiveCursor[] = [
  {
    name: "Ava",
    color: "#2563eb",
    path: [
      { x: 10, y: 15 },
      { x: 48, y: 8 },
      { x: 68, y: 35 },
      { x: 28, y: 52 },
      { x: 14, y: 32 },
    ],
    duration: 11,
  },
  {
    name: "Noah",
    color: "#7c3aed",
    path: [
      { x: 82, y: 68 },
      { x: 58, y: 42 },
      { x: 38, y: 60 },
      { x: 90, y: 28 },
      { x: 72, y: 80 },
    ],
    duration: 12,
    delay: 0.9,
  },
  {
    name: "Mira",
    color: "#059669",
    path: [
      { x: 22, y: 78 },
      { x: 52, y: 55 },
      { x: 78, y: 72 },
      { x: 36, y: 20 },
      { x: 60, y: 12 },
    ],
    duration: 10,
    delay: 1.8,
  },
  {
    name: "Kai",
    color: "#e11d48",
    path: [
      { x: 88, y: 12 },
      { x: 64, y: 28 },
      { x: 42, y: 6 },
      { x: 18, y: 28 },
      { x: 50, y: 46 },
    ],
    duration: 13,
    delay: 2.6,
  },
];

// ── Static demo data ──────────────────────────────────────────────────────────

const CARDS: CardData[] = [
  {
    id: "1",
    content: "**Real-time collaboration** changes how teams build products together.",
    name: "Jordan Lee",
    designation: "Head of Product",
    initials: "JL",
    company: "Nexus",
  },
  {
    id: "2",
    content: "Design systems need **consistency and flexibility** in equal measure.",
    name: "Alex Chen",
    designation: "Lead Designer",
    initials: "AC",
    company: "Studio",
  },
  {
    id: "3",
    content: "The best **developer experience** feels invisible — it just works.",
    name: "Maya Patel",
    designation: "Engineering Lead",
    initials: "MP",
    company: "Nexus",
  },
];

// Defined at module level — inline array literals create a new ref each render,
// which resets the TypewriterEffect animation before it can progress.
const TYPEWRITER_TEXTS = [
  "A stunning landing page.",
  "A real-time dashboard.",
  "A collaborative workspace.",
  "The next big thing.",
];

const SNIPPET = `import { RealTimeCursors } from "@nexus/ui";

export default function Canvas() {
  return (
    <RealTimeCursors
      cursors={[
        { name: "Ava",  color: "#2563eb",
          path: [{ x: 10, y: 15 }, ...] },
        { name: "Noah", color: "#7c3aed",
          path: [{ x: 82, y: 68 }, ...] },
      ]}
    />
  );
}`;

// ── Cursor SVG ────────────────────────────────────────────────────────────────

function CursorIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-[0_8px_14px_rgba(0,0,0,.3)]"
    >
      <path
        d="M5.4 3.1v16.2c0 .52.64.77.99.39l4.2-4.52c.14-.15.34-.24.55-.24h6.76c.6 0 .9-.73.48-1.15L6.55 2.63c-.43-.4-1.15-.1-1.15.47Z"
        fill={color}
        stroke="rgba(255,255,255,.86)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function LiveCursorMarker({ cursor }: { cursor: LiveCursor }) {
  const xs = cursor.path.map((p) => `${p.x}%`);
  const ys = cursor.path.map((p) => `${p.y}%`);

  return (
    <motion.div
      className="absolute left-0 top-0 z-30 pointer-events-none"
      style={{ x: "-50%", y: "-50%" }}
      initial={{ left: xs[0], top: ys[0], opacity: 0 }}
      animate={{ left: xs, top: ys, opacity: [0, 1, 1, 1, 0] }}
      transition={{
        duration: cursor.duration ?? 11,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: cursor.delay ?? 0,
      }}
    >
      <div className="relative">
        <CursorIcon color={cursor.color} />
        <motion.div
          className="absolute left-6 top-5 flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-lg"
          style={{ backgroundColor: cursor.color, color: cursor.textColor ?? "#ffffff" }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: cursor.delay ?? 0 }}
        >
          {cursor.name}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Grid Cell ─────────────────────────────────────────────────────────────────

function GridCell({
  children,
  className,
  label,
  accentColor = "rgba(255,255,255,0.05)",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#080e22]/90 backdrop-blur",
        className,
      )}
      style={{ boxShadow: `inset 0 0 50px ${accentColor}` }}
    >
      {label && (
        <div className="absolute top-3 left-3 z-10 rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white/35 backdrop-blur pointer-events-none">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RealTimeCursors({ cursors = defaultCursors, className }: RealTimeCursorsProps) {
  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden rounded-3xl border border-white/10 bg-[#030610] p-5 text-white",
        className,
      )}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_8%,rgba(59,130,246,.14),transparent_38%),radial-gradient(ellipse_at_92%_85%,rgba(124,58,237,.12),transparent_38%),radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,.06),transparent_55%)]" />
      {/* Fine grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* ── Header ── */}
      <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/55">
            <MessageSquareText className="size-3.5" />
            Multiplayer workspace
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Live collaboration canvas
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {cursors.map((c) => (
              <div
                key={c.name}
                className="grid size-8 place-items-center rounded-full border-2 border-[#030610] text-[11px] font-bold"
                style={{ backgroundColor: c.color }}
              >
                {c.name[0]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="size-3" />
            {cursors.length} online
          </div>
        </div>
      </div>

      {/* ── Bento grid — cursors float over everything ── */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-20">
          {cursors.map((c) => (
            <LiveCursorMarker key={c.name} cursor={c} />
          ))}
        </div>

        {/*
          4-column grid, 4 rows — each cell a different size:

          Row 1 (380px):  [CodeBlock — 2col]  [ChatMessages — 2col]
          Row 2 (320px):  [CardStack — 1col]  [EncryptedText — 1col]  [Typewriter — 2col]
          Row 3 (240px):  [ShootingStars — 3col]  [LiveCursors spotlight — 1col]
        */}
        <div className="grid grid-cols-4 gap-3">

          {/* ── Row 1 ── */}

          {/* CodeBlock — col span 2, tall */}
          <GridCell className="col-span-2 h-[380px]" label="code-block" accentColor="rgba(250,204,21,0.05)">
            <div className="h-full overflow-hidden p-3 pt-8">
              <CodeBlock
                code={SNIPPET}
                language="tsx"
                theme="dark"
                header={{
                  enabled: true,
                  showDots: true,
                  title: "canvas.tsx",
                  copy: { enabled: true },
                }}
                codeArea={{
                  showLineNumbers: true,
                  background: "transparent",
                }}
                border={{ color: "rgba(255,255,255,0.07)", radius: "12px" }}
                className="h-full"
              />
            </div>
          </GridCell>

          {/* ChatMessages — col span 2, tall */}
          <GridCell className="col-span-2 h-[380px]" label="chat-messages" accentColor="rgba(99,102,241,0.07)">
            <div className="h-full pt-8">
              <ChatMessages
                autoPlay
                autoPlayDelay={900}
                typingDuration={1200}
                showReplay
                interactive={false}
                className="h-full"
              />
            </div>
          </GridCell>

          {/* ── Row 2 ── */}

          {/* CardStackRotator — col span 1 */}
          {/* overflow-visible so back-card y-offset isn't clipped by the cell border */}
          <GridCell className="col-span-1 h-[320px] !overflow-visible" label="card-stack-rotator" accentColor="rgba(139,92,246,0.07)">
            <div className="flex h-full items-start justify-center px-4 pb-4 pt-10">
              {/* wrapper height = cardHeight + stackOffset so the back card fits exactly */}
              <div className="relative w-full" style={{ height: "calc(180px + 16px)" }}>
                <CardStackRotator
                  cards={CARDS}
                  rotationInterval={3500}
                  maxVisible={2}
                  stackOffset={16}
                  scaleStep={0.04}
                  cardBackground="#ffffff"
                  cardBorderColor="rgba(0,0,0,0.08)"
                  textColor="#0f172a"
                  mutedColor="rgba(0,0,0,0.45)"
                  highlightBackground="rgba(139,92,246,0.12)"
                  highlightTextColor="#7c3aed"
                  cardWidth="100%"
                  cardHeight="180px"
                  className="w-full"
                />
              </div>
            </div>
          </GridCell>

          {/* EncryptedText — col span 1 */}
          <GridCell className="col-span-1 h-[320px]" label="encrypted-text" accentColor="rgba(16,185,129,0.07)">
            <div className="flex h-full flex-col items-center justify-center gap-6 p-6 pt-8 text-center">
              <EncryptedText
                text="NEXUS UI"
                trigger="viewport"
                loop
                loopDelay={2500}
                speed={60}
                shuffleSpeed={30}
                className="text-3xl font-black tracking-widest text-emerald-400"
              />
              <EncryptedText
                text="Build the future"
                trigger="viewport"
                loop
                loopDelay={3000}
                speed={45}
                revealDelay={400}
                className="text-base font-medium text-white/50"
              />
              <EncryptedText
                text="component by component"
                trigger="viewport"
                loop
                loopDelay={3500}
                speed={40}
                revealDelay={800}
                className="text-sm text-white/30"
              />
            </div>
          </GridCell>

          {/* TypewriterEffect — col span 2 */}
          <GridCell className="col-span-2 h-[320px]" label="typewriter-effect" accentColor="rgba(251,113,133,0.07)">
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 pt-10 text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">What will you build?</p>
              <TypewriterEffect
                text={TYPEWRITER_TEXTS}
                typingSpeed={55}
                deletingSpeed={35}
                pauseDuration={1800}
                loop
                showCursor
                as="h2"
                className="text-3xl font-bold text-white sm:text-4xl"
              />
              <p className="mt-2 max-w-xs text-sm text-white/40 leading-relaxed">
                Nexus UI ships production-ready components so you can focus on what matters.
              </p>
            </div>
          </GridCell>


        </div>
      </div>

      {/* Footer */}
      <div className="pointer-events-none mt-4 flex items-center justify-end gap-2 text-[11px] text-white/25">
        <Code2 className="size-3" />
        Cursor paths are simulated locally
      </div>
    </div>
  );
}

export default RealTimeCursors;
