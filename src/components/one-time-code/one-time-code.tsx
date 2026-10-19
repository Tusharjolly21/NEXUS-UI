"use client";

import * as React from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type OneTimeCodeStatus = "idle" | "pending" | "error" | "success";

export type OneTimeCodeProps = {
  /** Number of cells. */
  length?: number;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the sanitised value on every change. */
  onChange?: (value: string) => void;
  /**
   * Called once every cell is filled. Return (or resolve) `true` to show success, `false` to
   * shake and clear, or nothing to leave the code as typed.
   */
  onComplete?: (code: string) => void | boolean | Promise<boolean | void>;
  /** Which characters are accepted. */
  pattern?: "digits" | "alphanumeric";
  /** Insert a separator after this many cells (0 = none). */
  groupAfter?: number;
  /** Accent used for the caret and the focused cell. Defaults to ink (white in dark mode). */
  accent?: string;
  /** Show the active cell even when the field is not focused (useful for demos). */
  highlightActive?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible label for the field. */
  label?: string;
  className?: string;
};

const SHAKE = [0, -10, 9, -7, 6, -3, 2, 0];

function sanitize(raw: string, pattern: "digits" | "alphanumeric", length: number) {
  const cleaned = pattern === "digits" ? raw.replace(/\D/g, "") : raw.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return cleaned.slice(0, length);
}

