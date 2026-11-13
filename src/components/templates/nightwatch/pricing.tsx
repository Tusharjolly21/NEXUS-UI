"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, CONTAINER, DAWN, DAWN_GRADIENT } from "./theme";
import { Button, Icon, Reveal, SectionHeading } from "./ui";

const PLANS = [
  {
    n: "Hobby",
    d: "Side projects and tiny teams",
    m: 0,
    y: 0,
    unit: "free forever",
    cta: "Start free",
    feats: ["Up to 5 responders", "2 rotations", "Alert grouping", "One status page", "Push and email pages"],
    extra: [],
  },
  {
    n: "Team",
    d: "Teams that share a pager",
    m: 19,
    y: 15,
    unit: "per responder / month",
    cta: "Start a 14-day trial",
    feats: [
      "Unlimited rotations",
      "Runbook automation",
      "Postmortem drafts",
      "Phone, watch and chat paging",
      "60 integrations",
    ],
    extra: ["Follow-the-sun schedules", "Roll back from chat", "Customer status pages"],
    hot: true,
  },
  {
    n: "Scale",
    d: "Many teams, many regions",
    m: 39,
    y: 32,
    unit: "per responder / month",
    cta: "Talk to us",
    feats: ["Everything in Team", "SSO and SCIM", "Data residency", "Audit log export", "Named support engineer"],
    extra: ["Run the model in your cloud", "99.99% uptime SLA", "Security review on request"],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className={`${CONTAINER} scroll-mt-24 pb-24 sm:pb-32`}>
      <SectionHeading
        center={true}
        title="Priced per person on call"
        sub="Not per alert, not per incident. Pay for the people Nightwatch lets sleep."
      />
      <Reveal delay={0.2} className="mt-8 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="relative flex rounded-full p-1"
          style={{
            background: "rgba(255,255,255,.05)",
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
              className="nw-ring relative z-10 flex h-9 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-[560]"
              style={{
                color: yearly === value ? "#1C0F09" : COLORS.text,
              }}
            >
              {yearly === value && (
                <motion.span
                  layoutId="bill"
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    background: DAWN_GRADIENT,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 36,
                  }}
                />
              )}
              {label}
              {value && (
                <span
                  className="rounded-full px-1.5 text-[10.5px]"
                  style={{
                    background: yearly ? "rgba(28,15,9,.15)" : `${DAWN[1]}22`,
                    color: yearly ? "#1C0F09" : DAWN[2],
                  }}
                >
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-0">
        {PLANS.map((plan, i) => {
          const price = yearly ? plan.y : plan.m;
          return (
            <Reveal key={plan.n} delay={i * 0.08} className="relative">
              {plan.hot && (
                <div aria-hidden={true} className="pointer-events-none absolute -inset-y-6 -inset-x-0 hidden md:block">
                  {["top-6", "bottom-6"].map((corner) => (
                    <span
                      key={corner}
                      className={`absolute -left-8 -right-8 ${corner} h-px`}
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${COLORS.line2} 50%, transparent 50%)`,
                        backgroundSize: "6px 1px",
                      }}
                    />
                  ))}
                  {["left-0", "right-0"].map((side) => (
                    <span
                      key={side}
                      className={`absolute -bottom-2 -top-2 ${side} w-px`}
                      style={{
                        backgroundImage: `linear-gradient(${COLORS.line2} 50%, transparent 50%)`,
                        backgroundSize: "1px 6px",
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                className={`relative h-full rounded-[22px] p-6 sm:p-7 md:rounded-none ${plan.hot ? "md:-my-px" : ""}`}
                style={{
                  background: plan.hot ? "linear-gradient(180deg,#121A38,#0E152C)" : "transparent",
                  boxShadow: plan.hot ? `inset 0 0 0 1px ${COLORS.line2}` : `inset 0 0 0 1px ${COLORS.line}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-[17px] font-[600]"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {plan.n}
                  </p>
                  {plan.hot && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11.5px] font-[650] text-[#1C0F09]"
                      style={{
                        background: DAWN_GRADIENT,
                      }}
                    >
                      Most teams
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-[13.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {plan.d}
                </p>
                <div className="mt-6 flex h-[52px] items-end gap-1 overflow-hidden">
                  <span
                    className="text-[44px] font-[560] leading-none tracking-[-0.04em]"
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
                        y: 40,
                        opacity: 0,
                      }}
                      animate={{
                        y: 0,
                        opacity: 1,
                      }}
                      exit={{
                        y: -40,
                        opacity: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="text-[44px] font-[560] leading-none tabular-nums tracking-[-0.04em]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {price}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p
                  className="mt-1 text-[13px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {plan.unit}
                  {plan.m > 0 && yearly ? ", billed yearly" : ""}
                </p>
                <div className="mt-6">
                  <Button kind={plan.hot ? "dawn" : "glass"} className="w-full" href="#faq">
                    {plan.cta}
                  </Button>
                </div>
                <ul className="mt-7 space-y-3">
                  {plan.feats.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-[14px]"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      <Icon
                        name="ph:check"
                        size={14}
                        style={{
                          color: COLORS.soft,
                        }}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                {plan.extra.length > 0 && (
                  <>
                    <div
                      className="relative my-5 h-px"
                      style={{
                        background: COLORS.line,
                      }}
                    >
                      <span
                        className="absolute left-1/2 top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                        style={{
                          background: COLORS.deep,
                          boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                          color: COLORS.text,
                        }}
                      >
                        <Icon name="ph:plus" size={10} />
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {plan.extra.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2.5 text-[14px]"
                          style={{
                            color: COLORS.ink,
                          }}
                        >
                          <Icon
                            name="ph:check-circle-fill"
                            size={15}
                            style={{
                              color: DAWN[1],
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
