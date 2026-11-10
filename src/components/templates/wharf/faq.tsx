"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQS } from "./data";
import { COLOR, CONTAINER, EASE, SPRING } from "./theme";
import { Icon, SectionTitle, TextLink } from "./ui";
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pb-24 sm:pb-32">
      <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[.8fr_1.2fr]`}>
        <div>
          <SectionTitle title="Questions," rest="answered." />
          <div className="mt-5">
            <TextLink>Talk to an engineer</TextLink>
          </div>
        </div>
        <ul
          className="m-0 list-none p-0"
          style={{
            borderTop: `1px solid ${COLOR.line}`,
          }}
        >
          {FAQS.map(([question, answer], index) => {
            const s = open === index;
            return (
              <li
                style={{
                  borderBottom: `1px solid ${COLOR.line}`,
                }}
                key={question}
              >
                <button
                  type="button"
                  onClick={() => setOpen(s ? null : index)}
                  aria-expanded={s}
                  className="wf-ring flex w-full items-center justify-between gap-4 rounded py-5 text-left text-[18px] tracking-[-0.015em] outline-none"
                  style={{
                    color: s ? COLOR.ink : COLOR.text,
                  }}
                >
                  {question}
                  <motion.span
                    animate={{
                      rotate: s ? 180 : 0,
                    }}
                    transition={SPRING}
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    <Icon name="ph:caret-down" size={15} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {s && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
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
      </div>
    </section>
  );
}
