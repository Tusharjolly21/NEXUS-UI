"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONTAINER, DARK } from "./theme";
import { AnimatedNumber, Button, Icon, Reveal } from "./ui";

const PLANS = [
  {
    n: "Hobby",
    d: "For side projects and trying models.",
    m: 0,
    a: 0,
    unit: "No card needed",
    aunit: "No card needed",
    free: "Free",
    lead: "Includes:",
    f: [
      ["ph:currency-dollar", "$5 in credits each month"],
      ["ph:hard-drives", "Serverless endpoints"],
      ["ph:timer", "60 requests a minute"],
      ["ph:chat-teardrop-text", "Community forum"],
    ],
    cta: "Start for free",
  },
  {
    n: "Pro",
    d: "For teams shipping their first AI features.",
    m: 39,
    a: 31,
    unit: "per workspace a month",
    aunit: "per workspace a month, billed yearly",
    lead: "Everything in Hobby, plus:",
    f: [
      ["ph:currency-dollar", "$25 in credits each month"],
      ["ph:stack", "Every catalog model"],
      ["ph:timer", "600 requests a minute"],
      ["ph:faders", "LoRA fine-tuning"],
      ["ph:globe", "All 8 regions"],
    ],
    cta: "Start a 14-day trial",
  },
  {
    n: "Dedicated",
    d: "For steady traffic that needs fixed capacity.",
    m: 2.4,
    a: 1.92,
    unit: "per H200 hour",
    aunit: "per H200 hour, 12-month term",
    lead: "Everything in Pro, plus:",
    f: [
      ["ph:cpu", "Reserved H100 and H200 GPUs"],
      ["ph:infinity", "No rate limits"],
      ["ph:sliders-horizontal", "Autoscaling floors and caps"],
      ["ph:lock-simple", "Private model weights"],
      ["ph:headset", "Priority support"],
    ],
    cta: "Reserve GPUs",
    hot: true,
    extra: "$500 in credits",
  },
  {
    n: "Enterprise",
    d: "For large teams with security reviews.",
    m: null,
    a: null,
    unit: "Volume pricing",
    aunit: "Volume pricing",
    free: "Custom",
    lead: "Everything in Dedicated, plus:",
    f: [
      ["ph:shield-check", "Private regions and VPC peering"],
      ["ph:key", "SSO and audit logs"],
      ["ph:heartbeat", "99.99% uptime SLA"],
      ["ph:user", "A named support engineer"],
      ["ph:receipt", "Invoicing and custom terms"],
    ],
    cta: "Talk to sales",
  },
];

