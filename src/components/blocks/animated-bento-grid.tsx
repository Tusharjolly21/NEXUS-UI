"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

type ChatMsg = { from: "them" | "me"; text: string };

// ── Data ───────────────────────────────────────────────────────────────────────

const ACCOUNTABILITY_MSGS: ChatMsg[] = [
  { from: "them", text: "did you finish the graphs set?" },
  { from: "me",   text: "14 of 15. the last one is a beast" },
  { from: "them", text: "send me your approach before standup?" },
  { from: "me",   text: "sharing it now" },
];

const ENCOURAGEMENT_MSGS: ChatMsg[] = [
  { from: "them", text: "an hour on this DP problem and I'm stuck" },
  { from: "me",   text: "what's your recurrence so far?" },
  { from: "them", text: "dp[i] = best ending at i, but it's off by one" },
  { from: "me",   text: "try: best using the first i items" },
];

const MENTORS = [
  { name: "Priya N.",  role: "Staff Engineer, payments",   img: 1  },
  { name: "Emily R.",  role: "Engineering Manager",        img: 5  },
  { name: "Daniel K.", role: "Principal Engineer",         img: 8  },
  { name: "Tomás L.",  role: "Senior SWE, infra",          img: 12 },
  { name: "Sara M.",   role: "Hiring manager, 120+ loops", img: 16 },
  { name: "Kenji O.",  role: "Tech Lead, mobile",          img: 20 },
] as const;

const ORBIT_CFG = [
  { img: 4,  rx: 80, ry: 56, startDeg: 0,   dur: 7.2, delay: 0    },
  { img: 6,  rx: 76, ry: 62, startDeg: 60,  dur: 6.8, delay: -1.1 },
  { img: 9,  rx: 82, ry: 58, startDeg: 120, dur: 7.5, delay: -2.3 },
  { img: 13, rx: 74, ry: 64, startDeg: 180, dur: 6.5, delay: -3.4 },
  { img: 17, rx: 84, ry: 60, startDeg: 240, dur: 7.0, delay: -4.5 },
  { img: 19, rx: 78, ry: 62, startDeg: 300, dur: 6.9, delay: -5.2 },
] as const;

const PARTICIPANTS = [
  { name: "Alex",   img: 3  },
  { name: "Jordan", img: 7  },
  { name: "Sam",    img: 11 },
  { name: "Taylor", img: 15 },
  { name: "Morgan", img: 18 },
] as const;

const TASKS = [
  "Two-pointer set · 6 problems",
  "Mock interview with Priya, 7:30 pm",
  "Re-read system design notes",
] as const;

const CALENDAR = [28, 29, 30, 31, 1, 2] as const;
const HIGHLIGHTED_DATE = 1;

// ── Orbit keyframes (computed once at module load) ─────────────────────────────

function buildOrbitKeyframes(rx: number, ry: number, startDeg: number, steps = 24) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps + (startDeg * Math.PI) / 180;
    xs.push(Math.cos(a) * rx);
    ys.push(Math.sin(a) * ry);
  }
  return { xs, ys };
}

const ORBIT_KF = ORBIT_CFG.map((c) => buildOrbitKeyframes(c.rx, c.ry, c.startDeg));

// ── Hook: infinite stepped loop ────────────────────────────────────────────────

function useChatLoop(count: number, staggerMs: number, reduced: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStep((s) => s + 1), staggerMs);
    return () => clearInterval(id);
  }, [count, staggerMs, reduced]);

  const TOTAL = count + 2; // extra beats for a natural pause before loop
  return {
    visibleCount: reduced ? count : Math.min(step % TOTAL, count),
    cycleKey: Math.floor(step / TOTAL),
  };
}

// ── Shared bubble renderer ─────────────────────────────────────────────────────

