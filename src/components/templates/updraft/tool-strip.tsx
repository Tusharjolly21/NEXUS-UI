"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { COLORS, CONTAINER, EASE } from "./theme";
import { Icon, ScrubText } from "./ui";

const TOOLS = [
  ["ph:git-branch", "Branches"],
  ["ph:terminal-window", "Shell"],
  ["ph:test-tube", "Tests"],
  ["ph:bug-beetle", "Bugs"],
  ["ph:database", "Schemas"],
  ["ph:cloud-arrow-up", "Deploys"],
  ["ph:magnifying-glass", "Code search"],
  ["ph:file-code", "Files"],
  ["ph:brackets-curly", "Config"],
  ["ph:git-pull-request", "Reviews"],
  ["ph:chat-teardrop-text", "Threads"],
  ["ph:lightning", "Hotfixes"],
  ["ph:package", "Packages"],
  ["ph:shield-check", "Security"],
  ["ph:browser", "Previews"],
  ["ph:graph", "Dependencies"],
  ["ph:keyboard", "Shortcuts"],
  ["ph:flow-arrow", "Pipelines"],
  ["ph:clock-countdown", "Schedules"],
  ["ph:robot", "Sub-agents"],
];

export function ToolStrip() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [90, -90]);
  return (
    <section ref={ref} aria-label="What agents can work with" className="overflow-hidden pb-6 pt-24 sm:pt-32">
      <motion.ul
        style={{
          x,
        }}
        className="flex w-max items-center gap-3 px-6 sm:gap-4"
      >
        {[...TOOLS, ...TOOLS.slice(0, 6)].map(([icon, label], i) => (
          <li
            key={i}
            className="ud-bob shrink-0"
            style={{
              animationDelay: `${-i * 0.36}s`,
            }}
          >
            <span
              role="img"
              aria-label={label}
              className="group relative grid size-[58px] cursor-default place-items-center rounded-full bg-[#F4F5F7] text-[#2B2D33] transition-[transform,background-color,box-shadow,color] duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:-translate-y-4 hover:scale-[1.14] hover:bg-white hover:text-[#A63CF2] hover:shadow-[0_18px_34px_-14px_rgba(75,59,255,.45),0_0_0_1px_#ECEDF0] sm:size-[66px]"
            >
              <Icon name={icon} size={22} />
              <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-[#121317] px-2.5 py-1 text-[11.5px] font-[500] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {label}
              </span>
            </span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}

export function Statement() {
  return (
    <section className={`${CONTAINER} pb-24 pt-16 sm:pb-32 sm:pt-20`}>
      <ScrubText
        wps={14}
        className="max-w-[24ch] text-[clamp(28px,3.4vw,46px)] font-[440] leading-[1.14] tracking-[-0.03em] text-[#121317]"
        text="Hand Updraft a ticket, a stack trace or a half-formed idea. It reads your codebase, plans the change, writes it, proves it with tests and waits for your review."
      />
      <div className="mt-10 grid max-w-[920px] gap-6 sm:grid-cols-3">
        {[
          ["12", "agents in parallel, per workspace"],
          ["41 min", "median time from ticket to reviewable diff"],
          ["0", "changes merged without a human saying yes"],
        ].map(([value, label], i) => (
          <motion.div
            key={label}
            initial={{
              opacity: 0,
              y: 14,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-10%",
            }}
            transition={{
              delay: 0.5 + i * 0.12,
              duration: 0.7,
              ease: EASE,
            }}
            className="border-t pt-4"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <p className="text-[30px] font-[470] tabular-nums tracking-[-0.03em]">{value}</p>
            <p
              className="mt-1 text-[14px] leading-[1.45]"
              style={{
                color: COLORS.soft,
              }}
            >
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
