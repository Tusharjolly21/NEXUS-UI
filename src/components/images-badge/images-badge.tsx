"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type BadgeImage = {
  /** Picture URL. Leave it out to show initials on a colour instead. */
  src?: string;
  /** Name: the image's alt text, the tooltip and the initials. */
  alt: string;
  /** Background for the initials when there is no `src`. Defaults to a colour picked from the name. */
  color?: string;
};

export interface ImagesBadgeProps {
  /** People or pictures in the stack, front first. */
  images?: BadgeImage[];
  /** How many show while the stack is closed. */
  maxVisible?: number;
  /** How many more fan out when it opens. Anyone beyond that is counted in the +N chip. */
  revealCount?: number;
  /** Text after the stack. */
  label?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded" | "square";
  /** Opens the stack and walks the name tag along it, again and again, until someone hovers or focuses it. */
  autoplay?: boolean;
  className?: string;
  imageClassName?: string;
  /** Makes the whole badge a button. */
  onClick?: () => void;
}

const DEFAULT_PEOPLE: BadgeImage[] = [
  { alt: "Ava Chen" },
  { alt: "Noah Park" },
  { alt: "Mira Shah" },
  { alt: "Leo Grant" },
  { alt: "Zoe Ito" },
  { alt: "Kai Moss" },
  { alt: "Sam Reyes" },
];

const CFG = {
  sm: { px: 30, gap: 6, text: "text-[12px]", pill: "h-10 pl-1.5 pr-3.5 gap-2.5" },
  md: { px: 38, gap: 8, text: "text-[13px]", pill: "h-12 pl-[5px] pr-4 gap-3" },
  lg: { px: 50, gap: 10, text: "text-[15px]", pill: "h-[62px] pl-1.5 pr-5 gap-3.5" },
} as const;

const RADIUS = { circle: "9999px", rounded: "32%", square: "18%" } as const;

/** Rest tilts, front to back, so the closed stack looks hand-placed. */
const TILT = [0, -4, 3, -5, 4, -3, 4, -4];

const FAN = { type: "spring" as const, stiffness: 340, damping: 19, mass: 0.8 };

const PALETTE = ["#0071e3", "#bf5af2", "#ff9f0a", "#30d158", "#ff375f", "#5ac8fa", "#ffd60a", "#64d2ff"];

function colourOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/**
 * A pill of overlapping avatars. Hover or focus it and the stack fans out
 * along a gentle arc, each face springing into place a beat after the last,
 * the +N count rolls down and a name tag glides from face to face under the
 * pointer (or the arrow keys).
 */
