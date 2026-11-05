"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { LayoutGroup, motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "./hooks";
import { AppIcon } from "./app-icon";
import { HeroWidgets } from "./hero-widgets";
import { Icon } from "./icons";
import { PHONE_FINISHES, PhoneFrame, type PhoneFinish } from "./phone";
import { HomeScreen } from "./screens/home-screen";
import { LiveSky } from "./sky/live-sky";
import { SkyBackdrop } from "./sky/sky-backdrop";
import { EASE, INK, SPRING } from "./theme";
import { PillButton, TextLink } from "./ui";
import { CONDITIONS, WEATHER, type Condition } from "./weather";

/** The sky changes by itself every 4.2 seconds while the hero is on screen, until the visitor picks one. */
const AUTO_CYCLE_MS = 4200;

/** The row of colour dots that restyles the phone. `layoutId` must differ between the two copies on the page. */
function FinishPicker({ finish, onChange, layoutId, className }: { finish: PhoneFinish; onChange: (finish: PhoneFinish) => void; layoutId: string; className: string }) {
  const current = PHONE_FINISHES.find((f) => f.id === finish)!;
  return (
    <div
      className={`${className} items-center gap-3 rounded-full px-3 py-2`}
      style={{
        background: "rgba(255,255,255,.12)",
        backdropFilter: "blur(12px) saturate(160%) brightness(.8)",
        WebkitBackdropFilter: "blur(12px) saturate(160%) brightness(.8)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 0 0 .5px rgba(255,255,255,.35)",
      }}
      role="radiogroup"
      aria-label="iPhone finish"
    >
      {PHONE_FINISHES.map(({ id, label, swatch }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={finish === id}
          aria-label={label}
          onClick={() => onChange(id)}
          className="nb-ring relative grid h-6 w-6 place-items-center rounded-full outline-none"
        >
          {finish === id && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 2px #fff" }} transition={SPRING} />}
          <span
            className="h-[18px] w-[18px] rounded-full"
            style={{ background: `radial-gradient(circle at 35% 30%, #ffffff66, ${swatch} 55%)`, boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.25)" }}
          />
        </button>
      ))}
      <span className="whitespace-nowrap pr-1 text-[13px] font-medium">{current.label}</span>
    </div>
  );
}

/** The segmented control that sets the weather of the hero sky and the phone. */
function WeatherSwitcher({ condition, onPick }: { condition: Condition; onPick: (condition: Condition) => void }) {
  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        role="radiogroup"
        aria-label="Try the weather"
        className="mx-auto mt-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full p-1"
        style={{
          background: "rgba(255,255,255,.16)",
          backdropFilter: "blur(12px) saturate(160%)",
          WebkitBackdropFilter: "blur(12px) saturate(160%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 0 0 .5px rgba(255,255,255,.35)",
          scrollbarWidth: "none",
        }}
      >
        {CONDITIONS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={condition === c}
            onClick={() => onPick(c)}
            className="nb-ring relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium outline-none"
            style={{ color: condition === c ? INK : "#fff" }}
          >
            {condition === c && (
              <motion.span
                layoutId="nb-cond"
                className="absolute inset-0 rounded-full bg-white"
                transition={SPRING}
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}
              />
            )}
            <span className="relative">
              <Icon name={WEATHER[c].icon} size={15} style={{ color: condition === c && c === "sunny" ? "#ffb800" : undefined }} />
            </span>
            <span className="relative">{WEATHER[c].label}</span>
          </button>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

/**
 * The opening screen: a live sky filling the viewport, the headline, a weather switcher, and a phone that
 * shows the same sky. As you scroll, the phone drifts up and shrinks, the headline fades and the floating
 * cards slide away faster than the phone, which gives the layers depth.
 */
export function Hero({ sectionRef, inView }: { sectionRef: RefObject<HTMLElement | null>; inView: boolean }) {
  const reduced = useReducedMotion();
  const [condition, setCondition] = useState<Condition>("sunny");
  const [finish, setFinish] = useState<PhoneFinish>("blue");
  const pickedByVisitor = useRef(false);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => {
      if (!pickedByVisitor.current) setCondition((current) => CONDITIONS[(CONDITIONS.indexOf(current) + 1) % CONDITIONS.length]);
    }, AUTO_CYCLE_MS);
    return () => clearInterval(id);
  }, [inView, reduced]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const widgetsY = useTransform(scrollYProgress, [0, 1], [0, -320]);

  const pick = (next: Condition) => {
    pickedByVisitor.current = true;
    setCondition(next);
  };

  return (
    <section ref={sectionRef} className="relative min-h-[900px] overflow-clip text-white" style={{ height: "108svh" }}>
      <SkyBackdrop condition={condition} />
      <LiveSky mode={condition} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 42% at 50% 26%, rgba(8,16,32,.2), transparent 72%)" }}
      />

      <motion.div style={{ y: titleY, opacity: titleOpacity }} className="relative z-10 mx-auto max-w-[980px] px-5 pt-[78px] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}
          className="mx-auto mb-4 w-fit"
        >
          <AppIcon size={68} style={{ filter: "drop-shadow(0 18px 30px rgba(4,12,44,.45))" }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="m-0 text-[21px] font-semibold tracking-[-0.01em]"
        >
          Nimbus for iPhone
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.08 }}
          className="m-0 mt-1 font-semibold leading-[0.98] tracking-[-0.05em]"
          style={{ fontSize: "clamp(56px, 9.4vw, 128px)", textShadow: "0 2px 40px rgba(0,0,0,.14)" }}
        >
          The sky, exactly.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-6"
        >
          <PillButton light href="#pricing">
            Download free
          </PillButton>
          <TextLink light href="#radar">
            See the live radar
          </TextLink>
        </motion.div>
        <WeatherSwitcher condition={condition} onPick={pick} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mt-3 flex justify-center lg:hidden"
        >
          <FinishPicker finish={finish} onChange={setFinish} layoutId="nb-fin-m" className="flex" />
        </motion.div>
      </motion.div>

      <motion.div style={{ y: widgetsY }} className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] z-10 hidden lg:block">
        <HeroWidgets />
      </motion.div>

      <motion.div style={{ y: phoneY, scale: phoneScale }} className="relative z-10 mx-auto mt-10 w-[300px] sm:w-[380px]">
        <motion.div initial={{ opacity: 0, y: 120 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}>
          <PhoneFrame finish={finish}>
            <HomeScreen condition={condition} />
          </PhoneFrame>
        </motion.div>
      </motion.div>

      <div className="absolute left-[calc(50%+230px)] z-20 hidden lg:block" style={{ bottom: "calc(8svh + 28px)" }}>
        <FinishPicker finish={finish} onChange={setFinish} layoutId="nb-fin-d" className="flex" />
      </div>
    </section>
  );
}
