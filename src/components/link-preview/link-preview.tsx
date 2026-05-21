"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LinkPreviewProps = {
  /** Destination URL — internal paths (/about) or external (https://...) */
  href: string;
  /** Image URL to display in the preview card */
  image: string;
  /** Optional title shown below the card */
  title?: string;
  /** The link's visible text */
  children: React.ReactNode;
  /** Preview card width in px. Default 320. */
  width?: number;
  /** Preview card height in px. Default 200. */
  height?: number;
  /** Entrance animation delay in seconds. Default 0.08. */
  delay?: number;
  /** Extra className for the anchor element */
  className?: string;
  /** Extra className for the preview tooltip wrapper */
  previewClassName?: string;
  /** Opens link in a new tab. Default true. */
  openInNewTab?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LinkPreview({
  href,
  image,
  title,
  children,
  width = 320,
  height = 200,
  delay = 0.08,
  className,
  previewClassName,
  openInNewTab = true,
}: LinkPreviewProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Viewport-relative position of the anchor element — used for portal positioning
  const [anchorPos, setAnchorPos] = React.useState({ top: 0, left: 0 });

  const anchorRef = React.useRef<HTMLAnchorElement>(null);

  // Normalised mouse position (-1 … 1) within the link element
  const mouseXRaw = useMotionValue(0);
  const springX = useSpring(mouseXRaw, { stiffness: 90, damping: 16, mass: 0.6 });
  const rotateZ = useTransform(springX, [-1, 1], [-5, 5]);
  const shiftX = useTransform(springX, [-1, 1], [-12, 12]);

  React.useEffect(() => {
    setMounted(true);
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  function captureAnchorPos() {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchorPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = anchorRef.current;
    if (!el) return;
    const { left, width: w } = el.getBoundingClientRect();
    mouseXRaw.set(((e.clientX - left) / w) * 2 - 1);
  }

  function handleMouseEnter() {
    captureAnchorPos();
    setIsVisible(true);
  }

  function handleMouseLeave() {
    setIsVisible(false);
    mouseXRaw.set(0);
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    captureAnchorPos();
    setIsVisible((v) => !v);
  }

  const hostname = getHostname(href);

  // Tooltip top = anchor top − card height − gap − title row − caret
  const tooltipTop = anchorPos.top - height - 56;

  const tooltip = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`link-preview-${href}`}
          initial={{ opacity: 0, y: 14, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.94,
            filter: "blur(6px)",
            transition: { duration: 0.15, ease: "easeIn" },
          }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 22,
            mass: 0.65,
            delay,
            filter: { type: "tween", duration: 0.2, ease: "easeOut", delay },
            opacity: { type: "tween", duration: 0.18, ease: "easeOut", delay },
          }}
          style={{
            position: "fixed",
            top: tooltipTop,
            left: anchorPos.left,
            marginLeft: -(width / 2),
            x: shiftX,
            rotateZ,
            width,
            transformOrigin: "bottom center",
            zIndex: 9999,
          }}
          className={cn("pointer-events-none", previewClassName)}
        >
          {/* Floating glide wrapper */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          >
            {/* Card */}
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-white",
                "border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
                "dark:border-white/[0.10] dark:bg-neutral-900",
                "dark:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]",
              )}
              style={{ width, height }}
            >
              {!imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
                  )}
                  <img
                    src={image}
                    alt={title ?? "Link preview"}
                    width={width}
                    height={height}
                    draggable={false}
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.07] dark:ring-white/[0.07]" />
                </>
              ) : (
                // Fallback gradient when image fails
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 px-6 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-purple-950/40">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg shadow-violet-400/30" />
                  <div className="space-y-2.5 text-center">
                    <div className="mx-auto h-3 w-32 rounded-full bg-violet-200/80 dark:bg-violet-700/50" />
                    <div className="mx-auto h-2 w-24 rounded-full bg-indigo-200/60 dark:bg-indigo-800/40" />
                    <div className="mx-auto h-2 w-16 rounded-full bg-purple-100/80 dark:bg-purple-800/30" />
                  </div>
                  {hostname && (
                    <span className="font-mono text-[11px] text-violet-400/80 dark:text-violet-500/70">
                      {hostname}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title + hostname row */}
            {(title || hostname) && (
              <div className="mt-2.5 flex items-center gap-2 px-0.5">
                {title && (
                  <span className="flex-1 truncate text-[11px] font-semibold leading-none text-neutral-700 dark:text-neutral-300">
                    {title}
                  </span>
                )}
                {hostname && (
                  <span className="shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-600">
                    {hostname}
                  </span>
                )}
              </div>
            )}

            {/* Downward-pointing caret */}
            <div className="absolute -bottom-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-sm border-b border-r border-neutral-200/80 bg-white dark:border-white/[0.10] dark:bg-neutral-900" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Link
        ref={anchorRef}
        href={href}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onMouseEnter={isTouchDevice ? undefined : handleMouseEnter}
        onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
        onMouseMove={isTouchDevice ? undefined : handleMouseMove}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        className={cn(
          "relative inline font-semibold",
          "text-neutral-800 dark:text-neutral-100",
          "underline decoration-violet-400/60 decoration-[1.5px] underline-offset-[3px]",
          "transition-colors duration-150",
          "hover:text-violet-600 hover:decoration-violet-500",
          "dark:hover:text-violet-400 dark:hover:decoration-violet-400",
          className,
        )}
      >
        {children}
      </Link>

      {/* Portal to body — keeps tooltip outside any <p> or inline ancestor */}
      {mounted && createPortal(tooltip, document.body)}
    </>
  );
}

export default LinkPreview;
