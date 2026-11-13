"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  COLORS,
  CONTAINER,
  EASE,
  EASE_OUT,
  FONT_MONO,
  FONT_SANS,
  SPECTRUM,
  SPECTRUM_GRADIENT,
  SPECTRUM_VERTICAL,
  SYN_ADDED,
  SYN_FUNCTION,
  SYN_KEYWORD,
  SYN_MUTED,
  SYN_PLAIN,
  SYN_STRING,
  seededRandom,
} from "./theme";
import { Button, Caret, Icon, ScrubText, TwoToneHeading, useCycle, useLiveInView } from "./ui";

function DeskSurface() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(7, 1100, live);
  const thinking = tick >= 2 && tick <= 5;
  const done = tick >= 5 ? 2 : tick >= 3 ? tick - 3 : 0;
  const PROMPT = "Ship the passkey flow behind a flag";
  const typed = tick === 0 ? "" : PROMPT.slice(0, Math.min(PROMPT.length, tick * 14));
  return (
    <div ref={ref} className="relative h-full overflow-hidden bg-[#F3F4F7]">
      <div aria-hidden={true} className="absolute left-1/2 top-[16%] h-[78%] w-[86%] -translate-x-1/2">
        <div
          className="ud-spin absolute inset-[-20%] opacity-70 blur-[46px]"
          style={{
            background: `conic-gradient(from 0deg, ${SPECTRUM[0]}, ${SPECTRUM[1]}, ${SPECTRUM[2]}, ${SPECTRUM[3]}, ${SPECTRUM[0]})`,
            WebkitMaskImage: "radial-gradient(closest-side, transparent 62%, #000 70%, transparent 100%)",
            maskImage: "radial-gradient(closest-side, transparent 62%, #000 70%, transparent 100%)",
          }}
        />
      </div>
      <div className="absolute inset-x-[8%] bottom-[-4%] top-[14%] rounded-[22px] bg-[#EDEEF1] shadow-[0_0_0_1px_rgba(18,19,23,.06),0_30px_60px_-30px_rgba(18,19,23,.35)]">
        <div className="absolute inset-x-[7%] top-[24%]">
          <div
            className="flex items-center gap-1.5 text-[12.5px] font-[520]"
            style={{
              color: COLORS.text,
            }}
          >
            <Icon name="ph:folder-simple" size={14} />
            acme/web-app
            <Icon name="ph:caret-down" size={10} />
          </div>
          <div className="mt-2.5 rounded-[14px] bg-white p-3.5 shadow-[0_8px_24px_-14px_rgba(18,19,23,.3)]">
            <p
              className="min-h-[20px] text-[13.5px]"
              style={{
                color: typed ? COLORS.ink : COLORS.faint,
              }}
            >
              {typed || "Describe a task, @ to mention, / for commands"}
              {typed && typed.length < PROMPT.length && <Caret />}
            </p>
            <div
              className="mt-3 flex items-center gap-2 text-[11.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              <Icon name="ph:plus" size={13} />
              <span className="flex items-center gap-1">
                Draft 2 · Fast
                <Icon name="ph:caret-down" size={10} />
              </span>
              <span className="ml-auto grid size-7 place-items-center rounded-full bg-[#F2F3F5]">
                <Icon name="ph:microphone" size={13} />
              </span>
            </div>
          </div>
          <div
            className="relative mt-2 flex items-center gap-3 rounded-b-[12px] bg-[#E4E5E9] px-3 py-2 text-[11.5px]"
            style={{
              color: COLORS.text,
            }}
          >
            <span className="flex items-center gap-1">
              <Icon name={["ph:laptop", "ph:cloud", "ph:tree-structure"][done]} size={12} />
              {["Local", "Cloud sandbox", "New worktree"][done]}
              <Icon name="ph:caret-down" size={10} />
            </span>
            <span className="flex items-center gap-1">
              <Icon name="ph:git-branch" size={12} />
              main
            </span>
            <AnimatePresence>
              {thinking && (
                <motion.ul
                  initial={{
                    opacity: 0,
                    y: -4,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: EASE,
                  }}
                  style={{
                    transformOrigin: "top left",
                  }}
                  className="absolute left-2 top-[calc(100%+6px)] w-[170px] rounded-xl bg-white p-1 shadow-[0_14px_34px_-12px_rgba(18,19,23,.35),0_0_0_1px_rgba(18,19,23,.06)]"
                >
                  {[
                    ["ph:laptop", "Local"],
                    ["ph:cloud", "Cloud sandbox"],
                    ["ph:tree-structure", "New worktree"],
                  ].map(([icon, label], i) => (
                    <li
                      key={label}
                      className="relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {i === done && (
                        <motion.span
                          layoutId="desk-hl"
                          className="absolute inset-0 rounded-lg bg-[#F2F3F5]"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 38,
                          }}
                        />
                      )}
                      <Icon name={icon} size={13} className="relative" />
                      <span className="relative">{label}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const SHELL_LOGO = [
  "....#....",
  "...###...",
  "..##.##..",
  ".##...##.",
  "....#....",
  "...###...",
  "..##.##..",
  ".##...##.",
];

const SHELL_LINES = [
  {
    k: "cmd",
    t: (
      <>
        <span
          style={{
            color: SPECTRUM[3],
          }}
        >
          ›
        </span>
        {" updraft run "}
        <span className="text-[#C9F27B]">{'"add retries to the webhook sender"'}</span>
      </>
    ),
  },
  {
    k: "plan",
    t: (
      <>
        <span className="inline-block w-12 text-white/45">plan</span>3 steps · 2 files
      </>
    ),
  },
  {
    k: "edit",
    t: (
      <>
        <span className="inline-block w-12 text-white/45">edit</span>src/webhooks/send.ts
      </>
    ),
  },
  {
    k: "d1",
    t: (
      <span className="block rounded-sm bg-[#3A1418] px-1 text-[#FF8F8F]">
        <span className="mr-2 text-white/30">12</span>- await post(url, body)
      </span>
    ),
  },
  {
    k: "d2",
    t: (
      <span className="block rounded-sm bg-[#0F2E1C] px-1 text-[#7EE2A1]">
        <span className="mr-2 text-white/30">12</span>
        {"+ await withRetry(() => post(url, body), "}
        {"{"}
        {" tries: 4 "}
        {"}"})
      </span>
    ),
  },
  {
    k: "test",
    t: (
      <>
        <span className="inline-block w-12 text-white/45">test</span>
        {"pnpm test webhooks "}
        <span className="text-[#7EE2A1]">· 42 passed</span>
      </>
    ),
  },
  {
    k: "done",
    t: (
      <>
        <span className="inline-block w-12 text-white/45">done</span>
        {"ready for review "}
        <span className="text-white/45">·</span> <span className="text-[#7EE2A1]">+38</span>{" "}
        <span className="text-[#FF8F8F]">−6</span>
      </>
    ),
  },
];

function ShellSurface() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(SHELL_LINES.length + 4, 700, live);
  const shown = live ? Math.min(SHELL_LINES.length, tick) : SHELL_LINES.length;
  const stars = useMemo(() => {
    const random = seededRandom(3);
    return Array.from(
      {
        length: 70,
      },
      () => [random() * 100, random() * 100, random() * 1.4 + 0.4, random() * 0.6 + 0.15],
    );
  }, []);
  return (
    <div ref={ref} className="relative h-full overflow-hidden bg-[#06070A]">
      <svg aria-hidden={true} className="absolute inset-0 h-full w-full">
        {stars.map(([i, o, a, u], i3) => (
          <circle key={i3} cx={`${i}%`} cy={`${o}%`} r={a} fill="#fff" opacity={u} />
        ))}
      </svg>
      <div
        className="absolute left-[7%] right-[-6%] top-[15%] rounded-[14px] bg-[#15171C] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)]"
        style={{
          fontFamily: FONT_MONO,
        }}
      >
        <div className="flex h-9 items-center gap-1.5 border-b border-white/[.06] px-3.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[10px] rounded-full bg-white/15" />
          ))}
          <span className="ml-3 text-[11px] text-white/40">~/acme/web-app</span>
        </div>
        <div className="p-4 text-[11.5px] leading-[1.75] text-white/85 sm:p-5 sm:text-[12.5px]">
          <div className="flex items-end gap-4">
            <div aria-hidden={true} className="grid grid-cols-9 gap-[2px]">
              {SHELL_LOGO.flatMap((i, i3) =>
                Array.from(i).map((a, i) => (
                  <span
                    key={`${i3}-${i}`}
                    className="size-[6px] rounded-[1px]"
                    style={{
                      background: a === "#" ? SPECTRUM[Math.min(3, Math.floor((7 - i3) / 2))] : "transparent",
                      opacity: i3 > 3 ? 0.55 : 1,
                    }}
                  />
                )),
              )}
            </div>
            <div>
              <p className="text-white">
                {"Updraft Shell "}
                <span className="text-white/40">v1.4.2</span>
              </p>
              <p className="text-white/45">Draft 2 · 3 agents idle · /help for commands</p>
            </div>
          </div>
          <div className="mt-4 min-h-[190px] space-y-0.5">
            {SHELL_LINES.slice(0, shown).map((i) => (
              <motion.div
                key={i.k}
                initial={
                  live
                    ? {
                        opacity: 0,
                        x: -6,
                      }
                    : false
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="whitespace-nowrap"
              >
                {i.t}
              </motion.div>
            ))}
            {shown < SHELL_LINES.length && (
              <span
                className="ud-blink inline-block h-[14px] w-[7px] translate-y-[2px]"
                style={{
                  background: SPECTRUM[3],
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LENS_SIGNATURE = [
  [
    ["export async function ", SYN_KEYWORD],
    ["withRetry", SYN_FUNCTION],
    ["<T>(", SYN_PLAIN],
  ],
  [
    ["  fn: () => ", SYN_PLAIN],
    ["Promise", SYN_ADDED],
    ["<T>,", SYN_PLAIN],
  ],
  [
    ["  { tries = ", SYN_PLAIN],
    ["3", SYN_STRING],
    [", base = ", SYN_PLAIN],
    ["200", SYN_STRING],
    [" } = {},", SYN_PLAIN],
  ],
  [
    ["): ", SYN_PLAIN],
    ["Promise", SYN_ADDED],
    ["<T> {", SYN_PLAIN],
  ],
];

const LENS_BODY = [
  [
    ["  for ", SYN_KEYWORD],
    ["(let i = ", SYN_PLAIN],
    ["0", SYN_STRING],
    ["; ; i++) {", SYN_PLAIN],
  ],
  [
    ["    try ", SYN_KEYWORD],
    ["{ ", SYN_PLAIN],
    ["return await ", SYN_KEYWORD],
    ["fn", SYN_FUNCTION],
    ["(); }", SYN_PLAIN],
  ],
  [
    ["    catch ", SYN_KEYWORD],
    ["(e) { ", SYN_PLAIN],
    ["if ", SYN_KEYWORD],
    ["(i >= tries - ", SYN_PLAIN],
    ["1", SYN_STRING],
    [") ", SYN_PLAIN],
    ["throw ", SYN_KEYWORD],
    ["e; }", SYN_PLAIN],
  ],
  [
    ["    await ", SYN_KEYWORD],
    ["sleep", SYN_FUNCTION],
    ["(base * ", SYN_PLAIN],
    ["2", SYN_STRING],
    [" ** i);", SYN_PLAIN],
  ],
  [["  }", SYN_PLAIN]],
];

function LensSurface() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(6, 900, live);
  const accepted = !live || tick >= 3;
  const showDiff = live ? tick >= 1 : true;
  const lines = [...LENS_SIGNATURE, ...(showDiff ? LENS_BODY : []), [["}", SYN_PLAIN]]];
  return (
    <div ref={ref} className="relative h-full overflow-hidden bg-[#F6F6F9]">
      <div
        aria-hidden={true}
        className="absolute -bottom-24 -right-16 size-[420px] rounded-full opacity-60 blur-[70px]"
        style={{
          background: `radial-gradient(circle, ${SPECTRUM[3]}88, ${SPECTRUM[2]}55 40%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden={true}
        className="absolute -left-20 -top-24 size-[360px] rounded-full opacity-50 blur-[70px]"
        style={{
          background: `radial-gradient(circle, ${SPECTRUM[0]}66, transparent 70%)`,
        }}
      />
      <div className="absolute left-[7%] right-[-8%] top-[14%] flex overflow-hidden rounded-[16px] bg-white shadow-[0_0_0_1px_rgba(18,19,23,.06),0_30px_70px_-30px_rgba(18,19,23,.35)]">
        <div
          className="flex w-12 shrink-0 flex-col items-center gap-4 border-r py-4"
          style={{
            borderColor: COLORS.line,
            color: COLORS.faint,
          }}
        >
          <Icon name="ph:files" size={18} />
          <Icon name="ph:magnifying-glass" size={18} />
          <span className="relative">
            <Icon name="ph:git-branch" size={18} />
            <span
              className="absolute -right-2 -top-1.5 rounded-full px-1 text-[9px] font-[600] text-white"
              style={{
                background: SPECTRUM[0],
              }}
            >
              12
            </span>
          </span>
          <span
            style={{
              color: SPECTRUM[1],
            }}
          >
            <Icon name="ph:sparkle" size={18} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="flex h-10 items-center border-b text-[12px]"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <span
              className="flex h-full items-center gap-1.5 border-r px-3 italic"
              style={{
                borderColor: COLORS.line,
                color: COLORS.faint,
              }}
            >
              <Icon name="ph:file-text" size={13} />
              plan.md
            </span>
            <span className="relative flex h-full items-center gap-1.5 px-3 font-[520]">
              <Icon name="ph:file-ts" size={13} className="text-[#3D5AFE]" />
              retry.ts
              <span
                className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{
                  background: SPECTRUM_GRADIENT,
                }}
              />
            </span>
          </div>
          <p
            className="px-4 pt-3 text-[11.5px]"
            style={{
              color: COLORS.faint,
            }}
          >
            {"src "}
            <span className="mx-1">›</span>
            {" lib "}
            <span className="mx-1">›</span>{" "}
            <span
              style={{
                color: COLORS.ink,
              }}
            >
              retry.ts
            </span>
          </p>
          <div
            className="relative px-4 pb-6 pt-2 text-[12px] leading-[1.85] sm:text-[12.5px]"
            style={{
              fontFamily: FONT_MONO,
            }}
          >
            {lines.map((line, i) => {
              const added = i >= LENS_SIGNATURE.length && i < LENS_SIGNATURE.length + (showDiff ? LENS_BODY.length : 0);
              return (
                <motion.div key={i} layout="position" className="flex whitespace-pre">
                  <span
                    className="w-7 shrink-0 select-none text-right tabular-nums"
                    style={{
                      color: "#C5C7CD",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="pl-4">
                    {line.map(([text, color], i) => (
                      <span
                        key={i}
                        className="transition-colors duration-500"
                        style={{
                          color: added && !accepted ? SYN_MUTED : color,
                          fontStyle: added && !accepted ? "italic" : "normal",
                        }}
                      >
                        {text}
                      </span>
                    ))}
                  </span>
                </motion.div>
              );
            })}
            <AnimatePresence>
              {live && showDiff && !accepted && (
                <motion.div
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
                  }}
                  className="absolute bottom-2 right-[14%] flex items-center sm:bottom-auto sm:right-[12%] sm:top-[96px] gap-1.5 rounded-lg bg-[#121317] px-2 py-1 text-[11px] text-white"
                  style={{
                    fontFamily: FONT_SANS,
                  }}
                >
                  <motion.kbd
                    animate={
                      tick === 2
                        ? {
                            scale: [1, 0.86, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.35,
                    }}
                    className="rounded bg-white/15 px-1.5 py-px text-[10.5px]"
                  >
                    Tab
                  </motion.kbd>
                  to accept
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function KitSurface() {
  const uid = "kp" + useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const code = [
    [
      ["from ", SYN_KEYWORD],
      ["updraft ", SYN_PLAIN],
      ["import ", SYN_KEYWORD],
      ["Agent, tools", SYN_PLAIN],
    ],
    [["", SYN_PLAIN]],
    [
      ["agent = ", SYN_PLAIN],
      ["Agent", SYN_FUNCTION],
      ["(", SYN_PLAIN],
    ],
    [
      ["    model=", SYN_PLAIN],
      ['"draft-2"', SYN_STRING],
      [",", SYN_PLAIN],
    ],
    [["    tools=[tools.shell, tools.git],", SYN_PLAIN]],
    [
      ["    verify=", SYN_PLAIN],
      ['"pytest -q"', SYN_STRING],
      [",", SYN_PLAIN],
    ],
    [[")", SYN_PLAIN]],
    [
      ["agent.", SYN_PLAIN],
      ["run", SYN_FUNCTION],
      ["(", SYN_PLAIN],
      ['"upgrade pydantic to v2"', SYN_STRING],
      [")", SYN_PLAIN],
    ],
  ];
  const loop = [
    {
      l: "Plan",
      a: -90,
    },
    {
      l: "Act",
      a: 30,
    },
    {
      l: "Verify",
      a: 150,
    },
  ];
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: "radial-gradient(120% 90% at 80% 90%, #1E2160 0%, #0B0C14 55%, #07080B 100%)",
      }}
    >
      <div
        className="absolute left-[7%] right-[7%] top-[8%] rounded-[14px] bg-white/[.05] p-4 ring-1 ring-inset ring-white/10 backdrop-blur sm:right-auto sm:w-[380px]"
        style={{
          fontFamily: FONT_MONO,
        }}
      >
        <p className="mb-2 text-[10.5px] text-white/40">agent.py</p>
        {code.map((line, i) => (
          <div key={i} className="whitespace-pre text-[11.5px] leading-[1.8] sm:text-[12px]">
            {line.map(([text, color], i) => (
              <span
                key={i}
                style={{
                  color:
                    color === SYN_PLAIN
                      ? "rgba(255,255,255,.82)"
                      : color === SYN_KEYWORD
                        ? "#D59CFF"
                        : color === SYN_FUNCTION
                          ? "#8FA3FF"
                          : color === SYN_STRING
                            ? "#FFB27A"
                            : color,
                }}
              >
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
      <svg
        viewBox="-150 -150 300 300"
        className="absolute bottom-[-8%] right-[-10%] h-[50%] w-auto sm:bottom-[-6%] sm:right-[-4%] sm:h-[62%]"
        aria-hidden={true}
      >
        <defs>
          <linearGradient id={uid + "g"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={SPECTRUM[0]} />
            <stop offset=".5" stopColor={SPECTRUM[1]} />
            <stop offset="1" stopColor={SPECTRUM[3]} />
          </linearGradient>
          <filter id={uid + "b"}>
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <circle r="96" fill="none" stroke={`url(#${uid}g)`} strokeWidth="14" opacity=".45" filter={`url(#${uid}b)`} />
        <path
          id={uid + "p"}
          d="M0,-96 A96,96 0 1,1 -0.1,-96"
          fill="none"
          stroke="rgba(255,255,255,.18)"
          strokeWidth="1.2"
          strokeDasharray="3 5"
        />
        {!reduce && (
          <circle r="5" fill="#fff">
            <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${uid}p`} />
            </animateMotion>
          </circle>
        )}
        {loop.map((node, i) => {
          const x = Math.cos((node.a * Math.PI) / 180) * 96;
          const y = Math.sin((node.a * Math.PI) / 180) * 96;
          return (
            <g key={node.l} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <circle r="24" fill="#0E0F18" stroke="rgba(255,255,255,.2)" />
              <circle
                r="24"
                fill="none"
                stroke={SPECTRUM[i + 1]}
                strokeWidth="2"
                className="ud-node"
                style={{
                  animationDelay: `${i * 1.5}s`,
                }}
              />
              <text y="4" textAnchor="middle" fontSize="11" fill="#fff" fontFamily={FONT_SANS}>
                {node.l}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const SURFACES = [
  {
    id: "desk",
    name: "Updraft Desk",
    short: "Desk",
    body: "Mission control for parallel agents. Run up to twelve tasks at once across local and cloud workspaces, group them into projects and schedule the dull ones for 3am.",
    cta: "Explore Desk",
    Card: DeskSurface,
  },
  {
    id: "shell",
    name: "Updraft Shell",
    short: "Shell",
    body: "A fast, keyboard-first CLI. Start agents, watch their plan stream in, approve commands and pipe results into the tools you already use.",
    cta: "Explore Shell",
    Card: ShellSurface,
  },
  {
    id: "lens",
    name: "Updraft Lens",
    short: "Lens",
    body: "An editor extension that knows your codebase. Inline suggestions, agent hand-offs from any selection and reviews that cite the exact lines they touch.",
    cta: "Explore Lens",
    Card: LensSurface,
  },
  {
    id: "kit",
    name: "Updraft Kit",
    short: "Kit",
    body: "Build your own agents on the harness we use. A few lines of Python or TypeScript gets you planning, tools, sandboxes and evals.",
    cta: "Explore Kit",
    Card: KitSurface,
  },
];

function SurfaceStep({ i: index, onActive }: { i: number; onActive: (index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin: "-46% 0px -46% 0px",
  });
  useEffect(() => {
    if (inView) {
      onActive(index);
    }
  }, [inView, index, onActive]);
  const surface = SURFACES[index];
  return (
    <div ref={ref} id={`surf-${surface.id}`} className="scroll-mt-28">
      <div className="mb-6 lg:hidden">
        <h3 className="text-[30px] font-[470] tracking-[-0.03em]">{surface.name}</h3>
        <ScrubText
          text={surface.body}
          className="mt-2 max-w-[460px] text-[15.5px] leading-[1.55] text-[#4A4D56]"
          wps={22}
        />
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.98,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        viewport={{
          once: true,
          margin: "-8%",
        }}
        transition={{
          duration: 0.9,
          ease: EASE_OUT,
        }}
        className="relative aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[1/1] lg:rounded-[32px]"
      >
        <surface.Card />
      </motion.div>
    </div>
  );
}

export function Surfaces() {
  const [active, setActive] = useState(0);
  const goTo = (index: number) => {
    return document.getElementById(`surf-${SURFACES[index].id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  const onActive = useMemo(() => (index: number) => setActive(index), []);
  return (
    <section id="surfaces" className={`${CONTAINER} scroll-mt-20 pb-24 sm:pb-36`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:hidden">
          <TwoToneHeading a="One crew of agents." b="Four places to meet it." />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-[18vh]">
            <TwoToneHeading a="One crew of agents." b="Four places to meet it." />
            <div className="relative mt-12 pl-6">
              <span
                aria-hidden={true}
                className="absolute bottom-1 left-0 top-1 w-px"
                style={{
                  background: COLORS.line,
                }}
              />
              {SURFACES.map((surface, i) => (
                <div key={surface.id} className="relative py-2.5">
                  {active === i && (
                    <motion.span
                      layoutId="surf-rail"
                      aria-hidden={true}
                      className="absolute bottom-2 left-[-25px] top-2 w-[3px] rounded-full"
                      style={{
                        background: SPECTRUM_VERTICAL,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 34,
                      }}
                    />
                  )}
                  <button
                    onClick={() => goTo(i)}
                    aria-current={active === i}
                    className="ud-ring text-left text-[clamp(24px,2.3vw,32px)] font-[460] tracking-[-0.03em] transition-colors duration-500"
                    style={{
                      color: active === i ? COLORS.ink : "#C2C4CA",
                    }}
                  >
                    {surface.name}
                  </button>
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.div
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
                          duration: 0.5,
                          ease: EASE,
                        }}
                        className="overflow-hidden"
                      >
                        <ScrubText
                          key={surface.id}
                          text={surface.body}
                          className="max-w-[420px] pt-2 text-[15px] leading-[1.6] text-[#4A4D56]"
                          wps={26}
                        />
                        <div className="pb-2 pt-5">
                          <Button kind="light" size="sm" icon="ph:arrow-right" href={`#surf-${surface.id}`}>
                            {surface.cta}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-16 lg:space-y-8">
          {SURFACES.map((surface, i) => (
            <SurfaceStep key={surface.id} i={i} onActive={onActive} />
          ))}
        </div>
      </div>
    </section>
  );
}
