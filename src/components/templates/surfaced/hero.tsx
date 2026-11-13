"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { Dashboard } from "./dashboard";
import { COLORS, CONTAINER, EASE } from "./theme";
import { Button, Icon } from "./ui";

const INLINE_ICON_CLASS = "relative mx-[0.14em] inline-block size-[0.78em] align-[-0.07em]";

const popIn = (delay: number) => ({
  initial: {
    opacity: 0,
    scale: 0.4,
    rotate: -8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  transition: {
    type: "spring" as const,
    stiffness: 380,
    damping: 18,
    delay,
  },
});

function InlineAssistant({ n: name, delay }: { n: string; delay: number }) {
  return (
    <motion.span {...popIn(delay)} className={INLINE_ICON_CLASS}>
      <span className="absolute inset-0">
        <AssistantIcon n={name} fluid={true} ring={true} />
      </span>
    </motion.span>
  );
}

function Blink() {
  const reduce = useReducedMotion();
  const blink = reduce
    ? {}
    : {
        animate: {
          scaleY: [1, 1, 0.12, 1],
        },
        transition: {
          duration: 4.2,
          times: [0, 0.9, 0.94, 1],
          repeat: Infinity,
          delay: 2.2,
          ease: "easeInOut" as const,
        },
      };
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative size-[84%]"
      fill="none"
      aria-hidden={true}
      style={{
        filter: "drop-shadow(0 0 0.06em rgba(150,175,255,.85))",
      }}
    >
      <motion.g
        {...blink}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        <rect x="7.4" y="7.2" width="2.7" height="4.6" rx="1.35" fill="#fff" />
        <rect x="13.9" y="7.2" width="2.7" height="4.6" rx="1.35" fill="#fff" />
      </motion.g>
      <motion.path
        d="M6.6 14.1c1.3 2.35 3.15 3.55 5.4 3.55s4.1-1.2 5.4-3.55"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{
          pathLength: reduce ? 1 : 0,
        }}
        animate={{
          pathLength: 1,
        }}
        transition={{
          duration: 0.6,
          delay: 1.35,
          ease: EASE,
        }}
      />
    </svg>
  );
}

function SmileMark() {
  return (
    <motion.span role="img" aria-label="Surfaced, smiling" {...popIn(1.05)} className={`${INLINE_ICON_CLASS} isolate`}>
      <span
        aria-hidden={true}
        className="absolute -inset-[35%] -z-10 rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(75,107,251,.5), rgba(75,107,251,0))",
          filter: "blur(6px)",
        }}
      />
      <span
        aria-hidden={true}
        className="absolute inset-0 overflow-hidden p-[0.025em]"
        style={{
          borderRadius: "28%",
          boxShadow: "0 10px 24px -10px rgba(40,64,200,.9), 0 2px 4px rgba(0,0,0,.5)",
        }}
      >
        <span
          className="sf-orbit absolute left-1/2 top-1/2 size-[200%] -ml-[100%] -mt-[100%]"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,255,255,.1) 0deg, rgba(196,208,255,1) 40deg, rgba(255,255,255,.1) 100deg, rgba(255,255,255,.1) 200deg, rgba(110,138,255,.85) 250deg, rgba(255,255,255,.1) 310deg)",
          }}
        />
        <span
          className="relative grid size-full place-items-center overflow-hidden"
          style={{
            borderRadius: "26%",
            background: "radial-gradient(130% 100% at 28% 0%, #4462F0 0%, #1E2B7A 52%, #0D1238 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.32), inset 0 -8px 14px -6px rgba(0,0,0,.55)",
          }}
        >
          <span
            className="absolute inset-x-[10%] top-[5%] h-[44%]"
            style={{
              borderRadius: "40% 40% 45% 45% / 60% 60% 40% 40%",
              background: "linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,0))",
            }}
          />
          <Blink />
        </span>
      </span>
    </motion.span>
  );
}

