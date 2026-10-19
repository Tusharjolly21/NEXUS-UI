"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    ta.remove();
  }
}

export interface CopyChipProps {
  value: string;
  display?: string;
  label?: string;
  accent?: string;
  /** Clicks itself every few seconds until the user interacts. */
  autoplay?: boolean;
}

/** An ID chip: the icon morphs to a check, a tooltip pops above, the text flashes. */
export function CopyChip({ value, display, label = "Copy", accent = "#0071e3", autoplay = false }: CopyChipProps) {
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const touched = useRef(false);

  const copy = async (real = true) => {
    if (real) await writeClipboard(value);
    setCopied(true);
    setBurst((b) => b + 1);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => !touched.current && copy(false), 3200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="relative inline-flex">
      <AnimatePresence>
        {copied && (
          <motion.span
            key={burst}
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2.5 py-1 text-[12px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
          >
            Copied
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => { touched.current = true; copy(); }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${label} ${value}`}
        className="relative flex h-11 items-center gap-2.5 overflow-hidden rounded-xl bg-white pl-3.5 pr-2.5 shadow-[0_0_0_1px_rgba(0,0,0,.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.16)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent }}
      >
        <AnimatePresence>
          {copied && (
            <motion.span key={burst} className="absolute inset-0" style={{ background: accent }} initial={{ opacity: 0.18, clipPath: "circle(0% at 90% 50%)" }} animate={{ opacity: 0, clipPath: "circle(140% at 90% 50%)" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
          )}
        </AnimatePresence>
        <span className="relative text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>
          {display ?? value}
        </span>
        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f0f3] [--cc-icon:#6e6e73] dark:bg-[#3a3a3c] dark:[--cc-icon:#a1a1a6]" style={{ color: copied ? accent : "var(--cc-icon)" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {copied ? (
              <motion.svg key="check" initial={{ scale: 0.4, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 20 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25, delay: 0.05 }} />
              </motion.svg>
            ) : (
              <motion.svg key="copy" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, rotate: 45, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 22 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="8" y="8" width="12" height="12" rx="2.5" />
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  );
}

/** A command line with a label that rolls from "Copy" to "Copied". */
export function CopyCommand({ command, autoplay = false }: { command: string; autoplay?: boolean }) {
  const [copied, setCopied] = useState(false);
  const touched = useRef(false);
  const go = async (real = true) => {
    if (real) await writeClipboard(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => !touched.current && go(false), 1600);
    const t = setInterval(() => !touched.current && go(false), 3200);
    return () => { clearTimeout(a); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);
  return (
    <div className="flex h-12 w-full max-w-[360px] items-center gap-3 rounded-2xl bg-[#1d1d1f] pl-4 pr-1.5 text-white dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
      <span className="text-white/40" aria-hidden="true">$</span>
      <code className="min-w-0 flex-1 truncate text-[14px]" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>{command}</code>
      <motion.button
        type="button"
        layout
        onClick={() => { touched.current = true; go(); }}
        whileTap={{ scale: 0.94 }}
        animate={{ backgroundColor: copied ? "#34c759" : "rgba(255,255,255,0.12)" }}
        className="flex h-9 items-center overflow-hidden rounded-xl px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={copied ? "y" : "n"} layout initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 30 }}>
            {copied ? "Copied" : "Copy"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export function CopyDemo({ autoplay = false }: { autoplay?: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <CopyChip value="inv_3fK9xQ2Lq7" display="inv_3fK9…2Lq7" autoplay={autoplay} />
      <CopyCommand command="npm i framer-motion" autoplay={autoplay} />
    </div>
  );
}
