"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Volume1, Volume2, VolumeX } from "lucide-react";
import { CodeBlock } from "@/components/code-block/code-block";
import { SOUNDS, playSound, setSoundVolume, type SoundCategory, type SoundName } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

const CATEGORIES: SoundCategory[] = ["Actions", "Feedback", "Navigation", "Notifications", "Selection", "Movement", "Progress", "System"];

/** Each category gets its own orb colour, so the board reads by kind at a glance. */
const ORB: Record<SoundCategory, string> = {
  Actions: "radial-gradient(circle at 32% 28%, #e9d5ff 0%, #c084fc 28%, #7c3aed 70%, #4c1d95 100%)",
  Feedback: "radial-gradient(circle at 32% 28%, #d1fae5 0%, #34d399 30%, #14b8a6 68%, #0f766e 100%)",
  Navigation: "radial-gradient(circle at 32% 28%, #dbeafe 0%, #60a5fa 30%, #1d4ed8 72%, #1e3a8a 100%)",
  Notifications: "radial-gradient(circle at 32% 28%, #fef9c3 0%, #fde047 30%, #f59e0b 70%, #b45309 100%)",
  Selection: "radial-gradient(circle at 32% 28%, #fce7f3 0%, #f472b6 30%, #a855f7 70%, #6b21a8 100%)",
  Movement: "radial-gradient(circle at 32% 28%, #ccfbf1 0%, #5eead4 30%, #22c55e 70%, #15803d 100%)",
  Progress: "radial-gradient(circle at 32% 28%, #ffedd5 0%, #fb923c 30%, #ef4444 70%, #b91c1c 100%)",
  System: "radial-gradient(circle at 32% 28%, #f3f4f6 0%, #9ca3af 30%, #4b5563 70%, #1f2937 100%)",
};

const NAMES = Object.keys(SOUNDS) as SoundName[];

/**
 * The sounds library as a board of orbs: tap one to hear it, filter by kind, set the volume, and
 * copy the one line that plays it. Everything is synthesised in the browser; nothing is downloaded.
 */
export function SoundBoard({ source }: { source: string }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = React.useState<SoundCategory | "All">("All");
  const [selected, setSelected] = React.useState<SoundName>("pop");
  const [hits, setHits] = React.useState<Record<string, number>>({});
  const [volume, setVolume] = React.useState(0.8);
  const [showFile, setShowFile] = React.useState(false);

  const visible = filter === "All" ? NAMES : NAMES.filter((n) => SOUNDS[n].category === filter);

  const play = (name: SoundName) => {
    setSelected(name);
    setHits((h) => ({ ...h, [name]: (h[name] ?? 0) + 1 }));
    playSound(name);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    setSoundVolume(v);
  };

  const snippet = `playSound("${selected}")`;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="rounded-tile bg-[#f5f5f7] p-4 sm:p-6 dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Sound kind" className="-mx-1 flex max-w-full flex-wrap gap-1">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "h-10 rounded-full px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                filter === c ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/[0.06]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex h-10 items-center gap-2 rounded-full bg-card px-3 text-muted-foreground shadow-[0_0_0_1px_var(--border)] dark:bg-white/[0.06] dark:shadow-none">
          <VolumeIcon className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="w-24 accent-[#1d1d1f] dark:accent-white"
          />
        </label>
      </div>

      <motion.ul layout={!reduce} className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" aria-label="Sounds">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((name) => {
            const s = SOUNDS[name];
            const active = selected === name;
            return (
              <motion.li
                key={name}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <button
                  type="button"
                  onClick={() => play(name)}
                  aria-label={`Play ${s.label}, ${s.category}`}
                  aria-pressed={active}
                  className={cn(
                    "group flex w-full flex-col items-center gap-3 rounded-[22px] bg-card px-3 pb-4 pt-5 text-center transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "shadow-[0_0_0_1.5px_var(--foreground)]"
                      : "shadow-[0_0_0_1px_var(--border)] hover:shadow-[0_0_0_1px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.35)]",
                  )}
                >
                  <span className="relative grid size-14 place-items-center">
                    {/* one ring per press, keyed so a quick double tap shows two */}
                    <AnimatePresence>
                      {hits[name] && !reduce ? (
                        <motion.span
                          key={hits[name]}
                          aria-hidden
                          className="absolute inset-0 rounded-full"
                          style={{ background: ORB[s.category] }}
                          initial={{ scale: 1, opacity: 0.45 }}
                          animate={{ scale: 1.9, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ) : null}
                    </AnimatePresence>
                    <motion.span
                      key={`orb-${hits[name] ?? 0}`}
                      aria-hidden
                      className="relative size-14 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.18),0_10px_22px_-12px_rgba(0,0,0,0.45)]"
                      style={{ background: ORB[s.category] }}
                      initial={hits[name] && !reduce ? { scale: 0.82 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 14 }}
                    />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold tracking-[-0.2px] text-foreground">{s.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{s.category}</span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CopyPill text={snippet} />
        <button
          type="button"
          aria-expanded={showFile}
          onClick={() => setShowFile((v) => !v)}
          className="h-10 rounded-full bg-card px-4 text-[13.5px] font-medium text-link shadow-[0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.06] dark:shadow-none"
        >
          {showFile ? "Hide ui-sounds.ts" : "ui-sounds.ts"}
        </button>
        <span className="text-[13px] text-muted-foreground">
          {NAMES.length} sounds, synthesised in the browser. No audio files.
        </span>
      </div>

      <AnimatePresence initial={false}>
        {showFile ? (
          <motion.div
            key="file"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 max-h-[560px] overflow-auto rounded-[20px]">
              <CodeBlock
                code={source}
                language="ts"
                theme="dark"
                header={{
                  enabled: true,
                  showDots: true,
                  title: "lib/ui-sounds.ts",
                  copy: { enabled: true, label: "Copy file", copiedLabel: "Copied", copiedDurationMs: 1400 },
                }}
                codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                border={{ radius: "20px" }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CopyPill({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1d1d1f] pl-4 pr-1.5 dark:bg-white/[0.08]">
      <code className="font-mono text-[14px] text-white">{text}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-medium text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </span>
  );
}
