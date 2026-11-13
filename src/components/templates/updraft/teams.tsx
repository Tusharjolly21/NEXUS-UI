"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { COLORS, CONTAINER, EASE, SPECTRUM, SPECTRUM_GRADIENT, seededRandom } from "./theme";
import { Icon, TwoToneHeading, TypedText, useCycle } from "./ui";

function MiniCard({
  t: title,
  meta,
  icon,
  tone,
  extra = false,
}: {
  t: string;
  meta: string;
  icon: string;
  tone?: string;
  extra?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.05)] ${extra ? "hidden sm:block" : ""}`}>
      <p
        className="text-[11.5px] font-[520] leading-[1.3]"
        style={{
          color: COLORS.ink,
        }}
      >
        {title}
      </p>
      <p
        className="mt-1.5 hidden items-center gap-1 text-[10px] sm:flex"
        style={{
          color: tone ?? COLORS.soft,
        }}
      >
        <Icon name={icon} size={11} />
        {meta}
      </p>
    </div>
  );
}

function FounderScene({ live }: { live: boolean }) {
  const tick = useCycle(6, 1300, live);
  const step = live ? tick : 4;
  const column = step === 0 ? 0 : step <= 2 ? 1 : 2;
  const progress = [0, 34, 78, 100, 100, 100][step];
  const doneCount = 5 + (column === 2 ? 1 : 0);
  const columns = ["To do", "Doing", "Done"];
  const cards = [
    [0, "Team invites", "you · Thu", "ph:user"],
    [0, "Onboarding emails", "queued for agent", "ph:robot"],
    [1, "Usage-based pricing page", "you · in review", "ph:git-pull-request"],
    [2, "Stripe webhooks", "merged · +188", "ph:check-circle-fill", "#1E9E57"],
    [2, "Usage meter", "merged · +96", "ph:check-circle-fill", "#1E9E57"],
  ] as [number, string, string, string, string?][];
  return (
    <div className="w-[min(480px,92%)] rounded-[20px] bg-white/55 p-3 ring-1 ring-inset ring-white">
      <div className="mb-3 flex items-center justify-between px-1 text-[11.5px]">
        <span className="font-[560]">Roadmap · this week</span>
        <span
          className="flex items-center gap-2 tabular-nums"
          style={{
            color: COLORS.soft,
          }}
        >
          <span className="h-1 w-16 overflow-hidden rounded-full bg-white">
            <span
              className="block h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${(doneCount / 9) * 100}%`,
                background: SPECTRUM_GRADIENT,
              }}
            />
          </span>
          {doneCount}
          {" of 9"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {columns.map((columnName, i) => (
          <div key={columnName} className="min-h-[150px] rounded-2xl sm:min-h-[230px] bg-[#F7F7FA]/90 p-2">
            <p
              className="mb-2 flex items-center justify-between px-1 text-[10.5px] font-[560]"
              style={{
                color: COLORS.soft,
              }}
            >
              {columnName}
              <span
                className="tabular-nums"
                style={{
                  color: COLORS.faint,
                }}
              >
                {cards.filter((card) => card[0] === i).length + (i === column ? 1 : 0)}
              </span>
            </p>
            <div className="space-y-1.5">
              {i === column && (
                <motion.div
                  layoutId="kb-hero"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="relative overflow-hidden rounded-xl bg-white p-2.5 shadow-[0_12px_26px_-12px_rgba(75,59,255,.55),0_0_0_1px_rgba(166,60,242,.18)]"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{
                      background: SPECTRUM_GRADIENT,
                    }}
                  />
                  <p className="text-[11.5px] font-[540] leading-[1.3]">Annual billing</p>
                  <p
                    className="mt-1.5 flex items-center gap-1 text-[10px]"
                    style={{
                      color: column === 2 ? "#1E9E57" : COLORS.soft,
                    }}
                  >
                    <Icon name={column === 2 ? "ph:check-circle-fill" : "ph:robot"} size={11} />
                    {column === 0
                      ? "assigned to agent"
                      : column === 1
                        ? progress < 50
                          ? "writing code"
                          : "tests 16 / 18"
                        : "merged · +214"}
                  </p>
                  {column === 1 && (
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#EEEFF3]">
                      <span
                        className="block h-full rounded-full transition-[width] duration-700"
                        style={{
                          width: `${progress}%`,
                          background: SPECTRUM_GRADIENT,
                        }}
                      />
                    </span>
                  )}
                </motion.div>
              )}
              {cards
                .filter((card) => card[0] === i)
                .map(([, title, meta, icon, tone], i) => (
                  <MiniCard key={title} t={title} meta={meta} icon={icon} tone={tone} extra={i > 0} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformScene({ live }: { live: boolean }) {
  const tick = useCycle(28, 220, live);
  const TOTAL = 60;
  const upgraded = live ? Math.min(TOTAL, Math.round((tick / 24) * TOTAL)) : TOTAL;
  const order = useMemo(() => {
    const random = seededRandom(5);
    return Array.from(
      {
        length: TOTAL,
      },
      (a, u) => u,
    ).sort(() => random() - 0.5);
  }, []);
  const rank = useMemo(() => {
    const ranks = new Array(TOTAL);
    order.forEach((a, i) => (ranks[a] = i));
    return ranks;
  }, [order]);
  return (
    <div className="w-[min(440px,88%)] rounded-2xl bg-white/75 p-4 ring-1 ring-inset ring-white">
      <div className="mb-3 flex items-center justify-between text-[11.5px]">
        <span className="font-[560]">Upgrade to Node 22</span>
        <span
          className="tabular-nums"
          style={{
            color: COLORS.soft,
          }}
        >
          {Math.round((upgraded / TOTAL) * 140)}
          {" / 140 services"}
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from(
          {
            length: TOTAL,
          },
          (o, a) => {
            const u = rank[a] < upgraded;
            return (
              <span
                key={a}
                className="grid aspect-square place-items-center rounded-[5px] transition-colors duration-300"
                style={{
                  background: u ? "#1E9E57" : "#E6E7EB",
                }}
              >
                {u && <Icon name="ph:check" size={9} className="text-white" />}
              </span>
            );
          },
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#E6E7EB]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${(upgraded / TOTAL) * 100}%`,
            background: SPECTRUM_GRADIENT,
          }}
        />
      </div>
    </div>
  );
}

function MobileScene({ live }: { live: boolean }) {
  const tick = useCycle(5, 900, live);
  const builds = [
    ["iOS build", "2m 41s"],
    ["Android build", "3m 08s"],
    ["UI snapshots", "24 / 24"],
    ["Store notes", "drafted"],
  ];
  return (
    <div className="flex w-[min(460px,90%)] items-center gap-5">
      <div className="relative h-[250px] w-[124px] shrink-0 rounded-[26px] bg-[#121317] p-[5px] shadow-[0_24px_50px_-20px_rgba(18,19,23,.6)]">
        <div className="h-full overflow-hidden rounded-[21px] bg-white p-2.5">
          <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-[#E6E7EB]" />
          <div
            className="h-16 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${SPECTRUM[0]}, ${SPECTRUM[2]})`,
            }}
          />
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="mt-2 flex items-center gap-1.5">
              <span className="size-5 rounded-md bg-[#F0F1F4]" />
              <span className="h-1.5 flex-1 rounded-full bg-[#F0F1F4]" />
            </div>
          ))}
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {builds.map(([label, time], i) => {
          const done = !live || tick > i;
          return (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 text-[12px] ring-1 ring-inset ring-white"
            >
              <span
                className="grid size-5 place-items-center rounded-full transition-colors duration-300"
                style={{
                  background: done ? "#1E9E57" : "#E6E7EB",
                  color: "#fff",
                }}
              >
                {done ? (
                  <Icon name="ph:check" size={11} />
                ) : (
                  <Icon
                    name="ph:circle-notch"
                    size={11}
                    className={tick === i ? "ud-spin-fast text-[#767A84]" : "text-transparent"}
                  />
                )}
              </span>
              <span className="flex-1 font-[520]">{label}</span>
              <span
                className="tabular-nums"
                style={{
                  color: COLORS.soft,
                }}
              >
                {done ? time : "…"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AgencyScene({ live }: { live: boolean }) {
  const tick = useCycle(6, 900, live);
  const issues = [
    {
      n: 2148,
      t: "Crash when config path has spaces",
      l: ["bug", "has repro"],
    },
    {
      n: 2151,
      t: "Support Windows long paths",
      l: ["good first issue"],
    },
    {
      n: 2153,
      t: "Docs: typo in plugin guide",
      l: ["docs", "fixed in #2154"],
    },
    {
      n: 2156,
      t: "Crash on paths with spaces",
      l: ["duplicate of #2148"],
      dup: true,
    },
  ];
  return (
    <ul className="w-[min(460px,90%)] space-y-2">
      {issues.map((issue, i3) => {
        const i = !live || tick > i3;
        return (
          <li key={issue.n} className="rounded-xl bg-white/85 px-3.5 py-3 ring-1 ring-inset ring-white">
            <p className="flex items-center gap-2 text-[12.5px]">
              <span
                className="tabular-nums"
                style={{
                  color: COLORS.faint,
                }}
              >
                #{issue.n}
              </span>
              <span
                className={`font-[520] transition-colors duration-500 ${i && issue.dup ? "line-through" : ""}`}
                style={{
                  color: i && issue.dup ? COLORS.faint : COLORS.ink,
                }}
              >
                {issue.t}
              </span>
            </p>
            <div className="mt-2 flex min-h-[20px] flex-wrap gap-1.5">
              <AnimatePresence>
                {i &&
                  issue.l.map((line, done) => (
                    <motion.span
                      key={line}
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: done * 0.08,
                        type: "spring",
                        stiffness: 500,
                        damping: 28,
                      }}
                      className="rounded-full px-2 py-0.5 text-[10.5px] font-[540]"
                      style={{
                        background: ["#EEEBFF", "#FFEFF4", "#FFF4E6"][(i3 + done) % 3],
                        color: [SPECTRUM[0], "#D61F5A", "#B45F06"][(i3 + done) % 3],
                      }}
                    >
                      {line}
                    </motion.span>
                  ))}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const TEAMS = [
  {
    role: "Solo founders",
    body: "Ship a week of roadmap in an afternoon, with an agent that writes the tests it needs to prove the work is done.",
    tint: ["#EEEDFF", "#F6EEFF"],
    Scene: FounderScene,
  },
  {
    role: "Platform teams",
    body: "Roll one upgrade across a hundred and forty services, with a separate, reviewable pull request for every repo.",
    tint: ["#EAF6EF", "#EEF3FF"],
    Scene: PlatformScene,
  },
  {
    role: "Mobile engineers",
    body: "Make the change once. Updraft builds both platforms, checks every screen and drafts the store notes.",
    tint: ["#FFF1E8", "#FFEEF3"],
    Scene: MobileScene,
  },
  {
    role: "Maintainers",
    body: "Wake up to a tidy issue queue: labelled, reproduced, deduplicated and with the easy ones already fixed.",
    tint: ["#F1EEFF", "#FFF4E9"],
    Scene: AgencyScene,
  },
];

export function Teams() {
  const [[active, direction], setPage] = useState([0, 1]);
  const paginate = (step: number) => setPage(([prev]) => [(prev + step + TEAMS.length) % TEAMS.length, step]);
  const ref = useRef(null);
  const inView = useInView(ref, {
    margin: "-20% 0px",
  });
  const reduce = useReducedMotion();
  const live = inView && !reduce;
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const lift = useMotionValue(0);
  const springX = useSpring(tiltX, {
    stiffness: 260,
    damping: 26,
  });
  const springY = useSpring(tiltY, {
    stiffness: 260,
    damping: 26,
  });
  const springLift = useSpring(lift, {
    stiffness: 300,
    damping: 24,
  });
  const team = TEAMS[active];
  return (
    <section
      id="teams"
      className="scroll-mt-20 border-t py-24 sm:py-32"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={CONTAINER}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <TwoToneHeading a="Built for people who ship" b="and the backlogs they carry" />
          <p
            className="max-w-[420px] text-[15.5px] leading-[1.6] lg:justify-self-end"
            style={{
              color: COLORS.text,
            }}
          >
            Updraft works the way your team already works: in your repos, behind your reviews, inside your CI. It just
            never gets tired of the backlog.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div>
            <div
              ref={ref}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${team.role}, ${active + 1} of ${TEAMS.length}`}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                tiltX.set(event.clientX - rect.left);
                tiltY.set(event.clientY - rect.top);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "touch") {
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                tiltX.jump(event.clientX - rect.left);
                tiltY.jump(event.clientY - rect.top);
                springX.jump(event.clientX - rect.left);
                springY.jump(event.clientY - rect.top);
                lift.set(1);
              }}
              onPointerLeave={() => lift.set(0)}
              className="relative h-[clamp(420px,52vw,560px)] overflow-hidden rounded-[28px] lg:rounded-[32px]"
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={active}
                  custom={direction}
                  drag="x"
                  dragConstraints={{
                    left: 0,
                    right: 0,
                  }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) {
                      paginate(1);
                    } else {
                      if (info.offset.x > 60) {
                        paginate(-1);
                      }
                    }
                  }}
                  variants={{
                    in: (dir) => ({
                      opacity: 0,
                      x: dir * 48,
                    }),
                    show: {
                      opacity: 1,
                      x: 0,
                    },
                    out: (dir) => ({
                      opacity: 0,
                      x: dir * -48,
                    }),
                  }}
                  initial="in"
                  animate="show"
                  exit="out"
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                  }}
                  className="absolute inset-0 flex cursor-grab flex-col justify-between p-7 active:cursor-grabbing sm:p-10 md:flex-row md:items-center"
                  style={{
                    background: `linear-gradient(135deg, ${team.tint[0]}, ${team.tint[1]})`,
                  }}
                >
                  <TypedText
                    key={team.role}
                    as="h3"
                    text={team.role.replace(" ", "\n")}
                    cps={26}
                    delay={0.25}
                    className="text-[clamp(38px,5vw,64px)] font-[460] leading-[0.98] tracking-[-0.04em]"
                  />
                  <div className="flex flex-1 justify-center md:justify-end">
                    <team.Scene live={live} />
                  </div>
                </motion.div>
              </AnimatePresence>
              <motion.span
                aria-hidden={true}
                style={{
                  x: springX,
                  y: springY,
                  scale: springLift,
                  opacity: springLift,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                className="pointer-events-none absolute left-0 top-0 z-10 hidden items-center gap-1.5 rounded-full bg-[#121317] px-3.5 py-2 text-[12.5px] font-[500] text-white shadow-[0_10px_30px_-10px_rgba(18,19,23,.5)] md:flex"
              >
                <Icon name="ph:arrow-left" size={12} />
                Drag
                <Icon name="ph:arrow-right" size={12} />
              </motion.span>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  y: 10,
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
                  duration: 0.4,
                  ease: EASE,
                }}
              >
                <p
                  className="text-[13px] tabular-nums"
                  style={{
                    color: COLORS.faint,
                  }}
                >
                  {String(active + 1).padStart(2, "0")}
                  {" / "}
                  {String(TEAMS.length).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[22px] font-[500] tracking-[-0.02em]">{team.role}</h3>
                <p
                  className="mt-2 max-w-[360px] text-[15.5px] leading-[1.6]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {team.body}
                </p>
                <a
                  href="#journal"
                  className="ud-ring group mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-[520]"
                >
                  Read the story
                  <Icon name="ph:caret-right" size={13} className="transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-4">
              <div className="flex rounded-full bg-[#F2F3F5] p-1">
                <button
                  onClick={() => paginate(-1)}
                  aria-label="Previous team"
                  className="ud-ring grid size-10 place-items-center rounded-full transition-colors hover:bg-white"
                >
                  <Icon name="ph:caret-left" size={16} />
                </button>
                <button
                  onClick={() => paginate(1)}
                  aria-label="Next team"
                  className="ud-ring grid size-10 place-items-center rounded-full transition-colors hover:bg-white"
                >
                  <Icon name="ph:caret-right" size={16} />
                </button>
              </div>
              <div className="flex gap-1.5">
                {TEAMS.map((item, i) => (
                  <button
                    key={item.role}
                    onClick={() => setPage([i, i > active ? 1 : -1])}
                    aria-label={`Show ${item.role}`}
                    className="ud-ring h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: i === active ? 28 : 8,
                      background: i === active ? COLORS.ink : "#D5D7DC",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
