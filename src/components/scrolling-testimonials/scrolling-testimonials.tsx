"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
};

export interface ScrollingTestimonialsProps {
  testimonials: Testimonial[];
  /** Number of columns (clamped per breakpoint: 1 → mobile, 2 → tablet, 3 → desktop). */
  columns?: 1 | 2 | 3;
  /** Base animation duration in ms — acts as the speed for column 0. */
  speed?: number;
  /** Per-column durations; overrides `speed` for each index provided. */
  columnSpeeds?: number[];
  /** Per-column reverse flags. `true` = scroll upward (default direction reversed). */
  reverseColumns?: boolean[];
  /** Pause animation while the user hovers a column. */
  pauseOnHover?: boolean;
  /** Render the badge / title / subtitle header above the wall. */
  showHeader?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  /** Section background color. Defaults to `var(--background)`. */
  backgroundColor?: string;
  /** Card background. Defaults to a subtle dark surface. */
  cardBackground?: string;
  /** Card border color. */
  borderColor?: string;
  /** Primary text color. */
  textColor?: string;
  /** Muted / secondary text color. */
  mutedTextColor?: string;
  /** Avatar diameter in px. */
  avatarSize?: number;
  /** Render star ratings when `testimonial.rating` is set. */
  showStars?: boolean;
  /** Gradient top/bottom fade masks. */
  fadeMask?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function nameInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

function nameHue(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="size-3.5" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M8 1.5 9.8 5.2l4.1.6-2.96 2.88.7 4.07L8 10.68l-3.64 1.07.7-4.07L2.1 5.8l4.1-.6z"
            fill={i < rating ? "#f59e0b" : "none"}
            stroke={i < rating ? "#f59e0b" : "rgba(148,163,184,0.35)"}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarEl({
  src,
  name,
  size,
}: {
  src?: string;
  name: string;
  size: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  const hue = nameHue(name);

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `oklch(0.46 0.13 ${hue})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 600,
        color: "#fff",
        flexShrink: 0,
        letterSpacing: "-0.02em",
        userSelect: "none",
      }}
    >
      {nameInitials(name)}
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({
  item,
  cardBackground,
  borderColor,
  textColor,
  mutedTextColor,
  avatarSize,
  showStars,
}: {
  item: Testimonial;
  cardBackground?: string;
  borderColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  avatarSize: number;
  showStars: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4 sm:p-5"
      style={{
        background: cardBackground ?? "var(--card, rgba(255,255,255,0.04))",
        border: `1px solid ${borderColor ?? "rgba(255,255,255,0.08)"}`,
        boxShadow:
          "0 1px 10px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
    >
      {showStars && typeof item.rating === "number" && (
        <StarRating rating={item.rating} />
      )}

      <p
        className="text-sm leading-relaxed sm:text-[15px]"
        style={{ color: textColor ?? "var(--foreground)" }}
      >
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-0.5">
        <AvatarEl src={item.avatar} name={item.name} size={avatarSize} />
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold leading-snug"
            style={{ color: textColor ?? "var(--foreground)" }}
          >
            {item.name}
          </p>
          <p
            className="truncate text-xs leading-snug"
            style={{
              color:
                mutedTextColor ??
                "var(--muted-foreground, rgba(255,255,255,0.45))",
            }}
          >
            {item.role}
            {item.company ? ` · ${item.company}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Single scrolling column ──────────────────────────────────────────────────

function ScrollColumn({
  items,
  duration,
  reverse,
  pauseOnHover,
  cardBackground,
  borderColor,
  textColor,
  mutedTextColor,
  avatarSize,
  showStars,
}: {
  items: Testimonial[];
  duration: number;
  reverse: boolean;
  pauseOnHover: boolean;
  cardBackground?: string;
  borderColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  avatarSize: number;
  showStars: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  const reduced = usePrefersReducedMotion();
  // Duplicate so the list is twice as long — lets translateY(-50%) loop seamlessly.
  const doubled = React.useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="h-full overflow-hidden"
      onMouseEnter={() => pauseOnHover && setHovered(true)}
      onMouseLeave={() => pauseOnHover && setHovered(false)}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          animation: reduced
            ? "none"
            : `${reverse ? "nexus-st-rev" : "nexus-st-fwd"} ${duration}ms linear infinite`,
          animationPlayState: hovered ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard
            key={`${item.id}-${i}`}
            item={item}
            cardBackground={cardBackground}
            borderColor={borderColor}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            avatarSize={avatarSize}
            showStars={showStars}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ScrollingTestimonials({
  testimonials,
  columns = 3,
  speed = 35000,
  columnSpeeds,
  reverseColumns = [],
  pauseOnHover = true,
  showHeader = true,
  badge = "Testimonials",
  title = "Loved by teams worldwide",
  subtitle = "Join thousands of teams shipping beautiful products faster.",
  backgroundColor,
  cardBackground,
  borderColor,
  textColor,
  mutedTextColor,
  avatarSize = 40,
  showStars = true,
  fadeMask = true,
  className,
}: ScrollingTestimonialsProps) {
  // Round-robin distribution across columns
  const cols = React.useMemo<Testimonial[][]>(() => {
    const buckets: Testimonial[][] = Array.from({ length: columns }, () => []);
    testimonials.forEach((t, i) => buckets[i % columns].push(t));
    return buckets;
  }, [testimonials, columns]);

  const bg = backgroundColor ?? "var(--background)";

  return (
    <>
      {/* Keyframes injected once per mount — unique names prevent collisions. */}
      <style>{`
        @keyframes nexus-st-fwd {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes nexus-st-rev {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      <section
        className={cn("relative w-full overflow-hidden py-20", className)}
        style={{ background: bg }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        {showHeader && (
          <div className="relative z-10 mx-auto mb-14 max-w-2xl px-4 text-center">
            {badge && (
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                {badge}
              </span>
            )}
            {title && (
              <h2
                className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="mt-4 text-balance text-base leading-relaxed"
                style={{
                  color: mutedTextColor ?? "var(--muted-foreground)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* ── Scrolling wall ──────────────────────────────────────────────── */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Gradient fade masks — overlay positioned divs matching bg color */}
          {fadeMask && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 px-4 sm:px-6 lg:px-8"
                style={{
                  background: `linear-gradient(to bottom, ${bg} 0%, transparent 100%)`,
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 px-4 sm:px-6 lg:px-8"
                style={{
                  background: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
                }}
              />
            </>
          )}

          {/* Column grid — clips overflow so only 680px of each column shows */}
          <div
            className={cn(
              "grid gap-4 overflow-hidden",
              columns === 1 && "grid-cols-1",
              columns === 2 && "grid-cols-1 md:grid-cols-2",
              columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            )}
            style={{ height: 680 }}
          >
            {cols.map((items, i) => (
              <div
                key={i}
                className={cn(
                  "h-full",
                  i === 1 && "hidden md:block",
                  i === 2 && "hidden lg:block",
                )}
              >
                <ScrollColumn
                  items={items}
                  duration={columnSpeeds?.[i] ?? speed * (1 + i * 0.22)}
                  reverse={reverseColumns[i] ?? false}
                  pauseOnHover={pauseOnHover}
                  cardBackground={cardBackground}
                  borderColor={borderColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  avatarSize={avatarSize}
                  showStars={showStars}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
