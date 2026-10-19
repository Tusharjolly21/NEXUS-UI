"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Upload, Video } from "lucide-react";
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

const candidateCards = [
  { name: "Mateo Alvarez", role: "Senior frontend engineer", score: 87, skills: ["React", "Design systems", "A11y"] },
  { name: "Oliver Brandt", role: "Full-stack engineer", score: 81, skills: ["Node", "Postgres", "Next.js"] },
  { name: "Priya Raman", role: "Staff product engineer", score: 94, skills: ["TypeScript", "Mentoring", "Perf"] },
  { name: "Sofia Lindqvist", role: "Frontend engineer", score: 76, skills: ["Vue", "Testing", "CSS"] },
];

const progressSteps = ["Applied", "Screening", "Interview", "Offer", "Hired"];

const interviewPeople = [
  {
    name: "Aiko",
    note: "Frontend interview scheduled for 4:30 PM.",
    src: "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=520&q=80",
  },
  {
    name: "Kenji",
    note: "System design round with hiring manager.",
    src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=520&q=80",
  },
];

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function CandidateTile({
  candidate,
  index,
  active,
}: {
  candidate: (typeof candidateCards)[number];
  index: number;
  active: boolean;
}) {
  const reduce = useReducedMotion() === true;
  const initials = candidate.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border bg-white p-3 transition-colors duration-300",
        active ? "border-zinc-900 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]" : "border-zinc-200/80",
      )}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold",
          active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600",
        )}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-zinc-950">{candidate.name}</p>
        <p className="truncate text-[12px] text-zinc-500">{candidate.role}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {candidate.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10.5px] font-medium text-zinc-600">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-[18px] font-semibold tabular-nums", active ? "text-zinc-950" : "text-zinc-400")}>
          {candidate.score}
        </p>
        <p className="text-[10.5px] text-zinc-400">match</p>
      </div>
    </motion.div>
  );
}

