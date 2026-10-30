import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRICING } from "./data";
import { COLORS, Button, Section, SectionHead, CARD } from "./ui";

function PriceDigits({ value }: { value: number }) {
  return (
    <span
      className="relative inline-flex h-[52px] overflow-hidden text-[48px] font-semibold leading-[52px] tabular-nums tracking-[-0.045em] text-[#f3efe9]"
      aria-live="polite"
    >
      <span>$</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.honey}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 flex-none"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <Section id="pricing" className="py-24 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHead title={PRICING.title} body={PRICING.body} />
        <div className="flex items-center gap-3">
          <div
            className="flex rounded-full bg-white/[.05] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
            role="radiogroup"
            aria-label="Billing period"
          >
            {[
              { k: false, label: "Monthly" },
              { k: true, label: "Yearly" },
            ].map((n) => (
              <button
                key={n.label}
                type="button"
                role="radio"
                aria-checked={yearly === n.k}
                onClick={() => setYearly(n.k)}
                className={`relative rounded-full px-4 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a] ${yearly === n.k ? "text-black" : "text-[#a39c94] hover:text-[#f3efe9]"}`}
              >
                {yearly === n.k && (
                  <motion.span
                    layoutId="ag-bill"
                    className="absolute inset-0 rounded-full bg-[#f3efe9]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{n.label}</span>
              </button>
            ))}
          </div>
          <span className="text-[13px] text-[#ffc58a]">Yearly saves about 17%</span>
        </div>
      </div>
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PRICING.plans.map((n) => {
          const r = yearly ? n.annual : n.monthly;
          const s = (
            <div
              className={`flex h-full flex-col gap-6 p-7 ${n.featured ? "rounded-[19px] bg-[linear-gradient(180deg,#140b05,#050302)]" : ""}`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#f3efe9]">{n.name}</h3>
                  {n.featured && (
                    <span className="rounded-full bg-[#ff7a2f]/15 px-2.5 py-1 text-[12px] font-medium text-[#ffc58a]">
                      Most teams pick this
                    </span>
                  )}
                </div>
                <p className="text-[14.5px] text-[#a39c94]">{n.blurb}</p>
              </div>
              <div className="flex items-end gap-2">
                <PriceDigits value={r} />
                <span className="pb-2 text-[14px] text-[#a39c94]">
                  {r === 0 ? "forever" : yearly ? "a month, billed yearly" : "a month"}
                </span>
              </div>
              <Button href="#signup" variant={n.featured ? "primary" : "ghost"} className="w-full">
                {n.cta}
              </Button>
              <ul className="flex flex-col gap-3 border-t border-white/[.07] pt-6">
                {n.features.map((i) => (
                  <li key={i} className="flex gap-2.5 text-[14.5px] text-[#d9d3cb]">
                    <CheckIcon />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          );
          return n.featured ? (
            <div
              key={n.name}
              className="relative rounded-[20px] bg-[linear-gradient(180deg,rgba(255,197,138,.9),rgba(255,122,47,.35)_40%,rgba(255,255,255,.08))] p-px shadow-[0_30px_80px_-30px_rgba(255,122,47,.45)]"
            >
              {s}
            </div>
          ) : (
            <div key={n.name} className={CARD}>
              {s}
            </div>
          );
        })}
      </div>
      <div
        className={`${CARD} mt-4 flex flex-col items-start justify-between gap-4 p-7 sm:flex-row sm:items-center`}
      >
        <div>
          <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#f3efe9]">
            {PRICING.enterprise.title}
          </h3>
          <p className="mt-1 text-[14.5px] text-[#a39c94]">{PRICING.enterprise.body}</p>
        </div>
        <Button href="#contact" variant="ghost">
          {PRICING.enterprise.cta}
        </Button>
      </div>
    </Section>
  );
}