function ChatBubble({
  msg,
  avatarImg,
}: {
  msg: ChatMsg;
  avatarImg: number;
}) {
  return (
    <div className={`flex items-end gap-1.5 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
      {msg.from === "them" && (
        <img
          src={`https://i.pravatar.cc/80?img=${avatarImg}`}
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 rounded-full"
        />
      )}
      <span
        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-snug ${
          msg.from === "me"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-100"
        }`}
      >
        {msg.text}
      </span>
    </div>
  );
}

// ── Card 1: Steady — full conversation visible at once ────────────────────────

function StaticChatVisual({
  messages,
  avatarImg,
}: {
  messages: ChatMsg[];
  avatarImg: number;
}) {
  return (
    <div className="flex h-full flex-col justify-end gap-3 pb-1">
      {messages.map((msg, i) => (
        <ChatBubble key={i} msg={msg} avatarImg={avatarImg} />
      ))}
    </div>
  );
}

// ── Card 2: Live — messages appear one by one and loop ────────────────────────

function LiveChatVisual({
  messages,
  avatarImg,
}: {
  messages: ChatMsg[];
  avatarImg: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const { visibleCount, cycleKey } = useChatLoop(messages.length, 1400, reduced);

  return (
    <div className="flex h-full flex-col justify-end gap-3 pb-1">
      <AnimatePresence mode="popLayout">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={`${cycleKey}-${i}`}
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <ChatBubble msg={msg} avatarImg={avatarImg} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Card 3: Orbiting avatars ───────────────────────────────────────────────────

function OrbitVisual() {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="relative flex h-full items-center justify-center">
      {/* Pulsing ring around center avatar */}
      <motion.div
        className="absolute rounded-full border-2 border-zinc-900/20 dark:border-white/25"
        style={{ width: 68, height: 68 }}
        animate={reduced ? {} : { scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center avatar */}
      <img
        src="https://i.pravatar.cc/80?img=2"
        alt=""
        width={56}
        height={56}
        className="relative z-10 size-14 rounded-full border-2 border-white shadow-md dark:border-zinc-900"
      />

      {/* Peripheral avatars with organic elliptical float */}
      <div className="absolute inset-0 flex items-center justify-center">
        {ORBIT_CFG.map((cfg, i) => (
          <motion.img
            key={i}
            src={`https://i.pravatar.cc/80?img=${cfg.img}`}
            alt=""
            width={36}
            height={36}
            className="absolute size-9 rounded-full border-2 border-white shadow-sm dark:border-zinc-900"
            initial={{ x: ORBIT_KF[i].xs[0], y: ORBIT_KF[i].ys[0] }}
            animate={
              reduced
                ? { x: ORBIT_KF[i].xs[0], y: ORBIT_KF[i].ys[0] }
                : { x: ORBIT_KF[i].xs, y: ORBIT_KF[i].ys }
            }
            transition={
              reduced
                ? {}
                : {
                    duration: cfg.dur,
                    delay: cfg.delay,
                    repeat: Infinity,
                    ease: "linear",
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Card 4: Mentor marquee ─────────────────────────────────────────────────────

function MentorPill({ m }: { m: (typeof MENTORS)[number] }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 py-2 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <img
        src={`https://i.pravatar.cc/80?img=${m.img}`}
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-full"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight text-zinc-800 dark:text-zinc-100">{m.name}</p>
        <p className="truncate text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{m.role}</p>
      </div>
    </div>
  );
}

function MentorMarquee() {
  const reduced = useReducedMotion() ?? false;
  const dup = [...MENTORS, ...MENTORS];

  return (
    <div
      className="flex h-full flex-col justify-center gap-2.5 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      {/* Row 1 — left to right */}
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max gap-2.5"
          animate={reduced ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {dup.map((m, i) => (
            <MentorPill key={i} m={m} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — right to left */}
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max gap-2.5"
          animate={reduced ? {} : { x: ["-50%", "0%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {dup.map((m, i) => (
            <MentorPill key={i} m={m} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Card 5: Video call window ──────────────────────────────────────────────────

function VideoCallVisual() {
  const reduced = useReducedMotion() ?? false;
  const [featured, setFeatured] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(
      () => setFeatured((f) => (f + 1) % PARTICIPANTS.length),
      2500,
    );
    return () => clearInterval(id);
  }, [reduced]);

  const tiles = PARTICIPANTS.filter((_, i) => i !== featured).slice(0, 4);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {/* Call header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-700/60 px-3 py-2">
        <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
        <span className="text-[11px] font-medium text-zinc-300">Open room · Graphs & DP</span>
        <span className="ml-auto text-[11px] tabular-nums text-zinc-500">6 here</span>
      </div>

      {/* Featured speaker */}
      <div className="relative flex-1 overflow-hidden bg-zinc-800">
        <AnimatePresence>
          <motion.div
            key={featured}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img
              src={`https://i.pravatar.cc/80?img=${PARTICIPANTS[featured].img}`}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-full border-2 border-white/20"
            />
            <div className="mt-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/80">
              {PARTICIPANTS[featured].name}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tile row */}
      <div className="flex shrink-0 gap-1 border-t border-zinc-700/60 p-1.5">
        {tiles.map((p) => (
          <div
            key={p.img}
            className="relative flex-1 overflow-hidden rounded-lg bg-zinc-800"
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={`https://i.pravatar.cc/80?img=${p.img}`}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Mute icon */}
            <div className="absolute bottom-0.5 left-1" aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="3" y="1" width="3" height="4" rx="1.5" fill="rgba(255,255,255,0.5)" />
                <path
                  d="M1.5 5.5c0 1.65 1.34 3 3 3s3-1.35 3-3"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="0.8"
                  fill="none"
                />
                <line x1="4.5" y1="8.5" x2="4.5" y2="9" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card 6: Calendar strip + animated task pills ───────────────────────────────

function AnimatedCheckmark({ visible }: { visible: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5" />
      <motion.path
        d="M5 8.5L7 10.5L11 6"
        stroke="#22c55e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: visible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </svg>
  );
}

function CalendarTasksVisual() {
  const reduced = useReducedMotion() ?? false;
  const { visibleCount, cycleKey } = useChatLoop(TASKS.length, 1200, reduced);

  return (
    <div className="flex h-full flex-col">
      {/* Date strip */}
      <div className="flex gap-1">
        {CALENDAR.map((d) => (
          <div
            key={d}
            className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
              d === HIGHLIGHTED_DATE
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400"
            }`}
          >
            <span className="text-[9px] leading-none opacity-60">
              {d > 20 ? "Dec" : "Jan"}
            </span>
            <span className="mt-0.5 text-sm font-bold leading-none">{d}</span>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="my-3 border-t border-zinc-100 dark:border-white/10" />

      {/* Animated task pills — slide up, no horizontal drift */}
      <div className="flex flex-col gap-2 overflow-hidden">
        <AnimatePresence>
          {TASKS.slice(0, visibleCount).map((task, i) => (
            <motion.div
              key={`${cycleKey}-${i}`}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <AnimatedCheckmark visible />
              <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">{task}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

interface BentoCardProps {
  title: string;
  description: string;
  index: number;
  className?: string;
  children: React.ReactNode;
}

function BentoCard({ title, description, index, className, children }: BentoCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.06,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex flex-col rounded-[26px] border border-zinc-200/80 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/[0.03] ${className ?? ""}`}
    >
      <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[20px] border border-zinc-200/70 bg-white p-4 dark:border-white/[0.06] dark:bg-zinc-950">
        {children}
      </div>
      <div className="px-3 pb-3 pt-4">
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-1 max-w-md text-pretty text-[14px] leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </motion.article>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function WhyChooseUsBento() {
  return (
    <section className="bg-white px-4 py-16 dark:bg-zinc-950 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className="text-balance text-[32px] font-semibold leading-[1.06] tracking-[-0.035em] text-zinc-950 dark:text-white sm:text-[44px]">
            Interview prep goes faster with people in your corner
          </h2>
          <p className="max-w-md text-pretty text-[16px] leading-7 text-zinc-500 dark:text-zinc-400 md:justify-self-end md:pb-1.5">
            Daily practice, a cohort at your level, and engineers who have sat on the other side of the table.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 sm:mt-12">
          <BentoCard
            title="Mentors who have hired"
            description="Weekly 1:1s with staff engineers and managers who run real interview loops."
            index={0}
            className="md:col-span-2"
          >
            <MentorMarquee />
          </BentoCard>

          <BentoCard
            title="A cohort at your level"
            description="Six people, same target roles, same timeline. You meet every morning."
            index={1}
          >
            <OrbitVisual />
          </BentoCard>

          <BentoCard
            title="Live doubt-clearing"
            description="Drop into an open room, share your screen, and get unstuck in minutes instead of days."
            index={2}
            className="lg:row-span-2"
          >
            <VideoCallVisual />
          </BentoCard>

          <BentoCard
            title="Someone checks in"
            description="Your cohort sees your streak and asks about the set you promised to finish."
            index={3}
          >
            <StaticChatVisual messages={ACCOUNTABILITY_MSGS} avatarImg={10} />
          </BentoCard>

          <BentoCard
            title="Help before you give up"
            description="Ask the group when a problem stalls you. Someone has solved it before."
            index={4}
          >
            <LiveChatVisual messages={ENCOURAGEMENT_MSGS} avatarImg={14} />
          </BentoCard>

          <BentoCard
            title="Progress you can see"
            description="Problems solved, mock interviews booked, and a reminder before every session."
            index={5}
            className="md:col-span-2"
          >
            <CalendarTasksVisual />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
