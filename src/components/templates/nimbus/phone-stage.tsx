"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "./hooks";
import { PhoneFrame } from "./phone";
import { HomeScreen } from "./screens/home-screen";
import { RadarScreen } from "./screens/radar-screen";
import { TenDayScreen } from "./screens/ten-day-screen";
import { MUTED } from "./theme";
import { Reveal, SectionTitle } from "./ui";

/**
 * "One app. Every sky." Three phones start stacked on top of each other and fan out as the section scrolls
 * into view: the forecast phone rises into the middle while the week and the radar slide out to the sides
 * and tilt away. Scroll progress runs through a spring so the motion has weight.
 */
export function PhoneStage() {
  const ref = useRef<HTMLElement>(null);
  const wide = useMediaQuery("(min-width: 768px)", true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const spread = useSpring(useTransform(scrollYProgress, [0.15, 1], [0, 1]), { stiffness: 90, damping: 22 });

  const distance = wide ? 300 : 120;
  const leftX = useTransform(spread, [0, 1], [0, -distance]);
  const rightX = useTransform(spread, [0, 1], [0, distance]);
  const leftTilt = useTransform(spread, [0, 1], [0, -8]);
  const rightTilt = useTransform(spread, [0, 1], [0, 8]);
  const sideScale = useTransform(spread, [0, 1], [0.86, 0.9]);
  const centerY = useTransform(spread, [0, 1], [60, 0]);

  return (
    <section ref={ref} className="overflow-clip px-5 pb-20 pt-10 sm:pb-44" style={{ background: "#fff" }}>
      <div className="mx-auto max-w-[1024px] text-center">
        <Reveal>
          <SectionTitle>One app. Every sky.</SectionTitle>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto m-0 mt-5 max-w-[560px] text-[21px] leading-[1.4]" style={{ color: MUTED }}>
            Your forecast, the week ahead and the live radar, each one swipe apart.
          </p>
        </Reveal>
      </div>
      <div className="relative mx-auto mt-16 flex h-[490px] max-w-[1100px] items-start justify-center sm:h-[720px]">
        <motion.div className="absolute top-[40px] w-[200px] sm:w-[300px]" style={{ x: leftX, rotate: leftTilt, scale: sideScale, zIndex: 1 }}>
          <PhoneFrame finish="silver" light={false}>
            <TenDayScreen />
          </PhoneFrame>
        </motion.div>
        <motion.div className="absolute top-[40px] w-[200px] sm:w-[300px]" style={{ x: rightX, rotate: rightTilt, scale: sideScale, zIndex: 1 }}>
          <PhoneFrame finish="orange">
            <RadarScreen />
          </PhoneFrame>
        </motion.div>
        <motion.div className="relative w-[220px] sm:w-[330px]" style={{ y: centerY, zIndex: 2 }}>
          <PhoneFrame finish="blue">
            <HomeScreen condition="night" />
          </PhoneFrame>
        </motion.div>
      </div>
    </section>
  );
}
