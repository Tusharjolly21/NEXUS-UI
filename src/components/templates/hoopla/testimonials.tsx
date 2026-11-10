"use client";

import { motion } from "framer-motion";
import { COLOR, CONTAINER, FONT_HAND, INK, SPRING } from "./theme";
import { Avatar, Sticker, Title, type Person } from "./ui";
/** [quote, name, role, company handle, bubble colour] */
export const TESTIMONIALS: [
  quote: string,
  name: Person,
  role: string,
  company: string,
  color: string,
][] = [
  [
    "Hoopla made our launch feel effortless. Fun people, fast turnaround, and a video that actually travelled.",
    "Hana Reyes",
    "Brand lead",
    "@Glowtide Skincare",
    COLOR.sky,
  ],
  [
    "Colourful, clever and always on brief. Our saves tripled in a month.",
    "Milo Park",
    "Creative director",
    "@Snackwell",
    COLOR.green,
  ],
  [
    "Playful energy, sharp execution. Their shorts made us look like the cool kids.",
    "Ada Nwosu",
    "Marketing lead",
    "@Pacer Run Club",
    COLOR.orange,
  ],
  [
    "They get internet culture without trying too hard, which is the whole trick.",
    "Sol Martin",
    "Founder",
    "@Corner Thread",
    COLOR.lilac,
  ],
];
/** Testimonials as chat bubbles that slide in from alternating sides. */
export function Testimonials() {
  return (
    <section className="bg-white pb-24 sm:pb-32">
      <div className={CONTAINER}>
        <Title className="mx-auto max-w-[900px] text-center">
          Don’t just take our word for it
        </Title>
        <div className="mx-auto mt-14 grid max-w-[1080px] gap-10">
          {TESTIMONIALS.map(([quote, name, role, company, color], index) => {
            const fromRight = index % 2 === 1;
            return (
              <motion.figure
                className={`m-0 flex flex-col ${fromRight ? "items-end" : "items-start"}`}
                initial={{
                  x: fromRight ? 80 : -80,
                  opacity: 0,
                  rotate: fromRight ? 4 : -4,
                }}
                whileInView={{
                  x: 0,
                  opacity: 1,
                  rotate: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.6,
                }}
                transition={SPRING}
                key={name}
              >
                <blockquote
                  className={`relative m-0 max-w-[860px] rounded-[26px] px-6 py-5 text-[clamp(22px,2.7vw,36px)] font-medium sm:px-7 ${fromRight ? "rounded-br-[8px]" : "rounded-bl-[8px]"}`}
                  style={{
                    background: color,
                    color: INK,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.14,
                  }}
                >
                  {quote}
                  {index === 1 && (
                    <span className="absolute -left-5 -top-6 rotate-[-10deg]">
                      <Sticker
                        font={FONT_HAND}
                        size={30}
                        bg={COLOR.yellow}
                        style={{
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        so good
                      </Sticker>
                    </span>
                  )}
                </blockquote>
                <figcaption
                  className={`mt-3 flex items-center gap-3 ${fromRight ? "flex-row-reverse text-right" : ""}`}
                >
                  <Avatar name={name} size={56} ring="#fff" />
                  <span className="text-[16px] leading-snug">
                    <span
                      className="block font-medium"
                      style={{
                        color: INK,
                      }}
                    >
                      {name}, {role}
                    </span>
                    <span
                      style={{
                        color: COLOR.muted,
                      }}
                    >
                      {company}
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
