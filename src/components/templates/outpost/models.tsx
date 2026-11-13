"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONTAINER, DARK, EASE, FONT_MONO } from "./theme";
import { Avatar, Button, Icon, Reveal, SectionLabel, SectionTitle } from "./ui";

const MODELS = [
  {
    id: "mistral-small-24b",
    kind: "Fast chat",
    icon: "ph:lightning",
    color: DARK.amber,
    blurb: "Quick answers and tool use. Our default for support and docs.",
    chips: ["32k context", "fp8", "+3 builds"],
    who: "Rhea Okafor",
    q: "Which docs pages close the most tickets?",
    steps: ["Read 1,204 tickets from last week", "Matched them to 86 docs pages"],
    lead: "These pages closed the most tickets:",
    title: "Top pages",
    cols: ["Page", "Tickets", "Share", "Trend"],
    rows: [
      ["Rotate API keys", "212", "18%", "+4%"],
      ["Set a spend cap", "168", "14%", "+9%"],
      ["Add a region", "121", "10%", "−2%"],
      ["Pin a version", "77", "6%", "+1%"],
    ],
  },
  {
    id: "qwen-2.5-coder-32b",
    kind: "Code",
    icon: "ph:code",
    color: DARK.violet,
    blurb: "Completion, review and refactors across a whole repository.",
    chips: ["32k context", "Fill in the middle", "+5 builds"],
    who: "Mateo Silva",
    q: "Why did last night's build fail?",
    steps: ["Read the last 6 CI runs", "Opened src/billing/dates.ts"],
    lead: "One timezone bug breaks these tests:",
    title: "Failing tests",
    cols: ["Test", "File", "Since", "Fix"],
    rows: [
      ["parses ISO dates", "dates.test.ts:42", "a3f9c1", "Pass zone: utc"],
      ["formats due dates", "invoice.test.ts:88", "a3f9c1", "Same fix"],
      ["renders calendar", "calendar.test.tsx:17", "a3f9c1", "Update snapshot"],
      ["exports CSV", "export.test.ts:9", "b71e02", "Flaky, retry"],
    ],
  },
  {
    id: "llama-3.3-70b",
    kind: "General",
    icon: "ph:chat-teardrop-text",
    color: DARK.teal,
    blurb: "A strong all-rounder for writing, summaries and agents.",
    chips: ["128k context", "fp8", "+4 builds"],
    who: "Hana Mori",
    q: "Why did customers cancel in March?",
    steps: ["Read 318 cancellation calls", "Grouped them into 6 reasons"],
    lead: "Four reasons cover most cancellations:",
    title: "Cancellation reasons",
    cols: ["Reason", "Calls", "Share", "vs Feb"],
    rows: [
      ["Price after trial", "94", "30%", "+6%"],
      ["Missing SSO", "61", "19%", "+2%"],
      ["Moved to in-house", "48", "15%", "−3%"],
      ["Latency in APAC", "33", "10%", "−8%"],
    ],
  },
  {
    id: "deepseek-r1-distill-32b",
    kind: "Reasoning",
    icon: "ph:brain",
    color: DARK.rose,
    blurb: "Works through multi-step problems before it answers.",
    chips: ["64k context", "Shows its work", "+2 builds"],
    who: "Felix Brandt",
    q: "Is our Q3 forecast realistic?",
    steps: ["Checked 5 assumptions against last year", "Ran 3 scenarios"],
    lead: "Two assumptions look optimistic:",
    title: "Assumptions",
    cols: ["Assumption", "Plan", "Last year", "Risk"],
    rows: [
      ["Trial to paid", "14%", "9.8%", "High"],
      ["Expansion", "22%", "21%", "Low"],
      ["Churn", "2.1%", "2.4%", "Medium"],
      ["Sales cycle", "34 days", "41 days", "High"],
    ],
  },
  {
    id: "whisper-large-v3",
    kind: "Speech",
    icon: "ph:waveform",
    color: DARK.sky,
    blurb: "Transcribes calls and meetings in 99 languages.",
    chips: ["Audio in", "Timestamps", "+1 build"],
    who: "Zoe Laurent",
    q: "Pull the action items from today's standup",
    steps: ["Transcribed 14 min of audio", "Found 4 commitments"],
    lead: "Four people signed up for something:",
    title: "Action items",
    cols: ["Owner", "Action", "Due", "Said at"],
    rows: [
      ["Arjun", "Ship Sydney routing", "Fri", "02:14"],
      ["Zoe", "Draft pricing email", "Thu", "05:40"],
      ["Mateo", "Fix date tests", "Today", "08:03"],
      ["Hana", "Call the APAC accounts", "Mon", "11:27"],
    ],
  },
];

