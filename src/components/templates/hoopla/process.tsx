"use client";

import { motion } from "framer-motion";
import { Doodle, type DoodleName } from "./doodles";
import { BOUNCY, COLOR, CONTAINER, INK, SPRING } from "./theme";
import { Icon, Title, type IconName } from "./ui";
/** [step, what we do, its doodle, card colour] */
export const PROCESS: [
  step: string,
  body: string,
  doodle: DoodleName,
  color: string,
][] = [
  [
    "Plan",
    "We dig into your brand and find the angle nobody's used yet.",
    "bolt",
    COLOR.green,
  ],
  [
    "Make",
    "We shoot, edit and design the stuff your feed has been missing.",
    "star",
    COLOR.sky,
  ],
  [
    "Amplify",
    "We put it where your people already are, then double down on what lands.",
    "rainbow",
    COLOR.orange,
  ],
];
/** Our process: three tilted cards that straighten as they land, with doodles that wiggle on hover. */
export function Process() {
  return (
    <section id="process" className="scroll-mt-24 bg-white pb-24 sm:pb-32">
      <div className={CONTAINER}>
        <Title className="text-center">Our process</Title>
        <ol className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
          {PROCESS.map(([step, body, doodle, color], index) => (
            <motion.li
              className="hp-wiggle-host flex min-h-[380px] flex-col items-center rounded-[28px] p-7 text-center"
              style={{
                background: color,
              }}
              initial={{
                y: 60,
                opacity: 0,
                rotate: index === 0 ? -4 : index === 2 ? 4 : 0,
              }}
              whileInView={{
                y: 0,
                opacity: 1,
                rotate: 0,
              }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                ...SPRING,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -8,
              }}
              key={step}
            >
              <span
                className="text-[18px] font-medium tabular-nums"
                style={{
                  color: INK,
                }}
              >
                0{index + 1}
              </span>
              <motion.span
                className="hp-wiggle mt-6"
                initial={{
                  scale: 0,
                  rotate: -50,
                }}
                whileInView={{
                  scale: 1,
                  rotate: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.6,
                }}
                transition={{
                  ...BOUNCY,
                  delay: 0.25 + index * 0.12,
                }}
              >
                <Doodle name={doodle} size={doodle === "rainbow" ? 170 : 132} />
              </motion.span>
              <h3
                className="m-0 mt-auto pt-6 text-[40px] font-semibold"
                style={{
                  color: INK,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
              >
                {step}
              </h3>
              <p
                className="m-0 mt-2 max-w-[300px] text-[17px] leading-[1.45]"
                style={{
                  color: INK,
                }}
              >
                {body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
/** [name, icon, colour] */
export const CLIENTS: [name: string, icon: IconName, color: string][] = [
  ["Wavey", "ph:waveform", COLOR.orange],
  ["Spiro", "ph:spiral", COLOR.lilac],
  ["Leafly Co", "ph:leaf", COLOR.green],
  ["Loopr", "ph:infinity", COLOR.sky],
  ["Zapp", "ph:lightning", COLOR.sun],
  ["Lotus & Co", "ph:flower-lotus", COLOR.pink],
  ["Orbit", "ph:planet", COLOR.violet],
  ["Blokk", "ph:cube", COLOR.orange],
];
/** Trusted by: client badges marching sideways, each lifting on hover. */
export function Clients() {
  return (
    <section className="bg-white pb-16">
      <div
        className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-[auto_1fr]`}
      >
        <Title>Trusted by</Title>
        <div
          className="overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
            maskImage:
              "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          }}
        >
          <div
            className="hp-marquee flex w-max gap-8 py-3"
            style={{
              animation: "hp-marquee 26s linear infinite",
            }}
          >
            {[...CLIENTS, ...CLIENTS].map(([name, icon, color], index) => (
              <motion.div
                whileHover={{
                  y: -6,
                  rotate: -6,
                }}
                transition={BOUNCY}
                className="flex w-[104px] shrink-0 flex-col items-center gap-2"
                key={index}
              >
                <span
                  className="grid h-[92px] w-[92px] place-items-center rounded-full bg-white"
                  style={{
                    boxShadow: `inset 0 0 0 3px ${color}`,
                    color: INK,
                  }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-[14px]"
                    style={{
                      background: color,
                    }}
                  >
                    <Icon name={icon} size={28} />
                  </span>
                </span>
                <span
                  className="text-[17px] font-medium"
                  style={{
                    color: INK,
                  }}
                >
                  {name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
