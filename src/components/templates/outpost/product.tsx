"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { Landscape } from "./landscape";
import { CONTAINER, DARK, EASE, FONT_MONO, FONT_SANS, LIGHT } from "./theme";
import { AnimatedNumber, Button, Icon, Reveal, Rover, SectionTitle, useLiveInView } from "./ui";

const FEATURES = [
  {
    t: "Deploy any model",
    d: "Point us at weights on Hugging Face or your own bucket. We build the image, warm the GPUs and hand back one endpoint.",
  },
  {
    t: "Scale with traffic",
    d: "Replicas follow your request rate, from zero overnight to dozens at lunch, without a capacity ticket.",
  },
  {
    t: "Answer from nearby",
    d: "Each request goes to the closest healthy region, so a user in Mumbai never waits on Virginia.",
  },
  {
    t: "Pay for tokens",
    d: "You pay for tokens served, not GPUs sitting idle. Set a hard monthly cap per project.",
  },
];

const FEATURE_DURATION = 6500;

/** The little product card that plays under each feature tab. */
function FeatureDemo({ i: index, live }: { i: number; live: boolean }) {
  const cardClass = "w-[290px] rounded-2xl bg-white p-4 text-left sm:w-[310px]";
  const cardStyle = {
    boxShadow: "0 30px 60px -24px rgba(40,24,10,.55), 0 0 0 1px rgba(0,0,0,.04)",
    fontFamily: FONT_SANS,
  };
  const pill = (label: string, bg: string, color: string) => (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-[600]"
      style={{
        background: bg,
        color,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{
          background: color,
        }}
      />
      {label}
    </span>
  );
  if (index === 0) {
    const steps = [
      ["Pull weights", 9],
      ["Build image", 14],
      ["Warm 4 GPUs", 11],
      ["First token", 2],
    ];
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="flex items-center justify-between">
          <span
            className="text-[12px]"
            style={{
              color: LIGHT.soft,
              fontFamily: FONT_MONO,
            }}
          >
            mistral-small-24b
          </span>
          {pill("Live", "#E6F7F1", LIGHT.ok)}
        </div>
        <p
          className="mt-1 text-[28px] font-[500] tracking-[-0.03em]"
          style={{
            color: LIGHT.ink,
          }}
        >
          <AnimatedNumber value={live ? 36 : 0} />
          <span
            className="ml-1 text-[13px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            sec
          </span>
        </p>
        <ul className="mt-2 space-y-1.5">
          {steps.map(([step, seconds], i) => (
            <motion.li
              key={step}
              initial={{
                opacity: 0,
                x: -6,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.25 + i * 0.28,
              }}
              className="flex items-center gap-2 text-[12px]"
              style={{
                color: LIGHT.ink,
              }}
            >
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  delay: 0.4 + i * 0.28,
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                style={{
                  color: LIGHT.ok,
                }}
              >
                <Icon name="ph:check-circle-fill" size={15} />
              </motion.span>
              {step}
              <span
                className="ml-auto tabular-nums"
                style={{
                  color: LIGHT.soft,
                }}
              >
                {seconds}s
              </span>
            </motion.li>
          ))}
        </ul>
        <p
          className="mt-3 border-t pt-2.5 text-[11px]"
          style={{
            borderColor: LIGHT.line,
            color: LIGHT.soft,
          }}
        >
          From push to first token
        </p>
      </div>
    );
  }
  if (index === 1) {
    const bars = [3, 3, 4, 6, 9, 12, 18, 25, 31, 38, 44, 48];
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="flex items-center justify-between">
          <span
            className="text-[12px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            Active replicas
          </span>
          {pill("Scaling", "#FFF3DF", "#C97A07")}
        </div>
        <p
          className="mt-1 text-[28px] font-[500] tracking-[-0.03em]"
          style={{
            color: LIGHT.ink,
          }}
        >
          <AnimatedNumber value={live ? 48 : 3} />
          <span
            className="ml-1 text-[13px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            H200s
          </span>
        </p>
        <div className="mt-2 flex h-[74px] items-end gap-1">
          {bars.map((height, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-[3px]"
              initial={{
                height: 2,
              }}
              animate={{
                height: `${(height / 48) * 100}%`,
              }}
              transition={{
                delay: 0.15 + i * 0.06,
                type: "spring",
                stiffness: 220,
                damping: 22,
              }}
              style={{
                background: i === bars.length - 1 ? LIGHT.ink : "#E4E3DE",
              }}
            />
          ))}
        </div>
        <div
          className="mt-1 flex justify-between text-[10px]"
          style={{
            color: LIGHT.soft,
            fontFamily: FONT_MONO,
          }}
        >
          <span>11:00</span>
          <span>12:30</span>
        </div>
        <p
          className="mt-2 border-t pt-2.5 text-[11px]"
          style={{
            borderColor: LIGHT.line,
            color: LIGHT.soft,
          }}
        >
          Up from 3 in 52 sec, back to zero by 02:00
        </p>
      </div>
    );
  }
  if (index === 2) {
    const regions: [city: string, ms: number, chosen: boolean][] = [
      ["Mumbai", 44, true],
      ["Singapore", 96, false],
      ["Frankfurt", 151, false],
    ];
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="flex items-center justify-between">
          <span
            className="text-[12px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            Request from Pune
          </span>
          {pill("ap-south", "#E7F1FF", "#2F6FD6")}
        </div>
        <p
          className="mt-1 text-[28px] font-[500] tracking-[-0.03em]"
          style={{
            color: LIGHT.ink,
          }}
        >
          <AnimatedNumber value={live ? 44 : 0} />
          <span
            className="ml-1 text-[13px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            ms
          </span>
        </p>
        <ul className="mt-2 space-y-2">
          {regions.map(([city, ms, chosen], i) => (
            <li key={city} className="text-[12px]">
              <div
                className="flex justify-between"
                style={{
                  color: chosen ? LIGHT.ink : LIGHT.soft,
                }}
              >
                <span>{city}</span>
                <span className="tabular-nums">
                  {ms}
                  {" ms"}
                </span>
              </div>
              <div
                className="mt-1 h-1 rounded-full"
                style={{
                  background: LIGHT.panel,
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${(ms / 160) * 100}%`,
                  }}
                  transition={{
                    delay: 0.2 + i * 0.15,
                    duration: 0.8,
                    ease: EASE,
                  }}
                  style={{
                    background: chosen ? "#2F6FD6" : "#D4D4D8",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p
          className="mt-3 border-t pt-2.5 text-[11px]"
          style={{
            borderColor: LIGHT.line,
            color: LIGHT.soft,
          }}
        >
          Sent to the closest of 8 regions
        </p>
      </div>
    );
  }
  return (
    <div className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between">
        <span
          className="text-[12px]"
          style={{
            color: LIGHT.soft,
          }}
        >
          Spend this month
        </span>
        {pill("Under cap", "#E6F7F1", LIGHT.ok)}
      </div>
      <p
        className="mt-1 text-[28px] font-[500] tracking-[-0.03em]"
        style={{
          color: LIGHT.ink,
        }}
      >
        <AnimatedNumber value={live ? 2148.3 : 0} decimals={2} prefix="$" />
      </p>
      <div
        className="mt-2 flex h-2 overflow-hidden rounded-full"
        style={{
          background: LIGHT.panel,
        }}
      >
        <motion.span
          initial={{
            width: 0,
          }}
          animate={{
            width: "28%",
          }}
          transition={{
            duration: 0.8,
            ease: EASE,
          }}
          style={{
            background: LIGHT.ink,
          }}
        />
        <motion.span
          initial={{
            width: 0,
          }}
          animate={{
            width: "44%",
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: EASE,
          }}
          style={{
            background: "#F6B24B",
          }}
        />
      </div>
      <ul className="mt-2.5 space-y-1 text-[12px]">
        {[
          ["Input tokens", "4.1M", "$612.40", LIGHT.ink],
          ["Output tokens", "880K", "$1,535.90", "#F6B24B"],
        ].map(([label, amount, cost, color]) => (
          <li
            key={label}
            className="flex items-center gap-2"
            style={{
              color: LIGHT.ink,
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{
                background: color,
              }}
            />
            {label}
            <span
              style={{
                color: LIGHT.soft,
              }}
            >
              {amount}
            </span>
            <span className="ml-auto tabular-nums">{cost}</span>
          </li>
        ))}
      </ul>
      <p
        className="mt-3 border-t pt-2.5 text-[11px]"
        style={{
          borderColor: LIGHT.line,
          color: LIGHT.soft,
        }}
      >
        72% of the $3,000 cap
      </p>
    </div>
  );
}

export function Product() {
  const [ref, live, inView] = useLiveInView();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const overall = useMotionValue(0);
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const running = live && !paused;
  useAnimationFrame((_, delta) => {
    if (!running) {
      return;
    }
    let next = progress.get() + Math.min(delta, 100) / FEATURE_DURATION;
    let index = activeRef.current;
    if (next >= 1) {
      next = 0;
      index = (index + 1) % FEATURES.length;
      activeRef.current = index;
      setActive(index);
    }
    progress.set(next);
    overall.set((index + next) / FEATURES.length);
  });
  const select = (i: number) => {
    setActive(i);
    activeRef.current = i;
    progress.set(0);
    overall.set(i / FEATURES.length);
  };
  const railWidth = useTransform(overall, (v) => `${v * 100}%`);
  const railLeft = useTransform(overall, (v) => `calc(${v * 100}% - 17px)`);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);
  return (
    <section id="product" className={`${CONTAINER} pb-28 pt-8`}>
      <Reveal>
        <SectionTitle className="max-w-[660px]">Everything between a checkpoint and an answer</SectionTitle>
      </Reveal>
      <div ref={ref} className="mt-12" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        <div
          className="relative h-[420px] overflow-hidden rounded-[20px] sm:h-[440px]"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,.07)",
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-[150%]"
            animate={{
              x: `${-active * 8}%`,
            }}
            transition={{
              duration: 1.6,
              ease: EASE,
            }}
          >
            <Landscape scene="day" id="op-feat" sun={[880, 170]} />
          </motion.div>
          <div className="absolute inset-0 grid place-items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.97,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.98,
                  filter: "blur(6px)",
                }}
                transition={{
                  duration: 0.45,
                  ease: EASE,
                }}
              >
                <FeatureDemo i={active} live={inView} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-[3px]"
            style={{
              background: "rgba(255,255,255,.35)",
            }}
          >
            <motion.div
              className="h-full"
              style={{
                width: railWidth,
                background: DARK.amber,
              }}
            />
          </div>
          <motion.div
            className="absolute bottom-[3px]"
            style={{
              left: railLeft,
            }}
          >
            <Rover size={34} color="#2A1A12" />
          </motion.div>
        </div>
        <div
          className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4"
          role="tablist"
          aria-label="What Outpost does"
        >
          {FEATURES.map((feature, i) => (
            <button
              key={feature.t}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => select(i)}
              className="group flex flex-col self-start text-left"
            >
              <span
                className="relative block h-px overflow-hidden"
                style={{
                  background: DARK.line2,
                }}
              >
                {i === active ? (
                  <motion.span
                    className="absolute inset-y-0 left-0 block"
                    style={{
                      width: progressWidth,
                      background: DARK.ink,
                    }}
                  />
                ) : (
                  i < active && (
                    <span
                      className="absolute inset-0 block"
                      style={{
                        background: "rgba(255,255,255,.3)",
                      }}
                    />
                  )
                )}
              </span>
              <span
                className="mt-3.5 block text-[14.5px] font-[500] transition-colors"
                style={{
                  color: i === active ? DARK.ink : DARK.soft,
                }}
              >
                {feature.t}
              </span>
              <motion.span
                className="mt-1.5 block text-[13.5px] leading-[1.5]"
                animate={{
                  opacity: i === active ? 1 : 1e-4,
                  height: i === active ? "auto" : 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                }}
                style={{
                  color: DARK.text,
                  overflow: "hidden",
                }}
              >
                {feature.d}
              </motion.span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button icon="ph:arrow-right" href="#build">
            Start deploying
          </Button>
          <a
            href="#cta"
            className="px-2 text-[14px] transition-colors hover:text-white"
            style={{
              color: DARK.text,
            }}
          >
            Talk to an engineer
          </a>
        </div>
      </div>
    </section>
  );
}
