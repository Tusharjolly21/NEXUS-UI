"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { RAILS, type Rail } from "./data";
import { COLOR, CONTAINER } from "./theme";
import { Mono, Reveal, SectionTitle, TextLink } from "./ui";
export function Rails() {
  return (
    <section id="rails" className="scroll-mt-20 py-24 sm:py-32">
      <div className={CONTAINER}>
        <div
          className="flex flex-wrap items-end justify-between gap-6 pb-10"
          style={{
            borderBottom: `1px solid ${COLOR.line}`,
          }}
        >
          <SectionTitle title="Four rails." rest="One integration." />
          <div className="max-w-[340px]">
            <p
              className="m-0 text-[15.5px]"
              style={{
                color: COLOR.text,
              }}
            >
              Each rail works alone. Together they&rsquo;re one call.
            </p>
            <div className="mt-2">
              <TextLink>Compare the APIs</TextLink>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {RAILS.map((rail, index) => (
            <RailCard rail={rail} index={index} key={rail.n} />
          ))}
        </div>
      </div>
    </section>
  );
}
/** One rail: its illustration wakes up while the card is pointed at, or when it scrolls into view. */
export function RailCard({ rail, index }: { rail: Rail; index: number }) {
  const [hot, setHot] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, {
    amount: 0.4,
  });
  const Art = rail.Art;
  return (
    <Reveal delay={(index % 2) * 0.08}>
      <div
        ref={cardRef}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        className="relative flex flex-col items-center rounded-[24px] px-6 pb-8 pt-6 text-center transition-colors duration-300"
        style={{
          background: hot ? "#EEF0F3" : "#F1F2F4",
        }}
      >
        <Mono
          className="absolute right-6 top-5 text-[11px]"
          style={{
            color: COLOR.faint,
          }}
        >
          #{index + 1}
        </Mono>
        <div className="aspect-[19/12] w-full max-w-[380px]">
          <Art hot={hot} on={inView} />
        </div>
        <h3
          className="m-0 mt-4 text-[22px] font-medium tracking-[-0.02em]"
          style={{
            color: COLOR.ink,
          }}
        >
          {rail.n}
        </h3>
        <span
          className="my-4 block h-px w-24"
          style={{
            background: COLOR.line2,
          }}
        />
        <p
          className="m-0 text-[15px]"
          style={{
            color: COLOR.text,
          }}
        >
          {rail.d}
        </p>
        <div className="mt-4">
          <TextLink>{rail.n}</TextLink>
        </div>
      </div>
    </Reveal>
  );
}
