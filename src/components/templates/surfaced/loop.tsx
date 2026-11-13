"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ASSISTANTS, AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, EASE } from "./theme";
import { CountUp, Icon, Panel, Reveal, useCycle, useLiveInView } from "./ui";

export function Loop() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(6, 700, live);
  const cards: [visual: ReactNode, figure: ReactNode, caption: string][] = [
    [
      <div key="a" className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {Object.keys(ASSISTANTS).map((name, i) => (
            <span key={name} className="relative">
              <AssistantIcon n={name} size={26} ring={true} />
              {(!live || i < tick) && (
                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full"
                  style={{
                    background: "#1F9D5A",
                    boxShadow: "0 0 0 2px #141416",
                  }}
                >
                  <Icon
                    name="ph:check"
                    size={8}
                    style={{
                      color: "#fff",
                    }}
                  />
                </motion.span>
              )}
            </span>
          ))}
        </div>
        <span
          className="text-[10.5px]"
          style={{
            color: COLORS.soft,
          }}
        >
          Checked today at 7:00
        </span>
      </div>,
      <CountUp key="count" to={5} />,
      "assistants checked every morning",
    ],
    [
      <div key="b" className="w-full space-y-1.5">
        {["dental booking app", "calmchair vs chairdesk", "clinic waitlist software"].map((query, i) => (
          <p
            key={query}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px]"
            style={{
              background: "rgba(255,255,255,.04)",
              color: i <= tick ? COLORS.ink : COLORS.soft,
            }}
          >
            <Icon name="ph:magnifying-glass" size={9} />
            {query}
          </p>
        ))}
      </div>,
      <CountUp key="count" to={250} />,
      "questions tracked on every plan",
    ],
    [
      <div key="c" className="w-full px-1">
        <div
          className="relative h-px"
          style={{
            background: COLORS.line2,
          }}
        >
          <span className="absolute -left-0.5 -top-[3px] size-[7px] rounded-full bg-white" />
          <motion.span
            className="absolute -top-[3px] size-[7px] rounded-full"
            style={{
              background: COLORS.ok,
            }}
            initial={false}
            animate={{
              left: live ? `${Math.min(100, tick * 25)}%` : "100%",
            }}
            transition={{
              duration: 0.6,
              ease: EASE,
            }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[10.5px]">
          <span
            style={{
              color: COLORS.ink,
            }}
          >
            Published
            <br />
            <span
              style={{
                color: COLORS.soft,
              }}
            >
              Tue 10:12
            </span>
          </span>
          <span
            className="text-right"
            style={{
              color: COLORS.ink,
            }}
          >
            Checked
            <br />
            <span
              style={{
                color: COLORS.ok,
              }}
            >
              #3 → #1
            </span>
          </span>
        </div>
      </div>,
      <>
        <CountUp to={24} />
        <span
          className="ml-1 text-[16px] font-[500]"
          style={{
            color: COLORS.text,
          }}
        >
          h
        </span>
      </>,
      "from a published fix to the next check",
    ],
    [
      <div key="d" className="space-y-1.5">
        {["Add calmchair.com", "Pick 50 questions", "Run the first check"].map((step, i) => (
          <p
            key={step}
            className="flex items-center gap-2 text-[11.5px]"
            style={{
              color: COLORS.ink,
            }}
          >
            <span
              className="grid size-3.5 place-items-center rounded-full transition-colors duration-300"
              style={{
                background: !live || i < tick ? "#1F9D5A" : "rgba(255,255,255,.1)",
              }}
            >
              {(!live || i < tick) && (
                <Icon
                  name="ph:check"
                  size={8}
                  style={{
                    color: "#fff",
                  }}
                />
              )}
            </span>
            {step}
          </p>
        ))}
      </div>,
      <>
        <span
          className="mr-1 text-[14px] font-[500]"
          style={{
            color: COLORS.text,
          }}
        >
          Under
        </span>
        <CountUp to={3} />
        <span
          className="ml-1 text-[16px] font-[500]"
          style={{
            color: COLORS.text,
          }}
        >
          min
        </span>
      </>,
      "to set up, with nothing to install",
    ],
  ];
  return (
    <section ref={ref} className={`${CONTAINER} pb-32`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([visual, figure, caption], i) => (
          <Reveal key={caption} delay={i * 0.06}>
            <Panel className="h-full p-2">
              <div
                className="flex h-[118px] items-center justify-center rounded-[18px] px-4"
                style={{
                  background: "#111113",
                  boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                }}
              >
                {visual}
              </div>
              <div className="px-3 pb-3 pt-4">
                <p
                  className="flex items-baseline text-[40px] font-[600] leading-none tabular-nums tracking-[-0.05em]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {figure}
                </p>
                <p
                  className="mt-2 text-[13.5px] leading-[1.45]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {caption}
                </p>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
