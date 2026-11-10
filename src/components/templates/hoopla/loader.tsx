"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Doodle } from "./doodles";
import { COLOR } from "./theme";
import { Sticker } from "./ui";
/** A sticker that flies up through the intro: left %, the sticker, rotation from and to, and delay. */
type LoaderSticker = {
  x: number;
  el: ReactNode;
  r: [from: number, to: number];
  d: number;
};

export const LOADER_STICKERS: LoaderSticker[] = [
  {
    x: 20,
    el: <Sticker size={76}>loading</Sticker>,
    r: [-34, 18],
    d: 0,
  },
  {
    x: 36,
    el: <Sticker size={84}>12%</Sticker>,
    r: [24, -30],
    d: 0.14,
  },
  {
    x: 72,
    el: <Doodle name="heart" size={170} />,
    r: [-20, 40],
    d: 0.2,
  },
  {
    x: 88,
    el: <Doodle name="smiley" size={150} />,
    r: [30, -10],
    d: 0.34,
  },
  {
    x: 8,
    el: (
      <Sticker size={84} bg={COLOR.yellow}>
        34%
      </Sticker>
    ),
    r: [-14, 26],
    d: 0.46,
  },
  {
    x: 54,
    el: <Doodle name="spark" size={140} />,
    r: [0, 120],
    d: 0.56,
  },
  {
    x: 30,
    el: (
      <Sticker size={70} bg={COLOR.sun}>
        let’s go
      </Sticker>
    ),
    r: [18, -22],
    d: 0.7,
  },
  {
    x: 80,
    el: (
      <Sticker size={84} bg={COLOR.lilac}>
        58%
      </Sticker>
    ),
    r: [-26, 14],
    d: 0.82,
  },
  {
    x: 14,
    el: <Doodle name="star" size={160} />,
    r: [10, -60],
    d: 0.96,
  },
  {
    x: 62,
    el: <Doodle name="wow" size={150} />,
    r: [-12, 16],
    d: 1.06,
  },
  {
    x: 44,
    el: (
      <Sticker size={84} bg={COLOR.green}>
        81%
      </Sticker>
    ),
    r: [16, -12],
    d: 1.18,
  },
  {
    x: 92,
    el: <Doodle name="bolt" size={130} />,
    r: [-10, 30],
    d: 1.28,
  },
  {
    x: 26,
    el: <Doodle name="flower" size={130} />,
    r: [0, -90],
    d: 1.4,
  },
  {
    x: 66,
    el: <Sticker size={96}>100%</Sticker>,
    r: [12, -18],
    d: 1.52,
  },
  {
    x: 48,
    el: <Doodle name="sun" size={150} />,
    r: [-30, 30],
    d: 1.62,
  },
];
/** The intro: stickers and a loading count fly up the screen on a sky, then fade as the hero arrives. */
export function Loader() {
  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 z-20"
      exit={{
        opacity: 0,
        transition: {
          duration: 0.4,
        },
      }}
    >
      {LOADER_STICKERS.map((sticker, index) => (
        <motion.div
          className="absolute top-0"
          style={{
            left: `${sticker.x}%`,
            x: "-50%",
          }}
          initial={{
            y: "110vh",
            rotate: sticker.r[0],
            scale: 0.8,
          }}
          animate={{
            y: "-45vh",
            rotate: sticker.r[1],
            scale: 1.05,
          }}
          transition={{
            duration: 2.1,
            delay: sticker.d,
            ease: [0.35, 0.15, 0.45, 0.95],
          }}
          key={index}
        >
          <div className="max-sm:scale-[.6]">{sticker.el}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
