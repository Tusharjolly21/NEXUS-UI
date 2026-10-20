"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

export interface RadioOption {
  id: string;
  title: string;
  description: string;
  meta?: string;
  features?: string[];
}

export interface RadioCardsProps {
  options?: RadioOption[];
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Cycles through options until the user interacts. */
  autoplay?: boolean;
  accent?: string;
}

const DEFAULT_OPTIONS: RadioOption[] = [
  { id: "basic", title: "Basic", description: "For trying things out", meta: "Free", features: ["1 project", "Community support"] },
  { id: "plus", title: "Plus", description: "For people who ship often", meta: "$12/mo", features: ["Unlimited projects", "Custom domains", "Analytics"] },
  { id: "team", title: "Team", description: "For teams that build together", meta: "$36/mo", features: ["Everything in Plus", "Shared workspaces", "SSO"] },
];

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export default function RadioCards({
  options = DEFAULT_OPTIONS,
  defaultValue,
  onChange,
  autoplay = false,
  accent = "#0071e3",
}: RadioCardsProps) {
  const [value, setValue] = useState(defaultValue ?? options[1]?.id ?? options[0].id);
  const name = useId();
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const order = [2, 0, 1];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setValue(options[order[k++ % order.length] % options.length].id);
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay, options]);

  const choose = (id: string) => {
    touched.current = true;
    setValue(id);
    onChange?.(id);
  };

  const selected = options.find((o) => o.id === value)!;

  return (
    <fieldset className="flex w-full max-w-[440px] flex-col gap-4" onPointerDown={() => (touched.current = true)}>
      <legend className="sr-only">Choose a plan</legend>
      <LayoutGroup id={name}>
        <div className="flex flex-col gap-2">
          {options.map((o) => {
            const on = o.id === value;
            return (
              <motion.label
                layout
                transition={spring}
                key={o.id}
                className="relative block cursor-pointer rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_3px_rgba(0,0,0,.04)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4"
                style={{ outlineColor: accent }}
                whileTap={{ scale: 0.985 }}
              >
                <input type="radio" name={name} value={o.id} checked={on} onChange={() => choose(o.id)} className="sr-only" />
                {on && (
                  <motion.span
                    layoutId="radio-ring"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="pointer-events-none absolute inset-0 rounded-[20px]"
                    style={{ boxShadow: `0 0 0 2px ${accent}, 0 14px 30px -14px ${accent}88` }}
                  />
                )}
                <motion.span layout="position" className="flex h-[62px] items-center gap-3.5 px-[18px]">
                  <motion.span
                    className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full"
                    animate={{ backgroundColor: on ? accent : "rgba(0,0,0,0)", boxShadow: on ? `inset 0 0 0 0px ${accent}` : "inset 0 0 0 1.5px #c7c7cc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span className="h-2 w-2 rounded-full bg-white" initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 700, damping: 18 }} />
                  </motion.span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{o.title}</span>
                    <span className="text-[13px] text-[#86868b]">{o.description}</span>
                  </span>
                  {o.meta && (
                    <motion.span animate={{ color: on ? "#1d1d1f" : "#86868b" }} className="text-[15px] font-medium tabular-nums">
                      {o.meta}
                    </motion.span>
                  )}
                </motion.span>
                <AnimatePresence initial={false}>
                  {on && o.features && (
                    <motion.span
                      key="features"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={spring}
                      className="block overflow-hidden"
                    >
                      <span className="flex flex-wrap gap-1.5 pb-4 pl-[54px] pr-[18px]">
                        {o.features.map((f, i) => (
                          <motion.span
                            key={f}
                            initial={{ opacity: 0, y: 8, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ ...spring, delay: 0.06 + i * 0.05 }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] py-[5px] pl-[7px] pr-2.5 text-[12.5px] font-medium text-[#1d1d1f]"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                            {f}
                          </motion.span>
                        ))}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.label>
            );
          })}
        </div>
      </LayoutGroup>
      <motion.button
        layout
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className="flex h-[50px] w-full items-center justify-center gap-[5px] overflow-hidden rounded-full text-[16px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ background: accent, outlineColor: accent }}
      >
        Continue with
        <span className="relative inline-flex h-[22px] items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={selected.id}
              initial={{ y: "110%", opacity: 0, filter: "blur(4px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-110%", opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="inline-block"
            >
              {selected.title}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </fieldset>
  );
}
