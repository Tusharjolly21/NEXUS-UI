"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationPlaybackControls, MotionValue } from "framer-motion";
import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { AssistantIcon } from "./assistants";
import { COLORS, CONTAINER, clamp } from "./theme";
import { Reveal, useIsMobile, useLiveInView } from "./ui";

const ANSWERS = [
  {
    e: "ChatGPT",
    q: "Booking software for a small dental clinic?",
    a: "For two or three chairs, Calmchair is the easiest choice: online booking, text reminders and a cancellation waitlist.",
    pages: true,
    out: "Calmchair named #1",
    good: true,
    when: "Today",
  },
  {
    e: "Claude",
    q: "Best dental scheduling for multi-site groups",
    a: "BookDental handles many locations well. Calmchair suits single clinics and is simpler to set up.",
    src: ["bookdental.com /enterprise", "bookdental.com /compare"],
    out: "Calmchair named #2",
    good: true,
    when: "2 days ago",
  },
  {
    e: "Perplexity",
    q: "Dental app that bills in two currencies",
    a: "ChairDesk and BookDental both support multi-currency invoicing for cross-border practices.",
    src: ["chairdesk.io /currencies", "bookdental.com /billing"],
    out: "Calmchair not named",
    good: false,
    when: "Today",
  },
  {
    e: "Gemini",
    q: "Does Calmchair work with Dentrix?",
    a: "Calmchair offers a two-way sync with Dentrix, so appointments and patient notes stay in step.",
    src: ["calmchair.com /integrations"],
    out: "Calmchair cited as a source",
    good: true,
    when: "Yesterday",
  },
  {
    e: "Google",
    q: "calmchair vs chairdesk",
    a: "Calmchair includes a waitlist and patient self-rescheduling. ChairDesk is cheaper for solo dentists.",
    pages: true,
    out: "Calmchair named #1",
    good: true,
    when: "3 days ago",
  },
  {
    e: "ChatGPT",
    q: "Cheapest dental booking tool",
    a: "ChairDesk starts lowest. Calmchair costs a little more but includes reminders on every plan.",
    src: ["chairdesk.io /pricing", "calmchair.com /pricing"],
    out: "Calmchair named #2",
    good: true,
    when: "Today",
  },
  {
    e: "Claude",
    q: "Dental booking with a patient waitlist",
    a: "Few tools do this well. Calmchair fills cancelled slots from a waitlist automatically.",
    src: ["calmchair.com /waitlist"],
    out: "Calmchair named #1",
    good: true,
    when: "Today",
  },
];

function PageThumb({ tone = 0 }: { tone?: number }) {
  return (
    <div
      className="relative h-[56px] w-[76px] overflow-hidden rounded-md p-1.5"
      style={{
        background: tone ? "#F4F4F5" : "#EEF2FF",
      }}
    >
      <div
        className="h-1 w-8 rounded-full"
        style={{
          background: tone ? "#A1A1AA" : "#4B6BFB",
        }}
      />
      <div className="mt-1 h-1 w-12 rounded-full bg-[#D4D4D8]" />
      <div className="mt-0.5 h-1 w-10 rounded-full bg-[#D4D4D8]" />
      <div
        className="mt-1.5 h-4 rounded"
        style={{
          background: tone ? "#E4E4E7" : "linear-gradient(90deg,#C7D2FE,#93A5FB)",
        }}
      />
    </div>
  );
}

type Answer = (typeof ANSWERS)[number];

