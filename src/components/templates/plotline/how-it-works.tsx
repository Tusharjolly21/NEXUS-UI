"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useScroll,
} from "framer-motion";
import { TaskList } from "./app-mock";
import { COLOR, CONTAINER, FONT_DISPLAY, SPRING } from "./theme";
import {
  Avatar,
  Eyebrow,
  Headline,
  Icon,
  MockCard,
  Reveal,
  Section,
  Stage,
  useCountUp,
  type Person,
} from "./ui";
/** Step 1, collect: a request inbox you can filter and upvote; the list re-sorts by votes. */
export function CollectStage() {
  const [votes, setVotes] = useState<Record<string, number>>({
    "Export a roadmap as a PDF": 14,
    "Guests can comment without an account": 9,
    "Show time zones next to each owner": 6,
    "Single sign-on for the Team plan": 11,
    "Recurring projects for monthly reports": 3,
  });
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"All" | "Customers" | "Team">("All");
  /** [where it came from, channel, status] */
  const requestInfo: Record<
    string,
    [origin: string, channel: string, status: string]
  > = {
    "Export a roadmap as a PDF": [
      "Asked by 14 customers, 3 duplicates merged",
      "Support",
      "Planned",
    ],
    "Guests can comment without an account": [
      "From Priya in #customer-success",
      "Chat",
      "Under review",
    ],
    "Show time zones next to each owner": [
      "Asked by Brightloom and 5 others",
      "Email",
      "Under review",
    ],
    "Single sign-on for the Team plan": [
      "Raised on 4 calls this month",
      "Sales call",
      "Planned",
    ],
    "Recurring projects for monthly reports": [
      "Asked by 3 customers",
      "Support",
      "New",
    ],
  };
  const visible = Object.keys(votes)
    .filter(
      (item) =>
        filter === "All" ||
        (filter === "Customers"
          ? requestInfo[item]![1] !== "Chat"
          : requestInfo[item]![1] === "Chat"),
    )
    .sort((a, b) => votes[b]! - votes[a]!);
  return (
    <MockCard>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[13px]"
        style={{
          borderBottom: `1px solid ${COLOR.line}`,
        }}
      >
        <span
          className="flex items-center gap-2 font-medium"
          style={{
            color: COLOR.ink,
          }}
        >
          <Icon name="ph:tray" size={15} />
          Requests
        </span>
        <LayoutGroup id="req">
          <div className="flex gap-1">
            {(
              [
                ["All", 48],
                ["Customers", 31],
                ["Team", 17],
              ] as const
            ).map(([tab, count]) => (
              <button
                type="button"
                onClick={() => setFilter(tab)}
                className="pl-ring relative rounded-full px-2.5 py-1 text-[12px] outline-none"
                style={{
                  color: filter === tab ? "#fff" : COLOR.text,
                  boxShadow:
                    filter === tab
                      ? undefined
                      : `inset 0 0 0 1px ${COLOR.line2}`,
                }}
                key={tab}
              >
                {filter === tab && (
                  <motion.span
                    layoutId="req-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: COLOR.ink,
                    }}
                    transition={SPRING}
                  />
                )}
                <span className="relative">
                  {tab} {count}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <motion.ul layout={true} className="m-0 list-none p-0">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.li
              layout={true}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={SPRING}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                borderBottom: `1px solid ${COLOR.line}`,
              }}
              key={item}
            >
              <motion.button
                type="button"
                whileTap={{
                  scale: 0.88,
                }}
                onClick={() => {
                  setVotes((prev) => ({
                    ...prev,
                    [item]: prev[item]! + (voted[item] ? -1 : 1),
                  }));
                  setVoted((prev) => ({
                    ...prev,
                    [item]: !prev[item],
                  }));
                }}
                aria-pressed={!!voted[item]}
                aria-label={`Upvote ${item}`}
                className="pl-ring flex w-10 shrink-0 flex-col items-center rounded-[8px] py-1 text-[12px] font-medium tabular-nums outline-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${voted[item] ? COLOR.accent : COLOR.line2}`,
                  color: voted[item] ? COLOR.accent : COLOR.ink,
                  background: voted[item] ? COLOR.accentSoft : "#fff",
                }}
              >
                <Icon name="ph:caret-up" size={11} />
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    initial={{
                      y: 8,
                      opacity: 0,
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                    }}
                    exit={{
                      y: -8,
                      opacity: 0,
                    }}
                    key={votes[item]}
                  >
                    {votes[item]}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-[13px] font-medium"
                  style={{
                    color: COLOR.ink,
                  }}
                >
                  {item}
                </span>
                <span
                  className="block truncate text-[12px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {requestInfo[item]![0]}
                </span>
              </span>
              <span
                className="hidden rounded-[6px] px-1.5 py-0.5 text-[11.5px] sm:inline"
                style={{
                  background: COLOR.panel,
                  color: COLOR.soft,
                }}
              >
                {requestInfo[item]![1]}
              </span>
              <span
                className="hidden w-[92px] items-center gap-1.5 text-[12px] sm:flex"
                style={{
                  color: COLOR.ink,
                }}
              >
                <i
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      requestInfo[item]![2] === "Planned"
                        ? COLOR.accent
                        : requestInfo[item]![2] === "New"
                          ? COLOR.ink
                          : "#C9CDD3",
                  }}
                />
                {requestInfo[item]![2]}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </MockCard>
  );
}
type Lane = "Now" | "Next" | "Later";

