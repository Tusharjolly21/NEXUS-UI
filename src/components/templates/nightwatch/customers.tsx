"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, CONTAINER, DAWN, EASE } from "./theme";
import { Avatar, Button, Reveal, SectionHeading, SplitHeading, useIsMobile, useLiveInView } from "./ui";

const TESTIMONIALS = [
  {
    q: "First full night of sleep on call week in three years. I checked twice to make sure it was actually running.",
    n: "Ines Duarte",
    r: "SRE, Vantelle",
  },
  {
    q: "It grouped 212 alerts from a bad deploy into one page with the commit attached. I just pressed roll back.",
    n: "Theo Ruiz",
    r: "Platform lead, Corvane",
  },
  {
    q: "Our postmortems used to take a week. Now the draft is better than what we used to finish.",
    n: "Maya Lind",
    r: "Eng manager, tidepool",
  },
  {
    q: "Follow-the-sun used to be a spreadsheet and a prayer. Now Tokyo hands off to Berlin and nobody notices.",
    n: "Kemi Ade",
    r: "Infra, HALDEN",
  },
  {
    q: "The status page updates before support even sees the tickets. Customers have started thanking us during outages.",
    n: "Priya Shah",
    r: "Support lead, quillfeather",
  },
  {
    q: "We cut pages to humans by 71 percent in the first month. The other 29 percent actually needed us.",
    n: "Jonas Berg",
    r: "CTO, brindle&co",
  },
  {
    q: "Runbooks we wrote in 2021 finally get used, because Nightwatch runs them instead of linking them.",
    n: "Sam Ito",
    r: "SRE, OXMOOR",
  },
  {
    q: "On-call is no longer the reason people leave the team. That alone paid for it.",
    n: "Ada Nwosu",
    r: "VP Engineering, Sablewood",
  },
  {
    q: "I was skeptical about anything touching production. The approval steps are exactly where I would put them.",
    n: "Leo Hart",
    r: "Staff engineer, PELLUCID",
  },
  {
    q: "It knew the slow query was ours before we did, and it was polite about it.",
    n: "Nadia Kim",
    r: "Backend, spiralworks",
  },
  {
    q: "New hires take their first on-call shift in week two now. The context is all in the incident.",
    n: "Eli Navarro",
    r: "Eng lead, ardentrail",
  },
  {
    q: "Our median time to resolve went from 34 minutes to under 5. Most of those 5 are the deploy.",
    n: "Hana Reyes",
    r: "SRE, Moth & Lantern",
  },
];

const BUBBLE_SPOTS = [
  [1, 5],
  [23, 1],
  [58, 2],
  [79, 14],
  [0, 39],
  [79, 44],
  [4, 72],
  [26, 76],
  [54, 74],
  [78, 73],
];

function TestimonialBubble({ i: index, focus, onEnter }: { i: number; focus: boolean; onEnter?: () => void }) {
  const testimonial = TESTIMONIALS[index];
  return (
    <motion.figure
      onPointerEnter={onEnter}
      animate={{
        opacity: focus ? 1 : 0.26,
        scale: focus ? 1 : 0.96,
        filter: focus ? "blur(0px)" : "blur(0.6px)",
      }}
      transition={{
        duration: 0.7,
        ease: EASE,
      }}
      className="w-[290px] rounded-2xl p-4"
      style={{
        background: focus ? "#121A36" : COLORS.card,
        boxShadow: focus
          ? `inset 0 0 0 1px ${DAWN[1]}55, 0 30px 60px -25px rgba(255,107,90,.35)`
          : `inset 0 0 0 1px ${COLORS.line}`,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
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
            duration: 0.5,
          }}
        >
          <blockquote
            className="text-[13.5px] leading-[1.55]"
            style={{
              color: COLORS.ink,
            }}
          >
            “{testimonial.q}”
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2.5">
            <Avatar name={testimonial.n} size={28} />
            <span>
              <span
                className="block text-[12.5px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {testimonial.n}
              </span>
              <span
                className="block text-[11.5px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {testimonial.r}
              </span>
            </span>
          </figcaption>
        </motion.div>
      </AnimatePresence>
    </motion.figure>
  );
}

export function Customers() {
  const [ref, live] = useLiveInView("-10% 0px");
  const [slots, setSlots] = useState(() => BUBBLE_SPOTS.map((bubbleSpot, i) => i));
  const [focus, setFocus] = useState(1);
  const [paused, setPaused] = useState(false);
  const wide = useIsMobile(1024);
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    if (!live || paused) {
      return;
    }
    const ORDER = [1, 5, 7, 2, 4, 9, 0, 6, 3, 8];
    let pos = Math.max(0, ORDER.indexOf(focus));
    const timer = window.setInterval(() => {
      pos = (pos + 1) % ORDER.length;
      const slot = ORDER[pos];
      setFocus(slot);
      setSlots((prev) => {
        const used = new Set(prev);
        const free = TESTIMONIALS.map((testimonial, i) => i).filter((k) => !used.has(k));
        if (!free.length) {
          return prev;
        }
        const swapSlot = ORDER[(pos + 4) % ORDER.length];
        const next = prev.slice();
        next[swapSlot] = free[Math.floor(Math.random() * free.length)];
        return next;
      });
      setCursor((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [live, paused, focus]);
  return (
    <section id="customers" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-28">
      <div ref={ref} className="relative mx-auto max-w-[1400px]">
        {wide ? (
          <div className={CONTAINER}>
            <SectionHeading
              center={true}
              title={`Nights we
got back`}
              sub="What on-call engineers say after their first quiet rotation."
            />
            <div className="mt-10 flex min-h-[230px] justify-center">
              <TestimonialBubble i={cursor} focus={true} />
            </div>
            <div className="mt-6 flex justify-center gap-1.5">
              {TESTIMONIALS.map((testimonial, i) => (
                <button
                  key={i}
                  onClick={() => setCursor(i)}
                  aria-label={`Show quote ${i + 1}`}
                  className="nw-ring h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === cursor ? 22 : 6,
                    background: i === cursor ? DAWN[1] : COLORS.line2,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="nw-dots relative h-[820px]"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 90% 85% at 50% 50%, #000 60%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 90% 85% at 50% 50%, #000 60%, transparent 100%)",
            }}
            onPointerLeave={() => setPaused(false)}
          >
            {BUBBLE_SPOTS.map(([x, y], i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <TestimonialBubble
                  i={slots[i]}
                  focus={focus === i}
                  onEnter={() => {
                    setPaused(true);
                    setFocus(i);
                  }}
                />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="pointer-events-auto relative max-w-[460px] px-6 py-10 text-center">
                <div
                  aria-hidden={true}
                  className="absolute -inset-16 -z-10"
                  style={{
                    background: `radial-gradient(closest-side, ${COLORS.night} 55%, transparent)`,
                  }}
                />
                <SplitHeading
                  text={`Nights we
got back`}
                  className="text-[clamp(40px,4.6vw,60px)] font-[560] leading-[1] tracking-[-0.04em]"
                  style={{
                    color: COLORS.ink,
                  }}
                />
                <Reveal delay={0.3}>
                  <p
                    className="mt-4 text-[16px] leading-[1.6]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    What on-call engineers say after their first quiet rotation.
                  </p>
                </Reveal>
                <Reveal delay={0.4} className="mt-7 flex justify-center">
                  <Button icon="ph:arrow-right" href="#pricing">
                    Read the stories
                  </Button>
                </Reveal>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
