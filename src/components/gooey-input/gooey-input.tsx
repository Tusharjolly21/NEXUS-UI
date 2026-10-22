"use client";

/**
 * Gooey search input: a pill whose search icon pinches off into its own
 * bubble through an SVG goo filter, with suggestions that ooze out below.
 * Live demo: `/demos/gooey-input`
 */

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type GooeyInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "size" | "value" | "defaultValue" | "width" | "onSelect"> & {
  placeholder?: string;
  /** Width (px) of the pill while collapsed. */
  collapsedWidth?: number;
  /** Width (px) of the field once open. */
  expandedWidth?: number;
  /** Room (px) left of the open field for the icon bubble. */
  expandedOffset?: number;
  /** Blur radius of the goo filter; higher melts the shapes together more. */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  /** Words to suggest while typing; matches drip out of the field in a list. */
  suggestions?: string[];
  /** Called when a suggestion is picked with a click or Enter. */
  onSelect?: (value: string) => void;
  /** Label on the collapsed pill. */
  collapsedLabel?: string;
  /** Opens, types a query and closes again on a loop until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

const H = 44;
const ROW = 36;
const GAP = 8;

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} className={cn("size-[17px] shrink-0", className)} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

/**
 * Gooey search input. Click the pill and its search icon stretches, necks
 * and pinches off to the left as a separate bubble while the field grows
 * with a springy overshoot. Type, and matching suggestions drip out of the
 * underside of the field through the same goo.
 */
export function GooeyInput({
  placeholder = "Type to search...",
  className,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 56,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  suggestions,
  onSelect,
  collapsedLabel = "Search",
  autoplay = false,
  disabled = false,
  enableSound = true,
  id,
  onChange: onChangeProp,
  onKeyDown: onKeyDownProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  ...restInput
}: GooeyInputProps) {
  const safeId = React.useId().replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const inputId = id ?? `gooey-input-${safeId}`;
  const listId = `gooey-list-${safeId}`;
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const touched = React.useRef(false);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() => defaultValue ?? "");
  const [active, setActive] = React.useState(0);

  const isControlled = valueProp !== undefined;
  const searchText = (isControlled ? (valueProp ?? "") : uncontrolledValue) ?? "";
  useTypedText(searchText, enableSound);

  const W = expandedOffset + expandedWidth;
  const collapsedLeft = Math.max(0, (W - collapsedWidth) / 2);

  const q = searchText.trim().toLowerCase();
  const matches = React.useMemo(() => (q && suggestions ? suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 4) : []), [q, suggestions]);
  const showList = isExpanded && matches.length > 0;

  const open = useSpring(0, still ? { stiffness: 1000, damping: 100 } : { stiffness: 240, damping: 17, mass: 0.9 });
  const panel = useSpring(0, still ? { stiffness: 1000, damping: 100 } : { stiffness: 260, damping: 20 });
  React.useEffect(() => {
    open.set(isExpanded ? 1 : 0);
  }, [isExpanded, open]);
  React.useEffect(() => {
    panel.set(showList ? matches.length * ROW + 12 : 0);
  }, [showList, matches.length, panel]);

  const pillLeft = useTransform(open, (o) => collapsedLeft + (expandedOffset - collapsedLeft) * o);
  const pillWidth = useTransform(open, (o) => Math.max(H, collapsedWidth + (expandedWidth - collapsedWidth) * o));
  const bubbleX = useTransform(open, (o) => collapsedLeft + 2 + (0 - collapsedLeft - 2) * o);
  const bubbleScale = useTransform(open, (o) => 0.55 + 0.45 * Math.min(1, Math.max(0, o)));
  const innerIcon = useTransform(open, [0, 0.35], [1, 0]);
  const fieldOpacity = useTransform(open, [0.45, 0.9], [0, 1]);
  const bubbleIcon = useTransform(open, [0.4, 0.8], [0, 1]);
  const panelHeight = useTransform(panel, (h) => Math.max(0, h));
  const panelY = useTransform(panel, (h) => (h > 1 ? 0 : -GAP));
  const listOpacity = useTransform(panel, [0, 30], [0, 1]);

  const setSearchText = React.useCallback(
    (next: string, notify = true) => {
      if (!isControlled) setUncontrolledValue(next);
      if (notify) onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = React.useCallback(
    (next: boolean, notify = true) => {
      setIsExpanded(next);
      if (!next) setSearchText("", notify);
      setActive(0);
      if (notify) onOpenChange?.(next);
    },
    [onOpenChange, setSearchText],
  );

  const expand = () => {
    touched.current = true;
    if (disabled) return;
    play("pop");
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  // Closing that the visitor caused (Escape, clicking away from an empty field) says "off"; autoplay calls setExpanded directly and answers through `play.auto`.
  const closeByUser = () => {
    if (isExpanded) play("off");
    setExpanded(false);
  };

  const pick = (s: string) => {
    play("tap");
    setSearchText(s);
    onSelect?.(s);
  };

  React.useEffect(() => {
    if (!autoplay || disabled) return;
    const word = "motion";
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      at(700, () => {
        playRef.current.auto("pop");
        setExpanded(true, false);
      });
      for (let i = 1; i <= word.length; i++) at(1300 + i * 120, () => setSearchText(word.slice(0, i), false));
      at(2700, () => setActive(1));
      at(3200, () => setActive(2));
      at(4600, () => {
        playRef.current.auto("off");
        setExpanded(false, false);
      });
      at(6200, loop);
    };
    loop();
    return () => timers.forEach(clearTimeout);
  }, [autoplay, disabled, setExpanded, setSearchText]);

  const shape = "absolute bg-[#1d1d1f] dark:bg-[#f5f5f7]";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />
      <div className={cn("relative shrink-0", disabled && "opacity-50")} style={{ width: W, height: H }}>
        {/* Goo layer: only the shapes, so text stays crisp. */}
        <div
          className="pointer-events-none absolute inset-0 [--goo-shadow:drop-shadow(0_10px_14px_rgba(0,0,0,.22))] dark:[--goo-shadow:drop-shadow(0_10px_14px_rgba(0,0,0,.6))]"
          style={{ filter: `url(#${filterId}) var(--goo-shadow)` }}
          aria-hidden="true"
        >
          <motion.div className={cn(shape, "top-0 rounded-full")} style={{ left: pillLeft, width: pillWidth, height: H }} />
          <motion.div className={cn(shape, "left-0 top-0 rounded-full")} style={{ x: bubbleX, scale: bubbleScale, width: H, height: H }} />
          <motion.div className={cn(shape, "rounded-[20px]")} style={{ left: pillLeft, width: pillWidth, top: H + GAP, y: panelY, height: panelHeight }} />
        </div>

        {/* Content layer, riding the same motion values. */}
        <motion.div className="absolute left-0 top-0 grid place-items-center text-white dark:text-[#1d1d1f]" style={{ x: bubbleX, scale: bubbleScale, width: H, height: H, opacity: bubbleIcon }} aria-hidden="true">
          <SearchIcon />
        </motion.div>
        <motion.div className="absolute top-0 flex items-center" style={{ left: pillLeft, width: pillWidth, height: H }}>
          {!isExpanded ? (
            <button
              type="button"
              disabled={disabled}
              onClick={expand}
              aria-expanded={false}
              aria-controls={inputId}
              className="absolute inset-0 flex items-center justify-center gap-2 rounded-full text-[15px] font-semibold tracking-[-0.01em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
            >
              <motion.span className="flex items-center gap-2" style={{ opacity: innerIcon }}>
                <SearchIcon />
                {collapsedLabel}
              </motion.span>
            </button>
          ) : null}
          <motion.input
            {...(restInput as React.ComponentPropsWithoutRef<typeof motion.input>)}
            ref={inputRef}
            id={inputId}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            role={suggestions ? "combobox" : undefined}
            aria-expanded={suggestions ? showList : undefined}
            aria-controls={suggestions ? listId : undefined}
            aria-autocomplete={suggestions ? "list" : undefined}
            aria-activedescendant={showList && matches[active] ? `${listId}-${active}` : undefined}
            aria-label={restInput["aria-label"] ?? "Search"}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setActive(0);
              onChangeProp?.(e);
            }}
            onFocus={onFocusProp}
            onBlur={(e) => {
              if (!searchText) closeByUser();
              onBlurProp?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                closeByUser();
                e.currentTarget.blur();
              } else if (showList && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                const d = e.key === "ArrowDown" ? 1 : -1;
                setActive((a) => (a + d + matches.length) % matches.length);
              } else if (showList && e.key === "Enter" && matches[active]) {
                e.preventDefault();
                pick(matches[active]);
              }
              onKeyDownProp?.(e);
            }}
            disabled={disabled || !isExpanded}
            placeholder={placeholder}
            tabIndex={isExpanded ? 0 : -1}
            style={{ opacity: fieldOpacity }}
            className={cn(
              "h-full w-full min-w-0 appearance-none rounded-full border-0 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-white/55 dark:text-[#1d1d1f] dark:placeholder:text-[#1d1d1f]/50 [&::-webkit-search-cancel-button]:hidden",
              !isExpanded && "pointer-events-none",
            )}
          />
        </motion.div>
        {suggestions ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="absolute overflow-hidden py-1.5"
            style={{ left: pillLeft, width: pillWidth, top: H + GAP, height: panelHeight, opacity: listOpacity }}
          >
            {showList
              ? matches.map((m, i) => {
                  const at = m.toLowerCase().indexOf(q);
                  return (
                    <li
                      key={m}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onPointerDown={(e) => e.preventDefault()}
                      onPointerMove={() => setActive(i)}
                      onClick={() => pick(m)}
                      className="relative mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-[14px] px-2.5 text-[14px] text-white/70 dark:text-[#1d1d1f]/70"
                      style={{ height: ROW }}
                    >
                      {i === active ? (
                        <motion.span layoutId={`gooey-hl-${safeId}`} className="absolute inset-0 rounded-[14px] bg-white/[0.12] dark:bg-black/[0.08]" transition={{ type: "spring", stiffness: 600, damping: 40 }} />
                      ) : null}
                      <SearchIcon className="relative size-[13px] opacity-60" />
                      <span className="relative truncate">
                        {m.slice(0, at)}
                        <span className="font-semibold text-white dark:text-[#1d1d1f]">{m.slice(at, at + q.length)}</span>
                        {m.slice(at + q.length)}
                      </span>
                    </li>
                  );
                })
              : null}
          </motion.ul>
        ) : null}
      </div>
    </div>
  );
}