/** Step 2, prioritise: a Now / Next / Later board; clicking a card pulls it one column forward (Now wraps to Later). */
export function PrioritizeStage() {
  const [lanes, setLanes] = useState<Record<Lane, string[]>>({
    Now: ["New onboarding flow", "Billing migration"],
    Next: ["Help center refresh", "Guest comments"],
    Later: ["PDF roadmap export", "SSO for Team plan"],
  });
  /** [owner, due, percent done] */
  const cardInfo: Record<
    string,
    [owner: Person, due: string, percent: number]
  > = {
    "New onboarding flow": ["Maya Lind", "Nov 21", 68],
    "Billing migration": ["Theo Ruiz", "Nov 28", 41],
    "Help center refresh": ["Jonas Berg", "Dec 5", 8],
    "Guest comments": ["Priya Shah", "Dec 12", 0],
    "PDF roadmap export": ["Maya Lind", "Q1", 0],
    "SSO for Team plan": ["Theo Ruiz", "Q1", 0],
  };
  const laneOrder: Lane[] = ["Now", "Next", "Later"];
  const pullForward = (card: string, from: Lane) => {
    const to =
      laneOrder[
        (laneOrder.indexOf(from) + laneOrder.length - 1) % laneOrder.length
      ]!;
    setLanes((prev) => ({
      ...prev,
      [from]: prev[from].filter((item) => item !== card),
      [to]: [...prev[to], card],
    }));
  };
  return (
    <MockCard className="p-2">
      <LayoutGroup id="road">
        <div className="grid gap-2 sm:grid-cols-3">
          {laneOrder.map((lane) => (
            <div
              className="rounded-[10px] p-2"
              style={{
                background: COLOR.panel,
              }}
              key={lane}
            >
              <div
                className="flex items-center gap-1.5 px-1 pb-2 text-[12.5px] font-medium"
                style={{
                  color: COLOR.ink,
                }}
              >
                {lane}
                <span
                  style={{
                    color: COLOR.faint,
                  }}
                >
                  {lanes[lane].length}
                </span>
              </div>
              <div className="grid min-h-[60px] gap-2">
                {lanes[lane].map((item) => (
                  <motion.button
                    layoutId={`rd-${item}`}
                    type="button"
                    onClick={() => pullForward(item, lane)}
                    transition={SPRING}
                    whileHover={{
                      y: -2,
                    }}
                    className="pl-ring rounded-[9px] bg-white p-2.5 text-left outline-none"
                    style={{
                      boxShadow: `0 0 0 1px ${COLOR.line}`,
                    }}
                    aria-label={`${item}: move ${lane === "Now" ? "to Later" : "up a column"}`}
                    key={item}
                  >
                    <div
                      className="text-[12.5px] font-medium"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      {item}
                    </div>
                    <div
                      className="mt-1.5 flex items-center justify-between text-[11.5px]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Avatar name={cardInfo[item]![0]} size={16} />
                        {cardInfo[item]![0].split(" ")[0]}
                      </span>
                      {cardInfo[item]![1]}
                    </div>
                    <div
                      className="mt-1.5 h-1 overflow-hidden rounded-full"
                      style={{
                        background: COLOR.panel2,
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cardInfo[item]![2]}%`,
                          background: COLOR.accent,
                        }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LayoutGroup>
      <p
        className="m-0 px-2 pb-1 pt-2.5 text-[12px]"
        style={{
          color: COLOR.soft,
        }}
      >
        Click a card to pull it forward. Dates and owners travel with it.
      </p>
    </MockCard>
  );
}
/** Step 3, track: the task list, a blocker you can escalate, and a progress card that counts up. */
export function TrackStage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.5,
  });
  const done = useCountUp(41, inView);
  const [asked, setAsked] = useState(false);
  return (
    <div ref={ref} className="grid gap-3">
      <MockCard>
        <TaskList />
      </MockCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <MockCard className="p-4">
          <div
            className="flex items-center gap-2 text-[13px] font-medium"
            style={{
              color: COLOR.ink,
            }}
          >
            <span
              style={{
                color: COLOR.red,
              }}
            >
              <Icon name="ph:flag" size={14} />
            </span>
            Blocked for 2 days
          </div>
          <p
            className="m-0 mt-1.5 text-[12.5px] leading-[1.5]"
            style={{
              color: COLOR.soft,
            }}
          >
            Tax rounding needs a decision from Finance before Billing v2 can
            ship.
          </p>
          <motion.button
            type="button"
            onClick={() => setAsked(true)}
            layout={true}
            className="pl-ring mt-3 flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-white outline-none"
            style={{
              background: asked ? COLOR.green : COLOR.ink,
            }}
          >
            {asked ? (
              <Fragment>
                <Icon name="ph:check" size={12} />
                Asked in #finance
              </Fragment>
            ) : (
              "Ask Finance"
            )}
          </motion.button>
        </MockCard>
        <MockCard className="p-4">
          <div
            className="text-[13px] font-medium"
            style={{
              color: COLOR.ink,
            }}
          >
            Billing v2
          </div>
          <div
            className="mt-1 text-[44px] font-medium tabular-nums leading-none tracking-[-0.04em]"
            style={{
              color: COLOR.ink,
              fontFamily: FONT_DISPLAY,
            }}
          >
            {done}%
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full"
            style={{
              background: COLOR.panel2,
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: COLOR.accent,
              }}
              initial={{
                width: 0,
              }}
              animate={
                inView
                  ? {
                      width: "41%",
                    }
                  : {}
              }
              transition={{
                duration: 1.6,
                ease: [0.2, 1, 0.3, 1],
              }}
            />
          </div>
          <div
            className="mt-2 text-[12px]"
            style={{
              color: COLOR.soft,
            }}
          >
            12 of 29 tasks done, due Nov 28
          </div>
        </MockCard>
      </div>
    </div>
  );
}
/** Step 4, release: release notes; Publish shows a toast that customers were notified. */
export function ReleaseStage() {
  const [published, setPublished] = useState(false);
  return (
    <div className="relative mx-auto max-w-[520px]">
      <AnimatePresence>
        {published && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={SPRING}
            className="absolute -top-4 right-0 z-10 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12.5px] text-white sm:-right-8"
            style={{
              background: COLOR.ink,
            }}
          >
            <Icon name="ph:check-circle-fill" size={14} />
            Published, 37 customers notified
          </motion.div>
        )}
      </AnimatePresence>
      <MockCard className="p-5">
        <div className="flex items-center gap-2 text-[12.5px]">
          <span
            className="rounded-[6px] px-1.5 py-0.5"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
              color: COLOR.soft,
            }}
          >
            v3.0
          </span>
          <span
            style={{
              color: COLOR.soft,
            }}
          >
            September 22, 2026
          </span>
        </div>
        <h4
          className="m-0 mt-3 text-[20px] font-medium tracking-[-0.02em]"
          style={{
            color: COLOR.ink,
          }}
        >
          Weekly updates that write themselves
        </h4>
        {(
          [
            [
              "New",
              COLOR.accent,
              [
                "Friday update drafts for every project",
                "Send to chat, email or both",
              ],
            ],
            ["Improved", COLOR.ink, ["Timeline loads twice as fast"]],
            [
              "Fixed",
              "#7A828E",
              ["Dates in guest views use the guest's time zone"],
            ],
          ] as const
        ).map(([kind, color, items]) => (
          <div className="mt-3" key={kind}>
            <div
              className="flex items-center gap-1.5 text-[12.5px] font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              <i
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: color,
                }}
              />
              {kind}
            </div>
            {items.map((item) => (
              <div
                className="mt-1 text-[13.5px]"
                style={{
                  color: COLOR.soft,
                }}
                key={item}
              >
                – {item}
              </div>
            ))}
          </div>
        ))}
        <div
          className="mt-5 flex items-center justify-between gap-3"
          style={{
            borderTop: `1px solid ${COLOR.line}`,
            paddingTop: 14,
          }}
        >
          <span
            className="flex items-center gap-2 text-[12px]"
            style={{
              color: COLOR.soft,
            }}
          >
            <span className="flex -space-x-1.5">
              {(["Sam Ito", "Priya Shah", "Nadia Okoro"] as const).map(
                (item) => (
                  <Avatar name={item} size={20} key={item} />
                ),
              )}
            </span>
            37 customers asked
          </span>
          <motion.button
            type="button"
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => setPublished((prev) => !prev)}
            className="pl-ring rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium text-white outline-none"
            style={{
              background: published ? COLOR.green : COLOR.accent,
            }}
          >
            {published ? "Published" : "Publish and notify"}
          </motion.button>
        </div>
      </MockCard>
    </div>
  );
}
/** A step: anchor id, its name in the side list, headline (a in ink, b in grey), its stage backdrop and its demo. */
export type Step = {
  id: string;
  nav: string;
  a: string;
  b: string;
  tone?: "sand" | "day";
  el: () => ReactNode;
};
export const STEPS: Step[] = [
  {
    id: "collect",
    nav: "Collect requests",
    a: "Every request in one inbox.",
    b: "Ideas from chat, email and your help desk land in one place, grouped and counted.",
    el: CollectStage,
  },
  {
    id: "plan",
    nav: "Plan the roadmap",
    a: "A roadmap that updates itself.",
    b: "Move a date and every linked project and owner moves with it.",
    tone: "sand",
    el: PrioritizeStage,
  },
  {
    id: "track",
    nav: "Track the work",
    a: "Everyone sees the same status.",
    b: "Owners update their work where they already are, and blockers surface before they turn into slipped dates.",
    el: TrackStage,
  },
  {
    id: "ship",
    nav: "Ship and share",
    a: "Release notes in one click.",
    b: "Pick what shipped and Plotline writes the changelog entry, then tells every customer who asked for it.",
    tone: "day",
    el: ReleaseStage,
  },
];
/**
 * How it works: four steps, each with a live demo. On wide screens a sticky list follows the step in the middle of
 * the screen, with a progress line, and clicking a step scrolls to it.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 30%", "end 70%"],
  });
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }),
      {
        rootMargin: "-45% 0px -50% 0px",
      },
    );
    stepRefs.current.forEach((step) => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);
  return (
    <Fragment>
      <Section inner="px-5 py-20 sm:px-16 sm:py-28">
        <Eyebrow>How Plotline works</Eyebrow>
        <div className="mt-4 max-w-[1000px]">
          <Headline
            lead="One workspace for the whole plan."
            rest="Requests come in, roadmaps take shape and releases go out. No status meetings."
          />
        </div>
      </Section>
      <section
        style={{
          borderTop: `1px solid ${COLOR.line}`,
        }}
      >
        <div
          ref={listRef}
          className={`${CONTAINER} grid lg:grid-cols-[300px_1fr]`}
          style={{
            borderLeft: `1px solid ${COLOR.line}`,
            borderRight: `1px solid ${COLOR.line}`,
          }}
        >
          <aside
            className="hidden lg:block"
            style={{
              borderRight: `1px solid ${COLOR.line}`,
            }}
          >
            <div className="sticky top-24 px-10 py-16">
              <div className="relative">
                <span
                  className="absolute left-0 top-0 h-full w-px"
                  style={{
                    background: COLOR.line2,
                  }}
                />
                <motion.span
                  className="absolute left-0 top-0 w-px origin-top"
                  style={{
                    background: COLOR.accent,
                    height: "100%",
                    scaleY: scrollYProgress,
                  }}
                />
                {STEPS.map((step, index) => (
                  <button
                    type="button"
                    onClick={() =>
                      stepRefs.current[index]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    className="pl-ring relative block w-full py-2 pl-5 text-left text-[18px] tracking-[-0.02em] outline-none transition-colors duration-300"
                    style={{
                      color: active === index ? COLOR.ink : "#A3A9B2",
                    }}
                    key={step.id}
                  >
                    {active === index && (
                      <motion.span
                        layoutId="how-dot"
                        className="absolute -left-[3px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full"
                        style={{
                          background: COLOR.accent,
                        }}
                        transition={SPRING}
                      />
                    )}
                    {step.nav}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <div className="px-4 sm:px-16">
            {STEPS.map((step, index) => {
              const Demo = step.el;
              return (
                <div
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                  data-step={index}
                  className="py-16 sm:py-20"
                  style={{
                    borderTop: index ? `1px solid ${COLOR.line}` : undefined,
                  }}
                  key={step.id}
                >
                  <div className="max-w-[720px]">
                    <Headline size="md" lead={step.a} rest={step.b} as="h3" />
                  </div>
                  <Reveal className="mt-10">
                    <Stage tone={step.tone}>
                      <Demo />
                    </Stage>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Fragment>
  );
}
