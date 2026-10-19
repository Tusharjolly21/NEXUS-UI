"use client";
// Cursor Spotlight: monochrome marks sit dimmed on a hairline grid. A soft circle of light trails
// the cursor on a spring, revealing the full-strength layer underneath. Motion values drive the
// mask directly through useMotionTemplate, so moving the pointer never re-renders React.

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const SPOTLIGHT_RADIUS = 240;
const FOLLOW = { stiffness: 260, damping: 30, mass: 0.6 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

type Props = { className?: string };

function LogoGrid({ dim }: { dim: boolean }) {
  return (
    <div
      aria-hidden={dim ? undefined : true}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-black/[0.06] dark:bg-white/[0.08] sm:grid-cols-3 md:grid-cols-4"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.name}
          className={cn(
            "flex h-20 items-center justify-center bg-white px-3 dark:bg-[#1c1c1e] sm:h-24",
            dim ? "text-[#1d1d1f]/25 dark:text-[#f5f5f7]/25" : "text-[#1d1d1f] dark:text-[#f5f5f7]",
          )}
        >
          <LogoLockup logo={logo} className="text-[15px] sm:text-[18px]" />
        </div>
      ))}
    </div>
  );
}

export default function LogoCloudSpotlight({ className }: Props) {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  // the light trails the pointer instead of sticking to it
  const x = useSpring(mouseX, FOLLOW);
  const y = useSpring(mouseY, FOLLOW);

  const maskImage = useMotionTemplate`radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${x}px ${y}px, black 0%, transparent 72%)`;

  const panel = React.useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  // rest the light in the middle of the grid, so touch screens and keyboard users see it lit too
  const rest = React.useCallback(
    (instant: boolean) => {
      const el = panel.current;
      if (!el) return;
      const cx = el.clientWidth / 2;
      const cy = el.clientHeight / 2;
      mouseX.set(cx);
      mouseY.set(cy);
      if (instant) {
        x.jump(cx);
        y.jump(cy);
      }
    },
    [mouseX, mouseY, x, y],
  );

  React.useEffect(() => {
    // wait a frame: the masked layer subscribes to the motion values after this effect
    const id = requestAnimationFrame(() => rest(true));
    return () => cancelAnimationFrame(id);
  }, [rest]);

  const rise: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
      };

  return (
    <section className={cn("w-full bg-[#f5f5f7] px-4 py-16 dark:bg-black sm:py-24", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            variants={rise}
            className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]"
          >
            Twelve partners, one integration standard.
          </motion.h2>
          <motion.p variants={rise} className="mt-3 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">
            Move across the grid to light up each partner.
          </motion.p>
        </div>

        <motion.div
          variants={rise}
          ref={panel}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => rest(false)}
          className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] sm:mt-14"
        >
          {/* Base dim layer */}
          <LogoGrid dim />

          {/* Full-strength layer, masked to the trailing light */}
          <motion.div
            className="pointer-events-none absolute inset-0 p-2"
            style={{ WebkitMaskImage: maskImage, maskImage }}
          >
            <LogoGrid dim={false} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
