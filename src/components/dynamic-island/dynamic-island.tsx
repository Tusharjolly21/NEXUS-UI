"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export type IslandState = "idle" | "timer" | "music" | "call";

export type DynamicIslandProps = {
  /** Controlled activity. */
  state?: IslandState;
  /** Starting activity when uncontrolled. */
  defaultState?: IslandState;
  /** Called whenever the island asks to change activity (stop, decline, a cycle step). */
  onStateChange?: (state: IslandState) => void;
  /** Length of the timer, in seconds. It really ticks. */
  timerSeconds?: number;
  /** Accent colour for the timer and the music bars. */
  accent?: string;
  /** Uncontrolled only: step through `states` every this many ms. 0 stays put. */
  cycle?: number;
  /** Activities visited by `cycle` and autoplay. */
  states?: IslandState[];
  /** Track shown in the music activity. */
  track?: { title: string; artist: string };
  /** Name shown in the call activity. */
  caller?: string;
  /** Morphs through the activities and opens each one, until someone touches it. Uncontrolled only. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const SIZE: Record<IslandState, { compact: [number, number]; open: [number, number] }> = {
  idle: { compact: [126, 37], open: [126, 37] },
  timer: { compact: [214, 37], open: [352, 88] },
  music: { compact: [214, 37], open: [352, 164] },
  call: { compact: [236, 37], open: [352, 88] },
};

/** Width leads, height follows a beat later on a looser spring: that lag is what makes it stretch. */
const W_SPRING: Transition = { type: "spring", stiffness: 420, damping: 30, mass: 0.9 };
const H_SPRING: Transition = { type: "spring", stiffness: 260, damping: 19, mass: 0.9, delay: 0.04 };

function format(total: number) {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Counts down from `seconds` while running; loops back to the start at 0:00 so a demo never stalls. */
function useCountdown(seconds: number, active: boolean) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const [prevSeconds, setPrevSeconds] = useState(seconds);
  const leftRef = useRef(seconds);

  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds);
    setLeft(seconds);
    setRunning(true);
  }

  useEffect(() => {
    leftRef.current = left;
  }, [left]);

  useEffect(() => {
    if (!active || !running) return;
    const end = performance.now() + leftRef.current * 1000;
    const id = window.setInterval(() => {
      const next = (end - performance.now()) / 1000;
      setLeft(next <= 0 ? seconds : next);
    }, 250);
    return () => window.clearInterval(id);
  }, [active, running, seconds]);

  return { left, running, toggle: () => setRunning((r) => !r), reset: () => setLeft(seconds) };
}

const I = {
  timer: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="9" r="5.5" />
      <path d="M8 6.5V9l1.6 1.2M6.5 1.5h3" />
    </svg>
  ),
  play: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M5 3.4v11.2c0 .8.9 1.3 1.6.9l8.6-5.6a1.1 1.1 0 0 0 0-1.8L6.6 2.5C5.9 2.1 5 2.6 5 3.4Z" />
    </svg>
  ),
  pause: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="2.5" width="4" height="13" rx="1.2" />
      <rect x="10.5" y="2.5" width="4" height="13" rx="1.2" />
    </svg>
  ),
  stop: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1.5" y="1.5" width="11" height="11" rx="2.4" />
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 10.9 17 15.4c.6.4 1.4 0 1.4-.8V5.4c0-.8-.8-1.2-1.4-.8L10 9.1V5.4c0-.8-.8-1.2-1.4-.8L1.8 9.1a1.1 1.1 0 0 0 0 1.8l6.8 4.5c.6.4 1.4 0 1.4-.8Z" />
    </svg>
  ),
  next: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 9.1 3 4.6c-.6-.4-1.4 0-1.4.8v9.2c0 .8.8 1.2 1.4.8l7-4.5v3.7c0 .8.8 1.2 1.4.8l6.8-4.5a1.1 1.1 0 0 0 0-1.8l-6.8-4.5c-.6-.4-1.4 0-1.4.8Z" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M5.2 1.6 6.8 4.9c.3.6.1 1.3-.4 1.7l-1.2.9a9.6 9.6 0 0 0 5.3 5.3l.9-1.2c.4-.5 1.1-.7 1.7-.4l3.3 1.6c.6.3.9 1 .7 1.7l-.5 1.6c-.3.9-1.1 1.4-2 1.3C7.4 17 1 10.6.6 3.4c-.1-.9.4-1.7 1.3-2l1.6-.5c.7-.2 1.4.1 1.7.7Z" />
    </svg>
  ),
};

