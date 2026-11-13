"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, EASE } from "./theme";
import { CountUp, Icon, Panel, Reveal, SectionHeading, useCycle, useLiveInView } from "./ui";

const DRAFT_PARTS = [
  "Calmchair is a booking tool for dental clinics with one to five chairs. It handles online booking, text reminders and a waitlist for cancelled slots.",
  " However, ",
  "it does not connect to Dentrix",
  ", so front desks enter visits twice. Plans start at $59 a month with a two-week free trial.",
];

function ReadDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lensX = useMotionValue(0);
  const lensY = useMotionValue(0);
  const springX = useSpring(lensX, {
    stiffness: 300,
    damping: 30,
  });
  const springY = useSpring(lensY, {
    stiffness: 300,
    damping: 30,
  });
  const ZOOM = 1.7;
  const RADIUS = 58;
  const lensLeft = useTransform(springX, (v) => v - RADIUS);
  const lensTop = useTransform(springY, (v) => v - RADIUS);
  const innerX = useTransform(springX, (v) => -(v * ZOOM - RADIUS));
  const innerY = useTransform(springY, (v) => -(v * ZOOM - RADIUS));
  const [textWidth, setTextWidth] = useState(300);
  const aimAtTarget = () => {
    const box = boxRef.current;
    const target = targetRef.current;
    if (!box || !target) {
      return;
    }
    const boxRect = box.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    lensX.set(targetRect.left - boxRect.left + targetRect.width * 0.45);
    lensY.set(targetRect.top - boxRect.top + targetRect.height / 2);
  };
  useEffect(() => {
    const onResize = () => {
      if (textRef.current) {
        setTextWidth(textRef.current.offsetWidth);
      }
      aimAtTarget();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(aimAtTarget, 60);
    return () => window.clearTimeout(timer);
  }, [textWidth]);
  /** the draft paragraph; inside the lens the weak sentence is shown magnified, outside it is the measured target */
  const draft = (inLens = false) => (
    <p
      className="text-[14px] leading-[1.7]"
      style={{
        color: inLens ? "#E4E4E7" : "#8E8E96",
        width: textWidth,
      }}
    >
      {DRAFT_PARTS[0]}
      <span
        style={{
          color: inLens ? "#FF8A92" : "#C46A71",
        }}
      >
        {DRAFT_PARTS[1]}
      </span>
      <span
        ref={inLens ? undefined : targetRef}
        className="underline decoration-wavy decoration-[1.5px] underline-offset-4"
        style={{
          color: inLens ? "#FF8A92" : "#C46A71",
          textDecorationColor: COLORS.bad,
        }}
      >
        {DRAFT_PARTS[2]}
      </span>
      {DRAFT_PARTS[3]}
    </p>
  );
  return (
    <div
      ref={boxRef}
      className="relative h-full cursor-none overflow-hidden"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        lensX.set(event.clientX - rect.left);
        lensY.set(event.clientY - rect.top);
      }}
      onPointerLeave={aimAtTarget}
      aria-hidden={true}
    >
      <div ref={textRef} className="absolute inset-x-8 top-1/2 -translate-y-1/2">
        {draft()}
      </div>
      <motion.div
        className="pointer-events-none absolute left-0 top-0 overflow-hidden rounded-full"
        style={{
          x: lensLeft,
          y: lensTop,
          width: RADIUS * 2,
          height: RADIUS * 2,
          background: "#141416",
          boxShadow:
            "0 0 0 3px rgba(255,255,255,.85), 0 0 0 5px rgba(0,0,0,.6), inset 0 0 18px rgba(0,0,0,.6), 0 20px 30px -10px rgba(0,0,0,.8)",
        }}
      >
        <motion.div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            x: innerX,
            y: innerY,
            scale: ZOOM,
          }}
        >
          <Connector box={boxRef} base={textRef}>
            {draft(true)}
          </Connector>
        </motion.div>
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,.18), transparent 45%)",
          }}
        />
      </motion.div>
      <motion.span
        className="pointer-events-none absolute left-0 top-0 h-[10px] w-[54px] origin-left rounded-full"
        style={{
          x: useTransform(springX, (v) => v + RADIUS * 0.68),
          y: useTransform(springY, (v) => v + RADIUS * 0.68),
          rotate: 45,
          background: "linear-gradient(180deg,#9A9AA2,#4E4E55)",
        }}
      />
    </div>
  );
}