export function Models() {
  const [active, setActive] = useState(0);
  const model = MODELS[active];
  return (
    <section
      id="models"
      className={`${CONTAINER} grid grid-cols-[minmax(0,1fr)] items-center gap-12 pb-32 pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}
    >
      <div>
        <Reveal>
          <SectionLabel icon="ph:stack">Model catalog</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <SectionTitle>Every open model, ready to serve</SectionTitle>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className="mt-4 max-w-[420px] text-[15.5px] leading-[1.55]"
            style={{
              color: DARK.text,
            }}
          >
            Pick from more than a hundred tuned builds or upload your own weights. Each one runs behind the same API.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button icon="ph:arrow-right" href="#pricing">
              Browse all models
            </Button>
            <Button kind="ghost" href="#cta">
              Upload weights
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <ul
            className="mt-9 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t pt-7 text-[13.5px]"
            style={{
              borderColor: DARK.line,
              color: DARK.text,
            }}
          >
            {[
              ["ph:snowflake", "Cold starts under 2 sec"],
              ["ph:lock-simple", "Private weights"],
              ["ph:cpu", "H100, H200 and L40S"],
              ["ph:faders", "fp8 and int4 builds"],
              ["ph:push-pin", "Pinned versions"],
              ["ph:upload-simple", "Your own fine-tunes"],
            ].map(([label, value]) => (
              <li key={value} className="flex items-center gap-2.5">
                <Icon
                  name={label}
                  size={14}
                  style={{
                    color: DARK.soft,
                  }}
                />
                {value}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div
          className="flex overflow-hidden rounded-[20px]"
          style={{
            background: DARK.card,
            boxShadow: `0 0 0 1px ${DARK.line2}, 0 40px 80px -40px rgba(0,0,0,.9)`,
          }}
        >
          <div
            className="flex flex-col gap-1.5 border-r p-2"
            style={{
              borderColor: DARK.line,
              background: "rgba(0,0,0,.25)",
            }}
            role="tablist"
            aria-label="Models"
            aria-orientation="vertical"
          >
            {MODELS.map((option, i) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={option.id}
                onClick={() => setActive(i)}
                className="relative grid size-10 place-items-center rounded-xl transition-colors"
                style={{
                  color: i === active ? option.color : DARK.soft,
                }}
              >
                {i === active && (
                  <motion.span
                    layoutId="op-rail"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: DARK.raise,
                      boxShadow: `inset 0 0 0 1px ${DARK.line2}`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 36,
                    }}
                  />
                )}
                <Icon name={option.icon} size={18} className="relative" />
              </button>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={model.id}
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
                  duration: 0.3,
                  ease: EASE,
                }}
              >
                <div
                  className="border-b p-5"
                  style={{
                    borderColor: DARK.line,
                  }}
                >
                  <p
                    className="flex items-center gap-2 text-[16px] font-[500]"
                    style={{
                      color: DARK.ink,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    <span
                      style={{
                        color: model.color,
                      }}
                    >
                      <Icon name={model.icon} size={17} />
                    </span>
                    {model.id}
                  </p>
                  <p
                    className="mt-1.5 text-[13.5px]"
                    style={{
                      color: DARK.text,
                    }}
                  >
                    {model.blurb}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11.5px]">
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{
                        background: `${model.color}1F`,
                        color: model.color,
                      }}
                    >
                      {model.kind}
                    </span>
                    {model.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full px-2 py-0.5"
                        style={{
                          background: "rgba(255,255,255,.05)",
                          color: DARK.text,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <p
                    className="flex items-center gap-2 text-[12.5px]"
                    style={{
                      color: DARK.text,
                    }}
                  >
                    <Avatar name={model.who} size={20} />
                    {model.who.split(" ")[0]}
                  </p>
                  <p
                    className="mt-2 w-fit rounded-xl px-3 py-2 text-[13.5px]"
                    style={{
                      background: DARK.raise,
                      color: DARK.ink,
                    }}
                  >
                    {model.q}
                  </p>
                  <p
                    className="mt-4 flex items-center gap-2 text-[12.5px] font-[500]"
                    style={{
                      color: DARK.ink,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    <span
                      style={{
                        color: model.color,
                      }}
                    >
                      <Icon name={model.icon} size={13} />
                    </span>
                    {model.id}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {model.steps.map((step, i) => (
                      <motion.li
                        key={step}
                        initial={{
                          opacity: 0,
                          x: -4,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.15 + i * 0.15,
                        }}
                        className="flex items-center gap-1.5 text-[12px]"
                        style={{
                          color: DARK.soft,
                        }}
                      >
                        <span
                          style={{
                            color: DARK.teal,
                          }}
                        >
                          <Icon name="ph:check" size={11} />
                        </span>
                        {step}
                      </motion.li>
                    ))}
                  </ul>
                  <p
                    className="mt-3 text-[13.5px]"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {model.lead}
                  </p>
                  <p
                    className="mb-2 mt-4 text-[13px] font-[500]"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {model.title}
                  </p>
                  <div
                    className="op-noscroll overflow-x-auto rounded-xl"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${DARK.line}`,
                    }}
                  >
                    <table className="w-full min-w-[440px] text-left text-[12px]">
                      <thead>
                        <tr
                          style={{
                            background: "rgba(255,255,255,.03)",
                          }}
                        >
                          {model.cols.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 font-[500]"
                              style={{
                                color: DARK.text,
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {model.rows.map((row, i) => (
                          <motion.tr
                            key={row[0]}
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1 - i * 0.18,
                            }}
                            transition={{
                              delay: 0.35 + i * 0.1,
                            }}
                            className="border-t"
                            style={{
                              borderColor: DARK.line,
                            }}
                          >
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-3 py-2"
                                style={{
                                  color: j === 0 ? DARK.ink : DARK.text,
                                  fontFamily: j === 1 && model.kind === "Code" ? FONT_MONO : undefined,
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
