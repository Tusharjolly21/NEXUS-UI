"use client";
// Cursor Spotlight: logos are dimmed on a dark background. A radial
// "flashlight" follows the cursor via CSS mask-image on a bright layer,
// revealing fully-lit logos only where the cursor points — no re-renders
// because motion values drive the mask directly via useMotionTemplate.

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS } from "./logos";

const SPOTLIGHT_RADIUS = 260;

type Props = { className?: string };

function LogoGrid({ dim }: { dim: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
      {LOGOS.map((logo) => (
        <div
          key={logo.name}
          aria-label={logo.name}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl p-3 sm:p-5",
            dim && "opacity-[0.18] grayscale",
          )}
        >
          <logo.Icon
            aria-hidden="true"
            className="h-8 w-8 sm:h-10 sm:w-10"
            style={{ color: logo.color }}
          />
          <span className="text-[10px] font-medium text-neutral-400 sm:text-xs">{logo.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function LogoCloudSpotlight({ className }: Props) {
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const maskImage = useMotionTemplate`radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${mouseX}px ${mouseY}px, black 0%, transparent 75%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }

  return (
    <section className={cn("w-full bg-neutral-950 py-12 px-4 sm:py-16", className)}>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
          Trusted by the best in the industry
        </h2>
        <p className="mt-3 text-sm text-neutral-400 sm:text-base">
          Move your cursor across the grid to reveal our partners.
        </p>
      </div>

      <div
        className="relative mx-auto mt-10 max-w-4xl cursor-crosshair overflow-hidden rounded-2xl border border-white/[0.06] bg-neutral-900 p-5 sm:mt-14 sm:p-8 md:p-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base dim layer */}
        <LogoGrid dim />

        {/* Spotlight bright layer — masked to cursor position */}
        <motion.div
          className="pointer-events-none absolute inset-0 p-5 sm:p-8 md:p-10"
          style={{ WebkitMaskImage: maskImage, maskImage }}
        >
          <LogoGrid dim={false} />
        </motion.div>
      </div>
    </section>
  );
}
