"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export type StepFlowItem = {
  id?: string;
  /** Number shown before the title. Defaults to 01, 02… */
  serial?: string;
  title: string;
  description?: string;
  /** Optional picture for the step's card. Without it a drawn card in the step's accent is shown. */
  image?: string;
  imageAlt?: string;
  /** Accent for the drawn card and the progress bar. */
  accent?: string;
};

export type StepFlowProps = {
  steps?: StepFlowItem[];
  /** Step selected on first render. */
  defaultStep?: number;
  /** Called with the index whenever the selected step changes. */
  onStepChange?: (index: number) => void;
  /** Background of the sliding highlight behind the active step. Defaults to the system grey. */
  highlightColor?: string;
  /** Advances through the steps, with a progress bar, until someone touches the component. */
  autoplay?: boolean;
  /** Older name for `autoplay`. */
  autoPlay?: boolean;
  /** Milliseconds per step while autoplaying. */
  autoPlayInterval?: number;
  className?: string;
  /** Extra classes for the step list column. */
  textClassName?: string;
  /** Extra classes for the card deck column. */
  imageClassName?: string;
};

const ACCENTS = ["#0071e3", "#bf5af2", "#ff9f0a", "#30d158", "#ff375f", "#5ac8fa"];

const defaultSteps: StepFlowItem[] = [
  { serial: "01", title: "Map the system", description: "Turn scattered product ideas into a clear structure your team can build from." },
  { serial: "02", title: "Shape the interface", description: "Compose layouts, components and states in one visual language." },
  { serial: "03", title: "Refine the motion", description: "Add transitions that make every interaction feel responsive and calm." },
  { serial: "04", title: "Ship the page", description: "Package it as reusable React code that is ready for production." },
];

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Drawn card art: a different motif per step, in the step's accent. */
function Art({ index, accent }: { index: number; accent: string }) {
  const motif = index % 4;
  return (
    <svg viewBox="0 0 240 160" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {motif === 0
        ? [70, 52, 34, 16].map((r, i) => <circle key={r} cx="176" cy="58" r={r} fill="none" stroke="white" strokeOpacity={0.18 + i * 0.12} strokeWidth="1.5" />)
        : null}
      {motif === 1
        ? Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={128 + (i % 4) * 24} y={18 + Math.floor(i / 4) * 24} width="18" height="18" rx="5" fill="white" fillOpacity={i === 5 ? 0.85 : 0.18} />
          ))
        : null}
      {motif === 2
        ? Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M100 ${30 + i * 14} C 140 ${10 + i * 14}, 180 ${54 + i * 12}, 250 ${24 + i * 14}`} fill="none" stroke="white" strokeOpacity={0.15 + i * 0.1} strokeWidth="1.5" />
          ))
        : null}
      {motif === 3
        ? [34, 56, 44, 78, 96].map((h, i) => <rect key={i} x={124 + i * 22} y={110 - h} width="14" height={h} rx="5" fill="white" fillOpacity={i === 4 ? 0.85 : 0.22} />)
        : null}
      <circle cx={r3(40 + motif * 6)} cy="128" r="60" fill={accent} fillOpacity="0.35" />
    </svg>
  );
}

/**
 * A process section: numbered steps on one side, a deck of cards on the
 * other. Pick a step (hover, click or arrow keys) and the highlight slides
 * to it on a spring while its card is dealt to the front; the card it
 * replaces tucks under the back of the deck. The deck leans toward the
 * pointer. With autoplay a progress bar fills under the active step.
 */
export function StepFlow({
  steps = defaultSteps,
  defaultStep = 0,
  onStepChange,
  highlightColor,
  autoplay = false,
  autoPlay = false,
  autoPlayInterval = 3200,
  className = "",
  textClassName = "",
  imageClassName = "",
}: StepFlowProps) {
  const reduce = useReducedMotion() === true;
  const list = steps.length > 0 ? steps : defaultSteps;
  const n = list.length;
  const uid = useId().replace(/:/g, "");
  const [sel, setSel] = useState(() => {
    const a = Math.min(Math.max(defaultStep, 0), n - 1);
    return { active: a, prev: -1 };
  });
  const active = Math.min(sel.active, n - 1);
  const touched = useRef(false);
  const [auto, setAuto] = useState(autoplay || autoPlay);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useMotionValue(0);
  const tiltX = useSpring(0, { stiffness: 160, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 160, damping: 18 });
  const interval = Math.max(1200, autoPlayInterval);

  const go = (i: number, byUser: boolean) => {
    const to = ((i % n) + n) % n;
    if (byUser && !touched.current) {
      touched.current = true;
      setAuto(false);
    }
    setSel((s) => (s.active === to ? s : { active: to, prev: s.active }));
    if (to !== active) onStepChange?.(to);
  };

  useEffect(() => {
    if (!auto || reduce || n < 2) return;
    progress.set(0);
    const run = animate(progress, 1, { duration: interval / 1000, ease: "linear" });
    const t = window.setTimeout(() => {
      if (touched.current) return;
      setSel((s) => ({ active: (s.active + 1) % n, prev: s.active }));
    }, interval);
    return () => {
      run.stop();
      window.clearTimeout(t);
    };
  }, [auto, reduce, n, interval, active, progress]);

  const key = (e: KeyboardEvent) => {
    let to: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") to = active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = active - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = n - 1;
    if (to === null) return;
    e.preventDefault();
    const next = ((to % n) + n) % n;
    go(next, true);
    tabs.current[next]?.focus();
  };

  const lean = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 32 };
  const current = list[active];

  return (
    <section
      className={`@container w-full rounded-[28px] bg-white p-3 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="grid gap-3 @min-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @min-[560px]:items-stretch">
        <div role="tablist" aria-orientation="vertical" aria-label="Steps" onKeyDown={key} className={`order-2 flex flex-col justify-center gap-1 p-1 @min-[560px]:order-1 ${textClassName}`}>
          {list.map((step, i) => {
            const on = i === active;
            const accent = step.accent ?? ACCENTS[i % ACCENTS.length];
            return (
              <button
                key={step.id ?? `${step.serial ?? i}-${step.title}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => go(i, true)}
                onPointerMove={(e) => {
                  // Only real mouse movement selects; layout shifts under a resting cursor don't.
                  if (e.pointerType === "mouse" && !on && (e.movementX !== 0 || e.movementY !== 0)) go(i, true);
                }}
                className="relative flex w-full flex-col items-start rounded-[18px] px-4 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
              >
                {on ? (
                  <motion.span
                    layoutId={`${uid}-hl`}
                    className={`absolute inset-0 overflow-hidden rounded-[18px] ${highlightColor ? "" : "bg-[#f5f5f7] dark:bg-[#2c2c2e]"}`}
                    style={highlightColor ? { backgroundColor: highlightColor } : undefined}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26, mass: 0.9 }}
                  >
                    {auto && !reduce ? (
                      <span className="absolute inset-x-4 bottom-2 h-[3px] overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
                        <motion.span className="absolute inset-0 origin-left rounded-full" style={{ scaleX: progress, background: accent }} />
                      </span>
                    ) : null}
                  </motion.span>
                ) : null}
                <span className="relative flex items-baseline gap-3">
                  <span className={`text-[12px] font-semibold tabular-nums transition-colors ${on ? "" : "text-[#86868b] dark:text-[#8e8e93]"}`} style={on ? { color: accent } : undefined}>
                    {step.serial ?? String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-[19px] font-semibold leading-tight tracking-[-0.025em] transition-colors @min-[560px]:text-[22px] ${on ? "" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>
                    {step.title}
                  </span>
                </span>
                <AnimatePresence initial={false}>
                  {on && step.description ? (
                    <motion.span
                      key="d"
                      className="relative block overflow-hidden pl-[34px]"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    >
                      <span className="block pt-1.5 text-[13px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{step.description}</span>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </button>
            );
          })}
          <p className="px-4 pt-1 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Hover a step, or use the arrow keys.</p>
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${active}`}
          aria-live="polite"
          onPointerMove={lean}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
          className={`relative order-1 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[22px] bg-[#f5f5f7] px-6 pb-6 pt-10 @min-[560px]:order-2 @min-[560px]:min-h-[340px] dark:bg-[#2c2c2e] ${imageClassName}`}
          style={{ perspective: 900 }}
        >
          <motion.div className="relative aspect-[3/2] w-full max-w-[320px]" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
            {list.map((step, i) => {
              const d = (i - active + n) % n;
              const accent = step.accent ?? ACCENTS[i % ACCENTS.length];
              const leaving = i === sel.prev && d === n - 1 && !reduce;
              const y = -Math.min(d, 3) * 16;
              const scale = 1 - Math.min(d, 3) * 0.06;
              const opacity = d > 2 ? 0 : 1 - d * 0.18;
              return (
                <motion.div
                  key={step.id ?? `${i}-${step.title}`}
                  aria-hidden={d !== 0}
                  className="absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_18px_36px_-20px_rgba(0,0,0,.55)]"
                  style={{ zIndex: n - d, background: `linear-gradient(150deg, ${accent} 0%, #1d1d1f 135%)`, transformOrigin: "50% 0%" }}
                  initial={false}
                  animate={
                    leaving
                      ? { y: [0, 46, y], scale: [1, 0.96, scale], rotate: [0, -3, 0], opacity: [1, 1, opacity] }
                      : { y, scale, rotate: 0, opacity }
                  }
                  transition={leaving ? { duration: 0.7, times: [0, 0.45, 1], ease: [0.3, 0, 0.2, 1] } : spring}
                >
                  {step.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- accepts any local or remote URL
                    <img src={step.image} alt={d === 0 ? (step.imageAlt ?? step.title) : ""} className="absolute inset-0 size-full object-cover" draggable={false} />
                  ) : (
                    <Art index={i} accent={accent} />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 pt-10 text-white">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">Step {step.serial ?? String(i + 1).padStart(2, "0")}</span>
                    <span className="block text-[17px] font-semibold tracking-[-0.02em]">{step.title}</span>
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
          <span className="sr-only">{current ? `Step ${active + 1} of ${n}: ${current.title}` : ""}</span>
        </div>
      </div>
    </section>
  );
}

export default StepFlow;
