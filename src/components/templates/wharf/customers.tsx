"use client";

import { Fragment, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { CUSTOMER_LOGOS, MONTHS, VOLUME, formatVolume } from "./data";
import { COLOR, CONTAINER } from "./theme";
import { Avatar, Icon, Mono, Reveal, SectionTitle, TextLink, useCountUp } from "./ui";
export function Customers() {
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(statsRef, {
    once: true,
    amount: 0.5,
  });
  const billions = useCountUp(4.2, inView, 1);
  const countries = useCountUp(61, inView);
  const teams = useCountUp(400, inView, 0, 1.2);
  return (
    <section id="customers" className="scroll-mt-20 py-24 sm:py-32">
      <div className={CONTAINER}>
        <div className="max-w-[860px]">
          <SectionTitle
            title="380+ teams move money on Wharf"
            rest="across wallets, exchanges, payroll apps and treasuries."
          />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {CUSTOMER_LOGOS.map(([name, icon], index) => (
            <Reveal delay={index * 0.05} key={name}>
              <span
                className="flex items-center gap-2 text-[16px] font-medium tracking-[-0.02em]"
                style={{
                  color: "#7D8087",
                }}
              >
                <Icon name={icon} size={17} />
                {name}
              </span>
            </Reveal>
          ))}
        </div>
        <div ref={statsRef} className="mt-14 grid gap-6 sm:grid-cols-3">
          {(
            [
              [
                "Settled",
                <Fragment key="fragment-46">
                  ${billions}
                  <span
                    style={{
                      color: COLOR.faint,
                    }}
                  >
                    B
                  </span>
                </Fragment>,
              ],
              [
                "Transfers",
                <Fragment key="fragment-59">
                  {countries}
                  <span
                    style={{
                      color: COLOR.faint,
                    }}
                  >
                    M
                  </span>
                </Fragment>,
              ],
              [
                "Median quote",
                <Fragment key="fragment-72">
                  <span
                    style={{
                      color: COLOR.faint,
                    }}
                  >
                    {"<"}
                  </span>
                  {teams}
                  <span
                    className="text-[0.5em]"
                    style={{
                      color: COLOR.faint,
                    }}
                  >
                    {" "}
                    ms
                  </span>
                </Fragment>,
              ],
            ] as const
          ).map(([label, value], index) => (
            <div
              className="pl-0 sm:pl-6"
              style={{
                borderLeft: index ? `1px solid ${COLOR.line}` : undefined,
              }}
              key={index}
            >
              <div
                className="text-[13px]"
                style={{
                  color: COLOR.soft,
                }}
              >
                {label}
              </div>
              <div
                className="mt-1 text-[44px] font-medium tracking-[-0.04em] tabular-nums"
                style={{
                  color: COLOR.ink,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <VolumeChart />
      </div>
    </section>
  );
}
/** Cumulative settled volume as an area chart: drawn in once on screen, with a reading under the pointer. */
export function VolumeChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, {
    once: true,
    amount: 0.4,
  });
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 1000;
  const H = 300;
  const PAD = 36;
  const MAX = 4400;
  const xAt = (month: number) => PAD + (month / (VOLUME.length - 1)) * (W - PAD * 2);
  const yAt = (value: number) => H - 24 - (value / MAX) * (H - 44);
  const line = VOLUME.map(
    (value, month) => `${month ? "L" : "M"}${xAt(month).toFixed(1)} ${yAt(value).toFixed(1)}`,
  ).join(" ");
  const area = `${line} L${xAt(VOLUME.length - 1)} ${H - 24} L${xAt(0)} ${H - 24} Z`;
  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * W;
    setHovered(Math.max(0, Math.min(VOLUME.length - 1, Math.round(((x - PAD) / (W - PAD * 2)) * (VOLUME.length - 1)))));
  };
  const shown = hovered ?? VOLUME.length - 1;
  return (
    <div ref={chartRef} className="relative mt-12">
      <div
        className="flex items-center justify-between text-[12.5px]"
        style={{
          color: COLOR.soft,
        }}
      >
        <span className="flex items-center gap-2">
          <i
            className="h-[2px] w-4"
            style={{
              background: COLOR.blue,
            }}
          />
          Cumulative settled volume
        </span>
        <span>Oct 2024 – Sep 2026</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 block h-auto w-full touch-none"
        role="img"
        tabIndex={0}
        aria-label={`Cumulative settled volume. ${MONTHS[shown]}: ${formatVolume(VOLUME[shown])}. Use the left and right arrow keys to read each month.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
        onKeyDown={(x) => {
          if (x.key === "ArrowLeft") {
            setHovered(Math.max(0, shown - 1));
          }
          if (x.key === "ArrowRight") {
            setHovered(Math.min(VOLUME.length - 1, shown + 1));
          }
        }}
        style={{
          outline: "none",
        }}
      >
        <defs>
          <pattern id="wf-dots" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r=".9" fill={COLOR.blue} />
          </pattern>
          <linearGradient id="wf-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="wf-mask">
            <rect width={W} height={H} fill="url(#wf-fade)" />
          </mask>
        </defs>
        {[1000, 2000, 3000, 4000].map((x) => (
          <g key={x}>
            <line x1={PAD} x2={W - PAD} y1={yAt(x)} y2={yAt(x)} stroke={COLOR.line} />
            <text x={PAD} y={yAt(x) - 6} fontSize="11" fill={COLOR.soft}>
              {formatVolume(x)}
            </text>
          </g>
        ))}
        <motion.path
          d={area}
          fill="url(#wf-dots)"
          mask="url(#wf-mask)"
          initial={{
            opacity: 0,
          }}
          animate={
            inView
              ? {
                  opacity: 0.55,
                }
              : {}
          }
          transition={{
            duration: 1.2,
            delay: 0.6,
          }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={COLOR.blue}
          strokeWidth="2.2"
          strokeLinejoin="round"
          initial={{
            pathLength: 0,
          }}
          animate={
            inView
              ? {
                  pathLength: 1,
                }
              : {}
          }
          transition={{
            duration: 1.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        {[0, 3, 6, 9, 12, 15, 18, 21].map((x) => (
          <text x={xAt(x)} y={H - 4} fontSize="11" fill={COLOR.soft} textAnchor={x ? "middle" : "start"} key={x}>
            {MONTHS[x].replace(" 20", " ’")}
          </text>
        ))}
        <line
          x1={xAt(shown)}
          x2={xAt(shown)}
          y1={8}
          y2={H - 24}
          stroke={hovered === null ? "transparent" : "rgba(17,18,20,.25)"}
        />
        <motion.circle
          cx={xAt(shown)}
          cy={yAt(VOLUME[shown])}
          r="5"
          fill={hovered === null ? COLOR.blue : "#fff"}
          stroke={COLOR.blue}
          strokeWidth="2"
          initial={{
            scale: 0,
          }}
          animate={
            inView
              ? {
                  scale: 1,
                }
              : {}
          }
          transition={{
            delay: 1.8,
          }}
        />
      </svg>
      <AnimatePresence>
        {hovered !== null && (
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
            className="pointer-events-none absolute top-8 rounded-[10px] bg-white px-3 py-2 text-[12.5px]"
            style={{
              left: `clamp(0px, calc(${(xAt(shown) / W) * 100}% - 80px), calc(100% - 180px))`,
              boxShadow: `0 0 0 1px ${COLOR.line}, 0 10px 24px -12px rgba(17,18,20,.3)`,
            }}
          >
            <div
              style={{
                color: COLOR.soft,
              }}
            >
              {MONTHS[shown]}
            </div>
            <div className="mt-0.5">
              <b
                className="font-semibold"
                style={{
                  color: COLOR.ink,
                }}
              >
                {formatVolume(VOLUME[shown])}
              </b>{" "}
              <span
                style={{
                  color: COLOR.soft,
                }}
              >
                settled to date
              </span>
            </div>
            <div
              style={{
                color: COLOR.soft,
              }}
            >
              +{formatVolume(VOLUME[shown] - (VOLUME[shown - 1] ?? 0))} that month
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function Testimonial() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const inView = useInView(quoteRef, {
    once: true,
    amount: 0.5,
  });
  const days = useCountUp(11, inView);
  const percent = useCountUp(100, inView);
  return (
    <section className="pb-24 sm:pb-32">
      <div className={CONTAINER}>
        <Reveal>
          <figure
            ref={quoteRef}
            className="m-0 grid overflow-hidden rounded-[24px] bg-white p-2 lg:grid-cols-[1.2fr_1fr]"
            style={{
              boxShadow: `0 0 0 1px ${COLOR.line}, 0 30px 60px -40px rgba(17,18,20,.3)`,
            }}
          >
            <div className="p-6 sm:p-10">
              <blockquote
                className="m-0 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.2] tracking-[-0.03em]"
                style={{
                  color: COLOR.ink,
                }}
              >
                &ldquo;We replaced three bridges and a spreadsheet with one Wharf call.&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <Avatar name="Mara Ilic" size={40} />
                <span className="text-[14px] leading-tight">
                  <b
                    className="block font-medium"
                    style={{
                      color: COLOR.ink,
                    }}
                  >
                    Mara Ilic
                  </b>
                  <span
                    style={{
                      color: COLOR.soft,
                    }}
                  >
                    Head of Payments, Tessellate
                  </span>
                </span>
              </figcaption>
              <div className="mt-7">
                <TextLink>Read the story</TextLink>
              </div>
            </div>
            <div
              className="flex flex-col justify-between rounded-[18px] p-6 sm:p-8"
              style={{
                background: "#F1F2F4",
              }}
            >
              <span
                className="flex items-center gap-2 text-[14px] font-medium"
                style={{
                  color: COLOR.soft,
                }}
              >
                <Icon name="ph:squares-four" size={15} />
                Tessellate
              </span>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {(
                  [
                    [days, "s", "Median settlement"],
                    [percent, "%", "On-time payouts in Q3"],
                  ] as const
                ).map(([value, unit, label]) => (
                  <div key={label}>
                    <div
                      className="text-[52px] font-medium leading-none tracking-[-0.05em] tabular-nums"
                      style={{
                        color: COLOR.ink,
                      }}
                    >
                      {value}
                      <sup
                        className="ml-0.5 text-[18px]"
                        style={{
                          color: COLOR.soft,
                        }}
                      >
                        {unit}
                      </sup>
                    </div>
                    <Mono
                      className="mt-2 block text-[11px] uppercase tracking-[0.06em]"
                      style={{
                        color: COLOR.soft,
                      }}
                    >
                      {label}
                    </Mono>
                  </div>
                ))}
              </div>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
