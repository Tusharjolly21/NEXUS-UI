"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GuideContext = React.createContext<{ open: boolean; toggle: () => void; close: () => void } | null>(null);
const PANEL_ID = "setup-guide";

/**
 * The block page's "In this block" + "Install" row, and the full setup guide that opens under it.
 * The guide used to unfold inside the narrow Install card, which stretched the row and left the
 * sections card beside it mostly empty. It now opens as its own full-width panel below the row.
 * The guide stays in the HTML when closed (hidden from assistive tech and focus) so it is crawlable.
 */
export function InstallRow({ nav, install, guide }: { nav: React.ReactNode; install: React.ReactNode; guide: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const panel = React.useRef<HTMLElement>(null);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);
  const close = React.useCallback(() => setOpen(false), []);

  // Open straight away when someone lands on #setup-guide.
  React.useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${PANEL_ID}`) setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Bring the panel into view once it starts opening (it sits below the fold on small screens).
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.6 || top < 0) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.getElementById(`${PANEL_ID}-toggle`)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <GuideContext.Provider value={{ open, toggle, close }}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        {nav}
        {install}
      </div>
      <motion.section
        ref={panel}
        id={PANEL_ID}
        aria-label="Full setup guide"
        aria-hidden={!open}
        inert={!open}
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 260, damping: 32 }, opacity: { duration: 0.2 } }}
        className="scroll-mt-28 overflow-hidden"
      >
        <div className="pt-4">{guide}</div>
      </motion.section>
    </GuideContext.Provider>
  );
}

/** The button in the Install card that opens and closes the guide below. */
export function GuideToggle() {
  const ctx = React.useContext(GuideContext);
  if (!ctx) return null;
  return (
    <button
      id={`${PANEL_ID}-toggle`}
      type="button"
      aria-expanded={ctx.open}
      aria-controls={PANEL_ID}
      onClick={ctx.toggle}
      className="mt-4 flex h-11 w-full items-center justify-between rounded-[14px] px-3 text-[14px] font-medium text-link transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {ctx.open ? "Hide the setup guide" : "Full setup guide"}
      <ChevronDown className={cn("size-4 transition-transform duration-300", ctx.open && "rotate-180")} aria-hidden />
    </button>
  );
}

/** Close button in the guide's own header. */
export function GuideClose() {
  const ctx = React.useContext(GuideContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => {
        ctx.close();
        document.getElementById(`${PANEL_ID}-toggle`)?.focus();
      }}
      aria-label="Close the setup guide"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/[0.05] text-muted-foreground transition-colors hover:bg-foreground/[0.09] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

/** A code sample in the guide, with its own copy button. */
export function GuideCode({ value, label, tall = false }: { value: string; label?: string; tall?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const reduce = useReducedMotion();
  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => undefined,
    );
  };
  return (
    <div className="relative mt-3 overflow-hidden rounded-[14px] bg-foreground/[0.045] dark:bg-white/[0.06]">
      {label ? (
        <div className="flex items-center border-b border-foreground/[0.06] px-4 py-2 font-mono text-[11.5px] text-muted-foreground">{label}</div>
      ) : null}
      <pre
        tabIndex={tall ? 0 : undefined}
        className={cn(
          "overflow-x-auto p-4 pr-14 font-mono text-[12.5px] leading-6 text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          tall && "max-h-[320px] overflow-y-auto",
        )}
      >
        {value}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-2.5 grid size-8 place-items-center rounded-full bg-background text-muted-foreground shadow-[0_0_0_0.5px_var(--border)] transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          label ? "top-1" : "top-2.5",
          copied && "text-[#248a3d] dark:text-[#30d158]",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "y" : "n"}
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
          >
            {copied ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          </motion.span>
        </AnimatePresence>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
