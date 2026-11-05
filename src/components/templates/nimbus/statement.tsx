"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { BLUE, FAINT, INK } from "./theme";

const STATEMENT =
  "Most weather apps tell you it might rain today. Nimbus tells you it will start at 4:12 on your street, and stop eleven minutes later.";
const WORDS = STATEMENT.split(" ");

/** Thirty-six slices of the afternoon: slices 12 to 23 are the shower. Heights are 0..1, rounded so server and browser print identical styles. */
const RAIN_SLICES = Array.from({ length: 36 }, (_, i) =>
  i >= 12 && i <= 23 ? Math.round((0.3 + Math.sin(((i - 12) / 11) * Math.PI) * 0.62 + (i % 3) * 0.03) * 100) / 100 : 0.05,
);

/** One word of the statement: it turns from pale grey to black as the scroll progress passes it. */
function Word({ word, progress, at }: { word: string; progress: MotionValue<number>; at: number }) {
  const color = useTransform(progress, [at - 0.06, at + 0.02], ["#d2d2d7", INK]);
  return <motion.span style={{ color }}>{word} </motion.span>;
}

/** One bar of the rain chart: it springs up from the baseline when the playhead reaches it. */
function Bar({ height, index, progress, rain }: { height: number; index: number; progress: MotionValue<number>; rain: boolean }) {
  const start = (index / RAIN_SLICES.length) * 0.92;
  const scaleY = useSpring(useTransform(progress, [start, start + 0.06], [0.04, 1]), { stiffness: 220, damping: 20 });
  return (
    <motion.span
      className="block flex-1 origin-bottom rounded-[3px]"
      style={{ height: `${height * 100}%`, scaleY, background: rain ? "linear-gradient(180deg,#5ac8fa,#0071e3)" : "#e5e5ea" }}
    />
  );
}

/** A rain chart whose bars rise left to right behind a blue playhead as the statement above it is read. */
function RainChart({ progress }: { progress: MotionValue<number> }) {
  const playheadLeft = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div className="mt-16" role="img" aria-label="Rain from 16:12 to 16:23">
      <div className="relative flex h-32 items-end gap-[3px] sm:gap-[6px]">
        {RAIN_SLICES.map((height, i) => (
          <Bar key={i} height={height} index={i} progress={progress} rain={i >= 12 && i <= 23} />
        ))}
        <motion.div
          className="pointer-events-none absolute bottom-0 top-0 w-px"
          style={{ left: playheadLeft, background: `linear-gradient(${BLUE}00, ${BLUE})` }}
        />
      </div>
      <div className="relative mt-3 h-5 text-[13px] tabular-nums" style={{ color: FAINT }}>
        <span className="absolute left-0">16:00</span>
        <span className="absolute font-semibold" style={{ left: "33.3%", color: BLUE, transform: "translateX(-50%)" }}>
          16:12
        </span>
        <span className="absolute font-semibold" style={{ left: "65%", color: BLUE, transform: "translateX(-50%)" }}>
          16:23
        </span>
        <span className="absolute right-0">16:35</span>
      </div>
    </div>
  );
}

/** A large statement that fills in word by word as you scroll, followed by the rain chart it describes. */
export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  return (
    <section className="px-5 py-32 sm:py-44">
      <div ref={ref} className="mx-auto max-w-[920px]">
        <p className="m-0 font-semibold leading-[1.12] tracking-[-0.035em]" style={{ fontSize: "clamp(30px, 4.4vw, 52px)" }}>
          {WORDS.map((word, i) => (
            <Word key={i} word={word} progress={scrollYProgress} at={i / WORDS.length} />
          ))}
        </p>
        <RainChart progress={scrollYProgress} />
      </div>
    </section>
  );
}
