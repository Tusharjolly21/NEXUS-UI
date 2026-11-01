// @ts-nocheck -- temporary during decompile cleanup

import { motion } from "framer-motion";
import { Frame, SectionHeading } from "./ui";

export const CUSTOMERS = [
  {
    company: "Northwind",
    sector: "Software",
    where: "Austin",
    metric: "28 countries",
    text: "Pays its contractors in their own currency from one US dollar balance, every month on the same day.",
    rails: ["Pix", "IMPS", "SEPA Instant"],
    tint: "#2767ff",
  },
  {
    company: "Lumen GmbH",
    sector: "Retail",
    where: "Berlin",
    metric: "6 days sooner",
    text: "Closes the month with every conversion and fee already matched to the ledger.",
    rails: ["SEPA Instant", "Faster Payments"],
    tint: "#0f766e",
  },
  {
    company: "Harbour Freight",
    sector: "Logistics",
    where: "Sydney",
    metric: "4 minutes",
    text: "Median time for a supplier payment to land anywhere in Asia-Pacific.",
    rails: ["NPP", "FAST"],
    tint: "#b45309",
  },
  {
    company: "Casa Verde",
    sector: "Textiles",
    where: "São Paulo",
    metric: "1.9% kept",
    text: "Saved on every conversion compared with the spread its old bank built into the rate.",
    rails: ["Pix"],
    tint: "#15803d",
  },
  {
    company: "Rao Design",
    sector: "Studio",
    where: "Mumbai",
    metric: "No wires",
    text: "Gets paid in rupees by clients in London and New York without a single SWIFT wire.",
    rails: ["IMPS", "Faster Payments"],
    tint: "#7c3aed",
  },
  {
    company: "Taller Norte",
    sector: "Manufacturing",
    where: "Monterrey",
    metric: "2 approvers",
    text: "Every payment over $50,000 waits for the CFO, and nothing has left early since.",
    rails: ["SPEI"],
    tint: "#be123c",
  },
];

export function CustomerCard({ c: e, i: t, copy: n }) {
  return (
    <li
      aria-hidden={n || void 0}
      className={`${n ? "motion-reduce:hidden " : ""}flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[22px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] sm:w-[320px]`}
    >
      <div
        className="relative flex h-[112px] items-end justify-between overflow-hidden border-b border-solid border-[rgb(var(--ferry-line)/.06)] p-5"
        style={{
          background: `radial-gradient(120% 140% at 100% 0%, ${e.tint}33, transparent 60%)`,
        }}
      >
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-faint))]">
            {e.sector}
          </div>
          <div className="mt-1 text-[19px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
            {e.company}
          </div>
          <div className="text-[12px] text-[rgb(var(--ferry-mute))]">{e.where}</div>
        </div>
        <span
          className="grid h-11 w-11 place-items-center rounded-[12px] text-[15px] font-medium text-white"
          style={{
            background: e.tint,
          }}
          aria-hidden="true"
        >
          {e.company
            .split(" ")
            .map((r) => r[0])
            .join("")
            .slice(0, 2)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[30px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
          {e.metric}
        </div>
        <p className="m-0 mt-3 text-[14px] leading-[1.55] text-[rgb(var(--ferry-mute))]">{e.text}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-solid border-[rgb(var(--ferry-line)/.06)] pt-4">
          <span className="flex flex-wrap gap-1">
            {e.rails.map((r) => (
              <span
                key={r}
                className="rounded-full border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] px-2 py-0.5 text-[11px] text-[rgb(var(--ferry-mute))]"
              >
                {r}
              </span>
            ))}
          </span>
          <span className="ferry-tnum text-[11px] text-[rgb(var(--ferry-faint))]">
            {String(t + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </li>
  );
}

export function Customers() {
  return (
    <section id="proof" className="scroll-mt-24 px-3 sm:px-6">
      <Frame glow={!0} className="mx-auto max-w-[1160px]">
        <div className="relative rounded-[22px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.6)] px-2 pb-8 pt-14 sm:pt-16">
          <SectionHeading
            label="In production"
            title={
              <>
                {"Finance teams move faster "}
                <span className="text-[rgb(var(--ferry-faint))]">with Ferry.</span>
              </>
            }
            sub="Operators, engineers and finance leads use Ferry to pay people abroad on time, close the books sooner and keep every decision on record."
          />
          <div className="relative mt-12 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [scrollbar-width:none] motion-safe:overflow-hidden">
            <ul
              className="ferry-marquee m-0 flex w-max list-none gap-4 p-0 px-2"
              style={{
                "--marquee-duration": "70s",
              }}
            >
              {[...CUSTOMERS, ...CUSTOMERS].map((e, t) => (
                <CustomerCard
                  key={`${e.company}-${t}`}
                  c={e}
                  i={t % CUSTOMERS.length}
                  copy={t >= CUSTOMERS.length}
                />
              ))}
            </ul>
          </div>
        </div>
      </Frame>
    </section>
  );
}
