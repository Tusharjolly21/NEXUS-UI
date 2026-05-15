"use client";

/**
 * Gooey search input — expandable pill with a detached icon bubble merged via SVG goo filter.
 * Live demo: `/demos/gooey-input`
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GooeyInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size" | "value" | "defaultValue" | "width"
> & {
  placeholder?: string;
  collapsedWidth?: number;
  expandedWidth?: number;
  /** Positive px: `marginLeft` on the pill row when expanded (room for the left bubble). */
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden focusable="false">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId, className }: { layoutId: string; className?: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className={cn("size-4 shrink-0", className)}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

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
  disabled = false,
  id,
  onChange: onChangeProp,
  onKeyDown: onKeyDownProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  ...restInput
}: GooeyInputProps) {
  const reactId = React.useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputId = id ?? `gooey-input-${safeId}`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const prevExpandedRef = React.useRef(false);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() => defaultValue ?? "");

  const isControlled = valueProp !== undefined;
  /** Always a string — `value={null}` is treated as controlled in React and would otherwise break string APIs (e.g. `.length`). */
  const searchText = (isControlled ? (valueProp ?? "") : uncontrolledValue) ?? "";

  const setSearchText = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = React.useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  React.useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  const buttonVariants = React.useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  const handleExpand = React.useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      onChangeProp?.(e);
    },
    [setSearchText, onChangeProp],
  );

  const handleBlur = React.useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  /** Dark pill on light backgrounds, white pill on dark backgrounds. */
  const surfaceClass =
    "border-0 bg-zinc-900 text-white shadow-none ring-0 outline-none dark:bg-white dark:text-zinc-900";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center border-0 bg-transparent p-0 shadow-none ring-0 outline-none",
        className,
        "border-0 ring-0 shadow-none",
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className="relative flex h-10 items-center justify-center"
        style={{
          // Goo only while collapsed — when open, the filter bridges pill + bubble so they look fused.
          filter: !disabled && !isExpanded ? `url(#${filterId})` : undefined,
        }}
      >
        <motion.div
          className="flex h-10 items-center justify-center"
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-4 text-sm font-medium text-white shadow-none ring-0 outline-none transition-colors focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-900",
              surfaceClass,
            )}
          >
            <span className="sr-only">Search</span>
            {!isExpanded ? <SearchIcon layoutId={iconLayoutId} /> : null}
            <input
              {...(restInput as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
              ref={inputRef}
              id={inputId}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              value={searchText}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur();
                onBlurProp?.(e);
              }}
              onFocus={onFocusProp}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
                onKeyDownProp?.(e);
              }}
              className={cn(
                "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm text-white shadow-none outline-none ring-0 dark:text-zinc-900",
                isExpanded
                  ? "placeholder:text-white/50 dark:placeholder:text-zinc-400"
                  : "pointer-events-none placeholder:text-white/35 dark:placeholder:text-zinc-400/80",
              )}
            />
          </button>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center"
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div className={cn("flex size-10 items-center justify-center rounded-full", surfaceClass)}>
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
