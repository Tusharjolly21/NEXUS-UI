"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { COMMENTS } from "@/components/home/reddit-love";

/** The headline block drifts up, fades and softens as the page scrolls away from it. */
export function HeroCopy({ children, className, blur: softens = true }: { children: React.ReactNode; className?: string; blur?: boolean }) {
  const reduce = !!useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], reduce ? [0, 0] : [0, -120]);
  const opacity = useTransform(scrollY, [0, 520], reduce ? [1, 1] : [1, 0]);
  const blur = useTransform(scrollY, [0, 520], reduce ? ["blur(0px)", "blur(0px)"] : ["blur(0px)", "blur(8px)"]);
  // `blur: false` for the tile column: a blur filter over that many live components makes scrolling heavy.
  return (
    <motion.div style={softens ? { y, opacity, filter: blur } : { y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

/** Short comments only, so one fits on a line under the buttons. */
const QUOTES = COMMENTS.filter((c) => c.quote.length <= 90).slice(0, 8);
const FACES = COMMENTS.slice(0, 5);
/** Soft backdrops behind the drawn faces, from the Nexus spectrum. */
const FACE_TINTS = ["#d6ecff", "#e4e0ff", "#f3e3ff", "#ffe0e7", "#dff5e8"];

/** A row of commenters' initials and one of their comments, changing every few seconds. */
export function HeroProof() {
  const reduce = !!useReducedMotion();
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (reduce || QUOTES.length < 2) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") setI((n) => (n + 1) % QUOTES.length);
    }, 4200);
    return () => clearInterval(t);
  }, [reduce]);

  const q = QUOTES[i];
  if (!q) return null;
  const handle = q.platform === "x" ? `@${q.user}` : q.platform === "instagram" ? q.user : `u/${q.user}`;

  return (
    <a
      href="#love"
      className="group mx-auto mt-8 flex w-fit lg:mx-0 lg:-ml-1.5 max-w-full items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="flex shrink-0 -space-x-2.5" aria-hidden>
        {FACES.map((c, i) => (
          <span
            key={c.id ?? c.user}
            className="relative size-8 overflow-hidden rounded-full ring-2 ring-background"
            style={{ background: FACE_TINTS[i % FACE_TINTS.length] }}
          >
            {/* hand-drawn faces (Notionists, CC0): generic illustrations, not likenesses of the commenters */}
            <Image src={`/avatars/face-${i % 6}.svg`} alt="" width={32} height={32} className="size-full translate-y-[2px] scale-110" />
          </span>
        ))}
      </span>
      <span className="relative min-w-0 overflow-hidden text-[13.5px] leading-snug">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            className="block truncate"
            initial={reduce ? false : { y: 12, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? undefined : { y: -12, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
          >
            <span className="text-foreground">&ldquo;{q.quote}&rdquo;</span>{" "}
            <span className="text-muted-foreground">
              {handle}, {q.source}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
    </a>
  );
}
