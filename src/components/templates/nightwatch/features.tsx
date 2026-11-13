"use client";

import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  COLORS,
  CONTAINER,
  DAWN,
  DAWN_DIAGONAL,
  DAWN_GRADIENT,
  EASE,
  FONT_MONO,
  FONT_SANS,
  seededRandom,
} from "./theme";
import { Avatar, GlowCard, Icon, Reveal, SectionHeading, useCycle, useLiveInView } from "./ui";

const ALERT_GROUP = [
  ["p95 > 800ms", "checkout-api"],
  ["5xx rate 4.1%", "checkout-api"],
  ["Error budget burn ×14", "checkout"],
  ["cpu 96%", "checkout-7"],
  ["Synthetic check failed", "/cart"],
  ["Queue lag 38s", "orders"],
  ["Pod restarts ×6", "checkout-3"],
  ["Apdex 0.61", "storefront"],
];

function TriageDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(8, 850, live);
  const step = live ? tick : 6;
  const count = Math.min(ALERT_GROUP.length, (step + 1) * 2);
  const grouped = step >= 5;
  return (
    <div ref={ref} className="relative mt-6 h-[340px]">
      {ALERT_GROUP.slice(0, count).map(([alert, service], i) => (
        <motion.div
          key={alert}
          initial={{
            opacity: 0,
            x: 24,
          }}
          animate={
            grouped
              ? {
                  opacity: Math.max(0, 0.5 - i * 0.07),
                  x: 0,
                  y: 150 + i * 3,
                  scale: 1 - i * 0.025,
                }
              : {
                  opacity: 1,
                  x: 0,
                  y: i * 40,
                  scale: 1,
                }
          }
          transition={{
            duration: grouped ? 0.6 : 0.4,
            delay: grouped ? i * 0.03 : 0,
            ease: EASE,
          }}
          className="absolute inset-x-0 top-0 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px]"
          style={{
            background: COLORS.raise,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            zIndex: 20 - i,
          }}
        >
          <Icon
            name="ph:bell-simple"
            size={13}
            style={{
              color: COLORS.bad,
            }}
          />
          <span
            className="flex-1 truncate"
            style={{
              color: COLORS.ink,
              fontFamily: FONT_MONO,
            }}
          >
            {alert}
          </span>
          <span
            className="truncate text-[11px]"
            style={{
              color: COLORS.soft,
            }}
          >
            {service}
          </span>
        </motion.div>
      ))}
      <AnimatePresence>
        {grouped && (
          <motion.div
            initial={{
              opacity: 0,
              y: 160,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 112,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            className="absolute inset-x-0 top-0 z-30 rounded-2xl p-4"
            style={{
              background: "#16203F",
              boxShadow: `inset 0 0 0 1px ${DAWN[1]}66, 0 24px 50px -20px rgba(255,107,90,.45)`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="rounded px-1.5 text-[10.5px] font-[650]"
                style={{
                  background: `${COLORS.bad}26`,
                  color: COLORS.bad,
                }}
              >
                S2
              </span>
              <span
                className="text-[11px]"
                style={{
                  color: COLORS.soft,
                  fontFamily: FONT_MONO,
                }}
              >
                INC-2041
              </span>
            </div>
            <p
              className="mt-2 text-[15px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Checkout is slow
            </p>
            <p
              className="mt-1 text-[12.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              47 alerts, 1 incident, 1 likely cause.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROSTER = [
  {
    c: "Tokyo",
    who: "Kemi Ade",
    a0: 0,
    a1: 120,
  },
  {
    c: "Berlin",
    who: "Ines Duarte",
    a0: 120,
    a1: 240,
  },
  {
    c: "New York",
    who: "Theo Ruiz",
    a0: 240,
    a1: 360,
  },
];

function PagingDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(4, 1400, live);
  const paged = !live || tick >= 2;
  /** an SVG arc on the clock face from `from` to `to` degrees */
  const arc = (from: number, to: number, radius: number) => {
    const point = (angle: number) => [
      100 + radius * Math.cos(((angle - 90) * Math.PI) / 180),
      100 + radius * Math.sin(((angle - 90) * Math.PI) / 180),
    ];
    const [x1, y1] = point(from + 3);
    const [x2, y2] = point(to - 3);
    return `M${x1} ${y1} A${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <div ref={ref} className="relative mt-4 flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="h-[172px] w-[172px]" aria-hidden={true}>
        <circle cx="100" cy="100" r="78" fill="none" stroke={COLORS.line} strokeDasharray="1 5" />
        {ROSTER.map((person, i) => (
          <path
            key={person.c}
            d={arc(person.a0, person.a1, 66)}
            fill="none"
            stroke={i === 1 ? DAWN[1] : "rgba(150,170,255,.25)"}
            strokeWidth={i === 1 ? 5 : 3}
            strokeLinecap="round"
          />
        ))}
        <g
          className={live ? "nw-spin-slow" : ""}
          style={{
            transformOrigin: "100px 100px",
            transform: live ? undefined : "rotate(185deg)",
          }}
        >
          <line x1="100" y1="100" x2="100" y2="44" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="4" fill={COLORS.ink} />
        </g>
        {ROSTER.map((person) => {
          const mid = (((person.a0 + person.a1) / 2 - 90) * Math.PI) / 180;
          return (
            <text
              key={person.c}
              x={100 + 92 * Math.cos(mid)}
              y={100 + 92 * Math.sin(mid) + 3}
              textAnchor="middle"
              fontSize="9"
              fill={COLORS.soft}
              fontFamily={FONT_SANS}
            >
              {person.c}
            </text>
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-[54px] -translate-x-1/2">
        <Avatar name="Ines Duarte" size={56} ring={paged ? COLORS.ok : DAWN[1]} />
        {!paged && (
          <span
            className="nw-ping absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 0 2px ${DAWN[1]}`,
            }}
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={paged ? "a" : "p"}
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -6,
          }}
          transition={{
            duration: 0.3,
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
          style={{
            background: paged ? `${COLORS.ok}1A` : `${DAWN[1]}1F`,
            color: paged ? COLORS.ok : DAWN[2],
          }}
        >
          <Icon name={paged ? "ph:check" : "ph:bell-ringing"} size={13} />
          {paged ? "Ines acknowledged in 0:42" : "Paging Ines in Berlin, it's her afternoon"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const RUNBOOK_STEPS = [
  ["Check the last deploy", "nw deploys --svc checkout --last 1"],
  ["Compare error rates", "nw diff errors 8811..8812"],
  ["Roll back checkout", "nw rollback checkout --to 8811"],
  ["Confirm p95 recovered", "nw watch p95 --until <400ms"],
];

function RunbookDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(RUNBOOK_STEPS.length * 2 + 3, 650, live);
  const progress = live ? tick / 2 : RUNBOOK_STEPS.length;
  return (
    <div ref={ref} className="mt-5 space-y-2">
      {RUNBOOK_STEPS.map(([step, command], i) => {
        const state = progress >= i + 1 ? "done" : progress >= i + 0.5 ? "run" : "wait";
        return (
          <div
            key={step}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300"
            style={{
              background: state === "run" ? "rgba(255,142,94,.08)" : COLORS.raise,
              boxShadow: `inset 0 0 0 1px ${state === "run" ? `${DAWN[1]}55` : COLORS.line}`,
            }}
          >
            <span
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
              style={{
                background: state === "done" ? `${COLORS.ok}22` : "rgba(255,255,255,.05)",
                color: state === "done" ? COLORS.ok : state === "run" ? DAWN[1] : COLORS.faint,
              }}
            >
              {state === "done" ? (
                <Icon name="ph:check" size={11} />
              ) : state === "run" ? (
                <Icon name="ph:circle-notch" size={11} className="nw-spin" />
              ) : (
                <span className="text-[10px]">{i + 1}</span>
              )}
            </span>
            <span className="min-w-0">
              <span
                className="block text-[12.5px]"
                style={{
                  color: state === "wait" ? COLORS.soft : COLORS.ink,
                }}
              >
                {step}
              </span>
              <span
                className="block truncate text-[11px]"
                style={{
                  color: COLORS.faint,
                  fontFamily: FONT_MONO,
                }}
              >
                {command}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

const SERVICES = ["Storefront", "Checkout", "Payments", "Search"];

function ServiceMapDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(4, 1500, live);
  const step = live ? tick : 3;
  const statuses = [
    ["All systems normal", COLORS.ok],
    ["Investigating slow checkout", COLORS.bad],
    ["Fix deployed, monitoring", DAWN[2]],
    ["Resolved, 41s of impact", COLORS.ok],
  ][step];
  const bars = useMemo(() => {
    const random = seededRandom(8);
    return SERVICES.map(() =>
      Array.from(
        {
          length: 34,
        },
        () => (random() < 0.06 ? 1 : 0),
      ),
    );
  }, []);
  return (
    <div ref={ref} className="mt-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -4,
          }}
          transition={{
            duration: 0.25,
          }}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-[560]"
          style={{
            background: `${statuses[1]}14`,
            color: statuses[1],
            boxShadow: `inset 0 0 0 1px ${statuses[1]}33`,
          }}
        >
          <span
            className="size-2 rounded-full"
            style={{
              background: statuses[1],
            }}
          />
          {statuses[0]}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 space-y-2.5">
        {SERVICES.map((service, i) => (
          <div key={service}>
            <div className="mb-1 flex justify-between text-[11.5px]">
              <span
                style={{
                  color: COLORS.ink,
                }}
              >
                {service}
              </span>
              <span
                className="tabular-nums"
                style={{
                  color: COLORS.soft,
                }}
              >
                {i === 1 && step > 0 && step < 3 ? "degraded" : "99.98%"}
              </span>
            </div>
            <div className="flex gap-[2px]">
              {bars[i].map((healthy, j) => {
                const isLast = j === bars[i].length - 1;
                const ok = (i === 1 && isLast && step >= 1) || healthy;
                return (
                  <span
                    key={j}
                    className="h-5 flex-1 rounded-[2px] transition-colors duration-500"
                    style={{
                      background: ok
                        ? i === 1 && isLast && step === 2
                          ? DAWN[2]
                          : COLORS.bad
                        : "rgba(91,227,176,.55)",
                      opacity: ok ? 1 : 0.55 + (j / 34) * 0.45,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostmortemDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(6, 1e3, live);
  const step = live ? tick : 5;
  const actions = ["Add canary for checkout deploys", "Alert on error budget, not CPU", "Pin connection pool size"];
  return (
    <div
      ref={ref}
      className="mt-5 rounded-2xl p-4"
      style={{
        background: "#F3F1EC",
        color: "#1B1D26",
      }}
    >
      <p
        className="text-[10.5px]"
        style={{
          color: "#8A8C96",
          fontFamily: FONT_MONO,
        }}
      >
        INC-2041 · draft by Nightwatch
      </p>
      <p className="mt-1 text-[15px] font-[620] tracking-[-0.01em]">Checkout slowed for 41 seconds</p>
      <p
        className="mt-3 text-[11px] font-[650]"
        style={{
          color: "#8A8C96",
        }}
      >
        Root cause
      </p>
      <p className="relative mt-1 text-[12.5px] leading-[1.5]">
        Deploy #8812 halved the database pool, so checkout queued under normal load.
        <motion.span
          aria-hidden={true}
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{
            background: DAWN_GRADIENT,
          }}
          initial={false}
          animate={{
            width: step >= 1 ? "100%" : "0%",
          }}
          transition={{
            duration: 0.9,
            ease: EASE,
          }}
        />
      </p>
      <p
        className="mt-3 text-[11px] font-[650]"
        style={{
          color: "#8A8C96",
        }}
      >
        Action items
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {actions.map((action, i) => {
          const done = step >= i + 2;
          return (
            <li key={action} className="flex items-center gap-2 text-[12.5px]">
              <span
                className="grid size-4 place-items-center rounded-[5px] transition-colors duration-300"
                style={{
                  background: done ? "#1B1D26" : "transparent",
                  boxShadow: done ? "none" : "inset 0 0 0 1.5px #B9BBC4",
                  color: "#fff",
                }}
              >
                {done && <Icon name="ph:check" size={10} />}
              </span>
              <span
                style={{
                  color: done ? "#1B1D26" : "#6B6E79",
                }}
              >
                {action}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FeatureCard({
  title,
  body,
  children,
  className = "",
}: {
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlowCard as="article" className={`p-5 sm:p-6 ${className}`}>
      <h3
        className="relative text-[16px] font-[600] tracking-[-0.01em]"
        style={{
          color: COLORS.ink,
        }}
      >
        {title}
      </h3>
      <p
        className="relative mt-1.5 max-w-[340px] text-[14px] leading-[1.55]"
        style={{
          color: COLORS.text,
        }}
      >
        {body}
      </p>
      <div className="relative">{children}</div>
    </GlowCard>
  );
}

export function Features() {
  return (
    <section className={`${CONTAINER} pb-24 sm:pb-32`}>
      <SectionHeading
        title={`Everything the 3am version
of you would want`}
        sub="Nightwatch does the first twenty minutes of every incident, the part where you are half awake and reading graphs."
      />
      <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Reveal className="lg:row-span-2">
          <FeatureCard
            className="h-full"
            title="Forty alerts become one"
            body="Related alerts are grouped into a single incident with a plain-language summary and the most likely cause."
          >
            <TriageDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.08}>
          <FeatureCard
            className="h-full"
            title="Wakes the right person"
            body="Follow-the-sun rotations page whoever is awake and knows the service. Everyone else sleeps."
          >
            <PagingDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.16}>
          <FeatureCard
            className="h-full"
            title="Runbooks that run"
            body="Approved steps run on their own and stop to ask before anything risky."
          >
            <RunbookDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.08}>
          <FeatureCard
            className="h-full"
            title="A status page that keeps up"
            body="Customers see honest updates the moment something changes, written for humans."
          >
            <ServiceMapDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.16}>
          <FeatureCard
            className="h-full"
            title="The postmortem, drafted"
            body="Timeline, root cause and action items are waiting in your inbox by breakfast."
          >
            <PostmortemDemo />
          </FeatureCard>
        </Reveal>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {[
          [
            "ph:plugs-connected",
            "Works with your alerts",
            "Bring your metrics, logs and uptime checks. Sixty integrations, all two-way.",
          ],
          [
            "ph:fingerprint",
            "SSO and SCIM included",
            "Rotations follow your directory, so leavers stop getting paged on day one.",
          ],
          [
            "ph:chat-circle-text",
            "Lives in your chat",
            "Acknowledge, escalate and roll back without leaving the thread.",
          ],
        ].map(([icon, title, body], i) => (
          <Reveal key={title} delay={i * 0.08}>
            <GlowCard className="h-full p-5 sm:p-6">
              <span
                className="relative grid size-10 place-items-center rounded-xl bg-white/[.05] transition-colors duration-300 group-hover/spot:text-[#1C0F09]"
                style={{
                  color: COLORS.ink,
                }}
              >
                <span
                  aria-hidden={true}
                  className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
                  style={{
                    background: DAWN_DIAGONAL,
                  }}
                />
                <Icon name={icon} size={19} className="relative" />
              </span>
              <h3
                className="relative mt-4 text-[15.5px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {title}
              </h3>
              <p
                className="relative mt-1.5 text-[14px] leading-[1.55]"
                style={{
                  color: COLORS.text,
                }}
              >
                {body}
              </p>
            </GlowCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
