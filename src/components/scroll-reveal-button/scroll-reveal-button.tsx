"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "default" | "icon" | "confirm-icon" | "confirm-full";

export interface ScrollRevealButtonProps {
  text?: string;
  confirmationText?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function ScrollRevealButton({
  text = "Download",
  confirmationText = "Downloaded",
  href,
  className,
  onClick,
}: ScrollRevealButtonProps) {
  const [phase, setPhase] = React.useState<Phase>("default");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleClick() {
    if (phase !== "default") return;
    onClick?.();
    clearTimer();
    setPhase("icon");
    timerRef.current = setTimeout(() => {
      setPhase("confirm-icon");
      timerRef.current = setTimeout(() => {
        setPhase("confirm-full");
        timerRef.current = setTimeout(() => {
          setPhase("default");
        }, 5000);
      }, 600);
    }, 800);
  }

  React.useEffect(() => () => clearTimer(), []);

  const isConfirming = phase === "confirm-icon" || phase === "confirm-full";
  const isDefault = phase === "default";

  const Tag = href ? motion.a : motion.button;
  const tagProps = href ? { href, download: true } : { type: "button" as const };

  return (
    <Tag
      {...(tagProps as Record<string, unknown>)}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-[54px] flex-col overflow-hidden rounded-xl outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/60",
        isDefault ? "cursor-pointer" : "cursor-default",
        className,
      )}
      animate={{
        backgroundColor: isConfirming ? "rgb(23, 128, 30)" : "rgb(247, 247, 247)",
        justifyContent: isDefault ? "flex-end" : "flex-start",
      }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
    >
      {/* Row 1 — icon(s) + optional confirmation text */}
      <motion.div
        className="flex flex-none items-center justify-center gap-2.5 px-5 py-3.5"
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isConfirming ? (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="flex size-7 shrink-0 items-center justify-center"
            >
              <Check strokeWidth={1.5} className="size-7 text-[rgb(247,247,247)]" />
            </motion.span>
          ) : (
            <motion.span
              key="download"
              animate={{ scale: phase === "icon" ? 1.2 : 1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
              className="flex size-7 shrink-0 items-center justify-center"
            >
              <Download strokeWidth={1.5} className="size-7 text-[rgb(31,31,31)]" />
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {phase === "confirm-full" && (
            <motion.span
              key="confirm-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
              className="overflow-hidden whitespace-pre text-[18px] font-medium text-[rgb(247,247,247)]"
            >
              {confirmationText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Row 2 — default button text */}
      <div className="flex flex-none items-center justify-center gap-2.5 px-5 py-4">
        <span className="whitespace-pre text-[18px] font-medium text-[rgb(31,31,31)]">
          {text}
        </span>
      </div>
    </Tag>
  );
}