function ScorePicturesCard() {
  const reduce = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = React.useState(2);

  React.useEffect(() => {
    if (reduce) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % candidateCards.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [reduce]);

  return (
    <BentoCard
      className="md:col-span-4"
      title="Match against the role, not the résumé format"
      description="Each applicant is scored on the skills the job asks for, with the evidence one click away."
    >
      <div className="grid gap-2.5">
        {candidateCards.map((candidate, index) => (
          <CandidateTile
            key={candidate.name}
            candidate={candidate}
            index={index}
            active={index === activeIndex}
          />
        ))}
      </div>
    </BentoCard>
  );
}

function ProgressCard() {
  const reduce = useReducedMotion() === true;

  return (
    <BentoCard
      className="md:col-span-4 md:row-span-1"
      title="Track progress"
      description="See where every candidate is, from application to offer, without chasing the team for updates."
    >
      <div className="relative -mx-4 mt-7 min-h-[180px] overflow-hidden px-4">
        <div className="absolute inset-x-0 bottom-0 top-5 bg-[linear-gradient(90deg,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-[size:44px_100%]" />
        <div className="relative flex justify-between">
          {progressSteps.map((step, index) => (
            <motion.div
              key={step}
              className={cn(
                "grid size-4 place-items-center rounded-full border bg-white",
                index <= 2 ? "border-zinc-900" : "border-zinc-200",
              )}
              animate={
                reduce || index !== 2 ? undefined : { scale: [1, 1.28, 1] }
              }
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {index <= 2 ? (
                <span className="size-1.5 rounded-full bg-zinc-900" />
              ) : null}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute left-[19%] top-16 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Application submitted
        </motion.div>
        <motion.div
          className="absolute right-[25%] top-32 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Interview started
        </motion.div>
      </div>
    </BentoCard>
  );
}

function InterviewCard() {
  const reduce = useReducedMotion() === true;

  return (
    <BentoCard
      className="md:col-span-4"
      title="Schedule interviews in one step"
      description="Panels pick from shared availability; candidates get one link and a calendar invite."
    >
      <div className="relative mt-8 grid grid-cols-2 gap-4">
        <div className="absolute -left-8 top-4 h-px w-10 bg-blue-500/40" />
        <div className="absolute -left-12 top-10 h-px w-8 bg-blue-400/35" />
        {interviewPeople.map((person, item) => (
          <motion.div
            key={person.name}
            className="group relative aspect-[1.08] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-sm"
            animate={
              reduce ? undefined : { y: item === 0 ? [0, -3, 0] : [0, 4, 0] }
            }
            transition={{
              duration: item === 0 ? 3.4 : 3.9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src={person.src}
              alt={`${person.name} interview participant`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-[11px] text-white/80">
              <span>{person.name}</span>
              <Video className="size-3" />
            </div>
            <div className="absolute inset-x-2 bottom-2 translate-y-[115%] rounded-xl border border-white/15 bg-black/70 p-3 text-left text-white shadow-2xl backdrop-blur-md transition duration-300 group-hover:translate-y-0">
              <p className="text-xs font-semibold">{person.name}</p>
              <p className="mt-1 text-[11px] leading-4 text-white/72">
                {person.note}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
}

function ResumeUploadCard() {
  const reduce = useReducedMotion() === true;
  const [file, setFile] = React.useState<UploadState | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [magnet, setMagnet] = React.useState({ x: 0, y: 0, active: false });
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = React.useCallback((files: FileList | null) => {
    const next = files?.[0];
    if (!next) return;
    setFile({ name: next.name, size: next.size });
  }, []);

  return (
    <BentoCard
      className="md:col-span-4 md:row-span-2"
      title="Drop in résumés from anywhere"
      description="Drag files in, or forward them by email. Parsing and scoring start straight away."
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onMouseMove={(event) => {
          if (reduce) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          setMagnet({ x: x * 0.08, y: y * 0.08, active: true });
        }}
        onMouseLeave={() => setMagnet({ x: 0, y: 0, active: false })}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "group relative -mx-4 mt-8 flex min-h-[360px] w-[calc(100%+2rem)] flex-col items-center justify-center overflow-hidden rounded-b-2xl border-t border-zinc-100 bg-zinc-50 text-center transition",
          dragging ? "bg-white" : "hover:bg-white",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:64px_64px]"
          animate={reduce ? undefined : { opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10 grid size-36 place-items-center rounded-xl border border-zinc-100 bg-white text-zinc-500 shadow-[0_30px_80px_rgba(15,23,42,0.08)]"
          animate={
            reduce
              ? undefined
              : {
                  x: magnet.x,
                  y: magnet.active ? magnet.y : [0, -8, 0],
                  scale: dragging || magnet.active ? 1.06 : [1, 1.015, 1],
                }
          }
          transition={
            magnet.active
              ? { type: "spring", stiffness: 170, damping: 18, mass: 0.4 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {file ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <Upload className="size-5" />
          )}
        </motion.div>

        <div className="relative z-10 mt-4 max-w-[260px]">
          <p className="text-sm font-semibold text-zinc-900">
            {file ? file.name : dragging ? "Drop resume here" : "Upload resume"}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {file
              ? `${formatSize(file.size)}, ready for scoring`
              : "PDF, DOCX, or TXT files are supported."}
          </p>
        </div>
      </button>
    </BentoCard>
  );
}

function BentoCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion() === true;

  return (
    <motion.article
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4">
        <h3 className="text-base font-medium text-zinc-950">{title}</h3>
        <p className="mt-4 max-w-[330px] text-base leading-6 text-zinc-500">
          {description}
        </p>
      </div>
      {children}
    </motion.article>
  );
}

export function AtsBentoGrid({
  title = "Hire on evidence, not instinct",
  description = "Screen applicants against the skills a role needs, keep every stage moving, and give your panel the same picture of each candidate.",
  className,
}: AtsBentoGridProps) {
  return (
    <section
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-[#f4f4f3] px-5 py-16 text-zinc-950 sm:py-24",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),rgba(244,244,245,0.35)_45%,rgba(250,250,250,0.9)_100%)]" />

      <div className="relative w-full max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-7 text-zinc-600">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <ScorePicturesCard />
          <div className="grid gap-3 md:col-span-4">
            <ProgressCard />
            <InterviewCard />
          </div>
          <ResumeUploadCard />
        </div>

      </div>
    </section>
  );
}
