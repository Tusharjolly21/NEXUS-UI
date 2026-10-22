"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const PW = 280;
const PH = 104;

export interface ReceiptLine {
  label: string;
  amount: string;
}

export interface ReceiptUnfoldProps {
  lines?: ReceiptLine[];
  total?: string;
  /** Opens and folds by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const LINES: ReceiptLine[] = [
  { label: "Pro plan · October", amount: "$18.00" },
  { label: "Extra seats × 3", amount: "$24.00" },
  { label: "Storage add-on", amount: "$4.00" },
  { label: "Tax", amount: "$3.68" },
];

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-[#fffdf8] px-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_24px_-14px_rgba(0,0,0,.25)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.07),0_14px_24px_-14px_rgba(0,0,0,.7)] ${className}`}
      style={{ backfaceVisibility: "hidden" }}
    >
      {children}
    </div>
  );
}

/**
 * Press "Get invoice" and a folded slip rises out of the row, then unfolds
 * panel by panel like a paper receipt. The total gets circled by hand last.
 */
export function ReceiptUnfold({ lines = LINES, total = "$49.68", autoplay = false, enableSound = true }: ReceiptUnfoldProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(0); // 0 closed, 1 risen, 2 first fold, 3 second fold
  const touched = useRef(false);
  const timers = useRef<number[]>([]);

  const run = useCallback((to: boolean) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setOpen(to);
    if (to) {
      setStage(1);
      timers.current.push(window.setTimeout(() => setStage(2), 380));
      timers.current.push(window.setTimeout(() => setStage(3), 760));
    } else {
      setStage(2);
      timers.current.push(window.setTimeout(() => setStage(1), 260));
      timers.current.push(window.setTimeout(() => setStage(0), 520));
    }
  }, []);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    if (!autoplay) return;
    const pending = timers;
    let o = false;
    const a = setTimeout(() => {
      if (!touched.current) {
        o = true;
        playRef.current.auto("whoosh");
        run(true);
      }
    }, 800);
    const t = setInterval(() => {
      if (!touched.current) {
        o = !o;
        playRef.current.auto(o ? "whoosh" : "swipe", o ? 1 : 0.6);
        run(o);
      }
    }, 4200);
    return () => {
      clearTimeout(a);
      clearInterval(t);
      pending.current.forEach(clearTimeout);
    };
  }, [autoplay, run]);

  const fold = { type: "spring", stiffness: 140, damping: 17 } as const;

  return (
    <div className="flex flex-col items-center" style={{ perspective: 1200 }}>
      <div className="relative" style={{ width: PW, height: PH * 3 + 10 }}>
        {/* The slip. Bottom panel sits on the row; two more panels hinge up off its top edge. */}
        <motion.div
          className="absolute bottom-0 left-0"
          style={{ width: PW, height: PH, transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ y: stage >= 1 ? -6 : PH + 10, opacity: stage >= 1 ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          <Panel className="flex flex-col justify-center gap-1.5 rounded-b-[6px] border-t border-dashed border-[#e3dccb] dark:border-[#48484a]">
            <div className="flex items-baseline justify-between text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span>Total</span>
              <span className="relative tabular-nums">
                {total}
                <svg className="pointer-events-none absolute -left-3 -top-2.5 overflow-visible" width="76" height="34" viewBox="0 0 76 34" aria-hidden="true">
                  <motion.path
                    d="M8 18 C 6 6, 64 2, 70 14 C 75 26, 20 34, 6 24 C 0 19, 10 10, 22 9"
                    fill="none"
                    className="stroke-[#ff3b30] dark:stroke-[#ff453a]"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ pathLength: stage === 3 ? 1 : 0, opacity: stage === 3 ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: stage === 3 ? 0.45 : 0, ease: [0.65, 0, 0.35, 1] }}
                  />
                </svg>
              </span>
            </div>
            <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">Paid with Visa ending 4242 · Oct 19</span>
          </Panel>

          {/* middle panel, hinged on the top edge of the bottom panel */}
          <motion.div
            className="absolute left-0"
            style={{ width: PW, height: PH, bottom: PH, originY: 1, transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateX: stage >= 2 ? 0 : -178 }}
            transition={fold}
          >
            <Panel className="flex flex-col justify-center gap-2">
              {lines.map((l) => (
                <div key={l.label} className="flex justify-between text-[12px] text-[#424245] dark:text-[#a1a1a6]">
                  <span>{l.label}</span>
                  <span className="tabular-nums">{l.amount}</span>
                </div>
              ))}
            </Panel>
            <div className="absolute inset-0 bg-[#f1ece0] dark:bg-[#3a3a3c]" style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }} />

            {/* top panel, hinged on the top edge of the middle panel */}
            <motion.div
              className="absolute left-0"
              style={{ width: PW, height: PH, bottom: PH, originY: 1, transformStyle: "preserve-3d" }}
              initial={false}
              animate={{ rotateX: stage >= 3 ? 0 : -178 }}
              transition={fold}
            >
              <Panel className="flex flex-col justify-end gap-1 rounded-t-[6px] pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">Invoice #2026-1019</span>
                <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Northwind Studio</span>
                <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">Billed to Alex Rivera</span>
              </Panel>
              <div className="absolute inset-0 rounded-t-[6px] bg-[#f1ece0] dark:bg-[#3a3a3c]" style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* The settings row it comes out of */}
      <motion.button
        type="button"
        onClick={() => {
          touched.current = true;
          play(open ? "swipe" : "whoosh", open ? 0.6 : 1);
          run(!open);
        }}
        aria-expanded={open}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 flex h-14 w-[320px] items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06),0_10px_30px_-18px_rgba(0,0,0,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_30px_-18px_rgba(0,0,0,.8)] dark:focus-visible:outline-[#0a84ff]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34c759] text-white dark:bg-[#30d158]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21zM10 8h4M10 12h4" />
          </svg>
        </span>
        <span className="flex-1 text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={String(open)} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
              {open ? "Hide invoice" : "Get invoice"}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.svg
          animate={{ rotate: open ? -90 : 0 }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#86868b] dark:text-[#8e8e93]"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </motion.svg>
      </motion.button>
    </div>
  );
}
