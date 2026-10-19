"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { Pause, Phone, PhoneOff, Play, SkipBack, SkipForward, Square, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export type IslandState = "idle" | "timer" | "music" | "call";

export type DynamicIslandProps = {
  /** Controlled state. */
  state?: IslandState;
  /** Starting state when uncontrolled. */
  defaultState?: IslandState;
  /** Called whenever the island asks to change state (stop, decline, end of a cycle step). */
  onStateChange?: (state: IslandState) => void;
  /** Length of the timer, in seconds. */
  timerSeconds?: number;
  /** Accent colour used by the timer and the music bars. */
  accent?: string;
  /** Uncontrolled only: step through `states` every `cycle` ms. `0` stays put. */
  cycle?: number;
  /** States visited by `cycle`. */
  states?: IslandState[];
  /** Track shown in the music state. */
  track?: { title: string; artist: string };
  /** Caller shown in the call state. */
  caller?: string;
  className?: string;
};

const SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };

const SIZE: Record<IslandState, { compact: [number, number]; open: [number, number] }> = {
  idle: { compact: [126, 37], open: [126, 37] },
  timer: { compact: [214, 37], open: [352, 88] },
  music: { compact: [214, 37], open: [352, 164] },
  call: { compact: [236, 37], open: [352, 88] },
};

function format(total: number) {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Counts down from `seconds` while running; survives re-renders by tracking an end time. */
function useCountdown(seconds: number, active: boolean) {
  const [left, setLeft] = React.useState(seconds);
  const [running, setRunning] = React.useState(true);
  const [prevSeconds, setPrevSeconds] = React.useState(seconds);
  const endRef = React.useRef(0);

  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds);
    setLeft(seconds);
    setRunning(true);
  }

  React.useEffect(() => {
    if (!active || !running) return;
    endRef.current = Date.now() + left * 1000;
    const id = window.setInterval(() => {
      const next = (endRef.current - Date.now()) / 1000;
      setLeft(next <= 0 ? seconds : next); // loop the demo instead of sitting at 0:00
    }, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `left` seeds the end time only when (re)starting
  }, [active, running, seconds]);

  return { left, running, toggle: () => setRunning((r) => !r), reset: () => setLeft(seconds) };
}

