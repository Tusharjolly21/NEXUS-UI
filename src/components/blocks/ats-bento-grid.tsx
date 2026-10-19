"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { CalendarDays, CheckCircle2, FileText, Gauge, Upload, Video, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadState = {
  name: string;
  size: number;
};

export interface AtsBentoGridProps {
  title?: string;
  description?: string;
  className?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const candidateCards = [
  { name: "Mateo Alvarez", role: "Senior frontend engineer", score: 87, skills: ["React", "Design systems", "A11y"] },
  { name: "Oliver Brandt", role: "Full-stack engineer", score: 81, skills: ["Node", "Postgres", "Next.js"] },
  { name: "Priya Raman", role: "Staff product engineer", score: 94, skills: ["TypeScript", "Mentoring", "Perf"] },
  { name: "Sofia Lindqvist", role: "Frontend engineer", score: 76, skills: ["Vue", "Testing", "CSS"] },
];

const progressSteps = ["Applied", "Screening", "Interview", "Offer", "Hired"];
const CURRENT_STEP = 2;

const pipeline = [
  { name: "Priya Raman", stage: "Interview", status: "On track", tone: "green" },
  { name: "Oliver Brandt", stage: "Screening", status: "Waiting on feedback", tone: "orange" },
] as const;

const interviewPeople = [
  {
    name: "Aiko Tanaka",
    note: "Frontend interview",
    time: "4:30 PM",
    status: "Confirmed",
    tone: "green",
    src: "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=160&q=80",
  },
  {
    name: "Kenji Mori",
    note: "System design with hiring manager",
    time: "Tomorrow",
    status: "Awaiting reply",
    tone: "orange",
    src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
  },
] as const;

// ── Motion ─────────────────────────────────────────────────────────────────────

const SPRING_UI = { type: "spring", stiffness: 440, damping: 34 } as const;
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function matchLabel(score: number) {
  if (score >= 90) return { label: "Strong match", tone: "green" as const };
  if (score >= 80) return { label: "Good match", tone: "green" as const };
  return { label: "Partial match", tone: "orange" as const };
}

function StatusDot({ tone }: { tone: "green" | "orange" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", tone === "green" ? "bg-[#34c759]" : "bg-[#ff9500]")}
    />
  );
}

// ── Tile shell ─────────────────────────────────────────────────────────────────

function Tile({
  icon: Icon,
  label,
  headline,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  headline: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion() === true;
  const rise = useRise();
  const ref = React.useRef<HTMLElement>(null);

  // Writes the pointer position straight to CSS variables, so the soft spotlight
  // follows the cursor without re-rendering the tile.
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node || event.pointerType === "touch") return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      ref={ref}
      variants={rise}
      whileHover={reduce ? undefined : { y: -3, transition: SPRING_UI }}
      onPointerMove={handlePointerMove}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-white p-6 transition-shadow duration-500 ease-out sm:p-8",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-24px_rgba(0,0,0,.28)]",
        "dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_24px_48px_-24px_rgba(0,0,0,.8)]",
        "[--spot:rgba(0,0,0,0.035)] [--spot-x:50%] [--spot-y:0px] dark:[--spot:rgba(255,255,255,0.055)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--spot-x) var(--spot-y), var(--spot), transparent 65%)",
        }}
      />
      <div className="relative">
        <p className="flex items-center gap-2 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
          <Icon className="size-4" strokeWidth={1.75} />
          {label}
        </p>
        <h3 className="mt-2 max-w-[22ch] text-balance text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[24px]">
          {headline}
        </h3>
      </div>
      <div className="relative mt-6 flex min-w-0 flex-1 flex-col">{children}</div>
    </motion.article>
  );
}

// ── Tile 1: Match score ────────────────────────────────────────────────────────

