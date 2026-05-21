"use client";
// Infinite Marquee: two rows scroll in opposite directions (left & right)
// at constant speed with gradient fade masks on both edges that blend
// seamlessly into the page background, creating a looping trust band.

import * as React from "react";
import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";
import { LOGOS } from "./logos";

const SPEED = 38;

const ROW_ONE = LOGOS.slice(0, 6);
const ROW_TWO = LOGOS.slice(6, 12);

type Props = { className?: string };

function LogoItem({ name, Icon, color }: { name: string; Icon: (typeof LOGOS)[number]["Icon"]; color: string }) {
  return (
    <div
      aria-label={name}
      className="mx-6 flex flex-col items-center justify-center gap-2 transition-transform duration-200 hover:scale-110 sm:mx-8"
    >
      <Icon aria-hidden="true" className="h-8 w-8 sm:h-10 sm:w-10" style={{ color }} />
      <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600 sm:text-xs">{name}</span>
    </div>
  );
}

export default function LogoCloudMarquee({ className }: Props) {
  return (
    <section className={cn("w-full bg-white py-12 dark:bg-neutral-950 sm:py-16", className)}>
      <div className="px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
          Trusted by the best in the industry
        </h2>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
          Pause a row to get a closer look.
        </p>
      </div>

      <div className="relative mt-12 overflow-hidden">
        {/* Left fade mask */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-neutral-950 sm:w-32" />
        {/* Right fade mask */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-neutral-950 sm:w-32" />

        <div className="flex flex-col gap-6 sm:gap-8">
          <Marquee speed={SPEED} gradient={false} pauseOnHover>
            {ROW_ONE.map((logo) => (
              <LogoItem key={logo.name} name={logo.name} Icon={logo.Icon} color={logo.color} />
            ))}
            {ROW_ONE.map((logo) => (
              <LogoItem key={`${logo.name}-2`} name={logo.name} Icon={logo.Icon} color={logo.color} />
            ))}
          </Marquee>

          <Marquee speed={SPEED} direction="right" gradient={false} pauseOnHover>
            {ROW_TWO.map((logo) => (
              <LogoItem key={logo.name} name={logo.name} Icon={logo.Icon} color={logo.color} />
            ))}
            {ROW_TWO.map((logo) => (
              <LogoItem key={`${logo.name}-2`} name={logo.name} Icon={logo.Icon} color={logo.color} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
