"use client";
// Infinite Marquee: two rows scroll in opposite directions (left & right)
// at constant speed with gradient fade masks on both edges that blend
// seamlessly into the page background, creating a looping trust band.

import * as React from "react";
import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup, type Logo } from "./logos";

const SPEED = 38;

const ROW_ONE = LOGOS.slice(0, 6);
const ROW_TWO = LOGOS.slice(6, 12);

type Props = { className?: string };

function LogoItem({ logo }: { logo: Logo }) {
  return (
    <div className="mx-7 flex items-center text-neutral-500 transition-colors duration-200 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white sm:mx-10">
      <LogoLockup logo={logo} className="text-[18px] sm:text-[21px]" />
    </div>
  );
}

export default function LogoCloudMarquee({ className }: Props) {
  return (
    <section className={cn("w-full bg-white py-12 dark:bg-neutral-950 sm:py-16", className)}>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Customers</p>
        <h2 className="mt-2 text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-neutral-950 md:text-[34px] dark:text-white">
          Running in production at 2,400 teams, from two-person studios to public companies.
        </h2>
      </div>

      <div className="relative mt-10 overflow-hidden motion-reduce:[&_.rfm-marquee]:![animation-play-state:paused] sm:mt-12">
        {/* Left fade mask */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-neutral-950 sm:w-32" />
        {/* Right fade mask */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-neutral-950 sm:w-32" />

        <div className="flex flex-col gap-7 sm:gap-9">
          <Marquee speed={SPEED} gradient={false} pauseOnHover>
            {[...ROW_ONE, ...ROW_ONE].map((logo, i) => (
              <LogoItem key={`${logo.name}-${i}`} logo={logo} />
            ))}
          </Marquee>

          <Marquee speed={SPEED} direction="right" gradient={false} pauseOnHover>
            {[...ROW_TWO, ...ROW_TWO].map((logo, i) => (
              <LogoItem key={`${logo.name}-${i}`} logo={logo} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
