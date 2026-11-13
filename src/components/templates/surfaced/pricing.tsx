"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ASSISTANTS, AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, FONT_MONO } from "./theme";
import { Button, Icon, Reveal, SectionHeading } from "./ui";

const PLANS = [
  {
    n: "Starter",
    d: "For one brand finding its first mentions.",
    m: 45,
    y: 36,
    eng: 4,
    inc: "Starter includes",
    f: [
      ["100", " questions tracked"],
      ["1", " brand"],
      ["", "Checks every morning"],
      ["90 days", " of answer history"],
      ["", "Visibility score and trends"],
      ["", "Email alerts when you drop"],
    ],
  },
  {
    n: "Growth",
    d: "For teams that want to win the answers they lose.",
    m: 129,
    y: 103,
    eng: 5,
    hot: true,
    inc: "Everything in Starter, plus",
    f: [
      ["500", " questions tracked"],
      ["3", " brands"],
      ["25", " page drafts a month"],
      ["", "Competitor share of voice"],
      ["", "Publish to Webflow and WordPress"],
      ["", "Slack alerts"],
      ["1 year", " of answer history"],
    ],
  },
  {
    n: "Agency",
    d: "For agencies running AI visibility for clients.",
    m: 349,
    y: 279,
    eng: 5,
    inc: "Everything in Growth, plus",
    f: [
      ["2,000", " questions tracked"],
      ["15", " brands"],
      ["Unlimited", " page drafts"],
      ["", "Client reports in your brand"],
      ["", "API access"],
      ["", "Priority support"],
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className={`${CONTAINER} scroll-mt-24 pb-32`}>
      <SectionHeading
        tag="Pricing"
        title="Plans that grow with your questions"
        sub="Every plan checks each morning. Try any plan free for 14 days, no card needed."
      />
      <Reveal delay={0.15} className="mt-8 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="flex rounded-full p-1"
          style={{
            background: "rgba(255,255,255,.04)",
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          {(
            [
              ["Monthly", false],
              ["Yearly", true],
            ] as [string, boolean][]
          ).map(([label, value]) => (
            <button
              key={label}
              role="radio"
              aria-checked={yearly === value}
              onClick={() => setYearly(value)}
              className="relative h-8 rounded-full px-4 text-[13px] font-[500]"
              style={{
                color: yearly === value ? COLORS.ink : COLORS.text,
              }}
            >
              {yearly === value && (
                <motion.span
                  layoutId="bill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 36,
                  }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {label}
                {value && (
                  <span
                    className="text-[11px] font-[600]"
                    style={{
                      color: "#8FA3FF",
                    }}
                  >
                    −20%
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </Reveal>
      <div className="mt-10 grid items-start gap-3 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = yearly ? plan.y : plan.m;
          return (
            <Reveal key={plan.n} delay={i * 0.06} className={plan.hot ? "md:-mt-3" : ""}>
              <div
                className="rounded-[24px] p-1.5"
                style={{
                  background: plan.hot ? "#1A1A1D" : COLORS.card,
                  boxShadow: plan.hot
                    ? "inset 0 0 0 1px rgba(255,255,255,.12), 0 40px 70px -40px rgba(0,0,0,.9)"
                    : `inset 0 0 0 1px ${COLORS.line}`,
                }}
              >
                <div
                  className="rounded-[18px] p-5"
                  style={{
                    background: plan.hot ? "#222226" : "#18181B",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), inset 0 0 0 1px rgba(255,255,255,.05)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[15px] font-[600]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {plan.n}
                    </p>
                    {plan.hot && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10.5px] font-[500]"
                        style={{
                          background: "rgba(255,255,255,.08)",
                          color: "#D4D4D8",
                        }}
                      >
                        Most teams pick this
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1.5 text-[13px] leading-[1.5]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    {plan.d}
                  </p>
                </div>
                <div className="px-5 pt-5">
                  <div className="flex h-[44px] items-end gap-1 overflow-hidden">
                    <span
                      className="text-[38px] font-[600] leading-none tracking-[-0.05em]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      $
                    </span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={price}
                        initial={{
                          y: 30,
                          opacity: 0,
                          filter: "blur(4px)",
                        }}
                        animate={{
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          y: -30,
                          opacity: 0,
                          filter: "blur(4px)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="text-[38px] font-[600] leading-none tabular-nums tracking-[-0.05em]"
                        style={{
                          color: COLORS.ink,
                        }}
                      >
                        {price}
                      </motion.span>
                    </AnimatePresence>
                    <span
                      className="mb-1 text-[13px]"
                      style={{
                        color: COLORS.soft,
                      }}
                    >
                      / month
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[12px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {yearly
                      ? `Billed $${(price * 12).toLocaleString("en-US")} a year`
                      : "Billed monthly, cancel any time"}
                  </p>
                  <div className="mt-4 flex items-center gap-1">
                    {Object.keys(ASSISTANTS)
                      .slice(0, plan.eng)
                      .map((feature) => (
                        <AssistantIcon key={feature} n={feature} size={20} />
                      ))}
                    <span
                      className="ml-1.5 text-[11.5px]"
                      style={{
                        color: COLORS.soft,
                      }}
                    >
                      {plan.eng === 5 ? "All assistants" : "4 assistants"}
                    </span>
                  </div>
                  <div className="mt-5">
                    <Button kind={plan.hot ? "primary" : "dark"} href="#cta" className="w-full">
                      Start 14-day trial
                    </Button>
                  </div>
                </div>
                <div
                  className="mx-5 mt-6 h-px"
                  style={{
                    background: COLORS.line,
                  }}
                />
                <p
                  className="px-5 pt-5 text-[10.5px] uppercase tracking-[0.12em]"
                  style={{
                    color: COLORS.soft,
                    fontFamily: FONT_MONO,
                  }}
                >
                  {plan.inc}
                </p>
                <ul className="space-y-2.5 px-5 pb-6 pt-3">
                  {plan.f.map(([icon, text]) => (
                    <li
                      key={icon + text}
                      className="flex items-center gap-2.5 text-[13px]"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      <Icon
                        name="ph:check-circle-fill"
                        size={15}
                        style={{
                          color: "#D4D4D8",
                        }}
                      />
                      <span>
                        {icon && (
                          <b
                            className="font-[600]"
                            style={{
                              color: COLORS.ink,
                            }}
                          >
                            {icon}
                          </b>
                        )}
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