/** Draws a line from the magnified box down to the matching words in the text below. */
function Connector({
  box,
  base,
  children,
}: {
  box: RefObject<HTMLDivElement | null>;
  base: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [line, setLine] = useState({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    const measure = () => {
      const boxEl = box.current;
      const baseEl = base.current;
      if (!boxEl || !baseEl) {
        return;
      }
      const boxRect = boxEl.getBoundingClientRect();
      const baseRect = baseEl.getBoundingClientRect();
      const baseStyle = getComputedStyle(baseEl);
      setLine({
        x: baseRect.left - boxRect.left + parseFloat(baseStyle.paddingLeft),
        y: baseRect.top - boxRect.top,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (box.current) {
      observer.observe(box.current);
    }
    if (base.current) {
      observer.observe(base.current);
    }
    return () => observer.disconnect();
  }, [box, base]);
  return (
    <div
      style={{
        position: "absolute",
        left: line.x,
        top: line.y,
      }}
    >
      {children}
    </div>
  );
}

function MorningCheckDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(9, 650, live);
  const checked = live ? Math.min(5, tick) : 5;
  const rows: [name: string, result: string, named: boolean][] = [
    ["ChatGPT", "Named #1", true],
    ["Claude", "Cited", true],
    ["Gemini", "Named #2", true],
    ["Google", "Rank 3", true],
    ["Perplexity", "Not named", false],
  ];
  return (
    <div ref={ref} className="flex h-full items-center justify-center p-6">
      <div
        className="w-full max-w-[330px] overflow-hidden rounded-[14px]"
        style={{
          background: "#111113",
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        <div
          className="flex items-center justify-between border-b px-3.5 py-2.5 text-[12px]"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <span
            className="font-[600]"
            style={{
              color: COLORS.ink,
            }}
          >
            {"Morning check "}
            <span
              className="font-[400]"
              style={{
                color: COLORS.soft,
              }}
            >
              7:00
            </span>
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              color: checked === 5 ? COLORS.ink : COLORS.soft,
            }}
          >
            {checked === 5 ? (
              <>
                All checked
                <Icon
                  name="ph:check-circle-fill"
                  size={13}
                  style={{
                    color: COLORS.ok,
                  }}
                />
              </>
            ) : (
              `${checked} of 5`
            )}
          </span>
        </div>
        {rows.map(([name, result, named], i) => (
          <div
            key={name}
            className="flex items-center gap-2.5 border-b px-3.5 py-2.5 text-[12.5px] last:border-0"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <AssistantIcon n={name} size={20} />
            <span
              style={{
                color: COLORS.ink,
              }}
            >
              {name}
            </span>
            <span
              className="ml-auto flex items-center gap-1.5 text-[11.5px] font-[500]"
              style={{
                color: named ? "#D4D4D8" : COLORS.bad,
              }}
            >
              {i < checked ? (
                <motion.span
                  initial={{
                    opacity: 0,
                    x: 6,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: named ? COLORS.ok : COLORS.bad,
                    }}
                  />
                  {result}
                </motion.span>
              ) : i === checked ? (
                <Icon
                  name="ph:circle-notch"
                  size={12}
                  className="sf-spin"
                  style={{
                    color: COLORS.soft,
                  }}
                />
              ) : (
                <span className="h-1.5 w-10 rounded-full bg-white/[.06]" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestDemo() {
  const [ref, live] = useLiveInView();
  const tick = useCycle(6, 900, live);
  const step = live ? tick : 4;
  return (
    <div ref={ref} className="flex h-full items-center justify-center p-6">
      <div
        className="w-full max-w-[330px] overflow-hidden rounded-[14px]"
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
            name="ph:file-text"
            size={13}
            style={{
              color: COLORS.soft,
            }}
          />
          calmchair.com/integrations
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-[600] transition-colors duration-300"
            style={{
              background: step >= 3 ? "#1F9D5A" : "rgba(255,255,255,.08)",
              color: step >= 3 ? "#fff" : COLORS.text,
            }}
          >
            {step >= 3 ? "Applied" : step === 2 ? "Applying…" : "Apply fix"}
          </span>
        </div>
        <div className="space-y-1.5 p-3.5">
          {[70, 88, 52].map((width, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-white/[.07]"
              style={{
                width: `${width}%`,
              }}
            />
          ))}
          <motion.div
            initial={false}
            animate={{
              opacity: step >= 1 ? 1 : 0.3,
            }}
            className="my-3 rounded-lg py-2 pl-3 pr-2"
            style={{
              borderLeft: `2px solid ${step >= 3 ? COLORS.ok : "#8FA3FF"}`,
              background: "rgba(255,255,255,.03)",
            }}
          >
            <p
              className="flex items-center justify-between text-[12px] font-[600]"
              style={{
                color: COLORS.ink,
              }}
            >
              Does Calmchair work with Dentrix?
              <span
                className="flex items-center gap-1 text-[10px] font-[500]"
                style={{
                  color: COLORS.soft,
                }}
              >
                <Icon name="ph:sparkle" size={10} />
                Suggested
              </span>
            </p>
            <p
              className="mt-1 text-[11.5px] leading-[1.5]"
              style={{
                color: COLORS.text,
              }}
            >
              Yes. Calmchair syncs both ways with Dentrix, so visits and notes stay in step.
            </p>
          </motion.div>
          {[80, 60].map((width, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-white/[.07]"
              style={{
                width: `${width}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShareOfVoiceDemo() {
  const [ref, live] = useLiveInView();
  const brands = [
    ["You", 33, "#EDEDEF"],
    ["ChairDesk", 26, "#9A9AA2"],
    ["BookDental", 17, "#5E5E66"],
    ["Others", 24, "#2E2E33"],
  ];
  return (
    <div ref={ref} className="flex h-full flex-col justify-center px-8 py-6">
      <p
        className="text-[12px]"
        style={{
          color: COLORS.soft,
        }}
      >
        Share of voice · clinic booking questions
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <CountUp
          to={33}
          from={24}
          suffix="%"
          run={live}
          className="text-[52px] font-[600] leading-none tabular-nums tracking-[-0.05em]"
          style={{
            color: COLORS.ink,
          }}
        />
        <span
          className="text-[12px] font-[500]"
          style={{
            color: COLORS.ok,
          }}
        >
          +9 pts in 30 days
        </span>
      </p>
      <div className="mt-5 flex h-2 gap-1">
        {brands.map(([name, share, color]) => (
          <motion.span
            key={name}
            className="h-full rounded-full"
            style={{
              background: color,
            }}
            initial={false}
            animate={{
              width: `${share}%`,
            }}
            transition={{
              duration: 1,
              ease: EASE,
            }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
        {brands.map(([name, share, color]) => (
          <span
            key={name}
            className="flex items-center justify-between"
            style={{
              color: name === "You" ? COLORS.ink : COLORS.text,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.2)",
                }}
              />
              {name}
            </span>
            <span className="tabular-nums">{share}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ title, body, children }: { title: ReactNode; body: ReactNode; children: ReactNode }) {
  return (
    <Panel className="flex h-full flex-col">
      <div className="h-[270px]">{children}</div>
      <div className="px-8 pb-8 pt-2 text-center">
        <h3
          className="text-[16px] font-[600] tracking-[-0.01em]"
          style={{
            color: COLORS.ink,
          }}
        >
          {title}
        </h3>
        <span
          className="mx-auto mt-3 block h-px w-10"
          style={{
            background: COLORS.line2,
          }}
        />
        <p
          className="mx-auto mt-3 max-w-[300px] text-[14px] leading-[1.6]"
          style={{
            color: COLORS.text,
          }}
        >
          {body}
        </p>
      </div>
    </Panel>
  );
}

export function Features() {
  return (
    <section id="features" className={`${CONTAINER} scroll-mt-24 pb-32`}>
      <SectionHeading
        tag="Features"
        title="Read every answer about you"
        sub="Surfaced asks what your buyers ask, in every major assistant, each morning. Then it shows you what to change so the answer includes you."
      />
      <div className="mt-12 grid gap-3 md:grid-cols-2">
        <Reveal>
          <FeatureCard
            title="Catch answers that get you wrong"
            body="Every reply that mentions you is read and checked. Out-of-date claims are flagged with the page that caused them."
          >
            <ReadDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.06}>
          <FeatureCard
            title="Every assistant, every morning"
            body="ChatGPT, Claude, Gemini, Perplexity and Google, checked daily with the questions your buyers really type."
          >
            <MorningCheckDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.04}>
          <FeatureCard
            title="Changes, not charts"
            body="Each lost answer comes with the page to edit and a draft of the change. Apply it, and tomorrow’s check shows the result."
          >
            <SuggestDemo />
          </FeatureCard>
        </Reveal>
        <Reveal delay={0.1}>
          <FeatureCard
            title="Win more of the shortlist"
            body="See how often you are named next to competitors, and which sources put them there."
          >
            <ShareOfVoiceDemo />
          </FeatureCard>
        </Reveal>
      </div>
    </section>
  );
}
