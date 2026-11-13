"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { FONT_MONO, IRON } from "./theme";

type Line = { k: "cmd" | "out" | "hit" | "warn" | "ok"; t: string; pkg?: string };

/** Two commands and what Forge prints back, the same index the editor uses. */
const SCRIPT: Line[] = [
  { k: "cmd", t: 'forge ask "who calls applyDiscount?"' },
  { k: "out", t: "Searched the index (4,812 files) in 0.4s" },
  { k: "out", t: "14 callers in 3 packages" },
  { k: "hit", pkg: "cart/", t: "CartSummary.tsx:88  useCart.ts:41  +4" },
  { k: "warn", pkg: "pos/", t: "Register.tsx:212 ignores the returned cart" },
  { k: "hit", pkg: "web/", t: "checkout/page.tsx:57  +3" },
  { k: "cmd", t: "forge review --branch discounts" },
  { k: "out", t: "Ran 42 tests against the suggestion: all pass" },
  { k: "ok", t: "2 issues, 1 suggestion. Posted to pull request #2304" },
];

const colour = { cmd: IRON.text, out: IRON.muted, hit: IRON.text, warn: "#ff8f6b", ok: "#7fd18b" };

/**
 * A terminal that types two Forge commands and prints the answers, line by line, once it scrolls into view.
 * Reduced motion shows the whole transcript at once.
 */
const noop = () => () => {};

export default function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  // false while hydrating (the server can't know the setting), then the visitor's real setting
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  const [shown, setShown] = useState(0); // whole lines printed
  const [typed, setTyped] = useState(0); // characters of the command being typed

  useEffect(() => {
    if (!seen || still) return;
    const ts: number[] = [];
    let at = 300;
    SCRIPT.forEach((l, i) => {
      if (l.k === "cmd") {
        for (let c = 1; c <= l.t.length; c++) ts.push(window.setTimeout(() => { setShown(i); setTyped(c); }, (at += 34)));
        at += 380;
        ts.push(window.setTimeout(() => setShown(i + 1), at));
      } else {
        ts.push(window.setTimeout(() => setShown(i + 1), (at += i === 1 || i === 7 ? 620 : 160)));
      }
    });
    return () => ts.forEach(clearTimeout);
  }, [seen, still]);

  const all = !!still;
  return (
    <div ref={ref} className="w-full overflow-hidden rounded-[22px] text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]" style={{ background: IRON.bg, boxShadow: "0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -30px rgba(0,0,0,.6)" }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: IRON.line }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} aria-hidden="true" />)}
        <span className="ml-2 text-[12px]" style={{ color: IRON.muted, fontFamily: FONT_MONO }}>~/northwind/checkout</span>
      </div>
      <div className="flex min-h-[318px] flex-col gap-1.5 px-5 py-5 text-[13px] leading-[1.6]" style={{ fontFamily: FONT_MONO }} aria-label="Forge in the terminal" role="log">
        {SCRIPT.map((l, i) => {
          const typing = !all && l.k === "cmd" && shown === i;
          if (!all && i > shown) return null;
          if (!all && !typing && i === shown) return null;
          const text = typing ? l.t.slice(0, typed) : l.t;
          return (
            <motion.div key={i} initial={l.k === "cmd" ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex gap-3 whitespace-pre-wrap ${l.k === "cmd" && i > 0 ? "mt-3" : ""}`} style={{ color: colour[l.k] }}>
              {l.k === "cmd" ? <span style={{ color: IRON.ember }} aria-hidden="true">$</span> : <span className="w-[1ch]" aria-hidden="true" />}
              {l.pkg ? <span className="w-[6ch] flex-none" style={{ color: IRON.ember }}>{l.pkg}</span> : null}
              <span>
                {text}
                {typing ? <motion.span className="ml-px inline-block h-[1.05em] w-[7px] translate-y-[3px]" style={{ background: IRON.text }} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} /> : null}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
