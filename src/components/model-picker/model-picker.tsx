"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PickerEffort = "low" | "medium" | "high" | "max";

export interface PickerProvider {
  id: string;
  name: string;
  /** Badge colour behind the provider's glyph. */
  color: string;
  /** A small white glyph drawn on a 24 × 24 grid. */
  glyph: ReactNode;
}

export interface PickerModel {
  /** The id your API expects; reported by `onValueChange`. */
  id: string;
  name: string;
  provider: string;
  /** One line under the name in the menu. */
  blurb: string;
  /** Longer sentence for the summary under the pill. */
  description: string;
  /** Context window, as shown: "1M", "400K". */
  context: string;
  /** USD per million tokens. Leave both out for self-hosted models. */
  price?: { input: number; output: number };
  /** Effort levels the model accepts, lowest first, and its default. Leave out for models without effort. */
  effort?: { levels: PickerEffort[]; default: PickerEffort };
}

export interface ModelPickerProps {
  models?: PickerModel[];
  providers?: PickerProvider[];
  /** Model ids listed at the top of the menu. Every other model sits under More models. */
  featured?: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string, model: PickerModel) => void;
  effort?: PickerEffort;
  onEffortChange?: (effort: PickerEffort) => void;
  /** Opens the menu on first render, for a preview that shows it at rest. */
  defaultOpen?: boolean;
  /** Shows the summary under the pill: description, context, prices and effort. */
  showSummary?: boolean;
  /** Line under the summary. Say here when prices are samples. */
  footnote?: string;
  className?: string;
}

const LEVELS: PickerEffort[] = ["low", "medium", "high", "max"];

