"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Doodle } from "./doodles";
import { FormatReel } from "./format-reel";
import { Loader } from "./loader";
import {
  BOUNCY,
  COLOR,
  EASE,
  FONT_DISPLAY,
  FONT_HAND,
  FONT_SANS,
  INK,
  SPRING,
} from "./theme";
import { Button, Eyes, SkyBackdrop, Sticker } from "./ui";
/** A sticker around the hero headline: position, tilt, the sticker (smaller on phones) and whether phones hide it. */
type HeroSticker = {
  x: string;
  y: string;
  r: number;
  el: (small: boolean) => ReactNode;
  hideSm?: boolean;
};

export const HERO_STICKERS: HeroSticker[] = [
  {
    x: "5%",
    y: "15%",
    r: -14,
    el: (small) => <Doodle name="smiley" size={small ? 58 : 96} />,
  },
  {
    x: "83%",
    y: "13%",
    r: 12,
    el: (small) => (
      <Sticker size={small ? 28 : 46} bg="#fff">
        100% fresh
      </Sticker>
    ),
  },
  {
    x: "9%",
    y: "70%",
    r: 0,
    el: (small) => <Doodle name="spark" size={small ? 50 : 78} />,
    hideSm: true,
  },
  {
    x: "88%",
    y: "64%",
    r: 8,
    el: (small) => <Doodle name="heart" size={small ? 56 : 88} />,
  },
  {
    x: "76%",
    y: "84%",
    r: -6,
    el: (small) => (
      <Sticker
        size={small ? 26 : 38}
        bg={COLOR.yellow}
        font={FONT_HAND}
        style={{
          fontWeight: 600,
          textTransform: "none",
        }}
      >
        drag us around
      </Sticker>
    ),
    hideSm: true,
  },
];
/**
 * The hero: "We make posts people can't skip" rises line by line after the intro, with eyes that follow the pointer,
 * a rainbow, a looping reel of post formats and stickers you can drag. It stays pinned and shrinks back as the page
 * scrolls up over it.
 */
export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(900);
  useEffect(() => {
    const measure = () => setViewportHeight(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const scale = useTransform(scrollY, [0, viewportHeight * 1.2], [1, 0.88]);
  const lift = useTransform(scrollY, [0, viewportHeight * 1.2], [0, -90]);
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setSmall(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  /** motion props for headline line `line`, rising out of its mask once the intro is done */
  const rise = (line: number) => ({
    initial: {
      y: "108%",
    },
    animate: {
      y: ready ? "0%" : "108%",
    },
    transition: {
      duration: 0.9,
      ease: EASE,
      delay: ready ? 0.15 + line * 0.12 : 0,
    },
  });
  return (
    <section
      id="home"
      ref={ref}
      className="sticky top-0 z-0 h-[100svh] overflow-hidden"
    >
      <div className="relative h-full">
        <SkyBackdrop />
        <AnimatePresence>{!ready && <Loader key="storm" />}</AnimatePresence>
        <motion.div
          style={{
            scale: scale,
            y: lift,
          }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-4 pt-16 text-center"
        >
          <h1
            className="m-0 font-normal uppercase"
            style={{
              fontFamily: FONT_DISPLAY,
              color: INK,
              fontSize: "clamp(58px, 11.4vw, 172px)",
              lineHeight: 0.88,
            }}
          >
            <span className="block overflow-hidden pb-[0.02em]">
              <motion.span className="block" {...rise(0)}>
                We make posts
              </motion.span>
            </span>
            <span className="relative block">
              <span className="block overflow-hidden pb-[0.02em]">
                <motion.span className="block" {...rise(1)}>
                  people can’t
                </motion.span>
              </span>
              <motion.span
                className="absolute -top-[0.42em] left-[2%] sm:-left-[0.5em] sm:top-[0.06em]"
                initial={{
                  scale: 0,
                  rotate: -30,
                }}
                animate={{
                  scale: ready ? 1 : 0,
                  rotate: ready ? -8 : -30,
                }}
                transition={{
                  ...BOUNCY,
                  delay: ready ? 0.7 : 0,
                }}
              >
                <Eyes size={small ? 50 : 112} />
              </motion.span>
              <motion.span
                className="absolute -top-[0.5em] right-[2%] sm:-right-[0.62em] sm:-top-[0.04em]"
                initial={{
                  scale: 0,
                  rotate: 30,
                }}
                animate={{
                  scale: ready ? 1 : 0,
                  rotate: ready ? 10 : 30,
                }}
                transition={{
                  ...BOUNCY,
                  delay: ready ? 0.85 : 0,
                }}
              >
                <Doodle name="rainbow" size={small ? 62 : 138} />
              </motion.span>
            </span>
            <span className="flex flex-wrap items-center justify-center gap-x-[0.12em] gap-y-3">
              <span className="block overflow-hidden pb-[0.02em]">
                <motion.span
                  className="block"
                  style={{
                    color: COLOR.orange,
                  }}
                  {...rise(2)}
                >
                  skip
                </motion.span>
              </span>
              <motion.span
                className="block h-[clamp(92px,9.6vw,148px)] w-[min(78vw,340px)] text-left normal-case"
                style={{
                  fontFamily: FONT_SANS,
                }}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  rotate: 4,
                }}
                animate={{
                  opacity: ready ? 1 : 0,
                  scale: ready ? 1 : 0.8,
                  rotate: ready ? 0 : 4,
                }}
                transition={{
                  ...SPRING,
                  delay: ready ? 0.55 : 0,
                }}
              >
                <FormatReel on={ready} />
              </motion.span>
            </span>
          </h1>
          <motion.div
            className="mt-8 sm:mt-10"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: ready ? 1 : 0,
              y: ready ? 0 : 20,
            }}
            transition={{
              ...SPRING,
              delay: ready ? 0.75 : 0,
            }}
          >
            <Button href="#contact">Start a project</Button>
          </motion.div>
        </motion.div>
        {HERO_STICKERS.map((sticker, index) =>
          sticker.hideSm && small ? null : (
            <motion.div
              drag={true}
              dragConstraints={ref}
              dragElastic={0.2}
              dragMomentum={true}
              whileDrag={{
                scale: 1.15,
                rotate: sticker.r + 8,
                zIndex: 30,
              }}
              data-cursor="Drag me"
              className="absolute z-20 touch-none"
              style={{
                left: sticker.x,
                top: sticker.y,
              }}
              initial={{
                scale: 0,
                rotate: sticker.r - 40,
              }}
              animate={{
                scale: ready ? 1 : 0,
                rotate: sticker.r,
              }}
              transition={{
                ...BOUNCY,
                delay: ready ? 0.4 + index * 0.1 : 0,
              }}
              key={index}
            >
              <div
                className="hp-bob"
                style={{
                  animation: `hp-bob ${4 + index}s ease-in-out infinite`,
                }}
              >
                {sticker.el(small)}
              </div>
            </motion.div>
          ),
        )}
      </div>
    </section>
  );
}
