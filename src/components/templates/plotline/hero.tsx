"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AppMock } from "./app-mock";
import { COLOR, CONTAINER, EASE, FONT_DISPLAY } from "./theme";
import { Button, Icon, Section, Sky, useFitScale } from "./ui";
/** The hero: headline, two buttons, and the app mock on a painted sky that tilts up flat as you scroll to it. */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "start 15%"],
  });
  const tilt = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const lift = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const [fitRef, fit] = useFitScale(1040);
  const stageScale = Math.max(fit, 0.6);
  const titleWords = "The planning tool for teams that ship.".split(" ");
  return (
    <Fragment>
      <Section noTop={true} inner="px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-40">
        <div className="flex flex-col items-center text-center">
          <motion.a
            href="#changelog"
            onClick={(event) => {
              event.preventDefault();
              document
                .getElementById("changelog")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: EASE,
            }}
            className="pl-ring group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13.5px] no-underline outline-none"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
              color: COLOR.ink,
            }}
          >
            <span
              className="rounded-full px-2 py-0.5 text-[12px] font-medium text-white"
              style={{
                background: COLOR.accent,
              }}
            >
              New
            </span>
            Plotline 3.0 drafts your weekly update for you
            <span
              className="transition-transform group-hover:translate-x-0.5"
              style={{
                color: COLOR.soft,
              }}
            >
              <Icon name="ph:arrow-right" size={13} />
            </span>
          </motion.a>
          <h1
            className="m-0 mt-7 max-w-[860px] font-medium"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(44px, 7vw, 92px)",
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: COLOR.ink,
              textWrap: "balance",
            }}
          >
            {titleWords.map((titleWord, index) => (
              <motion.span
                className="inline-block whitespace-pre"
                initial={{
                  opacity: 0,
                  filter: "blur(14px)",
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 0.1 + index * 0.08,
                }}
                key={index}
              >
                {titleWord}
                {index < titleWords.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="m-0 mt-6 max-w-[540px] text-[17px] leading-[1.6] sm:text-[18px]"
            style={{
              color: COLOR.text,
            }}
            initial={{
              opacity: 0,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.8,
              delay: 0.6,
            }}
          >
            Requests, roadmaps and releases in one calm workspace. Everyone
            knows what’s next, and nobody has to chase an update.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-2.5"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.75,
            }}
          >
            <Button href="#contact">Book a demo</Button>
            <Button dark={true} href="#pricing">
              Start for free
            </Button>
          </motion.div>
          <motion.p
            className="m-0 mt-4 text-[13px]"
            style={{
              color: COLOR.faint,
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.95,
            }}
          >
            Free for teams up to 10. No card needed.
          </motion.p>
        </div>
      </Section>
      <section id="product" className="scroll-mt-16">
        <div
          className={`${CONTAINER} px-3 sm:px-8`}
          style={{
            borderLeft: `1px solid ${COLOR.line}`,
            borderRight: `1px solid ${COLOR.line}`,
          }}
        >
          <div
            ref={stageRef}
            className="relative overflow-hidden rounded-[22px] sm:rounded-[28px]"
            style={{
              perspective: 1600,
            }}
          >
            <Sky tone="dusk" />
            <div
              ref={fitRef}
              className="relative px-3 pb-8 pt-10 sm:px-12 sm:pb-16 sm:pt-20"
            >
              <motion.div
                style={{
                  rotateX: tilt,
                  scale: scale,
                  y: lift,
                  transformOrigin: "50% 0%",
                  height: stageScale * 597,
                }}
                className="mx-auto w-full"
              >
                <div
                  style={{
                    width: 1040,
                    transform: `scale(${stageScale})`,
                    transformOrigin: "0 0",
                    margin: stageScale < 1 ? undefined : "0 auto",
                    marginLeft: fit < 0.6 ? stageScale * -250 : undefined,
                  }}
                >
                  <AppMock />
                </div>
              </motion.div>
            </div>
          </div>
          <p
            className="m-0 pb-2 pt-3 text-center text-[13px]"
            style={{
              color: COLOR.faint,
            }}
          >
            That’s the real thing, give or take. Switch views, tick a task, or
            drag the onboarding bar and watch its dependants follow.
          </p>
        </div>
      </section>
    </Fragment>
  );
}
