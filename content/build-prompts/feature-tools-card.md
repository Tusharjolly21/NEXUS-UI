Add the "Feature Tools Card" component from Nexus UI to my project.

An integrations card: five tool icons ride a slow ring round your app's hub, each wired to it by a line that carries small packets inward. Bring the pointer near and the tools lean toward it like magnets, their line lights up and they snap back with a wobble when it moves away, while the whole card tilts toward the pointer.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { FeatureToolsCard } from "@/components/feature-tools-card";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/feature-tools-card/feature-tools-card.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface FeatureToolsCardProps {
  title?: string;
  description?: string;
  /** CSS background for the card. Defaults to white (dark grey in dark mode). */
  cardBg?: string;
  /** Icon for slot 1 (top). Defaults to a mail glyph. */
  icon1?: ReactNode;
  /** Icon for slot 2. Defaults to a chat glyph. */
  icon2?: ReactNode;
  /** Icon for slot 3. Defaults to a calendar glyph. */
  icon3?: ReactNode;
  /** Icon for slot 4. Defaults to a docs glyph. */
  icon4?: ReactNode;
  /** Icon for slot 5. Defaults to a cloud glyph. */
  icon5?: ReactNode;
  /** Logo in the hub the tools connect to. */
  hubIcon?: ReactNode;
  /** 3D tilt toward the pointer. */
  enableTilt?: boolean;
  /** Maximum tilt in degrees. */
  tiltStrength?: number;
  /** Icons lean toward the pointer. */
  enableMagnetic?: boolean;
  /** Share of the distance an icon travels toward the pointer, 0-1. */
  magneticStrength?: number;
  /** Distance at which an icon starts to feel the pointer, in px. */
  magneticRadius?: number;
  /** Icons ride slowly round the ring. */
  enableOrbit?: boolean;
  /** Seconds per full turn of the ring. */
  orbitSpeed?: number;
  /** Colour of the dashed ring. */
  orbitColor?: string;
  /** Sweeps a virtual pointer round the ring until someone touches the card. */
  autoplay?: boolean;
  className?: string;
}

const R = 84;
const COLORS = ["#0a84ff", "#30b65a", "#ff375f", "#ff9f0a", "#bf5af2"];

