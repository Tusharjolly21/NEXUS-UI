"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CHANGELOG } from "./data";
import { COLOR, SPRING } from "./theme";
import { Eyebrow, Headline, Icon, Sand, Section, Sky } from "./ui";

/** The small picture for each release: a sky (or sand) with a sketch of what shipped. */
export function ChangelogArt({ variant }: { variant: number }) {
  const tone = (["aurora", "day", "sand", "dusk"] as const)[variant % 4]!;
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden">
      {tone === "sand" ? <Sand /> : <Sky tone={tone} />}
      <div className="relative w-[78%] scale-90">
        {variant === 0 && (
          <div
            className="rounded-[10px] bg-white p-3 text-[10.5px] leading-snug"
            style={{
              color: COLOR.soft,
              boxShadow: "0 10px 24px -14px rgba(14,17,22,.4)",
            }}
          >
            <b
              className="mb-1 flex items-center gap-1 font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              <span
                style={{
                  color: COLOR.accent,
                }}
              >
                <Icon name="ph:sparkle" size={11} />
              </span>
              Week 39 update
            </b>
            Onboarding is on track. Billing slips three days.
          </div>
        )}
        {variant === 1 && (
          <div className="grid gap-2">
            <div
              className="h-4 w-[60%] rounded-[5px]"
              style={{
                background: COLOR.accent,
              }}
            />
            <svg viewBox="0 0 100 14" className="-my-1 h-3 w-full">
              <path
                d="M60 2 C 70 2, 66 12, 76 12"
                fill="none"
                stroke={COLOR.ink}
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
            </svg>
            <div
              className="ml-[38%] h-4 w-[50%] rounded-[5px] bg-white"
              style={{
                boxShadow: `inset 0 0 0 1.5px ${COLOR.accent}`,
              }}
            />
          </div>
        )}
        {variant === 2 && (
          <div className="grid gap-1.5">
            {[14, 9, 6].map((item) => (
              <div
                className="flex items-center gap-2 rounded-[7px] bg-white px-2 py-1.5 text-[10px]"
                style={{
                  color: COLOR.ink,
                  boxShadow: "0 6px 14px -10px rgba(14,17,22,.5)",
                }}
                key={item}
              >
                <span
                  className="rounded px-1 tabular-nums"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                  }}
                >
                  {item}
                </span>
                <span
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    background: COLOR.panel2,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {variant === 3 && (
          <div
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-2.5 py-2 text-[10px]"
            style={{
              color: COLOR.ink,
              boxShadow: "0 10px 24px -14px rgba(14,17,22,.45)",
            }}
          >
            <Icon name="ph:magnifying-glass" size={11} />
            <span
              className="rounded px-1"
              style={{
                background: COLOR.accentSoft,
                color: COLOR.accent,
              }}
            >
              owner:maya
            </span>
            <span
              className="rounded px-1"
              style={{
                background: COLOR.accentSoft,
                color: COLOR.accent,
              }}
            >
              due:next week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
/** Recent releases as a list; the row under the pointer widens onto a soft panel. */
export function Changelog() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section id="changelog" inner="px-5 py-20 sm:px-16 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[820px]">
          <Eyebrow>Changelog</Eyebrow>
          <div className="mt-4">
            <Headline
              lead="Shipped this month."
              rest="A new release every week."
            />
          </div>
        </div>
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="pl-ring group flex items-center gap-1.5 rounded text-[15px] no-underline outline-none"
          style={{
            color: COLOR.ink,
          }}
        >
          See every update
          <span className="transition-transform group-hover:translate-x-1">
            <Icon name="ph:arrow-right" size={14} />
          </span>
        </a>
      </div>
      <ul
        className="m-0 mt-12 list-none p-0"
        onMouseLeave={() => setOpen(null)}
      >
        {CHANGELOG.map(([date, version, label, title, body], index) => {
          const isOpen = open === index;
          return (
            <motion.li
              onMouseEnter={() => setOpen(index)}
              animate={{
                marginLeft: isOpen ? -28 : 0,
                marginRight: isOpen ? -28 : 0,
                paddingLeft: isOpen ? 28 : 0,
                paddingRight: isOpen ? 28 : 0,
              }}
              transition={SPRING}
              className="relative grid gap-4 py-7 sm:grid-cols-[160px_1fr_auto] sm:gap-8"
              style={{
                borderTop: `1px solid ${COLOR.line}`,
              }}
              key={version}
            >
              <motion.span
                aria-hidden={true}
                className="absolute inset-0 -z-0 rounded-[16px]"
                animate={{
                  opacity: isOpen ? 1 : 0,
                }}
                style={{
                  background: COLOR.panel,
                }}
                transition={{
                  duration: 0.25,
                }}
              />
              <div
                className="relative text-[14px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                {date}
                <div className="mt-2">
                  <span
                    className="rounded-[6px] px-1.5 py-0.5 text-[12px]"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                    }}
                  >
                    v {version}
                  </span>
                </div>
              </div>
              <div className="relative">
                <span
                  className="flex items-center gap-1.5 text-[13px] font-medium"
                  style={{
                    color: COLOR.accent,
                  }}
                >
                  <i
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: COLOR.accent,
                    }}
                  />
                  {label}
                </span>
                <h3
                  className="m-0 mt-2 text-[22px] font-medium tracking-[-0.025em]"
                  style={{
                    color: COLOR.ink,
                  }}
                >
                  {title}
                </h3>
                <p
                  className="m-0 mt-2 max-w-[560px] text-[15px] leading-[1.55]"
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  {body}
                </p>
              </div>
              <motion.div
                className="relative hidden overflow-hidden rounded-[12px] sm:block"
                animate={{
                  width: isOpen ? 300 : 240,
                  height: isOpen ? 180 : 150,
                }}
                transition={SPRING}
                style={{
                  boxShadow: `0 0 0 1px ${COLOR.line}`,
                }}
              >
                <ChangelogArt variant={index} />
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}
