"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQS } from "./data";
import { COLOR, EASE, SPRING } from "./theme";
import { Button, Eyebrow, Headline, Icon, Section } from "./ui";
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section inner="grid gap-10 px-5 py-20 sm:px-16 sm:py-28 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <Eyebrow>Questions</Eyebrow>
        <div className="mt-4">
          <Headline lead="Answers before you ask." />
        </div>
        <p
          className="m-0 mt-5 max-w-[320px] text-[15px] leading-[1.55]"
          style={{
            color: COLOR.soft,
          }}
        >
          Can’t find what you need? Our team replies within one working day.
        </p>
        <div className="mt-6">
          <Button href="#contact">Contact us</Button>
        </div>
      </div>
      <ul
        className="m-0 list-none p-0"
        style={{
          borderTop: `1px solid ${COLOR.line}`,
        }}
      >
        {FAQS.map(([question, answer], index) => {
          const isOpen = open === index;
          return (
            <li
              style={{
                borderBottom: `1px solid ${COLOR.line}`,
              }}
              key={question}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="pl-ring flex w-full items-center justify-between gap-4 rounded py-5 text-left text-[18px] tracking-[-0.015em] outline-none sm:text-[20px]"
                style={{
                  color: COLOR.ink,
                }}
              >
                {question}
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                  }}
                  transition={SPRING}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                    color: COLOR.ink,
                  }}
                >
                  <Icon name="ph:plus" size={13} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: EASE,
                    }}
                    className="overflow-hidden"
                  >
                    <p
                      className="m-0 max-w-[620px] pb-5 text-[15px] leading-[1.6]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
