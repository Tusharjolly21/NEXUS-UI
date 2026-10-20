"use client";

import { useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface IntegrationsOrbitApp {
  name: string;
  /** Tile colour, any CSS colour (CSS variables work too). */
  color: string;
  /** One or two characters drawn on the tile. */
  glyph: string;
  /** Text colour on the tile. Defaults to white. */
  ink?: string;
}

export interface IntegrationsOrbitRing {
  /** Radius in design units, on a 560-unit square stage. */
  radius: number;
  /** Degrees per second. Negative spins the other way. */
  speed: number;
  apps: IntegrationsOrbitApp[];
}

export interface IntegrationsOrbitProps {
  rings?: IntegrationsOrbitRing[];
  /** Character or two shown in the centre mark. */
  brand?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  linkLabel?: string;
  /** Called when the link is pressed. The link never navigates on its own. */
  onBrowse?: () => void;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Spins the rings. Turned off automatically when the viewer prefers reduced motion. */
  autoplay?: boolean;
  className?: string;
}

const STAGE = 560;
const START_ANGLES = [20, 75, 140];

export const DEFAULT_INTEGRATIONS_ORBIT_RINGS: IntegrationsOrbitRing[] = [
  {
    radius: 96,
    speed: 14,
    apps: [
      { name: "Mail", color: "#0a84ff", glyph: "M" },
      { name: "Calendar", color: "#ff3b30", glyph: "31" },
      { name: "Chat", color: "#30d158", glyph: "C" },
    ],
  },
  {
    radius: 168,
    speed: -9,
    apps: [
      { name: "Drive", color: "#ff9f0a", glyph: "D" },
      { name: "Billing", color: "#5e5ce6", glyph: "$" },
      { name: "Issues", color: "var(--mk-orbit-ink-tile)", glyph: "#" },
      { name: "Design", color: "#ff375f", glyph: "F" },
      { name: "Notes", color: "#ffd60a", glyph: "N", ink: "#1d1d1f" },
    ],
  },
  {
    radius: 236,
    speed: 6,
    apps: [
      { name: "CRM", color: "#00a3e0", glyph: "S" },
      { name: "Analytics", color: "#bf5af2", glyph: "A" },
      { name: "Docs", color: "#30b0c7", glyph: "≡" },
      { name: "Support", color: "#ff6b4a", glyph: "?" },
      { name: "Deploys", color: "#0b8f6a", glyph: "▲" },
      { name: "Storage", color: "#8e8e93", glyph: "S3" },
    ],
  },
];

const toCqw = (units: number) => `${((units / STAGE) * 100).toFixed(3)}cqw`;

function Planet({
  app,
  angle,
  base,
  radius,
  showLabel,
  pinned,
  onHover,
  onToggle,
}: {
  app: IntegrationsOrbitApp;
  angle: MotionValue<number>;
  base: number;
  radius: number;
  showLabel: boolean;
  pinned: boolean;
  onHover: (name: string | null) => void;
  onToggle: (name: string) => void;
}) {
  const x = useTransform(angle, (a) => toCqw(Math.cos(((a + base) * Math.PI) / 180) * radius));
  const y = useTransform(angle, (a) => toCqw(Math.sin(((a + base) * Math.PI) / 180) * radius));

  return (
    <motion.button
      type="button"
      aria-label={app.name}
      aria-pressed={pinned}
      className="absolute left-1/2 top-1/2 -ml-5 -mt-5 flex size-10 items-center justify-center rounded-[14px] text-[13px] font-bold shadow-[0_10px_24px_-10px_rgba(0,0,0,.45)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white @sm:-ml-6 @sm:-mt-6 @sm:size-12 @sm:rounded-2xl @sm:text-[14px] dark:shadow-[0_10px_24px_-10px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:ring-offset-black"
      style={{ x, y, background: app.color, color: app.ink ?? "#ffffff", zIndex: showLabel ? 20 : undefined }}
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 1.15 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onHover(app.name);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onHover(null);
      }}
      onFocus={() => onHover(app.name)}
      onBlur={() => onHover(null)}
      onClick={() => onToggle(app.name)}
    >
      <span aria-hidden="true">{app.glyph}</span>
      <AnimatePresence>
        {showLabel && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[12px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
          >
            {app.name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Ring({
  ring,
  index,
  running,
  label,
  pinned,
  onHover,
  onToggle,
}: {
  ring: IntegrationsOrbitRing;
  index: number;
  running: boolean;
  label: string | null;
  pinned: string | null;
  onHover: (name: string | null) => void;
  onToggle: (name: string) => void;
}) {
  const angle = useMotionValue(START_ANGLES[index % START_ANGLES.length] + index * 11);
  useAnimationFrame((_, delta) => {
    if (running) angle.set(angle.get() + (ring.speed * Math.min(delta, 64)) / 1000);
  });
  const size = `${((ring.radius * 2) / STAGE) * 100}%`;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-black/[.09] dark:border-white/[.14]"
        style={{ width: size, height: size }}
      />
      {ring.apps.map((app, i) => (
        <Planet
          key={app.name}
          app={app}
          angle={angle}
          base={(i / ring.apps.length) * 360}
          radius={ring.radius}
          showLabel={label === app.name}
          pinned={pinned === app.name}
          onHover={onHover}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

/**
 * Integrations block: app tiles orbit a central mark on three rings at different speeds. Hover,
 * focus or tap a tile to stop everything and read its name; tap it again to let it spin on.
 */
export function IntegrationsOrbit({
  rings = DEFAULT_INTEGRATIONS_ORBIT_RINGS,
  brand = "L",
  eyebrow = "Integrations",
  title = "Plays well with the 120 apps you already pay for.",
  description = "Two-way sync, not imports. Change something in one place and it's changed everywhere, usually within a second.",
  linkLabel = "Browse all integrations",
  onBrowse,
  accent,
  autoplay = true,
  className,
}: IntegrationsOrbitProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const label = hover ?? pinned;
  const running = autoplay && !reduce && label === null;
  const toggle = (name: string) => setPinned((current) => (current === name ? null : name));
  const accentStyle = accent ? ({ "--mk-accent": accent, "--mk-accent-text": accent } as CSSProperties) : undefined;

  return (
    <section
      style={accentStyle}
      onKeyDown={(e) => {
        if (e.key === "Escape") setPinned(null);
      }}
      className={cn(
        "@container w-full bg-white px-4 py-16 sm:px-5 sm:py-20 dark:bg-black",
        "[--mk-accent:#0071e3] [--mk-accent-text:#0071e3] [--mk-orbit-ink-tile:#1d1d1f]",
        "dark:[--mk-accent:#0a84ff] dark:[--mk-accent-text:#2997ff] dark:[--mk-orbit-ink-tile:#3a3a3c]",
        className,
      )}
    >
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] @4xl:gap-10">
        <div className="flex flex-col items-start gap-5">
          <span className="text-[14px] font-semibold text-[var(--mk-accent-text)]">{eyebrow}</span>
          <h2 className="m-0 text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </h2>
          <p className="m-0 max-w-[460px] text-[clamp(16px,1.6vw,18px)] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
            {description}
          </p>
          <motion.a
            href="#integrations"
            onClick={(e) => {
              e.preventDefault();
              onBrowse?.();
            }}
            whileHover={{ x: 4 }}
            className="inline-flex min-h-10 items-center text-[16px] font-medium text-[var(--mk-accent-text)] outline-none focus-visible:underline"
          >
            {linkLabel} <span aria-hidden="true">&nbsp;→</span>
          </motion.a>
        </div>

        <div className="w-full overflow-x-clip py-6">
          <div
            role="group"
            aria-label="Connected apps"
            className="@container relative mx-auto aspect-square w-full max-w-[560px]"
          >
            {rings.map((ring, i) => (
              <Ring
                key={`${i}-${ring.radius}`}
                ring={ring}
                index={i}
                running={running}
                label={label}
                pinned={pinned}
                onHover={setHover}
                onToggle={toggle}
              />
            ))}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 size-[clamp(60px,16.4cqw,92px)] -translate-x-1/2 -translate-y-1/2"
            >
              {!reduce && (
                <motion.span
                  className="absolute inset-0 rounded-[30%] bg-[var(--mk-accent)]"
                  initial={{ scale: 1, opacity: 0.35 }}
                  animate={{ scale: 1.55, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <span
                className="absolute inset-0 flex items-center justify-center rounded-[30%] text-[clamp(26px,6.8cqw,38px)] font-bold text-white"
                style={{
                  background: "linear-gradient(140deg, #5ac8fa, var(--mk-accent))",
                  boxShadow: "0 20px 50px -14px var(--mk-accent)",
                }}
              >
                {brand}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
