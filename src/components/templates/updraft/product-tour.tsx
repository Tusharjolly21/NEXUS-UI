"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { COLORS, FONT_MONO, SPECTRUM } from "./theme";
import { Caret, Icon, LogoMark, useIsMobile } from "./ui";

const TASKS = [
  {
    t: "Migrate sign-in to passkeys",
    repo: "web-app",
    files: 14,
    tests: 212,
    add: 418,
    del: 96,
  },
  {
    t: "Fix the flaky checkout test",
    repo: "web-app",
    files: 2,
    tests: 48,
    add: 12,
    del: 31,
  },
  {
    t: "Add rate limits to /export",
    repo: "billing-service",
    files: 5,
    tests: 37,
    add: 164,
    del: 8,
  },
  {
    t: "Write docs for webhooks v2",
    repo: "docs",
    files: 9,
    tests: 0,
    add: 590,
    del: 0,
  },
  {
    t: "Upgrade React Native to 0.79",
    repo: "mobile",
    files: 23,
    tests: 96,
    add: 233,
    del: 187,
  },
  {
    t: "Remove dead feature flags",
    repo: "web-app",
    files: 31,
    tests: 212,
    add: 0,
    del: 742,
  },
  {
    t: "Cache invoice PDFs at the edge",
    repo: "billing-service",
    files: 4,
    tests: 22,
    add: 96,
    del: 14,
  },
];

const taskStatus = (task: (typeof TASKS)[number], stage: number) =>
  stage === 0
    ? "Planning · 3 steps"
    : stage === 1
      ? `Editing ${task.files} files`
      : stage === 2
        ? task.tests
          ? `Running ${task.tests} tests`
          : "Checking links"
        : `+${task.add} −${task.del}`;

type TaskRowState = { id: number; k: number; stage: number };