export function ImagesBadge({
  images = DEFAULT_PEOPLE,
  maxVisible = 3,
  revealCount = 2,
  label,
  size = "md",
  shape = "circle",
  autoplay = false,
  className = "",
  imageClassName = "",
  onClick,
}: ImagesBadgeProps) {
  const still = useReducedMotion() === true;
  const cfg = CFG[size] ?? CFG.md;
  const { px, gap } = cfg;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const touched = React.useRef(false);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  /** Width the face strip may use when open: the screen width minus the label and padding. */
  const [room, setRoom] = React.useState<number | null>(null);

  React.useEffect(() => {
    const measure = () => {
      const label = labelRef.current ? labelRef.current.offsetWidth + 16 : 0;
      setRoom(Math.max(0, window.innerWidth - 32 - label - 40));
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const vis = Math.max(1, maxVisible);
  const shownList = images.slice(0, vis + Math.max(0, revealCount));
  const overflow = Math.max(0, images.length - shownList.length);
  const hiddenNow = Math.max(0, images.length - Math.min(vis, images.length));
  const count = open ? overflow : hiddenNow;

  const peek = Math.round(px * 0.5);
  // Fan step: full spacing when there's room, squeezed (never below the closed peek) on narrow screens.
  const slots = shownList.length - 1 + (overflow > 0 ? 1 : 0);
  const fit = room === null || slots <= 0 ? px + gap : Math.floor((room - px) / slots);
  const step = Math.max(peek, Math.min(px + gap, fit));
  const closedW = px + (Math.min(vis, shownList.length) - 1) * peek + (hiddenNow > 0 ? peek + 6 : 0);
  const openW = px + slots * step;

  const n = useSpring(count, { stiffness: 200, damping: 24 });
  React.useEffect(() => {
    n.set(count);
  }, [count, n]);
  const shownCount = useTransform(n, (v) => `+${Math.round(v)}`);

  const ids = images.map((i) => i.alt).join("\u0000");
  React.useEffect(() => {
    const len = ids ? Math.min(ids.split("\u0000").length, vis + Math.max(0, revealCount)) : 0;
    if (!autoplay || len === 0) return;
    let step = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const cycle = len + 3;
      const k = step++ % cycle;
      if (k === 0) setOpen(true);
      if (k >= 1 && k <= len) setActive(k - 1);
      if (k === len + 1) setActive(null);
      if (k === len + 2) setOpen(false);
    }, 650);
    return () => window.clearInterval(t);
  }, [autoplay, ids, vis, revealCount]);

  const enter = () => {
    touched.current = true;
    setOpen(true);
  };
  const leave = () => {
    setOpen(false);
    setActive(null);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      touched.current = true;
      setOpen(true);
      setActive((a) => {
        const last = shownList.length - 1;
        if (a === null) return e.key === "ArrowRight" ? 0 : last;
        return Math.max(0, Math.min(last, a + (e.key === "ArrowRight" ? 1 : -1)));
      });
    }
    if (e.key === "Escape") leave();
  };

  const names = images.map((i) => i.alt).join(", ");
  const radius = RADIUS[shape] ?? RADIUS.circle;

  return (
    <motion.div
      role={onClick ? "button" : "group"}
      tabIndex={0}
      aria-label={`${label ? `${label}. ` : ""}${names}`}
      aria-expanded={open}
      onPointerEnter={(e) => e.pointerType !== "touch" && enter()}
      onPointerLeave={(e) => e.pointerType !== "touch" && leave()}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") {
          touched.current = true;
          setOpen((o) => !o);
        }
      }}
      onFocus={enter}
      onBlur={leave}
      onKeyDown={onKey}
      onClick={onClick}
      animate={still ? undefined : { y: open ? -2 : 0 }}
      transition={FAN}
      className={cn(`inline-flex select-none items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black ${onClick ? "cursor-pointer" : ""} ${cfg.pill}`, className)}
    >
      <motion.div className="relative shrink-0" style={{ height: px }} initial={false} animate={{ width: still || !open ? closedW : openW }} transition={FAN}>
        {shownList.map((img, i) => {
          const hidden = i >= vis;
          const mid = (shownList.length - 1) / 2;
          const arc = mid > 0 ? ((i - mid) / mid) ** 2 * px * 0.07 : 0;
          const x = open ? i * step : hidden ? (vis - 1) * peek : i * peek;
          const lift = active === i ? -px * 0.22 : 0;
          return (
            <motion.div
              key={`${img.alt}-${i}`}
              className={cn(`absolute left-0 top-0 overflow-hidden ring-[2.5px] ring-white dark:ring-[#1c1c1e]`, imageClassName)}
              style={{ width: px, height: px, borderRadius: radius, zIndex: active === i ? 50 : shownList.length - i }}
              initial={false}
              animate={{
                x,
                y: (open ? arc : 0) + lift,
                rotate: still ? 0 : open ? 0 : TILT[i % TILT.length],
                scale: hidden && !open ? 0.6 : active === i ? 1.12 : 1,
                opacity: hidden && !open ? 0 : 1,
              }}
              transition={{ ...FAN, delay: still ? 0 : open ? i * 0.035 : (shownList.length - i) * 0.02 }}
              onPointerEnter={() => open && setActive(i)}
            >
              {img.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- any avatar URL
                <img src={img.src} alt={img.alt} width={px} height={px} draggable={false} className="h-full w-full object-cover" />
              ) : (
                <span
                  className="grid h-full w-full place-items-center font-semibold text-white"
                  style={{ background: `linear-gradient(140deg, ${img.color ?? colourOf(img.alt)}, color-mix(in srgb, ${img.color ?? colourOf(img.alt)} 70%, #000))`, fontSize: px * 0.36 }}
                  role="img"
                  aria-label={img.alt}
                >
                  {initials(img.alt)}
                </span>
              )}
            </motion.div>
          );
        })}
        {(count > 0 || overflow > 0) && (
          <motion.span
            className={`absolute left-0 top-0 grid place-items-center bg-[#f0f0f3] font-semibold tabular-nums text-[#1d1d1f] ring-[2.5px] ring-white dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:ring-[#1c1c1e] ${cfg.text}`}
            style={{ width: px, height: px, borderRadius: radius, zIndex: 0 }}
            initial={false}
            animate={{
              x: open ? shownList.length * step : Math.min(vis, shownList.length) * peek + 6,
              opacity: open && overflow === 0 ? 0 : 1,
              scale: open && overflow === 0 ? 0.5 : 1,
            }}
            transition={FAN}
            aria-hidden="true"
          >
            <motion.span>{shownCount}</motion.span>
          </motion.span>
        )}
        <AnimatePresence>
          {open && active !== null && shownList[active] && (
            <motion.span
              key="tag"
              className="pointer-events-none absolute left-0 top-0 z-[60]"
              initial={{ opacity: 0, y: 6, scale: 0.8, x: active * step + px / 2 }}
              animate={{ opacity: 1, y: -px * 0.62 - 14, scale: 1, x: active * step + px / 2 }}
              exit={{ opacity: 0, y: 0, scale: 0.8, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
            >
              <span className="block -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[11px] font-medium text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,.5)] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
                <motion.span key={active} className="block" initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.18, delay: 0.06 }}>
                  {shownList[active].alt}
                </motion.span>
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {label && <span ref={labelRef} className={`whitespace-nowrap font-medium tracking-[-0.01em] ${cfg.text}`}>{label}</span>}
    </motion.div>
  );
}
