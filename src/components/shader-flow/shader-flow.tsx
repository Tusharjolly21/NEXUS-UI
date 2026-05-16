"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShaderFlowProps {
  children?: ReactNode;
  className?: string;
  showContent?: boolean;
  cursorReactive?: boolean;
  intensity?: "low" | "medium" | "high";
}

function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 opacity-[0.015] pointer-events-none",
        "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]",
        className,
      )}
      aria-hidden
    />
  );
}

function BlobLayer({
  className,
  style,
  fromX = "-10%",
  toX = "10%",
  fromY = "0%",
  toY = "8%",
  fromScale = 1,
  toScale = 1.15,
  fromOpacity = 0.45,
  toOpacity = 0.7,
  duration = 14,
}: {
  className?: string;
  style?: React.CSSProperties;
  fromX?: string;
  toX?: string;
  fromY?: string;
  toY?: string;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        x: [fromX, toX, fromX],
        y: [fromY, toY, fromY],
        scale: [fromScale, toScale, fromScale],
        opacity: [fromOpacity, toOpacity, fromOpacity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-fuchsia-500/30 blur-[100px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function Blob2Layer({
  className,
  style,
  fromX = "12%",
  toX = "-8%",
  fromY = "10%",
  toY = "-6%",
  fromScale = 1.1,
  toScale = 0.95,
  fromOpacity = 0.35,
  toOpacity = 0.6,
  duration = 16,
}: {
  className?: string;
  style?: React.CSSProperties;
  fromX?: string;
  toX?: string;
  fromY?: string;
  toY?: string;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        x: [fromX, toX, fromX],
        y: [fromY, toY, fromY],
        scale: [fromScale, toScale, fromScale],
        opacity: [fromOpacity, toOpacity, fromOpacity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-indigo-500/25 blur-[80px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function Blob3Layer({
  className,
  style,
  fromRotate = 0,
  toRotate = 8,
  fromScale = 1,
  toScale = 1.08,
  fromOpacity = 0.3,
  toOpacity = 0.5,
  duration = 20,
}: {
  className?: string;
  style?: React.CSSProperties;
  fromRotate?: number;
  toRotate?: number;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        rotate: [fromRotate, toRotate, fromRotate],
        scale: [fromScale, toScale, fromScale],
        opacity: [fromOpacity, toOpacity, fromOpacity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full bg-gradient-to-bl from-amber-500/20 via-orange-500/15 to-pink-500/20 blur-[90px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function WaveLayer({
  className,
  style,
  fromX = "-5%",
  toX = "5%",
  fromY = "-3%",
  toY = "3%",
  fromScale = 1,
  toScale = 1.05,
  fromOpacity = 0.25,
  toOpacity = 0.4,
  duration = 22,
}: {
  className?: string;
  style?: React.CSSProperties;
  fromX?: string;
  toX?: string;
  fromY?: string;
  toY?: string;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        x: [fromX, toX, fromX],
        y: [fromY, toY, fromY],
        scale: [fromScale, toScale, fromScale],
        opacity: [fromOpacity, toOpacity, fromOpacity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 blur-[120px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function ShaderBackground({
  cursorReactive,
  intensity = "medium",
}: {
  cursorReactive?: boolean;
  intensity?: "low" | "medium" | "high";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cursorReactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const intensityScale = intensity === "low" ? 0.6 : intensity === "high" ? 1.2 : 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {!reduceMotion && (
        <>
          <BlobLayer
            className="h-[600px] w-[600px] -top-48 -left-48"
            style={{
              transform: cursorReactive
                ? `translate(${mousePosition.x * 30 * intensityScale}px, ${mousePosition.y * 20 * intensityScale}px)`
                : undefined,
            }}
          />
          <Blob2Layer
            className="h-[500px] w-[500px] -top-24 -right-24"
            style={{
              transform: cursorReactive
                ? `translate(${mousePosition.x * -25 * intensityScale}px, ${mousePosition.y * 15 * intensityScale}px)`
                : undefined,
            }}
          />
          <Blob3Layer
            className="h-[450px] w-[450px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: cursorReactive
                ? `translate(${mousePosition.x * 20 * intensityScale}px, ${mousePosition.y * -20 * intensityScale}px)`
                : undefined,
            }}
          />
          <WaveLayer
            className="h-[700px] w-[700px] -bottom-64 -left-32"
            fromX="-5%"
            toX="5%"
            fromY="-3%"
            toY="3%"
            duration={22}
            style={{
              transform: cursorReactive
                ? `translate(${mousePosition.x * -15 * intensityScale}px, ${mousePosition.y * 25 * intensityScale}px)`
                : undefined,
            }}
          />
          <WaveLayer
            className="h-[550px] w-[550px] top-0 right-0"
            fromX="5%"
            toX="-5%"
            fromY="3%"
            toY="-3%"
            duration={18}
            style={{
              transform: cursorReactive
                ? `translate(${mousePosition.x * 20 * intensityScale}px, ${mousePosition.y * -15 * intensityScale}px)`
                : undefined,
            }}
          />
        </>
      )}

      {reduceMotion && (
        <>
          <div className="absolute h-[600px] w-[600px] -top-48 -left-48 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20 blur-[100px]" />
          <div className="absolute h-[500px] w-[500px] -top-24 -right-24 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-indigo-500/15 blur-[80px]" />
          <div className="absolute h-[450px] w-[450px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-pink-500/15 blur-[90px]" />
        </>
      )}

      <NoiseOverlay />
    </div>
  );
}

function ForegroundContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-fuchsia-500/30 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]" />
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-[0_4px_12px_-2px_rgba(34,211,238,0.4)]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-semibold tracking-tight text-white">
            Nexus UI
          </span>
          <span className="text-xs text-white/40 font-medium">
            Shader Background
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        className="mt-8 flex items-center gap-2"
      >
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">
          Flowing gradient animation
        </span>
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 flex items-center gap-1.5"
      >
        {["blobs", "noise", "blur"].map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.08, ease: "easeOut" }}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50 backdrop-blur-sm"
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

export function ShaderFlow({
  children,
  className,
  showContent = true,
  cursorReactive = true,
  intensity = "medium",
}: ShaderFlowProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-2xl border border-white/10",
        className,
      )}
    >
      <ShaderBackground cursorReactive={cursorReactive} intensity={intensity} />

      {showContent ? (
        children ?? <ForegroundContent />
      ) : (
        children
      )}
    </div>
  );
}