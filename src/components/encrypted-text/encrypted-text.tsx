"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!<>/|[]{}~=-_+:.";

function pickRandom(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)] ?? chars[0]!;
}

function isPreserved(c: string): boolean {
  return c === " " || c === "\n" || c === "\t";
}

type CharState = { char: string; locked: boolean };

function initStates(text: string, charset: string): CharState[] {
  return Array.from(text).map((c) =>
    isPreserved(c) ? { char: c, locked: true } : { char: pickRandom(charset), locked: false },
  );
}

export type EncryptedTextTrigger = "load" | "hover" | "viewport" | "click";

export interface EncryptedTextProps {
  text: string;
  className?: string;
  /** ms between each character locking in. Default: 50 */
  speed?: number;
  /** ms between gibberish shuffle ticks. Default: 35 */
  shuffleSpeed?: number;
  /** ms delay before animation starts. Default: 0 */
  revealDelay?: number;
  /** Charset for the gibberish phase. */
  characters?: string;
  /** Shuffle cycles before first character locks in. Default: 8 */
  iterations?: number;
  /** What triggers the reveal. Default: "load" */
  trigger?: EncryptedTextTrigger;
  /** Loop the animation after completion. Default: false */
  loop?: boolean;
  /** ms to wait before replaying when loop=true. Default: 2000 */
  loopDelay?: number;
  /** Polymorphic element. Default: "span" */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  /** Called once every character has locked in. */
  onComplete?: () => void;
}

export function EncryptedText({
  text,
  className,
  speed = 50,
  shuffleSpeed = 35,
  revealDelay = 0,
  characters = DEFAULT_CHARSET,
  iterations = 8,
  trigger = "load",
  loop = false,
  loopDelay = 2000,
  as: Tag = "span",
  onComplete,
}: EncryptedTextProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(rootRef as React.RefObject<Element>, {
    once: !loop,
    amount: 0.3,
  });

  const [states, setStates] = React.useState<CharState[]>(() =>
    Array.from(text).map((c) => ({ char: c, locked: true }))
  );

  // Always-current config refs — read inside effects without stale closure risk
  const cfg = React.useRef({ text, characters, speed, shuffleSpeed, iterations, loop, loopDelay, onComplete });
  cfg.current = { text, characters, speed, shuffleSpeed, iterations, loop, loopDelay, onComplete };

  // Incrementing this triggers one animation run
  const [cycle, setCycle] = React.useState(0);

  // play() is the single entry point for all trigger modes
  const play = React.useCallback(() => setCycle((n) => n + 1), []);

  // Core animation — isolated per cycle so cleanup fully cancels the previous run
  React.useEffect(() => {
    if (cycle === 0) return;

    const { text: t, characters: ch, speed: sp, shuffleSpeed: ss,
            iterations: it, loop: lp, loopDelay: ld, onComplete: cb } = cfg.current;

    if (reduceMotion) {
      setStates(Array.from(t).map((c) => ({ char: c, locked: true })));
      cb?.();
      return;
    }

    let dead = false;
    let revealIdx = 0;

    setStates(initStates(t, ch));

    // Phase 1 — fast shuffle of all unrevealed characters
    const shuffleTimer = setInterval(() => {
      if (dead) return;
      setStates((prev) =>
        prev.map((s) => (s.locked ? s : { char: pickRandom(ch), locked: false })),
      );
    }, ss);

    // Phase 2 — after warmup, lock one character per tick
    let revealTimer: ReturnType<typeof setInterval> | null = null;
    let loopTimer: ReturnType<typeof setTimeout> | null = null;

    const warmupTimer = setTimeout(() => {
      if (dead) return;

      revealTimer = setInterval(() => {
        if (dead) return;

        if (revealIdx >= t.length) {
          clearInterval(revealTimer!);
          clearInterval(shuffleTimer);
          if (!dead) {
            setStates(Array.from(t).map((c) => ({ char: c, locked: true })));
            cb?.();
            if (lp) {
              loopTimer = setTimeout(() => { if (!dead) setCycle((n) => n + 1); }, ld);
            }
          }
          return;
        }

        const idx = revealIdx++;
        setStates((prev) => {
          const next = [...prev];
          next[idx] = { char: t[idx]!, locked: true };
          return next;
        });
      }, sp);
    }, it * ss);

    return () => {
      dead = true;
      clearInterval(shuffleTimer);
      clearTimeout(warmupTimer);
      if (revealTimer) clearInterval(revealTimer);
      if (loopTimer) clearTimeout(loopTimer);
    };
  }, [cycle, reduceMotion]);

  // Trigger: load — schedule play() after revealDelay
  React.useEffect(() => {
    if (trigger !== "load") return;
    const t = setTimeout(play, revealDelay);
    return () => clearTimeout(t);
  }, [trigger, revealDelay, play]);

  // Trigger: viewport — play() once the element enters the viewport
  React.useEffect(() => {
    if (trigger !== "viewport" || !isInView) return;
    const t = setTimeout(play, revealDelay);
    return () => clearTimeout(t);
  }, [trigger, isInView, revealDelay, play]);

  // Trigger: hover / click
  const handleInteraction = React.useCallback(() => {
    setTimeout(play, revealDelay);
  }, [play, revealDelay]);

  const interactionProps: React.HTMLAttributes<HTMLElement> = {};
  if (trigger === "hover") {
    interactionProps.onMouseEnter = handleInteraction;
  } else if (trigger === "click") {
    interactionProps.onClick = handleInteraction;
    interactionProps.onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") handleInteraction();
    };
  }

  return (
    <Tag
      ref={rootRef as React.RefObject<never>}
      aria-label={text}
      role={trigger === "click" ? "button" : undefined}
      tabIndex={trigger === "click" ? 0 : undefined}
      className={cn(
        "font-mono whitespace-pre-wrap",
        trigger === "click" && "cursor-pointer select-none",
        className,
      )}
      {...interactionProps}
    >
      {states.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "inline-block transition-colors duration-75",
            s.locked ? "text-current" : "text-primary dark:text-cyan-400",
          )}
          style={
            !s.locked
              ? { filter: "drop-shadow(0 0 5px currentColor)", opacity: 0.85 }
              : undefined
          }
        >
          {s.char}
        </span>
      ))}
    </Tag>
  );
}
