"use client";

import { Icon, type IconName } from "./icons";
import { Section, Reveal } from "./ui";

interface Stat {
  icon: IconName;
  value: string;
  label: string;
}

const STATS: readonly Stat[] = [
  { icon: "waveform_path_ecg", value: "9x", label: "Faster to the root cause" },
  { icon: "bell_fill", value: "62%", label: "Fewer pages in the first month" },
  { icon: "chart_bar", value: "1.2B", label: "Spans handled every day" },
  { icon: "timer", value: "41 min", label: "Saved on every incident" },
];

/** The "Your services already send the data" headline with a band of four headline numbers. */
export function Stats() {
  return (
    <Section>
      <Reveal
        as="h2"
        className="m-0 max-w-[22ch] pt-20 skein-display text-[clamp(26px,3.1vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-[rgb(var(--skein-ink))] sm:pt-28"
      >
        <span className="text-[rgb(var(--skein-faint))]">Your services already send the data.</span> Skein gives you the answer.
      </Reveal>
      <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-12 p-0 py-16 sm:py-20 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <li key={stat.label}>
            {/* Negative delay offsets each icon's hue cycle so they do not change colour in unison. */}
            <span className="skein-hue inline-flex" style={{ animationDelay: `${-index * 1.2}s` }}>
              <Icon name={stat.icon} size={22} />
            </span>
            <Reveal
              as="p"
              delay={index * 0.08}
              className="skein-tnum m-0 mt-6 skein-display text-[clamp(40px,4.4vw,52px)] font-bold leading-none tracking-[-0.03em] text-[rgb(var(--skein-ink))]"
            >
              {stat.value}
            </Reveal>
            <p className="m-0 mt-3 text-[14px] text-[rgb(var(--skein-mute))]">{stat.label}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
