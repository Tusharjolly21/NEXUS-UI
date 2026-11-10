"use client";

import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { Doodle, isDoodle } from "./doodles";
import { BOUNCY, COLOR, CONTAINER, FONT_HAND, INK } from "./theme";
import { Avatar, Button, Cloud, SkyBackdrop, Sticker, type Person } from "./ui";
/** The about paragraph, word by word; words that name a doodle ("rainbow", "wow", "heart") show the sticker instead. */
export const ABOUT_WORDS = [
  "A",
  "tiny",
  "content",
  "studio",
  "rainbow",
  "turning",
  "brands",
  "into",
  "the",
  "ones",
  "everyone's",
  "group",
  "chat",
  "is",
  "talking",
  "about.",
  "Think",
  "of",
  "us",
  "wow",
  "as",
  "your",
  "hype",
  "crew,",
  "content",
  "kitchen",
  "and",
  "strategy",
  "brain",
  "heart",
  "in",
  "one",
  "very",
  "loud",
  "package.",
];
/** Who we are: the paragraph lights up word by word as you scroll, with stickers popping in for some words. */
export function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  });
  return (
    <section
      id="about"
      className="-mt-px scroll-mt-24 bg-white pb-20 pt-4 sm:pb-28"
    >
      <div className={`${CONTAINER} text-center`}>
        <p
          className="m-0 text-[clamp(20px,2.4vw,30px)] font-medium"
          style={{
            color: COLOR.muted,
            letterSpacing: "-0.03em",
          }}
        >
          Who we are
        </p>
        <p
          ref={ref}
          className="mx-auto m-0 mt-3 max-w-[1040px] font-medium"
          style={{
            fontSize: "clamp(30px, 4.6vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-0.045em",
            color: INK,
          }}
        >
          {ABOUT_WORDS.map((word, index) => (
            <AboutWord
              word={word}
              progress={scrollYProgress}
              at={index / ABOUT_WORDS.length}
              key={index}
            />
          ))}
        </p>
        <motion.div
          className="mt-9 inline-block"
          initial={{
            rotate: -12,
            y: 30,
            opacity: 0,
          }}
          whileInView={{
            rotate: 0,
            y: 0,
            opacity: 1,
          }}
          viewport={{
            once: true,
            amount: 1,
          }}
          transition={BOUNCY}
        >
          <Button tone="white" href="#work">
            See what we make
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
export function AboutWord({
  word,
  progress,
  at,
}: {
  word: string;
  progress: MotionValue<number>;
  at: number;
}) {
  const opacity = useTransform(progress, [at - 0.1, at], [0.14, 1]);
  const pop = useTransform(progress, [at - 0.06, at + 0.02], [0, 1]);
  if (isDoodle(word)) {
    return (
      <motion.span
        className="mx-[0.08em] inline-block align-[-0.18em]"
        style={{
          scale: pop,
        }}
      >
        <Doodle
          name={word}
          size={word === "rainbow" ? 92 : 66}
          style={{
            width: word === "rainbow" ? "1.5em" : "1.05em",
            height: "auto",
          }}
        />
      </motion.span>
    );
  } else {
    return (
      <motion.span
        style={{
          opacity: opacity,
        }}
      >
        {word}{" "}
      </motion.span>
    );
  }
}
/** Meet the crew: a sky card that grows as it scrolls in, with the team on clouds and stickers. */
export function Crew() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [56, 28]);
  const crew: [name: Person, role: string, color: string][] = [
    ["Rosa Vega", "Creative lead", COLOR.yellow],
    ["Theo Banks", "Video & edit", COLOR.lilac],
    ["Kemi Ade", "Creator partnerships", COLOR.green],
  ];
  return (
    <section className="bg-white pb-24 sm:pb-36">
      <div className={CONTAINER}>
        <motion.div
          ref={ref}
          style={{
            scale: scale,
            borderRadius: radius,
          }}
          className="relative overflow-hidden"
        >
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
            <SkyBackdrop puffs={false} />
            <svg
              viewBox="0 0 1200 600"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-[40%] h-[34%] w-full"
              aria-hidden={true}
            >
              <path
                d="M0 120 C 220 30, 420 40, 600 140 S 980 260, 1200 90 V 260 C 1000 380, 800 320, 600 260 S 220 160, 0 300 Z"
                fill={COLOR.sky}
              />
            </svg>
            <Cloud w={120} className="absolute left-[6%] top-[10%]" />
            <Cloud w={90} className="absolute right-[8%] top-[16%]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-[2%] px-[4%]">
              {crew.map(([name, role, color], index) => (
                <motion.figure
                  className="m-0 flex flex-col items-center"
                  initial={{
                    y: 80,
                    opacity: 0,
                  }}
                  whileInView={{
                    y: 0,
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.4,
                  }}
                  transition={{
                    ...BOUNCY,
                    delay: index * 0.12,
                  }}
                  key={name}
                >
                  <div
                    className="w-[28vw] max-w-[300px] overflow-hidden rounded-t-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 0 3px ${INK}`,
                    }}
                  >
                    <Avatar
                      name={name}
                      size={300}
                      className="!h-auto !w-full !rounded-none"
                    />
                  </div>
                  <figcaption
                    className="w-full bg-white py-2 text-center text-[clamp(11px,1.2vw,15px)] leading-tight"
                    style={{
                      boxShadow: `0 0 0 3px ${INK}`,
                    }}
                  >
                    <b
                      className="block font-semibold"
                      style={{
                        color: INK,
                      }}
                    >
                      {name}
                    </b>
                    <span
                      style={{
                        color: COLOR.muted,
                      }}
                    >
                      {role}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <motion.span
              className="absolute left-[5%] top-[7%] sm:top-[12%]"
              initial={{
                rotate: -20,
                scale: 0,
              }}
              whileInView={{
                rotate: -6,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                ...BOUNCY,
                delay: 0.3,
              }}
            >
              <Sticker
                font={FONT_HAND}
                size={34}
                bg={COLOR.lilac}
                style={{
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                meet the crew
              </Sticker>
            </motion.span>
            <motion.span
              className="absolute right-[5%] top-[22%] sm:top-[18%]"
              initial={{
                rotate: 20,
                scale: 0,
              }}
              whileInView={{
                rotate: -4,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                ...BOUNCY,
                delay: 0.45,
              }}
            >
              <Sticker
                font={FONT_HAND}
                size={34}
                bg={COLOR.yellow}
                style={{
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                say hi!
              </Sticker>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
