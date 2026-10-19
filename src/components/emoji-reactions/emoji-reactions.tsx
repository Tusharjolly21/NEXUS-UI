"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Reaction = {
  emoji: string;
  count: number;
  /** Whether the current person has reacted with this emoji. */
  reacted?: boolean;
};

export type EmojiReactionsProps = {
  /** Text in the message bubble. Pass `null` to show only the reaction row. */
  message?: React.ReactNode;
  /** Starting reactions. */
  reactions?: Reaction[];
  /** Emojis offered in the picker. */
  emojis?: string[];
  /** Called whenever the reaction list changes. */
  onChange?: (reactions: Reaction[]) => void;
  /** Ring and tint colour for reactions you have added. */
  accent?: string;
  className?: string;
};

const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2 },
];

const DEFAULT_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"];

const spring = { type: "spring", stiffness: 520, damping: 32 } as const;

/** A key that changes every time the digit changes, so a digit that returns to an earlier value still rolls. */
function useDigitVersion(digit: string) {
  const [state, setState] = React.useState({ digit, version: 0 });
  if (state.digit !== digit) {
    const next = { digit, version: state.version + 1 };
    setState(next);
    return next.version;
  }
  return state.version;
}

function RollDigit({ digit, dir }: { digit: string; dir: number }) {
  const reduce = useReducedMotion();
  const version = useDigitVersion(digit);
  return (
    <span className="relative inline-flex h-[1.25em] w-[1ch] justify-center overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={dir}>
        <motion.span
          key={version}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: 0 }),
            center: { y: "0%", opacity: 1 },
            exit: (d: number) => ({ y: reduce ? 0 : `${-d * 100}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 460, damping: 34 }}
          className="inline-block leading-[1.25em]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** +1 when the value went up since the last render, -1 when it went down. */
function useRollDirection(value: number): 1 | -1 {
  const [state, setState] = React.useState<{ value: number; dir: 1 | -1 }>({ value, dir: 1 });
  if (state.value !== value) {
    const next = { value, dir: (value > state.value ? 1 : -1) as 1 | -1 };
    setState(next);
    return next.dir;
  }
  return state.dir;
}

function RollCount({ value }: { value: number }) {
  const dir = useRollDirection(value);
  const text = String(value);
  return (
    <span aria-hidden className="inline-flex tabular-nums">
      {text.split("").map((d, i) => (
        <RollDigit key={text.length - i} digit={d} dir={dir} />
      ))}
    </span>
  );
}

function Sparks({ color }: { color: string }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-1 -ml-0.5 -mt-0.5 rounded-full"
            style={{ background: i % 2 ? color : "#ffc94d" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 15, y: Math.sin(a) * 15, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

function Chip({
  reaction,
  accent,
  onToggle,
  popKey,
}: {
  reaction: Reaction;
  accent: string;
  onToggle: () => void;
  popKey: number;
}) {
  const reduce = useReducedMotion();
  const on = !!reaction.reacted;
  return (
    <motion.button
      layout
      type="button"
      aria-pressed={on}
      aria-label={`${reaction.emoji} ${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"}${on ? ", including yours" : ""}`}
      onClick={onToggle}
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={spring}
      className={cn(
        "relative inline-flex h-8 items-center gap-1.5 rounded-full border pl-2 pr-2.5 text-[13px] font-medium outline-none",
        "transition-[background-color,border-color,box-shadow] duration-200",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        on
          ? "text-[#17181a] dark:text-zinc-50"
          : "border-black/[0.07] bg-white text-[#3c3b37] shadow-[0_1px_2px_rgba(16,17,20,0.05)] hover:bg-neutral-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
      style={
        on
          ? {
              borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${accent} 30%, transparent)`,
              ["--tw-ring-color" as string]: accent,
            }
          : { ["--tw-ring-color" as string]: accent }
      }
    >
      <span className="relative grid size-[18px] place-items-center">
        {popKey > 0 && on && !reduce ? <Sparks key={`sparks-${popKey}`} color={accent} /> : null}
        <motion.span
          key={popKey}
          initial={popKey === 0 || reduce ? false : { scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 14 }}
          className="text-[16px] leading-none"
        >
          {reaction.emoji}
        </motion.span>
      </span>
      <RollCount value={reaction.count} />
    </motion.button>
  );
}

export function EmojiReactions({
  message = "Shipped the new onboarding flow",
  reactions: initial = DEFAULT_REACTIONS,
  emojis = DEFAULT_EMOJIS,
  onChange,
  accent = "#5b8def",
  className,
}: EmojiReactionsProps) {
  const reduce = useReducedMotion();
  const [list, setList] = React.useState<Reaction[]>(initial);
  const [pops, setPops] = React.useState<Record<string, number>>({});
  const [open, setOpen] = React.useState(false);
  // only move focus around when the picker is driven from the keyboard
  const [viaKeyboard, setViaKeyboard] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const pickerId = React.useId();

  const commit = (next: Reaction[]) => {
    setList(next);
    onChange?.(next);
  };

  const toggle = (emoji: string) => {
    const existing = list.find((r) => r.emoji === emoji);
    let next: Reaction[];
    let added = false;
    if (!existing) {
      next = [...list, { emoji, count: 1, reacted: true }];
      added = true;
    } else if (existing.reacted) {
      next = list
        .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r))
        .filter((r) => r.count > 0);
    } else {
      next = list.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r));
      added = true;
    }
    if (added) setPops((p) => ({ ...p, [emoji]: (p[emoji] ?? 0) + 1 }));
    commit(next);
  };

  const pick = (emoji: string) => {
    const existing = list.find((r) => r.emoji === emoji);
    if (!existing?.reacted) toggle(emoji);
    setOpen(false);
    if (viaKeyboard) triggerRef.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (pickerRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("inline-flex flex-col items-start gap-2.5", className)}>
      {message !== null ? (
        <div className="rounded-[20px] rounded-bl-md border border-black/[0.06] bg-white px-4 py-2.5 text-[15px] leading-snug text-[#17181a] shadow-[0_1px_2px_rgba(16,17,20,0.05),0_8px_24px_-12px_rgba(16,17,20,0.18)] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50">
          {message}
        </div>
      ) : null}

      <LayoutGroup>
        <motion.div layout className="relative flex flex-wrap items-center gap-1.5" role="group" aria-label="Reactions">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((r) => (
              <Chip key={r.emoji} reaction={r} accent={accent} popKey={pops[r.emoji] ?? 0} onToggle={() => toggle(r.emoji)} />
            ))}
          </AnimatePresence>

          <motion.div layout transition={spring} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-label="Add reaction"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={open ? pickerId : undefined}
              onPointerDown={() => setViaKeyboard(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") setViaKeyboard(true);
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "grid size-8 place-items-center rounded-full border text-[#73726d] outline-none transition-colors",
                "border-black/[0.07] bg-white hover:bg-neutral-50 hover:text-[#17181a] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                open && "bg-neutral-100 text-[#17181a] dark:bg-zinc-800 dark:text-zinc-100",
              )}
              style={{ ["--tw-ring-color" as string]: accent }}
            >
              <SmilePlus className="size-[17px]" strokeWidth={1.8} />
            </button>

            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={pickerRef}
                  id={pickerId}
                  role="menu"
                  aria-label="Pick a reaction"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -6 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30 }}
                  style={{ transformOrigin: "calc(100% - 16px) 0%" }}
                  className="absolute right-0 top-[calc(100%+8px)] z-20 flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white p-1 shadow-[0_2px_6px_rgba(16,17,20,0.06),0_16px_36px_-12px_rgba(16,17,20,0.28)] dark:border-white/10 dark:bg-zinc-900"
                >
                  {emojis.map((emoji, i) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      role="menuitem"
                      aria-label={`React with ${emoji}`}
                      autoFocus={viaKeyboard && i === 0}
                      onClick={() => pick(emoji)}
                      initial={reduce ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : 0.02 * i, type: "spring", stiffness: 600, damping: 30 }}
                      whileHover={reduce ? undefined : { scale: 1.35, y: -4 }}
                      whileTap={reduce ? undefined : { scale: 0.9 }}
                      className="grid size-9 place-items-center rounded-full text-[20px] leading-none outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
