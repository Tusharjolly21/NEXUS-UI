"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Doodle } from "./doodles";
import { BOUNCY, COLOR, CONTAINER, EASE, FONT_DISPLAY, INK } from "./theme";
import { Button, SkyBackdrop, Title } from "./ui";
/** The closing call to action on a sky: "Ready to go VIRAL?" wobbles and four arches rise on hover. */
export function Cta() {
  const [hot, setHot] = useState(false);
  return (
    <section id="contact" className="scroll-mt-24 bg-white pb-24">
      <div className={CONTAINER}>
        <div
          className="relative overflow-hidden rounded-[30px]"
          onMouseEnter={() => setHot(true)}
          onMouseLeave={() => setHot(false)}
        >
          <div className="relative flex min-h-[560px] flex-col items-center justify-center px-5 pb-28 pt-16 text-center sm:min-h-[640px]">
            <SkyBackdrop />
            <Title
              className="relative"
              style={{
                fontSize: "clamp(60px, 9vw, 130px)",
              }}
            >
              Ready to go
            </Title>
            <motion.div
              className="relative mt-1 rounded-[50%] bg-white px-[0.35em] py-[0.12em]"
              style={{
                fontFamily: FONT_DISPLAY,
                color: INK,
                fontSize: "clamp(64px, 10vw, 146px)",
                lineHeight: 0.92,
                boxShadow: "0 18px 40px -20px rgba(11,18,51,.5)",
              }}
              animate={{
                rotate: hot ? [-6, -2, -6] : -6,
              }}
              transition={{
                duration: 1.2,
                repeat: hot ? Infinity : 0,
              }}
            >
              VIRAL?
            </motion.div>
            <div className="relative mt-10">
              <Button tone="ink">Book a strategy call</Button>
            </div>
            <motion.span
              className="absolute left-[4%] top-[3%] sm:left-[7%] sm:top-[14%]"
              animate={{
                y: [0, -10, 0],
                rotate: [-8, 4, -8],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            >
              <span className="block origin-top-left max-sm:scale-[.6]">
                <Doodle name="wow" size={92} />
              </span>
            </motion.span>
            <motion.span
              className="absolute right-[8%] top-[22%] hidden sm:block"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
            >
              <Doodle name="cloud" size={120} />
            </motion.span>
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-[2%]">
              {[COLOR.green, COLOR.lilac, COLOR.yellow, COLOR.orange].map(
                (item, index) => (
                  <motion.span
                    className="block h-[90px] w-[18%] max-w-[170px] rounded-t-full"
                    style={{
                      background: item,
                      boxShadow: `0 0 0 2.5px ${INK}`,
                    }}
                    animate={{
                      y: hot ? 0 : 46,
                    }}
                    transition={{
                      ...BOUNCY,
                      delay: index * 0.05,
                    }}
                    key={item}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
/** A "Start a project" button fixed to the corner on wide screens; its letters scramble and settle on hover. */
export function FloatingCta() {
  const text = "Start a project";
  const [shown, setShown] = useState(text);
  const [hot, setHot] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const scramble = () => {
    let tick = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      tick++;
      setShown(
        text
          .split("")
          .map((item, index) =>
            item === " " || index < tick / 2
              ? item
              : ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
          )
          .join(""),
      );
      if (tick / 2 > text.length) {
        window.clearInterval(timer.current);
        setShown(text);
      }
    }, 28);
  };
  useEffect(() => () => window.clearInterval(timer.current), []);
  return (
    <motion.a
      href="#contact"
      onClick={(event) => {
        event.preventDefault();
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }}
      onMouseEnter={() => {
        setHot(true);
        scramble();
      }}
      onMouseLeave={() => setHot(false)}
      aria-label={text}
      className="hp-ring fixed bottom-4 right-4 z-40 hidden overflow-hidden rounded-[14px] bg-white px-5 py-3 text-[14px] font-semibold no-underline outline-none sm:block"
      style={{
        color: INK,
        boxShadow: "0 10px 30px -12px rgba(11,18,51,.45)",
      }}
    >
      {[COLOR.sky, COLOR.pink, COLOR.sun].map((item, index) => (
        <motion.span
          aria-hidden={true}
          className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full"
          style={{
            background: item,
            x: "-50%",
            y: "-50%",
          }}
          initial={{
            scale: 0,
          }}
          animate={{
            scale: hot ? 1 - index * 0.28 : 0,
          }}
          transition={{
            duration: 0.45,
            ease: EASE,
            delay: hot ? index * 0.06 : (2 - index) * 0.04,
          }}
          key={item}
        />
      ))}
      <span className="relative tabular-nums">{shown}</span>
    </motion.a>
  );
}
