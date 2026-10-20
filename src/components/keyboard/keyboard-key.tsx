"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { KeyDef } from "./keyboard-layout";
import { cn } from "@/lib/utils";

export interface KeyboardKeyProps {
  keyDef: KeyDef;
  /** Held down: by the visitor, the physical keyboard or the demo. */
  isActive: boolean;
  /** Function row keys are shorter. */
  isFnRow?: boolean;
  /** Classes for the cap face (colours for the chosen theme). */
  capClassName: string;
  /** Classes for the legend while the key is held. */
  activeClassName: string;
  /** Extra classes from the `keyClassName` prop. */
  keyClassName?: string;
  /** Turns off the press spring. */
  still?: boolean;
  onPress: (key: KeyDef, el: HTMLElement) => void;
  /** Registers the element so ripples can start from its centre. */
  register: (code: string, el: HTMLElement | null) => void;
}

const NAMES: Record<string, string> = {
  Backspace: "Delete",
  Tab: "Tab",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  MetaLeft: "Command",
  MetaRight: "Command",
  ArrowLeft: "Left arrow",
  ArrowRight: "Right arrow",
  Space: "Space",
  Enter: "Return",
  CapsLock: "Caps Lock",
  Escape: "Escape",
};

/** Press: the cap sinks and squashes a touch, then springs back up. */
const PRESS = { type: "spring" as const, stiffness: 700, damping: 26, mass: 0.5 };

export const KeyboardKey = React.memo(function KeyboardKey({
  keyDef,
  isActive,
  isFnRow = false,
  capClassName,
  activeClassName,
  keyClassName = "",
  still = false,
  onPress,
  register,
}: KeyboardKeyProps) {
  const mod = keyDef.kind === "modifier" || keyDef.kind === "nav" || keyDef.kind === "enter" || keyDef.kind === "delete";
  const fn = isFnRow || keyDef.kind === "fn";
  const wordy = keyDef.label.length > 1 && !/^F\d+$/.test(keyDef.label);
  return (
    <motion.button
      type="button"
      ref={(el) => register(keyDef.code, el)}
      aria-label={NAMES[keyDef.code] ?? (keyDef.label || keyDef.id)}
      aria-pressed={isActive}
      onClick={(e) => onPress(keyDef, e.currentTarget)}
      initial={false}
      animate={still ? undefined : isActive ? { y: 1.5, scaleY: 0.94, scaleX: 0.985 } : { y: 0, scaleY: 1, scaleX: 1 }}
      whileTap={still ? undefined : { y: 1.5, scaleY: 0.94, scaleX: 0.985 }}
      transition={PRESS}
      style={{ flex: keyDef.width, originY: 1 }}
      className={cn(`relative z-10 flex min-w-0 select-none rounded-[0.32em] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${
        fn ? "h-[max(16px,3.6cqw)]" : "h-[max(24px,5.6cqw)]"
      } ${capClassName}`, keyClassName)}
    >
      {keyDef.kind !== "space" && (
        <span
          className={`pointer-events-none absolute inset-0 flex px-[0.45em] leading-none transition-colors duration-150 ${
            mod ? (keyDef.code.endsWith("Right") || keyDef.kind === "enter" || keyDef.kind === "delete" ? "items-end justify-end pb-[0.45em]" : "items-end justify-start pb-[0.45em]") : "items-center justify-center"
          } ${fn || wordy ? "text-[max(7px,1.15cqw)] font-medium" : "text-[max(9px,1.9cqw)]"} ${isActive ? activeClassName : ""}`}
        >
          {keyDef.sub && !mod && !fn ? (
            <span className="flex flex-col items-center gap-[0.15em]">
              <span className="text-[0.72em] opacity-60">{keyDef.sub}</span>
              <span>{keyDef.label}</span>
            </span>
          ) : (
            keyDef.label
          )}
        </span>
      )}
    </motion.button>
  );
});
