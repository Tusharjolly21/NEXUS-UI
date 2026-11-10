"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Doodle, type DoodleName } from "./doodles";
import { BOUNCY, COLOR, CONTAINER, FONT_DISPLAY, INK, SPRING } from "./theme";
import { ScallopEdge, Title, useCountUp } from "./ui";
/** [reason, body, doodle] */
export const REASONS: [title: string, body: string, doodle: DoodleName][] = [
  [
    "Playful, never silly",
    "We take the work seriously so the content doesn't have to.",
    "smiley",
  ],
  [
    "Data with taste",
    "We read the numbers, then make something worth measuring.",
    "spark",
  ],
  [
    "Actually authentic",
    "Real people and real reactions. No stock smiles.",
    "heart",
  ],
  [
    "Quick on our feet",
    "Trends move in days. So do we, without cutting corners.",
    "bolt",
  ],
];
/** Why us: four numbered reason cards on a sky band with scalloped cloud edges. */
export function WhyUs() {
  return (
    <section className="relative bg-white pt-10">
      <ScallopEdge fill={COLOR.sky} />
      <div
        className="-mt-px pb-6 pt-10"
        style={{
          background: COLOR.sky,
        }}
      >
        <div className={CONTAINER}>
          <Title className="text-center">Why us?</Title>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {REASONS.map(([title, body, doodle], index) => (
              <motion.div
                className="hp-wiggle-host relative flex min-h-[300px] flex-col rounded-[26px] bg-white p-6 sm:p-7"
                initial={{
                  y: 50,
                  rotate: index % 2 ? 3 : -3,
                  opacity: 0,
                }}
                whileInView={{
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.4,
                }}
                transition={{
                  ...SPRING,
                  delay: (index % 2) * 0.1,
                }}
                whileHover={{
                  rotate: index % 2 ? 1.5 : -1.5,
                  y: -4,
                }}
                key={title}
              >
                <span
                  className="absolute right-6 top-6 text-[18px] tabular-nums"
                  style={{
                    color: INK,
                  }}
                >
                  0{index + 1}
                </span>
                <span className="hp-wiggle w-fit">
                  <Doodle name={doodle} size={96} />
                </span>
                <h3
                  className="m-0 mt-auto pt-8 text-[clamp(30px,3.2vw,42px)] font-semibold"
                  style={{
                    color: INK,
                    letterSpacing: "-0.05em",
                    lineHeight: 1.02,
                  }}
                >
                  {title}
                </h3>
                <p
                  className="m-0 mt-2 text-[17px] leading-[1.45]"
                  style={{
                    color: INK,
                  }}
                >
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ScallopEdge fill={COLOR.sky} flip={true} />
    </section>
  );
}
/** Results: three numbers that count up once on screen. */
export function Results() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.5,
  });
  const lift = useCountUp(240, inView);
  const roas = useCountUp(11, inView);
  const views = useCountUp(18.4, inView, 1);
  const results: [value: string, label: string, color: string][] = [
    [`+${lift}%`, "Average engagement lift", COLOR.green],
    [`${roas}x`, "Return on paid social", COLOR.orange],
    [`${views}M`, "Views last year", COLOR.lilac],
  ];
  return (
    <section className="bg-white pb-24 pt-16 sm:pb-32">
      <div className={CONTAINER}>
        <div className="flex items-center justify-center gap-3">
          <span
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{
              background: COLOR.sky,
            }}
          >
            <Doodle
              name="smiley"
              size={44}
              style={{
                filter: "none",
              }}
            />
          </span>
          <span>
            <span
              className="block text-[32px] font-bold leading-none"
              style={{
                color: INK,
                letterSpacing: "-0.05em",
              }}
            >
              Hoopla
            </span>
            <span
              className="text-[18px]"
              style={{
                color: COLOR.muted,
              }}
            >
              since 2021
            </span>
          </span>
        </div>
        <div ref={ref} className="mt-10 grid gap-4 md:grid-cols-3">
          {results.map(([value, label, color], index) => (
            <motion.div
              className="grid min-h-[240px] place-items-center rounded-[26px] p-6 text-center"
              style={{
                background: color,
              }}
              whileHover={{
                rotate: index === 1 ? 0 : index ? 2 : -2,
                scale: 1.02,
              }}
              transition={BOUNCY}
              key={label}
            >
              <div>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(72px, 8vw, 120px)",
                    lineHeight: 0.9,
                    color: INK,
                  }}
                >
                  {value}
                </div>
                <div
                  className="mt-3 text-[18px] font-semibold"
                  style={{
                    color: INK,
                  }}
                >
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