export const DEFAULT_PICKER_PROVIDERS: PickerProvider[] = [
  { id: "anthropic", name: "Anthropic", color: "#d97757", glyph: <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" /> },
  { id: "lumen", name: "Lumen", color: "#3253ff", glyph: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff" /> },
  { id: "cobalt", name: "Cobalt", color: "#0f766e", glyph: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" fill="none" stroke="#fff" strokeWidth={2.6} /> },
  { id: "fern", name: "Fern (open weights)", color: "#5b8c3a", glyph: <path d="M12 21V8M12 12l-5-4M12 15l5-4M12 9l-3-5M12 9l3-5" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" /> },
];

/* A sample catalog for the preview. Prices and limits are placeholders, not real rates. */
export const DEFAULT_PICKER_MODELS: PickerModel[] = [
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", provider: "anthropic", blurb: "Complex coding, agents and analysis", description: "The flagship for long agent runs, hard code changes and careful analysis. Effort sets how long it thinks before answering.", context: "1M", price: { input: 4, output: 20 }, effort: { levels: ["low", "medium", "high", "max"], default: "medium" } },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", provider: "anthropic", blurb: "Strong and quick for everyday work", description: "The balanced default for chat, writing and most coding. Fast enough to feel instant, strong enough for real work.", context: "1M", price: { input: 2, output: 10 }, effort: { levels: ["low", "medium", "high"], default: "medium" } },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", provider: "anthropic", blurb: "Instant replies at the lowest cost", description: "Built for high-volume, low-latency jobs: classification, extraction, autocomplete and short replies.", context: "400K", price: { input: 0.6, output: 3 } },
  { id: "lumen-prism-3", name: "Lumen Prism 3", provider: "lumen", blurb: "Reads images, charts and PDFs", description: "A vision-first model for screenshots, scanned documents and charts, with tidy structured output.", context: "512K", price: { input: 2.5, output: 12 }, effort: { levels: ["low", "high"], default: "low" } },
  { id: "lumen-prism-3-mini", name: "Lumen Prism 3 Mini", provider: "lumen", blurb: "Small and fast vision", description: "The compact Prism for quick image questions and bulk captioning.", context: "256K", price: { input: 0.4, output: 1.6 } },
  { id: "cobalt-long-2", name: "Cobalt Long 2", provider: "cobalt", blurb: "Whole repositories in one prompt", description: "Tuned for very long inputs: entire codebases, contracts and research archives in a single request.", context: "2M", price: { input: 3, output: 15 }, effort: { levels: ["medium", "high"], default: "medium" } },
  { id: "cobalt-code", name: "Cobalt Code", provider: "cobalt", blurb: "Completion inside the editor", description: "A low-latency code model for inline completion and quick refactors.", context: "128K", price: { input: 0.8, output: 3.2 } },
  { id: "fern-70b", name: "Fern 70B", provider: "fern", blurb: "Self-hosted, runs on your GPUs", description: "An open-weights model you host yourself, for data that cannot leave your network. Costs are your own compute.", context: "128K", effort: { levels: ["low", "medium"], default: "low" } },
];

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { type: "spring" as const, stiffness: 520, damping: 38 };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function usePhone() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(max-width: 639px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
}

/** Nearest level the model accepts to the one asked for. */
function snap(model: PickerModel, want: PickerEffort): PickerEffort | undefined {
  if (!model.effort) return undefined;
  if (model.effort.levels.includes(want)) return want;
  const w = LEVELS.indexOf(want);
  return model.effort.levels.reduce((a, b) => (Math.abs(LEVELS.indexOf(b) - w) < Math.abs(LEVELS.indexOf(a) - w) ? b : a), model.effort.default);
}

function Mark({ provider }: { provider?: PickerProvider }) {
  return (
    <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-[6px]" style={{ background: provider?.color ?? "#6c6c78" }}>
      <svg viewBox="0 0 24 24" className="size-3">
        {provider?.glyph}
      </svg>
    </span>
  );
}

const Check = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" className={cn("size-[15px] text-[#16161b] dark:text-[#f1f1f4]", !on && "opacity-0")} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Chevron = ({ dir = "right" }: { dir?: "right" | "left" | "down" }) => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={dir === "right" ? "M9 6l6 6-6 6" : dir === "left" ? "M15 6l-6 6 6 6" : "M6 9l6 6 6-6"} />
  </svg>
);

type Row = { key: string; label: string; onChoose: () => void; content: ReactNode; role: "menuitem" | "menuitemradio"; checked?: boolean; sub?: "effort" | "more"; divider?: boolean };

/** One menu surface: rows with a single highlight that springs under the pointer and jumps for the keyboard. */
function MenuList({
  rows,
  groups,
  id,
  onSub,
  onBack,
  onClose,
  autoFocusKey,
  className,
}: {
  rows: Row[];
  /** Row key → group heading shown above it. */
  groups?: Record<string, string>;
  id: string;
  onSub?: (s: "effort" | "more" | null, viaKeyboard: boolean) => void;
  onBack?: () => void;
  onClose: (refocus: boolean) => void;
  autoFocusKey?: string;
  className?: string;
}) {
  const [hl, setHl] = useState<{ key: string; instant: boolean } | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!autoFocusKey) return;
    refs.current.get(autoFocusKey)?.focus();
  }, [autoFocusKey]);

  const move = (i: number) => {
    const r = rows[(i + rows.length) % rows.length];
    refs.current.get(r.key)?.focus();
    setHl({ key: r.key, instant: true });
  };

  const onKey = (e: ReactKeyboardEvent, i: number, r: Row) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(i - 1);
    } else if (e.key === "ArrowRight" && r.sub) {
      e.preventDefault();
      onSub?.(r.sub, true);
    } else if (e.key === "ArrowLeft" && onBack) {
      e.preventDefault();
      onBack();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
    } else if (e.key === "Tab") {
      onClose(false);
    } else if (/^[a-z0-9]$/i.test(e.key)) {
      const after = [...rows.slice(i + 1), ...rows.slice(0, i + 1)];
      const hit = after.find((x) => x.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) move(rows.indexOf(hit));
    }
  };

  return (
    <div role="menu" className={cn("grid", className)} onPointerLeave={() => setHl(null)}>
      {rows.map((r, i) => (
        <div key={r.key}>
          {groups?.[r.key] && <div className="px-2.5 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.07em] text-[#a9a9b4] dark:text-[#5a5a65]">{groups[r.key]}</div>}
          {r.divider && <div role="separator" className="mx-2 my-1.5 h-px bg-[#e7e7ec] dark:bg-[#26262e]" />}
          {(
            <button
              ref={(el) => {
                if (el) refs.current.set(r.key, el);
                else refs.current.delete(r.key);
              }}
              type="button"
              role={r.role}
              aria-checked={r.role === "menuitemradio" ? !!r.checked : undefined}
              aria-haspopup={r.sub ? "menu" : undefined}
              tabIndex={-1}
              id={`${id}-${r.key}`}
              onClick={r.onChoose}
              onKeyDown={(e) => onKey(e, i, r)}
              onPointerMove={() => {
                if (hl?.key !== r.key) setHl({ key: r.key, instant: hl === null });
                if (!r.sub) onSub?.(null, false);
                else onSub?.(r.sub, false);
              }}
              className={cn("relative grid w-full grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left", FOCUS)}
            >
              {hl?.key === r.key && (
                <motion.span
                  layoutId={`${id}-hl`}
                  transition={hl.instant ? { duration: 0 } : SPRING}
                  className="absolute inset-0 rounded-[10px] bg-[#f1f1f5] dark:bg-[#25252d]"
                />
              )}
              {r.content}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * A model picker for an AI product in one quiet pill. It opens a menu of featured models with a one line
 * note each, an Effort submenu for models that reason, and More models grouped by provider. Choosing closes
 * the menu, the pill springs to the new name's width, and the summary underneath crossfades to the new
 * model. On phones the submenus open as pages inside the menu with a Back row. Fully keyboard operable:
 * arrows move, Right opens a submenu, Enter chooses, Escape closes, and typing a letter jumps to a model.
 */
export function ModelPicker({
  models = DEFAULT_PICKER_MODELS,
  providers = DEFAULT_PICKER_PROVIDERS,
  featured = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "lumen-prism-3"],
  value,
  defaultValue,
  onValueChange,
  effort: effortProp,
  onEffortChange,
  defaultOpen = false,
  showSummary = true,
  footnote = "Sample catalog. Prices and limits are placeholder values, not real rates.",
  className,
}: ModelPickerProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const phone = usePhone();
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const byId = (m: string) => models.find((x) => x.id === m);

  const [inner, setInner] = useState(defaultValue ?? featured[0] ?? models[0].id);
  const current = byId(value ?? inner) ?? models[0];
  const [innerEffort, setInnerEffort] = useState<PickerEffort>(current.effort?.default ?? "medium");
  const effort = snap(current, effortProp ?? innerEffort);

  const [open, setOpen] = useState(defaultOpen);
  const [sub, setSub] = useState<"effort" | "more" | null>(null);
  const [focusKey, setFocusKey] = useState<string | undefined>();
  const [note, setNote] = useState<string | null>(null);

  const provider = (p: string) => providers.find((x) => x.id === p);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 2200);
    return () => window.clearTimeout(t);
  }, [note]);

  function close(refocus: boolean) {
    setOpen(false);
    setSub(null);
    setFocusKey(undefined);
    if (refocus) pill.current?.focus({ preventScroll: true });
  }

  const openMenu = (viaKeyboard: boolean) => {
    setOpen(true);
    setSub(null);
    setFocusKey(viaKeyboard ? (featured.includes(current.id) ? current.id : "more") : undefined);
  };

  const chooseModel = (m: PickerModel) => {
    close(true);
    if (m.id === current.id) return;
    if (value === undefined) setInner(m.id);
    onValueChange?.(m.id, m);
    const next = effort ? snap(m, effort) : m.effort?.default;
    if (next && next !== effort) {
      setInnerEffort(next);
      onEffortChange?.(next);
    }
    setNote(`Switched to ${m.name}${next ? `, ${next} effort` : ""}`);
  };
  const chooseEffort = (l: PickerEffort) => {
    close(true);
    setInnerEffort(l);
    onEffortChange?.(l);
    setNote(`Effort set to ${cap(l)}`);
  };

  const openSub = (s: "effort" | "more" | null, viaKeyboard: boolean) => {
    if (phone && !viaKeyboard && s !== null) return; // phones open pages on click, not on hover
    setSub(s);
    if (viaKeyboard && s) setFocusKey(s === "effort" ? `e-${effort}` : (models.find((m) => !featured.includes(m.id))?.id ?? undefined));
  };

  const mainRows: Row[] = [
    ...featured
      .map((f) => byId(f))
      .filter((m): m is PickerModel => !!m)
      .map<Row>((m) => ({
        key: m.id,
        label: m.name,
        role: "menuitemradio",
        checked: m.id === current.id,
        onChoose: () => chooseModel(m),
        content: (
          <>
            <span className="relative">
              <Mark provider={provider(m.provider)} />
            </span>
            <span className="relative min-w-0">
              <span className="block truncate text-[13.5px] font-medium">{m.name}</span>
              <span className="block truncate text-[12px] text-[#6c6c78] dark:text-[#9a9aa6]">{m.blurb}</span>
            </span>
            <span className="relative">
              <Check on={m.id === current.id} />
            </span>
          </>
        ),
      })),
    ...(current.effort
      ? [
          {
            key: "effort",
            label: "Effort",
            divider: true,
            role: "menuitem" as const,
            sub: "effort" as const,
            onChoose: () => openSub(sub === "effort" && !phone ? null : "effort", phone),
            content: (
              <>
                <svg viewBox="0 0 24 24" className="relative size-4 text-[#6c6c78] dark:text-[#9a9aa6]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M4 16a8 8 0 1 1 16 0" />
                  <path d="M12 16l4-5" />
                </svg>
                <span className="relative text-[13.5px] font-medium">Effort</span>
                <span className="relative inline-flex items-center gap-1 text-[12.5px] text-[#6c6c78] dark:text-[#9a9aa6]">
                  {effort ? cap(effort) : ""} <Chevron />
                </span>
              </>
            ),
          },
        ]
      : []),
    {
      key: "more",
      label: "More models",
      divider: !current.effort,
      role: "menuitem",
      sub: "more",
      onChoose: () => openSub(sub === "more" && !phone ? null : "more", phone),
      content: (
        <>
          <svg viewBox="0 0 24 24" className="relative size-4 text-[#6c6c78] dark:text-[#9a9aa6]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
            <path d="M12 3l9 5-9 5-9-5z" />
            <path d="M3 13l9 5 9-5" />
          </svg>
          <span className="relative text-[13.5px] font-medium">More models</span>
          <span className="relative inline-flex items-center gap-1 text-[12.5px] text-[#6c6c78] dark:text-[#9a9aa6]">
            {models.length - featured.length} <Chevron />
          </span>
        </>
      ),
    },
  ];

  const backRow: Row = {
    key: "back",
    label: "Back",
    role: "menuitem",
    onChoose: () => {
      setFocusKey(sub ?? undefined);
      setSub(null);
    },
    content: (
      <>
        <span className="relative text-[#6c6c78] dark:text-[#9a9aa6]">
          <Chevron dir="left" />
        </span>
        <span className="relative text-[13.5px] font-medium text-[#6c6c78] dark:text-[#9a9aa6]">Back</span>
        <span />
      </>
    ),
  };

  const effortRows: Row[] = (current.effort?.levels ?? []).map((l) => ({
    key: `e-${l}`,
    label: cap(l),
    role: "menuitemradio",
    checked: l === effort,
    onChoose: () => chooseEffort(l),
    content: (
      <>
        <span className="relative flex gap-[3px]" aria-hidden>
          {LEVELS.map((x, i) => (
            <i key={x} className={cn("h-2.5 w-1 rounded-sm", i <= LEVELS.indexOf(l) ? "bg-[#16161b] dark:bg-[#f1f1f4]" : "bg-[#e7e7ec] dark:bg-[#26262e]")} />
          ))}
        </span>
        <span className="relative text-[13.5px] font-medium">{cap(l)}</span>
        <span className="relative">
          <Check on={l === effort} />
        </span>
      </>
    ),
  }));

  const rest = models.filter((m) => !featured.includes(m.id));
  const moreGroups: Record<string, string> = {};
  rest.forEach((m, i) => {
    if (i === 0 || rest[i - 1].provider !== m.provider) moreGroups[m.id] = provider(m.provider)?.name ?? m.provider;
  });
  const moreRows: Row[] = rest.map((m) => ({
    key: m.id,
    label: m.name,
    role: "menuitemradio",
    checked: m.id === current.id,
    onChoose: () => chooseModel(m),
    content: (
      <>
        <span className="relative">
          <Mark provider={provider(m.provider)} />
        </span>
        <span className="relative truncate text-[13.5px] font-medium">{m.name}</span>
        <span className="relative">
          <Check on={m.id === current.id} />
        </span>
      </>
    ),
  }));

  const subRows = sub === "effort" ? effortRows : moreRows;
  const subGroups = sub === "more" ? moreGroups : { [effortRows[0]?.key ?? ""]: "Thinking effort" };
  const surface = "rounded-2xl bg-white p-1.5 text-[#16161b] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_48px_-20px_rgba(20,20,40,0.35)] dark:bg-[#1b1b21] dark:text-[#f1f1f4] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_48px_-20px_rgba(0,0,0,0.9)]";
  const money = (n: number) => `$${n.toFixed(2)}`;
  const stats = [
    { k: "Context", v: `${current.context} tokens` },
    { k: "Input / 1M", v: current.price ? money(current.price.input) : "Self-hosted" },
    { k: "Output / 1M", v: current.price ? money(current.price.output) : "Self-hosted" },
    { k: "Effort", v: effort ? cap(effort) : "Not adjustable" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex w-full flex-col items-center px-4 py-14 sm:py-20", className)}>
        <div ref={root} className="relative z-10">
          <motion.button
            ref={pill}
            layout
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Model: ${current.name}${effort ? `, ${effort} effort` : ""}. Change model`}
            onClick={() => (open ? close(false) : openMenu(false))}
            onKeyDown={(e) => {
              if (["ArrowDown", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                openMenu(true);
              }
            }}
            style={{ borderRadius: 999 }}
            className={cn(
              "inline-flex h-10 items-center gap-2 overflow-hidden whitespace-nowrap border border-[#e7e7ec] bg-white pl-2.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#f1f1f5] dark:border-[#26262e] dark:bg-[#1b1b21] dark:hover:bg-[#25252d]",
              FOCUS,
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${current.id}-${effort}`}
                layout="position"
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2"
              >
                <Mark provider={provider(current.provider)} />
                <span className="text-[13.5px] font-medium text-[#16161b] dark:text-[#f1f1f4]">{current.name}</span>
                {effort && <span className="text-[13px] text-[#6c6c78] dark:text-[#9a9aa6]">{cap(effort)}</span>}
              </motion.span>
            </AnimatePresence>
            <motion.span layout="position" animate={{ rotate: open ? 180 : 0 }} className="text-[#6c6c78] dark:text-[#9a9aa6]">
              <Chevron dir="down" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {open && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
                style={{ transformOrigin: "top center" }}
                className={cn("absolute left-1/2 top-[calc(100%+8px)] w-[min(296px,calc(100vw-48px))] -translate-x-1/2", surface)}
              >
                {phone && sub ? (
                  <MenuList
                    key={`page-${sub}`}
                    id={`${id}-page`}
                    rows={[backRow, ...subRows]}
                    groups={subGroups}
                    onBack={() => backRow.onChoose()}
                    onClose={close}
                    autoFocusKey={focusKey}
                    className="max-h-[300px] overflow-y-auto"
                  />
                ) : (
                  <MenuList id={`${id}-main`} rows={mainRows} onSub={openSub} onClose={close} autoFocusKey={sub ? undefined : focusKey} />
                )}

                <AnimatePresence>
                  {!phone && sub && (
                    <motion.div
                      key={sub}
                      initial={{ opacity: 0, x: -6, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ type: "spring", stiffness: 520, damping: 34 }}
                      style={{ transformOrigin: "bottom left" }}
                      className={cn("absolute left-[calc(100%+6px)] bottom-0 max-h-[340px] w-[236px] overflow-y-auto", surface)}
                    >
                      <MenuList
                        id={`${id}-${sub}`}
                        rows={subRows}
                        groups={subGroups}
                        onBack={() => {
                          const s = sub;
                          setSub(null);
                          setFocusKey(s ?? undefined);
                        }}
                        onClose={close}
                        autoFocusKey={focusKey}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showSummary && (
          <section aria-label="Selected model" className="mt-6 w-[min(560px,100%)] text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${current.id}-${effort}`} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.18 }}>
                <p className="mx-auto min-h-[42px] max-w-[46ch] text-[14px] text-[#6c6c78] dark:text-[#9a9aa6]">{current.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.k} className="rounded-[14px] bg-[#f7f7f9] px-2.5 py-3 shadow-[inset_0_0_0_1px_#e7e7ec] dark:bg-[#18181d] dark:shadow-[inset_0_0_0_1px_#26262e]">
                      <div className="text-[11.5px] text-[#6c6c78] dark:text-[#9a9aa6]">{s.k}</div>
                      <div className="mt-0.5 text-[15px] font-semibold tabular-nums text-[#16161b] dark:text-[#f1f1f4]">{s.v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-3 h-[18px]" role="status" aria-live="polite">
              <AnimatePresence>
                {note && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1.5 text-[12.5px] text-[#12a865] dark:text-[#3ddc8f]"
                  >
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {note}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {footnote && <p className="mt-2 text-[11.5px] text-[#a9a9b4] dark:text-[#5a5a65]">{footnote}</p>}
          </section>
        )}
      </div>
    </MotionConfig>
  );
}

export interface ModelPickerSectionProps extends ModelPickerProps {
  eyebrow?: string;
  title?: string;
  /** No effect: the picker waits for the visitor. Accepted so the section fits the Motion Kit preview contract. */
  autoplay?: boolean;
}

/** The picker on a dotted stage with a heading, ready to drop into a page. */
export function ModelPickerSection({ eyebrow = "Choose a model", title = "Pick who answers", className, autoplay: _autoplay, ...picker }: ModelPickerSectionProps) {
  void _autoplay;
  return (
    <section aria-label={title} className={cn("w-full bg-white px-4 py-14 sm:px-6 sm:py-20 dark:bg-black", className)}>
      <div className="relative mx-auto max-w-[980px] overflow-visible rounded-[28px] bg-[#f7f7f9] dark:bg-[#131317]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_1px_1px,rgba(22,22,27,0.09)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(241,241,244,0.09)_1px,transparent_0)]"
        />
        <div className="relative pt-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-[#6c6c78] dark:text-[#9a9aa6]">{eyebrow}</p>
          <h2 className="mt-1.5 text-[clamp(24px,3.2vw,32px)] font-semibold tracking-[-0.04em] text-[#16161b] dark:text-[#f1f1f4]">{title}</h2>
        </div>
        <ModelPicker {...picker} className="relative min-h-[460px] pt-8" />
      </div>
    </section>
  );
}