export function OneTimeCode({
  length = 6,
  value: valueProp,
  defaultValue = "",
  onChange,
  onComplete,
  pattern = "digits",
  groupAfter = 3,
  accent,
  highlightActive = false,
  disabled = false,
  autoFocus = false,
  label = "Verification code",
  className,
}: OneTimeCodeProps) {
  const reduce = useReducedMotion();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const controls = useAnimationControls();
  const [inner, setInner] = React.useState(() => sanitize(defaultValue, pattern, length));
  const controlled = valueProp !== undefined;
  const code = controlled ? sanitize(valueProp, pattern, length) : inner;
  const [cursor, setActive] = React.useState(code.length);
  const [focused, setFocused] = React.useState(false);
  const [rawStatus, setStatus] = React.useState<OneTimeCodeStatus>("idle");
  const lastCompleted = React.useRef<string | null>(null);
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const end = Math.min(code.length, length - 1);
  // typed from outside (controlled value, demo, autofill) the cursor follows the end of the code
  const active = focused ? Math.min(Math.max(0, cursor), end) : end;
  // a cleared or shortened code can't still be checking or verified
  const status: OneTimeCodeStatus =
    code.length < length && (rawStatus === "success" || rawStatus === "pending") ? "idle" : rawStatus;

  const setCode = React.useCallback(
    (next: string) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  React.useEffect(() => {
    if (code.length < length) lastCompleted.current = null;
  }, [code, length]);

  React.useEffect(() => {
    if (code.length !== length || lastCompleted.current === code) return;
    lastCompleted.current = code;
    const result = onCompleteRef.current?.(code);
    let cancelled = false;

    const settle = (ok: boolean | void) => {
      if (cancelled) return;
      if (ok === true) {
        setStatus("success");
        inputRef.current?.blur();
      } else if (ok === false) {
        setStatus("error");
        void controls.start({ x: reduce ? 0 : SHAKE, transition: { duration: 0.5, ease: "easeOut" } });
        window.setTimeout(() => {
          if (cancelled) return;
          setStatus("idle");
          setCode("");
          setActive(0);
        }, 900);
      } else {
        setStatus("idle");
      }
    };

    if (result instanceof Promise) {
      setStatus("pending");
      result.then(settle, () => settle(false));
    } else {
      settle(result);
    }
    return () => {
      cancelled = true;
    };
  }, [code, length, controls, reduce, setCode]);

  const locked = disabled || status === "pending" || status === "success";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    const { key } = e;
    if (key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
      return;
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => Math.min(Math.min(code.length, length - 1), a + 1));
      return;
    }
    if (key === "Home") {
      e.preventDefault();
      setActive(0);
      return;
    }
    if (key === "End") {
      e.preventDefault();
      setActive(Math.min(code.length, length - 1));
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      e.preventDefault();
      if (code[active] !== undefined && (key === "Delete" || active < code.length - 1 || code.length === length)) {
        setCode(code.slice(0, active) + code.slice(active + 1));
        if (key === "Backspace" && active === code.length - 1 && code.length < length) setActive(Math.max(0, active - 1));
      } else if (active > 0) {
        setCode(code.slice(0, active - 1) + code.slice(active));
        setActive(active - 1);
      }
      return;
    }
    if (key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const ch = sanitize(key, pattern, 1);
      e.preventDefault();
      if (!ch) return;
      const next = active < code.length ? code.slice(0, active) + ch + code.slice(active + 1) : (code + ch).slice(0, length);
      setCode(next);
      setActive(Math.min(active + 1, length - 1));
    }
  };

  // paste, autofill and mobile keyboards that don't report keys
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const next = sanitize(e.target.value, pattern, length);
    setCode(next);
    setActive(Math.min(next.length, length - 1));
  };

  const showActive = (focused || highlightActive) && !locked && status !== "error";
  const statusText =
    status === "pending" ? "Checking code" : status === "error" ? "That code didn't work" : status === "success" ? "Code verified" : "";

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <motion.div
        animate={controls}
        className="relative flex items-center gap-2"
        onPointerDown={(e) => {
          if (locked) return;
          const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-cell]");
          if (cell) setActive(Math.min(Number(cell.dataset.cell), code.length, length - 1));
        }}
      >
        {Array.from({ length }).map((_, i) => {
          const ch = code[i];
          const isActive = showActive && i === active;
          const separator = groupAfter > 0 && i > 0 && i % groupAfter === 0;
          return (
            <React.Fragment key={i}>
              {separator ? (
                <span aria-hidden className="mx-0.5 size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              ) : null}
              <motion.div
                data-cell={i}
                animate={{ y: isActive && !reduce ? -3 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "relative grid h-14 w-11 place-items-center overflow-hidden rounded-[14px] border bg-white text-[22px] font-semibold tabular-nums text-[#17181A] shadow-[0_1px_2px_rgba(16,17,20,0.06),0_4px_12px_-6px_rgba(16,17,20,0.12)] transition-[border-color,box-shadow,color] duration-200 sm:w-12",
                  "dark:bg-[#17171d] dark:text-neutral-50 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
                  status === "error"
                    ? "border-red-400 text-red-600 dark:border-red-500/70 dark:text-red-400"
                    : status === "success"
                      ? "border-green-600 text-white dark:text-white"
                      : isActive
                        ? cn(
                            "border-transparent shadow-[0_10px_22px_-10px_rgba(16,17,20,0.35)]",
                            !accent && "ring-2 ring-[#17181A] dark:ring-white",
                          )
                        : "border-black/[0.09] dark:border-white/10",
                  disabled && "opacity-50",
                )}
                style={{
                  ...(isActive && accent ? { boxShadow: `0 0 0 2px ${accent}, 0 10px 22px -10px rgba(16,17,20,0.35)` } : null),
                  transitionDelay: status === "success" && !reduce ? `${i * 60}ms` : undefined,
                }}
              >
                <motion.span
                  aria-hidden
                  className={cn("absolute inset-0", status === "error" ? "bg-red-500/10" : "bg-green-600")}
                  initial={false}
                  animate={{ opacity: status === "success" || status === "error" ? 1 : 0 }}
                  transition={{ duration: 0.25, delay: status === "success" && !reduce ? i * 0.06 : 0 }}
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {ch ? (
                    <motion.span
                      key={`${i}-${ch}`}
                      initial={reduce ? { opacity: 0 } : { y: -14, opacity: 0, scale: 0.7 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { y: 10, opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
                      transition={{ type: "spring", stiffness: 600, damping: 26 }}
                      className="relative"
                    >
                      {ch}
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                {isActive && !ch ? (
                  <motion.span
                    aria-hidden
                    className="absolute h-6 w-[2px] rounded-full bg-[#17181A] dark:bg-white"
                    style={accent ? { backgroundColor: accent } : undefined}
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 1.05, repeat: Infinity, times: [0, 0.5, 0.55, 1] }}
                  />
                ) : null}

                {status === "pending" ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.07] to-transparent dark:via-white/[0.09]"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.07 }}
                  />
                ) : null}
              </motion.div>
            </React.Fragment>
          );
        })}

        <AnimatePresence>
          {status === "success" ? (
            <motion.span
              key="ok"
              initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: reduce ? 0 : length * 0.06 }}
              className="absolute -right-10 grid size-7 place-items-center rounded-full bg-green-600 text-white shadow-[0_6px_14px_-4px_rgba(22,163,74,0.6)]"
            >
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </motion.span>
          ) : null}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            setActive(Math.min(code.length, length - 1));
          }}
          onBlur={() => setFocused(false)}
          inputMode={pattern === "digits" ? "numeric" : "text"}
          autoComplete="one-time-code"
          autoCapitalize={pattern === "digits" ? "off" : "characters"}
          autoCorrect="off"
          spellCheck={false}
          maxLength={length}
          disabled={disabled}
          readOnly={status === "pending" || status === "success"}
          autoFocus={autoFocus}
          aria-label={label}
          aria-invalid={status === "error" || undefined}
          className="absolute inset-0 h-full w-full cursor-text appearance-none bg-transparent text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent disabled:cursor-not-allowed"
        />
      </motion.div>

      <p aria-live="polite" className="sr-only">
        {statusText}
      </p>
    </div>
  );
}
