"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  DAY_WIDTH,
  MONTHS,
  TIMELINE_ROWS,
  TODAY,
  TRACK_LEFT,
  VIEWS,
  WEEKLY_UPDATE,
  dayLabel,
  type TimelineRow,
  type View,
} from "./data";
import { COLOR, EASE, FONT_SANS, SPRING } from "./theme";
import { Avatar, Icon, Logo, type IconName, type Person } from "./ui";

/** One bar or milestone on the timeline. Linked rows follow `shift` on a spring that softens with `lag`. */
export function TimelineBar({
  row,
  shift,
  lag,
  dragging,
}: {
  row: TimelineRow;
  shift: MotionValue<number>;
  lag: number;
  dragging: boolean;
}) {
  const x = useSpring(shift, {
    stiffness: 260 - lag * 50,
    damping: 26,
  });
  const [start, setStart] = useState(row.s);
  useMotionValueEvent(x, "change", (value) =>
    setStart(row.s + value / DAY_WIDTH),
  );
  const linkedX = row.linked ? x : undefined;
  const ring = dragging && row.linked ? `0 0 0 2px ${COLOR.accent}` : undefined;
  if (row.kind === "pin") {
    return (
      <motion.div
        className="absolute top-1/2 flex items-center gap-1.5 text-[11.5px]"
        style={{
          left: row.s * DAY_WIDTH - 7,
          x: linkedX,
          y: "-50%",
          color: COLOR.soft,
        }}
      >
        <span
          className="block h-3.5 w-3.5 rotate-45 rounded-[3px]"
          style={{
            background: row.linked ? COLOR.ink : "#fff",
            boxShadow: ring ?? `inset 0 0 0 1.5px ${COLOR.ink}`,
          }}
        />
        {dayLabel(start)}
      </motion.div>
    );
  } else {
    return (
      <motion.div
        className="absolute top-1/2 flex h-7 items-center overflow-hidden whitespace-nowrap rounded-[7px] px-2.5 text-[11.5px] font-medium"
        style={{
          left: row.s * DAY_WIDTH,
          width: (row.e - row.s) * DAY_WIDTH,
          x: linkedX,
          y: "-50%",
          background:
            row.kind === "live"
              ? COLOR.accent
              : row.kind === "done"
                ? COLOR.panel2
                : "#fff",
          color: row.kind === "live" ? "#fff" : COLOR.soft,
          boxShadow:
            ring ??
            (row.kind === "next"
              ? `inset 0 0 0 1px ${COLOR.line2}`
              : undefined),
          transition: "box-shadow .2s",
        }}
      >
        {row.kind === "live" && (
          <span
            className="absolute inset-y-0 left-0"
            style={{
              width: `${row.pct}%`,
              background: "rgba(255,255,255,.14)",
            }}
          />
        )}
        <span className="relative">
          {row.kind === "done"
            ? "Done"
            : row.kind === "live"
              ? `${row.pct}% · ${row.who}`
              : `Starts ${dayLabel(start)}`}
        </span>
      </motion.div>
    );
  }
}
/**
 * The timeline view: drag the onboarding bar and the linked projects follow. On screen it demos itself once
 * (pushes the bar 3 days, then back) until the visitor drags. `onShift` gets the days moved, or null when back.
 */
