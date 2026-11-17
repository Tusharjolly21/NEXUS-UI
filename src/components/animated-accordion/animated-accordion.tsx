"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createElement, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type AccordionEntry = {
  /** Used to track which entries are open. Defaults to the entry's position. */
  id?: string;
  title: string;
  /** A short line under the title while the entry is closed. */
  hint?: string;
  content: ReactNode;
};

export type AnimatedAccordionProps = {
  items?: AccordionEntry[];
  /** `single` keeps one entry open at a time. `multiple` lets any number stay open. */
  type?: "single" | "multiple";
  /** Single mode only: whether the open entry can be closed again. */
  collapsible?: boolean;
  /** The id (or ids, for `multiple`) open at the start. By default the first entry. */
  defaultOpen?: string | string[];
  /** Called with the ids that are open after every change. */
  onChange?: (open: string[]) => void;
  /** Heading level used for each title, 1 to 6. Pick the one that fits the page outline. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  tone?: "light" | "dark";
  /** Opens the entries one after another by itself until the visitor touches it. Never runs under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

const DEMO_ITEMS: AccordionEntry[] = [
  {
    title: "Can I use it in a commercial project?",
    hint: "Licence",
    content:
      "Yes. Free components can go into personal and commercial projects. You own the copied code, so you can change anything in it.",
  },
  {
    title: "Does it work with the Next.js App Router?",
    hint: "Setup",
    content:
      "It does. The file starts with use client, so you can place it inside a server component without any extra wrapper.",
  },
  {
    title: "How do I install it?",
    hint: "Install",
    content:
      "Run the install command from the component page with the shadcn CLI. It adds one file to your project and the one package it needs.",
  },
  {
    title: "Is it accessible?",
    hint: "Keyboard",
    content:
      "Each title is a real button inside a heading. Up and Down move between titles, Home and End jump to the first and last, and Enter or Space opens one.",
  },
];

const TONES = {
  light: {
    card: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
    open: "bg-[#f5f5f7]",
    hover: "hover:bg-[#f5f5f7]/70",
    body: "text-[#424245]",
    hint: "text-[#6e6e73]",
    icon: "text-[#6e6e73]",
    ring: "focus-visible:ring-[#0071e3]",
  },
  dark: {
    card: "bg-[#1c1c1e] text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
    open: "bg-[#2c2c2e]",
    hover: "hover:bg-[#2c2c2e]/70",
    body: "text-[#d2d2d7]",
    hint: "text-[#a1a1a6]",
    icon: "text-[#a1a1a6]",
    ring: "focus-visible:ring-[#0a84ff]",
  },
} as const;

const SPRING = { type: "spring", stiffness: 380, damping: 36, mass: 0.9 } as const;

/**
 * A stack of questions where each one opens on a spring.
 * The open entry lifts onto its own tile, its height eases to fit the text, the text follows a beat later,
 * and the plus turns into a minus. Titles are real buttons inside headings, closed text is removed from the page,
 * and Up, Down, Home and End move between titles.
 */
export default function AnimatedAccordion({
  items = DEMO_ITEMS,
  type = "single",
  collapsible = true,
  defaultOpen,
  onChange,
  headingLevel = 3,
  tone = "light",
  autoplay = false,
  className = "",
}: AnimatedAccordionProps) {
  const reduced = useReducedMotion();
  const baseId = useId().replace(/:/g, "");
  const t = TONES[tone];
  const ids = items.map((it, i) => it.id ?? String(i));

  const [open, setOpen] = useState<string[]>(() => {
    if (defaultOpen === undefined) return ids.length ? [ids[0]] : [];
    const list = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
    return type === "single" ? list.slice(0, 1) : list;
  });

  const touched = useRef(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const commit = useCallback((next: string[]) => {
    setOpen(next);
    onChangeRef.current?.(next);
  }, []);

  const toggle = (id: string) => {
    touched.current = true;
    if (open.includes(id)) {
      if (type === "single" && !collapsible) return;
      commit(open.filter((o) => o !== id));
    } else {
      commit(type === "single" ? [id] : [...open, id]);
    }
  };

  // Demo: open the entries one after another until someone interacts. Skipped under reduced motion.
  const idsKey = ids.join("|");
  useEffect(() => {
    if (!autoplay || reduced) return;
    const order = idsKey.split("|");
    let step = 0;
    const timer = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(timer);
        return;
      }
      step = (step + 1) % order.length;
      commit([order[step]]);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [autoplay, reduced, idsKey, commit]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let to = -1;
    if (e.key === "ArrowDown") to = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp") to = index === 0 ? last : index - 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = last;
    if (to < 0) return;
    e.preventDefault();
    touched.current = true;
    triggers.current[to]?.focus();
  };

  return (
    <div
      className={`w-full rounded-[24px] p-2 ${t.card} ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      {items.map((item, index) => {
        const id = ids[index];
        const isOpen = open.includes(id);
        const triggerId = `${baseId}-t-${index}`;
        const panelId = `${baseId}-p-${index}`;
        return (
          <div
            key={id}
            className={`rounded-[18px] transition-colors duration-300 ${isOpen ? t.open : ""}`}
          >
            {createElement(
              `h${headingLevel}`,
              { className: "m-0 text-base font-normal" },
              <button
                ref={(el) => {
                  triggers.current[index] = el;
                }}
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`flex w-full items-center justify-between gap-4 rounded-[18px] px-4 py-3.5 text-left outline-none transition-colors duration-200 focus-visible:ring-2 ${t.ring} ${
                  isOpen ? "" : t.hover
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium leading-snug tracking-[-0.01em]">{item.title}</span>
                  {item.hint && (
                    <span className={`mt-0.5 block text-xs ${t.hint}`}>{item.hint}</span>
                  )}
                </span>
                <span aria-hidden="true" className={`relative size-5 shrink-0 ${t.icon}`}>
                  <span className="absolute left-0.5 right-0.5 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-current" />
                  <motion.span
                    className="absolute bottom-0.5 left-1/2 top-0.5 w-[1.5px] -translate-x-1/2 rounded-full bg-current"
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                    transition={reduced ? { duration: 0 } : SPRING}
                  />
                </span>
              </button>,
            )}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { height: SPRING, opacity: { duration: 0.22, delay: 0.05 } }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: reduced ? 0 : -6 }}
                    animate={{ y: 0 }}
                    transition={reduced ? { duration: 0 } : { ...SPRING, delay: 0.04 }}
                    className={`px-4 pb-4 pr-12 text-sm leading-relaxed ${t.body}`}
                  >
                    {item.content}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
