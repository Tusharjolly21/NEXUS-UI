Add the "Orbital Loader" component from Nexus UI to my project.

A loader with a comet that laps the ring, speeding up and easing off each lap, its tail stretching with the speed and shrinking as it slows. Give it progress and the arc fills behind the comet; at 100% the ring pops, turns green and draws a tick. Also includes Step Loader: For long jobs: the current step sits centred, finished ones roll up with a tick, a ring shows progress, Cancel is always there, and it ends on the result.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { OrbitalLoader } from "@/components/orbital-loader/orbital-loader";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/orbital-loader/orbital-loader.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type OrbitalLoaderProps = {
  /** Diameter in px. */
  size?: number;
  /** 0–1 for a ring that fills to progress; leave out for an endless orbit. At 1 it turns into a tick. */
  progress?: number;
  /** Status lines cycled under the loader. One line stays fixed; [] hides them. */
  messages?: string[];
  /** Line shown once progress reaches 1. */
  doneMessage?: string;
  /** Accent colour of the arc and comet. Defaults to system blue. */
  color?: string;
  /** Called once when progress reaches 1. */
  onComplete?: () => void;
  /** Runs a pretend upload from 0 to 100%, ticks, and starts again, until someone clicks the loader. */
  autoplay?: boolean;
  className?: string;
};

const MESSAGES = ["Warming up the build", "Fetching your components", "Compiling styles", "Almost there"];
const VB = 120;
const C = VB / 2;
const R = 50;
const TAIL = 9;
/** Pretend-upload steps for autoplay: [progress, ms to hold]. */
const DEMO: [number, number][] = [
  [0.08, 500],
  [0.27, 700],
  [0.34, 400],
  [0.62, 800],
  [0.71, 400],
  [0.93, 700],
  [1, 2200],
];

const r3 = (n: number) => Math.round(n * 1000) / 1000;

function TailDot({ head, stretch, k, done }: { head: MotionValue<number>; stretch: MotionValue<number>; k: number; done: MotionValue<number> }) {
  // Each tail dot trails the head by a share of the stretch, so faster means longer.
  const at = useTransform(() => head.get() - (k / TAIL) * stretch.get());
  const cx = useTransform(at, (a) => r3(C + Math.cos(a) * R));
  const cy = useTransform(at, (a) => r3(C + Math.sin(a) * R));
  const opacity = useTransform(done, (d) => (1 - d) * (1 - k / (TAIL + 1)) * 0.9);
  return <motion.circle cx={cx} cy={cy} r={r3(4.2 * (1 - k / (TAIL + 2)))} style={{ opacity }} />;
}

/**
 * A loader with a comet. The comet laps the ring, speeding up and easing off
 * each lap, and its tail stretches with the speed and shrinks as it slows.
 * Give it `progress` and the arc fills behind the comet; at 100% the ring
 * pops, turns green and draws a tick.
 */
