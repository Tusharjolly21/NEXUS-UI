"use client";

import { useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { PhoneFrame } from "./phone";
import { AirQualityScreen } from "./screens/air-screen";
import { AlertScreen } from "./screens/alert-screen";
import { RainScreen } from "./screens/rain-screen";
import { TenDayScreen } from "./screens/ten-day-screen";
import { EASE, FAINT, INK, MUTED, SPRING, SURFACE } from "./theme";
import { SectionTitle } from "./ui";

type Feature = { title: string; text: string; Screen: ComponentType };

const FEATURES: readonly Feature[] = [
  { title: "Rain, to the minute.", text: "A next-hour chart for exactly where you're standing, updated every five minutes.", Screen: RainScreen },
  { title: "Ten days, at a glance.", text: "Highs, lows and the shape of the week in one honest list.", Screen: TenDayScreen },
  { title: "Air you can read.", text: "Air quality and pollen in plain words, so you know if it's a day for a run.", Screen: AirQualityScreen },
  { title: "Alerts before it hits.", text: "Storms, ice and heat warnings for your places, with time to do something about it.", Screen: AlertScreen },
];

/** The lock-screen alert is the only dark screen, so only it needs white status bar icons and a black backing. */
const DARK_SCREEN = 3;

/**
 * A pinned feature tour. The section is four screens tall and the phone sticks to the viewport while you scroll
 * through it; scroll progress picks which feature is active, and clicking a title scrolls to its slice.
 */
export function Features() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (progress) => setActive(Math.min(FEATURES.length - 1, Math.floor(progress * FEATURES.length))));

  const scrollToFeature = (index: number) => {
    const section = ref.current;
    if (!section) return;
    window.scrollTo({
      top: section.offsetTop + ((index + 0.5) * (section.offsetHeight - window.innerHeight)) / FEATURES.length,
      behavior: "smooth",
    });
  };

  const { Screen } = FEATURES[active];
  return (
    <section id="features" ref={ref} className="relative scroll-mt-12 px-5" style={{ height: `${FEATURES.length * 95}vh`, background: SURFACE }}>
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="mx-auto grid w-full max-w-[1024px] items-center gap-10 md:grid-cols-[1fr_auto] md:gap-20">
          <div className="order-2 md:order-1">
            <SectionTitle style={{ fontSize: "clamp(32px, 4.4vw, 52px)" }}>
              Everything the
              <br className="hidden md:block" /> sky is planning.
            </SectionTitle>
            {/* On wide screens: the full list, with the active item expanded. */}
            <ol className="m-0 mt-8 hidden p-0 md:block [@media(max-height:560px)]:hidden!">
              {FEATURES.map((feature, i) => (
                <li key={feature.title} className="list-none border-t py-4" style={{ borderColor: "rgba(0,0,0,.1)" }}>
                  <button type="button" onClick={() => scrollToFeature(i)} className="nb-ring w-full rounded text-left outline-none">
                    <div className="text-[21px] font-semibold tracking-[-0.02em] transition-colors duration-300" style={{ color: i === active ? INK : FAINT }}>
                      {feature.title}
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: i === active ? "auto" : 0, opacity: i === active ? 1 : 0 }}
                      transition={{ height: SPRING, opacity: { duration: 0.3 } }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 pt-2 text-[17px] leading-[1.45]" style={{ color: MUTED }}>
                        {feature.text}
                      </p>
                    </motion.div>
                  </button>
                </li>
              ))}
            </ol>
            {/* On phones and short screens: only the active feature. */}
            <div className="mt-4 md:hidden [@media(max-height:560px)]:block!">
              <div className="text-[21px] font-semibold tracking-[-0.02em]">{FEATURES[active].title}</div>
              <p className="m-0 mt-1 text-[16px] leading-[1.45]" style={{ color: MUTED }}>
                {FEATURES[active].text}
              </p>
            </div>
          </div>
          <div className="order-1 mx-auto md:order-2">
            <PhoneFrame
              finish="silver"
              light={active === DARK_SCREEN}
              className="w-[min(270px,calc((100svh-250px)*0.489))] md:w-[min(320px,calc((100svh-110px)*0.489))]"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  style={{ background: active === DARK_SCREEN ? "#000" : "#fff" }}
                  initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                  transition={{ duration: 0.55, ease: EASE, filter: { duration: 0.4 } }}
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