function TaskRow({ row }: { row: TaskRowState }) {
  const task = TASKS[row.k];
  const running = row.stage < 3;
  return (
    <motion.li
      layout={true}
      initial={{
        opacity: 0,
        y: -14,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
        transition: {
          duration: 0.25,
        },
      }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 34,
      }}
      className="relative rounded-[14px] p-px"
    >
      <span
        aria-hidden={true}
        className={`absolute inset-0 rounded-[14px] transition-opacity duration-500 ${running ? "ud-flow opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `linear-gradient(90deg, ${SPECTRUM[0]}, ${SPECTRUM[1]}, ${SPECTRUM[2]}, ${SPECTRUM[3]}, ${SPECTRUM[0]})`,
        }}
      />
      <span
        aria-hidden={true}
        className={`absolute inset-0 rounded-[14px] ring-1 ring-inset ring-[#E7E8EC] transition-opacity duration-500 ${running ? "opacity-0" : "opacity-100"}`}
      />
      <div className="relative flex items-center gap-3 rounded-[13px] bg-white px-3.5 py-3">
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full"
          style={{
            background: running ? "#F3F0FF" : "#ECFAF1",
            color: running ? SPECTRUM[1] : "#1E9E57",
          }}
        >
          {running ? (
            <Icon name="ph:circle-notch" size={15} className="ud-spin-fast" />
          ) : (
            <Icon name="ph:check" size={14} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-[540] tracking-[-0.01em] text-[#121317]">{task.t}</span>
          <span
            className="block text-[11.5px]"
            style={{
              color: COLORS.soft,
            }}
          >
            {task.repo}
            {" · "}
            {row.stage === 3 ? "ready" : "now"}
          </span>
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={row.stage}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.25,
            }}
            className="hidden text-[11.5px] tabular-nums sm:block"
            style={{
              fontFamily: FONT_MONO,
              color: running ? COLORS.soft : COLORS.ink,
            }}
          >
            {taskStatus(task, row.stage)}
          </motion.span>
        </AnimatePresence>
        {row.stage === 3 && (
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-full bg-[#121317] px-2.5 py-1 text-[11px] font-[540] text-white"
          >
            Review
          </motion.span>
        )}
      </div>
    </motion.li>
  );
}

function DeskMock({ play }: { play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin: "-10% 0px",
  });
  const [rows, setRows] = useState([
    {
      id: 3,
      k: 2,
      stage: 1,
    },
    {
      id: 2,
      k: 1,
      stage: 2,
    },
    {
      id: 1,
      k: 0,
      stage: 3,
    },
  ]);
  const [draft, setDraft] = useState("");
  const nextTask = useRef(3);
  const nextKey = useRef(4);
  useEffect(() => {
    if (!play || !inView) {
      return;
    }
    let alive = true;
    let step = 0;
    const wait = (ms: number) =>
      new Promise((resolve) => {
        step = window.setTimeout(resolve, ms);
      });
    (async () => {
      for (; alive; ) {
        for (let round = 0; round < 2 && alive && (await wait(1500), !!alive); round++) {
          setRows((prev) => {
            const lastRunning = prev.map((g) => g.stage < 3).lastIndexOf(true);
            if (lastRunning < 0) {
              return prev;
            }
            const next = prev.slice();
            next[lastRunning] = {
              ...next[lastRunning],
              stage: next[lastRunning].stage + 1,
            };
            return next;
          });
        }
        if (!alive) {
          break;
        }
        const taskIndex = nextTask.current % TASKS.length;
        const title = TASKS[taskIndex].t;
        for (let chars = 1; chars <= title.length && alive; chars++) {
          setDraft(title.slice(0, chars));
          await wait(28 + Math.random() * 46);
        }
        await wait(420);
        if (!alive) {
          break;
        }
        setDraft("");
        setRows((prev) =>
          [
            {
              id: nextKey.current++,
              k: taskIndex,
              stage: 0,
            },
            ...prev,
          ].slice(0, 4),
        );
        nextTask.current++;
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(step);
    };
  }, [play, inView]);
  const running = rows.filter((row) => row.stage < 3).length;
  return (
    <div
      ref={ref}
      className="w-[min(940px,100%)] overflow-hidden rounded-[20px] bg-[#FBFBFC] text-left shadow-[0_50px_120px_-40px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.08)]"
    >
      <div
        className="flex h-11 items-center gap-2 border-b px-4"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <span className="flex gap-1.5">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-[11px] rounded-full bg-[#DEDFE3]" />
          ))}
        </span>
        <span className="ml-3 flex items-center gap-1.5 text-[12.5px] font-[520]">
          <LogoMark size={14} />
          Updraft Desk
        </span>
        <span
          className="ml-auto flex items-center gap-1 rounded-md bg-[#F2F3F5] px-2 py-1 text-[11.5px]"
          style={{
            color: COLORS.text,
          }}
        >
          <Icon name="ph:folder-simple" size={12} />
          acme/web-app
          <Icon name="ph:caret-down" size={10} />
        </span>
      </div>
      <div className="grid md:grid-cols-[200px_minmax(0,1fr)]">
        <aside
          className="hidden border-r p-3 md:block"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <p
            className="px-2 pb-1.5 pt-1 text-[11px] font-[540]"
            style={{
              color: COLORS.faint,
            }}
          >
            Projects
          </p>
          {["web-app", "billing-service", "mobile", "docs"].map((d, i) => (
            <div
              key={d}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] ${i === 0 ? "bg-[#EEEFF2] font-[540]" : ""}`}
              style={{
                color: i === 0 ? COLORS.ink : COLORS.text,
              }}
            >
              <Icon name="ph:hash" size={12} className="opacity-50" />
              {d}
            </div>
          ))}
          <p
            className="px-2 pb-1.5 pt-5 text-[11px] font-[540]"
            style={{
              color: COLORS.faint,
            }}
          >
            Scheduled
          </p>
          {[
            ["Dependency sweep", "3:00"],
            ["Flaky test hunt", "Mon"],
          ].map(([d, f]) => (
            <div
              key={d}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              <Icon name="ph:clock-countdown" size={12} className="opacity-50" />
              <span className="flex-1 truncate">{d}</span>
              <span
                className="text-[11px] tabular-nums"
                style={{
                  color: COLORS.faint,
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </aside>
        <div className="flex min-h-[380px] flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[14px] font-[560] tracking-[-0.01em]">Today</span>
            <span
              className="flex items-center gap-1.5 text-[12px] tabular-nums"
              style={{
                color: COLORS.soft,
              }}
            >
              <span className="relative flex size-1.5">
                <span
                  className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                  style={{
                    background: SPECTRUM[1],
                  }}
                />
                <span
                  className="relative inline-flex size-1.5 rounded-full"
                  style={{
                    background: SPECTRUM[1],
                  }}
                />
              </span>
              {running}
              {" agents working"}
            </span>
          </div>
          <ul className="flex-1 space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((row) => (
                <TaskRow key={row.id} row={row} />
              ))}
            </AnimatePresence>
          </ul>
          <div
            className="mt-4 rounded-[14px] border bg-white p-3 shadow-[0_6px_20px_-12px_rgba(18,19,23,.2)]"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <div
              className="min-h-[22px] text-[13.5px]"
              style={{
                color: draft ? COLORS.ink : COLORS.faint,
              }}
            >
              {draft || "Describe a task, @ to mention a file, / for commands"}
              {draft && <Caret />}
            </div>
            <div
              className="mt-2.5 flex items-center gap-2 text-[11.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              <span className="grid size-6 place-items-center rounded-md bg-[#F2F3F5]">
                <Icon name="ph:plus" size={12} />
              </span>
              <span className="flex items-center gap-1 rounded-md bg-[#F2F3F5] px-2 py-1">
                Draft 2 · Fast
                <Icon name="ph:caret-down" size={10} />
              </span>
              <span className="hidden items-center gap-1 rounded-md bg-[#F2F3F5] px-2 py-1 sm:flex">
                <Icon name="ph:git-branch" size={11} />
                new worktree
              </span>
              <span
                className={`ml-auto grid size-7 place-items-center rounded-full transition-colors duration-300 ${draft ? "bg-[#121317] text-white" : "bg-[#F2F3F5]"}`}
              >
                <Icon name={draft ? "ph:arrow-up" : "ph:microphone"} size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductTour() {
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const reduce = useReducedMotion();
  // the demo plays unless the visitor prefers reduced motion, until they press play or pause themselves
  const [userPlay, setUserPlay] = useState<boolean | null>(null);
  const interactive = userPlay ?? !reduce;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.12"],
  });
  const width = useTransform(scrollYProgress, [0, 1], [mobile ? 92 : 62, 100]);
  const widthPercent = useMotionTemplate`${width}%`;
  const radius = useTransform(scrollYProgress, [0, 1], [mobile ? 24 : 36, mobile ? 24 : 44]);
  const shade = useTransform(scrollYProgress, [0.2, 1], [0.25, 1]);
  return (
    <section aria-label="Product tour" className="px-3 sm:px-5">
      <div ref={ref} className="mx-auto max-w-[1520px]">
        <motion.div
          style={{
            width: widthPercent,
            borderRadius: radius,
          }}
          className="relative mx-auto flex h-[min(88vh,860px)] min-h-[600px] items-center justify-center overflow-hidden bg-[#08090D] px-3 sm:px-8"
        >
          <motion.div
            aria-hidden={true}
            style={{
              opacity: shade,
            }}
            className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[80%]"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(50% 55% at 50% 100%, ${SPECTRUM[1]}66, transparent 70%), radial-gradient(30% 40% at 30% 100%, ${SPECTRUM[0]}88, transparent 70%), radial-gradient(30% 40% at 72% 100%, ${SPECTRUM[3]}55, transparent 70%)`,
              }}
            />
          </motion.div>
          <div
            aria-hidden={true}
            className="pointer-events-none absolute inset-0 opacity-[.5]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, #000, transparent 75%)",
              maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, #000, transparent 75%)",
            }}
          />
          <div className="relative z-10 flex w-full justify-center">
            <DeskMock play={interactive} />
          </div>
          <button
            onClick={() => setUserPlay(!interactive)}
            className="ud-ring-w absolute right-4 top-4 z-20 flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[12.5px] font-[500] text-white ring-1 ring-inset ring-white/15 backdrop-blur transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <Icon name={interactive ? "ph:pause" : "ph:play"} size={13} />
            {interactive ? "Pause demo" : "Play demo"}
          </button>
          <p className="absolute bottom-5 left-0 right-0 z-20 text-center text-[12.5px] text-white/50 sm:bottom-7">
            A live mock of Updraft Desk. Nothing here is a video.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