function ScorePicturesCard() {
  const reduce = useReducedMotion() === true;
  const id = React.useId();
  const [activeIndex, setActiveIndex] = React.useState(2);
  const [paused, setPaused] = React.useState(false);
  const active = candidateCards[activeIndex];
  const match = matchLabel(active.score);

  React.useEffect(() => {
    if (reduce || paused) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % candidateCards.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [reduce, paused]);

  return (
    <Tile
      icon={Gauge}
      label="Match score"
      headline="Scored on the skills the role asks for."
      className="md:col-span-7"
    >
      <div
        className="grid flex-1 gap-6 sm:grid-cols-[minmax(0,170px)_minmax(0,1fr)] sm:items-end md:grid-cols-1 lg:grid-cols-[minmax(0,170px)_minmax(0,1fr)]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div>
          <p className="flex items-baseline gap-1 font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <span className="relative inline-flex h-[64px] overflow-hidden text-[64px] tabular-nums sm:h-[76px] sm:text-[76px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active.score}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(6px)" }}
                  transition={SPRING_UI}
                >
                  {active.score}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-[26px] tracking-[-0.025em]">%</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <StatusDot tone={match.tone} />
            <span className="truncate">
              {match.label} · {active.name.split(" ")[0]}
            </span>
          </p>
        </div>

        <ul className="rounded-[20px] bg-[#f5f5f7] p-1.5 dark:bg-[#2c2c2e]">
          {candidateCards.map((candidate, index) => {
            const selected = index === activeIndex;
            return (
              <li key={candidate.name} className="relative">
                {selected ? (
                  <motion.span
                    layoutId={`${id}-candidate`}
                    transition={SPRING_UI}
                    className="absolute inset-0 rounded-[14px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.08),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#3a3a3c] dark:shadow-none"
                  />
                ) : null}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
                  className="relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white transition-colors duration-300",
                      selected ? "bg-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]" : "bg-[#a1a1a6] dark:bg-[#636366]",
                    )}
                  >
                    {initials(candidate.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {candidate.name}
                    </span>
                    <span className="block truncate text-[12px] text-[#86868b] dark:text-[#98989d]">
                      {candidate.skills.join(" · ")}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[15px] font-semibold tabular-nums tracking-[-0.01em] transition-colors duration-300",
                      selected ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#86868b] dark:text-[#98989d]",
                    )}
                  >
                    {candidate.score}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Tile>
  );
}

// ── Tile 2: Progress ───────────────────────────────────────────────────────────

function ProgressCard() {
  const reduce = useReducedMotion() === true;
  const fill = (CURRENT_STEP / (progressSteps.length - 1)) * 100;

  return (
    <Tile icon={Workflow} label="Pipeline" headline="Every stage, visible to the whole panel." className="md:col-span-5">
      <p className="flex items-baseline gap-1.5 font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <span className="text-[56px] tabular-nums sm:text-[64px]">11</span>
        <span className="text-[24px] tracking-[-0.025em]">days</span>
      </p>
      <p className="mt-2 text-[15px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">Median time from application to offer.</p>

      <div className="mt-6">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-[#0071e3]"
            initial={{ width: reduce ? `${fill}%` : "0%" }}
            whileInView={{ width: `${fill}%` }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 120, damping: 24, delay: 0.35 }}
          />
        </div>
        <ol className="mt-2.5 flex justify-between gap-1 text-[11px] sm:text-[12px]">
          {progressSteps.map((step, index) => (
            <li
              key={step}
              aria-current={index === CURRENT_STEP ? "step" : undefined}
              className={cn(
                index === CURRENT_STEP
                  ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                  : index < CURRENT_STEP
                    ? "text-[#6e6e73] dark:text-[#a1a1a6]"
                    : "text-[#a1a1a6] dark:text-[#636366]",
              )}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>

      <ul className="mt-6 divide-y divide-black/[0.06] border-t border-black/[0.06] dark:divide-white/[0.08] dark:border-white/[0.08]">
        {pipeline.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-3 py-3 text-[14px]">
            <span className="min-w-0 truncate font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              {row.name}
              <span className="font-normal text-[#86868b] dark:text-[#98989d]"> · {row.stage}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <StatusDot tone={row.tone} />
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

// ── Tile 3: Interviews ─────────────────────────────────────────────────────────

function InterviewCard() {
  const rise = useRise();

  return (
    <Tile icon={CalendarDays} label="Interviews" headline="One link. One invite. No back and forth." className="md:col-span-5">
      <motion.ul variants={STAGGER(0.07, 0.25)} className="space-y-2">
        {interviewPeople.map((person) => (
          <motion.li
            key={person.name}
            variants={rise}
            className="flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3 dark:bg-[#2c2c2e]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the block free of next.config changes */}
            <img
              src={person.src}
              alt=""
              loading="lazy"
              className="size-10 shrink-0 rounded-full object-cover shadow-[0_0_0_.5px_rgba(0,0,0,.08)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{person.name}</p>
              <p className="truncate text-[12px] text-[#86868b] dark:text-[#98989d]">{person.note}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{person.time}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
                <StatusDot tone={person.tone} />
                {person.status}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
      <p className="mt-auto flex items-center gap-2 pt-6 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
        <Video className="size-4 shrink-0" strokeWidth={1.75} />
        Video rooms are created with the invite.
      </p>
    </Tile>
  );
}

// ── Tile 4: Upload ─────────────────────────────────────────────────────────────

function ResumeUploadCard() {
  const reduce = useReducedMotion() === true;
  const [file, setFile] = React.useState<UploadState | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();

  const handleFiles = React.useCallback((files: FileList | null) => {
    const next = files?.[0];
    if (!next) return;
    setFile({ name: next.name, size: next.size });
  }, []);

  const stateKey = file ? "done" : dragging ? "drag" : "idle";

  return (
    <Tile icon={FileText} label="Intake" headline="Drop in résumés from anywhere." className="md:col-span-7">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <motion.button
        type="button"
        whileTap={reduce ? undefined : { scale: 0.985 }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex min-h-[220px] w-full flex-1 flex-col items-center justify-center rounded-[20px] px-6 py-8 text-center outline-offset-2 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[#0071e3]",
          dragging
            ? "bg-[#0071e3]/[0.06] shadow-[inset_0_0_0_1.5px_#0071e3] dark:bg-[#0071e3]/[0.14]"
            : "bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)] hover:bg-[#ededf0] dark:bg-[#2c2c2e] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.04)] dark:hover:bg-[#323234]",
        )}
      >
        <motion.span
          aria-hidden="true"
          animate={reduce ? undefined : { scale: dragging ? 1.08 : 1, y: dragging ? -4 : 0 }}
          transition={SPRING_UI}
          className="grid size-14 place-items-center rounded-full bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_8px_20px_-8px_rgba(0,0,0,.2)] dark:bg-[#3a3a3c] dark:shadow-none"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={file ? "check" : "upload"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(4px)" }}
              transition={SPRING_UI}
            >
              {file ? (
                <CheckCircle2 className="size-6 text-[#34c759]" strokeWidth={1.75} />
              ) : (
                <Upload className={cn("size-5", dragging ? "text-[#0071e3]" : "text-[#1d1d1f] dark:text-[#f5f5f7]")} strokeWidth={1.75} />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.span>

        <span className="relative mt-5 block h-[46px] w-full max-w-[300px] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={stateKey}
              className="block"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={SPRING_UI}
            >
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                {file ? file.name : dragging ? "Drop to upload" : "Upload a résumé"}
              </span>
              <span className="mt-1 block text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                {file ? `${formatSize(file.size)} · ready for scoring` : "PDF, DOCX or TXT, up to 10 MB"}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
      <p className="mt-4 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
        Or forward applications to{" "}
        <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">jobs@yourteam.dev</span>. Parsing starts straight away.
      </p>
    </Tile>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

export function AtsBentoGrid({
  title = "Hire on evidence, not instinct.",
  description = "Screen applicants against the skills a role needs, keep every stage moving, and give your panel the same picture of each candidate.",
  className,
}: AtsBentoGridProps) {
  const rise = useRise();

  return (
    <section
      className={cn(
        "relative w-full bg-[#f5f5f7] px-4 py-16 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-6 sm:py-24 lg:px-8",
        className,
      )}
    >
      <motion.div
        className="mx-auto w-full max-w-6xl"
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
            {title}
          </motion.h2>
          <motion.p
            variants={rise}
            className="max-w-md text-pretty text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6] md:justify-self-end md:pb-2"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          variants={STAGGER(0.07)}
          className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-12"
        >
          <ScorePicturesCard />
          <ProgressCard />
          <InterviewCard />
          <ResumeUploadCard />
        </motion.div>
      </motion.div>
    </section>
  );
}
