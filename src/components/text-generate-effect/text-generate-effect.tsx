"use client";

import * as React from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type TextGenerateMode = "word" | "character" | "line";
export type TextGenerateAs = "p" | "h1" | "h2" | "span" | "div";
export type TextGenerateTrigger = "mount" | "viewport";

export type TextGenerateEffectProps = {
  /** The text to stream in. Use \n for line breaks (and as the separator in line mode). */
  text: string;
  /** What arrives on each beat: whole words, single characters, or lines. */
  mode?: TextGenerateMode;
  /** Seconds before the first token arrives. */
  delay?: number;
  /** Seconds each token takes to settle. Sets the spring's speed. */
  duration?: number;
  /** Seconds between tokens. */
  stagger?: number;
  /** Tokens arrive out of a blur. */
  blur?: boolean;
  /** With trigger="viewport": play once (true) or every time it scrolls into view (false). */
  once?: boolean;
  className?: string;
  /** Element used as the root. */
  as?: TextGenerateAs;
  /** Tokens rise into place, overshooting a touch. */
  lift?: boolean;
  /** Start on mount, or when the text scrolls into view. */
  trigger?: TextGenerateTrigger;
  /** Change this value to replay the effect. */
  replayKey?: string | number;
  /** Shows a glowing caret that rides on the newest token while text streams in. */
  showCaret?: boolean;
  /** Called when the last token has arrived. */
  onComplete?: () => void;
  /** Dissolves and regenerates every few seconds until someone clicks or taps the text. */
  autoplay?: boolean;
};

type Token = { key: string; value: string; index: number };
type Group = { key: string; tokens: Token[]; space: string; br: boolean };

/** Splits text into groups that never break inside a word; each group holds one or more tokens. */
function tokenize(text: string, mode: TextGenerateMode): { groups: Group[]; count: number } {
  let n = 0;
  if (mode === "line") {
    const groups = text.split("\n").map((line, i) => ({
      key: `l${i}`,
      tokens: [{ key: `l${i}`, value: line, index: n++ }],
      space: "",
      br: false,
    }));
    return { groups, count: n };
  }
  const groups: Group[] = [];
  const parts = text.split(/(\s+)/);
  parts.forEach((part, i) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      const last = groups[groups.length - 1];
      if (!last) return;
      if (part.includes("\n")) last.br = true;
      else last.space = " ";
      return;
    }
    const tokens =
      mode === "character"
        ? Array.from(part).map((ch, k) => ({ key: `c${i}-${k}`, value: ch, index: n++ }))
        : [{ key: `w${i}`, value: part, index: n++ }];
    groups.push({ key: `g${i}`, tokens, space: "", br: false });
  });
  return { groups, count: n };
}

type Spring = { stiffness: number; damping: number; mass: number };

function TokenSpan({
  token,
  progress,
  spring,
  blur,
  lift,
  block,
  register,
}: {
  token: Token;
  progress: MotionValue<number>;
  spring: Spring;
  blur: boolean;
  lift: boolean;
  block: boolean;
  register: (i: number, el: HTMLSpanElement | null) => void;
}) {
  const on = useTransform(progress, (p): number => (p > token.index ? 1 : 0));
  const s = useSpring(on, spring);
  const opacity = useTransform(s, (v) => Math.max(0, Math.min(1, v * 1.4)));
  const y = useTransform(s, (v) => (lift ? `${((1 - v) * 0.42).toFixed(3)}em` : "0em"));
  const filter = useTransform(s, (v) => (blur ? `blur(${(Math.max(0, 1 - v) * 9).toFixed(2)}px)` : "none"));
  return (
    <motion.span
      ref={(el) => register(token.index, el)}
      className={block ? "block" : "inline-block"}
      style={{ opacity, y, filter, willChange: "transform, opacity, filter" }}
    >
      {token.value}
    </motion.span>
  );
}

/**
 * Text that streams in like a model writing it: each token springs up out of a blur on its own
 * beat, overshooting a hair before it settles, while a glowing caret rides on the newest token.
 * One motion value drives the whole run, so React does not re-render per token.
 */
