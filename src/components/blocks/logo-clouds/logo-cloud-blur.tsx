"use client";
// Blur Hover Reveal: logos start faded and slightly blurred.
// Hovering any one logo sharpens it at full opacity while the rest
// fade further — directing focus with depth-of-field contrast.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS } from "./logos";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 22 };

type Props = { className?: string };

export default function LogoCloudBlur({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section className={cn("w-full bg-white py-16 px-4 dark:bg-neutral-950", className)}>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
          Trusted by the best in the industry
        </h2>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          Hover any logo to bring it into focus.
        </p>
      </div>

      <div className="mx-auto mt-14 grid grid-cols-3 place-items-center gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-12 md:flex md:flex-wrap md:justify-center md:gap-x-14 md:gap-y-10">
        {LOGOS.map((logo, i) => (
          <motion.div
            key={logo.name}
            aria-label={logo.name}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            animate={{
              opacity: hovered === null ? 0.6 : hovered === i ? 1 : 0.2,
              filter:
                hovered === null
                  ? "blur(1.5px)"
                  : hovered === i
                  ? "blur(0px)"
                  : "blur(2.5px)",
              scale: hovered === i ? 1.18 : 1,
              y: hovered === i ? -4 : 0,
            }}
            transition={SPRING}
            className="flex cursor-pointer flex-col items-center gap-1.5"
          >
            <logo.Icon
              aria-hidden="true"
              className="h-9 w-9 sm:h-10 sm:w-10"
              style={{ color: logo.color }}
            />
            <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600 sm:text-[11px]">
              {logo.name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
