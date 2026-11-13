"use client";

import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { Doodle } from "./doodles";
import { BOUNCY, COLOR, CONTAINER, INK } from "./theme";
import { Avatar, Eyes, Title, type Person } from "./ui";
import { WorkArt } from "./work";
/** A service: title, description, what is included, card colour and the artwork scene. */
export type Service = {
  t: string;
  d: string;
  items: string[];
  bg: string;
  scene: number;
};
export const SERVICES: Service[] = [
  {
    t: "Creator campaigns",
    d: "We match you with creators your audience already trusts, then help them make something they're proud to post.",
    items: [
      "Creator matching",
      "Briefs that leave room to play",
      "Campaign management",
      "Honest reporting",
    ],
    bg: COLOR.sky,
    scene: 1,
  },
  {
    t: "Short-form video",
    d: "Fast, bright, vertical. Made for the first second, because that's all you get.",
    items: [
      "Reels, TikTok and Shorts",
      "Trend-ready concepts",
      "Same-week edits",
      "A calendar you can keep",
    ],
    bg: COLOR.orange,
    scene: 4,
  },
  {
    t: "UGC that feels real",
    d: "Real people, real reactions, shot so it sits naturally in a feed instead of shouting over it.",
    items: [
      "Scripts and hooks",
      "Talent casting",
      "On-demand packs",
      "Edit and caption",
    ],
    bg: COLOR.green,
    scene: 3,
  },
  {
    t: "Paid social",
    d: "Ads people don't skip, built from what's already working in your organic content.",
    items: [
      "Concepts and storyboards",
      "Shoots and motion",
      "Testing plans",
      "Spend that pays back",
    ],
    bg: COLOR.yellow,
    scene: 2,
  },
  {
    t: "Launch moments",
    d: "When something big drops, we make sure the internet notices. Loudly, and on purpose.",
    items: [
      "Launch strategy",
      "Content production",
      "Every platform at once",
      "Growth recap",
    ],
    bg: COLOR.lilac,
    scene: 0,
  },
];
/** Our services as a stack of cards: each pins, and tips and shrinks a little as the next slides over it. */
export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return (
    <section id="services" className="scroll-mt-24 bg-white pb-24 sm:pb-32">
      <div className={CONTAINER}>
        <Title className="text-center">Our services</Title>
        <div ref={ref} className="mt-12 grid gap-6 md:gap-0">
          {SERVICES.map((service, index) => (
            <ServiceCard
              service={service}
              index={index}
              count={SERVICES.length}
              progress={scrollYProgress}
              key={service.t}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
export function ServiceCard({
  service,
  index,
  count,
  progress,
}: {
  service: Service;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const from = index / count;
  const to = Math.min(1, (index + 1) / count);
  const isLast = index === count - 1;
  const rotate = useTransform(
    progress,
    [from, to],
    [0, isLast ? 0 : index % 2 ? 4 : -4],
  );
  const scale = useTransform(progress, [from, to], [1, isLast ? 1 : 0.93]);
  return (
    <div
      className="md:sticky md:mb-10"
      style={{
        top: 110,
      }}
    >
      <motion.article
        style={{
          rotate: rotate,
          scale: scale,
        }}
        className="hp-wiggle-host relative isolate grid gap-6 rounded-[28px] p-6 sm:p-8 md:min-h-[520px] md:grid-cols-[1.1fr_.9fr]"
        aria-labelledby={`sv-${index}`}
      >
        <div
          className="absolute inset-0 -z-10 rounded-[28px]"
          style={{
            background: service.bg,
          }}
        />
        <div className="flex flex-col">
          <h3
            id={`sv-${index}`}
            className="m-0 text-[clamp(36px,4.6vw,64px)] font-semibold"
            style={{
              color: INK,
              letterSpacing: "-0.055em",
              lineHeight: 1,
            }}
          >
            {service.t}
          </h3>
          <p
            className="m-0 mt-4 max-w-[520px] text-[17px] leading-[1.5]"
            style={{
              color: INK,
            }}
          >
            {service.d}
          </p>
          <ul
            className="m-0 mt-8 list-none p-0 md:mt-auto"
            style={{
              borderTop: `1.5px solid ${INK}`,
            }}
          >
            {service.items.map((item) => (
              <li
                className="flex items-center gap-3 py-3 text-[17px] font-medium"
                style={{
                  color: INK,
                  borderBottom: `1.5px solid ${INK}`,
                }}
                key={item}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: INK,
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end justify-center md:justify-end">
          <div
            className="hp-wiggle aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-[20px]"
            style={{
              boxShadow: "0 0 0 4px #fff, 0 20px 40px -18px rgba(11,18,51,.5)",
              rotate: index % 2 ? "3deg" : "-3deg",
            }}
          >
            <WorkArt scene={service.scene} />
          </div>
        </div>
      </motion.article>
    </div>
  );
}
/** [superpower, sticker colour] */
export const SUPERPOWERS: [label: string, color: string][] = [
  ["Trend radar", COLOR.sky],
  ["Meme fluent", COLOR.green],
  ["Brutally honest", COLOR.lilac],
  ["Hook whisperers", COLOR.yellow],
  ["Allergic to boring", COLOR.orange],
  ["Culture nerds", COLOR.green],
  ["Caption poets", COLOR.lilac],
  ["Fast as heck", COLOR.yellow],
];
/** Our superpowers: a card that springs up with three faces on it, over two rows of superpower stickers scrolling opposite ways. */
export function Superpowers() {
  return (
    <section className="overflow-hidden bg-white pb-24 sm:pb-32">
      <div className={`${CONTAINER} text-center`}>
        <Title>Our superpowers</Title>
        <div className="relative mx-auto mt-10 max-w-[720px]">
          <motion.div
            className="relative aspect-[16/10] w-full"
            style={{
              clipPath: "url(#hp-blob)",
            }}
            initial={{
              scale: 0.7,
              rotate: -6,
            }}
            whileInView={{
              scale: 1,
              rotate: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 14,
            }}
          >
            <WorkArt scene={2} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-3">
              {(
                [
                  "Hana Reyes",
                  "Milo Park",
                  "Ada Nwosu",
                ] as const satisfies readonly Person[]
              ).map((item, index) => (
                <motion.div
                  initial={{
                    y: 120,
                  }}
                  whileInView={{
                    y: index === 1 ? 0 : 14,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    ...BOUNCY,
                    delay: 0.25 + index * 0.1,
                  }}
                  key={item}
                >
                  <Avatar
                    name={item}
                    size={170}
                    className="!h-auto !w-[22vw] max-w-[170px]"
                    ring="#fff"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          <div className="absolute -left-2 top-[18%] sm:-left-12">
            <Eyes size={78} />
          </div>
          <motion.div
            className="absolute -right-2 bottom-[16%] sm:-right-10"
            animate={{
              rotate: [0, 14, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Doodle name="flower" size={74} />
          </motion.div>
        </div>
      </div>
      <div
        className="relative mt-12"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        {[0, 1].map((item) => (
          <div
            className={`hp-marquee flex w-max gap-4 ${item ? "mt-3" : ""}`}
            style={{
              animation: `${item ? "hp-marquee-r" : "hp-marquee"} ${item ? 34 : 28}s linear infinite`,
            }}
            key={item}
          >
            {[...SUPERPOWERS, ...SUPERPOWERS].map(([label, color], index) => (
              <motion.span
                whileHover={{
                  scale: 1.12,
                  rotate: index % 2 ? 5 : -5,
                }}
                transition={BOUNCY}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-[17px] font-medium"
                style={{
                  background: color,
                  color: INK,
                  marginTop: (index + item) % 2 ? 14 : 0,
                }}
                key={index}
              >
                {label}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
