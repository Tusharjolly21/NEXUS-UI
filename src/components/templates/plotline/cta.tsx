"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { COLOR, EASE, FONT_DISPLAY } from "./theme";
import { Button, Section, Sky } from "./ui";
/** The closing call to action on a dusk sky, with a soft light that follows the pointer. */
export function Cta() {
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const glow = useTransform(
    [pointerX, pointerY],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, rgba(255,255,255,.55), transparent 60%)`,
  );
  return (
    <Section id="contact" inner="px-3 py-6 sm:px-8 sm:py-8">
      <div
        className="relative overflow-hidden rounded-[24px]"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - box.left) / box.width) * 100);
          pointerY.set(((event.clientY - box.top) / box.height) * 100);
        }}
      >
        <Sky tone="dusk" />
        <motion.div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0"
          style={{
            background: glow,
          }}
        />
        <div className="relative flex flex-col items-center px-5 py-24 text-center sm:py-32">
          <h2
            className="m-0 font-medium"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(44px, 7vw, 96px)",
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: COLOR.ink,
            }}
          >
            {"Plan less. Ship more.".split(" ").map((item, index) => (
              <motion.span
                className="inline-block whitespace-pre"
                initial={{
                  opacity: 0,
                  filter: "blur(14px)",
                  y: 16,
                }}
                whileInView={{
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: index * 0.1,
                }}
                key={index}
              >
                {item}{" "}
              </motion.span>
            ))}
          </h2>
          <p
            className="m-0 mt-5 max-w-[440px] text-[17px] leading-[1.55]"
            style={{
              color: "#2C3340",
            }}
          >
            Set up your first roadmap in ten minutes. Free for teams up to 10.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Button>Book a demo</Button>
            <Button dark={true}>Start for free</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
