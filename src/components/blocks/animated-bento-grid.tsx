"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Data ───────────────────────────────────────────────────────────────────────

type ChatMsg = { from: "them" | "me"; text: string };

const ACCOUNTABILITY_MSGS: ChatMsg[] = [
  { from: "them", text: "Did you finish the graphs set?" },
  { from: "me", text: "14 of 15. The last one is a beast." },
  { from: "them", text: "Send me your approach before standup?" },
];

const ENCOURAGEMENT_MSGS: ChatMsg[] = [
  { from: "them", text: "An hour on this DP problem and I'm stuck." },
  { from: "me", text: "What's your recurrence so far?" },
  { from: "them", text: "dp[i] = best ending at i, but it's off by one." },
  { from: "me", text: "Try: best using the first i items." },
];

const MENTORS = [
  { name: "Priya Nair", role: "Staff engineer, payments", slot: "Tue 7:30 pm" },
  { name: "Emily Ross", role: "Engineering manager", slot: "Wed 6:00 pm" },
  { name: "Daniel Kim", role: "Principal engineer", slot: "Thu 8:15 pm" },
  { name: "Sara Moreno", role: "Hiring manager, 120+ loops", slot: "Sat 10:00 am" },
] as const;

const COHORT = ["Alex Chen", "Jordan Lee", "Sam Patel", "Taylor Brooks", "Morgan Diaz", "Riley Park"] as const;

const PARTICIPANTS = ["Alex Chen", "Jordan Lee", "Sam Patel", "Taylor Brooks", "Morgan Diaz"] as const;

const WEEK = [
  { day: "M", value: 4 },
  { day: "T", value: 6 },
  { day: "W", value: 3 },
  { day: "T", value: 7 },
  { day: "F", value: 5 },
  { day: "S", value: 9 },
  { day: "S", value: 4 },
] as const;
const TODAY = 5;
const WEEK_MAX = 9;

// Cohort ring positions, rounded so server and client render identical markup.
const RING_RADIUS = 74;
const RING = COHORT.map((_, i) => {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return { x: Math.round(Math.cos(a) * RING_RADIUS * 100) / 100, y: Math.round(Math.sin(a) * RING_RADIUS * 100) / 100 };
});

// ── Motion ─────────────────────────────────────────────────────────────────────

const SPRING_UI = { type: "spring", stiffness: 420, damping: 34 } as const;
const SPRING_SOFT = { type: "spring", stiffness: 240, damping: 30 } as const;

const RISE: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING_SOFT },
};
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};
const STAGGER = (stagger: number, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

function useRise() {
  return useReducedMotion() ? FADE : RISE;
}

// ── Small parts ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Monogram({ name, size = 36, accent = false, className }: { name: string; size?: number; accent?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 select-none place-items-center rounded-full font-semibold tracking-[-0.01em] text-white",
        accent
          ? "bg-[#0071e3]"
          : "bg-gradient-to-b from-[#a1a1a6] to-[#86868b] dark:from-[#636366] dark:to-[#48484a]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {accent ? "You" : initials(name)}
    </span>
  );
}

function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const value = useMotionValue(0);
  const display = useTransform(value, (v) => Math.round(v).toLocaleString("en-US"));

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { type: "spring", duration: 1.6, bounce: 0, delay: 0.25 });
    return () => controls.stop();
  }, [inView, reduced, to, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span className="sr-only">{to}</span>
      <motion.span aria-hidden="true">{display}</motion.span>
    </span>
  );
}

/** Title, big figure and caption: the Apple feature-tile lockup. */
function TileCopy({
  title,
  figure,
  unit,
  caption,
  inverse = false,
  className,
}: {
  title: string;
  figure: React.ReactNode;
  unit?: string;
  caption: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className={cn("text-[15px] font-semibold tracking-[-0.01em]", inverse ? "text-[#f5f5f7]" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}>
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 flex items-baseline gap-1.5 font-semibold leading-none tracking-[-0.04em]",
          inverse ? "text-[#f5f5f7]" : "text-[#1d1d1f] dark:text-[#f5f5f7]",
        )}
      >
        <span className="text-[56px] sm:text-[64px]">{figure}</span>
        {unit ? <span className="text-[24px] tracking-[-0.025em] sm:text-[28px]">{unit}</span> : null}
      </p>
      <p
        className={cn(
          "mt-3 max-w-[30ch] text-pretty text-[15px] leading-[1.47]",
          inverse ? "text-[#a1a1a6]" : "text-[#6e6e73] dark:text-[#a1a1a6]",
        )}
      >
        {caption}
      </p>
    </div>
  );
}