function AnswerCard({ a: answer }: { a: Answer }) {
  const parts = answer.a.split(/(Calmchair)/);
  return (
    <div
      className="w-[300px] select-none rounded-[18px] p-4"
      style={{
        background: "linear-gradient(180deg,#1C1C1F,#161618)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 1px rgba(255,255,255,.07), 0 30px 50px -30px rgba(0,0,0,.9)",
      }}
    >
      <div className="flex items-center gap-2 text-[12px]">
        <AssistantIcon n={answer.e} size={18} />
        <span
          className="font-[600]"
          style={{
            color: COLORS.ink,
          }}
        >
          {answer.e}
        </span>
        <span
          className="ml-auto max-w-[60%] truncate rounded-full px-2 py-0.5 text-[10.5px]"
          style={{
            background: "rgba(255,255,255,.07)",
            color: "#D4D4D8",
          }}
        >
          {answer.q}
        </span>
      </div>
      <p
        className="mt-3 text-[12.5px] leading-[1.55]"
        style={{
          color: "#C9C9CF",
        }}
      >
        {parts.map((part, i) =>
          part === "Calmchair" ? (
            <span
              key={i}
              className="rounded px-1 font-[600]"
              style={{
                background: "rgba(61,214,140,.16)",
                color: "#8CF0BE",
              }}
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
      {answer.pages && (
        <div className="mt-3 flex gap-2">
          <PageThumb tone={0} />
          <PageThumb tone={1} />
        </div>
      )}
      {answer.src && (
        <div
          className="mt-3 overflow-hidden rounded-lg"
          style={{
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <p
            className="px-2.5 pt-2 text-[10px]"
            style={{
              color: COLORS.soft,
            }}
          >
            Sources
          </p>
          {answer.src.map((source, i) => {
            const [site, path] = source.split(" ");
            return (
              <p
                key={source}
                className="flex gap-2 px-2.5 py-1 text-[11px]"
                style={{
                  color: COLORS.ink,
                }}
              >
                <span
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {i + 1}
                </span>
                {site}
                <span
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {path}
                </span>
              </p>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span
          className="flex items-center gap-1.5 font-[600]"
          style={{
            color: answer.good ? COLORS.ok : COLORS.bad,
          }}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {answer.out}
        </span>
        <span
          style={{
            color: COLORS.soft,
          }}
        >
          {answer.when}
        </span>
      </div>
    </div>
  );
}

type CarouselCardProps = {
  a: Answer;
  i: number;
  /** shared scroll offset of the whole carousel */
  x: MotionValue<number>;
  /** spacing between cards */
  sp: number;
  /** half the track width */
  half: MotionValue<number>;
};

/** One card on the curved carousel: lifts, tilts, dims and fades with its distance from the centre. */
function CarouselCard({ a: answer, i: index, x: offset, sp, half }: CarouselCardProps) {
  const loop = ANSWERS.length * sp;
  const position = useTransform(offset, (v) => ((((index * sp + v) % loop) + loop) % loop) - loop / 2);
  const t = useTransform([position, half], ([v, halfWidth]: number[]) => clamp(v / (halfWidth + sp * 0.3), -1.4, 1.4));
  const lift = useTransform(t, (v) => v * v * 58);
  const tilt = useTransform(t, (v) => v * 7);
  const turn = useTransform(t, (v) => v * -24);
  const opacity = useTransform(t, (v) => clamp(1.25 - Math.abs(v) * 0.6) * (1 - clamp(Math.abs(v) - 1.05) * 2.5));
  const brightness = useTransform(t, (v) => `brightness(${1 - Math.abs(v) * 0.35})`);
  const zIndex = useTransform(t, (v) => Math.round(100 - Math.abs(v) * 60));
  return (
    <motion.div
      style={{
        x: position,
        y: lift,
        rotateZ: tilt,
        rotateY: turn,
        opacity,
        zIndex,
        filter: brightness,
      }}
      className="absolute left-1/2 top-4 -ml-[150px]"
    >
      <AnswerCard a={answer} />
    </motion.div>
  );
}

export function Answers() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ref, live] = useLiveInView();
  const spacing = useIsMobile() ? 230 : 330;
  const offset = useMotionValue(0);
  const half = useMotionValue(600);
  /** pointer drag in progress: start x, start offset, last time and velocity */
  const dragRef = useRef<{ x0: number; p0: number; t: number; v: number } | null>(null);
  const springRef = useRef<AnimationPlaybackControls | null>(null);
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        half.set(trackRef.current.clientWidth / 2);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [half]);
  useAnimationFrame((_, delta) => {
    if (live && !hovering && !dragRef.current && !springRef.current) {
      offset.set(offset.get() - delta * 0.03);
    }
  });
  return (
    <section className="pb-28">
      <div className={`${CONTAINER} grid gap-6 md:grid-cols-2 md:items-start`}>
        <Reveal>
          <h2
            className="text-[clamp(30px,4vw,44px)] font-[600] leading-[1.08] tracking-[-0.04em]"
            style={{
              color: COLORS.ink,
            }}
          >
            Search got a new front door.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p
            className="max-w-[380px] text-[15px] leading-[1.6] md:justify-self-end"
            style={{
              color: COLORS.text,
            }}
          >
            More buyers now ask an assistant before they open a search page, and the reply names two or three products
            at most. This is what the assistants said about clinic booking software this week.
          </p>
        </Reveal>
      </div>
      <div ref={ref}>
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Recent AI answers. Drag to explore."
          tabIndex={0}
          onKeyDown={(event) => {
            const step = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
            if (step) {
              springRef.current?.stop();
              springRef.current = animate(offset, offset.get() + step * spacing, {
                type: "spring",
                stiffness: 170,
                damping: 24,
                onComplete: () => {
                  springRef.current = null;
                },
              });
            }
          }}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onPointerDown={(event) => {
            springRef.current?.stop();
            springRef.current = null;
            dragRef.current = {
              x0: event.clientX,
              p0: offset.get(),
              t: performance.now(),
              v: 0,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) {
              return;
            }
            const now = performance.now();
            const next = drag.p0 + event.clientX - drag.x0;
            drag.v = ((next - offset.get()) / Math.max(1, now - drag.t)) * 1e3;
            drag.t = now;
            offset.set(next);
          }}
          onPointerUp={() => {
            const drag = dragRef.current;
            dragRef.current = null;
            if (drag) {
              springRef.current = animate(offset, offset.get(), {
                type: "inertia",
                velocity: drag.v,
                power: 0.35,
                timeConstant: 320,
                onComplete: () => {
                  springRef.current = null;
                },
              });
            }
          }}
          className="relative mt-12 h-[330px] cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
          style={{
            perspective: 1200,
          }}
        >
          {ANSWERS.map((answer, i) => (
            <CarouselCard key={i} a={answer} i={i} x={offset} sp={spacing} half={half} />
          ))}
        </div>
      </div>
    </section>
  );
}
