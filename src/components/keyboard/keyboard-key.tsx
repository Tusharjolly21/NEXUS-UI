"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { KeyDef } from "./keyboard-layout";

export interface KeyboardKeyProps {
  keyDef: KeyDef;
  isActive: boolean;
  isFnRow?: boolean;
  theme: "dark" | "light";
  keyClassName?: string;
  onPress: (key: KeyDef) => void;
}

export const KeyboardKey = React.memo(function KeyboardKey({
  keyDef,
  isActive,
  isFnRow = false,
  theme,
  keyClassName,
  onPress,
}: KeyboardKeyProps) {
  const reduce = useReducedMotion();
  const isDark = theme === "dark";

  const isSpace    = keyDef.kind === "space";
  const isModifier = keyDef.kind === "modifier" || keyDef.kind === "fn" || keyDef.kind === "nav";
  const isEnter    = keyDef.kind === "enter";
  const isDelete   = keyDef.kind === "delete";

  // ── Visual classes ────────────────────────────────────────────
  const baseKey = cn(
    // layout
    "relative select-none cursor-pointer outline-none",
    "flex items-end justify-center pb-1.5",
    isFnRow ? "h-7 rounded-[4px]" : "h-10 rounded-[6px]",
    // typography
    "font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',system-ui]",
    isSpace ? "text-[0px]"
    : isFnRow ? "text-[9px] font-medium tracking-tight"
    : isModifier ? "text-[10px] font-medium tracking-tight leading-none"
    : "text-[13px] font-medium tracking-tight",
    // base colors — overridden by active/pressed variants below
    isDark
      ? "text-neutral-200 bg-gradient-to-b from-[#3e3e42] to-[#2c2c30]"
      : "text-neutral-700 bg-gradient-to-b from-[#f5f5f7] to-[#e2e2e5]",
    // border / depth shadow that creates the 3-D "key face" look
    isDark
      ? "shadow-[0_1px_0_0_#000,0_2px_4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]"
      : "shadow-[0_1px_0_0_#9e9e9e,0_2px_4px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]",
    // active highlight
    isActive && (
      isDark
        ? "from-[#0ea5e9] to-[#0284c7] text-white shadow-[0_1px_0_0_#0369a1,0_2px_8px_rgba(14,165,233,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]"
        : "from-[#0ea5e9] to-[#0284c7] text-white shadow-[0_1px_0_0_#0369a1,0_2px_8px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]"
    ),
    // hover (not applied when active)
    !isActive && (isDark ? "hover:from-[#48484d] hover:to-[#363638]" : "hover:from-[#fafafa] hover:to-[#e8e8eb]"),
    keyClassName,
  );

  const pressVariants: Variants = reduce
    ? {}
    : {
        initial: { y: 0, scale: 1 },
        press:   { y: 1,  scale: 0.97 },
      };

  const handleClick = React.useCallback(() => onPress(keyDef), [onPress, keyDef]);

  return (
    <motion.button
      type="button"
      aria-label={keyDef.label === "⌫" ? "Backspace" : keyDef.label || keyDef.id}
      aria-pressed={isActive}
      style={{ flex: keyDef.width }}
      animate={isActive && !reduce ? "press" : "initial"}
      variants={pressVariants}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
      whileTap={reduce ? undefined : "press"}
      className={baseKey}
      onClick={handleClick}
    >
      {isSpace ? null : (
        <span className="relative flex flex-col items-center justify-end gap-0">
          {/* shift-layer label */}
          {keyDef.sub && !isModifier && !isFnRow && (
            <span
              className={cn(
                "absolute -top-2 left-0 text-[8px] leading-none",
                isDark ? "text-neutral-400" : "text-neutral-400",
                isActive && "text-sky-100",
              )}
            >
              {keyDef.sub}
            </span>
          )}
          <span>{keyDef.label}</span>
        </span>
      )}
    </motion.button>
  );
});
