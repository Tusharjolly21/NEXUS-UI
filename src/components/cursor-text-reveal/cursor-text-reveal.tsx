"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type CursorTextRevealProps = {
  baseText: string;
  revealText?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  revealImage?: string;
  revealImagePosition?: string;
  mode?: "text" | "image";
  maskSize?: number;
  initialMaskSize?: number;
  smoothness?: number;
  baseTextClassName?: string;
  revealTextClassName?: string;
  containerClassName?: string;
  className?: string;
  fontSize?: string;
  align?: "left" | "center" | "right";
  enableGlow?: boolean;
  showAmbient?: boolean;
  showGrid?: boolean;
  revealBackgroundClassName?: string;
};

const alignClass = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
} satisfies Record<NonNullable<CursorTextRevealProps["align"]>, string>;

export function CursorTextReveal({
  baseText,
  revealText,
  backgroundImage,
  backgroundPosition = "center",
  revealImage,
  revealImagePosition = "center",
  mode = "text",
  maskSize = 240,
  initialMaskSize = 0,
  smoothness = 0.18,
  baseTextClassName,
  revealTextClassName,
  containerClassName,
  className,
  fontSize = "clamp(2.75rem, 8vw, 8rem)",
  align = "center",
  enableGlow = true,
  showAmbient = true,
  showGrid = true,
  revealBackgroundClassName,
}: CursorTextRevealProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const size = useMotionValue(initialMaskSize);

  const springConfig = React.useMemo(() => {
    const safeSmoothness = Math.max(0.04, Math.min(smoothness, 0.6));
    return {
      stiffness: Math.round(95 / safeSmoothness),
      damping: Math.round(22 + safeSmoothness * 70),
      mass: 0.45 + safeSmoothness,
    };
  }, [smoothness]);

  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothSize = useSpring(size, {
    stiffness: 260,
    damping: 32,
    mass: 0.8,
  });

  const maskImage = useMotionTemplate`radial-gradient(circle ${smoothSize}px at ${smoothX}px ${smoothY}px, black 0%, black 72%, rgba(0,0,0,0.9) 82%, rgba(0,0,0,0.22) 92%, transparent 100%)`;
  const inverseMaskImage = useMotionTemplate`radial-gradient(circle ${smoothSize}px at ${smoothX}px ${smoothY}px, transparent 0%, transparent 74%, rgba(0,0,0,0.18) 86%, black 98%, black 100%)`;
  const glowSize = useTransform(smoothSize, (value) => `${Math.max(value * 1.03, 0)}px`);
  const glowOpacity = useTransform(smoothSize, [0, maskSize], [0, 1]);

  const setPointFromEvent = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const rect = rootRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
    },
    [x, y],
  );

  const showMask = React.useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    size.set(maskSize);
  }, [maskSize, size]);

  const hideMask = React.useCallback(() => {
    size.set(initialMaskSize);
  }, [initialMaskSize, size]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const placeAtCenter = () => {
      const rect = root.getBoundingClientRect();
      x.set(rect.width / 2);
      y.set(rect.height / 2);
    };

    placeAtCenter();

    const media = window.matchMedia("(pointer: coarse)");
    if (media.matches) {
      size.set(Math.max(initialMaskSize, maskSize * 0.28));
    }

    const resizeObserver = new ResizeObserver(placeAtCenter);
    resizeObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [initialMaskSize, maskSize, size, x, y]);

  const contentText = revealText ?? baseText;
  const imageBackground =
    revealImage ??
    "radial-gradient(circle at 35% 30%, #f8fafc 0%, #a78bfa 28%, #22d3ee 52%, #020617 100%)";

  return (
    <section
      ref={rootRef}
      className={cn(
        "relative isolate flex min-h-[520px] w-full cursor-none touch-none overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 px-5 py-20 text-white shadow-2xl shadow-black/40 sm:min-h-[640px] sm:px-10",
        alignClass[align],
        containerClassName,
      )}
      onPointerEnter={(event) => {
        setPointFromEvent(event);
        showMask();
      }}
      onPointerMove={(event) => {
        setPointFromEvent(event);
        showMask();
      }}
      onPointerLeave={hideMask}
      onPointerDown={(event) => {
        setPointFromEvent(event);
        showMask();
      }}
      onPointerUp={() => {
        hideTimerRef.current = window.setTimeout(hideMask, 900);
      }}
      onPointerCancel={hideMask}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition }}
        />
      )}
      {backgroundImage && <div className="absolute inset-0 bg-black/45" />}
      {showAmbient && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.20),transparent_34%),radial-gradient(circle_at_18%_80%,rgba(14,165,233,0.14),transparent_28%)]" />
      )}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />
      )}

      <motion.div
        className={cn("relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center", className)}
        style={{
          WebkitMaskImage: inverseMaskImage,
          maskImage: inverseMaskImage,
        }}
      >
        <h2
          className={cn(
            "max-w-5xl text-balance font-semibold leading-[0.95] tracking-[-0.04em] text-zinc-500/70 select-none",
            align === "center" && "mx-auto text-center",
            align === "right" && "ml-auto text-right",
            baseTextClassName,
          )}
          style={{ fontSize }}
        >
          {baseText}
        </h2>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
        }}
      >
        {revealBackgroundClassName && <div className={cn("absolute inset-0", revealBackgroundClassName)} />}
        {mode === "image" && (
          <div
            className="absolute inset-0 opacity-95"
            style={{
              background: revealImage ? undefined : imageBackground,
              backgroundImage: revealImage ? `url(${revealImage})` : undefined,
              backgroundPosition: revealImagePosition,
              backgroundSize: "cover",
            }}
          />
        )}
        {mode === "image" && <div className="absolute inset-0 bg-zinc-950/10" />}

        <div
          className={cn(
            "relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-5 py-20 sm:px-10",
            className,
          )}
        >
          <h2
            className={cn(
              "max-w-5xl text-balance font-semibold leading-[0.95] tracking-[-0.04em] select-none",
              align === "center" && "mx-auto text-center",
              align === "right" && "ml-auto text-right",
              mode === "text" ? "text-white" : "text-white drop-shadow-[0_0_28px_rgba(15,23,42,0.42)]",
              revealTextClassName,
            )}
            style={{ fontSize }}
          >
            {contentText}
          </h2>
        </div>
      </motion.div>

      {enableGlow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/[0.03] shadow-[0_0_48px_rgba(147,197,253,0.38),inset_0_0_42px_rgba(255,255,255,0.08)] backdrop-blur-[1px]"
          style={{
            left: smoothX,
            top: smoothY,
            width: glowSize,
            height: glowSize,
            opacity: glowOpacity,
          }}
        />
      )}
    </section>
  );
}

export default CursorTextReveal;
