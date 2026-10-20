"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export type LinkPreviewProps = {
  /** Destination: an internal path (/about) or a full URL. */
  href: string;
  /** Picture for the card. Without one the card draws a cover from the title and site name. */
  image?: string;
  /** Card heading. */
  title?: string;
  /** One line under the heading. */
  description?: string;
  /** The link text. */
  children: React.ReactNode;
  /** Card width in px. */
  width?: number;
  /** Height of the picture area in px. */
  height?: number;
  /** Wait before the card rises, in seconds. */
  delay?: number;
  /** Extra classes for the link. */
  className?: string;
  /** Extra classes for the floating card. */
  previewClassName?: string;
  /** Opens the link in a new tab. */
  openInNewTab?: boolean;
  /** Controls the card from outside. Leave unset to open on hover and focus. */
  open?: boolean;
  /** Opens and closes the card on its own until someone hovers or focuses the link. */
  autoplay?: boolean;
};

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Stable hue from a string so a generated cover always looks the same for the same link. */
function hueOf(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

const noop = () => () => {};
const useMounted = () => React.useSyncExternalStore(noop, () => true, () => false);

/** Rise: the card grows up out of the link, stretched, and settles with an overshoot. */
const RISE = { type: "spring" as const, stiffness: 380, damping: 17, mass: 0.7 };

/**
 * An inline link that lifts a preview card out of the text when you hover or
 * focus it. The card rises with a stretch and settles, then leans and slides
 * as the pointer moves along the link and swings back when it stops. Without
 * an image it draws its own cover.
 */
export function LinkPreview({
  href,
  image,
  title,
  description,
  children,
  width = 300,
  height = 168,
  delay = 0.08,
  className = "",
  previewClassName = "",
  openInNewTab = true,
  open,
  autoplay = false,
}: LinkPreviewProps) {
  const still = useReducedMotion() === true;
  const mounted = useMounted();
  const anchor = React.useRef<HTMLAnchorElement>(null);
  const touched = React.useRef(false);
  const [hover, setHover] = React.useState(false);
  const [demo, setDemo] = React.useState(false);
  const [below, setBelow] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const shown = open ?? (hover || demo);

  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const px = useMotionValue(0);
  const pv = useVelocity(px);
  const shift = useSpring(useTransform(px, [-1, 1], [-14, 14]), { stiffness: 160, damping: 18 });
  const lean = useSpring(useTransform(pv, [-6, 0, 6], [-7, 0, 7]), { stiffness: 220, damping: 11 });

  const host = hostOf(href);
  const hue = hueOf(host || title || href);
  const art = !image || failed;

  // Track the link while the card is up so it stays put on scroll and resize.
  React.useEffect(() => {
    if (!shown) return;
    let raf = 0;
    const tick = () => {
      const el = anchor.current;
      if (el) {
        const r = el.getBoundingClientRect();
        ax.set(r.left + r.width / 2);
        ay.set(below ? r.bottom + 12 : r.top - 12);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [shown, below, ax, ay]);

  // Autoplay: lift the card, sweep the lean across, drop it, repeat.
  React.useEffect(() => {
    if (!autoplay || open !== undefined) return;
    let on = false;
    let sweep = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      on = !on;
      if (on) {
        const r = anchor.current?.getBoundingClientRect();
        setBelow(!!r && r.top < height + 96);
      }
      setDemo(on);
      sweep++;
      px.set(on ? (sweep % 4 === 1 ? 0.8 : -0.8) : 0);
    }, 2200);
    return () => window.clearInterval(t);
  }, [autoplay, open, px, height]);

  const show = () => {
    touched.current = true;
    setDemo(false);
    const r = anchor.current?.getBoundingClientRect();
    setBelow(!!r && r.top < height + 96);
    setHover(true);
  };
  const hide = () => {
    setHover(false);
    px.set(0);
  };

  const card = (
    <AnimatePresence>
      {shown && (
        <motion.div key="lp" className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ x: ax, y: ay }} aria-hidden="true">
          <div style={{ width, transform: `translate(-50%, ${below ? "0" : "-100%"})` }}>
            <motion.div
              style={{ x: shift, rotate: lean, originX: 0.5, originY: below ? 0 : 1 }}
              initial={still ? { opacity: 0 } : { opacity: 0, scaleY: 0.4, scaleX: 0.8, y: below ? -10 : 10 }}
              animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0, transition: { ...RISE, delay, opacity: { duration: 0.12, delay } } }}
              exit={{ opacity: 0, scaleY: 0.7, scaleX: 0.9, y: below ? -6 : 6, transition: { duration: 0.14 } }}
              className={cn(`overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-24px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-20px_rgba(0,0,0,.9)]`, previewClassName)}
            >
              <div className="relative overflow-hidden" style={{ height }}>
                {art ? (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 92% 66%), hsl(${(hue + 48) % 360} 84% 48%))` }}
                    initial={still ? false : { scale: 1.18 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay }}
                  >
                    <span className="absolute -right-6 -top-10 h-36 w-36 rounded-full bg-white/20" />
                    <span className="absolute -bottom-14 left-6 h-28 w-28 rounded-full bg-black/10" />
                    <span className="absolute bottom-4 left-4 right-4 truncate text-[22px] font-semibold leading-none tracking-[-0.03em] text-white">{title ?? host}</span>
                  </motion.div>
                ) : (
                  <>
                    {!loaded && <div className="absolute inset-0 animate-pulse bg-[#f0f0f3] dark:bg-[#2c2c2e]" />}
                    <motion.img
                      src={image}
                      alt=""
                      draggable={false}
                      onLoad={() => setLoaded(true)}
                      onError={() => setFailed(true)}
                      className="h-full w-full object-cover"
                      initial={still ? false : { scale: 1.15, filter: "blur(8px)" }}
                      animate={{ scale: 1, filter: loaded ? "blur(0px)" : "blur(8px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </>
                )}
              </div>
              {(title || description || host) && (
                <div className="px-4 pb-3.5 pt-3">
                  {title && <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</p>}
                  {description && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>}
                  {host && <p className="mt-1.5 text-[11px] text-[#86868b] dark:text-[#98989d]">{host}</p>}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Link
        ref={anchor}
        href={href}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-description={title ? `Preview: ${title}${description ? `. ${description}` : ""}` : undefined}
        onPointerEnter={(e) => e.pointerType !== "touch" && show()}
        onPointerLeave={(e) => e.pointerType !== "touch" && hide()}
        onPointerMove={(e) => {
          const el = anchor.current;
          if (!el || e.pointerType === "touch") return;
          const r = el.getBoundingClientRect();
          px.set(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1);
        }}
        onClick={(e) => {
          // First tap on touch screens shows the card; the second follows the link.
          if (window.matchMedia("(hover: none)").matches && !hover) {
            e.preventDefault();
            show();
          }
        }}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === "Escape" && hide()}
        className={cn(`rounded-[4px] font-medium text-[#0071e3] underline decoration-[#0071e3]/35 decoration-[1.5px] underline-offset-[3px] outline-none transition-colors hover:decoration-[#0071e3] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:text-[#2997ff] dark:decoration-[#2997ff]/40 dark:hover:decoration-[#2997ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black`, className)}
      >
        {children}
      </Link>
      {mounted && createPortal(card, document.body)}
    </>
  );
}

export default LinkPreview;
