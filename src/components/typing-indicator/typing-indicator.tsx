"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type TypingIndicatorProps = {
  /** Who is typing. One name reads "Maya is typing", two "Maya and Leo are typing", more "Maya, Leo and 2 others are typing". An empty list shows the dots with no label. */
  names?: string[];
  /** Show the dots (true) or the finished message (false). Leave it out and the component runs on its own. */
  typing?: boolean;
  /** The message the bubble opens into when typing stops. */
  message?: string;
  /** Colours for a light or a dark page. */
  tone?: "light" | "dark";
  /** Alternates between typing and the message by itself until the visitor touches it. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the outer element. */
  className?: string;
};

const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;

type Portrait = { bg: string; skin: string; hair: string; shirt: string; style: "long" | "crop" | "bun" | "curls" };

/** Four original, flat portraits. They are assigned by position, so the first person typing always looks the same. */
const PORTRAITS: Portrait[] = [
  { bg: "#ffe3b8", skin: "#f1c9a5", hair: "#4a2f27", shirt: "#ff7a59", style: "long" },
  { bg: "#cfe4ff", skin: "#c58c64", hair: "#1f1a17", shirt: "#2f6fed", style: "crop" },
  { bg: "#d9f5dd", skin: "#f6d3b3", hair: "#b5502f", shirt: "#1f9d62", style: "bun" },
  { bg: "#ead9ff", skin: "#8d5a3b", hair: "#2a2024", shirt: "#7a4de0", style: "curls" },
];

function Illustration({ p }: { p: Portrait }) {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect width="40" height="40" fill={p.bg} />
      {p.style === "curls" && <circle cx="20" cy="14.5" r="11.2" fill={p.hair} />}
      {p.style === "long" && (
        <path d="M11.4 18C10 8.4 16 6 20 6c5 0 10.2 3.2 8.6 12 .3 6 1 9.6-1.6 12H13c-2.6-2.4-1.9-6-1.6-12Z" fill={p.hair} />
      )}
      {p.style === "bun" && <circle cx="27" cy="8.2" r="3.6" fill={p.hair} />}
      <path d="M4.5 40C5.6 30.4 12.6 27 20 27s14.4 3.4 15.5 13Z" fill={p.shirt} />
      <rect x="17.2" y="21" width="5.6" height="8" rx="2.4" fill={p.skin} />
      <rect x="17.2" y="25" width="5.6" height="3" fill="#000" opacity=".1" />
      <ellipse cx="20" cy="17" rx="7.4" ry="8.2" fill={p.skin} />
      {p.style === "long" && <path d="M12.6 16c.8-6 5.4-7.6 8.2-7.2 3.6.4 6.4 2.8 6.6 7.2-2.7-2.6-6.2-3.1-9.7-2.5-2.1.4-3.6 1.3-5.1 2.5Z" fill={p.hair} />}
      {p.style === "crop" && <path d="M12.6 15.2C12.3 9 16 7.2 20 7.2c4.3 0 7.8 1.9 7.4 8-1.9-2.5-5.4-3.4-8-3.2-3 .2-5.1 1.2-6.8 3.2Z" fill={p.hair} />}
      {p.style === "bun" && <path d="M12.6 15.4c.2-5.6 3.8-8 7.6-8 4 0 7.2 2.4 7.2 8-2.3-2.4-5-3.2-7.4-3.2-2.8 0-5.2.9-7.4 3.2Z" fill={p.hair} />}
      {p.style === "curls" && <path d="M12.8 14.8c.6-4.4 3.6-6.4 7.2-6.4s6.6 2 7.2 6.4c-2.2-1.8-4.6-2.4-7.2-2.4s-5 .6-7.2 2.4Z" fill={p.hair} />}
      <circle cx="17.2" cy="17.8" r=".95" fill="#2b2b2e" />
      <circle cx="22.8" cy="17.8" r=".95" fill="#2b2b2e" />
      <ellipse cx="15.5" cy="20.4" rx="1.6" ry="1" fill="#ff6b81" opacity=".28" />
      <ellipse cx="24.5" cy="20.4" rx="1.6" ry="1" fill="#ff6b81" opacity=".28" />
      <path d="M18 21.6q2 1.7 4 0" fill="none" stroke="#2b2b2e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

const THEME = {
  light: { bubble: "#e9e9eb", dots: "#8e8e93", text: "#1d1d1f", label: "#6e6e73", ring: "#ffffff", accent: "#0a84ff" },
  dark: { bubble: "#2c2c2e", dots: "#98989d", text: "#f5f5f7", label: "#a1a1a6", ring: "#000000", accent: "#0a84ff" },
} as const;

function describe(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} ${names.length - 2 === 1 ? "other" : "others"} are typing`;
}

/** Three dots that ride a sine wave. A blur and contrast filter makes neighbours bridge like liquid when they pass close. */
function Dots({ color, active, speed }: { color: string; active: boolean; speed: number }) {
  const gooId = useId().replace(/:/g, "");
  const y0 = useMotionValue(0);
  const y1 = useMotionValue(0);
  const y2 = useMotionValue(0);
  const s0 = useMotionValue(1);
  const s1 = useMotionValue(1);
  const s2 = useMotionValue(1);
  const ys = [y0, y1, y2];
  const ss = [s0, s1, s2];

  useAnimationFrame((t) => {
    if (!active) return;
    for (let i = 0; i < 3; i++) {
      const wave = Math.sin((t / 1000) * Math.PI * 2 * 1.15 * speed - i * 0.95);
      ys[i].set(-Math.max(-0.4, wave) * 5);
      ss[i].set(1 + Math.max(0, wave) * 0.18 - Math.max(0, -wave) * 0.08);
    }
  });

  useEffect(() => {
    if (active) return;
    for (let i = 0; i < 3; i++) {
      ys[i].set(0);
      ss[i].set(1);
    }
    // The motion values are stable, so the only trigger is `active`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <span className="relative inline-flex h-6 items-center px-0.5" aria-hidden="true">
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={gooId} x="-30%" y="-90%" width="160%" height="280%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.7" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 17 -7" />
          </filter>
        </defs>
      </svg>
      <span className="inline-flex items-center" style={{ filter: `url(#${gooId})` }}>
        {ys.map((y, i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{ width: 9, height: 9, marginLeft: i === 0 ? 0 : 5, background: color, y, scale: ss[i] }}
          />
        ))}
      </span>
    </span>
  );
}

