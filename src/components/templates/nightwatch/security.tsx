"use client";

import { animate, useReducedMotion } from "framer-motion";
import { COLORS, CONTAINER, DAWN, FONT_MONO } from "./theme";
import { Avatar, GlowCard, Icon, Reveal, useCycle, useLiveInView } from "./ui";

const AUDIT_LOG = [
  "03:12:04  nightwatch  grouped 47 alerts",
  "03:12:09  nightwatch  linked deploy #8812",
  "03:12:20  ines.d      approved rollback",
  "03:12:21  nightwatch  ran runbook checkout-rb",
  "03:12:45  nightwatch  resolved INC-2041",
  "08:30:00  nightwatch  drafted postmortem",
  "09:02:11  theo.r      edited action items",
  "09:15:40  kemi.a      closed INC-2041",
];

export function Security() {
  const reduce = useReducedMotion();
  const regions: [city: string, x: number, y: number][] = [
    ["Frankfurt", 0.53, 0.32],
    ["Virginia", 0.27, 0.38],
    ["Tokyo", 0.85, 0.4],
  ];
  const [ref, live] = useLiveInView();
  const tick = useCycle(3, 1800, live);
  return (
    <section className={`${CONTAINER} pb-24 sm:pb-32`}>
      <div ref={ref} className="grid gap-3 md:grid-cols-3">
        <Reveal>
          <GlowCard className="h-full p-5 sm:p-6">
            <div
              className="relative h-[150px] overflow-hidden rounded-xl"
              style={{
                background: "repeating-linear-gradient(135deg, rgba(150,170,255,.04) 0 1px, transparent 1px 9px)",
              }}
            >
              <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full" aria-hidden={true}>
                <line x1="40" y1="75" x2="260" y2="75" stroke="rgba(150,170,255,.3)" strokeDasharray="3 6">
                  {!reduce && (
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.8s" repeatCount="indefinite" />
                  )}
                </line>
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx="150" cy="75" r="18" fill="none" stroke={DAWN[1]} strokeOpacity=".5">
                    {!reduce && (
                      <>
                        <animate
                          attributeName="r"
                          from="18"
                          to="62"
                          dur="2.4s"
                          begin={`${i * 0.8}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          from=".6"
                          to="0"
                          dur="2.4s"
                          begin={`${i * 0.8}s`}
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </circle>
                ))}
                <rect x="132" y="57" width="36" height="36" rx="10" fill={COLORS.raise} stroke={`${DAWN[1]}88`} />
              </svg>
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  color: DAWN[2],
                }}
              >
                <Icon name="ph:lock-simple" size={16} />
              </span>
              <span className="absolute left-[8%] top-1/2 -translate-y-1/2">
                <Avatar name="Ines Duarte" size={30} />
              </span>
              <span
                className="absolute right-[8%] top-1/2 grid size-[30px] -translate-y-1/2 place-items-center rounded-full"
                style={{
                  background: COLORS.raise,
                  boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                  color: COLORS.text,
                }}
              >
                <Icon name="ph:hard-drives" size={15} />
              </span>
            </div>
            <h3
              className="relative mt-5 text-[15.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Encrypted in transit and at rest
            </h3>
            <p
              className="relative mt-1.5 text-[14px] leading-[1.55]"
              style={{
                color: COLORS.text,
              }}
            >
              Every command Nightwatch runs is signed, scoped and approved by a named human.
            </p>
          </GlowCard>
        </Reveal>
        <Reveal delay={0.08}>
          <GlowCard className="h-full p-5 sm:p-6">
            <div className="relative h-[150px] overflow-hidden rounded-xl">
              <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full" aria-hidden={true}>
                <circle cx="150" cy="150" r="128" fill="none" stroke="rgba(150,170,255,.18)" />
                {[100, 70, 40].map((width, i) => (
                  <ellipse key={i} cx="150" cy="150" rx={width} ry="128" fill="none" stroke="rgba(150,170,255,.14)">
                    {!reduce && (
                      <animate
                        attributeName="rx"
                        values={`${width};${Math.max(4, 128 - width)};${width}`}
                        dur={`${9 + i * 2}s`}
                        repeatCount="indefinite"
                      />
                    )}
                  </ellipse>
                ))}
                {[40, 80, 115].map((r) => (
                  <line key={r} x1="20" x2="280" y1={r} y2={r} stroke="rgba(150,170,255,.1)" />
                ))}
              </svg>
              {regions.map(([city, x, y], i) => (
                <span
                  key={city}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100 + 20}%`,
                  }}
                >
                  <span className="relative grid size-3 place-items-center">
                    {tick === i && (
                      <span
                        className="nw-ping absolute size-3 rounded-full"
                        style={{
                          background: DAWN[1],
                        }}
                      />
                    )}
                    <span
                      className="size-2 rounded-full transition-colors"
                      style={{
                        background: tick === i ? DAWN[2] : "rgba(150,170,255,.5)",
                      }}
                    />
                  </span>
                  <span
                    className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] transition-opacity duration-300 ${tick === i ? "opacity-100" : "opacity-0"}`}
                    style={{
                      background: COLORS.raise,
                      color: COLORS.ink,
                      boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
                    }}
                  >
                    {city}
                  </span>
                </span>
              ))}
            </div>
            <h3
              className="relative mt-5 text-[15.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Your region, your data
            </h3>
            <p
              className="relative mt-1.5 text-[14px] leading-[1.55]"
              style={{
                color: COLORS.text,
              }}
            >
              Pick where incidents are processed and stored. Nothing leaves it, including the model.
            </p>
          </GlowCard>
        </Reveal>
        <Reveal delay={0.16}>
          <GlowCard className="h-full p-5 sm:p-6">
            <div
              className="relative h-[150px] overflow-hidden rounded-xl px-3"
              style={{
                background: "#080D1D",
                WebkitMaskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)",
                maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)",
              }}
            >
              <div
                style={{
                  animation: reduce ? undefined : "nw-up 14s linear infinite",
                }}
              >
                {[...AUDIT_LOG, ...AUDIT_LOG].map((line, i) => (
                  <p
                    key={i}
                    className="whitespace-pre py-1 text-[10.5px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color:
                        line.includes("approved") || line.includes("closed") || line.includes("edited")
                          ? DAWN[2]
                          : COLORS.text,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <h3
              className="relative mt-5 text-[15.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Every action, on the record
            </h3>
            <p
              className="relative mt-1.5 text-[14px] leading-[1.55]"
              style={{
                color: COLORS.text,
              }}
            >
              An append-only audit log your security team can export, stream or simply read.
            </p>
          </GlowCard>
        </Reveal>
      </div>
    </section>
  );
}
