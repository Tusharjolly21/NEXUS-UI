"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, EASE } from "./theme";
import { Icon, Reveal, Tag } from "./ui";

const FAQ_GROUPS: [group: string, items: [question: string, answer: string][]][] = [
  [
    "Getting started",
    [
      [
        "Isn’t this just SEO with a new name?",
        "Not quite. SEO tools track where your pages rank. Surfaced tracks what assistants say when buyers ask for a product like yours: whether they name you, cite your pages or leave you out, and which sources they read first. Good SEO still helps, because assistants read many of the same pages. Surfaced shows which ones matter.",
      ],
      [
        "Which questions should we track?",
        "Start with the questions a buyer asks before they ever hear your name, such as “best booking software for a small clinic”. Surfaced suggests a starting list from your site and competitors, and you can edit it any time.",
      ],
      [
        "How long does setup take?",
        "Most teams are done in a few minutes. Add your domain, approve the suggested questions and the first check runs straight away.",
      ],
    ],
  ],
  [
    "How checks work",
    [
      [
        "How do you get answers from each assistant?",
        "Each morning Surfaced asks every question through the official interfaces of each assistant, from several regions, and stores the full answer with its sources.",
      ],
      [
        "Can you guarantee assistants will name us?",
        "No, and nobody honestly can. What Surfaced does is show you exactly why you were left out and what usually changes the answer.",
      ],
      [
        "How quickly do changes show up?",
        "Some assistants pick up a new page within a day or two. Others take a few weeks. The daily check makes the timing visible.",
      ],
    ],
  ],
  [
    "Plans and data",
    [
      [
        "Do you store or train on our data?",
        "Your questions and answers are stored for your history and never used to train any model.",
      ],
      ["Can we change plans later?", "Yes. Move up or down at any time and the difference is prorated."],
      ["Do you work with agencies?", "Yes. The Agency plan includes client workspaces and reports in your own brand."],
    ],
  ],
];

export function Faq() {
  const [open, setOpen] = useState<string | null>("Getting started-0");
  return (
    <section id="faq" className="mx-auto w-full max-w-[740px] scroll-mt-24 px-5 pb-32 sm:px-8">
      <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
        <div>
          <Reveal>
            <Tag>FAQ</Tag>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              className="mt-4 text-[clamp(32px,4.4vw,48px)] font-[600] leading-[1.05] tracking-[-0.045em]"
              style={{
                color: COLORS.ink,
              }}
            >
              Good questions
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              className="mt-3 max-w-[340px] text-[15px] leading-[1.6]"
              style={{
                color: COLORS.text,
              }}
            >
              {"What Surfaced checks, how it gets answers and what happens to your data. Still stuck? "}
              <a
                href="#cta"
                className="font-[500] underline underline-offset-4"
                style={{
                  color: COLORS.ink,
                }}
              >
                Talk to us
              </a>
              .
            </p>
          </Reveal>
        </div>
        <div className="relative hidden h-[130px] sm:block" aria-hidden={true}>
          <motion.span
            initial={{
              opacity: 0,
              y: 6,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.2,
            }}
            className="absolute right-0 top-0 rounded-2xl rounded-br-md px-3 py-1.5 text-[12px] font-[500]"
            style={{
              background: "#EDEDEF",
              color: "#111",
            }}
          >
            Will assistants recommend us?
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              y: 6,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.5,
            }}
            className="absolute left-0 top-[46px] flex items-center gap-1 rounded-xl p-1.5"
            style={{
              background: "#1C1C1F",
              boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            }}
          >
            {["ChatGPT", "Claude", "Perplexity"].map((assistant) => (
              <AssistantIcon key={assistant} n={assistant} size={18} />
            ))}
            <span className="flex gap-0.5 px-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1 rounded-full bg-white"
                  style={{
                    animation: `sf-dots 1.2s ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </span>
          </motion.span>
          <motion.span
            initial={{
              opacity: 0,
              y: 6,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.8,
            }}
            className="absolute bottom-0 right-4 rounded-2xl rounded-bl-md px-3 py-1.5 text-[12px]"
            style={{
              background: "#1C1C1F",
              color: COLORS.ink,
              boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            }}
          >
            Here is what they say today.
          </motion.span>
        </div>
      </div>
      <div className="mt-14 space-y-12">
        {FAQ_GROUPS.map(([group, items]) => (
          <div key={group}>
            <h3
              className="mb-4 text-center text-[19px] font-[500] tracking-[-0.02em]"
              style={{
                color: COLORS.ink,
              }}
            >
              {group}
            </h3>
            <div>
              {items.map(([question, answer], i) => {
                const id = `${group}-${i}`;
                const isOpen = open === id;
                return (
                  <div
                    key={question}
                    className="rounded-[18px] transition-colors duration-300"
                    style={{
                      background: isOpen ? COLORS.card : "transparent",
                      boxShadow: isOpen ? `inset 0 0 0 1px ${COLORS.line}` : `inset 0 -1px 0 ${COLORS.line}`,
                    }}
                  >
                    <h4>
                      <button
                        onClick={() => setOpen(isOpen ? null : id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-4 rounded-[18px] px-4 py-4 text-left text-[14.5px] font-[500]"
                        style={{
                          color: COLORS.ink,
                        }}
                      >
                        <span className="flex-1">{question}</span>
                        <span
                          className="grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300"
                          style={{
                            background: isOpen ? "transparent" : "#EDEDEF",
                            color: isOpen ? COLORS.ink : "#111",
                            boxShadow: isOpen ? "inset 0 0 0 1.5px #EDEDEF" : "none",
                          }}
                        >
                          <Icon name={isOpen ? "ph:minus" : "ph:plus"} size={12} />
                        </span>
                      </button>
                    </h4>
                    <AnimatePresence initial={false}>
                      {isOpen && (
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
                            duration: 0.35,
                            ease: EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <p
                            className="max-w-[560px] px-4 pb-5 text-[14px] leading-[1.7]"
                            style={{
                              color: COLORS.text,
                            }}
                          >
                            {answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
