"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Console } from "./console";
import { Landscape } from "./landscape";
import { CONTAINER, DARK, EASE, FONT_MONO } from "./theme";
import { Avatar, Button, Icon } from "./ui";

const HEADLINE = [
  ["Serve", "any", "model,"],
  ["a", "short", "hop", "from", "everyone"],
];

export function Hero() {
  const { scrollY } = useScroll();
  const skyY = useTransform(scrollY, [0, 1200], [0, 260]);
  const skyScale = useTransform(scrollY, [0, 1200], [1, 1.08]);
  let wordIndex = 0;
  return (
    <section id="top" className="relative overflow-hidden pt-[124px] sm:pt-[148px]">
      <div aria-hidden={true} className="absolute inset-x-0 top-0 h-[1200px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            y: skyY,
            scale: skyScale,
          }}
        >
          <Landscape scene="dusk" id="op-hero" sun={[1060, 560]} />
        </motion.div>
      </div>
      <div
        aria-hidden={true}
        className="absolute inset-x-0 top-0 h-[1200px]"
        style={{
          background: `linear-gradient(180deg, ${DARK.bg} 0%, rgba(9,9,11,.92) 18%, rgba(9,9,11,.45) 40%, rgba(9,9,11,.05) 58%, rgba(9,9,11,.1) 74%, ${DARK.bg} 100%)`,
        }}
      />
      <div className={`${CONTAINER} relative text-center`}>
        <motion.a
          href="#network"
          initial={{
            opacity: 0,
            y: 8,
            filter: "blur(6px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] transition-colors hover:bg-white/[.06]"
          style={{
            color: DARK.text,
            boxShadow: `inset 0 0 0 1px ${DARK.line2}`,
            background: "rgba(255,255,255,.03)",
          }}
        >
          <span
            className="rounded-full px-2 py-0.5 text-[11.5px] font-[600]"
            style={{
              background: DARK.ink,
              color: DARK.bg,
            }}
          >
            New
          </span>
          São Paulo and Singapore are live
          <Icon name="ph:arrow-right" size={12} />
        </motion.a>
        <h1
          className="mx-auto mt-6 max-w-[1000px] text-[clamp(40px,6.6vw,74px)] font-[500] leading-[1.02] tracking-[-0.045em]"
          style={{
            color: DARK.ink,
          }}
        >
          {HEADLINE.map((line, i) => (
            <span key={i} className="block">
              {line.map((word) => {
                const index = wordIndex++;
                return (
                  <motion.span
                    key={word + index}
                    className="inline-block whitespace-pre"
                    initial={{
                      opacity: 0,
                      y: 18,
                      filter: "blur(14px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: 0.9,
                      delay: 0.12 + index * 0.075,
                      ease: EASE,
                    }}
                  >
                    {word}{" "}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.75,
            ease: EASE,
          }}
          className="mx-auto mt-6 max-w-[520px] text-[16.5px] leading-[1.55]"
          style={{
            color: DARK.text,
          }}
        >
          Run open or fine-tuned models on GPUs that sleep when nobody is asking. Every request is answered from the
          region closest to the person who sent it.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.9,
            ease: EASE,
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
        >
          <Button kind="light" icon="ph:arrow-right" href="#cta">
            Deploy a model
          </Button>
          <span
            className="flex items-center gap-2.5 text-left text-[12.5px] leading-tight"
            style={{
              color: DARK.text,
            }}
          >
            <span className="flex -space-x-2">
              {["Mateo Silva", "Hana Mori", "Felix Brandt"].map((name) => (
                <Avatar key={name} name={name} size={26} ring={DARK.bg} />
              ))}
            </span>
            <span>
              <b
                className="font-[600]"
                style={{
                  color: DARK.ink,
                }}
              >
                3,200 teams
              </b>
              <br />
              serving with Outpost
            </span>
          </span>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 60,
            rotateX: 18,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.3,
            delay: 0.85,
            ease: EASE,
          }}
          className="mx-auto mt-14 max-w-[1040px] sm:mt-16"
          style={{
            transformPerspective: 1600,
            transformOrigin: "50% 0%",
          }}
        >
          <Console />
        </motion.div>
      </div>
      <CustomerStrip />
    </section>
  );
}

function CustomerStrip() {
  const logos: [name: string, style: CSSProperties, mark?: ReactNode][] = [
    [
      "Larkspur",
      {
        fontWeight: 650,
        letterSpacing: "-0.04em",
        fontSize: 21,
      },
      <svg key="l" viewBox="0 0 16 16" width="15" height="15" aria-hidden={true}>
        <path
          d="M8 15 C 8 9, 4 6, 2 2 C 7 3, 9 7, 8 15 Z M8 15 C 8 10, 11 6, 14 4 C 13 9, 11 12, 8 15 Z"
          fill="currentColor"
        />
      </svg>,
    ],
    [
      "fieldnote",
      {
        fontFamily: FONT_MONO,
        fontWeight: 500,
        letterSpacing: "-0.03em",
        fontSize: 18,
      },
    ],
    [
      "PARALLAX",
      {
        fontWeight: 600,
        letterSpacing: "0.24em",
        fontSize: 14,
      },
    ],
    [
      "Kettle & Co.",
      {
        fontWeight: 500,
        fontStyle: "italic",
        letterSpacing: "-0.03em",
        fontSize: 20,
      },
    ],
    [
      "orbital",
      {
        fontWeight: 800,
        letterSpacing: "-0.06em",
        fontSize: 22,
      },
      <svg key="o" viewBox="0 0 16 16" width="16" height="16" aria-hidden={true}>
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="13" cy="4" r="2" fill="currentColor" />
      </svg>,
    ],
    [
      "Northbeam",
      {
        fontWeight: 400,
        letterSpacing: "-0.02em",
        fontSize: 20,
      },
    ],
  ];
  return (
    <div className={`${CONTAINER} relative pb-24 pt-16 text-center sm:pt-20`}>
      <p
        className="text-[13px]"
        style={{
          color: DARK.soft,
        }}
      >
        Answering production traffic for teams at
      </p>
      <div className="mx-auto mt-7 grid max-w-[920px] grid-cols-2 items-center gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map(([name, style, mark], i) => (
          <motion.span
            key={name}
            initial={{
              opacity: 0,
              filter: "blur(6px)",
            }}
            whileInView={{
              opacity: 1,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
              delay: i * 0.07,
            }}
            className="flex items-center justify-center gap-1.5 transition-colors duration-300 hover:!text-[#F1EFEA]"
            style={{
              color: "#8E8E96",
              ...style,
            }}
          >
            {mark}
            {name}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
