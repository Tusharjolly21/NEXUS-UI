"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BrandMark, type MarkName } from "./brand-marks";
import { ICON_TILE, McpIcon, type McpIconName } from "./mcp-icon";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export type Setup = {
  id: string;
  app: string;
  mark: MarkName;
  /** Tile colour behind the mark. */
  tile: string;
  where: string;
  file?: string;
  free: string;
  pro: string;
  note?: string;
};

/**
 * A Copy button. On a real copy it plays the site's copy sound (which follows the visitor's sound switch), its
 * copy icon ticks, and the label says "Copied" for a moment.
 */
export function CopyButton({ text, label = "Copy", className, onDark = false }: { text: string; label?: string; className?: string; onDark?: boolean }) {
  const play = useSound();
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          play("success", 0.6);
          setCopied(true);
        } catch {
          // clipboard blocked; the text stays selectable
        }
      }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        onDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-foreground text-background hover:opacity-90",
        className,
      )}
    >
      <McpIcon name="copy" size={15} play={copied} />
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

/** One card: pick your app, pick free or Pro, copy the exact setup. */
export function SetupTabs({ setups }: { setups: Setup[] }) {
  const [active, setActive] = React.useState(setups[0].id);
  const [pro, setPro] = React.useState(false);
  const s = setups.find((x) => x.id === active) ?? setups[0];
  const code = pro ? s.pro : s.free;
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + setups.length) % setups.length;
    setActive(setups[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="pg-float overflow-hidden rounded-[28px] bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div role="tablist" aria-label="Your app" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
          {setups.map((x, i) => {
            const on = x.id === active;
            return (
              <button
                key={x.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={on}
                aria-controls="setup-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(x.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {on ? (
                  <motion.span layoutId="setup-tab" className="absolute inset-0 rounded-full bg-secondary ring-1 ring-border" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                ) : null}
                <span className={cn("relative grid size-7 place-items-center rounded-full", x.tile)}>
                  <BrandMark name={x.mark} className="size-4" />
                </span>
                <span className="relative whitespace-nowrap">{x.app}</span>
              </button>
            );
          })}
        </div>

        <div role="radiogroup" aria-label="Which components" className="flex shrink-0 rounded-full bg-secondary p-1 ring-1 ring-border">
          {[
            { v: false, label: "Free", icon: "unlock" },
            { v: true, label: "Pro", icon: "lock" },
          ].map(({ v, label, icon }) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={pro === v}
              onClick={() => setPro(v)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                pro === v ? "text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pro === v ? <motion.span layoutId="setup-tier" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
              <McpIcon name={icon as McpIconName} size={14} className="relative" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div id="setup-panel" role="tabpanel" aria-labelledby={`tab-${s.id}`} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
        <div>
          <div className="flex items-center gap-3">
            <span className={cn("grid size-11 place-items-center rounded-2xl", s.tile)}>
              <BrandMark name={s.mark} className="size-6" />
            </span>
            <h3 className="text-[22px] font-semibold tracking-[-0.4px] text-foreground">{s.app}</h3>
          </div>
          <p className="mt-4 text-[15.5px] leading-relaxed text-body">{s.where}</p>
          {s.file ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[12.5px] text-foreground ring-1 ring-border">
              <McpIcon name="file-code" size={15} className="text-muted-foreground" />
              {s.file}
            </p>
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pro ? "pro" : "free"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              {pro ? (
                <div className="mt-5 rounded-2xl bg-[#7c5cff]/10 p-4 ring-1 ring-[#7c5cff]/20">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                    <McpIcon name="key" size={16} /> Needs your API key
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-body">
                    Create it on your dashboard. It is shown once, so copy it straight away.
                  </p>
                  <Link
                    href="/dashboard/api-key"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[13px] font-semibold text-background hover:opacity-90"
                  >
                    <McpIcon name="key" size={14} /> Get your API key
                  </Link>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-[#1f9d55]/10 p-4 ring-1 ring-[#1f9d55]/20">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                    <McpIcon name="unlock" size={16} /> No key, no account
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-body">Every free component, with its full source. Switch to Pro when you want the rest.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {s.note ? <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">{s.note}</p> : null}
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-[20px] bg-[#16161a]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
            <span className="font-mono text-[12px] text-white/50">{s.file ?? "terminal"}</span>
            <CopyButton text={code} onDark />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.pre
              key={`${s.id}-${pro}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              tabIndex={0}
              className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-[#e6e6ea] focus-visible:outline-2 focus-visible:outline-ring"
            >
              {code}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Example requests as chips you can copy. */
export function AskChips({ asks }: { asks: { text: string; icon: McpIconName }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {asks.map((a) => (
        <li key={a.text} data-icon-card className="pg-float flex items-center gap-3.5 rounded-[20px] bg-card p-4">
          <McpIcon name={a.icon} size={22} tile={cn(ICON_TILE, "size-10 rounded-xl")} />
          <p className="min-w-0 flex-1 text-[15.5px] leading-snug text-foreground">&ldquo;{a.text}&rdquo;</p>
          <CopyButton text={a.text} label="Copy" />
        </li>
      ))}
    </ul>
  );
}
