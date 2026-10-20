"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WarpSpeedCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** The card the phrase lives in: a plain Motion Kit surface. */
export function WarpSpeedCard({ children, className, contentClassName }: WarpSpeedCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}

export interface WarpTextTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Star colour as an "r,g,b" triplet. */
  beamColor?: string;
  /** Called with true when the jump starts and false when it drops out. */
  onWarpChange?: (warping: boolean) => void;
  /** Makes a jump every few seconds until someone hovers, focuses or taps the phrase. */
  autoplay?: boolean;
}

const STARS = 140;

/**
 * Wrap a phrase to give it a hyperdrive. Hover, focus or tap it and a starfield inside its box
 * spools up on a spring: stars stretch into streaks as speed builds, overshoot into the jump, and
 * the phrase squashes and stretches with the kick. Let go and it drops out of warp with a jolt.
 */
export function WarpTextTrigger({ children, className, beamColor = "255,255,255", onWarpChange, autoplay = false }: WarpTextTriggerProps) {
  const still = useReducedMotion() === true;
  const box = React.useRef<HTMLSpanElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const touched = React.useRef(false);
  const on = React.useRef(false);
  const wake = React.useRef<() => void>(() => {});
  const changed = React.useRef(onWarpChange);
  React.useEffect(() => {
    changed.current = onWarpChange;
  }, [onWarpChange]);

  const target = useMotionValue(0);
  const speed = useSpring(target, { stiffness: 70, damping: 11, mass: 1 });
  const space = useTransform(speed, (v) => Math.max(0, Math.min(1, v * 2.2)));
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);
  const jolt = useMotionValue(0);
  const handle = useTransform(space, [0, 1], ["#0071e3", "#8e8e93"]);

  const engage = React.useCallback(
    (next: boolean) => {
      if (on.current === next) return;
      on.current = next;
      box.current?.setAttribute("aria-pressed", String(next));
      changed.current?.(next);
      target.set(next ? 1 : 0);
      wake.current();
      if (still) return;
      if (next) {
        // Squash and stretch on the kick: velocity impulses into stiff springs.
        animate(sx, 1, { type: "spring", stiffness: 420, damping: 11, velocity: 2.2 });
        animate(sy, 1, { type: "spring", stiffness: 420, damping: 11, velocity: -2.2 });
      } else {
        animate(jolt, 0, { type: "spring", stiffness: 500, damping: 9, velocity: -140 });
      }
    },
    [target, sx, sy, jolt, still],
  );

  // The starfield. Stars live in 3D; each frame they fly toward the viewer at the current speed and are
  // drawn as streaks from where they were to where they are. The loop sleeps once speed drops to zero.
  React.useEffect(() => {
    const el = canvas.current;
    const host = box.current;
    if (!el || !host) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let seed = 11;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const stars = Array.from({ length: STARS }, () => ({ x: rnd() * 2 - 1, y: rnd() * 2 - 1, z: rnd() * 0.9 + 0.1 }));
    let w = 0;
    let h = 0;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = host.clientWidth;
      h = host.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const v = Math.max(0, speed.get());
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const f = Math.max(w, h) * 0.5;
      const dz = (0.08 + v * (still ? 0.4 : 2.6)) * dt;
      ctx.lineCap = "round";
      for (const s of stars) {
        const z0 = s.z;
        s.z -= dz;
        if (s.z <= 0.02) {
          s.x = rnd() * 2 - 1;
          s.y = rnd() * 2 - 1;
          s.z = 1;
          continue;
        }
        const x1 = cx + (s.x / s.z) * f * 0.5;
        const y1 = cy + (s.y / s.z) * f * 0.5;
        const tail = Math.min(z0 + v * 0.22, 1.2);
        const x0 = cx + (s.x / tail) * f * 0.5;
        const y0 = cy + (s.y / tail) * f * 0.5;
        const a = Math.min(1, (1 - s.z) * 1.4) * Math.min(1, 0.35 + v);
        ctx.strokeStyle = `rgba(${beamColor},${a.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.6, (1 - s.z) * 1.8);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      const awake = on.current || Math.abs(v) > 0.002;
      raf = awake ? requestAnimationFrame(frame) : 0;
      if (!awake) {
        last = 0;
        ctx.clearRect(0, 0, w, h);
      }
    };
    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      wake.current = () => {};
    };
  }, [speed, beamColor, still]);

  React.useEffect(() => {
    if (!autoplay) return;
    let off: ReturnType<typeof setTimeout> | undefined;
    const jump = () => {
      if (touched.current) return;
      engage(true);
      off = setTimeout(() => {
        if (!touched.current) engage(false);
      }, 1700);
    };
    const first = setTimeout(jump, 800);
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      jump();
    }, 4000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
      if (off) clearTimeout(off);
    };
  }, [autoplay, engage]);

  const take = () => {
    touched.current = true;
  };

  return (
    <span
      ref={box}
      role="button"
      tabIndex={0}
      aria-pressed={false}
      className={cn(
        "relative inline-block cursor-default select-none whitespace-nowrap align-baseline outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]",
        className,
      )}
      onPointerEnter={(e) => {
        take();
        if (e.pointerType === "mouse") engage(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") engage(false);
      }}
      onPointerDown={(e) => {
        take();
        if (e.pointerType !== "mouse") engage(!on.current);
      }}
      onFocus={() => {
        take();
        engage(true);
      }}
      onBlur={() => engage(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          take();
          engage(!on.current);
        }
      }}
    >
      <span className="pointer-events-none absolute -inset-x-2 -inset-y-1 overflow-hidden rounded-[6px]" aria-hidden="true">
        <motion.span className="absolute inset-0 block bg-[radial-gradient(120%_120%_at_50%_50%,#1c1c3a_0%,#05050a_70%)]" style={{ opacity: space }} />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      </span>
      <motion.span className="relative inline-block" style={{ x: jolt }}>
        <motion.span className="relative inline-block" style={{ scaleX: sx, scaleY: sy }}>
          <span>{children}</span>
          <motion.span aria-hidden="true" className="absolute inset-0 text-white" style={{ opacity: space }}>
            {children}
          </motion.span>
        </motion.span>
      </motion.span>
      <span className="pointer-events-none absolute -inset-x-2 -inset-y-1" aria-hidden="true">
        <motion.span className="absolute inset-0 rounded-[6px] border" style={{ borderColor: handle, opacity: 0.6 }} />
        {(["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"] as const).map((pos) => (
          <motion.span key={pos} className={cn("absolute size-[7px] rounded-[2px] border-[1.5px] bg-white dark:bg-[#1c1c1e]", pos)} style={{ borderColor: handle }} />
        ))}
      </span>
    </span>
  );
}
