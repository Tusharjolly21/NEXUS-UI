"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, EASE } from "./theme";
import { Avatar, CountUp, Icon, useLiveInView } from "./ui";

const PROMPT_RUNS = [
  {
    q: "best scheduling software for a small dental clinic",
    e: "ChatGPT",
    pos: "#1",
    chg: "+3",
    ans: "For a two or three chair practice, Calmchair is the strongest pick. It books online, sends text reminders and fills cancellations from a waitlist. ChairDesk costs less but has no waitlist. BookDental suits larger groups.",
    src: ["calmchair.com/pricing", "dentaltechreview.com"],
    brands: [
      ["Calmchair", "#1"],
      ["ChairDesk", "#2"],
      ["BookDental", "#3"],
    ],
  },
  {
    q: "dental booking app with text reminders",
    e: "Gemini",
    pos: "#2",
    chg: "+1",
    ans: "ChairDesk and Calmchair both send text reminders. Calmchair also lets patients confirm or move a visit by replying, which cuts no-shows for most clinics.",
    src: ["chairdesk.io", "calmchair.com/reminders"],
    brands: [
      ["ChairDesk", "#1"],
      ["Calmchair", "#2"],
      ["BookDental", "#3"],
    ],
  },
  {
    q: "is Calmchair HIPAA compliant",
    e: "Claude",
    pos: "Cited",
    chg: "New",
    ans: "Yes. Calmchair signs a business associate agreement on every plan, encrypts records at rest and keeps all patient data in the US.",
    src: ["calmchair.com/security"],
    brands: [["Calmchair", "Cited"]],
  },
];

const RUN_STEP_MS = [650, 900, 1900, 450, 900, 450, 3e3];