export function TextGenerateEffect({
  text,
  mode = "word",
  delay = 0,
  duration = 0.48,
  stagger = 0.06,
  blur = true,
  once = true,
  className,
  as = "p",
  lift = true,
  trigger = "mount",
  replayKey,
  showCaret = true,
  onComplete,
  autoplay = false,
}: TextGenerateEffectProps) {
  const still = useReducedMotion() === true;
  const Tag = as;
  const { groups, count } = React.useMemo(() => tokenize(text, mode), [text, mode]);
  const root = React.useRef<HTMLElement>(null);
  const els = React.useRef<(HTMLSpanElement | null)[]>([]);
  const touched = React.useRef(false);
  const done = React.useRef(onComplete);
  React.useEffect(() => {
    done.current = onComplete;
  }, [onComplete]);
  const inView = useInView(root, { once, amount: 0.35 });
  const progress = useMotionValue(0);

  const w = (2 * Math.PI) / Math.max(0.12, duration);
  const spring = React.useMemo<Spring>(() => ({ stiffness: Math.round(w * w), damping: Math.round(2 * 0.52 * w * 10) / 10, mass: 1 }), [w]);

  const register = React.useCallback((i: number, el: HTMLSpanElement | null) => {
    els.current[i] = el;
  }, []);

  // Caret: rides on the right edge of the newest token. Positions are read from layout when progress moves.
  const caretX = useMotionValue(0);
  const caretY = useMotionValue(0);
  const caretH = useMotionValue(0);
  const caretO = useMotionValue(0);
  const sx = useSpring(caretX, { stiffness: 520, damping: 38 });
  const sy = useSpring(caretY, { stiffness: 520, damping: 38 });
  const so = useSpring(caretO, { stiffness: 260, damping: 30 });

  React.useEffect(() => {
    const place = (p: number) => {
      const i = Math.min(count, Math.floor(p)) - 1;
      const el = els.current[Math.max(0, i)];
      if (!el) return;
      const x = el.offsetLeft + (i < 0 ? 0 : el.offsetWidth) + 3;
      const first = caretO.get() === 0;
      caretX.set(x);
      caretY.set(el.offsetTop);
      caretH.set(el.offsetHeight);
      if (first) {
        sx.jump(x);
        sy.jump(el.offsetTop);
      }
      caretO.set(p > 0 && p < count ? 1 : 0);
    };
    return progress.on("change", place);
  }, [count, progress, caretX, caretY, caretH, caretO, sx, sy]);

  const shouldPlay = trigger === "viewport" ? inView : true;

  React.useEffect(() => {
    if (still) {
      progress.jump(count);
      return;
    }
    if (!shouldPlay) {
      if (trigger === "viewport" && !once) progress.jump(0);
      return;
    }
    let run: AnimationPlaybackControls | undefined;
    let t: ReturnType<typeof setTimeout> | undefined;
    const play = (wait: number) => {
      run = animate(progress, count + 0.001, {
        delay: wait,
        duration: Math.max(0.01, count * Math.max(0, stagger)),
        ease: "linear",
        onComplete: () => {
          done.current?.();
          if (!autoplay || touched.current) return;
          t = setTimeout(() => {
            if (touched.current) return;
            progress.set(0);
            play(0.7);
          }, 2600);
        },
      });
    };
    progress.jump(0);
    play(Math.max(0, delay));
    return () => {
      run?.stop();
      if (t) clearTimeout(t);
    };
  }, [still, shouldPlay, trigger, once, count, stagger, delay, autoplay, replayKey, progress]);

  return (
    <Tag
      ref={root as React.Ref<never>}
      className={cn("relative whitespace-pre-wrap", className)}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={mode === "line" ? "block" : "inline"}>
        {groups.map((g) => (
          <React.Fragment key={g.key}>
            {mode === "line" ? (
              still ? (
                <span className="block">{g.tokens[0]?.value}</span>
              ) : (
                <TokenSpan token={g.tokens[0]!} progress={progress} spring={spring} blur={blur} lift={lift} block register={register} />
              )
            ) : (
              <span className="inline-block whitespace-nowrap">
                {g.tokens.map((tk) =>
                  still ? (
                    <span key={tk.key}>{tk.value}</span>
                  ) : (
                    <TokenSpan key={tk.key} token={tk} progress={progress} spring={spring} blur={blur} lift={lift} block={false} register={register} />
                  ),
                )}
              </span>
            )}
            {g.space}
            {g.br ? <br /> : null}
          </React.Fragment>
        ))}
      </span>
      {showCaret && !still ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 w-[0.42em] rounded-full bg-gradient-to-b from-[#0071e3] to-[#bf5af2] shadow-[0_0_14px_rgba(0,113,227,.55)] dark:from-[#0a84ff] dark:shadow-[0_0_14px_rgba(10,132,255,.6)]"
          style={{ x: sx, y: sy, height: caretH, opacity: so, scaleY: 0.72 }}
        />
      ) : null}
    </Tag>
  );
}