const G = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const GLYPHS = [
  G(<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>),
  G(<path d="M5 18l-1 3 4-1.5A8.5 8.5 0 1 0 5 18z" />),
  G(<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>),
  G(<><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  G(<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z" />),
];
const LABELS = ["Mail", "Chat", "Calendar", "Docs", "Cloud"];

type Frame = (t: number, px: number, py: number, live: boolean) => { x: number; y: number; near: number };

function Tool({
  index,
  icon,
  register,
  orbit,
  period,
  magnetic,
  strength,
  radius,
}: {
  index: number;
  icon?: ReactNode;
  register: (i: number, f: Frame | null) => void;
  orbit: boolean;
  period: number;
  magnetic: boolean;
  strength: number;
  radius: number;
}) {
  const start = -90 + index * 72;
  const a0 = (start * Math.PI) / 180;
  // Resting spot on the ring, so the server render already has it laid out.
  const bx = useMotionValue(Math.round(Math.cos(a0) * R * 100) / 100);
  const by = useMotionValue(Math.round(Math.sin(a0) * R * 100) / 100);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const ox = useSpring(tx, { stiffness: 260, damping: 13 });
  const oy = useSpring(ty, { stiffness: 260, damping: 13 });
  const pull = useMotionValue(0);
  const sp = useSpring(pull, { stiffness: 300, damping: 18 });
  const x = useTransform([bx, ox], ([a, b]) => Math.round(((a as number) + (b as number)) * 100) / 100);
  const y = useTransform([by, oy], ([a, b]) => Math.round(((a as number) + (b as number)) * 100) / 100);
  const scale = useTransform(sp, (p) => 1 + p * 0.14);
  const lift = useTransform(sp, (p) => `0 ${8 + p * 10}px ${18 + p * 14}px -10px rgba(0,0,0,${0.35 + p * 0.15})`);

  useEffect(() => {
    register(index, (t, px, py, live) => {
      const a = ((start + (orbit ? (t * 360) / Math.max(1, period) : 0)) * Math.PI) / 180;
      const cx = Math.cos(a) * R;
      const cy = Math.sin(a) * R;
      bx.set(cx);
      by.set(cy);
      const dx = px - cx;
      const dy = py - cy;
      const near = live && magnetic ? Math.max(0, 1 - Math.hypot(dx, dy) / Math.max(1, radius)) : 0;
      tx.set(dx * near * strength);
      ty.set(dy * near * strength);
      pull.set(near);
      return { x: cx + ox.get(), y: cy + oy.get(), near };
    });
    return () => register(index, null);
  }, [index, register, orbit, period, magnetic, strength, radius, start, bx, by, tx, ty, ox, oy, pull]);

  return (
    <motion.div className="absolute left-1/2 top-1/2 z-10" style={{ x, y, marginLeft: -23, marginTop: -23 }}>
      <motion.div
        className="grid size-[46px] place-items-center rounded-[13px]"
        style={{ scale, boxShadow: lift, background: icon ? "#ffffff" : `linear-gradient(160deg, ${COLORS[index]}cc, ${COLORS[index]})` }}
        title={icon ? undefined : LABELS[index]}
      >
        {icon ? <span className="grid h-[24px] w-[24px] place-items-center [&>svg]:h-full [&>svg]:w-full">{icon}</span> : GLYPHS[index]}
      </motion.div>
    </motion.div>
  );
}

/**
 * An integrations card: five tools ride a slow ring round your app's hub,
 * each wired to it with a line that carries little packets inward. Bring the
 * pointer near and the tools lean toward it like magnets, their line lights
 * up and they snap back with a wobble when you move away; the card tilts
 * toward the pointer too.
 */
export function FeatureToolsCard({
  title = "Connects with your stack",
  description = "Mail, chat, calendar, docs and storage, synced the moment they change.",
  cardBg,
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  hubIcon,
  enableTilt = true,
  tiltStrength = 8,
  enableMagnetic = true,
  magneticStrength = 0.4,
  magneticRadius = 120,
  enableOrbit = true,
  orbitSpeed = 36,
  orbitColor,
  autoplay = false,
  className = "",
}: FeatureToolsCardProps) {
  const still = useReducedMotion() === true;
  const stage = useRef<HTMLDivElement>(null);
  const frames = useRef<(Frame | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0, live: false });
  const touched = useRef(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX: MotionValue<number> = useSpring(rx, { stiffness: 160, damping: 16 });
  const rotateY: MotionValue<number> = useSpring(ry, { stiffness: 160, damping: 16 });
  const icons = [icon1, icon2, icon3, icon4, icon5];

  const register = useCallback((i: number, f: Frame | null) => {
    frames.current[i] = f;
  }, []);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = still ? 0 : (now - t0) / 1000;
      if (autoplay && !touched.current) {
        const a = t * 0.9;
        pointer.current = { x: Math.cos(a) * R * 1.05, y: Math.sin(a * 1.3) * R * 0.9, live: true };
      }
      const p = pointer.current;
      frames.current.forEach((f, i) => {
        if (!f) return;
        const at = f(t, p.x, p.y, p.live);
        const line = lines.current[i];
        const dot = dots.current[i];
        if (line) {
          line.setAttribute("x2", at.x.toFixed(2));
          line.setAttribute("y2", at.y.toFixed(2));
          line.style.strokeOpacity = String(0.22 + at.near * 0.78);
        }
        if (dot) {
          const k = (t * (0.45 + at.near * 0.9) + i * 0.21) % 1;
          dot.setAttribute("cx", (at.x * (1 - k)).toFixed(2));
          dot.setAttribute("cy", (at.y * (1 - k)).toFixed(2));
          dot.style.opacity = still ? "0" : String(Math.sin(k * Math.PI) * (0.55 + at.near * 0.45));
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [still, autoplay]);

  return (
    <motion.div
      className={`w-[340px] max-w-full rounded-[24px] p-4 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${cardBg ? "" : "bg-white dark:bg-[#1c1c1e]"} ${className}`}
      style={{ background: cardBg, rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        touched.current = true;
        const c = e.currentTarget.getBoundingClientRect();
        if (enableTilt && !still) {
          ry.set(((e.clientX - c.left) / c.width - 0.5) * 2 * tiltStrength);
          rx.set(-((e.clientY - c.top) / c.height - 0.5) * 2 * tiltStrength);
        }
        const s = stage.current?.getBoundingClientRect();
        if (s) pointer.current = { x: e.clientX - (s.left + s.width / 2), y: e.clientY - (s.top + s.height / 2), live: true };
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        pointer.current = { ...pointer.current, live: false };
      }}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div
        ref={stage}
        className="relative h-[228px] overflow-hidden rounded-[18px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,.07) 1px, transparent 1.2px)", backgroundSize: "14px 14px" }}
        role="img"
        aria-label={`Connected tools: ${LABELS.join(", ")}`}
      >
        <svg className="pointer-events-none absolute left-1/2 top-1/2 overflow-visible" width="1" height="1" aria-hidden="true">
          <motion.circle
            r={R}
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            strokeLinecap="round"
            className={orbitColor ? undefined : "stroke-[#c7c7cc] dark:stroke-[#48484a]"}
            style={{ stroke: orbitColor }}
            animate={enableOrbit && !still ? { rotate: 360 } : undefined}
            transition={{ duration: Math.max(1, orbitSpeed), repeat: Infinity, ease: "linear" }}
          />
          {COLORS.map((c, i) => (
            <line
              key={`l${i}`}
              ref={(el) => {
                lines.current[i] = el;
              }}
              x1="0"
              y1="0"
              x2="0"
              y2="0"
              stroke={c}
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ strokeOpacity: 0.22 }}
            />
          ))}
          {COLORS.map((c, i) => (
            <circle
              key={`d${i}`}
              ref={(el) => {
                dots.current[i] = el;
              }}
              r="2.6"
              fill={c}
              style={{ opacity: 0 }}
            />
          ))}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-20 -ml-8 -mt-8">
          {!still ? (
            <motion.span
              className="absolute inset-0 rounded-[20px] bg-[#0071e3]/25 dark:bg-[#0a84ff]/30"
              animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              aria-hidden="true"
            />
          ) : null}
          <span className="relative grid size-16 place-items-center rounded-[20px] bg-[#1d1d1f] text-white shadow-[0_12px_24px_-12px_rgba(0,0,0,.6)] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
            {hubIcon ?? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" />
              </svg>
            )}
          </span>
        </div>

        {icons.map((ic, i) => (
          <Tool
            key={i}
            index={i}
            icon={ic}
            register={register}
            orbit={enableOrbit && !still}
            period={orbitSpeed}
            magnetic={enableMagnetic && !still}
            strength={Math.max(0, Math.min(1, magneticStrength))}
            radius={magneticRadius}
          />
        ))}
      </div>
      <h3 className="mt-4 px-1 text-[17px] font-semibold leading-tight tracking-[-0.02em]">{title}</h3>
      <p className="mt-1 px-1 pb-1 text-[13px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>
    </motion.div>
  );
}

export default FeatureToolsCard;
```

--- components/feature-tools-card/index.ts ---

```ts
export { FeatureToolsCard } from "./feature-tools-card";
export type { FeatureToolsCardProps } from "./feature-tools-card";
```