export function TimelineView({
  on,
  onShift,
}: {
  on: boolean;
  onShift: (days: number | null) => void;
}) {
  const shift = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (!!on && !touched && !reduce) {
      timers.current.push(
        window.setTimeout(() => {
          animate(shift, 21, {
            type: "spring",
            stiffness: 120,
            damping: 18,
          });
          onShift(3);
          timers.current.push(
            window.setTimeout(() => {
              animate(shift, 0, {
                type: "spring",
                stiffness: 120,
                damping: 18,
              });
              onShift(null);
            }, 2200),
          );
        }, 1600),
      );
      return () => {
        timers.current.forEach((item) => window.clearTimeout(item));
        timers.current = [];
      };
    }
  }, [on, touched, reduce, shift, onShift]);
  const settle = () => {
    const snapped = Math.round(shift.get() / DAY_WIDTH) * DAY_WIDTH;
    animate(shift, snapped, SPRING);
    setDragging(false);
    onShift(Math.round(snapped / DAY_WIDTH));
  };
  return (
    <div className="relative">
      <div
        className="grid text-[12px]"
        style={{
          gridTemplateColumns: `${TRACK_LEFT}px 1fr`,
          borderBottom: `1px solid ${COLOR.line}`,
        }}
      >
        <span />
        <div className="relative flex">
          {MONTHS.map(([month, days]) => (
            <span
              className="py-2 pl-2.5"
              style={{
                width: days * DAY_WIDTH,
                color: COLOR.soft,
                borderLeft: `1px solid ${COLOR.line}`,
              }}
              key={month}
            >
              {month}
            </span>
          ))}
          <span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium text-white"
            style={{
              left: TODAY * DAY_WIDTH,
              background: COLOR.accent,
            }}
          >
            Today
          </span>
        </div>
      </div>
      <div className="relative">
        <span
          className="absolute bottom-0 top-0 w-px"
          style={{
            left: TRACK_LEFT + TODAY * DAY_WIDTH,
            background: COLOR.accent,
          }}
        />
        {TIMELINE_ROWS.map((timelineRow, index) => (
          <div
            className="grid h-[46px] items-center"
            style={{
              gridTemplateColumns: `${TRACK_LEFT}px 1fr`,
              borderBottom: `1px solid ${COLOR.line}`,
            }}
            key={timelineRow.t}
          >
            <span
              className="truncate pl-5 text-[12.5px] font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              {timelineRow.t}
            </span>
            <div className="relative h-full">
              {timelineRow.drag ? (
                <motion.div
                  drag="x"
                  dragMomentum={false}
                  dragElastic={0.04}
                  dragConstraints={{
                    left: -70,
                    right: 150,
                  }}
                  style={{
                    x: shift,
                    left: timelineRow.s * DAY_WIDTH,
                    width: (timelineRow.e - timelineRow.s) * DAY_WIDTH,
                    y: "-50%",
                    background: COLOR.accent,
                    touchAction: "none",
                  }}
                  onDragStart={() => {
                    timers.current.forEach((item) => window.clearTimeout(item));
                    shift.stop();
                    setDragging(true);
                    setTouched(true);
                    onShift(null);
                  }}
                  onDragEnd={settle}
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileDrag={{
                    scale: 1.05,
                    boxShadow: "0 8px 20px -6px rgba(51,85,255,.6)",
                  }}
                  className="absolute top-1/2 z-10 flex h-7 cursor-grab items-center overflow-hidden whitespace-nowrap rounded-[7px] px-2.5 text-[11.5px] font-medium text-white active:cursor-grabbing"
                  role="slider"
                  aria-label="New onboarding flow dates. Drag to move."
                  aria-valuenow={0}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "ArrowRight" ||
                      event.key === "ArrowLeft"
                    ) {
                      setTouched(true);
                      const next =
                        shift.get() +
                        (event.key === "ArrowRight" ? DAY_WIDTH : -DAY_WIDTH);
                      shift.set(Math.max(-70, Math.min(150, next)));
                      onShift(Math.round(shift.get() / DAY_WIDTH));
                    }
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: "68%",
                      background: "rgba(255,255,255,.14)",
                    }}
                  />
                  <span className="relative flex items-center gap-1.5">
                    <Icon name="ph:arrows-left-right" size={11} />
                    68% · Maya
                  </span>
                </motion.div>
              ) : (
                <TimelineBar
                  row={timelineRow}
                  shift={shift}
                  lag={index - 3}
                  dragging={dragging}
                />
              )}
            </div>
          </div>
        ))}
        {!touched && (
          <span
            className="pointer-events-none absolute left-[46%] top-[105px] rounded-full px-2 py-0.5 text-[10.5px] font-medium"
            style={{
              background: COLOR.accentSoft,
              color: COLOR.accent,
            }}
          >
            Drag me
          </span>
        )}
      </div>
      <Cursors on={on} />
    </div>
  );
}
/** [name, colour, x path, y path, seconds per loop] */
type CursorPath = [
  name: string,
  color: string,
  xs: number[],
  ys: number[],
  seconds: number,
];

