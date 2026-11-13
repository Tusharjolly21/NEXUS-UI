"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { COLORS, CONTAINER, DAWN, DAWN_GRADIENT, FONT_MONO } from "./theme";
import { LogoMark, Reveal, SectionHeading, useLiveInView } from "./ui";

const DEVICE_STOPS = [1 / 6, 1 / 2, 5 / 6];

function waveY(x: number) {
  return 40 + 16 * Math.sin((3 * Math.PI * x) / 1e3 - Math.PI / 2);
}

const WAVE_PATH = (() => {
  let d = "";
  for (let x = 0; x <= 1e3; x += 10) {
    d += `${x ? "L" : "M"}${x} ${waveY(x).toFixed(2)} `;
  }
  return d;
})();

function PhoneAlert({ on }: { on: boolean }) {
  return (
    <div className="relative mx-auto h-[150px] w-[104px]">
      <div
        className="absolute inset-x-[26px] -top-2 bottom-[-8px] rounded-[14px]"
        style={{
          background: "linear-gradient(180deg,#1A2240,#0E1430)",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      />
      <div
        className="absolute inset-x-0 top-[22px] h-[112px] rounded-[30px] p-[7px]"
        style={{
          background: "#1B2342",
          boxShadow: "inset 0 0 0 1.5px rgba(150,170,255,.25)",
        }}
      >
        <div className="h-full overflow-hidden rounded-[24px] bg-black p-2.5">
          <AnimatePresence>
            {on && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="flex h-full flex-col"
              >
                <span
                  className="text-[8px] font-[650]"
                  style={{
                    color: COLORS.bad,
                  }}
                >
                  S2 · now
                </span>
                <span className="mt-1 text-[10.5px] font-[600] leading-[1.2] text-white">Checkout is slow</span>
                <span
                  className="mt-auto rounded-full py-1 text-center text-[9px] font-[650] text-[#1C0F09]"
                  style={{
                    background: DAWN_GRADIENT,
                  }}
                >
                  Acknowledge
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span
        className="absolute -right-[3px] top-[56px] h-5 w-[5px] rounded-full"
        style={{
          background: "#2A345A",
        }}
      />
    </div>
  );
}

function WatchAlert({ on }: { on: boolean }) {
  return (
    <div
      className="relative mx-auto h-[220px] w-[112px] rounded-[24px] p-[5px]"
      style={{
        background: "#1B2342",
        boxShadow: "inset 0 0 0 1.5px rgba(150,170,255,.25)",
      }}
    >
      <div
        className="relative h-full overflow-hidden rounded-[20px]"
        style={{
          background: on ? "linear-gradient(180deg,#1E1A3A,#2A1C2E 60%,#3A2026)" : "#05070F",
          transition: "background .6s",
        }}
      >
        <span className="absolute left-1/2 top-1.5 h-3 w-10 -translate-x-1/2 rounded-full bg-black" />
        <AnimatePresence>
          {on && (
            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="mt-8 text-center text-[22px] font-[300] tabular-nums text-white"
            >
              3:12
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {on && (
            <motion.div
              initial={{
                y: -40,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: 0.15,
              }}
              className="absolute inset-x-1.5 top-[84px] rounded-xl bg-white/15 p-2 backdrop-blur"
            >
              <span className="flex items-center gap-1 text-[7.5px] text-white/70">
                <LogoMark size={9} />
                NIGHTWATCH
              </span>
              <span className="mt-0.5 block text-[9px] font-[600] leading-[1.25] text-white">
                Checkout p95 2.4s. Rollback ready.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LaptopAlert({ on }: { on: boolean }) {
  return (
    <div className="relative mx-auto w-[260px]">
      <div
        className="mx-auto h-[160px] w-[232px] rounded-t-[12px] p-[6px]"
        style={{
          background: "#1B2342",
          boxShadow: "inset 0 0 0 1.5px rgba(150,170,255,.25)",
        }}
      >
        <div
          className="relative h-full overflow-hidden rounded-[6px]"
          style={{
            background: on ? COLORS.deep : "#05070F",
            transition: "background .6s",
          }}
        >
          <AnimatePresence>
            {on && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="p-2.5"
              >
                <div className="flex items-center gap-1">
                  <LogoMark size={9} />
                  <span
                    className="text-[7.5px]"
                    style={{
                      color: COLORS.soft,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    INC-2041
                  </span>
                </div>
                <p
                  className="mt-1 text-[10px] font-[600]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  Checkout latency over SLO
                </p>
                <svg viewBox="0 0 200 50" className="mt-1.5 w-full">
                  <path
                    d="M0 40 L40 38 L60 40 L75 12 L95 14 L110 38 L200 39"
                    fill="none"
                    stroke={DAWN[1]}
                    strokeWidth="2"
                  />
                </svg>
                <div className="mt-1 flex gap-1">
                  {["Roll back", "Open runbook"].map((label, i) => (
                    <span
                      key={label}
                      className="rounded px-1.5 py-0.5 text-[7.5px]"
                      style={{
                        background: i ? "rgba(255,255,255,.08)" : DAWN_GRADIENT,
                        color: i ? COLORS.ink : "#1C0F09",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div
        className="h-3 rounded-b-[10px] rounded-t-[2px]"
        style={{
          background: "linear-gradient(180deg,#2A345A,#1B2342)",
        }}
      >
        <span className="mx-auto block h-1 w-12 rounded-b-md bg-black/40" />
      </div>
    </div>
  );
}

export function WakeUp() {
  const reduce = useReducedMotion();
  const [ref, live] = useLiveInView();
  const progress = useMotionValue(0);
  const planeRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [stop, setStop] = useState(reduce ? 1 : -1);
  useEffect(() => {
    if (!live) {
      return;
    }
    const controls = animate(progress, [0, 1.15], {
      duration: 6.2,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [live, progress]);
  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    if (!path) {
      return;
    }
    const length = path.getTotalLength();
    const TRAIL = 120;
    const at = Math.min(1, v) * length;
    planeRef.current?.setAttribute("stroke-dasharray", `${TRAIL} ${length + TRAIL}`);
    planeRef.current?.setAttribute("stroke-dashoffset", String(TRAIL - at));
    const point = path.getPointAtLength(at);
    trailRef.current?.setAttribute("cx", String(point.x));
    trailRef.current?.setAttribute("cy", String(point.y));
    trailRef.current?.setAttribute("opacity", v > 1 ? "0" : "1");
    let reached = -1;
    DEVICE_STOPS.forEach((deviceStop, i) => {
      if (v >= deviceStop && v < deviceStop + 0.3) {
        reached = i;
      }
    });
    setStop((prev) => (prev === reached ? prev : reached));
  });
  const devices = [
    ["On your wrist", "Tap to acknowledge, even mid-run."],
    ["On your phone", "Breaks through Do Not Disturb, only when it should."],
    ["At your desk", "The incident opens with the fix already queued."],
  ];
  return (
    <section ref={ref} className={`${CONTAINER} pb-24 sm:pb-32`}>
      <SectionHeading
        center={true}
        title={`Paged on whatever
is closest`}
        sub="One page, routed to the device you actually have with you, and never to all three at once."
      />
      <div className="relative mt-14 hidden md:block">
        <svg viewBox="0 0 1000 80" className="w-full overflow-visible" aria-hidden={true}>
          <path
            ref={pathRef}
            d={WAVE_PATH}
            fill="none"
            stroke="rgba(150,170,255,.22)"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />
          <path
            ref={planeRef}
            d={WAVE_PATH}
            fill="none"
            stroke={DAWN[1]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="0 2000"
            style={{
              filter: "drop-shadow(0 0 6px rgba(255,142,94,.9))",
            }}
          />
          <circle ref={trailRef} r="4" fill="#FFE2C4" cx="-20" cy="40" />
          {DEVICE_STOPS.map((deviceStop, i) => (
            <g key={i}>
              <circle
                cx={deviceStop * 1e3}
                cy={waveY(deviceStop * 1e3)}
                r={stop === i ? 9 : 6}
                fill={COLORS.night}
                stroke={stop === i ? DAWN[1] : "rgba(150,170,255,.4)"}
                strokeWidth="2"
                style={{
                  transition: "all .4s",
                }}
              />
              <circle
                cx={deviceStop * 1e3}
                cy={waveY(deviceStop * 1e3)}
                r="2.5"
                fill={stop === i ? DAWN[2] : "rgba(150,170,255,.6)"}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-10 grid gap-12 md:mt-6 md:grid-cols-3 md:gap-6">
        {[PhoneAlert, WatchAlert, LaptopAlert].map((Device, i) => (
          <Reveal key={i} delay={i * 0.1} className="flex flex-col items-center text-center">
            <div className="flex h-[230px] items-end">
              <Device on={stop === i || (!live && i === 1)} />
            </div>
            <p
              className="mt-6 text-[15.5px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              {devices[i][0]}
            </p>
            <p
              className="mt-1 max-w-[240px] text-[14px] leading-[1.5]"
              style={{
                color: COLORS.text,
              }}
            >
              {devices[i][1]}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
