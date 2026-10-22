"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  accent?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** iOS-style switch: the knob stretches while pressed and springs across. */
export function Switch({ checked, onChange, label, accent = "#34c759", enableSound = true }: SwitchProps) {
  const play = useSound(enableSound);
  const [pressed, setPressed] = useState(false);
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        play(checked ? "off" : "on");
        onChange(!checked);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="relative flex h-[31px] w-[51px] flex-none items-center rounded-full p-[2px] transition-colors duration-200 [--sw-off:#e9e9eb] dark:[--sw-off:#39393d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      style={{ justifyContent: checked ? "flex-end" : "flex-start", backgroundColor: checked ? accent : "var(--sw-off)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        animate={{ width: pressed ? 34 : 27 }}
        className="h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_3px_1px_rgba(0,0,0,.06)]"
      />
    </motion.button>
  );
}

interface Row { label: string; hint: string; on: boolean }
const TABS: { id: string; label: string; rows: Row[] }[] = [
  { id: "general", label: "General", rows: [
    { label: "Automatic updates", hint: "Install updates overnight", on: true },
    { label: "Reduce motion", hint: "Use simpler transitions", on: false },
    { label: "Show previews", hint: "Display content in lists", on: true },
  ] },
  { id: "alerts", label: "Notifications", rows: [
    { label: "Mentions", hint: "When someone tags you", on: true },
    { label: "Weekly digest", hint: "A summary every Monday", on: false },
  ] },
  { id: "privacy", label: "Privacy", rows: [
    { label: "Share analytics", hint: "Help improve the product", on: false },
    { label: "Personalized tips", hint: "Based on how you work", on: true },
    { label: "Location access", hint: "Only while using the app", on: false },
    { label: "Read receipts", hint: "Let others see when you’ve read", on: true },
  ] },
];

export interface AnimatedTabsProps {
  accent?: string;
  /** Switches tabs by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

export function AnimatedTabs({ accent = "#34c759", autoplay = false, enableSound = true }: AnimatedTabsProps) {
  const play = useSound(enableSound);
  const group = useId();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState(() => TABS.map((t) => t.rows.map((r) => r.on)));
  const touched = useRef(false);

  const go = (i: number) => {
    if (i !== index) play("tick", 0.6);
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      k++;
      if (k % 2 === 1) {
        setValues((v) => v.map((rows, ti) => (ti === index ? rows.map((x, ri) => (ri === k % rows.length ? !x : x)) : rows)));
      } else {
        const next = (index + 1) % TABS.length;
        setDir(1);
        setIndex(next);
      }
    }, 1600);
    return () => clearInterval(t);
  }, [autoplay, index]);

  const tab = TABS[index];

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4" onPointerDown={() => (touched.current = true)}>
      <div role="tablist" aria-label="Settings" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === index}
            id={`${group}-tab-${t.id}`}
            aria-controls={`${group}-panel`}
            type="button"
            onClick={() => go(i)}
            className="relative z-10 h-8 rounded-[9px] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            {i === index && <motion.span layoutId={`${group}-pill`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]" />}
            {t.label}
          </button>
        ))}
      </div>
      <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_30px_-18px_rgba(0,0,0,.25)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]" id={`${group}-panel`} role="tabpanel">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.ul
            key={tab.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0, filter: "blur(4px)" }),
              center: { x: 0, opacity: 1, filter: "blur(0px)" },
              exit: (d: number) => ({ x: d * -60, opacity: 0, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="divide-y divide-[#e8e8ed] dark:divide-[#3a3a3c]"
          >
            {tab.rows.map((r, ri) => (
              <motion.li key={r.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + ri * 0.04 }} className="flex items-center gap-4 px-[18px] py-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{r.label}</span>
                  <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{r.hint}</span>
                </span>
                <Switch
                  label={r.label}
                  accent={accent}
                  enableSound={enableSound}
                  checked={values[index][ri]}
                  onChange={(v) => setValues((all) => all.map((rows, ti) => (ti === index ? rows.map((x, xi) => (xi === ri ? v : x)) : rows)))}
                />
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
