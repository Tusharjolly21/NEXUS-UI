"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type WordMagnetProps = {
  text?: string;
  radius?: number;
  force?: number;
  damping?: number;
  returnDelay?: number;
  disableOnMobile?: boolean;
  overflow?: React.CSSProperties["overflow"];
  className?: string;
  wordClassName?: string;
  style?: React.CSSProperties;
};

type MagneticWordProps = {
  word: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  radius: number;
  force: number;
  damping: number;
  returnDelay: number;
  disabled: boolean;
  className?: string;
};

function useIsMobile(disabled: boolean) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (!disabled || typeof window === "undefined") return;

    const check = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [disabled]);

  return isMobile;
}

function MagneticWord({
  word,
  mouseX,
  mouseY,
  containerRef,
  radius,
  force,
  damping,
  returnDelay,
  disabled,
  className,
}: MagneticWordProps) {
  const wordRef = React.useRef<HTMLSpanElement | null>(null);
  const returnTimeout = React.useRef<number | null>(null);
  const x = useSpring(0, { damping, stiffness: 200 });
  const y = useSpring(0, { damping, stiffness: 200 });

  React.useEffect(() => {
    if (disabled) {
      x.set(0);
      y.set(0);
      return;
    }

    const updatePosition = () => {
      const wordNode = wordRef.current;
      const containerNode = containerRef.current;
      if (!wordNode || !containerNode) return;

      const wordRect = wordNode.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();
      const wordCenterX = wordRect.left - containerRect.left + wordRect.width / 2;
      const wordCenterY = wordRect.top - containerRect.top + wordRect.height / 2;
      const dx = wordCenterX - mouseX.get();
      const dy = wordCenterY - mouseY.get();
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        const angle = Math.atan2(dy, dx);
        const strength = ((radius - distance) / radius) * force * 100;

        x.set(Math.cos(angle) * strength);
        y.set(Math.sin(angle) * strength);

        if (returnTimeout.current !== null) {
          window.clearTimeout(returnTimeout.current);
        }

        returnTimeout.current = window.setTimeout(() => {
          x.set(0);
          y.set(0);
        }, returnDelay);
      }
    };

    const unsubscribeX = mouseX.on("change", updatePosition);
    const unsubscribeY = mouseY.on("change", updatePosition);

    return () => {
      unsubscribeX();
      unsubscribeY();
      if (returnTimeout.current !== null) {
        window.clearTimeout(returnTimeout.current);
      }
    };
  }, [containerRef, damping, disabled, force, mouseX, mouseY, radius, returnDelay, x, y]);

  if (disabled) {
    return (
      <span className={cn("inline-block whitespace-nowrap", className)}>
        {word}
      </span>
    );
  }

  return (
    <motion.span
      ref={wordRef}
      className={cn("inline-block whitespace-nowrap will-change-transform", className)}
      style={{ x, y }}
    >
      {word}
    </motion.span>
  );
}

export function WordMagnet({
  text = "Magnetic words react to your cursor and snap back into place",
  radius = 130,
  force = 0.45,
  damping = 28,
  returnDelay = 360,
  disableOnMobile = true,
  overflow = "visible",
  className,
  wordClassName,
  style,
}: WordMagnetProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const rafRef = React.useRef<number | null>(null);
  const isMobile = useIsMobile(disableOnMobile);
  const words = React.useMemo(
    () => text.split(" ").filter((word) => word.trim().length > 0),
    [text],
  );
  const disabled = disableOnMobile && isMobile;

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      mouseX.set(nextX);
      mouseY.set(nextY);
    });
  }

  function handlePointerLeave() {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-4xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-6xl",
        className,
      )}
      style={{ overflow, ...style }}
    >
      {words.map((word, index) => (
        <MagneticWord
          key={`${word}-${index}`}
          word={word}
          mouseX={mouseX}
          mouseY={mouseY}
          containerRef={containerRef}
          radius={radius}
          force={force}
          damping={damping}
          returnDelay={returnDelay}
          disabled={disabled}
          className={wordClassName}
        />
      ))}
    </div>
  );
}

export default WordMagnet;
