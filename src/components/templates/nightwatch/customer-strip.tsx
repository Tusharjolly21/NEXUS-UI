"use client";

import { motion } from "framer-motion";
import { COLORS, CONTAINER, EASE, FONT_MONO } from "./theme";
import { Icon, Reveal } from "./ui";

const CUSTOMER_LOGOS = [
  {
    n: "quillfeather",
    icon: "ph:leaf",
    st: {
      fontWeight: 560,
      letterSpacing: "-0.03em",
    },
  },
  {
    n: "OXMOOR",
    icon: "ph:mountains",
    st: {
      fontWeight: 700,
      letterSpacing: "0.2em",
      fontSize: 13,
    },
  },
  {
    n: "Vantelle",
    st: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontStyle: "italic",
      fontSize: 21,
      letterSpacing: "-0.01em",
    },
  },
  {
    n: "tidepool",
    icon: "ph:waves",
    st: {
      fontWeight: 650,
      letterSpacing: "-0.04em",
      fontSize: 18,
    },
  },
  {
    n: "Corvane",
    icon: "ph:triangle",
    st: {
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
  },
  {
    n: "PELLUCID",
    icon: "ph:diamond",
    st: {
      fontFamily: FONT_MONO,
      fontWeight: 500,
      letterSpacing: "0.08em",
      fontSize: 13,
    },
  },
  {
    n: "brindle&co",
    st: {
      fontWeight: 700,
      letterSpacing: "-0.05em",
      fontSize: 19,
    },
  },
  {
    n: "Sablewood",
    icon: "ph:star-four",
    st: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
    },
  },
  {
    n: "ardentrail",
    icon: "ph:infinity",
    st: {
      fontWeight: 450,
      letterSpacing: "-0.02em",
      fontSize: 18,
    },
  },
  {
    n: "HALDEN",
    icon: "ph:hexagon",
    st: {
      fontWeight: 600,
      letterSpacing: "0.12em",
      fontSize: 14,
    },
  },
  {
    n: "spiralworks",
    icon: "ph:spiral",
    st: {
      fontWeight: 600,
      letterSpacing: "-0.03em",
    },
  },
  {
    n: "Moth & Lantern",
    st: {
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
      fontSize: 17,
    },
  },
];

export function CustomerStrip() {
  return (
    <section aria-label="Teams using Nightwatch" className={`${CONTAINER} py-20 sm:py-24`}>
      <Reveal>
        <p
          className="text-center text-[16px] font-[560]"
          style={{
            color: COLORS.ink,
          }}
        >
          The quiet rotation behind 2,400 engineering teams
        </p>
        <p
          className="mt-1 text-center text-[15px]"
          style={{
            color: COLORS.soft,
          }}
        >
          From four-person startups to banks spread across eleven time zones.
        </p>
      </Reveal>
      <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
        {CUSTOMER_LOGOS.map((customerLogo, i) => (
          <motion.li
            key={customerLogo.n}
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              y: 8,
            }}
            whileInView={{
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-5%",
            }}
            transition={{
              duration: 0.9,
              delay: Math.floor(i / 6) * 0.35 + (i % 6) * 0.07,
              ease: EASE,
            }}
            className="flex items-center justify-center"
          >
            <span
              className="flex items-center gap-1.5 text-[16px] text-[#C3CAE0] opacity-60 transition-opacity duration-300 hover:opacity-100"
              style={customerLogo.st}
            >
              {customerLogo.icon && <Icon name={customerLogo.icon} size={18} />}
              {customerLogo.n}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
