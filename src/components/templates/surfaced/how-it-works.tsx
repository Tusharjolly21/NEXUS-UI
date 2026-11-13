"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, EASE } from "./theme";
import { Button, Icon, Reveal, SectionHeading, useLiveInView } from "./ui";

function StandingStep() {
  const runs = [
    ["Today", "ChatGPT", "#1"],
    ["Today", "Claude", "#2"],
    ["Today", "Gemini", "#2"],
    ["Today", "Perplexity", "—"],
    ["Yesterday", "ChatGPT", ""],
    ["Yesterday", "Claude", ""],
    ["Yesterday", "Gemini", ""],
    ["2 days ago", "ChatGPT", "#4"],
  ];
  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-hidden rounded-[14px]"
        style={{
          background: "#111113",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-3.5 py-2.5 text-[12px]"
          style={{
            borderColor: COLORS.line,
            color: COLORS.ink,
          }}
        >
          <Icon
            name="ph:magnifying-glass"
            size={12}
            style={{
              color: COLORS.soft,
            }}
          />
          best scheduling software for a small dental clinic
        </div>
        <p
          className="px-3.5 pb-1 pt-3 text-[11px]"
          style={{
            color: COLORS.soft,
          }}
        >
          Run history (142)
        </p>
        {runs.map(([when, assistant, place], i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: -6,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: i * 0.05,
            }}
            className="flex items-center gap-3 px-3.5 py-2 text-[12px]"
            style={{
              background: i === 0 ? "rgba(255,255,255,.04)" : "transparent",
            }}
          >
            <span
              className="w-[72px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {when}
            </span>
            {assistant && place ? (
              <>
                <AssistantIcon n={assistant} size={16} />
                <span
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {assistant}
                </span>
              </>
            ) : (
              <>
                <AssistantIcon n={assistant} size={16} />
                <span className="h-1.5 w-16 rounded-full bg-white/[.07]" />
              </>
            )}
            <span
              className="ml-auto font-[500]"
              style={{
                color: place === "#1" ? COLORS.ok : COLORS.text,
              }}
            >
              {place}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          delay: 0.35,
          duration: 0.5,
          ease: EASE,
        }}
        className="absolute right-[-6px] top-6 w-[min(270px,62%)] rounded-[14px] p-3.5"
        style={{
          background: "#1C1C1F",
          boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 24px 40px -16px rgba(0,0,0,.9)",
        }}
      >
        <p
          className="flex items-center gap-2 text-[11.5px] font-[600]"
          style={{
            color: COLORS.ink,
          }}
        >
          <AssistantIcon n="ChatGPT" size={16} />
          <span className="truncate">ChatGPT · best scheduling…</span>
          <span
            className="ml-auto font-[400]"
            style={{
              color: COLORS.soft,
            }}
          >
            7:00
          </span>
        </p>
        <p
          className="mt-3 text-[10.5px]"
          style={{
            color: COLORS.soft,
          }}
        >
          Brands in this answer
        </p>
        {(
          [
            ["Calmchair", "Online booking, reminders, waitlist. From $59 a month", true],
            ["ChairDesk", "Cheapest for solo dentists", false],
            ["BookDental", "Built for multi-site groups", false],
          ] as [string, string, boolean][]
        ).map(([brand, note, isYou]) => (
          <div
            key={brand}
            className="mt-1.5 rounded-lg px-2.5 py-1.5"
            style={{
              background: isYou ? "rgba(61,214,140,.12)" : "transparent",
            }}
          >
            <p
              className="text-[12px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              {brand}
              {isYou && (
                <span
                  className="ml-1.5 text-[10.5px] font-[500]"
                  style={{
                    color: COLORS.ok,
                  }}
                >
                  You
                </span>
              )}
            </p>
            <p
              className="text-[10.5px]"
              style={{
                color: COLORS.text,
              }}
            >
              {note}
            </p>
          </div>
        ))}
        <p
          className="mt-3 text-[10.5px]"
          style={{
            color: COLORS.soft,
          }}
        >
          Searches it ran (3)
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {["dental booking app", "calmchair vs chairdesk", "clinic waitlist software"].map((query) => (
            <span
              key={query}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px]"
              style={{
                background: "rgba(255,255,255,.06)",
                color: COLORS.text,
              }}
            >
              <Icon name="ph:magnifying-glass" size={9} />
              {query}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function WriteStep() {
  const [lines, setLines] = useState(0);
  const sentences = [
    "Calmchair and ChairDesk both book online and send reminders.",
    "The difference shows up when a patient cancels.",
    "Calmchair texts your waitlist straight away, and the slot is usually filled within the hour.",
    "ChairDesk leaves the gap for the front desk to fill by phone.",
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setLines((prev) => Math.min(sentences.length, prev + 1)), 700);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="grid h-full gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
      <div
        className="overflow-hidden rounded-[14px] p-4"
        style={{
          background: "#111113",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <p
          className="flex items-center gap-2 text-[11px]"
          style={{
            color: COLORS.soft,
          }}
        >
          <Icon name="ph:pencil-simple" size={12} />
          Draft · calmchair.com/compare/chairdesk
        </p>
        <p
          className="mt-3 text-[17px] font-[600] tracking-[-0.02em]"
          style={{
            color: COLORS.ink,
          }}
        >
          Calmchair vs ChairDesk for small clinics
        </p>
        <div className="mt-3 space-y-2">
          {sentences.map((sentence, i) => (
            <motion.p
              key={i}
              initial={false}
              animate={{
                opacity: i < lines ? 1 : 0.15,
              }}
              className="text-[12.5px] leading-[1.55]"
              style={{
                color: "#C9C9CF",
              }}
            >
              {i < lines ? sentence : <span className="block h-2 w-[80%] rounded-full bg-white/[.07]" />}
            </motion.p>
          ))}
        </div>
        <div
          className="mt-4 h-16 rounded-lg"
          style={{
            background: "rgba(255,255,255,.03)",
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <div
            className="grid h-full grid-cols-3 text-center text-[10.5px]"
            style={{
              color: COLORS.text,
            }}
          >
            {["Waitlist", "Text reminders", "Dentrix sync"].map((tag) => (
              <span
                key={tag}
                className="grid place-items-center border-r last:border-0"
                style={{
                  borderColor: COLORS.line,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        className="rounded-[14px] p-3.5"
        style={{
          background: "#1C1C1F",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <p
          className="text-[11.5px] font-[600]"
          style={{
            color: COLORS.ink,
          }}
        >
          Why this page
        </p>
        <ul
          className="mt-2.5 space-y-2.5 text-[11.5px] leading-[1.45]"
          style={{
            color: COLORS.text,
          }}
        >
          <li className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40" />
            ChatGPT read chairdesk.io/compare in 3 of 5 answers.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40" />
            You have no page that compares the two.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40" />
            Buyers ask about cancellations twice as often.
          </li>
        </ul>
      </div>
    </div>
  );
}

function PublishStep() {
  const [published, setPublished] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPublished(true), 900);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-hidden rounded-[14px]"
        style={{
          background: "#111113",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-3.5 py-2.5 text-[11.5px]"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <span
            className="rounded px-1.5 text-[10px] font-[600]"
            style={{
              background: COLORS.okBg,
              color: COLORS.ok,
            }}
          >
            Live
          </span>
          <span
            style={{
              color: COLORS.text,
            }}
          >
            calmchair.com/compare/chairdesk
          </span>
          <span
            className="ml-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-[600]"
            style={{
              background: "#1F9D5A",
              color: "#fff",
            }}
          >
            <Icon name="ph:check" size={10} />
            Published
          </span>
        </div>
        <div className="p-4">
          <p
            className="text-[16px] font-[600] tracking-[-0.02em]"
            style={{
              color: COLORS.ink,
            }}
          >
            Calmchair vs ChairDesk for small clinics
          </p>
          {[86, 72, 80].map((width, i) => (
            <div
              key={i}
              className="mt-2 h-1.5 rounded-full bg-white/[.07]"
              style={{
                width: `${width}%`,
              }}
            />
          ))}
          <div className="mt-4 h-20 w-[55%] rounded-lg bg-white/[.04]" />
        </div>
      </div>
      <AnimatePresence>
        {published && (
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            className="absolute right-3 top-14 w-[min(260px,70%)] rounded-[14px] p-3.5"
            style={{
              background: "#1C1C1F",
              boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 24px 40px -16px rgba(0,0,0,.9)",
            }}
          >
            <p
              className="flex justify-between text-[11.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Next check
              <span
                className="font-[400]"
                style={{
                  color: COLORS.soft,
                }}
              >
                Tomorrow 7:00
              </span>
            </p>
            {[
              ["ChatGPT", "#3", "#1"],
              ["Claude", "Not named", "Cited"],
              ["Perplexity", "Not named", "#2"],
            ].map(([assistant, before, after], i) => (
              <motion.p
                key={assistant}
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25 + i * 0.15,
                }}
                className="mt-2.5 flex items-center gap-2 text-[11.5px]"
              >
                <AssistantIcon n={assistant} size={16} />
                <span
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {assistant}
                </span>
                <span
                  className="ml-auto line-through"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {before}
                </span>
                <span
                  className="font-[600]"
                  style={{
                    color: COLORS.ok,
                  }}
                >
                  {after}
                </span>
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STEPS = [
  {
    t: "See where you stand",
    d: "Surfaced asks your buyers’ questions in every assistant and shows who gets named, why, and the searches the assistant ran first.",
    D: StandingStep,
  },
  {
    t: "Write what’s missing",
    d: "For every question you lose, it drafts the page that would change the answer, with the reasons it chose that page.",
    D: WriteStep,
  },
  {
    t: "Publish and check again",
    d: "Push the page to your site in one click. The next morning’s check shows whether the answer moved.",
    D: PublishStep,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [ref, live] = useLiveInView();
  const progress = useMotionValue(0);
  useEffect(() => {
    progress.set(0);
    if (!live) {
      return;
    }
    const controls = animate(progress, 1, {
      duration: 6.5,
      ease: "linear",
      onComplete: () => setActive((prev) => (prev + 1) % STEPS.length),
    });
    return () => controls.stop();
  }, [active, live, progress]);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);
  const current = STEPS[active];
  return (
    <section id="how" className={`${CONTAINER} scroll-mt-24 pb-32`}>
      <SectionHeading
        tag={
          <>
            <Icon name="ph:circle-notch" size={11} />
            How it works
          </>
        }
        title="From missing to mentioned"
        sub="Surfaced finds the questions where an assistant picks someone else, drafts the page that would change its mind, and checks again after you publish."
      />
      <Reveal delay={0.15} className="mt-7 flex justify-center gap-2.5">
        <Button kind="primary" href="#cta">
          Check your visibility
        </Button>
        <Button kind="dark" href="#cta">
          Book a demo
        </Button>
      </Reveal>
      <Reveal delay={0.1}>
        <div
          ref={ref}
          className="mt-12 grid overflow-hidden rounded-[28px] md:grid-cols-[280px_minmax(0,1fr)]"
          style={{
            background: COLORS.card,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <div
            role="tablist"
            aria-label="Steps"
            className="flex flex-col border-b md:border-b-0 md:border-r"
            style={{
              borderColor: COLORS.line,
            }}
          >
            {STEPS.map((step, i) => (
              <button
                key={step.t}
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`relative px-5 py-4 text-left ${i === 0 ? "" : "border-t"} ${active === i ? "md:flex-1" : ""}`}
                style={{
                  borderColor: COLORS.line,
                }}
              >
                <span
                  className="flex items-baseline gap-3 text-[14px] font-[600]"
                  style={{
                    color: active === i ? COLORS.ink : COLORS.soft,
                  }}
                >
                  <span
                    className="tabular-nums text-[12px]"
                    style={{
                      color: active === i ? COLORS.text : COLORS.faint,
                    }}
                  >
                    0{i + 1}
                  </span>
                  {step.t}
                </span>
                <AnimatePresence initial={false}>
                  {active === i && (
                    <motion.p
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
                        duration: 0.35,
                        ease: EASE,
                      }}
                      className="overflow-hidden pl-[34px] pt-3 text-[13.5px] leading-[1.6]"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      {step.d}
                    </motion.p>
                  )}
                </AnimatePresence>
                {active === i && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-px"
                    style={{
                      background: COLORS.line,
                    }}
                  >
                    <motion.span
                      className="block h-full"
                      style={{
                        width: progressWidth,
                        background: "#EDEDEF",
                      }}
                    />
                  </span>
                )}
              </button>
            ))}
          </div>
          <div
            className="relative min-h-[400px] p-4 sm:p-6"
            style={{
              background: "radial-gradient(80% 60% at 70% 0%, rgba(75,107,251,.08), transparent 70%)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="h-full"
                initial={{
                  opacity: 0,
                  y: 10,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  filter: "blur(4px)",
                }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                }}
              >
                <current.D />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
