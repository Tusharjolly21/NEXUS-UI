"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, Reveal } from "./ui";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Do we need to change our instrumentation?",
    answer:
      "No. Skein reads OpenTelemetry, so your existing SDKs and collectors work as they are. Point your exporter at Skein and traces start arriving within seconds.",
  },
  {
    question: "How does Ask know what our services do?",
    answer:
      "It reads the spans, logs and metrics you send, along with service names and deploy history. Every answer links to the traces it came from, so you can check the evidence yourself.",
  },
  {
    question: "What does it cost?",
    answer:
      "Pricing follows the spans you keep, not the hosts you run. The free plan keeps 50 million spans a month for 14 days.",
  },
  {
    question: "Where is our data stored?",
    answer:
      "In the region you choose: the US, the EU or Asia-Pacific. Data is encrypted in transit and at rest, and you can drop sensitive attributes before they leave your network.",
  },
  {
    question: "Can Skein page our on-call engineers?",
    answer:
      "Yes. Watches send to PagerDuty, Opsgenie, Slack or any webhook, with the trace that triggered them attached.",
  },
];

const TOGGLE_BAR_INDEXES = [0, 1, 2, 3, 4] as const;

/** Five-dot toggle icon: the dots collapse into a single bar (a minus) when open. */
function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative flex h-4 w-6 items-center justify-between">
      {TOGGLE_BAR_INDEXES.map((barIndex) => (
        <motion.span
          key={barIndex}
          className="block h-[3px] rounded-full bg-current"
          initial={false}
          animate={
            open
              ? {
                  width: barIndex === 2 ? 14 : 3,
                  x: (2 - barIndex) * 4.5,
                  opacity: barIndex === 2 ? 1 : 0,
                }
              : { width: 3, x: 0, opacity: 0.8 }
          }
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 26,
            delay: open ? Math.abs(2 - barIndex) * 0.03 : 0,
          }}
        />
      ))}
    </span>
  );
}

/** Frequently asked questions as an accordion where only one answer is open at a time. */
export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
  const idPrefix = useId();
  return (
    <Section id="faq">
      <div className="grid grid-cols-1 gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <Reveal
            as="h2"
            className="m-0 skein-display text-[clamp(30px,3vw,38px)] font-bold tracking-[-0.025em] text-[rgb(var(--skein-ink))]"
          >
            Questions engineers ask
          </Reveal>
          <p className="m-0 mt-4 max-w-[26em] text-[15px] leading-[1.6] text-[rgb(var(--skein-mute))]">
            Something else? The documentation covers setup, pricing and security in detail.
          </p>
        </div>
        <ul className="m-0 list-none border-t border-solid border-[rgb(var(--skein-line)/.09)] p-0">
          {FAQ_ITEMS.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={question} className="border-b border-solid border-[rgb(var(--skein-line)/.09)]">
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${idPrefix}-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className={`flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-medium transition-colors ${isOpen ? "text-[rgb(var(--skein-ink))]" : "text-[rgb(var(--skein-ink)/.85)] hover:text-[rgb(var(--skein-ink))]"}`}
                  >
                    {question}
                    <span className={isOpen ? "text-[rgb(var(--skein-ink))]" : "text-[rgb(var(--skein-faint))]"}>
                      <ToggleIcon open={isOpen} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${idPrefix}-${index}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 36,
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 max-w-[38em] pb-6 pr-10 text-[14px] leading-[1.65] text-[rgb(var(--skein-mute))]">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
