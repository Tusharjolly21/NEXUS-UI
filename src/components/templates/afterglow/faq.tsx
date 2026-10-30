import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ } from "./data";
import { Section, SectionHead } from "./ui";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId().replace(/:/g, "");
  return (
    <Section id="faq" className="py-24 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead title={FAQ.title} body={FAQ.body} />
        </div>
        <ul className="flex flex-col">
          {FAQ.items.map((r, s) => {
            const i = open === s;
            return (
              <li key={r.q} className="border-b border-white/[.08]">
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${s}`}
                    aria-expanded={i}
                    aria-controls={`${uid}-a${s}`}
                    onClick={() => setOpen(i ? null : s)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-[18px] font-medium tracking-[-0.02em] text-[#f3efe9] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
                  >
                    {r.q}
                    <span
                      className="relative flex h-7 w-7 flex-none items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
                      aria-hidden="true"
                    >
                      <span className="absolute h-px w-3 bg-current" />
                      <motion.span
                        className="absolute h-3 w-px bg-current"
                        animate={{ scaleY: i ? 0 : 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {i && (
                    <motion.div
                      id={`${uid}-a${s}`}
                      role="region"
                      aria-labelledby={`${uid}-q${s}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 32 }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-6 text-[16px] leading-[1.6] text-[#a39c94]">{r.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
