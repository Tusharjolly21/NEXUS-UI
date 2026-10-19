"use client";
import { useEffect, useRef, type KeyboardEvent as RKeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";

export interface GlassLensProps {
  /** Lens diameter in px. */
  size?: number;
  /** Magnification at the centre of the lens. */
  zoom?: number;
  /** Width of the content surface in px. */
  width?: number;
  /** Height of the content surface in px. */
  height?: number;
  /** Content under the glass. It is rendered four times (page + three lens layers), so keep it static. */
  children?: ReactNode;
  /** Drifts across the content by itself until the user drags it. */
  autoplay?: boolean;
}

const DEFAULT_TEXT = (
  <div className="flex h-full flex-col justify-center gap-3 px-8">
    <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b] dark:text-[#8e8e93]">Field notes</p>
    <p className="m-0 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">
      Glass is not a filter you lay on top. It is a material that bends whatever sits behind it.
    </p>
    <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">Drag the lens across the page. The edges split light into colour, the centre magnifies.</p>
  </div>
);

const STEP = 24;

/**
 * A draggable glass puck. Three copies of the content sit inside it at slightly
 * different magnifications, tinted red, green and blue, so colour fringes grow
 * toward the rim the way chromatic aberration does in a real lens.
 */
export function GlassLens({ size = 150, zoom = 1.45, width = 520, height = 300, children = DEFAULT_TEXT, autoplay = false }: GlassLensProps) {
  const x = useMotionValue(width * 0.18);
  const y = useMotionValue(height * 0.3);
  const touched = useRef(false);
  const r = size / 2;
  const innerX = useTransform(x, (v) => -v);
  const innerY = useTransform(y, (v) => -v);
  const originX = useTransform(x, (v) => v + r);
  const originY = useTransform(y, (v) => v + r);
  const origin = useMotionTemplate`${originX}px ${originY}px`;

  useEffect(() => {
    if (!autoplay) return;
    let ctl: { stop: () => void }[] = [];
    const drift = () => {
      if (touched.current) return;
      const tx = Math.random() * (width - size);
      const ty = Math.random() * (height - size);
      ctl = [animate(x, tx, { type: "spring", stiffness: 30, damping: 12 }), animate(y, ty, { type: "spring", stiffness: 30, damping: 12 })];
    };
    const a = setTimeout(drift, 500);
    const b = setInterval(drift, 2600);
    return () => { clearTimeout(a); clearInterval(b); ctl.forEach((c) => c.stop()); };
  }, [autoplay, x, y, width, height, size]);

  const onKeyDown = (e: RKeyboardEvent) => {
    const dx = e.key === "ArrowLeft" ? -STEP : e.key === "ArrowRight" ? STEP : 0;
    const dy = e.key === "ArrowUp" ? -STEP : e.key === "ArrowDown" ? STEP : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    touched.current = true;
    const spring = { type: "spring", stiffness: 300, damping: 30 } as const;
    if (dx) animate(x, Math.max(0, Math.min(width - size, x.get() + dx)), spring);
    if (dy) animate(y, Math.max(0, Math.min(height - size, y.get() + dy)), spring);
  };

  const layer = (scale: number, tint?: string) => (
    <motion.div
      aria-hidden="true"
      className={tint ? "absolute left-0 top-0 mix-blend-multiply dark:mix-blend-screen" : "absolute left-0 top-0"}
      style={{ width, height, x: innerX, y: innerY, scale, transformOrigin: origin, ...(tint ? { color: tint, opacity: 0.55 } : {}) }}
    >
      <div className={tint ? "h-full [&_*]:text-current!" : "h-full"}>{children}</div>
    </motion.div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_50px_-28px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_50px_-28px_rgba(0,0,0,.8)]"
      style={{ width, height, maxWidth: "100%" }}
    >
      {children}
      <motion.div
        drag
        dragConstraints={{ left: 0, top: 0, right: width - size, bottom: height - size }}
        dragElastic={0.15}
        dragTransition={{ power: 0.3, timeConstant: 300, bounceStiffness: 300, bounceDamping: 20 }}
        onPointerDown={() => { touched.current = true; }}
        onKeyDown={onKeyDown}
        whileDrag={{ scale: 1.06 }}
        whileHover={{ scale: 1.02 }}
        className="absolute left-0 top-0 cursor-grab overflow-hidden rounded-full bg-white shadow-[0_24px_40px_-14px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_24px_40px_-14px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.14)] dark:focus-visible:ring-[#0a84ff]"
        style={{ x, y, width: size, height: size }}
        role="img"
        tabIndex={0}
        aria-label="Magnifying glass. Drag it, or use the arrow keys, to move it over the text."
      >
        {layer(zoom * 1.035, "#ff2d55")}
        {layer(zoom * 0.965, "#0a84ff")}
        {layer(zoom)}
        {/* glass body: rim light, inner shadow and a specular highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.9),inset_0_10px_18px_rgba(255,255,255,.7),inset_0_-14px_26px_rgba(0,0,0,.10),inset_0_0_30px_rgba(0,0,0,.06)] dark:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.28),inset_0_10px_18px_rgba(255,255,255,.12),inset_0_-14px_26px_rgba(0,0,0,.45),inset_0_0_30px_rgba(0,0,0,.3)]" />
        <span className="pointer-events-none absolute left-[18%] top-[10%] h-[22%] w-[40%] -rotate-[24deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0))] blur-[1px] dark:opacity-40" />
      </motion.div>
    </div>
  );
}
