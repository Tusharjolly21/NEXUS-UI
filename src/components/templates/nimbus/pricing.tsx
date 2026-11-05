"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "./hooks";
import { AppIcon } from "./app-icon";
import { Icon } from "./icons";
import { BLUE, MUTED, SURFACE } from "./theme";
import { PillButton, Reveal, SectionTitle } from "./ui";

type Plan = {
  name: string;
  price: string;
  per: string;
  note: string;
  features: string[];
  cta: string;
  /** The highlighted plan: dark dusk gradient with a slowly turning ring. */
  featured: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Nimbus",
    price: "Free",
    per: "",
    note: "Everything you need for today.",
    features: ["Current conditions and hourly", "10-day forecast", "Severe weather alerts", "Two saved places"],
    cta: "Download free",
    featured: false,
  },
  {
    name: "Nimbus+",
    price: "$2.99",
    per: "/mo",
    note: "Or $19.99 a year. Free for a month.",
    features: ["Next-hour rain to the minute", "Live radar, 2 hours ahead", "Air quality and pollen", "Unlimited places and widgets"],
    cta: "Try free for a month",
    featured: true,
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const reduced = useReducedMotion();
  const { featured } = plan;
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[28px] p-9"
      style={
        featured
          ? {
              background: "linear-gradient(165deg, #081440 0%, #15388f 55%, #3a72e0 88%, #f3a978 125%)",
              color: "#fff",
              boxShadow: "0 40px 80px -40px rgba(10,30,90,.6)",
            }
          : { background: "#fff" }
      }
    >
      {featured && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ boxShadow: "0 0 0 3px rgba(255,236,203,.7), 0 0 60px 12px rgba(255,200,140,.35), inset 0 0 50px rgba(255,200,140,.25)" }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 40% at 85% 0%, rgba(255,226,180,.22), transparent 70%)" }}
          />
        </>
      )}
      <div className="relative flex items-center gap-3">
        <AppIcon size={44} style={{ filter: featured ? "drop-shadow(0 8px 16px rgba(0,0,0,.35))" : "drop-shadow(0 6px 12px rgba(10,30,90,.25))" }} />
        <div className="text-[21px] font-semibold tracking-[-0.02em]">{plan.name}</div>
      </div>
      <div className="relative mt-5 flex items-baseline gap-1">
        <span className="text-[48px] font-semibold tracking-[-0.04em]">{plan.price}</span>
        <span className="text-[17px]" style={{ color: featured ? "rgba(255,255,255,.7)" : MUTED }}>
          {plan.per}
        </span>
      </div>
      <p className="relative m-0 mt-1 text-[15px]" style={{ color: featured ? "rgba(255,255,255,.75)" : MUTED }}>
        {plan.note}
      </p>
      <ul className="relative m-0 mt-7 grid gap-3 p-0">
        {plan.features.map((feature) => (
          <li key={feature} className="flex list-none items-start gap-3 text-[16px]">
            <Icon name="check" size={16} style={{ color: featured ? "#ffd9a0" : MUTED, marginTop: 3 }} />
            {feature}
          </li>
        ))}
      </ul>
      <div className="relative mt-auto pt-9">
        {featured ? (
          <PillButton light className="w-full">
            {plan.cta}
          </PillButton>
        ) : (
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="nb-ring block rounded-full py-3 text-center text-[17px] no-underline outline-none"
            style={{ color: BLUE, boxShadow: `inset 0 0 0 1px ${BLUE}` }}
          >
            {plan.cta}
          </a>
        )}
      </div>
    </div>
  );
}

/** "Free, or a little extra.": two plans side by side. Prices are sample content. */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-12 px-5 py-28 sm:py-36" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-[880px] text-center">
        <Reveal>
          <SectionTitle>Free, or a little extra.</SectionTitle>
        </Reveal>
        <div className="mt-14 grid gap-5 text-left md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08} className="h-full">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