export function OrbitalLoader({
  size = 112,
  progress,
  messages = MESSAGES,
  doneMessage = "Done",
  color,
  onComplete,
  autoplay = false,
  className = "",
}: OrbitalLoaderProps) {
  const reduce = useReducedMotion() === true;
  const [demo, setDemo] = useState<number | undefined>(autoplay ? 0 : undefined);
  const [demoOn, setDemoOn] = useState(autoplay);
  const value = demoOn ? demo : progress;
  const determinate = typeof value === "number";
  const target = determinate ? Math.max(0, Math.min(1, value)) : 0;
  const isDone = determinate && target >= 1;

  const fill = useSpring(target, { stiffness: 70, damping: 16 });
  const lap = useMotionValue(-Math.PI / 2);
  const head = useMotionValue(-Math.PI / 2);
  const stretch = useSpring(0.5, { stiffness: 180, damping: 22 });
  const done = useSpring(isDone ? 1 : 0, { stiffness: 260, damping: 18 });
  const pop = useMotionValue(1);
  const [line, setLine] = useState(0);
  const [pct, setPct] = useState(Math.round(target * 100));
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useMotionValueEvent(fill, "change", (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100)));

  useEffect(() => {
    fill.set(target);
  }, [fill, target]);

  const wasDone = useRef(isDone);
  useEffect(() => {
    done.set(isDone ? 1 : 0);
    if (isDone && !wasDone.current) {
      if (!reduce) animate(pop, [1.12, 1], { type: "spring", stiffness: 420, damping: 12 });
      completeRef.current?.();
    }
    wasDone.current = isDone;
  }, [isDone, done, pop, reduce]);

  // The comet: an uneven lap when indeterminate, riding the arc's end when determinate.
  const det = useRef(determinate);
  useEffect(() => {
    det.current = determinate;
  }, [determinate]);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let t = 0;
    let prev = head.get();
    const T = 1.7;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!reduce) t += dt;
      const free = -Math.PI / 2 + 2 * Math.PI * (t / T) + 0.75 * Math.sin((2 * Math.PI * t) / T);
      lap.set(free);
      const h = det.current ? -Math.PI / 2 + fill.get() * 2 * Math.PI : free;
      const v = dt ? Math.abs(h - prev) / dt : 0;
      prev = h;
      head.set(h);
      stretch.set(Math.max(0.12, Math.min(1.6, v * 0.16)));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [head, lap, fill, stretch, reduce]);

  // Autoplay: a pretend upload that loops until someone clicks.
  useEffect(() => {
    if (!demoOn) return;
    let k = 0;
    let to = 0;
    const next = () => {
      const [p, hold] = DEMO[k % DEMO.length];
      setDemo(p);
      k++;
      to = window.setTimeout(() => {
        if (k % DEMO.length === 0) {
          setDemo(undefined);
          to = window.setTimeout(() => {
            setDemo(0);
            to = window.setTimeout(next, 600);
          }, 1800);
          return;
        }
        next();
      }, hold);
    };
    to = window.setTimeout(next, 900);
    return () => window.clearTimeout(to);
  }, [demoOn]);

  useEffect(() => {
    if (messages.length < 2 || isDone) return;
    const t = window.setInterval(() => setLine((n) => (n + 1) % messages.length), 1900);
    return () => window.clearInterval(t);
  }, [messages.length, isDone]);

  const arc = useTransform(fill, (v) => Math.max(0.001, Math.min(1, v)));
  const headX = useTransform(head, (a) => r3(C + Math.cos(a) * R));
  const headY = useTransform(head, (a) => r3(C + Math.sin(a) * R));
  const cometFade = useTransform(done, (d) => 1 - d);
  const tickLen = useTransform(done, [0.35, 1], [0, 1]);
  // A zero-length path with round caps still paints a dot, so hide the tick until it starts drawing.
  const tickShow = useTransform(done, (d) => (d > 0.36 ? 1 : 0));
  const ringRot = useTransform(lap, (a) => (a * 180) / Math.PI);
  const pctFade = useTransform(done, (d) => 1 - d);

  const accentCls = color ? "" : "stroke-[#0071e3] fill-[#0071e3] dark:stroke-[#0a84ff] dark:fill-[#0a84ff]";
  const accentStyle = color ? { stroke: color, fill: color } : undefined;
  const shown = isDone ? doneMessage : messages[line % Math.max(1, messages.length)];

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? Math.round(target * 100) : undefined}
      aria-valuetext={isDone ? doneMessage : determinate ? `${Math.round(target * 100)}%` : shown}
      className={`flex flex-col items-center gap-4 ${className}`}
      onPointerDown={() => {
        if (demoOn) setDemoOn(false);
      }}
    >
      <motion.div className="relative" style={{ width: size, height: size, scale: pop }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <motion.g style={{ rotate: ringRot, originX: "50%", originY: "50%" }} className="fill-none stroke-[#d2d2d7] dark:stroke-[#3a3a3c]">
            <circle cx={C} cy={C} r="33" strokeWidth="1" strokeDasharray="1.5 5" />
          </motion.g>
          <circle cx={C} cy={C} r={R} strokeWidth="6" className="fill-none stroke-[#f0f0f3] dark:stroke-[#2c2c2e]" />
          <motion.circle
            cx={C}
            cy={C}
            r={R}
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(-90 ${C} ${C})`}
            className={`fill-none ${accentCls}`}
            style={{ ...accentStyle, fill: "none", pathLength: arc }}
            initial={false}
            animate={{ opacity: determinate ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx={C}
            cy={C}
            r={R}
            strokeWidth="6"
            className="fill-none stroke-[#30d158]"
            initial={false}
            animate={{ opacity: isDone ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.g style={{ opacity: cometFade, ...accentStyle, stroke: "none" }} className={accentCls}>
            {Array.from({ length: TAIL }, (_, i) => (
              <TailDot key={i} head={head} stretch={stretch} k={i + 1} done={done} />
            ))}
            <motion.circle cx={headX} cy={headY} r="5" />
            <motion.circle cx={headX} cy={headY} r="9" style={{ opacity: 0.18 }} />
          </motion.g>
          <motion.path
            d="M43 61 L55 72 L78 47"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-[#30d158]"
            style={{ pathLength: tickLen, opacity: tickShow }}
          />
        </svg>
        {determinate ? (
          <motion.span
            className="absolute inset-0 grid place-items-center text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
            style={{ opacity: pctFade, fontSize: Math.max(12, Math.round(size * 0.17)) }}
            aria-hidden="true"
          >
            {pct}%
          </motion.span>
        ) : null}
      </motion.div>

      {messages.length || isDone ? (
        <div className="relative h-5 w-56 max-w-full overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={isDone ? "done" : line}
              initial={reduce ? false : { y: 14, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={`m-0 text-[13px] font-medium ${isDone ? "text-[#1a7f37] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}
            >
              {shown}
              {isDone ? "" : "…"}
            </motion.p>
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
```

# Step Loader

Add the "Step Loader" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { STEP_LOADER_STEPS, StepLoader } from "@/components/orbital-loader/step-loader";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/orbital-loader/step-loader.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface StepLoaderProps {
  /** The steps of the job, in order. The last one is shown briefly as "done" before the result appears. */
  steps?: string[];
  /** How long each step stays current, in ms. Under 800 the finish tick plays on every second step instead of every step. */
  stepMs?: number;
  /** Heading shown before the job starts. */
  title?: string;
  /** Line under the heading before the job starts. */
  idleText?: string;
  /** Label of the button that starts the job. */
  startLabel?: string;
  /** Heading of the result once every step has finished. */
  doneTitle?: string;
  /** Line under the result heading. */
  doneText?: string;
  /** Label of the button on the result. */
  actionLabel?: string;
  /** Called once when every step has finished. */
  onComplete?: () => void;
  /** Called when Cancel is pressed. */
  onCancel?: () => void;
  /** Called when the button on the result is pressed. */
  onAction?: () => void;
  /** Starts the job by itself, shows the result, and starts again, until someone touches the card. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const STEP_LOADER_STEPS = ["Creating your workspace", "Importing 248 customers", "Matching accounts to plans", "Building your first dashboard", "Inviting your team", "Ready"];
const H = 44;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Run = "idle" | "running" | "done" | "cancelled";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * A loader for long jobs that keeps people oriented. The current step sits
 * in the middle, finished steps roll up and tick, upcoming ones wait below
 * faded, and a ring around the count shows overall progress. Cancel is
 * always there. When it finishes, the list folds away into the result.
 * Start and Cancel are real buttons and focus moves to the next one; the
 * current step is announced to screen readers.
 */
export function StepLoader({
  steps = STEP_LOADER_STEPS,
  stepMs = 1050,
  title = "Set up your workspace",
  idleText = "This takes about six seconds.",
  startLabel = "Start setup",
  doneTitle = "Your workspace is ready",
  doneText = "248 customers imported, dashboard built, 3 invites sent.",
  actionLabel = "Open workspace",
  onComplete,
  onCancel,
  onAction,
  autoplay = false,
  enableSound = true,
  className = "",
}: StepLoaderProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState<Run>("idle");
  const [i, setI] = useState(0);
  const [autoRun, setAutoRun] = useState(false);
  const [manual, setManual] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const active = useDemoActive(root, autoplay && !reduce);
  const paused = autoRun && autoplay && !active;
  const last = Math.max(0, steps.length - 1);

  const start = (auto: boolean) => {
    setI(0);
    setAutoRun(auto);
    setManual(!auto);
    setRun("running");
  };

  // The latest handlers and sound player, read from timers and the demo.
  const latest = useRef({ play, start, onComplete });
  useEffect(() => {
    latest.current = { play, start, onComplete };
  });

  // The job: one timer per step. It stops while a demo run is paused off screen.
  useEffect(() => {
    if (run !== "running" || paused) return;
    const sound = (name: "tick" | "done", vol: number) => (autoRun ? latest.current.play.auto(name, vol) : latest.current.play(name, vol));
    if (i < last) {
      const id = window.setTimeout(() => {
        // A step just finished: tick on every step when the run is slow enough, else on every second one.
        if (stepMs >= 800 || i % 2 === 1) sound("tick", 0.4);
        setI(i + 1);
      }, stepMs);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      sound("done", 0.6);
      setRun("done");
      latest.current.onComplete?.();
    }, stepMs + 200);
    return () => window.clearTimeout(id);
  }, [run, i, last, stepMs, autoRun, paused]);

  // Demo: start the job, show the result for a moment, start again.
  useEffect(() => {
    if (!autoplay || reduce || !active || touched.current) return;
    if (run !== "idle" && run !== "done") return;
    const id = window.setTimeout(() => {
      if (!touched.current) latest.current.start(true);
    }, run === "idle" ? 900 : 3200);
    return () => window.clearTimeout(id);
  }, [autoplay, reduce, active, run]);

  const p = run === "done" ? 1 : i / Math.max(1, last);
  const cardMotion = reduce ? { duration: 0.15 } : undefined;
  const heading = run === "cancelled" ? "Setup cancelled" : title;
  const sub = run === "cancelled" ? "Nothing was changed. Start again any time." : idleText;

  return (
    <div
      ref={root}
      className={`relative flex h-[420px] w-[440px] max-w-full flex-col items-center justify-center overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <span className="sr-only" role="status" aria-live="polite">
        {run === "running" ? `Step ${i + 1} of ${steps.length}: ${steps[i] ?? ""}` : run === "done" ? doneTitle : run === "cancelled" ? "Setup cancelled" : ""}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {run === "running" ? (
          <motion.div
            key="run"
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            transition={cardMotion}
          >
            <div className="relative h-14 w-14" aria-hidden="true">
              <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-[#ececf0] dark:stroke-[#3a3a3c]" />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0.03, p) }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">
                {i + 1}/{steps.length}
              </span>
            </div>
            {/* the reel of steps: the current one is always in the middle */}
            <div
              className="relative mt-6 w-full overflow-hidden"
              style={{ height: H * 5, maskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)" }}
              aria-hidden="true"
            >
              <motion.ul className="m-0 list-none p-0" animate={{ y: H * 2 - i * H }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 26 }}>
                {steps.map((s, k) => (
                  <motion.li
                    key={k}
                    className="flex items-center justify-center gap-2.5"
                    style={{ height: H }}
                    animate={{ opacity: k === i ? 1 : k < i ? 0.45 : 0.3, scale: k === i || reduce ? 1 : 0.92 }}
                    transition={cardMotion}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      {k < i ? (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
                          <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} />
                        </svg>
                      ) : k === i ? (
                        reduce ? (
                          <span className="h-4 w-4 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]" />
                        ) : (
                          <motion.span
                            className="h-4 w-4 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                        )
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[#d2d2d7] dark:bg-[#48484a]" />
                      )}
                    </span>
                    <span className={`text-[16px] ${k === i ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{s}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            <button
              type="button"
              autoFocus={manual}
              onClick={() => {
                touched.current = true;
                play("off", 0.5);
                setManual(true);
                setRun("cancelled");
                onCancel?.();
              }}
              className={`mt-4 h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
            >
              Cancel
            </button>
          </motion.div>
        ) : run === "done" ? (
          <motion.div key="done" className="text-center" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={cardMotion}>
            <motion.svg
              className="mx-auto"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              initial={{ scale: reduce ? 1 : 0.4 }}
              animate={{ scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
              <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduce ? 0 : 0.15 }} />
            </motion.svg>
            <h3 className="m-0 mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{doneTitle}</h3>
            <p className="m-0 mt-1 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{doneText}</p>
            <button
              type="button"
              onClick={() => onAction?.()}
              className={`mt-5 h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] ${FOCUS}`}
            >
              {actionLabel}
            </button>
          </motion.div>
        ) : (
          <motion.div key="idle" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={cardMotion}>
            <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h3>
            <p className="m-0 mt-1 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{sub}</p>
            <button
              type="button"
              autoFocus={manual}
              onClick={() => {
                touched.current = true;
                start(false);
              }}
              className={`mt-5 h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-medium text-white hover:bg-[#0077ed] ${FOCUS}`}
            >
              {run === "cancelled" ? "Start again" : startLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
