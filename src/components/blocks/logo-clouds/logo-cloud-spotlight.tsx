"use client";
// Cursor Spotlight: logos are dimmed on a dark background. A radial
// "flashlight" follows the cursor via CSS mask-image on a bright layer,
// revealing fully-lit logos only where the cursor points — no re-renders
// because motion values drive the mask directly via useMotionTemplate.

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const SPOTLIGHT_RADIUS = 260;

type Props = { className?: string };

function LogoGrid({ dim }: { dim: boolean }) {
  return (
    <div
      aria-hidden={dim ? undefined : true}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.06] sm:grid-cols-3 md:grid-cols-4"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.name}
          className={cn(
            "flex h-20 items-center justify-center bg-neutral-900 px-3 sm:h-24",
            dim ? "text-white/35" : "text-white",
          )}
        >
          <LogoLockup logo={logo} className="text-[16px] sm:text-[18px]" />
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

  const panel = React.useRef<HTMLDivElement>(null);

  // rest the light in the middle of the grid, so touch screens and keyboard users see it lit too
  const rest = React.useCallback(() => {
    const el = panel.current;
    if (!el) return;
    mouseX.set(el.clientWidth / 2);
    mouseY.set(el.clientHeight / 2);
  }, [mouseX, mouseY]);

  React.useEffect(() => {
    // wait a frame: the masked layer subscribes to the motion values after this effect
    const id = requestAnimationFrame(rest);
    return () => cancelAnimationFrame(id);
  }, [rest]);

  function handleMouseLeave() {
    rest();
  }

  return (
    <section className={cn("w-full bg-neutral-950 py-12 px-4 sm:py-16", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-white md:text-[34px]">
          Twelve partners, one integration standard
        </h2>
        <p className="mt-3 text-[15px] text-neutral-400">Move across the grid to light up each partner.</p>
      </div>

      <div
        className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900 p-2 sm:mt-12"
        ref={panel}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base dim layer */}
        <LogoGrid dim />

        {/* Spotlight bright layer — masked to cursor position */}
        <motion.div
          className="pointer-events-none absolute inset-0 p-2"
          style={{ WebkitMaskImage: maskImage, maskImage }}
        >
          <LogoGrid dim={false} />
        </motion.div>
      </div>
    </section>
  );
}