/** Two teammates' cursors wandering over the timeline, so the mock feels shared. */
export function Cursors({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return null;
  }
  const cursors: CursorPath[] = [
    [
      "Maya",
      "#E5484D",
      [520, 610, 560, 430, 520],
      [120, 160, 250, 210, 120],
      9,
    ],
    [
      "Theo",
      COLOR.green,
      [300, 380, 470, 360, 300],
      [300, 260, 330, 360, 300],
      11,
    ],
  ];
  return (
    <Fragment>
      {cursors.map(([name, color, xs, ys, seconds]) => (
        <motion.div
          aria-hidden={true}
          className="pointer-events-none absolute left-0 top-0 z-20"
          animate={
            on
              ? {
                  x: xs,
                  y: ys,
                }
              : undefined
          }
          initial={{
            x: xs[0],
            y: ys[0],
          }}
          transition={{
            duration: seconds,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          key={name}
        >
          <svg width="16" height="18" viewBox="0 0 16 18">
            <path
              d="M1 1 L14 8.5 L8 9.8 L5.2 16 Z"
              fill={color}
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="ml-3 block w-fit rounded-[6px] px-1.5 py-0.5 text-[10.5px] font-medium text-white"
            style={{
              background: color,
            }}
          >
            {name}
          </span>
        </motion.div>
      ))}
    </Fragment>
  );
}
/** [title, owner, due, percent done] */
type BoardCard = [title: string, owner: Person, due: string, percent: number];
export function BoardView() {
  const columns: [lane: string, cards: BoardCard[]][] = [
    [
      "Now",
      [
        ["New onboarding flow", "Maya Lind", "Nov 21", 68],
        ["Billing migration", "Theo Ruiz", "Nov 28", 41],
      ],
    ],
    [
      "Next",
      [
        ["Help center refresh", "Jonas Berg", "Dec 5", 8],
        ["Guest comments", "Priya Shah", "Dec 12", 0],
      ],
    ],
    [
      "Later",
      [
        ["PDF roadmap export", "Maya Lind", "Q1", 0],
        ["SSO for Team plan", "Theo Ruiz", "Q1", 0],
      ],
    ],
  ];
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {columns.map(([lane, cards], index) => (
        <div
          className="rounded-[12px] p-2.5"
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
              {cards.length}
            </span>
          </div>
          <div className="grid gap-2">
            {cards.map(([title, owner, due, percent], cardIndex) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  ...SPRING,
                  delay: index * 0.06 + cardIndex * 0.05,
                }}
                whileHover={{
                  y: -2,
                  boxShadow: "0 8px 18px -10px rgba(14,17,22,.35)",
                }}
                className="rounded-[10px] bg-white p-3"
                style={{
                  boxShadow: `0 0 0 1px ${COLOR.line}`,
                }}
                key={title}
              >
                <div
                  className="text-[12.5px] font-medium"
                  style={{
                    color: COLOR.ink,
                  }}
                >
                  {title}
                </div>
                <div
                  className="mt-2 flex items-center justify-between text-[11.5px]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Avatar name={owner} size={18} />
                    {owner.split(" ")[0]}
                  </span>
                  {due}
                </div>
                <div
                  className="mt-2 h-1 overflow-hidden rounded-full"
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
                    animate={{
                      width: `${percent}%`,
                    }}
                    transition={{
                      duration: 1,
                      ease: EASE,
                      delay: 0.2,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export function TaskList() {
  const [done, setDone] = useState<Record<string, boolean>>({
    "Close interview notes": true,
  });
  /** [task, project, status, status colour] */
  const tasks: [
    task: string,
    project: string,
    status: string,
    color: string,
  ][] = [
    ["Write migration guide", "Billing v2", "In progress", COLOR.accent],
    ["Review onboarding copy", "Onboarding", "In review", COLOR.ink],
    ["Fix tax rounding on invoices", "Billing v2", "Blocked", COLOR.red],
    ["Record demo for launch", "Mobile app", "To do", COLOR.faint],
    ["Close interview notes", "Research", "Done", COLOR.green],
  ];
  return (
    <ul className="m-0 list-none p-0">
      {tasks.map(([task, project, status, color]) => {
        const isDone = !!done[task];
        return (
          <li
            className="flex items-center gap-3 px-5 py-3 text-[12.5px]"
            style={{
              borderBottom: `1px solid ${COLOR.line}`,
            }}
            key={task}
          >
            <motion.button
              type="button"
              whileTap={{
                scale: 0.85,
              }}
              onClick={() =>
                setDone((prev) => ({
                  ...prev,
                  [task]: !prev[task],
                }))
              }
              aria-pressed={isDone}
              aria-label={`Mark ${task} done`}
              className="pl-ring grid h-[18px] w-[18px] place-items-center rounded-full outline-none"
              style={{
                background: isDone ? COLOR.accent : "#fff",
                boxShadow: isDone ? "none" : `inset 0 0 0 1.5px ${COLOR.line2}`,
                color: "#fff",
              }}
            >
              <AnimatePresence>
                {isDone && (
                  <motion.span
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    exit={{
                      scale: 0,
                    }}
                  >
                    <Icon name="ph:check" size={11} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <span
              className="relative flex-1 font-medium"
              style={{
                color: isDone ? COLOR.faint : COLOR.ink,
              }}
            >
              {task}
              <motion.span
                className="absolute left-0 top-1/2 h-px origin-left"
                style={{
                  background: COLOR.faint,
                  width: "100%",
                }}
                animate={{
                  scaleX: isDone ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            </span>
            <span
              className="hidden rounded-[6px] px-1.5 py-0.5 sm:inline"
              style={{
                background: COLOR.panel,
                color: COLOR.soft,
              }}
            >
              {project}
            </span>
            <span
              className="flex w-24 items-center gap-1.5"
              style={{
                color: COLOR.ink,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isDone ? COLOR.green : color,
                }}
              />
              {isDone ? "Done" : status}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
export function UpdateNote() {
  return (
    <div className="grid gap-3 p-5">
      {(
        [
          [
            "Week 39",
            "Onboarding on track, billing slips three days.",
            "Maya Lind",
          ],
          ["Week 38", "Guest comments shipped to every customer.", "Theo Ruiz"],
          [
            "Week 37",
            "Pricing page copy is done. Interviews wrapped.",
            "Priya Shah",
          ],
        ] as const
      ).map(([week, summary, sender], index) => (
        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            ...SPRING,
            delay: index * 0.07,
          }}
          className="flex items-center gap-3 rounded-[10px] p-3"
          style={{
            boxShadow: `0 0 0 1px ${COLOR.line}`,
          }}
          key={week}
        >
          <Avatar name={sender} size={28} />
          <div className="flex-1">
            <div
              className="text-[12.5px] font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              {week}: {summary}
            </div>
            <div
              className="text-[11.5px]"
              style={{
                color: COLOR.soft,
              }}
            >
              Drafted by Plotline, sent by {sender.split(" ")[0]}
            </div>
          </div>
          <span
            className="text-[11px]"
            style={{
              color: COLOR.faint,
            }}
          >
            Fri 9:00
          </span>
        </motion.div>
      ))}
    </div>
  );
}
/** The floating weekly-update card: it types out the draft once on screen, and Send marks it sent. */
export function UpdatesView({ on }: { on: boolean }) {
  const [typed, setTyped] = useState(0);
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!on) {
      return;
    }
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(WEEKLY_UPDATE.length);
      return;
    }
    let count = 0;
    const timer = window.setInterval(() => {
      count += 2;
      setTyped(Math.min(count, WEEKLY_UPDATE.length));
      if (count >= WEEKLY_UPDATE.length) {
        window.clearInterval(timer);
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [on, reduce]);
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.96,
      }}
      animate={
        on
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : {}
      }
      transition={{
        ...SPRING,
        delay: 0.5,
      }}
      className="absolute bottom-6 right-6 z-30 w-[330px] rounded-[14px] bg-white p-4"
      style={{
        boxShadow:
          "0 0 0 1px rgba(14,17,22,.06), 0 24px 50px -20px rgba(14,17,22,.4)",
      }}
    >
      <div className="flex items-center justify-between text-[13px]">
        <span
          className="flex items-center gap-1.5 font-medium"
          style={{
            color: COLOR.ink,
          }}
        >
          <span
            style={{
              color: COLOR.accent,
            }}
          >
            <Icon name="ph:sparkle" size={15} />
          </span>
          Weekly update, drafted
        </span>
        <span
          style={{
            color: COLOR.faint,
          }}
        >
          Fri 9:00
        </span>
      </div>
      <p
        className="m-0 mt-2 min-h-[54px] text-[12px] leading-[1.5]"
        style={{
          color: COLOR.soft,
        }}
      >
        {WEEKLY_UPDATE.slice(0, typed)}
        {typed < WEEKLY_UPDATE.length && (
          <span
            className="ml-px inline-block h-3 w-[2px] translate-y-0.5 animate-pulse"
            style={{
              background: COLOR.accent,
            }}
          />
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="pl-ring rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium outline-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
            color: COLOR.ink,
          }}
        >
          Edit
        </button>
        <motion.button
          type="button"
          onClick={() => setSent(true)}
          layout={true}
          className="pl-ring flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-white outline-none"
          style={{
            background: sent ? COLOR.green : COLOR.ink,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {sent ? (
              <motion.span
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex items-center gap-1"
                key="s"
              >
                <Icon name="ph:check" size={12} />
                Sent to #product
              </motion.span>
            ) : (
              <motion.span
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                key="u"
              >
                Send to #product
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
/** The product in a browser frame: four views behind tabs, the floating weekly update, and a toast when bars move. */
export function AppMock() {
  const [view, setView] = useState<View>("Timeline");
  /** days the linked projects moved, shown as a toast; null hides it */
  const [toast, setToast] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, {
    amount: 0.35,
  });
  const sidebar: [icon: IconName, label: string, count?: string][] = [
    ["ph:house", "Home"],
    ["ph:tray", "Inbox", "12"],
    ["ph:check-square", "My work"],
    ["ph:map-trifold", "Roadmap"],
    ["ph:rocket-launch", "Releases"],
    ["ph:chart-line-up", "Reports"],
  ];
  return (
    <div
      ref={frameRef}
      className="relative w-[1040px] overflow-hidden rounded-[14px] bg-white text-left"
      style={{
        boxShadow:
          "0 0 0 1px rgba(14,17,22,.06), 0 40px 80px -30px rgba(40,30,80,.45)",
        fontFamily: FONT_SANS,
      }}
    >
      <div
        className="relative flex h-9 items-center justify-center text-[12px]"
        style={{
          background: COLOR.panel,
          color: COLOR.soft,
          borderBottom: `1px solid ${COLOR.line}`,
        }}
      >
        <span className="absolute left-3.5 flex gap-1.5">
          {[0, 1, 2].map((item) => (
            <i
              className="block h-2.5 w-2.5 rounded-full"
              style={{
                background: "#D9DCE1",
              }}
              key={item}
            />
          ))}
        </span>
        app.plotline.so / Launch plan
      </div>
      <div className="grid h-[560px] grid-cols-[208px_1fr]">
        <aside
          className="flex flex-col gap-0.5 p-3"
          style={{
            borderRight: `1px solid ${COLOR.line}`,
          }}
        >
          <div
            className="mb-2 flex items-center justify-between px-1.5 py-1 text-[13px] font-medium"
            style={{
              color: COLOR.ink,
            }}
          >
            <span className="flex items-center gap-2">
              <Logo size={18} />
            </span>
            <Icon name="ph:caret-down" size={12} />
          </div>
          <div
            className="mb-2 flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[12.5px]"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
              color: COLOR.faint,
            }}
          >
            <Icon name="ph:magnifying-glass" size={13} />
            Search<span className="ml-auto text-[11px]">⌘K</span>
          </div>
          {sidebar.map(([icon, label, count]) => (
            <div
              className="flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-[12.5px]"
              style={{
                background: label === "Roadmap" ? COLOR.panel : undefined,
                color: label === "Roadmap" ? COLOR.ink : COLOR.text,
              }}
              key={label}
            >
              <Icon name={icon} size={14} />
              {label}
              {count && (
                <span
                  className="ml-auto text-[11px]"
                  style={{
                    color: COLOR.faint,
                  }}
                >
                  {count}
                </span>
              )}
            </div>
          ))}
          <div
            className="mt-4 px-2 pb-1 text-[11.5px]"
            style={{
              color: COLOR.faint,
            }}
          >
            Projects
          </div>
          {(
            [
              ["Mobile app", COLOR.accent],
              ["Billing v2", COLOR.ink],
              ["Onboarding", "#7A828E"],
              ["Help center", "#D7DBE0"],
            ] as const
          ).map(([project, color]) => (
            <div
              className="flex items-center gap-2.5 px-2 py-1.5 text-[12.5px]"
              style={{
                color: COLOR.text,
              }}
              key={project}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: color,
                }}
              />
              {project}
            </div>
          ))}
        </aside>
        <div className="relative flex min-w-0 flex-col">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2">
              <span
                className="text-[19px] font-medium tracking-[-0.02em]"
                style={{
                  color: COLOR.ink,
                }}
              >
                Launch plan
              </span>
              <span
                className="rounded-[6px] px-1.5 py-0.5 text-[11px]"
                style={{
                  background: COLOR.panel,
                  color: COLOR.soft,
                }}
              >
                Q4 2026
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {(["Maya Lind", "Theo Ruiz", "Jonas Berg"] as const).map(
                  (item) => (
                    <Avatar name={item} size={24} key={item} />
                  ),
                )}
              </span>
              <span
                className="rounded-[7px] px-2.5 py-1 text-[12px] font-medium"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                  color: COLOR.ink,
                }}
              >
                Share
              </span>
            </div>
          </div>
          <LayoutGroup id="mock-tabs">
            <div
              role="tablist"
              aria-label="Views"
              className="mt-3 flex gap-4 px-5"
              style={{
                borderBottom: `1px solid ${COLOR.line}`,
              }}
            >
              {VIEWS.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === tab}
                  onClick={() => {
                    setView(tab);
                    setToast(null);
                  }}
                  className="pl-ring relative pb-2.5 text-[12.5px] outline-none"
                  style={{
                    color: view === tab ? COLOR.ink : COLOR.soft,
                  }}
                  key={tab}
                >
                  {tab}
                  {view === tab && (
                    <motion.span
                      layoutId="mock-tab"
                      className="absolute inset-x-0 -bottom-px h-[2px] rounded-full"
                      style={{
                        background: COLOR.accent,
                      }}
                      transition={SPRING}
                    />
                  )}
                </button>
              ))}
            </div>
          </LayoutGroup>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
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
                  duration: 0.25,
                }}
                className="h-full"
                key={view}
              >
                {view === "Timeline" ? (
                  <TimelineView on={inView} onShift={setToast} />
                ) : view === "Board" ? (
                  <BoardView />
                ) : view === "List" ? (
                  <TaskList />
                ) : (
                  <UpdateNote />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <UpdatesView on={inView} />
      <div className="pointer-events-none absolute bottom-6 left-[232px] z-30">
        <AnimatePresence>
          {toast !== null && toast !== 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 6,
              }}
              transition={SPRING}
              className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[12px] text-white"
              style={{
                background: COLOR.ink,
              }}
            >
              <Icon name="ph:link-simple" size={13} />
              Moved 3 linked projects {Math.abs(toast)} day
              {Math.abs(toast) === 1 ? "" : "s"}{" "}
              {toast > 0 ? "later" : "earlier"}. Owners notified.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
