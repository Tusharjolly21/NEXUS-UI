"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR, EASE, FONT_DISPLAY, SPRING, r2 } from "./theme";
import {
  Avatar,
  Eyebrow,
  Headline,
  Icon,
  Reveal,
  Sand,
  Section,
  Sky,
  type IconName,
  type Tone,
} from "./ui";

type VizProps = { hot: boolean };
/** Kettlebrook: releases every six weeks, then every two (the dots close up on hover). */
export function BeforeAfterViz({ hot }: VizProps) {
  return (
    <div
      className="grid w-[250px] gap-3 rounded-[12px] bg-white/85 p-3.5 text-[11.5px] backdrop-blur"
      style={{
        boxShadow: "0 12px 30px -16px rgba(14,17,22,.4)",
      }}
    >
      {(
        [
          ["Before", 6],
          ["After", 2],
        ] as const
      ).map(([phase, weeks]) => (
        <div key={phase}>
          <div
            className="mb-1.5 flex justify-between"
            style={{
              color: COLOR.soft,
            }}
          >
            <span>{phase}</span>
            <span>every {weeks} weeks</span>
          </div>
          <div
            className="relative h-5 rounded-full"
            style={{
              background: COLOR.panel,
            }}
          >
            {Array.from(
              {
                length: Math.floor(24 / weeks),
              },
              (_, index) => (
                <motion.span
                  className="absolute top-1/2 h-3 w-3 rounded-full"
                  style={{
                    left: `${((index + 0.5) * weeks * 100) / 24}%`,
                    y: "-50%",
                    x: "-50%",
                    background: phase === "After" ? COLOR.accent : "#B7BDC6",
                  }}
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: hot || phase === "Before" ? 1 : 0.4,
                  }}
                  transition={{
                    ...SPRING,
                    delay: hot ? index * 0.05 : 0,
                  }}
                  key={index}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
/** Larchway: chat, email, meetings and documents fly into one Plotline mark on hover. */
export function InboxViz({ hot }: VizProps) {
  const sources: IconName[] = [
    "ph:chat-circle",
    "ph:envelope-simple",
    "ph:clock",
    "ph:file-pdf",
  ];
  return (
    <div className="relative grid h-[140px] w-[220px] place-items-center">
      {sources.map((source, index) => {
        const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <motion.span
            className="absolute grid h-12 w-12 place-items-center rounded-[12px] bg-white"
            style={{
              color: COLOR.soft,
              boxShadow: "0 8px 20px -12px rgba(14,17,22,.45)",
            }}
            animate={{
              x: hot ? 0 : r2(Math.cos(angle) * 70),
              y: hot ? 0 : r2(Math.sin(angle) * 42),
              scale: hot ? 0.4 : 1,
              opacity: hot ? 0 : 1,
            }}
            transition={{
              ...SPRING,
              delay: index * 0.04,
            }}
            key={source}
          >
            <Icon name={source} size={20} />
          </motion.span>
        );
      })}
      <motion.span
        className="relative grid h-14 w-14 place-items-center rounded-[14px]"
        style={{
          background: COLOR.ink,
          boxShadow: "0 10px 26px -10px rgba(14,17,22,.6)",
        }}
        animate={{
          scale: hot ? 1.15 : 0.85,
        }}
        transition={SPRING}
      >
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path
            d="M6 15.5 C9 15.5 9.5 8.5 13 8.5 S17 12 18.5 12"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="18.2" cy="12" r="2" fill={COLOR.accent} />
        </svg>
      </motion.span>
    </div>
  );
}
/** Quillmere: the share of requests answered within a week fills from 45% to 92% on hover. */
export function CycleViz({ hot }: VizProps) {
  const circumference = Math.PI * 2 * 46;
  return (
    <div
      className="relative grid h-[140px] w-[140px] place-items-center rounded-full bg-white/85 backdrop-blur"
      style={{
        boxShadow: "0 12px 30px -16px rgba(14,17,22,.4)",
      }}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={46}
          fill="none"
          stroke={COLOR.panel2}
          strokeWidth="9"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={46}
          fill="none"
          stroke={COLOR.accent}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: hot ? circumference * 0.08 : circumference * 0.55,
          }}
          transition={{
            duration: 1.1,
            ease: EASE,
          }}
        />
      </svg>
      <span className="relative text-center">
        <span
          className="block text-[26px] font-medium tracking-[-0.04em]"
          style={{
            color: COLOR.ink,
            fontFamily: FONT_DISPLAY,
          }}
        >
          {hot ? "92%" : "45%"}
        </span>
        <span
          className="text-[10.5px]"
          style={{
            color: COLOR.soft,
          }}
        >
          in 7 days
        </span>
      </span>
    </div>
  );
}
/** A customer story: name, logo icon, industry, title, headline number and its label, backdrop, and its drawing. */
export type CustomerStory = {
  n: string;
  ic: IconName;
  ind: string;
  t: string;
  v: string;
  l: string;
  tone: Tone | "sand";
  Viz: (props: VizProps) => ReactNode;
};

export const CUSTOMER_STORIES: CustomerStory[] = [
  {
    n: "Kettlebrook",
    ic: "ph:circle",
    ind: "Fintech",
    t: "Kettlebrook cut its release cycle from six weeks to two.",
    v: "3×",
    l: "more releases per quarter",
    tone: "day",
    Viz: BeforeAfterViz,
  },
  {
    n: "Larchway",
    ic: "ph:triangle",
    ind: "Logistics software",
    t: "Larchway replaced four tools and a Monday meeting.",
    v: "4 → 1",
    l: "tools replaced",
    tone: "sand",
    Viz: InboxViz,
  },
  {
    n: "Quillmere",
    ic: "ph:hexagon",
    ind: "Healthcare software",
    t: "Quillmere answers every customer request within a week.",
    v: "92%",
    l: "of requests answered in 7 days",
    tone: "dusk",
    Viz: CycleViz,
  },
];
export function Customers() {
  return (
    <Section id="customers" inner="px-5 py-20 sm:px-16 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[780px]">
          <Eyebrow>Customers</Eyebrow>
          <div className="mt-4">
            <Headline
              lead="Teams that stopped chasing updates."
              rest="Here is what changed for them."
            />
          </div>
        </div>
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="pl-ring group flex items-center gap-1.5 rounded text-[15px] no-underline outline-none"
          style={{
            color: COLOR.ink,
          }}
        >
          All customer stories
          <span className="transition-transform group-hover:translate-x-1">
            <Icon name="ph:arrow-right" size={14} />
          </span>
        </a>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {CUSTOMER_STORIES.map((story, index) => (
          <StoryCard story={story} index={index} key={story.n} />
        ))}
      </div>
    </Section>
  );
}
export function StoryCard({
  story,
  index,
}: {
  story: CustomerStory;
  index: number;
}) {
  const [hot, setHot] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHot(true);
    }
  }, [reduce]);
  const Viz = story.Viz;
  return (
    <Reveal delay={index * 0.08}>
      <motion.a
        ref={ref}
        href="#"
        onClick={(event) => event.preventDefault()}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        whileHover={{
          y: -4,
        }}
        transition={SPRING}
        className="pl-ring block rounded-[18px] bg-white p-2.5 no-underline outline-none"
        style={{
          boxShadow: `0 0 0 1px ${COLOR.line}, 0 ${hot ? 24 : 0}px 50px -30px rgba(14,17,22,.35)`,
          transition: "box-shadow .4s",
        }}
      >
        <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[12px]">
          {story.tone === "sand" ? <Sand /> : <Sky tone={story.tone} />}
          <div className="relative">
            <Viz hot={hot} />
          </div>
        </div>
        <div className="px-2 pb-2 pt-4">
          <div className="flex items-center justify-between text-[13px]">
            <span
              className="flex items-center gap-1.5 font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              <Icon name={story.ic} size={15} />
              {story.n}
            </span>
            <span
              style={{
                color: COLOR.faint,
              }}
            >
              {story.ind}
            </span>
          </div>
          <p
            className="m-0 mt-3 text-[19px] leading-[1.3] tracking-[-0.02em]"
            style={{
              color: COLOR.ink,
            }}
          >
            {story.t}
          </p>
          <div
            className="mt-4 flex items-baseline gap-2 pt-3.5"
            style={{
              borderTop: `1px solid ${COLOR.line}`,
            }}
          >
            <span
              className="text-[22px] font-medium tracking-[-0.03em]"
              style={{
                color: COLOR.accent,
              }}
            >
              {story.v}
            </span>
            <span
              className="text-[13px]"
              style={{
                color: COLOR.soft,
              }}
            >
              {story.l}
            </span>
          </div>
        </div>
      </motion.a>
    </Reveal>
  );
}
/** A pull quote from a customer, with her face and role. */
export function Quote() {
  return (
    <Section inner="px-5 py-24 sm:px-16 sm:py-32">
      <div className="mx-auto max-w-[900px] text-center">
        <span
          className="inline-block"
          style={{
            color: COLOR.accent,
          }}
        >
          <Icon name="ph:quotes-fill" size={30} />
        </span>
        <div className="mt-6">
          <Headline
            center={true}
            lead="We used to spend Monday agreeing on what was true."
            rest="Now the roadmap is true, and Monday is for building."
          />
        </div>
        <Reveal delay={0.3}>
          <div className="mt-8 flex items-center justify-center gap-3 text-[14px]">
            <Avatar name="Nadia Okoro" size={40} />
            <span className="text-left leading-tight">
              <span
                className="block font-medium"
                style={{
                  color: COLOR.ink,
                }}
              >
                Nadia Okoro
              </span>
              <span
                style={{
                  color: COLOR.soft,
                }}
              >
                VP of Product, Kettlebrook
              </span>
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
