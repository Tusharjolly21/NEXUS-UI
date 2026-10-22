"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const RECENT = ["Quarterly report", "Design review notes", "Onboarding checklist", "Brand colours", "Hiring plan"];
const MAX_QUERY = 64;

export interface SeekSearchProps {
  /** Local suggestions shown under the field and filtered as you type. Nothing is fetched. */
  suggestions?: string[];
  /** Placeholder and accessible name of the field. */
  placeholder?: string;
  /** Longest query the field accepts (characters). */
  maxLength?: number;
  /** Called with a suggestion when it is clicked. */
  onSelect?: (suggestion: string) => void;
  /** Opens, types "design", clears and folds back on a loop until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** Splits `text` around the first case-insensitive match of `term`. */
function Highlight({ text, term }: { text: string; term: string }) {
  const at = text.toLowerCase().indexOf(term.toLowerCase());
  if (!term || at < 0) return <>{text}</>;
  return (
    <span>
      {text.slice(0, at)}
      <b className="font-semibold">{text.slice(at, at + term.length)}</b>
      {text.slice(at + term.length)}
    </span>
  );
}

/**
 * Search that opens as one object. The magnifier slides from the middle of
 * the button to the start of the field while the pill widens around it; the
 * suggestions drop in underneath and filter as you type. Escape, or clicking
 * away when it's empty, folds it back.
 */
export function SeekSearch({ suggestions = RECENT, placeholder = "Search files", maxLength = MAX_QUERY, onSelect, autoplay = false, enableSound = true }: SeekSearchProps) {
  const play = useSound(enableSound);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const term = q.trim().slice(0, maxLength);
  const list = suggestions.filter((r) => r.toLowerCase().includes(term.toLowerCase()));

  useEffect(() => {
    if (open && touched.current) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!autoplay) return;
    const word = "design";
    const timers: number[] = [];
    const run = () => {
      if (touched.current) return;
      timers.push(window.setTimeout(() => !touched.current && setOpen(true), 300));
      word.split("").forEach((_, i) => timers.push(window.setTimeout(() => !touched.current && setQ(word.slice(0, i + 1)), 1100 + i * 110)));
      timers.push(window.setTimeout(() => !touched.current && setQ(""), 3000));
      timers.push(window.setTimeout(() => !touched.current && setOpen(false), 3600));
    };
    run();
    const t = window.setInterval(run, 5000);
    return () => {
      clearInterval(t);
      timers.forEach(clearTimeout);
    };
  }, [autoplay]);

  const close = () => {
    setOpen(false);
    setQ("");
  };

  return (
    <div
      className="flex h-[300px] w-[320px] flex-col items-center pt-6"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        if (e.key === "Escape") close();
      }}
    >
      <div className="flex w-[300px] justify-end">
        <motion.div
          initial={false}
          animate={{ width: open ? 300 : 48 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative flex h-12 items-center overflow-hidden rounded-full bg-white pl-[44px] pr-3 shadow-[0_0_0_1px_rgba(0,0,0,.08),0_12px_28px_-16px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_12px_28px_-16px_rgba(0,0,0,.8)]"
        >
          <motion.button
            type="button"
            aria-label={open ? "Search" : "Open search"}
            aria-expanded={open}
            onClick={() => {
              touched.current = true;
              if (open) input.current?.focus();
              else setOpen(true);
            }}
            className="absolute left-[14px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:ring-[#2997ff]"
          >
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              animate={{ rotate: open ? 90 : 0, scale: open ? 0.85 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              aria-hidden="true"
            >
              <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
            </motion.svg>
          </motion.button>
          <AnimatePresence>
            {open && (
              <motion.input
                key="in"
                ref={input}
                value={q}
                maxLength={maxLength}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setQ(e.target.value.slice(0, maxLength))}
                onBlur={() => {
                  if (!q.trim()) close();
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.12 } }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {open && (
              <motion.kbd
                key="esc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                exit={{ opacity: 0 }}
                className="rounded-md bg-[#f0f0f3] px-1.5 py-0.5 text-[11px] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]"
              >
                esc
              </motion.kbd>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul
            key="list"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="m-0 mt-2 w-[300px] list-none overflow-hidden rounded-[20px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-24px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.8)]"
          >
            <li className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b] dark:text-[#8e8e93]" aria-live="polite">
              {term ? `${list.length} results` : "Recent"}
            </li>
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((r, i) => (
                <motion.li
                  layout
                  key={r}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.04 * i } }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      play("tap");
                      onSelect?.(r);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-none text-[#86868b] dark:text-[#8e8e93]" aria-hidden="true">
                      <path d="M6 2h9l5 5v15H6zM14 2v6h6" />
                    </svg>
                    <Highlight text={r} term={term} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
