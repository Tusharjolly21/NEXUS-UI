"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "./icons";
import { BLUE, EASE, INK, SPRING } from "./theme";
import { glassIconColor } from "./weather";

/** Fades and lifts its children into place once, the first time 40% of them is on screen. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** The big section heading. Pass a `fontSize` through `style` to override the fluid default. */
export function SectionTitle({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <h2
      className={`m-0 font-semibold leading-[1.05] tracking-[-0.035em] ${className}`}
      style={{ fontSize: "clamp(36px, 5.6vw, 64px)", color: INK, ...style }}
    >
      {children}
    </h2>
  );
}

/** Links with `href="#"` are placeholders, so they do nothing instead of jumping to the top. */
function ignoreEmptyAnchor(href: string) {
  return (event: { preventDefault: () => void }) => {
    if (href === "#") event.preventDefault();
  };
}

/** A filled pill button: blue by default, white with `light` (for use on a photo or gradient). */
export function PillButton({
  children,
  href = "#",
  light = false,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      onClick={ignoreEmptyAnchor(href)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      className={`nb-ring inline-flex items-center justify-center rounded-full px-6 py-3 text-[17px] font-normal no-underline outline-none ${className}`}
      style={light ? { background: "#fff", color: INK } : { background: BLUE, color: "#fff" }}
    >
      {children}
    </motion.a>
  );
}

/** A text link with a small chevron, underlined on hover. */
export function TextLink({ children, href = "#", light = false }: { children: ReactNode; href?: string; light?: boolean }) {
  return (
    <a
      href={href}
      onClick={ignoreEmptyAnchor(href)}
      className="nb-ring group inline-flex items-center gap-0.5 rounded text-[17px] no-underline outline-none"
      style={{ color: light ? "#fff" : BLUE }}
    >
      <span className="group-hover:underline">{children}</span>
      <Icon name="caret-right" size={13} />
    </a>
  );
}

/** Frosted glass panel used for the floating hero widgets. */
export function GlassCard({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] text-white ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,.24), rgba(255,255,255,.05) 60%, rgba(255,255,255,.1))",
        backdropFilter: "blur(14px) saturate(160%) brightness(.74)",
        WebkitBackdropFilter: "blur(14px) saturate(160%) brightness(.74)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(255,255,255,.15), inset 0 0 0 1px rgba(255,255,255,.22), 0 24px 60px -24px rgba(0,0,0,.45)",
        textShadow: "0 1px 3px rgba(0,0,0,.22)",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,.35), transparent 45%)", mixBlendMode: "soft-light" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** The temperature gradient used by every range bar and gauge: cold blue to hot orange. */
export const TEMPERATURE_GRADIENT = "linear-gradient(90deg, #5ac8fa, #a3e635, #ffd60a, #ff9f0a)";

function dayIconColor(icon: IconName) {
  if (icon.includes("rain") || icon.includes("lightning")) return "#0a84ff";
  if (icon === "sun-fill") return "#ffb800";
  return "#8e8e93";
}

/**
 * One row of a daily forecast: day, icon, low, a range bar and the high. The bar spans `min` to `max` degrees.
 * `glass` is for rows on a sky (white text and icons, translucent dividers); the default is for a white screen.
 */
export function ForecastRow({
  day,
  icon,
  low,
  high,
  glass = false,
  min = 10,
  max = 30,
}: {
  day: string;
  icon: IconName;
  low: number;
  high: number;
  glass?: boolean;
  min?: number;
  max?: number;
}) {
  const span = max - min;
  return (
    <div
      className="grid grid-cols-[52px_28px_32px_1fr_32px] items-center gap-2 border-t py-2 text-[14px] font-medium"
      style={{ borderColor: glass ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.07)" }}
    >
      <span>{day}</span>
      <Icon name={icon} size={18} style={{ color: glass ? glassIconColor(icon) : dayIconColor(icon) }} />
      <span className="text-right" style={{ opacity: 0.6 }}>
        {low}°
      </span>
      <span className="relative h-[5px] rounded-full" style={{ background: glass ? "rgba(0,0,0,.18)" : "#e5e5ea" }}>
        <span
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${((low - min) / span) * 100}%`,
            right: `${100 - ((high - min) / span) * 100}%`,
            background: TEMPERATURE_GRADIENT,
          }}
        />
      </span>
      <span>{high}°</span>
    </div>
  );
}
