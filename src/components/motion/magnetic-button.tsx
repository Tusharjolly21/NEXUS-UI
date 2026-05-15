"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type MagneticButtonProps = React.ComponentProps<typeof motion.button> & {
  strength?: number;
};

export function MagneticButton({
  strength = 0.35,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.15 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.15 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
