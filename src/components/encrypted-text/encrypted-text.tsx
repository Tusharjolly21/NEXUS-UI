"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>/[]{}=+";

export type EncryptedTextTrigger = "load" | "hover" | "viewport" | "click";

export interface EncryptedTextProps {
  /** The string that ends up on screen. */
  text: string;
  className?: string;
  /** Milliseconds between one character locking in and the next. */
  speed?: number;
  /** Milliseconds between scramble ticks. */
  shuffleSpeed?: number;
  /** Milliseconds before the decode starts. */
  revealDelay?: number;
  /** Characters used while scrambling. */
  characters?: string;
  /** Scramble ticks before the first character locks. */
  iterations?: number;
  /** What starts the decode. */
  trigger?: EncryptedTextTrigger;
  /** Scrambles and decodes again after a pause. */
  loop?: boolean;
  /** Milliseconds between loops. */
  loopDelay?: number;
  /** Element used as the root. */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  /** Called each time every character has locked in. */
  onComplete?: () => void;
  /** Classes for the scrambling glyphs. Defaults to the accent blue. */
  scrambleClassName?: string;
  /** Replays the decode every `loopDelay` ms until someone hovers, focuses or clicks it. */
  autoplay?: boolean;
}

const isGap = (c: string) => c === " " || c === "\n" || c === "\t";

