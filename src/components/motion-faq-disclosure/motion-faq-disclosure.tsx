"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
};

const ITEMS: MotionFaqItem[] = [
  { q: "Can I use the components in client work?", a: "Yes. Everything you install is yours to ship in personal and commercial projects, including work you bill clients for. You can't resell the components themselves as a library." },
  { q: "Does it work with the Next.js App Router?", a: "Every component is a typed React client component built for the App Router and React Server Components. Drop it into a server page and it hydrates on its own." },
  { q: "What do I need installed?", a: "React 19, Tailwind CSS v4 and, for most components, framer-motion and lucide-react. The CLI installs whatever a component needs." },
  { q: "How do updates reach my project?", a: "Run the install command again to pull the latest version. Because the code lives in your repo, you review every change like any other diff." },
  { q: "Is it accessible?", a: "Keyboard support, visible focus, sensible ARIA and prefers-reduced-motion are part of every component's definition of done." },
];

/** A two-column FAQ: heading and a support card on the left, a spring-animated accordion on the right. */
export function MotionFaq({
  items = ITEMS,
  heading = "Questions, answered",
  intro = "Everything people ask before they install their first component.",
  defaultOpen = 0,
  multiple = false,
  contact = { label: "Talk to a human", href: "#" },
  className,
}: MotionFaqProps) {
  const reduce = useReducedMotion();
  const baseId = React.useId();
  const [open, setOpen] = React.useState<number[]>(defaultOpen >= 0 ? [defaultOpen] : []);

  const toggle = (i: number) =>
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : multiple ? [...cur, i] : [i]));

  return (
    <section
      className={cn(
        "grid w-full gap-10 rounded-[28px] border border-zinc-200/80 bg-white p-8 md:grid-cols-[0.8fr_1.2fr] md:p-10",
        "dark:border-white/10 dark:bg-zinc-950",
        className,
      )}
    >
      <div className="flex flex-col">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300">FAQ</p>
        <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-zinc-950 [text-wrap:balance] dark:text-white">{heading}</h2>
        <p className="mt-3 max-w-xs text-[14.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{intro}</p>
        {contact ? (
          <a
            href={contact.href}
            className="group mt-auto flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3.5 pt-3.5 transition-colors hover:border-zinc-300 max-md:mt-8 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <MessageCircle className="size-[18px]" />
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] font-semibold text-zinc-950 dark:text-white">Still curious?</span>
              <span className="block text-[12.5px] text-zinc-500 dark:text-zinc-400">{contact.label} — replies within a day</span>
            </span>
          </a>
        ) : null}
      </div>

      <div className="divide-y divide-zinc-200/80 border-y border-zinc-200/80 dark:divide-white/10 dark:border-white/10">
        {items.map((item, i) => {
          const isOpen = open.includes(i);
          const btnId = `${baseId}-q${i}`;
          const panelId = `${baseId}-a${i}`;
          return (
            <div key={item.q}>
              <h3>
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  className="group flex w-full items-center justify-between gap-6 py-4 text-left outline-none focus-visible:text-indigo-600 dark:focus-visible:text-indigo-300"
                >
                  <span className={cn("text-[15.5px] font-medium tracking-[-0.01em] transition-colors", isOpen ? "text-zinc-950 dark:text-white" : "text-zinc-700 group-hover:text-zinc-950 dark:text-zinc-300 dark:group-hover:text-white")}>
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 26 }}
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border transition-colors",
                      isOpen ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950" : "border-zinc-200 text-zinc-500 dark:border-white/15 dark:text-zinc-400",
                    )}
                  >
                    <Plus className="size-3.5" />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 300, damping: 34 }, opacity: { duration: 0.2 } }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-prose pb-5 pr-12 text-[14.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
