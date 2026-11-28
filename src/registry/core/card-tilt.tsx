"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import * as React from "react";

export function PreviewCardTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), {
    stiffness: 260,
    damping: 20,
  });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), {
    stiffness: 260,
    damping: 20,
  });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="relative h-44 w-72 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_55%)]" />
        <p className="text-xs text-foreground/55">Glass panel</p>
        <p className="mt-2 text-lg font-semibold text-white">3D hover depth</p>
        <p className="mt-2 text-sm text-zinc-400">
          Motion springs + perspective for premium product cards.
        </p>
      </motion.div>
    </div>
  );
}
