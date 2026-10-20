"use client";
import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface TiltPassProps {
  name?: string;
  title?: string;
  number?: string;
  /** Floats gently on its own while the pointer is away. */
  autoplay?: boolean;
}

export function TiltPass({ name = "Alex Rivera", title = "Founders Pass", number = "No. 0042", autoplay = false }: TiltPassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 18 });
  const sy = useSpring(py, { stiffness: 180, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-16, 16]);
  const rotateX = useTransform(sy, [0, 1], [12, -12]);
  const gx = useTransform(sx, (v) => v * 100);
  const gy = useTransform(sy, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.75), rgba(255,255,255,0) 45%)`;
  const sheen = useMotionTemplate`linear-gradient(${useTransform(sx, [0, 1], [100, 160])}deg, rgba(255,0,128,.0) 20%, rgba(120,170,255,.28) 40%, rgba(255,220,140,.28) 55%, rgba(170,255,210,.22) 68%, rgba(255,0,128,0) 85%)`;
  const shadowX = useTransform(sx, [0, 1], [24, -24]);
  const shadowY = useTransform(sy, [0, 1], [10, 40]);
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px -20px rgba(0,0,0,.35)`;
  const [hover, setHover] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useAnimationFrame((t) => {
    if (!autoplay || hover) return;
    px.set(0.5 + Math.sin(t / 1400) * 0.28);
    py.set(0.5 + Math.cos(t / 1900) * 0.22);
  });

  return (
    <div className="flex flex-col items-center gap-5" style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show front of pass" : "Show back of pass"}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); px.set(0.5); py.set(0.5); }}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileTap={{ scale: 0.98 }}
        className="relative h-[220px] w-[350px] cursor-pointer rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          {/* Front */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#ffffff_0%,#eeeef2_45%,#dcdce2_100%)]"
            style={{ backfaceVisibility: "hidden", boxShadow: shadow }}
          >
            <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.9),inset_0_-1px_0_rgba(0,0,0,.06)]" />
            <motion.div className="absolute inset-0 mix-blend-color-dodge" style={{ backgroundImage: sheen }} />
            <div className="relative flex h-full flex-col justify-between p-6" style={{ transform: "translateZ(40px)" }}>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">Member</span>
                  <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{title}</span>
                </div>
                <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                  <circle cx="13" cy="17" r="11" fill="none" stroke="#1d1d1f" strokeWidth="2" />
                  <circle cx="21" cy="17" r="11" fill="none" stroke="#1d1d1f" strokeWidth="2" opacity=".35" />
                </svg>
              </div>
              <div className="h-9 w-12 rounded-md bg-[linear-gradient(135deg,#d9c48f,#f4e6bd_45%,#c7ad6e)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" />
              <div className="flex items-end justify-between">
                <span className="text-[16px] font-medium tracking-[-0.01em] text-[#1d1d1f]">{name}</span>
                <span className="text-[13px] font-medium tabular-nums text-[#6e6e73]">{number}</span>
              </div>
            </div>
            <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
          </motion.div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center gap-5 overflow-hidden rounded-[22px] bg-[#1d1d1f] p-6 text-white shadow-[0_30px_60px_-24px_rgba(0,0,0,.45)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-24px_rgba(0,0,0,.7)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="grid h-[120px] w-[120px] flex-none grid-cols-8 gap-[3px] rounded-xl bg-white p-2.5">
              {Array.from({ length: 64 }, (_, i) => (
                <span key={i} className="rounded-[1px]" style={{ background: (i * 7 + (i >> 3) * 3) % 5 < 2 || i % 9 === 0 ? "#1d1d1f" : "transparent" }} />
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">Scan at entry</span>
              <span className="text-[18px] font-semibold tracking-[-0.01em]">{name}</span>
              <span className="text-[13px] text-white/60 tabular-nums">{number}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Move your pointer over it. Click to flip.</span>
    </div>
  );
}
