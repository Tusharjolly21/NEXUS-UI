"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextGenerateMode = "word" | "character" | "line";
export type TextGenerateAs = "p" | "h1" | "h2" | "span" | "div";
export type TextGenerateTrigger = "mount" | "viewport";

type Segment = {
  id: string;
  value: string;
  kind: "token" | "space" | "newline";
  animIndex: number | null;
};

function tokenizeText(text: string, mode: TextGenerateMode): Segment[] {
  if (mode === "line") {
    const lines = text.split("\n");
    return lines.flatMap((line, idx) => {
      const base: Segment = {
        id: `line-${idx}`,
        value: line,
        kind: "token",
        animIndex: idx,
      };
      if (idx === lines.length - 1) return [base];
      return [base, { id: `line-br-${idx}`, value: "\n", kind: "newline", animIndex: null }];
    });
  }

  if (mode === "character") {
    let anim = 0;
    return Array.from(text).map((ch, idx) => {
      if (ch === "\n") {
        return { id: `ch-br-${idx}`, value: ch, kind: "newline", animIndex: null } satisfies Segment;
      }
      if (/\s/.test(ch)) {
        return { id: `ch-sp-${idx}`, value: ch, kind: "space", animIndex: null } satisfies Segment;
      }
      const seg: Segment = { id: `ch-${idx}`, value: ch, kind: "token", animIndex: anim };
      anim += 1;
      return seg;
    });
  }

  // mode: "word"
  let anim = 0;
  const raw = text.split(/(\s+)/);
  const out: Segment[] = [];
  raw.forEach((part, partIdx) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      Array.from(part).forEach((ch, chIdx) => {
        out.push(
          ch === "\n"
            ? { id: `wd-br-${partIdx}-${chIdx}`, value: ch, kind: "newline", animIndex: null }
            : { id: `wd-sp-${partIdx}-${chIdx}`, value: ch, kind: "space", animIndex: null },
        );
      });
      return;
    }
    out.push({ id: `wd-${partIdx}`, value: part, kind: "token", animIndex: anim });
    anim += 1;
  });
  return out;
}

export type TextGenerateEffectProps = {
  text: string;
  mode?: TextGenerateMode;
  delay?: number;
  duration?: number;
  stagger?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
  as?: TextGenerateAs;
  lift?: boolean;
  trigger?: TextGenerateTrigger;
  replayKey?: string | number;
};

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
}: TextGenerateEffectProps) {
  const reduceMotion = useReducedMotion() === true;
  const Tag = as;
  const segments = React.useMemo(() => tokenizeText(text, mode), [text, mode]);

  const tokenBaseClass = mode === "line" ? "block" : "inline";

  return (
    <Tag className={cn("relative whitespace-pre-wrap", className)}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        className={cn("whitespace-pre-wrap", mode === "line" ? "block" : "inline")}
        key={replayKey ?? "default"}
      >
        {segments.map((segment) => {
          if (segment.kind === "newline") return <br key={segment.id} />;
          if (segment.kind === "space" || segment.animIndex === null || reduceMotion) {
            return (
              <span key={segment.id} className={tokenBaseClass}>
                {segment.value}
              </span>
            );
          }

          const animation = {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          };
          const initial = {
            opacity: 0,
            y: lift ? 10 : 0,
            filter: blur ? "blur(8px)" : "blur(0px)",
          };
          const transition = {
            duration: Math.max(0.12, duration),
            delay: Math.max(0, delay) + segment.animIndex * Math.max(0, stagger),
            ease: [0.22, 1, 0.36, 1] as const,
          };

          if (trigger === "viewport") {
            return (
              <motion.span
                key={segment.id}
                className={tokenBaseClass}
                initial={initial}
                whileInView={animation}
                viewport={{ once, amount: 0.35 }}
                transition={transition}
              >
                {segment.value}
              </motion.span>
            );
          }

          return (
            <motion.span
              key={segment.id}
              className={tokenBaseClass}
              initial={initial}
              animate={animation}
              transition={transition}
            >
              {segment.value}
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}
