"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ArticleChrome({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.2 });

  return (
    <div>
      <motion.div
        className="fixed top-0 left-0 z-40 h-0.5 w-full origin-left bg-gradient-to-r from-cyan-400 to-fuchsia-500"
        style={{ scaleX }}
      />
      <div ref={ref} className="relative">
        {children}
      </div>
    </div>
  );
}
