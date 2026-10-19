"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface RotatingHeadlineProps {
  lead?: string;
  words?: string[];
  sub?: string;
  accent?: string;
  interval?: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function RotatingHeadline({
  lead = "Built to",
  words = ["move.", "delight.", "last.", "ship."],
  sub = "Every word arrives on its own beat. The last one keeps changing.",
  accent = "#0071e3",
  interval = 2000,
}: RotatingHeadlineProps) {
  const [run, setRun] = useState(0);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const leadWords = lead.split(" ");
  const subWords = sub.split(" ");

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <h2 key={`h${run}`} className="m-0 flex flex-wrap items-baseline justify-center gap-x-[0.25em] text-[56px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        {leadWords.map((w, k) => (
          <motion.span
            key={w + k}
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.1 + k * 0.12 }}
            className="inline-block"
          >
            {w}
          </motion.span>
        ))}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative inline-flex overflow-hidden pb-[0.08em]"
          style={{ color: accent }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={words[i]}
              initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="inline-block"
            >
              {words[i]}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </h2>

      <p key={`p${run}`} className="m-0 max-w-[360px] text-[17px] leading-[1.45] tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]">
        {subWords.map((w, k) => (
          <motion.span
            key={w + k}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease, delay: 0.6 + k * 0.035 }}
            className="inline-block whitespace-pre"
          >
            {w}{k < subWords.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </p>

      <motion.button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        className="relative overflow-hidden rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)]"
          animate={{ x: ["0%", "400%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
        />
        <span className="relative">Replay reveal</span>
      </motion.button>
    </div>
  );
}
