"use client";
// Blur Hover Reveal: logos start faded and slightly blurred.
// Hovering any one logo sharpens it at full opacity while the rest
// fade further — directing focus with depth-of-field contrast.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 22 };

type Props = { className?: string };

export default function LogoCloudBlur({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section className={cn("w-full bg-white py-16 px-4 dark:bg-neutral-950", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-neutral-950 md:text-[34px] dark:text-white">
          The teams behind the products you open every morning
        </h2>
        <p className="mt-3 text-[15px] text-neutral-500 dark:text-neutral-400">Hover a name to bring it into focus.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 place-items-center gap-x-6 gap-y-9 text-neutral-800 sm:grid-cols-3 sm:gap-x-10 md:grid-cols-4 md:gap-y-11 dark:text-neutral-200">
        {LOGOS.map((logo, i) => (
          <motion.div
            key={logo.name}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            animate={{
              opacity: hovered === null ? 0.55 : hovered === i ? 1 : 0.18,
              filter: hovered === null ? "blur(1px)" : hovered === i ? "blur(0px)" : "blur(2.5px)",
              scale: hovered === i ? 1.08 : 1,
            }}
            transition={SPRING}
            className="flex cursor-default items-center"
          >
            <LogoLockup logo={logo} tinted={hovered === i} className="text-[18px] sm:text-[20px]" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
