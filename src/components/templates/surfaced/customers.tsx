"use client";

import { COLORS, CONTAINER } from "./theme";
import { Avatar, CountUp, Reveal, SectionHeading } from "./ui";

const TESTIMONIALS = [
  {
    n: "Theo Ruiz",
    r: "Founder, Northbound",
    q: ["It is the first tool that answers the question our board keeps asking: what do assistants say about us?"],
  },
  {
    n: "Ines Duarte",
    r: "Content lead, quillr",
    q: ["The drafted pages surprised me most. They say exactly which fact is missing and from which page."],
  },
  {
    n: "Sam Ito",
    r: "Partner, Rowan & Co",
    q: [
      "We run Surfaced for nine clients. Share of voice is now the first chart in every monthly review.",
      "Clients have stopped asking why an assistant prefers a competitor. They ask what we are fixing next.",
    ],
  },
  {
    n: "Ada Nwosu",
    r: "Marketing lead, Tandem Health",
    q: [
      "We went from not named to cited in Perplexity in eleven days, and the morning check showed which page did it.",
    ],
  },
  {
    n: "Leo Hart",
    r: "CMO, brightlane",
    q: [
      "Setup took less time than writing this. The first check found a price an assistant had been quoting wrong for months.",
    ],
  },
];

export function Customers() {
  return (
    <section id="customers" className={`${CONTAINER} scroll-mt-24 pb-32`}>
      <SectionHeading
        tag="Customers"
        title="Teams that went from unnamed to first"
        sub="Growth, content and agency teams use Surfaced to see where they stand in AI answers, and to climb."
      />
      <div className="mt-12 grid gap-3 md:grid-cols-3">
        <Reveal className="md:row-span-2">
          <div
            className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[24px] p-6"
            style={{
              background: "linear-gradient(180deg,#161618 0%,#141626 55%,#1D2E9C 100%)",
              boxShadow: "inset 0 0 0 1px rgba(143,163,255,.18), 0 40px 80px -40px rgba(75,107,251,.6)",
            }}
          >
            <div
              aria-hidden={true}
              className="absolute -bottom-24 left-1/2 h-60 w-[120%] -translate-x-1/2 rounded-full opacity-70 blur-[60px]"
              style={{
                background: "#3E5BFF",
              }}
            />
            <div className="relative flex items-center gap-2.5">
              <Avatar name="Maya Lind" size={34} />
              <span>
                <span
                  className="block text-[13.5px] font-[600]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  Maya Lind
                </span>
                <span
                  className="block text-[12px]"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  Head of Growth, Calmchair
                </span>
              </span>
            </div>
            <p
              className="relative mt-6 text-[19px] font-[500] leading-[1.4] tracking-[-0.01em]"
              style={{
                color: COLORS.ink,
              }}
            >
              We were missing from every answer in our own category. Surfaced showed us the three pages each assistant
              kept reading, and none of them were ours.
            </p>
            <p
              className="relative mt-4 text-[19px] font-[500] leading-[1.4] tracking-[-0.01em]"
              style={{
                color: COLORS.ink,
              }}
            >
              Two months of fixes later, we are the first name in most answers about booking software for small clinics.
            </p>
            <div className="relative mt-auto pt-10">
              <p className="flex items-baseline gap-3">
                <span
                  className="text-[22px] font-[600] line-through decoration-2"
                  style={{
                    color: "rgba(255,255,255,.45)",
                  }}
                >
                  9%
                </span>
                <CountUp
                  to={38}
                  from={9}
                  suffix="%"
                  className="text-[56px] font-[600] leading-none tabular-nums tracking-[-0.05em] text-white"
                />
              </p>
              <p
                className="mt-2 max-w-[240px] text-[13px] leading-[1.45]"
                style={{
                  color: "rgba(255,255,255,.75)",
                }}
              >
                of assistant answers name Calmchair, 60 days after the first fix
              </p>
            </div>
          </div>
        </Reveal>
        {[TESTIMONIALS.slice(0, 2), TESTIMONIALS.slice(2)].map((column, i) => (
          <div key={i} className="space-y-3">
            {column.map((testimonial, j) => (
              <Reveal key={testimonial.n} delay={0.05 * (j + i + 1)}>
                <figure
                  className="rounded-[22px] p-6 transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    background: COLORS.card,
                    boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                  }}
                >
                  {testimonial.q.map((line, i) => (
                    <blockquote
                      key={i}
                      className={`${i ? "mt-3" : ""} text-[14.5px] leading-[1.6]`}
                      style={{
                        color: "#D4D4D8",
                      }}
                    >
                      {line}
                    </blockquote>
                  ))}
                  <figcaption className="mt-8 flex items-center gap-2.5">
                    <Avatar name={testimonial.n} size={28} />
                    <span>
                      <span
                        className="block text-[13px] font-[600]"
                        style={{
                          color: COLORS.ink,
                        }}
                      >
                        {testimonial.n}
                      </span>
                      <span
                        className="block text-[12px]"
                        style={{
                          color: COLORS.soft,
                        }}
                      >
                        {testimonial.r}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
