"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type MotionFaqItem = { q: string; a: string };

export type MotionFaqProps = {
  items?: MotionFaqItem[];
  heading?: string;
  intro?: string;
  /** Index open on first render; -1 for none. */
  defaultOpen?: number;
  /** Let several answers stay open at once. */
  multiple?: boolean;
  /** Support card under the heading. Pass `null` to hide it. */
  contact?: { label: string; href: string } | null;
  /** Called with the question index and whether it is now open. */
  onToggle?: (index: number, open: boolean) => void;
  /** Opens each question in turn until someone touches the list. */
  autoplay?: boolean;
  className?: string;
};

const ITEMS: MotionFaqItem[] = [
  { q: "Can I use the components in client work?", a: "Yes. Everything you install is yours to ship in personal and commercial projects, including work you bill clients for. You can't resell the components themselves as a library." },
  { q: "Does it work with the Next.js App Router?", a: "Every component is a typed React client component built for the App Router. Drop it into a server page and it hydrates on its own." },
  { q: "What do I need installed?", a: "React 19, Tailwind CSS v4 and, for most components, framer-motion. The CLI installs whatever a component needs." },
  { q: "How do updates reach my project?", a: "Run the install command again to pull the latest version. The code lives in your repo, so you review every change like any other diff." },
  { q: "Is it accessible?", a: "Keyboard support, visible focus, sensible ARIA and reduced motion are part of every component's definition of done." },
];

/** Splits an answer into sentences so they can unfold one after another. */
function sentences(a: string) {
  return a.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [a];
}

/** A plus whose upright bar spins flat into a minus. */
function PlusMinus({ open, still }: { open: boolean; still: boolean }) {
  const t = still ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 14 };
  return (
    <span
      className={`relative grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-200 ${
        open ? "bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "bg-[#f0f0f3] text-[#6e6e73] group-hover:text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:group-hover:text-[#f5f5f7]"
      }`}
      aria-hidden="true"
    >
      <span className="absolute h-[2px] w-3 rounded-full bg-current" />
      <motion.span className="absolute h-3 w-[2px] rounded-full bg-current" initial={false} animate={{ rotate: open ? 90 : 0, scaleY: open ? 0 : 1 }} transition={t} />
    </span>
  );
}

/**
 * A two-column FAQ: heading and a support card on one side, the questions on
 * the other. Opening a question lifts it out of the list into a raised card
 * with a small overshoot, spins its plus into a minus and unfolds the answer
 * a sentence at a time. Arrow keys move between questions.
 */
export function MotionFaq({
  items = ITEMS,
  heading = "Questions, answered",
  intro = "Everything people ask before they install their first component.",
  defaultOpen = 0,
  multiple = false,
  contact = { label: "Talk to a human", href: "#" },
  onToggle,
  autoplay = false,
  className = "",
}: MotionFaqProps) {
  const reduce = useReducedMotion() === true;
  const baseId = useId().replace(/:/g, "");
  const [open, setOpen] = useState<number[]>(defaultOpen >= 0 ? [defaultOpen] : []);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);

  const toggle = (i: number) => {
    touched.current = true;
    const isOpen = open.includes(i);
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : multiple ? [...cur, i] : [i]));
    onToggle?.(i, !isOpen);
  };

  const count = items.length;
  useEffect(() => {
    if (!autoplay || count < 2) return;
    let k = Math.max(0, defaultOpen);
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      k = (k + 1) % count;
      setOpen([k]);
    }, 3000);
    return () => window.clearInterval(t);
  }, [autoplay, count, defaultOpen]);

  const key = (e: KeyboardEvent, i: number) => {
    let to: number | null = null;
    if (e.key === "ArrowDown") to = (i + 1) % count;
    if (e.key === "ArrowUp") to = (i - 1 + count) % count;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = count - 1;
    if (to === null) return;
    e.preventDefault();
    btns.current[to]?.focus();
  };

  const lift = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 340, damping: 18 };

  return (
    <section
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] @min-[480px]:p-8 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="grid gap-8 @min-[680px]:grid-cols-[0.8fr_1.2fr] @min-[680px]:gap-10">
        <div className="flex flex-col">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0066cc] dark:text-[#64a8ff]">FAQ</p>
          <h2 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">{heading}</h2>
          {intro ? <p className="mt-2.5 max-w-xs text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{intro}</p> : null}
          {contact ? (
            <a
              href={contact.href}
              className="group mt-6 flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3 outline-none transition-colors hover:bg-[#ececf0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] @min-[680px]:mt-auto dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:focus-visible:outline-[#0a84ff]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
                <svg viewBox="0 0 16 16" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 7.5c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5-2.5 5-5.5 5c-.8 0-1.6-.1-2.3-.4L2.5 13.5l.9-2.6A4.7 4.7 0 012.5 7.5z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">Still curious?</span>
                <span className="block text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{contact.label}, replies within a day</span>
              </span>
              <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-[#6e6e73] transition-transform group-hover:translate-x-0.5 dark:text-[#a1a1a6]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 2.5L8 6l-3.5 3.5" />
              </svg>
            </a>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item, i) => {
            const isOpen = open.includes(i);
            const btnId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <div key={item.q} className="relative">
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_18px_34px_-20px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_34px_-20px_rgba(0,0,0,.9)]"
                  initial={false}
                  animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.97, y: 4 }}
                  transition={lift}
                />
                {i > 0 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 top-[-2.5px] h-px bg-[#e5e5ea] transition-opacity dark:bg-[#38383a] ${isOpen || open.includes(i - 1) ? "opacity-0" : ""}`}
                  />
                ) : null}
                <h3 className="relative">
                  <button
                    ref={(el) => {
                      btns.current[i] = el;
                    }}
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => key(e, i)}
                    className="group flex w-full items-center justify-between gap-5 rounded-[18px] px-4 py-3.5 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
                  >
                    <span className={`text-[15px] font-medium tracking-[-0.01em] transition-colors ${isOpen ? "" : "text-[#3a3a3c] group-hover:text-[#1d1d1f] dark:text-[#d1d1d6] dark:group-hover:text-[#f5f5f7]"}`}>
                      {item.q}
                    </span>
                    <PlusMinus open={isOpen} still={reduce} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
                      className="relative overflow-hidden"
                    >
                      <p className="max-w-prose px-4 pb-4 pr-14 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">
                        {sentences(item.a).map((s, k) => (
                          <motion.span
                            key={k}
                            initial={reduce ? false : { opacity: 0, filter: "blur(4px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.06 + k * 0.09 }}
                          >
                            {s}
                          </motion.span>
                        ))}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