function AvatarStack({ names, typing, ring, accent, still }: { names: string[]; typing: boolean; ring: string; accent: string; still: boolean }) {
  const shown = names.slice(0, 3);
  return (
    <div className="relative flex shrink-0 items-center" aria-hidden="true">
      {shown.map((name, i) => {
        return (
          <motion.span
            key={name}
            layout
            initial={still ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING}
            className="relative h-9 w-9 rounded-full"
            style={{
              marginLeft: i === 0 ? 0 : -12,
              zIndex: shown.length - i,
              boxShadow: `0 0 0 2px ${ring}`,
            }}
          >
            <span className="block h-full w-full overflow-hidden rounded-full">
              <Illustration p={PORTRAITS[i % PORTRAITS.length]} />
            </span>
            {i === 0 && typing && !still && (
              <motion.span
                className="pointer-events-none absolute -inset-[5px] rounded-full border-2"
                style={{ borderColor: accent }}
                initial={{ scale: 0.86, opacity: 0.7 }}
                animate={{ scale: 1.18, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity }}
              />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * A typing indicator for chat. Three liquid dots ride a wave in a bubble; when typing stops the dots fold away and the same bubble
 * opens into the message, word by word. Several people typing stack their avatars and quicken the wave. Press the bubble to switch
 * between typing and the message. Announces "Maya is typing" and then the message to screen readers.
 */
export default function TypingIndicator({
  names = ["Maya"],
  typing,
  message = "Ten minutes. I'm bringing the files.",
  tone = "light",
  autoplay = false,
  className = "",
}: TypingIndicatorProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "80px" });
  const touched = useRef(false);
  const [auto, setAuto] = useState<"typing" | "message">("typing");
  const controlled = typing !== undefined;
  const isTyping = controlled ? typing : auto === "typing";
  const theme = THEME[tone];
  const label = describe(names);

  useEffect(() => {
    if (!autoplay || reduced || controlled || !inView) return;
    const id = window.setTimeout(
      () => {
        if (touched.current) return;
        setAuto((a) => (a === "typing" ? "message" : "typing"));
      },
      auto === "typing" ? 2900 : 3800,
    );
    return () => window.clearTimeout(id);
  }, [autoplay, reduced, controlled, inView, auto]);

  const toggle = () => {
    if (controlled) return;
    touched.current = true;
    setAuto((a) => (a === "typing" ? "message" : "typing"));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const words = message.split(" ");
  const speed = 1 + Math.min(names.length - 1, 3) * 0.22;
  const bubbleProps = controlled
    ? {}
    : { role: "button" as const, tabIndex: 0, onClick: toggle, onKeyDown: onKey, "aria-label": isTyping ? "Show the message" : "Show typing again" };

  return (
    <div ref={rootRef} className={`inline-flex max-w-full flex-col items-start gap-2 ${className}`}>
      <span className="sr-only" role="status" aria-live="polite">
        {isTyping ? label : message}
      </span>

      <div className="flex max-w-full items-end gap-3">
        <AvatarStack names={names.length ? names : ["?"]} typing={isTyping} ring={theme.ring} accent={theme.accent} still={reduced} />

        <motion.div
          layout
          transition={reduced ? { duration: 0 } : SPRING}
          {...bubbleProps}
          className={`relative flex min-h-[44px] max-w-[min(300px,72vw)] items-center px-[18px] py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 ${controlled ? "" : "cursor-pointer"}`}
          style={{ background: theme.bubble, borderRadius: 22 }}
        >
          <span aria-hidden="true" className="absolute -bottom-px -left-1 h-3.5 w-3.5 rounded-full" style={{ background: theme.bubble }} />
          <span aria-hidden="true" className="absolute -bottom-1.5 -left-2.5 h-2 w-2 rounded-full" style={{ background: theme.bubble }} />
          <AnimatePresence mode="popLayout" initial={false}>
            {isTyping ? (
              <motion.span
                key="dots"
                initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                transition={reduced ? { duration: 0 } : { duration: 0.22 }}
              >
                <Dots color={theme.dots} active={!reduced && inView} speed={speed} />
              </motion.span>
            ) : (
              <motion.p
                key="message"
                aria-hidden="true"
                className="m-0 text-[15px] leading-[1.35] tracking-[-0.01em]"
                style={{ color: theme.text }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {words.map((w, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    style={{ marginRight: i === words.length - 1 ? 0 : "0.27em" }}
                    initial={reduced ? false : { opacity: 0, y: 5, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: reduced ? 0 : 0.14 + i * 0.045, duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    {w}
                  </motion.span>
                ))}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="min-h-[18px] pl-12" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          {isTyping && label && (
            <motion.span
              key={label}
              className="block text-[12px] leading-[18px] tracking-[0.005em]"
              style={{ color: theme.label }}
              initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -3, filter: "blur(4px)" }}
              transition={{ duration: reduced ? 0 : 0.22 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