/** The answer's first `n` words, with the brand highlighted. */
function AnswerText({ text, n: count }: { text: string; n: number }) {
  const words = text.split(" ");
  return (
    <p
      className="text-[12.5px] leading-[1.6]"
      style={{
        color: "#D4D4D8",
      }}
    >
      {words.slice(0, count).map((word, i) => {
        const isBrand = word.replace(/[^A-Za-z]/g, "") === "Calmchair";
        return (
          <span key={i}>
            {isBrand ? (
              <span
                className="rounded px-1 font-[600]"
                style={{
                  background: "rgba(61,214,140,.18)",
                  color: "#8CF0BE",
                }}
              >
                {word}
              </span>
            ) : (
              word
            )}
            {i < count - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}

function TrendLine({ live }: { live: boolean }) {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full max-w-[220px]" aria-hidden={true}>
      <motion.path
        d="M2 38 L28 34 L52 35 L76 28 L100 30 L124 22 L148 20 L172 14 L196 10 L216 5"
        fill="none"
        stroke="#D4D4D8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          pathLength: 0,
        }}
        animate={{
          pathLength: 1,
        }}
        transition={{
          duration: 1.4,
          ease: EASE,
        }}
      />
      <circle cx="216" cy="5" r="3" fill="#fff" />
    </svg>
  );
}

export function Dashboard() {
  const [ref, live] = useLiveInView("-15% 0px");
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(reduce ? 6 : 0);
  const [done, setDone] = useState(reduce ? [0, 1, 2] : []);
  const [words, setWords] = useState(0);
  const current = PROMPT_RUNS[run];
  const wordCount = current.ans.split(" ").length;
  useEffect(() => {
    if (!live) {
      return;
    }
    if (step === 2) {
      // step 2 streams the answer word by word from the start
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWords(0);
      const wordTimer = window.setInterval(
        () => setWords((prev) => (prev >= wordCount ? prev : prev + 1)),
        Math.round(RUN_STEP_MS[2] / wordCount),
      );
      const stepTimer = window.setTimeout(() => setStep(3), RUN_STEP_MS[2] + 100);
      return () => {
        window.clearInterval(wordTimer);
        window.clearTimeout(stepTimer);
      };
    }
    const timer = window.setTimeout(() => {
      if (step === 5) {
        setDone((prev) => (prev.includes(run) ? prev : [...prev, run]));
      }
      if (step < 6) {
        setStep(step + 1);
      } else {
        const next = (run + 1) % PROMPT_RUNS.length;
        if (next === 0) {
          setDone([]);
        }
        setRun(next);
        setStep(0);
        setWords(0);
      }
    }, RUN_STEP_MS[step]);
    return () => window.clearTimeout(timer);
  }, [step, live, run, wordCount]);
  const pickRun = (index: number) => {
    setRun(index);
    setStep(0);
    setWords(0);
  };
  const score = 58 + done.length * 3;
  const shownWords = step >= 3 ? wordCount : step === 2 ? words : 0;
  return (
    <div
      ref={ref}
      className="rounded-[30px] p-2.5 sm:p-3.5"
      style={{
        background: "linear-gradient(180deg,#1C1C1F,#141416)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.06), 0 60px 120px -40px rgba(0,0,0,.9)",
      }}
    >
      <div
        className="overflow-hidden rounded-[22px]"
        style={{
          background: "#111113",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)",
        }}
      >
        <div className="grid md:grid-cols-[170px_minmax(0,1fr)]">
          <aside
            className="hidden flex-col border-r p-3 md:flex"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <div className="flex items-center justify-between px-1.5 py-1">
              <span
                className="flex items-center gap-2 text-[12.5px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                <span
                  className="grid size-5 place-items-center rounded-md text-[10px] font-[800]"
                  style={{
                    background: "#2C6E5A",
                    color: "#E6FFF4",
                  }}
                >
                  C
                </span>
                Calmchair
              </span>
              <Icon
                name="ph:caret-up-down"
                size={11}
                style={{
                  color: COLORS.soft,
                }}
              />
            </div>
            <nav className="mt-4 space-y-0.5 text-[12.5px]">
              {[
                ["ph:squares-four", "Overview"],
                ["ph:chat-text", "Prompts"],
                ["ph:link-simple", "Sources"],
                ["ph:users", "Competitors"],
                ["ph:chart-bar", "Reports"],
              ].map(([icon, label], i) => (
                <span
                  key={label}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{
                    background: i === 1 ? "rgba(255,255,255,.06)" : "transparent",
                    color: i === 1 ? COLORS.ink : COLORS.text,
                  }}
                >
                  <Icon name={icon} size={13} />
                  {label}
                </span>
              ))}
            </nav>
            <span
              className="mt-auto flex items-center gap-2 px-2 py-1.5 text-[12.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              <Icon name="ph:gear-six" size={13} />
              Settings
            </span>
          </aside>
          <div className="min-w-0">
            <div
              className="flex h-12 items-center gap-3 border-b px-4"
              style={{
                borderColor: COLORS.line,
              }}
            >
              <span
                className="flex h-7 w-[min(240px,50%)] items-center gap-2 rounded-lg px-2.5 text-[12px]"
                style={{
                  background: "rgba(255,255,255,.04)",
                  color: COLORS.soft,
                  boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                }}
              >
                <Icon name="ph:magnifying-glass" size={12} />
                Search prompts
              </span>
              <span
                className="ml-auto flex items-center gap-3"
                style={{
                  color: COLORS.soft,
                }}
              >
                <Icon name="ph:bell" size={14} />
                <Icon name="ph:gear-six" size={14} />
                <Avatar name="Maya Lind" size={24} />
              </span>
            </div>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 p-4">
                <div
                  className="flex items-end justify-between gap-4 border-b pb-3"
                  style={{
                    borderColor: COLORS.line,
                  }}
                >
                  <div>
                    <p
                      className="text-[11.5px]"
                      style={{
                        color: COLORS.soft,
                      }}
                    >
                      Visibility score
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <CountUp
                        to={score}
                        from={score - 3}
                        dur={0.8}
                        run={true}
                        className="text-[34px] font-[600] tabular-nums tracking-[-0.04em]"
                        style={{
                          color: COLORS.ink,
                        }}
                      />
                      <span
                        className="whitespace-nowrap text-[11.5px] font-[500]"
                        style={{
                          color: score > 58 ? COLORS.ok : COLORS.soft,
                        }}
                      >
                        {score > 58 ? `+${score - 58} this week` : "Checking"}
                      </span>
                    </p>
                  </div>
                  <TrendLine live={live} />
                </div>
                <div
                  className="mt-2 grid grid-cols-[minmax(0,1fr)_64px_48px] px-2 py-1.5 text-[10.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  <span>Prompt</span>
                  <span>Position</span>
                  <span className="text-right">Change</span>
                </div>
                <ul>
                  {PROMPT_RUNS.map((promptRun, i) => {
                    const isDone = done.includes(i);
                    const isActive = i === run && !isDone;
                    return (
                      <li key={promptRun.q}>
                        <button
                          onClick={() => pickRun(i)}
                          className="grid w-full grid-cols-[minmax(0,1fr)_64px_48px] items-center rounded-lg px-2 py-2.5 text-left text-[12.5px] transition-colors hover:bg-white/[.04]"
                          style={{
                            background: i === run ? "rgba(255,255,255,.05)" : "transparent",
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <AssistantIcon n={promptRun.e} size={18} />
                            <span
                              className="truncate"
                              style={{
                                color: COLORS.ink,
                              }}
                            >
                              {promptRun.q}
                            </span>
                          </span>
                          <span
                            className="flex items-center gap-1.5"
                            style={{
                              color: isDone ? COLORS.ink : COLORS.soft,
                            }}
                          >
                            {isDone ? (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  y: 4,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                className="font-[600]"
                              >
                                {promptRun.pos}
                              </motion.span>
                            ) : isActive ? (
                              <>
                                <Icon name="ph:circle-notch" size={11} className="sf-spin" />
                                Checking
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                          <span
                            className="text-right font-[500]"
                            style={{
                              color: isDone ? (promptRun.chg === "New" ? "#8FA3FF" : COLORS.ok) : COLORS.faint,
                            }}
                          >
                            {isDone ? promptRun.chg : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="grid grid-cols-[minmax(0,1fr)_64px_48px] items-center px-2 py-3">
                      <span className="flex items-center gap-2">
                        <span className="size-[18px] rounded-[5px] bg-white/[.05]" />
                        <span
                          className="h-2 rounded-full bg-white/[.06]"
                          style={{
                            width: `${[56, 44, 64][i]}%`,
                          }}
                        />
                      </span>
                      <span className="h-2 w-6 rounded-full bg-white/[.06]" />
                      <span className="ml-auto h-2 w-5 rounded-full bg-white/[.06]" />
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="flex min-h-[380px] flex-col border-t lg:border-l lg:border-t-0"
                style={{
                  borderColor: COLORS.line,
                }}
                aria-live="polite"
              >
                <div
                  className="flex h-11 items-center gap-2 border-b px-4 text-[12.5px]"
                  style={{
                    borderColor: COLORS.line,
                  }}
                >
                  <AssistantIcon n={current.e} size={18} />
                  <span
                    className="font-[600]"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {current.e}
                  </span>
                  <span
                    className="ml-auto"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {step >= 5 ? `Today · ${current.pos}` : "Checking now"}
                  </span>
                </div>
                <div className="flex-1 space-y-3 p-4">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={run}
                      initial={{
                        opacity: 0,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md px-3 py-2 text-[12.5px]"
                      style={{
                        background: "rgba(255,255,255,.07)",
                        color: COLORS.ink,
                      }}
                    >
                      {current.q.charAt(0).toUpperCase() + current.q.slice(1)}?
                    </motion.div>
                  </AnimatePresence>
                  {step === 1 && (
                    <p className="flex items-center gap-2 text-[12.5px]">
                      <AssistantIcon n={current.e} size={16} />
                      <span className="sf-shimmer font-[500]">Thinking</span>
                    </p>
                  )}
                  {step >= 2 && (
                    <div className="flex gap-2">
                      <AssistantIcon n={current.e} size={16} />
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <AnswerText text={current.ans} n={shownWords} />
                        <AnimatePresence>
                          {step >= 3 && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 4,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              className="flex flex-wrap gap-1.5"
                            >
                              {current.src.map((source, i) => (
                                <span
                                  key={source}
                                  className="rounded-md px-1.5 py-0.5 text-[10.5px]"
                                  style={{
                                    background:
                                      i === 0 && source.startsWith("calmchair")
                                        ? "rgba(61,214,140,.16)"
                                        : "rgba(255,255,255,.06)",
                                    color: i === 0 && source.startsWith("calmchair") ? "#8CF0BE" : COLORS.text,
                                  }}
                                >
                                  {source}
                                </span>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {step >= 4 && (
                          <div>
                            <p
                              className="mb-1.5 text-[10.5px]"
                              style={{
                                color: COLORS.soft,
                              }}
                            >
                              Brands in this answer
                            </p>
                            <ul className="space-y-1">
                              {current.brands.map(([brand, place], i) => (
                                <motion.li
                                  key={brand}
                                  initial={{
                                    opacity: 0,
                                    x: -6,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                  }}
                                  transition={{
                                    delay: i * 0.12,
                                  }}
                                  className="flex items-center justify-between rounded-md px-2 py-1 text-[11.5px]"
                                  style={{
                                    background: brand === "Calmchair" ? "rgba(61,214,140,.14)" : "transparent",
                                    color: brand === "Calmchair" ? "#DFFBEB" : COLORS.text,
                                  }}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className="size-1.5 rounded-full"
                                      style={{
                                        background: brand === "Calmchair" ? COLORS.ok : COLORS.faint,
                                      }}
                                    />
                                    {brand}
                                  </span>
                                  <span className="tabular-nums">{place}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p
                  className="border-t px-4 py-2.5 text-[11px]"
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.soft,
                  }}
                >
                  Next check tomorrow at 7:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