function Bars({ color, playing }: { color: string; playing: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {[0.55, 1, 0.7, 0.9, 0.5].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color, height: "100%", originY: 0.5 }}
          animate={playing && !reduce ? { scaleY: [h * 0.4, h, h * 0.55, h * 0.9, h * 0.4] } : { scaleY: h * 0.5 }}
          transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function RoundButton({ label, onClick, className = "", style, children }: { label: string; onClick: () => void; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.86 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  );
}

const ART = "bg-[conic-gradient(from_200deg,#ff9f0a,#ff375f,#bf5af2,#0a84ff,#ff9f0a)]";

/**
 * A black pill that grows into whatever is happening: a running timer, the
 * song that is playing, an incoming call. Every change stretches it: the
 * width shoots out first and the height catches up on a looser spring, so the
 * pill squashes and bulges into its new shape. Tap it to open live controls;
 * tap again or press Escape to tuck it away.
 */
export function DynamicIsland({
  state: controlled,
  defaultState = "timer",
  onStateChange,
  timerSeconds = 300,
  accent = "#ff9f0a",
  cycle = 0,
  states = ["timer", "music", "call"],
  track = { title: "Midnight Drive", artist: "Harbor Lights" },
  caller = "Ava Lin",
  autoplay = false,
  enableSound = true,
  className = "",
}: DynamicIslandProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() === true;
  const [inner, setInner] = useState<IslandState>(defaultState);
  const state = controlled ?? inner;
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touched = useRef(false);
  const timer = useCountdown(timerSeconds, state === "timer");
  const squash = useMotionValue(1);

  const setState = useCallback(
    (next: IslandState) => {
      if (controlled === undefined) setInner(next);
      onStateChange?.(next);
    },
    [controlled, onStateChange],
  );

  // Collapse whenever the activity changes.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setOpen(false);
  }

  const isOpen = open && state !== "idle";
  // A quick vertical squash on every morph; the spring lets it bounce back past 1.
  useEffect(() => {
    if (reduce) return;
    const a = animate(squash, [0.86, 1], { type: "spring", stiffness: 520, damping: 14 });
    return () => a.stop();
  }, [state, isOpen, squash, reduce]);

  // Optional self-running demo (paused while open).
  const statesKey = states.join(",");
  useEffect(() => {
    if (!cycle || controlled !== undefined || open) return;
    const list = statesKey.split(",") as IslandState[];
    const id = window.setTimeout(() => {
      const i = list.indexOf(state);
      setInner(list[(i + 1) % list.length] ?? list[0]);
    }, cycle);
    return () => window.clearTimeout(id);
  }, [cycle, controlled, open, state, statesKey]);

  // Autoplay: morph to the next activity, open it, close it, repeat.
  useEffect(() => {
    if (!autoplay || controlled !== undefined) return;
    const list = statesKey.split(",") as IslandState[];
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const beat = k++ % 3;
      if (beat === 0) {
        play.auto("pop", 0.7);
        setOpen(true);
      }
      if (beat === 1) {
        play.auto("pop", 0.4);
        setOpen(false);
      }
      if (beat === 2)
        setInner((s) => {
          const i = list.indexOf(s);
          return list[(i + 1) % list.length] ?? list[0];
        });
    }, 1700);
    return () => window.clearInterval(t);
  }, [autoplay, controlled, statesKey, play]);

  // Tap outside or Escape tucks it away.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        play("pop", 0.4);
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("pop", 0.4);
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, play]);

  const [w, h] = isOpen ? SIZE[state].open : SIZE[state].compact;
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { delay: reduce ? 0 : 0.1, type: "spring" as const, stiffness: 320, damping: 26 } },
    exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(6px)", transition: { duration: 0.12 } },
  };

  const label =
    state === "timer"
      ? `Timer, ${format(timer.left)} left`
      : state === "music"
        ? `Now playing ${track.title} by ${track.artist}`
        : state === "call"
          ? `Incoming call from ${caller}`
          : "Dynamic island";
  const initials = caller
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex max-w-full justify-center ${className}`}
      style={{ minWidth: Math.min(w, 352) }}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <motion.div
        role="group"
        aria-label={label}
        className="relative max-w-full overflow-hidden bg-black text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.55)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_14px_30px_-12px_rgba(0,0,0,.9)]"
        initial={false}
        animate={{ width: w, height: h, borderRadius: isOpen ? 44 : 22 }}
        transition={reduce ? { duration: 0 } : { width: W_SPRING, height: H_SPRING, borderRadius: H_SPRING }}
        style={{ scaleY: squash, originY: 0 }}
        whileHover={state !== "idle" && !isOpen && !reduce ? { scale: 1.04 } : undefined}
        onClick={() => {
          if (!isOpen) return;
          play("pop", 0.4);
          setOpen(false);
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen && state !== "idle" ? (
            <motion.button
              key={`c-${state}`}
              type="button"
              aria-expanded={false}
              aria-label={`${label}. Open controls`}
              onClick={(e) => {
                e.stopPropagation();
                play("pop", 0.7);
                setOpen(true);
              }}
              className="absolute inset-0 flex items-center justify-between rounded-[inherit] px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
              {...fade}
            >
              {state === "timer" ? (
                <>
                  <span className="grid size-6 place-items-center rounded-full" style={{ background: `${accent}2e`, color: accent }}>
                    {I.timer}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: accent }}>
                    {format(timer.left)}
                  </span>
                </>
              ) : state === "music" ? (
                <>
                  <span className={`size-6 rounded-[7px] ${ART}`} />
                  <Bars color={accent} playing={playing} />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-[#30d158]/20 text-[#30d158] [&_svg]:size-3.5">{I.phone}</span>
                    <span className="text-[13px] font-medium">{caller}</span>
                  </span>
                  <Bars color="#30d158" playing />
                </>
              )}
            </motion.button>
          ) : null}

          {isOpen && state === "timer" ? (
            <motion.div key="o-timer" className="absolute inset-0 flex items-center justify-between px-5" {...fade}>
              <div className="flex items-center gap-2.5">
                <RoundButton label={timer.running ? "Pause timer" : "Resume timer"} onClick={timer.toggle} style={{ background: `${accent}38`, color: accent }}>
                  {timer.running ? I.pause : I.play}
                </RoundButton>
                <RoundButton
                  label="Stop timer"
                  onClick={() => {
                    play("whoosh", 0.6);
                    timer.reset();
                    setOpen(false);
                    setState("idle");
                  }}
                  className="bg-white/15 text-white"
                >
                  {I.stop}
                </RoundButton>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium" style={{ color: accent }}>
                  Timer
                </span>
                <span className="text-[38px] font-light leading-none tabular-nums tracking-[-0.03em]" style={{ color: accent }}>
                  {format(timer.left)}
                </span>
              </div>
            </motion.div>
          ) : null}

          {isOpen && state === "music" ? (
            <motion.div key="o-music" className="absolute inset-0 flex flex-col justify-between p-5" {...fade}>
              <div className="flex items-center gap-3.5">
                <span className={`size-14 shrink-0 rounded-[14px] shadow-[0_6px_18px_-6px_rgba(255,55,95,.7)] ${ART}`} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[15px] font-semibold tracking-[-0.01em]">{track.title}</p>
                  <p className="m-0 truncate text-[13px] text-white/60">{track.artist}</p>
                </div>
                <Bars color={accent} playing={playing} />
              </div>
              <div className="flex items-center gap-2.5 text-[11px] tabular-nums text-white/60">
                <span>1:12</span>
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={{ width: "34%" }}
                    animate={{ width: playing && !reduce ? "62%" : "34%" }}
                    transition={{ duration: playing ? 40 : 0.2, ease: "linear" }}
                  />
                </span>
                <span>3:48</span>
              </div>
              <div className="-my-1 flex items-center justify-center gap-6">
                <RoundButton label="Previous track" onClick={() => undefined} className="size-9 text-white/80">
                  {I.back}
                </RoundButton>
                <RoundButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} className="size-9 text-white [&_svg]:size-6">
                  {playing ? I.pause : I.play}
                </RoundButton>
                <RoundButton label="Next track" onClick={() => undefined} className="size-9 text-white/80">
                  {I.next}
                </RoundButton>
              </div>
            </motion.div>
          ) : null}

          {isOpen && state === "call" ? (
            <motion.div key="o-call" className="absolute inset-0 flex items-center justify-between gap-3 px-5" {...fade}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#0a84ff,#bf5af2)] text-[15px] font-semibold">{initials}</span>
                <div className="min-w-0">
                  <p className="m-0 text-[12px] text-white/60">mobile</p>
                  <p className="m-0 truncate text-[16px] font-semibold tracking-[-0.01em]">{caller}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RoundButton label="Decline" onClick={() => {
                    play("whoosh", 0.6);
                    setState("idle");
                  }} className="bg-[#ff3b30] text-white [&_svg]:rotate-[135deg]">
                  {I.phone}
                </RoundButton>
                <RoundButton label="Accept" onClick={() => setOpen(false)} className="bg-[#30d158] text-white">
                  {I.phone}
                </RoundButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
