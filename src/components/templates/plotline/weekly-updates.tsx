"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { COLOR, CONTAINER, EASE } from "./theme";
import {
  Eyebrow,
  Headline,
  Icon,
  MockCard,
  Reveal,
  Sky,
  type IconName,
} from "./ui";

/** [icon, label, count, reacted] */
type Reaction = [
  icon: IconName,
  label: string,
  count: number,
  reacted: boolean,
];
/** New in 3.0: what the weekly update draws on, and the sent update as a chat message you can react to. */
export function WeeklyUpdates() {
  const [counts, setCounts] = useState<Reaction[]>([
    ["ph:check-circle-fill", "Done", 6, false],
    ["ph:rocket-launch", "Shipped", 3, false],
    ["ph:lightning", "Fast", 2, false],
  ]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.4,
  });
  const lines: [status: string, text: string, color: string][] = [
    [
      "Shipped",
      "Guest comments are live for every customer (14 requests closed).",
      COLOR.accent,
    ],
    [
      "On track",
      "New onboarding flow is 68% done, still due Nov 21.",
      COLOR.ink,
    ],
    [
      "Needs help",
      "Billing v2 is waiting on a tax rounding decision from Finance.",
      COLOR.red,
    ],
  ];
  return (
    <section
      style={{
        borderTop: `1px solid ${COLOR.line}`,
      }}
    >
      <div
        className={`${CONTAINER} grid lg:grid-cols-2`}
        style={{
          borderLeft: `1px solid ${COLOR.line}`,
          borderRight: `1px solid ${COLOR.line}`,
        }}
      >
        <div className="px-5 py-20 sm:px-16 sm:py-24">
          <Eyebrow>New in 3.0</Eyebrow>
          <div className="mt-4">
            <Headline
              size="md"
              lead="Your Friday update, already written."
              rest="Plotline reads the week and drafts a short note for every project. You edit a line and press send."
            />
          </div>
          <ul className="m-0 mt-10 grid list-none gap-6 p-0">
            {(
              [
                [
                  "ph:sparkle",
                  "Drafted from real progress",
                  "Built from shipped work, moved dates and open blockers. Nothing is invented.",
                ],
                [
                  "ph:chat-circle",
                  "Sent where people read",
                  "Post to a chat channel, email a list, or both. Different teams, different days.",
                ],
                [
                  "ph:users",
                  "Written for the reader",
                  "Leadership gets the summary, the team gets the detail, customers get what they asked for.",
                ],
              ] as const
            ).map(([icon, title, body], index) => (
              <Reveal delay={index * 0.08} key={title}>
                <li className="flex gap-4">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px]"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                      color: COLOR.ink,
                    }}
                  >
                    <Icon name={icon} size={16} />
                  </span>
                  <span>
                    <span
                      className="block text-[15px] font-medium"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      {title}
                    </span>
                    <span
                      className="mt-1 block text-[15px] leading-[1.5]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {body}
                    </span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <div
          ref={ref}
          className="relative flex min-h-[520px] items-center justify-center overflow-hidden p-5 sm:p-12"
          style={{
            borderLeft: `1px solid ${COLOR.line}`,
          }}
        >
          <Sky tone="aurora" />
          <motion.div
            className="relative w-full max-w-[460px]"
            initial={{
              y: 40,
              opacity: 0,
              rotate: -2,
            }}
            animate={
              inView
                ? {
                    y: 0,
                    opacity: 1,
                    rotate: 0,
                  }
                : {}
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
          >
            <MockCard className="p-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-9 w-9 place-items-center rounded-[9px]"
                  style={{
                    background: COLOR.ink,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      d="M6 15.5 C9 15.5 9.5 8.5 13 8.5 S17 12 18.5 12"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-[13px] leading-tight">
                  <b
                    className="font-medium"
                    style={{
                      color: COLOR.ink,
                    }}
                  >
                    Plotline
                  </b>{" "}
                  <span
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    in #product
                  </span>
                  <br />
                  <span
                    style={{
                      color: COLOR.faint,
                    }}
                  >
                    Friday 9:00
                  </span>
                </span>
              </div>
              <h4
                className="m-0 mt-4 text-[18px] font-medium leading-snug tracking-[-0.02em]"
                style={{
                  color: COLOR.ink,
                }}
              >
                Week 39: onboarding on track, billing slips 3 days
              </h4>
              <div className="mt-3 grid gap-2.5">
                {lines.map(([status, text, color], index) => (
                  <motion.div
                    className="grid grid-cols-[96px_1fr] gap-2 text-[12.5px]"
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={
                      inView
                        ? {
                            opacity: 1,
                            x: 0,
                          }
                        : {}
                    }
                    transition={{
                      delay: 0.5 + index * 0.15,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    key={status}
                  >
                    <span
                      className="flex h-fit items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 font-medium"
                      style={{
                        background: COLOR.panel,
                        color: COLOR.ink,
                      }}
                    >
                      <i
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: color,
                        }}
                      />
                      {status}
                    </span>
                    <span
                      className="leading-[1.45]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex gap-1.5">
                {counts.map(([icon, label, count, reacted], index) => (
                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.88,
                    }}
                    onClick={() =>
                      setCounts((prev) =>
                        prev.map((reaction, other): Reaction =>
                          other === index
                            ? [
                                reaction[0],
                                reaction[1],
                                reaction[2] + (reaction[3] ? -1 : 1),
                                !reaction[3],
                              ]
                            : reaction,
                        ),
                      )
                    }
                    aria-pressed={reacted}
                    aria-label={`React ${label}`}
                    className="pl-ring flex items-center gap-1 rounded-full px-2 py-1 text-[12px] tabular-nums outline-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${reacted ? COLOR.accent : COLOR.line2}`,
                      background: reacted ? COLOR.accentSoft : "#fff",
                      color: reacted ? COLOR.accent : COLOR.text,
                    }}
                    key={label}
                  >
                    <Icon name={icon} size={13} />
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        initial={{
                          y: 6,
                          opacity: 0,
                        }}
                        animate={{
                          y: 0,
                          opacity: 1,
                        }}
                        exit={{
                          y: -6,
                          opacity: 0,
                        }}
                        key={count}
                      >
                        {count}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </MockCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