const PLAN_ROWS: [group: string, rows: [label: string, values: string[]][]][] = [
  [
    "Usage",
    [
      ["Monthly credits", ["$5", "$25", "$500", "Custom"]],
      ["Requests a minute", ["60", "600", "No limit", "No limit"]],
      ["Concurrent requests", ["5", "50", "500", "Custom"]],
      ["Batch API", ["–", "y", "y", "y"]],
    ],
  ],
  [
    "Models",
    [
      ["Catalog models", ["Top 10", "All", "All", "All"]],
      ["LoRA fine-tuning", ["–", "y", "y", "y"]],
      ["Upload your own weights", ["–", "–", "y", "y"]],
      ["Pinned versions", ["–", "y", "y", "y"]],
    ],
  ],
  [
    "Infrastructure",
    [
      ["Regions", ["3", "8", "8", "8 + private"]],
      ["Reserved GPUs", ["–", "–", "y", "y"]],
      ["Cold start", ["< 10 s", "< 2 s", "None", "None"]],
      ["VPC peering", ["–", "–", "–", "y"]],
    ],
  ],
  [
    "Support",
    [
      ["Channel", ["Forum", "Email", "Slack", "Named engineer"]],
      ["Response time", ["–", "1 day", "4 h", "1 h"]],
      ["Uptime SLA", ["–", "–", "99.9%", "99.99%"]],
    ],
  ],
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section id="pricing" className={`${CONTAINER} pb-32 pt-8`}>
      <Reveal>
        <h2
          className="text-center text-[clamp(40px,6vw,60px)] font-[500] tracking-[-0.04em]"
          style={{
            color: DARK.ink,
          }}
        >
          Pricing
        </h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p
          className="mx-auto mt-3 max-w-[440px] text-center text-[16px] leading-[1.55]"
          style={{
            color: DARK.text,
          }}
        >
          Start free, pay for the tokens you serve, and reserve GPUs once your traffic is steady.
        </p>
      </Reveal>
      <div className="mt-8 flex justify-center">
        <div
          className="flex rounded-full p-1"
          style={{
            background: DARK.card,
            boxShadow: `inset 0 0 0 1px ${DARK.line2}`,
          }}
          role="group"
          aria-label="Billing period"
        >
          {[false, true].map((yearly) => (
            <button
              key={String(yearly)}
              type="button"
              aria-pressed={annual === yearly}
              onClick={() => setAnnual(yearly)}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13.5px]"
              style={{
                color: annual === yearly ? DARK.ink : DARK.soft,
              }}
            >
              {annual === yearly && (
                <motion.span
                  layoutId="op-bill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: DARK.raise,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 38,
                  }}
                />
              )}
              <span className="relative">{yearly ? "Annual" : "Monthly"}</span>
              {yearly && (
                <span
                  className="relative rounded-full px-1.5 text-[10.5px]"
                  style={{
                    background: "rgba(63,224,197,.14)",
                    color: DARK.teal,
                  }}
                >
                  Save 20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div
        className="mt-10 grid gap-2 rounded-[22px] p-2 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          background: "#0D0D10",
          boxShadow: `0 0 0 1px ${DARK.line}, 0 40px 80px -40px rgba(0,0,0,.9)`,
        }}
      >
        {PLANS.map((plan, i) => {
          const price = plan.m === null || plan.m === 0 ? null : annual ? plan.a : plan.m;
          return (
            <Reveal key={plan.n} delay={i * 0.06} className="flex">
              <div
                className="flex flex-1 flex-col rounded-[16px] p-2"
                style={{
                  background: plan.hot ? "#17171C" : "transparent",
                }}
              >
                <div
                  className="rounded-[12px] p-4"
                  style={{
                    background: plan.hot ? "#202027" : DARK.card,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px ${DARK.line}`,
                  }}
                >
                  <p
                    className="flex items-center justify-between text-[15px] font-[500]"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {plan.n}
                    <AnimatePresence>
                      {annual && price !== null && (
                        <motion.span
                          initial={{
                            opacity: 0,
                            scale: 0.8,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.8,
                          }}
                          className="rounded-md px-1.5 py-0.5 text-[10.5px]"
                          style={{
                            background: "rgba(63,224,197,.14)",
                            color: DARK.teal,
                          }}
                        >
                          Save 20%
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </p>
                  <p
                    className="mt-1 min-h-[40px] text-[13px] leading-[1.45]"
                    style={{
                      color: DARK.text,
                    }}
                  >
                    {plan.d}
                  </p>
                  <p
                    className="mt-5 text-[34px] font-[500] leading-none tracking-[-0.035em]"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {price === null ? (
                      plan.free
                    ) : (
                      <AnimatedNumber value={price} decimals={plan.n === "Dedicated" ? 2 : 0} prefix="$" />
                    )}
                  </p>
                  <p
                    className="mt-2 min-h-[18px] text-[12.5px]"
                    style={{
                      color: DARK.soft,
                    }}
                  >
                    {annual ? plan.aunit : plan.unit}
                  </p>
                </div>
                <div className="flex flex-1 flex-col px-2 pb-1 pt-5">
                  <p
                    className="text-[13px]"
                    style={{
                      color: DARK.text,
                    }}
                  >
                    {plan.lead}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {plan.f.map(([included, feature]) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-[13.5px]"
                        style={{
                          color: DARK.ink,
                        }}
                      >
                        <Icon
                          name={included}
                          size={14}
                          style={{
                            color: DARK.soft,
                          }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.extra && (
                    <p
                      className="mt-4 flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px]"
                      style={{
                        background: "rgba(255,255,255,.04)",
                        color: DARK.ink,
                      }}
                    >
                      {plan.extra}
                      <span
                        className="rounded px-1.5 text-[10.5px]"
                        style={{
                          background: "rgba(106,169,255,.14)",
                          color: DARK.sky,
                        }}
                      >
                        Included
                      </span>
                    </p>
                  )}
                  <div className="mt-auto pt-7">
                    <Button kind={plan.hot ? "light" : "dark"} href="#cta" className="w-full !rounded-xl">
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <div
        className="op-noscroll -mx-5 mt-14 overflow-x-auto px-5 sm:mx-0 sm:px-0"
        onPointerLeave={() => setHovered(null)}
      >
        <table className="w-full min-w-[760px] border-collapse text-left text-[13.5px]">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: DARK.line,
              }}
            >
              <th
                className="w-[30%] px-3 py-4 font-[400]"
                style={{
                  color: DARK.text,
                }}
              >
                Features
              </th>
              {PLANS.map((plan, i) => (
                <th
                  key={plan.n}
                  onPointerEnter={() => setHovered(i)}
                  className="px-3 py-4 font-[500] transition-colors"
                  style={{
                    color: DARK.ink,
                    background: plan.hot
                      ? "rgba(255,255,255,.035)"
                      : hovered === i
                        ? "rgba(255,255,255,.02)"
                        : "transparent",
                  }}
                >
                  {plan.n}
                  <span
                    className="block text-[11.5px] font-[400]"
                    style={{
                      color: DARK.soft,
                    }}
                  >
                    {plan.m === null
                      ? "Custom"
                      : plan.m === 0
                        ? "Free"
                        : plan.n === "Dedicated"
                          ? `$${(annual ? plan.a : plan.m).toFixed(2)} per H200 hour`
                          : `$${annual ? plan.a : plan.m} a month`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {PLAN_ROWS.map(([group, rows]) => (
            <tbody key={group}>
              <tr>
                <td
                  colSpan={5}
                  className="px-3 pb-2 pt-7 text-[12.5px] font-[500]"
                  style={{
                    color: DARK.teal,
                  }}
                >
                  {group}
                </td>
              </tr>
              {rows.map(([label, values]) => (
                <tr
                  key={label}
                  className="group border-t"
                  style={{
                    borderColor: DARK.line,
                  }}
                >
                  <td
                    className="px-3 py-3 transition-colors group-hover:text-white"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {label}
                  </td>
                  {values.map((value, i) => (
                    <td
                      key={i}
                      onPointerEnter={() => setHovered(i)}
                      className="px-3 py-3 transition-colors"
                      style={{
                        color: DARK.text,
                        background: PLANS[i].hot
                          ? "rgba(255,255,255,.035)"
                          : hovered === i
                            ? "rgba(255,255,255,.02)"
                            : "transparent",
                      }}
                    >
                      {value === "y" ? (
                        <span
                          style={{
                            color: DARK.teal,
                          }}
                          aria-label="Included"
                        >
                          <Icon name="ph:check" size={15} />
                        </span>
                      ) : value === "–" ? (
                        <span
                          style={{
                            color: DARK.faint,
                          }}
                          aria-label="Not included"
                        >
                          –
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
