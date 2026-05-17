"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const outputs = [
  { label: "API", value: "2.4K req/min", color: "#38bdf8", delay: 0 },
  { label: "DB", value: "94ms", color: "#a78bfa", delay: 0.2 },
  { label: "Cache", value: "1.2M hits", color: "#34d399", delay: 0.4 },
  { label: "Queue", value: "312 active", color: "#fb923c", delay: 0.6 },
];

function BeamLine({ from, to, delay }: { from: { x: number; y: number }; to: { x: number; y: number }; delay: number }) {
  const reduce = useReducedMotion() === true;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="url(#beam-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={reduce ? { opacity: 0.5 } : { pathLength: 1, opacity: [0, 0.7, 0.3, 0.7, 0] }}
        transition={{ pathLength: { delay, duration: 2, repeat: Infinity, ease: "linear" }, opacity: { delay, duration: 2, repeat: Infinity } }}
      />
      <defs>
        <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.6)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  const [active, setActive] = React.useState(0);
  const reduce = useReducedMotion() === true;

  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % outputs.length), 1400);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className={cn("relative h-full p-3", className)}>
      {/* Center node */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-sm">
          <div className="size-3 rounded-full bg-cyan-400/80 shadow-cyan-400/50 shadow-[0_0_8px]" />
        </div>
      </div>

      {/* Output nodes */}
      <div className="relative flex h-full flex-col justify-between py-4">
        {outputs.map((out, i) => {
          const isActive = active === i;
          const isPast = ((active - i + outputs.length) % outputs.length) < (outputs.length - 1) && !isActive;

          return (
            <motion.div
              key={out.label}
              className="relative flex items-center justify-between rounded-xl border px-3 py-2"
              style={{
                borderColor: isActive ? `${out.color}40` : "rgba(255,255,255,0.06)",
                background: isActive ? `${out.color}0d` : "rgba(255,255,255,0.02)",
              }}
              animate={!reduce && isActive ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs font-medium" style={{ color: isActive || isPast ? out.color : "rgba(255,255,255,0.35)" }}>
                {out.label}
              </span>
              <motion.span
                className="text-[10px] tabular-nums"
                style={{ color: isActive || isPast ? `${out.color}bb` : "rgba(255,255,255,0.2)" }}
                animate={!reduce && isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                {out.value}
              </motion.span>

              {/* Beam line from center to this node */}
              {!reduce && (
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-cyan-400/30 via-cyan-400/10 to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={isActive ? { scaleX: 1, opacity: [0, 0.8, 0.3, 0] } : { scaleX: 0, opacity: 0 }}
                  style={{ top: "50%", width: "60%", originX: 1 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}