"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { COLOR, EASE, FONT_DISPLAY, SPRING } from "./theme";
import { Button, Eyebrow, Headline, Icon, Reveal, Section } from "./ui";
/** A number that rolls up out of view and the new one in whenever it changes. */
export function RollingNumber({ value }: { value: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          initial={{
            y: "60%",
            opacity: 0,
            filter: "blur(4px)",
          }}
          animate={{
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{
            y: "-60%",
            opacity: 0,
            filter: "blur(4px)",
          }}
          transition={{
            duration: 0.35,
            ease: EASE,
          }}
          key={value}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
/** A plan: name, description, price per member per month (-1 for custom), button, pop marks the highlighted one, features. */
type Plan = {
  n: string;
  d: string;
  p: number;
  cta: string;
  pop?: boolean;
  f: string[];
};

/** Pricing with a monthly/yearly switch and a team-size slider that totals each plan. */
export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(14);
  const plans: Plan[] = [
    {
      n: "Free",
      d: "For small teams getting organised.",
      p: 0,
      cta: "Start for free",
      f: [
        "Up to 10 members",
        "Unlimited requests",
        "One roadmap and timeline",
        "Weekly update drafts",
        "Community support",
      ],
    },
    {
      n: "Team",
      d: "For product teams that ship every week.",
      p: yearly ? 8 : 10,
      cta: "Start a free trial",
      pop: true,
      f: [
        "Everything in Free",
        "Unlimited roadmaps and timelines",
        "Dependencies and date shifting",
        "Free guest access",
        "Help desk and chat intake",
      ],
    },
    {
      n: "Business",
      d: "For companies running many teams at once.",
      p: yearly ? 15 : 18,
      cta: "Start a free trial",
      f: [
        "Everything in Team",
        "Single sign-on (SAML)",
        "Portfolio view across teams",
        "Advanced permissions",
        "Priority support",
      ],
    },
    {
      n: "Enterprise",
      d: "For large organisations with security reviews.",
      p: -1,
      cta: "Talk to sales",
      f: [
        "Everything in Business",
        "Audit log and data residency",
        "A dedicated success manager",
        "Custom contract and invoicing",
        "99.9% uptime SLA",
      ],
    },
  ];
  return (
    <Section id="pricing" inner="px-5 py-20 sm:px-16 sm:py-28">
      <Eyebrow center={true}>Pricing</Eyebrow>
      <div className="mx-auto mt-4 max-w-[760px]">
        <Headline
          center={true}
          lead="Free for small teams."
          rest="Simple per-member pricing when you grow."
        />
      </div>
      <div className="mx-auto mt-10 flex max-w-[720px] flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <LayoutGroup id="bill">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="flex rounded-[10px] p-1"
            style={{
              background: COLOR.panel,
            }}
          >
            {(
              [
                ["Monthly", false],
                ["Yearly", true],
              ] as const
            ).map(([label, isYearly]) => (
              <button
                type="button"
                role="radio"
                aria-checked={yearly === isYearly}
                onClick={() => setYearly(isYearly)}
                className="pl-ring relative rounded-[8px] px-4 py-1.5 text-[13.5px] outline-none"
                style={{
                  color: COLOR.ink,
                }}
                key={label}
              >
                {yearly === isYearly && (
                  <motion.span
                    layoutId="bill-pill"
                    className="absolute inset-0 rounded-[8px] bg-white"
                    style={{
                      boxShadow: "0 1px 3px rgba(14,17,22,.12)",
                    }}
                    transition={SPRING}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {label}
                  {isYearly && (
                    <span
                      className="rounded-full px-1.5 text-[11px] font-medium"
                      style={{
                        background: COLOR.accentSoft,
                        color: COLOR.accent,
                      }}
                    >
                      Save 20%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <label
          className="flex w-full max-w-[340px] items-center gap-3 text-[13.5px]"
          style={{
            color: COLOR.text,
          }}
        >
          <span className="shrink-0">Team size</span>
          <input
            type="range"
            min={1}
            max={100}
            value={seats}
            onChange={(i) => setSeats(Number(i.target.value))}
            className="pl-ring h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{
              background: `linear-gradient(90deg, ${COLOR.accent} ${seats}%, ${COLOR.panel2} ${seats}%)`,
              accentColor: COLOR.accent,
            }}
            aria-valuetext={`${seats} members`}
          />
          <span
            className="w-[86px] shrink-0 text-right font-medium tabular-nums"
            style={{
              color: COLOR.ink,
            }}
          >
            {seats} member{seats === 1 ? "" : "s"}
          </span>
        </label>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const total = plan.p > 0 ? plan.p * seats : 0;
          const fits = plan.n !== "Free" || seats <= 10;
          return (
            <Reveal delay={index * 0.06} className="h-full" key={plan.n}>
              <div
                className="relative h-full rounded-[18px] p-[1.5px]"
                style={{
                  background: plan.pop
                    ? `conic-gradient(from 180deg at 50% 50%, ${COLOR.accent}, #9DB2FF, #D7C2FF, ${COLOR.accent})`
                    : COLOR.line2,
                }}
              >
                <div className="flex h-full flex-col rounded-[16.5px] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[18px] font-medium tracking-[-0.02em]"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      {plan.n}
                    </span>
                    {plan.pop && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11.5px] font-medium text-white"
                        style={{
                          background: COLOR.accent,
                        }}
                      >
                        Most popular
                      </span>
                    )}
                  </div>
                  <p
                    className="m-0 mt-2 min-h-[44px] text-[14px] leading-[1.45]"
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    {plan.d}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span
                      className="text-[44px] font-medium leading-none tracking-[-0.045em] tabular-nums"
                      style={{
                        color: COLOR.ink,
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      {plan.p < 0 ? (
                        "Custom"
                      ) : (
                        <Fragment>
                          $<RollingNumber value={String(plan.p)} />
                        </Fragment>
                      )}
                    </span>
                    <span
                      className="text-[12.5px] leading-tight"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {plan.p < 0 ? (
                        ""
                      ) : plan.p === 0 ? (
                        "free forever"
                      ) : (
                        <Fragment>
                          per member
                          <br />
                          per month
                        </Fragment>
                      )}
                    </span>
                  </div>
                  <p
                    className="m-0 mt-2 min-h-[20px] text-[12.5px]"
                    style={{
                      color: fits ? COLOR.faint : COLOR.red,
                    }}
                  >
                    {plan.p < 0 ? (
                      "Annual contract"
                    ) : plan.p === 0 ? (
                      fits ? (
                        `Covers your ${seats}-person team`
                      ) : (
                        "Over 10 members, see Team"
                      )
                    ) : (
                      <Fragment>
                        $<RollingNumber value={total.toLocaleString()} /> a
                        month for {seats}
                        {yearly ? ", billed yearly" : ""}
                      </Fragment>
                    )}
                  </p>
                  <div className="mt-5">
                    <Button
                      dark={plan.pop}
                      className="w-full justify-center"
                      href="#contact"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                  <ul
                    className="m-0 mt-6 grid list-none gap-2.5 p-0 pt-5"
                    style={{
                      borderTop: `1px solid ${COLOR.line}`,
                    }}
                  >
                    {plan.f.map((item) => (
                      <li
                        className="flex items-start gap-2 text-[13.5px]"
                        style={{
                          color: COLOR.ink,
                        }}
                        key={item}
                      >
                        <span
                          className="mt-0.5"
                          style={{
                            color: COLOR.accent,
                          }}
                        >
                          <Icon name="ph:check" size={13} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