// ── Tile shell ─────────────────────────────────────────────────────────────────

function Tile({
  className,
  inverse = false,
  children,
}: {
  className?: string;
  inverse?: boolean;
  children: React.ReactNode;
}) {
  const rise = useRise();
  return (
    <motion.article
      variants={rise}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] p-6 transition-shadow duration-500 ease-out sm:p-7",
        inverse
          ? "bg-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-24px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
          : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_24px_48px_-24px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      {children}
    </motion.article>
  );
}

// ── Tile 1: Mentors ────────────────────────────────────────────────────────────

function MentorList() {
  const id = React.useId();
  const rise = useRise();
  const [active, setActive] = React.useState(0);

  return (
    <motion.ul
      variants={STAGGER(0.06, 0.2)}
      onMouseLeave={() => setActive(0)}
      className="w-full rounded-[20px] bg-[#f5f5f7] p-1.5 dark:bg-[#2c2c2e] sm:w-[320px] sm:shrink-0"
    >
      {MENTORS.map((m, i) => (
        <motion.li key={m.name} variants={rise} onMouseEnter={() => setActive(i)} className="relative">
          {active === i ? (
            <motion.span
              layoutId={`${id}-mentor`}
              transition={SPRING_UI}
              className="absolute inset-0 rounded-[14px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.08),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#3a3a3c] dark:shadow-none"
            />
          ) : null}
          <div className="relative flex items-center gap-3 px-3 py-2.5">
            <Monogram name={m.name} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{m.name}</p>
              <p className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.role}</p>
            </div>
            <span className="shrink-0 text-[12px] tabular-nums text-[#86868b] dark:text-[#98989d]">{m.slot}</span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

// ── Tile 2: Cohort ring ────────────────────────────────────────────────────────

function CohortRing() {
  const reduced = useReducedMotion();
  const variants: Variants = reduced
    ? {
        hidden: (i: number) => ({ opacity: 0, x: RING[i].x, y: RING[i].y }),
        visible: (i: number) => ({ opacity: 1, x: RING[i].x, y: RING[i].y, transition: { duration: 0.4 } }),
      }
    : {
        hidden: { opacity: 0, x: 0, y: 0, scale: 0.4 },
        visible: (i: number) => ({
          opacity: 1,
          x: RING[i].x,
          y: RING[i].y,
          scale: 1,
          transition: { type: "spring", stiffness: 220, damping: 20, delay: 0.3 + i * 0.05 },
        }),
      };

  return (
    <div className="relative mx-auto mt-6 grid size-[196px] place-items-center" aria-hidden="true">
      <span className="absolute size-[148px] rounded-full border border-black/[0.08] dark:border-white/[0.1]" />
      {COHORT.map((name, i) => (
        <motion.span key={name} custom={i} variants={variants} className="absolute">
          <Monogram name={name} size={38} className="ring-[3px] ring-white dark:ring-[#1c1c1e]" />
        </motion.span>
      ))}
      <Monogram name="You" size={52} accent className="relative ring-4 ring-white dark:ring-[#1c1c1e]" />
    </div>
  );
}

// ── Tiles 3 and 4: Messages ────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatMsg }) {
  return (
    <div className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
      <span
        className={cn(
          "max-w-[85%] rounded-[18px] px-3.5 py-2 text-[14px] leading-[1.35]",
          msg.from === "me"
            ? "bg-[#0071e3] text-white"
            : "bg-[#e9e9eb] text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]",
        )}
      >
        {msg.text}
      </span>
    </div>
  );
}

function StaticChat({ messages }: { messages: ChatMsg[] }) {
  const reduced = useReducedMotion();
  const pop: Variants = reduced
    ? FADE
    : {
        hidden: { opacity: 0, y: 10, scale: 0.92, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: SPRING_UI },
      };
  return (
    <motion.div variants={STAGGER(0.12, 0.3)} className="mt-auto flex flex-col gap-1.5 pt-6">
      {messages.map((msg, i) => (
        <motion.div key={i} variants={pop} style={{ originX: msg.from === "me" ? 1 : 0 }}>
          <Bubble msg={msg} />
        </motion.div>
      ))}
    </motion.div>
  );
}

type Frame = { count: number; typing: boolean };

function buildTimeline(messages: ChatMsg[]): Frame[] {
  const frames: Frame[] = [{ count: 0, typing: false }];
  messages.forEach((msg, i) => {
    if (msg.from === "them") frames.push({ count: i, typing: true });
    frames.push({ count: i + 1, typing: false });
  });
  // hold the finished thread for a few beats before it starts over
  frames.push({ count: messages.length, typing: false }, { count: messages.length, typing: false });
  return frames;
}

function TypingDots() {
  const reduced = useReducedMotion();
  return (
    <span className="inline-flex items-center gap-1 rounded-[18px] bg-[#e9e9eb] px-3.5 py-3 dark:bg-[#3a3a3c]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-[#86868b] dark:bg-[#98989d]"
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function LiveChat({ messages }: { messages: ChatMsg[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduced = useReducedMotion();
  const timeline = React.useMemo(() => buildTimeline(messages), [messages]);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setStep((s) => s + 1), 1100);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const frame: Frame = reduced ? { count: messages.length, typing: false } : timeline[step % timeline.length];
  const cycle = Math.floor(step / timeline.length);

  return (
    <div ref={ref} className="relative mt-auto flex min-h-[188px] flex-col justify-end gap-1.5 pt-6" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        {messages.slice(0, frame.count).map((msg, i) => (
          <motion.div
            key={`${cycle}-${i}`}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)", transition: { duration: 0.2 } }}
            transition={SPRING_UI}
            style={{ originX: msg.from === "me" ? 1 : 0 }}
          >
            <Bubble msg={msg} />
          </motion.div>
        ))}
        {frame.typing ? (
          <motion.div
            key={`${cycle}-typing-${frame.count}`}
            layout={!reduced}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
            transition={SPRING_UI}
            style={{ originX: 0 }}
          >
            <TypingDots />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ── Tile 5: Live room ──────────────────────────────────────────────────────────

function LiveRoom() {
  const id = React.useId();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduced = useReducedMotion();
  const [speaker, setSpeaker] = React.useState(0);

  React.useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setInterval(() => setSpeaker((s) => (s + 1) % PARTICIPANTS.length), 2600);
    return () => window.clearInterval(t);
  }, [inView, reduced]);

  const name = PARTICIPANTS[speaker];

  return (
    <div ref={ref} className="mt-8 flex flex-1 flex-col gap-2" aria-hidden="true">
      <div className="relative grid min-h-[176px] flex-1 place-items-center overflow-hidden rounded-[20px] bg-[#2c2c2e]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={name}
            className="flex flex-col items-center gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "40%", filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: "-40%", filter: "blur(8px)" }}
            transition={SPRING_SOFT}
          >
            <Monogram name={name} size={72} className="from-[#8e8e93] to-[#636366] dark:from-[#8e8e93] dark:to-[#636366]" />
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-medium text-[#f5f5f7]">{name}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {PARTICIPANTS.map((p, i) => (
          <div key={p} className="relative grid aspect-square place-items-center rounded-[14px] bg-[#2c2c2e]">
            {speaker === i ? (
              <motion.span
                layoutId={`${id}-speaker`}
                transition={SPRING_UI}
                className="absolute inset-0 rounded-[14px] shadow-[inset_0_0_0_2px_#0071e3]"
              />
            ) : null}
            <Monogram name={p} size={26} className="from-[#8e8e93] to-[#636366] dark:from-[#8e8e93] dark:to-[#636366]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tile 6: Weekly progress ────────────────────────────────────────────────────

function WeekBars() {
  const reduced = useReducedMotion();
  const bar: Variants = reduced
    ? FADE
    : {
        hidden: { scaleY: 0, opacity: 0 },
        visible: (i: number) => ({
          scaleY: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 260, damping: 24, delay: 0.3 + i * 0.05 },
        }),
      };
  const rise = useRise();

  return (
    <div className="w-full sm:w-[340px] sm:shrink-0">
      <motion.div
        variants={rise}
        className="mb-4 flex items-center gap-2.5 rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 dark:bg-[#2c2c2e]"
      >
        <span className="size-2 shrink-0 rounded-full bg-[#34c759]" aria-hidden="true" />
        <p className="min-w-0 truncate text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
          Mock interview with Priya <span className="text-[#86868b] dark:text-[#98989d]">at 7:30 pm</span>
        </p>
      </motion.div>
      <div className="flex h-[132px] items-end gap-2" role="img" aria-label="Problems solved per day this week, peaking at 9 on Saturday">
        {WEEK.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            {i === TODAY ? (
              <motion.span variants={rise} className="text-[12px] font-semibold tabular-nums text-[#0071e3] dark:text-[#2997ff]">
                {d.value}
              </motion.span>
            ) : null}
            <motion.span
              custom={i}
              variants={bar}
              className={cn(
                "block w-full origin-bottom rounded-[8px]",
                i === TODAY ? "bg-[#0071e3]" : "bg-[#e8e8ed] dark:bg-[#3a3a3c]",
              )}
              style={{ height: `${Math.round((d.value / WEEK_MAX) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {WEEK.map((d, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 text-center text-[12px]",
              i === TODAY ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#86868b] dark:text-[#98989d]",
            )}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function WhyChooseUsBento() {
  const rise = useRise();

  return (
    <section className="bg-[#f5f5f7] px-4 py-16 dark:bg-black sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        className="mx-auto max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={STAGGER(0.08)}
      >
        <div className="grid gap-4 md:grid-cols-[1.25fr_1fr] md:items-end">
          <motion.h2
            variants={rise}
            className="text-balance text-[34px] font-semibold leading-[1.07] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[48px]"
          >
            Interview prep goes faster with people in your corner.
          </motion.h2>
          <motion.p
            variants={rise}
            className="max-w-md text-pretty text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6] md:justify-self-end md:pb-2"
          >
            Daily practice, a cohort at your level, and engineers who have sat on the other side of the table.
          </motion.p>
        </div>

        <motion.div variants={STAGGER(0.07)} className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Tile className="md:col-span-2 lg:col-span-4">
            <div className="flex h-full flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <TileCopy
                title="Mentors who have hired"
                figure={<CountUp to={140} />}
                caption="Staff engineers and hiring managers who run real interview loops, on call for weekly 1:1s."
              />
              <MentorList />
            </div>
          </Tile>

          <Tile className="lg:col-span-2">
            <TileCopy
              title="A cohort at your level"
              figure="6"
              unit="people"
              caption="Same target roles, same timeline. You meet every morning."
            />
            <CohortRing />
          </Tile>

          <Tile className="lg:col-span-2">
            <TileCopy
              title="Someone checks in"
              figure="Daily"
              caption="Your cohort sees your streak and asks about the set you promised to finish."
            />
            <StaticChat messages={ACCOUNTABILITY_MSGS} />
          </Tile>

          <Tile className="lg:col-span-2">
            <TileCopy
              title="Help before you give up"
              figure="24/7"
              caption="Ask the group when a problem stalls you. Someone has solved it before."
            />
            <LiveChat messages={ENCOURAGEMENT_MSGS} />
          </Tile>

          <Tile inverse className="lg:col-span-2 lg:row-span-2">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#a1a1a6]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#ff3b30] opacity-60 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-[#ff3b30]" />
              </span>
              Open room, graphs and DP
            </div>
            <TileCopy
              inverse
              className="mt-5"
              title="Live doubt-clearing"
              figure="4"
              unit="min"
              caption="Median time to get unstuck. Drop in, share your screen, and talk it through."
            />
            <LiveRoom />
          </Tile>

          <Tile className="md:col-span-2 lg:col-span-4">
            <div className="flex h-full flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <TileCopy
                title="Progress you can see"
                figure={<CountUp to={38} />}
                unit="solved"
                caption="Problems this month, mock interviews booked, and a reminder before every session."
              />
              <WeekBars />
            </div>
          </Tile>
        </motion.div>
      </motion.div>
    </section>
  );
}
