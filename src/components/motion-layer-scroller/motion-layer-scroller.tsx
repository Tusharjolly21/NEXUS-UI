"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LayerConfig {
  id: string;
  content?: React.ReactNode;
  xRange?: [number, number];
  yRange?: [number, number];
  scaleRange?: [number, number];
  rotateRange?: [number, number];
  opacityRange?: [number, number];
  blurRange?: [number, number];
  zIndex?: number;
  className?: string;
  width?: string;
  height?: string;
}

export interface MotionLayerScrollerProps {
  layers?: LayerConfig[];
  direction?: "vertical" | "horizontal";
  scrollHeight?: number;
  perspective?: number;
  backgroundColor?: string;
  showGrid?: boolean;
  showGlow?: boolean;
  heading?: string;
  description?: string;
  className?: string;
}

// ── Glow orb ─────────────────────────────────────────────────────────────────

function GlowOrb({
  color = "#38bdf8",
  size = 120,
  top,
  left,
  right,
  bottom,
  blur = 80,
  opacity = 0.15,
}: {
  color?: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  blur?: number;
  opacity?: number;
}) {
  const hex = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return (
    <div
      className="pointer-events-none absolute rounded-full"
      style={{
        background: `radial-gradient(circle, ${color}${hex} 0%, transparent 70%)`,
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

// ── Default demo layers ───────────────────────────────────────────────────────

function DefaultLayers() {
  return (
    <>
      {/* Background large panel */}
      <div
        className="w-[480px] rounded-3xl border border-white/[0.04] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8"
        style={{ zIndex: 0 }}
      >
        <div className="mb-6 flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 w-8 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full rounded bg-white/[0.08]" />
          <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
          <div className="h-3 w-4/6 rounded bg-white/[0.04]" />
        </div>
        <div className="mt-8 flex gap-3">
          <div className="h-10 flex-1 rounded-xl bg-white/[0.07]" />
          <div className="h-10 flex-1 rounded-xl bg-white/[0.04]" />
        </div>
      </div>

      {/* Main content card */}
      <div
        className="w-96 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-6 shadow-2xl"
        style={{ zIndex: 1 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="size-3 rounded-full bg-cyan-400/60" />
          <div className="h-2 w-20 rounded bg-white/10" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full rounded bg-white/8" />
          <div className="h-2 w-4/5 rounded bg-white/6" />
          <div className="h-2 w-3/5 rounded bg-white/4" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>

      {/* Glass floating card */}
      <div className="lf-glass w-48 rounded-2xl border border-white/[0.1] p-4 shadow-xl" style={{ zIndex: 2 }}>
        <div className="mb-3 flex items-center gap-2">
          <div className="size-6 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/40" />
          <div className="h-2 w-16 rounded bg-white/20" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-white/10" />
          <div className="h-1.5 w-3/4 rounded bg-white/8" />
        </div>
        <div className="mt-3 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 flex-1 rounded-md bg-white/[0.07]" />
          ))}
        </div>
      </div>

      {/* Stat chip */}
      <div
        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 backdrop-blur-md"
        style={{ zIndex: 3 }}
      >
        <div className="size-4 rounded-full bg-emerald-500/50" />
        <span className="text-xs font-medium text-white/70">+24% growth</span>
      </div>

      {/* Mini metrics card */}
      <div className="lf-glass w-36 rounded-2xl border border-white/[0.1] p-3" style={{ zIndex: 4 }}>
        <div className="mb-2 text-[9px] uppercase tracking-widest text-white/30">Metrics</div>
        <div className="text-xl font-semibold text-white">8.2K</div>
        <div className="mt-2 flex gap-0.5">
          {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-cyan-500/30" style={{ height: h * 4 }} />
          ))}
        </div>
      </div>

      {/* Ambient orbs */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)",
          width: 240,
          height: 240,
          top: -80,
          left: -60,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
          width: 200,
          height: 200,
          bottom: -40,
          right: -40,
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
    </>
  );
}

// ── Scroll-driven layer ────────────────────────────────────────────────────────

function ScrollLayer({
  layer,
  index,
  scrollYProgress,
}: {
  layer: LayerConfig;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const mx = useTransform(scrollYProgress, [0, 1], layer.xRange ?? [0, 0]);
  const my = useTransform(scrollYProgress, [0, 1], layer.yRange ?? [0, 0]);
  const ms = useSpring(useTransform(scrollYProgress, [0, 1], layer.scaleRange ?? [1, 1]), {
    stiffness: 80,
    damping: 20,
  });
  const mr = useSpring(useTransform(scrollYProgress, [0, 1], layer.rotateRange ?? [0, 0]), {
    stiffness: 60,
    damping: 20,
  });
  const mo = useSpring(useTransform(scrollYProgress, [0, 1], layer.opacityRange ?? [1, 1]), {
    stiffness: 60,
    damping: 20,
  });
  const mb = useTransform(scrollYProgress, [0, 1], layer.blurRange ?? [0, 0]);
  const mblur = useTransform(mb, (v) => `blur(${v}px)`);

  return (
    <motion.div
      className={cn("absolute pointer-events-none", layer.className)}
      style={{
        x: mx,
        y: my,
        scale: ms,
        rotate: mr,
        opacity: mo,
        filter: mblur,
        zIndex: layer.zIndex ?? index,
        width: layer.width,
        height: layer.height,
      }}
    >
      {layer.content}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MotionLayerScroller({
  layers,
  direction = "vertical",
  scrollHeight = 600,
  perspective = 1200,
  backgroundColor = "#05070d",
  showGrid = true,
  showGlow = true,
  heading = "Motion that moves people",
  description = "A scroll-driven 3D layered hero section with parallax depth and smooth motion.",
  className,
}: MotionLayerScrollerProps) {
  const reduce = useReducedMotion() === true;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const defaultLayers: LayerConfig[] = [
    {
      id: "bg-panel",
      xRange: [-30, 30],
      yRange: [-20, 20],
      scaleRange: [0.92, 1.04],
      opacityRange: [0.4, 1],
      zIndex: 0,
      className: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    {
      id: "main-card",
      xRange: [-50, 50],
      yRange: [-40, 40],
      scaleRange: [0.95, 1.08],
      rotateRange: [-2, 2],
      opacityRange: [0.7, 1],
      zIndex: 1,
      className: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    {
      id: "glass-card",
      xRange: [40, -40],
      yRange: [-60, 60],
      scaleRange: [0.9, 1.05],
      rotateRange: [3, -3],
      opacityRange: [0.6, 1],
      zIndex: 2,
      className: "left-[68%] top-[38%]",
    },
    {
      id: "stat-chip",
      xRange: [-20, 20],
      yRange: [-30, 30],
      scaleRange: [0.88, 1.02],
      opacityRange: [0.5, 1],
      zIndex: 3,
      className: "left-[25%] top-[62%]",
    },
    {
      id: "mini-card",
      xRange: [30, -30],
      yRange: [20, -20],
      scaleRange: [0.9, 1.06],
      rotateRange: [-2, 2],
      opacityRange: [0.5, 1],
      zIndex: 4,
      className: "left-[72%] top-[68%]",
    },
  ];

  const activeLayers = layers ?? defaultLayers;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        height: reduce ? "auto" : scrollHeight,
        backgroundColor,
      }}
    >
      {/* Background */}
      {showGlow && (
        <>
          <GlowOrb color="#4f46e5" size={400} top="-100px" left="-80px" blur={100} opacity={0.12} />
          <GlowOrb color="#06b6d4" size={300} bottom="-60px" right="-60px" blur={80} opacity={0.1} />
        </>
      )}

      {showGrid && (
        <div className="lf-grid pointer-events-none absolute inset-0 opacity-50" />
      )}

      {/* Heading — fade in/out with scroll */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.h2
          className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
            y: useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [30, 0, 0, -30]),
          }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className="mt-4 max-w-lg text-base text-white/50 sm:text-lg"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]),
            y: useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [20, 0, 0, -20]),
          }}
        >
          {description}
        </motion.p>
      </div>

      {/* Layered content */}
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", perspective: reduce ? "none" : perspective }}
      >
        {/* Default visual layers */}
        {layers == null && <DefaultLayers />}

        {/* Custom config layers */}
        {activeLayers.map((layer, i) => (
          <ScrollLayer
            key={layer.id}
            layer={layer}
            index={i}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}