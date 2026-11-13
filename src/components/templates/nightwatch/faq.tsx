"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, DAWN, EASE } from "./theme";
import { Icon, SectionHeading } from "./ui";

const FAQ_GROUPS: [group: string, items: [question: string, answer: string][]][] = [
  [
    "Getting started",
    [
      [
        "How long does setup take?",
        "Most teams connect their alerting and import rotations in under an hour. Nightwatch watches quietly for a week before it is allowed to act on its own.",
      ],
      [
        "Do we have to replace our current pager?",
        "No. Nightwatch can sit in front of your existing paging tool and only forward what needs a human, or replace it entirely when you are ready.",
      ],
      [
        "Is there a free trial?",
        "Team is free for 14 days with every feature. Hobby is free forever for up to five responders.",
      ],
    ],
  ],
  [
    "On call",
    [
      [
        "What can it do without asking?",
        "Only the runbook steps you mark as safe, such as restarting a pod or rolling back to the last good deploy. Anything else waits for a named approver.",
      ],
      [
        "How does it choose who to wake?",
        "It reads your rotations, ownership files and recent history, then pages the person on call who has touched the failing service most recently.",
      ],
      [
        "What if it gets something wrong?",
        "Every action can be undone from the incident in one click, and every decision is explained in the timeline so you can correct it.",
      ],
    ],
  ],
  [
    "Security",
    [
      [
        "Where is our data processed?",
        "In the region you choose: Frankfurt, Virginia or Tokyo. On Scale, the model can run inside your own cloud account.",
      ],
      [
        "Do you train on our incidents?",
        "No. Your incidents are used only to help your own team, and you can delete them at any time.",
      ],
      [
        "Can we see everything it did?",
        "Yes. The audit log records every alert, decision and command with who approved it, and can be streamed to your SIEM.",
      ],
    ],
  ],
];

export function Faq() {
  const [open, setOpen] = useState<string | null>("Getting started-0");
  return (
    <section id="faq" className="mx-auto w-full max-w-[760px] scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32">
      <SectionHeading
        center={true}
        title="Questions, answered"
        sub="If yours is missing, the support team replies within an hour, day or night."
      />
      <div className="mt-12 space-y-10">
        {FAQ_GROUPS.map(([group, items]) => (
          <div key={group}>
            <p
              className="mb-3 px-1 text-[13px] font-[600]"
              style={{
                color: COLORS.soft,
              }}
            >
              {group}
            </p>
            <div className="space-y-1.5">
              {items.map(([question, answer], i) => {
                const id = `${group}-${i}`;
                const isOpen = open === id;
                return (
                  <div
                    key={question}
                    className="rounded-2xl transition-colors duration-300"
                    style={{
                      background: isOpen ? COLORS.card : "transparent",
                      boxShadow: isOpen ? `inset 0 0 0 1px ${COLORS.line2}` : "none",
                    }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="nw-ring flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-[15px] transition-colors hover:bg-white/[.035]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      <span className="flex-1">{question}</span>
                      <motion.span
                        animate={{
                          rotate: isOpen ? 45 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 26,
                        }}
                        style={{
                          color: isOpen ? DAWN[2] : COLORS.soft,
                        }}
                      >
                        <Icon name="ph:plus" size={16} />
                      </motion.span>
                    </button>
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
                            duration: 0.4,
                            ease: EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <p
                            className="px-4 pb-4 text-[14.5px] leading-[1.65]"
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