function Bars({ color, playing }: { color: string; playing: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden>
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

function RoundButton({
  label,
  onClick,
  className,
  style,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      style={style}
    >
      {children}
    </button>
  );
}

/**
 * A black pill that grows into whatever is happening: a running timer, the song that is playing,
 * an incoming call. Tap it to open the live controls, tap again (or press Escape) to tuck it away.
 */
export function DynamicIsland({
  state: controlled,
  defaultState = "timer",
  onStateChange,
  timerSeconds = 300,
  accent = "#ff9f0a",
  cycle = 0,
  states = ["timer", "music", "call"],
  track = { title: "Midnight Drive", artist: "Neon Harbor" },
  caller = "Ava Lin",
  className,
}: DynamicIslandProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = React.useState<IslandState>(defaultState);
  const state = controlled ?? inner;
  const [open, setOpen] = React.useState(false);
  const [playing, setPlaying] = React.useState(true);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const timer = useCountdown(timerSeconds, state === "timer");

  const setState = React.useCallback(
    (next: IslandState) => {
      if (controlled === undefined) setInner(next);
      onStateChange?.(next);
    },
    [controlled, onStateChange],
  );

  // collapse whenever the activity changes
  const [prevState, setPrevState] = React.useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setOpen(false);
  }

  // optional self-running demo (paused while open)
  React.useEffect(() => {
    if (!cycle || controlled !== undefined || open) return;
    const id = window.setTimeout(() => {
      const i = states.indexOf(state);
      setInner(states[(i + 1) % states.length] ?? states[0]);
    }, cycle);
    return () => window.clearTimeout(id);
  }, [cycle, controlled, open, state, states]);

  // tap outside or Escape tucks it away
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const canOpen = state !== "idle";
  const isOpen = open && canOpen;
  const [w, h] = isOpen ? SIZE[state].open : SIZE[state].compact;
  const transition = reduce ? { duration: 0 } : SPRING;
  const fade = {
    initial: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { delay: reduce ? 0 : 0.08, duration: 0.22 } },
    exit: { opacity: 0, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.12 } },
  };

  const label =
    state === "timer"
      ? `Timer, ${format(timer.left)} left`
      : state === "music"
        ? `Now playing ${track.title} by ${track.artist}`
        : state === "call"
          ? `Incoming call from ${caller}`
          : "Dynamic island";

  return (
    <div ref={rootRef} className={cn("relative inline-flex justify-center", className)} style={{ minWidth: w }}>
      <motion.div
        role="group"
        aria-label={label}
        className="relative overflow-hidden bg-black text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        initial={false}
        animate={{ width: w, height: h, borderRadius: isOpen ? 44 : 22 }}
        transition={transition}
        whileHover={canOpen && !isOpen && !reduce ? { scale: 1.04 } : undefined}
        onClick={() => isOpen && setOpen(false)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {/* ── compact ─────────────────────────────── */}
          {!isOpen && state !== "idle" ? (
            <motion.button
              key={`c-${state}`}
              type="button"
              aria-expanded={false}
              aria-label={`${label}. Open controls`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="absolute inset-0 flex items-center justify-between rounded-[inherit] px-3.5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/70"
              {...fade}
            >
              {state === "timer" ? (
                <>
                  <span className="grid size-6 place-items-center rounded-full" style={{ background: `${accent}2e`, color: accent }}>
                    <Timer className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums tracking-tight" style={{ color: accent }}>
                    {format(timer.left)}
                  </span>
                </>
              ) : state === "music" ? (
                <>
                  <span className="size-6 rounded-[7px] bg-[conic-gradient(from_200deg,#ff7b42,#f04a8d,#6d5cff,#ff7b42)]" />
                  <Bars color={accent} playing={playing} />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-[#30d158]/20 text-[#30d158]">
                      <Phone className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-[13px] font-medium">{caller}</span>
                  </span>
                  <Bars color="#30d158" playing />
                </>
              )}
            </motion.button>
          ) : null}

          {/* ── open: timer ─────────────────────────── */}
          {isOpen && state === "timer" ? (
            <motion.div key="o-timer" className="absolute inset-0 flex items-center justify-between px-5" {...fade}>
              <div className="flex items-center gap-2.5">
                <RoundButton
                  label={timer.running ? "Pause timer" : "Resume timer"}
                  onClick={timer.toggle}
                  style={{ background: `${accent}38`, color: accent }}
                >
                  {timer.running ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
                </RoundButton>
                <RoundButton
                  label="Stop timer"
                  onClick={() => {
                    timer.reset();
                    setOpen(false);
                    setState("idle");
                  }}
                  className="bg-white/15 text-white"
                >
                  <Square className="size-4 fill-current" />
                </RoundButton>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium" style={{ color: accent }}>
                  Timer
                </span>
                <span className="text-[38px] font-light leading-none tabular-nums tracking-tight" style={{ color: accent }}>
                  {format(timer.left)}
                </span>
              </div>
            </motion.div>
          ) : null}

          {/* ── open: music ─────────────────────────── */}
          {isOpen && state === "music" ? (
            <motion.div key="o-music" className="absolute inset-0 flex flex-col justify-between p-5" {...fade}>
              <div className="flex items-center gap-3.5">
                <span className="size-14 shrink-0 rounded-[14px] bg-[conic-gradient(from_200deg,#ff7b42,#f04a8d,#6d5cff,#ff7b42)] shadow-[0_6px_18px_-6px_rgba(240,74,141,0.7)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{track.title}</p>
                  <p className="truncate text-[13px] text-white/55">{track.artist}</p>
                </div>
                <Bars color={accent} playing={playing} />
              </div>
              <div className="flex items-center gap-2.5 text-[11px] tabular-nums text-white/50">
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
                  <SkipBack className="size-5 fill-current" />
                </RoundButton>
                <RoundButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} className="size-9 text-white">
                  {playing ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}
                </RoundButton>
                <RoundButton label="Next track" onClick={() => undefined} className="size-9 text-white/80">
                  <SkipForward className="size-5 fill-current" />
                </RoundButton>
              </div>
            </motion.div>
          ) : null}

          {/* ── open: call ──────────────────────────── */}
          {isOpen && state === "call" ? (
            <motion.div key="o-call" className="absolute inset-0 flex items-center justify-between gap-3 px-5" {...fade}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6d5cff] to-[#f04a8d] text-[15px] font-semibold">
                  {caller
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] text-white/55">mobile</p>
                  <p className="truncate text-[16px] font-semibold">{caller}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RoundButton label="Decline" onClick={() => setState("idle")} className="bg-[#ff453a] text-white">
                  <PhoneOff className="size-5" />
                </RoundButton>
                <RoundButton label="Accept" onClick={() => setOpen(false)} className="bg-[#30d158] text-white">
                  <Phone className="size-5" />
                </RoundButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
