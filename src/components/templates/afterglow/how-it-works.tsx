import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STEPS, INSTALL_COMMAND } from "./data";
import { COLORS, Section, SectionHead, CARD } from "./ui";

function InstallCommand({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-[12px] bg-black px-4 py-3 font-mono text-[13.5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]">
      <span>
        <span className="text-[#6a645e]">$ </span>
        <span className="text-[#f3efe9]">{code}</span>
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
          } catch {}
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="relative h-7 min-w-[64px] overflow-hidden rounded-full bg-white/[.07] px-3 font-sans text-[12px] text-[#f3efe9] outline-none hover:bg-white/[.12] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "d" : "c"}
            className="block"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            {copied ? "Copied" : "Copy"}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

function DeployPreview() {
  const items = ["Fix coupon rounding", "New checkout layout", "Address autofill"];
  return (
    <div className="mt-6 flex flex-col gap-2">
      {items.map((t, n) => (
        <div key={t} className="flex items-center gap-3 text-[13px]">
          <span
            className="h-2 w-2 flex-none rounded-full"
            style={{ background: n === 1 ? COLORS.ember : "rgba(255,255,255,.25)" }}
          />
          <span className="truncate text-[#a39c94]">{t}</span>
          <span className="ml-auto font-mono text-[11.5px] text-[#6a645e]">#{412 + n}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2 rounded-[10px] bg-[#ff7a2f]/10 px-3 py-2 text-[13px] text-[#ffc58a] shadow-[inset_0_0_0_1px_rgba(255,122,47,.25)]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 3v18M5 10l7-7 7 7" />
        </svg>
        Deployed as v2.16, marker added
      </div>
    </div>
  );
}

function ImpactPreview() {
  return (
    <div className="mt-6 rounded-[12px] bg-black p-4 text-[13.5px] leading-[1.55] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]">
      <p className="text-[#f3efe9]">
        v2.16 raised checkout conversion by <span style={{ color: COLORS.up }}>0.61 points</span>. Mobile
        drove most of it.
      </p>
      <p className="mt-2 text-[#a39c94]">96% confident, from 18,420 sessions.</p>
    </div>
  );
}

export function HowItWorks() {
  const previews = [<InstallCommand key="c" code={INSTALL_COMMAND} />, <DeployPreview key="s" />, <ImpactPreview key="r" />];
  return (
    <Section id="how" className="py-24 sm:py-28">
      <SectionHead
        title="Three steps, then it runs itself."
        body="No tagging plan, no dashboards to build first. Connect once and every deploy after that is measured."
      />
      <ol className="mt-14 grid gap-4 lg:grid-cols-3">
        {STEPS.map((t, n) => (
          <li key={t.title} className={`${CARD} flex flex-col p-6 sm:p-7`}>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums text-black"
              style={{ background: n === 0 ? COLORS.honey : n === 1 ? "#ffa25e" : COLORS.ember }}
            >
              {n + 1}
            </span>
            <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.025em] text-[#f3efe9]">{t.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.55] text-[#a39c94]">{t.body}</p>
            <div className="mt-auto">{previews[n]}</div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
