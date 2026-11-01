// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonLink, Frame, Icon, SectionHeading } from "./ui";

export const FAQS = [
  [
    "What does Ferry cost?",
    "A monthly price for your plan, from $0, and a flat fee on conversions: 0.6%, 0.4% or 0.25% depending on the plan. Payouts in the same currency are free. There is no setup fee and no minimum.",
  ],
  [
    "Is our money safe with Ferry?",
    "Ferry keeps client money apart from its own, in safeguarded accounts at partner banks. If Ferry ever failed, that money would be returned to you and could not be used to pay Ferry's debts.",
  ],
  [
    "What is the mid-market rate?",
    "It is the midpoint between what buyers and sellers pay for a currency, the rate you see in financial news. Ferry converts at that rate and shows its fee on a separate line.",
  ],
  [
    "Which currencies can we hold?",
    "34 currencies. You get local account details in nine of them: USD, EUR, GBP, JPY, SGD, AUD, CAD, HKD and NZD.",
  ],
  [
    "How fast are payouts?",
    "Most land in minutes because Ferry pays out over each country's own instant network, such as SEPA Instant, Faster Payments, Pix and IMPS. Where no instant rail exists, payouts arrive the same day.",
  ],
  [
    "How long does it take to open an account?",
    "Most companies are approved the same day. Have your company registration number and your directors' names ready, and the application takes about ten minutes.",
  ],
];

export function Faq() {
  const [e, t] = useState(0),
    n = useId();
  return (
    <section id="faq" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        label="FAQ"
        title="Treasury questions, answered."
        sub="Pricing, safety, rates and payouts. The questions your CFO and your engineering lead will ask first."
      />
      <Frame className="mx-auto mt-12 max-w-[760px]">
        <ul className="m-0 list-none overflow-hidden rounded-[22px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.82)] p-0">
          {FAQS.map(([r, i], s) => {
            const o = e === s;
            return (
              <li key={r} className="border-b border-solid border-[rgb(var(--ferry-line)/.07)] last:border-0">
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={o}
                    aria-controls={`${n}-${s}`}
                    onClick={() => t(o ? -1 : s)}
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[16px] font-medium tracking-[-0.01em] text-[rgb(var(--ferry-ink))] sm:px-6"
                  >
                    {r}
                    <motion.span
                      animate={{
                        rotate: o ? 180 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solid transition-colors ${o ? "border-[rgb(var(--ferry-accent)/.4)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]" : "border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-mute))]"}`}
                    >
                      <Icon name="chevron_down" size={10} />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={!1}>
                  {o && (
                    <motion.div
                      id={`${n}-${s}`}
                      role="region"
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
                        type: "spring",
                        stiffness: 380,
                        damping: 36,
                        opacity: {
                          duration: 0.2,
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 max-w-[36em] px-5 pb-6 text-[14px] leading-[1.65] text-[rgb(var(--ferry-mute))] sm:px-6">
                        {i}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Frame>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="#open" kind="ghost" arrow={!0}>
          Talk to us
        </ButtonLink>
      </div>
    </section>
  );
}
