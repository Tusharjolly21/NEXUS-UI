"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";

export interface GlassLensProps {
  size?: number;
  zoom?: number;
  width?: number;
  height?: number;
  children?: ReactNode;
  /** Drifts across the content by itself until the user drags it. */
  autoplay?: boolean;
}

const DEFAULT_TEXT = (
  <div className="flex h-full flex-col justify-center gap-3 px-8">
    <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">Field notes</p>
    <p className="m-0 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1d1d1f]">
      Glass is not a filter you lay on top. It is a material that bends whatever sits behind it.
    </p>
    <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]">Drag the lens across the page. The edges split light into colour, the centre magnifies.</p>
  </div>
);

/**
 * A draggable glass puck. Three copies of the content sit inside it at slightly
 * different magnifications, tinted red, green and blue, so colour fringes grow
 * toward the rim the way chromatic aberration does in a real lens.
 */
export default function GlassLens({ size = 150, zoom = 1.45, width = 520, height = 300, children = DEFAULT_TEXT, autoplay = false }: GlassLensProps) {
  const x = useMotionValue(width * 0.18);
  const y = useMotionValue(height * 0.3);
  const touched = useRef(false);
  const r = size / 2;
  const innerX = useTransform(x, (v) => -v);
  const innerY = useTransform(y, (v) => -v);
  const origin = useMotionTemplate`${useTransform(x, (v) => v + r)}px ${useTransform(y, (v) => v + r)}px`;

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

  const layer = (scale: number, tint?: string) => (
    <motion.div
      aria-hidden="true"
      className="absolute left-0 top-0"
      style={{ width, height, x: innerX, y: innerY, scale, transformOrigin: origin, ...(tint ? { color: tint, mixBlendMode: "multiply" as const, opacity: 0.55 } : {}) }}
    >
      <div className={tint ? "h-full [&_*]:!text-current" : "h-full"}>{children}</div>
    </motion.div>
  );

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_50px_-28px_rgba(0,0,0,.3)]" style={{ width, height, maxWidth: "100%" }}>
      {children}
      <motion.div
        drag
        dragConstraints={{ left: 0, top: 0, right: width - size, bottom: height - size }}
        dragElastic={0.15}
        dragTransition={{ power: 0.3, timeConstant: 300, bounceStiffness: 300, bounceDamping: 20 }}
        onPointerDown={() => (touched.current = true)}
        whileDrag={{ scale: 1.06 }}
        whileHover={{ scale: 1.02 }}
        className="absolute left-0 top-0 cursor-grab overflow-hidden rounded-full bg-white active:cursor-grabbing"
        style={{ x, y, width: size, height: size, boxShadow: "0 24px 40px -14px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06)" }}
        role="img"
        aria-label="Magnifying glass. Drag it over the text."
      >
        {layer(zoom * 1.035, "#ff2d55")}
        {layer(zoom * 0.965, "#0a84ff")}
        {layer(zoom)}
        {/* glass body: rim light, inner shadow and a specular highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.9),inset_0_10px_18px_rgba(255,255,255,.7),inset_0_-14px_26px_rgba(0,0,0,.10),inset_0_0_30px_rgba(0,0,0,.06)]" />
        <span className="pointer-events-none absolute left-[18%] top-[10%] h-[22%] w-[40%] -rotate-[24deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0))] blur-[1px]" />
      </motion.div>
    </div>
  );
}