/**
 * Text that decodes itself. Every unlocked character shuffles through a charset in a fixed-width
 * cell (so the line never jitters), then a lock wave runs left to right and each character drops
 * into place with a spring pop. Glyphs are written straight to the DOM, so the scramble costs no
 * React renders.
 */
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
  scrambleClassName,
  autoplay = false,
}: EncryptedTextProps) {
  const still = useReducedMotion() === true;
  const root = React.useRef<HTMLElement>(null);
  const finals = React.useRef<(HTMLSpanElement | null)[]>([]);
  const glyphs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const touched = React.useRef(false);
  const stopRun = React.useRef<() => void>(() => {});
  const cfg = React.useRef({
    speed,
    shuffleSpeed,
    iterations,
    characters,
    loop,
    loopDelay,
    onComplete,
    autoplay,
  });
  React.useEffect(() => {
    cfg.current = {
      speed,
      shuffleSpeed,
      iterations,
      characters,
      loop,
      loopDelay,
      onComplete,
      autoplay,
    };
  });
  const inView = useInView(root, { once: !(loop || autoplay), amount: 0.3 });
  const chars = React.useMemo(() => Array.from(text), [text]);
  const scrambledAtRest = trigger === "load" || trigger === "viewport";

  const showFinal = React.useCallback(() => {
    finals.current.forEach((el) => {
      if (el) el.style.opacity = "1";
    });
    glyphs.current.forEach((el) => {
      if (el) el.style.opacity = "0";
    });
  }, []);

  const play = React.useCallback(() => {
    const start = () => {
      stopRun.current();
      const {
        speed: sp,
        shuffleSpeed: ss,
        iterations: it,
        characters: cs,
      } = cfg.current;
      const set = cs.length ? cs : DEFAULT_CHARSET;
      const pick = () => set[Math.floor(Math.random() * set.length)] ?? "#";
      const open = chars
        .map((c, i) => (isGap(c) ? -1 : i))
        .filter((i) => i >= 0);
      let dead = false;
      const timers: ReturnType<typeof setTimeout>[] = [];
      const pops: { stop: () => void }[] = [];
      open.forEach((i) => {
        const f = finals.current[i];
        const g = glyphs.current[i];
        if (f) f.style.opacity = "0";
        if (g) {
          g.style.opacity = "0.85";
          g.textContent = pick();
        }
      });
      const locked = new Set<number>();
      const shuffle = setInterval(
        () => {
          open.forEach((i) => {
            if (locked.has(i)) return;
            const g = glyphs.current[i];
            if (g) g.textContent = pick();
          });
        },
        Math.max(16, ss),
      );
      let k = 0;
      let lockTimer: ReturnType<typeof setInterval> | undefined;
      timers.push(
        setTimeout(
          () => {
            lockTimer = setInterval(
              () => {
                if (dead) return;
                const i = open[k++];
                if (i === undefined) {
                  clearInterval(lockTimer);
                  clearInterval(shuffle);
                  cfg.current.onComplete?.();
                  const { loop: lp, loopDelay: ld, autoplay: ap } = cfg.current;
                  if (lp || (ap && !touched.current))
                    timers.push(
                      setTimeout(() => !dead && start(), Math.max(0, ld)),
                    );
                  return;
                }
                locked.add(i);
                const f = finals.current[i];
                const g = glyphs.current[i];
                if (g) g.style.opacity = "0";
                if (f) {
                  f.style.opacity = "1";
                  pops.push(
                    animate(
                      f,
                      { y: ["-0.28em", "0em"], scale: [1.32, 1] },
                      { type: "spring", stiffness: 620, damping: 17 },
                    ),
                  );
                }
              },
              Math.max(8, sp),
            );
          },
          Math.max(0, it) * Math.max(16, ss),
        ),
      );
      stopRun.current = () => {
        dead = true;
        clearInterval(shuffle);
        if (lockTimer) clearInterval(lockTimer);
        timers.forEach(clearTimeout);
        pops.forEach((p) => p.stop());
      };
    };
    start();
  }, [chars]);

  // Clean everything up when the text changes or the component goes away.
  const pending = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(
    () => () => {
      clearTimeout(pending.current);
      stopRun.current();
    },
    [chars],
  );

  React.useEffect(() => {
    if (still) {
      showFinal();
      return;
    }
    if (trigger === "load" || (trigger === "viewport" && inView)) {
      const t = setTimeout(play, Math.max(0, revealDelay));
      return () => clearTimeout(t);
    }
    if ((trigger === "hover" || trigger === "click") && autoplay) {
      const t = setTimeout(play, Math.max(0, revealDelay) + 600);
      return () => clearTimeout(t);
    }
  }, [still, trigger, inView, revealDelay, play, showFinal, autoplay]);

  const interact = () => {
    touched.current = true;
    if (still) return;
    clearTimeout(pending.current);
    pending.current = setTimeout(play, Math.max(0, revealDelay));
  };

  const groups = React.useMemo(() => {
    const out: { start: number; chars: string[]; gap: boolean }[] = [];
    chars.forEach((c, i) => {
      const gap = isGap(c);
      const last = out[out.length - 1];
      if (last && last.gap === gap && !gap) last.chars.push(c);
      else out.push({ start: i, chars: [c], gap });
    });
    return out;
  }, [chars]);

  const interactive = trigger === "hover" || trigger === "click";

  return (
    <Tag
      ref={root as React.Ref<never>}
      aria-label={trigger === "click" ? text : undefined}
      role={trigger === "click" ? "button" : undefined}
      tabIndex={trigger === "click" ? 0 : undefined}
      onPointerEnter={
        trigger === "hover"
          ? interact
          : () => {
              touched.current = true;
            }
      }
      onFocus={trigger === "hover" ? interact : undefined}
      onClick={trigger === "click" ? interact : undefined}
      onKeyDown={
        trigger === "click"
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                interact();
              }
            }
          : undefined
      }
      className={cn(
        "font-mono whitespace-pre-wrap",
        interactive &&
          "cursor-pointer rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]",
        className,
      )}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {groups.map((g) =>
          g.gap ? (
            <React.Fragment key={`${text}-g${g.start}`}>
              {g.chars.join("")}
            </React.Fragment>
          ) : (
            <span
              key={`${text}-w${g.start}`}
              className="inline-block whitespace-nowrap"
            >
              {g.chars.map((c, k) => {
                const i = g.start + k;
                return (
                  <span key={i} className="relative inline-block">
                    <span
                      ref={(el) => {
                        finals.current[i] = el;
                      }}
                      className="inline-block"
                      style={{ opacity: scrambledAtRest ? 0 : 1 }}
                    >
                      {c}
                    </span>
                    <span
                      ref={(el) => {
                        glyphs.current[i] = el;
                      }}
                      className={cn(
                        "pointer-events-none absolute inset-0 flex select-none justify-center font-mono [text-shadow:0_0_8px_currentColor]",
                        scrambleClassName ??
                          "text-[#0071e3] dark:text-[#0a84ff]",
                      )}
                      style={{ opacity: scrambledAtRest ? 0.85 : 0 }}
                    >
                      {scrambledAtRest
                        ? DEFAULT_CHARSET[(i * 7 + 3) % DEFAULT_CHARSET.length]
                        : ""}
                    </span>
                  </span>
                );
              })}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
