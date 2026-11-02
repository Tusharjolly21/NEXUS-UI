"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "./icons";

/**
 * Small building blocks used across the page.
 *
 * Colours are the theme tokens defined in `skein-page.tsx`, read as `text-[rgb(var(--skein-ink)/.8)]`.
 */

/** A full-width band with a hairline under it, and the 1140px column with hairline sides. */
export function Section({
  id,
  children,
  className = "",
  inner = "",
  divider = true,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Classes for the inner column (use it to drop the side padding). */
  inner?: string;
  divider?: boolean;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 ${divider ? "border-b border-solid border-[rgb(var(--skein-line)/.09)]" : ""} ${className}`}>
      <div className={`relative mx-auto max-w-[1140px] border-x border-solid border-[rgb(var(--skein-line)/.09)] px-5 sm:px-8 ${inner}`}>{children}</div>
    </section>
  );
}

type RevealTag = "div" | "h2" | "p" | "span";

/**
 * Scroll reveal: text fades in out of a blur with a brief red/blue fringe that settles to nothing. Plays once.
 * `MotionConfig reducedMotion="user"` (set on the page) removes it for people who ask for less motion.
 */
export function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: RevealTag;
  delay?: number;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, filter: "blur(10px)", textShadow: "-7px 0px 0px rgba(255,70,90,.75), 7px 0px 0px rgba(70,150,255,.75)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)", textShadow: "0px 0px 0px rgba(255,70,90,0), 0px 0px 0px rgba(70,150,255,0)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}

export type ButtonKind = "primary" | "secondary";

const BUTTON_KINDS: Record<ButtonKind, string> = {
  primary: "bg-[rgb(var(--skein-btn))] text-[rgb(var(--skein-btn-ink))] hover:bg-[rgb(var(--skein-btn)/.9)]",
  secondary: "border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-raised)/.7)] text-[rgb(var(--skein-ink))] hover:border-[rgb(var(--skein-line)/.22)] hover:bg-[rgb(var(--skein-raised))]",
};

/** Class string for a button, so a `<button>` and an `<a>` can look identical. */
export function buttonClasses(kind: ButtonKind = "primary", size: "sm" | "md" = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-[9px] font-medium no-underline transition-colors ${
    size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-[14px]"
  } ${BUTTON_KINDS[kind]}`;
}

export function ButtonLink({
  href,
  children,
  kind = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  kind?: ButtonKind;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <a href={href} className={`${buttonClasses(kind, size)} ${className}`}>
      {children}
    </a>
  );
}

/** A quiet text link with a round chevron that nudges right on hover. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group inline-flex items-center gap-2.5 text-[14px] text-[rgb(var(--skein-mute))] no-underline transition-colors hover:text-[rgb(var(--skein-ink))]">
      {children}
      <span className="grid h-6 w-6 place-items-center rounded-full border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-raised)/.7)] transition-transform duration-300 group-hover:translate-x-0.5">
        <Icon name="chevron_right" size={9} />
      </span>
    </a>
  );
}

export type Tone = "live" | "warn" | "crit" | "info" | "mute";

const DOT_TONES: Record<Tone, string> = {
  live: "text-[rgb(var(--skein-live))]",
  warn: "text-[rgb(var(--skein-warn))]",
  crit: "text-[rgb(var(--skein-crit))]",
  info: "text-[rgb(var(--skein-info))]",
  mute: "text-[rgb(var(--skein-faint))]",
};

/** A coloured dot with a label. `pulse` adds a soft ping for "live". */
export function StatusDot({ tone, children, pulse = false }: { tone: Tone; children: ReactNode; pulse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${DOT_TONES[tone]}`}>
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />}
        <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      <span className="text-[rgb(var(--skein-ink)/.9)]">{children}</span>
    </span>
  );
}

const BADGE_TONES: Record<Tone, string> = {
  crit: "border-[rgb(var(--skein-crit)/.25)] bg-[rgb(var(--skein-crit)/.12)] text-[rgb(var(--skein-crit))]",
  warn: "border-[rgb(var(--skein-warn)/.25)] bg-[rgb(var(--skein-warn)/.12)] text-[rgb(var(--skein-warn))]",
  live: "border-[rgb(var(--skein-live)/.25)] bg-[rgb(var(--skein-live)/.12)] text-[rgb(var(--skein-live))]",
  info: "border-[rgb(var(--skein-info)/.25)] bg-[rgb(var(--skein-info)/.12)] text-[rgb(var(--skein-info))]",
  mute: "border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-raised))] text-[rgb(var(--skein-mute))]",
};

/** A small pill for a status or a duration. */
export function Badge({ tone = "mute", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border border-solid px-1.5 py-[3px] text-[11px] font-medium leading-none ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