function HeadlineLine({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <motion.span
      className="inline sm:block"
      initial={{
        opacity: 0,
        filter: "blur(12px)",
        y: 14,
      }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
      }}
      transition={{
        duration: 0.9,
        delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.span>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pt-36">
      <div className={`${CONTAINER} text-center`}>
        <h1
          className="mx-auto max-w-[820px] text-[clamp(32px,5.4vw,62px)] font-[600] leading-[1.12] tracking-[-0.045em]"
          style={{
            color: COLORS.ink,
          }}
        >
          <HeadlineLine delay={0}>
            {"When buyers ask "}
            <InlineAssistant n="Gemini" delay={0.75} />
            {" Gemini, "}
          </HeadlineLine>
          <HeadlineLine delay={0.14}>
            <InlineAssistant n="ChatGPT" delay={0.85} />
            {" ChatGPT or "}
            <InlineAssistant n="Claude" delay={0.95} />
            {" Claude, "}
          </HeadlineLine>
          <HeadlineLine delay={0.28}>
            {"make sure they hear "}
            <SmileMark />
            {" you"}
          </HeadlineLine>
        </h1>
        <motion.p
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.55,
            ease: EASE,
          }}
          className="mx-auto mt-6 max-w-[430px] text-[15.5px] leading-[1.6]"
          style={{
            color: COLORS.text,
          }}
        >
          Surfaced asks AI assistants the questions your buyers ask, every morning, and shows you which pages to change
          so your name comes up.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.7,
            ease: EASE,
          }}
          className="mt-7 flex flex-wrap justify-center gap-2.5"
        >
          <Button kind="primary" href="#cta">
            Start free
          </Button>
          <Button kind="dark" icon="ph:arrow-right" href="#how">
            Run a sample check
          </Button>
        </motion.div>
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 70,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1.1,
          delay: 0.9,
          ease: EASE,
        }}
        className="mx-auto mt-14 max-w-[1000px] px-3 sm:px-6"
      >
        <Dashboard />
      </motion.div>
    </section>
  );
}

const CUSTOMER_LOGOS = [
  {
    n: "brightlane",
    icon: "ph:triangle",
    st: {
      fontWeight: 650,
      letterSpacing: "-0.04em",
    },
  },
  {
    n: "Fennick",
    st: {
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
      fontSize: 20,
    },
  },
  {
    n: "ROWAN&CO",
    st: {
      fontWeight: 800,
      letterSpacing: "0.14em",
      fontSize: 13,
    },
  },
  {
    n: "Tandem Health",
    icon: "ph:circle-half",
    st: {
      fontWeight: 600,
    },
  },
  {
    n: "quillr",
    icon: "ph:leaf",
    st: {
      fontWeight: 700,
      letterSpacing: "-0.05em",
      fontSize: 20,
    },
  },
  {
    n: "Northbound",
    icon: "ph:mountains",
    st: {
      fontWeight: 500,
      letterSpacing: "-0.01em",
    },
  },
];

export function CustomerStrip() {
  return (
    <section aria-label="Teams using Surfaced" className={`${CONTAINER} pb-28 pt-6`}>
      <p
        className="text-center text-[12.5px]"
        style={{
          color: COLORS.soft,
        }}
      >
        Used every morning by teams at
      </p>
      <ul className="mt-6 grid grid-cols-3 items-center gap-y-6 sm:grid-cols-6">
        {CUSTOMER_LOGOS.map((customerLogo, i) => (
          <motion.li
            key={customerLogo.n}
            initial={{
              opacity: 0,
              filter: "blur(6px)",
            }}
            whileInView={{
              opacity: 1,
              filter: "blur(0px)",
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: i * 0.07,
              duration: 0.7,
            }}
            className="flex justify-center"
          >
            <span
              className="flex items-center gap-1.5 text-[17px] text-[#8E8E96] transition-colors duration-300 hover:text-white"
              style={customerLogo.st}
            >
              {customerLogo.icon && <Icon name={customerLogo.icon} size={16} />}
              {customerLogo.n}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
