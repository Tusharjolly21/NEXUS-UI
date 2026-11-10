"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { LOGOS } from "./data";
import { COLOR, CONTAINER, FONT_DISPLAY } from "./theme";
import { Icon, Section, useCountUp } from "./ui";
/** "Trusted by" with the customer names scrolling sideways forever. */
export function LogoWall() {
  return (
    <Section inner="py-14">
      <p
        className="m-0 px-5 text-center text-[14px]"
        style={{
          color: COLOR.soft,
        }}
      >
        Trusted by 4,000+ product teams, from two-person startups to public
        companies
      </p>
      <div
        className="mt-8 overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
        }}
      >
        <div
          className="pl-marquee flex w-max"
          style={{
            animation: "pl-marquee 36s linear infinite",
          }}
        >
          {[...LOGOS, ...LOGOS].map(([name, icon], index) => (
            <span
              className="flex items-center gap-2 whitespace-nowrap px-9 text-[22px] font-medium tracking-[-0.03em]"
              style={{
                color: "#5D6470",
                fontFamily: FONT_DISPLAY,
              }}
              key={index}
            >
              <Icon name={icon} size={20} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
/** Four numbers that count up once on screen. */
export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.5,
  });
  const stats: [
    value: number,
    decimals: number,
    unit: string,
    label: string,
  ][] = [
    [4000, 0, "+", "product teams plan in Plotline"],
    [38, 0, "%", "fewer status meetings in the first quarter"],
    [2.4, 1, "×", "faster from request to release"],
    [99.99, 2, "%", "uptime over the last 12 months"],
  ];
  return (
    <section
      style={{
        borderTop: `1px solid ${COLOR.line}`,
      }}
    >
      <div
        ref={ref}
        className={`${CONTAINER} grid grid-cols-2 lg:grid-cols-4`}
        style={{
          borderLeft: `1px solid ${COLOR.line}`,
          borderRight: `1px solid ${COLOR.line}`,
        }}
      >
        {stats.map(([value, decimals, unit, label], index) => (
          <Stat
            value={value}
            decimals={decimals}
            unit={unit}
            label={label}
            start={inView}
            index={index}
            key={label}
          />
        ))}
      </div>
    </section>
  );
}
export function Stat({
  value,
  decimals,
  unit,
  label,
  start,
  index,
}: {
  value: number;
  decimals: number;
  unit: string;
  label: string;
  start: boolean;
  index: number;
}) {
  const shown = useCountUp(value, start, decimals);
  return (
    <div
      className={`border-[rgba(14,17,22,.08)] px-5 py-12 sm:px-10 ${index % 2 ? "border-l" : ""} ${index > 0 ? "lg:border-l" : ""} ${index > 1 ? "border-t lg:border-t-0" : ""}`}
    >
      <div
        className="font-medium tabular-nums"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(38px, 4.4vw, 58px)",
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: COLOR.ink,
        }}
      >
        {shown}
        {unit}
      </div>
      <p
        className="m-0 mt-3 max-w-[240px] text-[15px] leading-[1.45]"
        style={{
          color: COLOR.soft,
        }}
      >
        {label}
      </p>
    </div>
  );
}
