"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SpectrumField } from "./spectrum";
import { COLORS, CONTAINER, EASE } from "./theme";
import { Button, Icon, LogoMark, TypedText, useOpenDownload } from "./ui";

const HERO_REST = [0.5, 0.6];

const HERO_HUSH = [0.5, 0.5, 0.3, 0.26];

export function Hero() {
  const [typed, setTyped] = useState(false);
  const openDownload = useOpenDownload();
  const fadeIn = (delay: number) => ({
    initial: {
      opacity: 0,
      y: 10,
      filter: "blur(6px)",
    },
    animate: typed
      ? {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }
      : {},
    transition: {
      duration: 0.9,
      delay,
      ease: EASE,
    },
  });
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-24 pt-36">
      <SpectrumField
        on={typed}
        className="absolute inset-0 -z-10"
        track="parent"
        rest={HERO_REST}
        hush={HERO_HUSH}
        reach={0.4}
        mask="radial-gradient(ellipse 72% 70% at 50% 52%, #000 38%, transparent 82%)"
      />
      <div className={`${CONTAINER} relative text-center`}>
        <motion.a
          href="#surfaces"
          {...fadeIn(0)}
          className="ud-ring group mx-auto inline-flex items-center gap-2.5 rounded-full border bg-white/80 py-1.5 pl-1.5 pr-3.5 text-[13px] backdrop-blur"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#121317] px-2.5 py-1 text-[11.5px] font-[560] text-white">
            <LogoMark size={13} mono="#fff" />
            Updraft
          </span>
          <span
            style={{
              color: COLORS.text,
            }}
          >
            Now running on Draft 2
          </span>
          <Icon name="ph:arrow-right" size={12} className="transition-transform group-hover:translate-x-0.5" />
        </motion.a>
        <TypedText
          as="h1"
          text={`Hand off the work.
Keep the craft.`}
          delay={0.35}
          cps={30}
          keepCaret={true}
          onDone={() => setTyped(true)}
          className="mx-auto mt-7 max-w-[15ch] text-[clamp(38px,8vw,108px)] font-[470] leading-[0.98] tracking-[-0.045em]"
        />
        <motion.p
          {...fadeIn(0.12)}
          className="mx-auto mt-7 max-w-[600px] text-[clamp(16px,1.35vw,18.5px)] leading-[1.55]"
          style={{
            color: COLORS.text,
          }}
        >
          Updraft is an agent workspace for software teams. It plans the change, writes it, runs the tests and brings
          you a diff worth merging.
        </motion.p>
        <motion.div {...fadeIn(0.22)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button kind="dark" size="lg" icon="ph:download-simple" onClick={openDownload}>
            Download for macOS
          </Button>
          <Button kind="light" size="lg" href="#surfaces">
            See how it works
          </Button>
        </motion.div>
        <motion.p
          {...fadeIn(0.32)}
          className="mt-5 text-[13px]"
          style={{
            color: COLORS.faint,
          }}
        >
          {"Free while in preview. Also on "}
          <button
            onClick={openDownload}
            className="ud-ring underline decoration-[#D5D7DC] underline-offset-[3px] transition-colors hover:text-[#121317] hover:decoration-current"
          >
            Windows and Linux
          </button>
          .
        </motion.p>
      </div>
    </section>
  );
}
