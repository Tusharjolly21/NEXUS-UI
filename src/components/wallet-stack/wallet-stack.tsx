"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface WalletCard {
  /** Stable key for the card. */
  id: string;
  /** Card nickname, shown top right and in the accessible label. */
  name: string;
  /** Last four digits. */
  last: string;
  /** Any CSS background for both faces, usually a gradient. */
  bg: string;
  /** Text colour on the card. */
  ink: string;
  /** Issuer name, shown top left. */
  brand: string;
  /** Expiry shown bottom right. Defaults to "08/28". */
  expires?: string;
}

export const DEFAULT_WALLET_CARDS: WalletCard[] = [
  { id: "black", name: "Everyday", last: "4021", bg: "linear-gradient(135deg,#2c2c2e,#0b0b0c)", ink: "#f5f5f7", brand: "Northwind" },
  { id: "blue", name: "Travel", last: "8810", bg: "linear-gradient(135deg,#5ac8fa,#0a4fd6)", ink: "#ffffff", brand: "Wayfare" },
  { id: "coral", name: "Groceries", last: "1177", bg: "linear-gradient(135deg,#ffb38a,#ff375f)", ink: "#ffffff", brand: "Tally" },
  { id: "mint", name: "Savings", last: "3390", bg: "linear-gradient(135deg,#b7f7c5,#0b8f6a)", ink: "#06281b", brand: "Tally" },
];

export interface WalletStackProps {
  /** Cards from back to front. The last one sits lowest, at the front of the pocket. Four fit best. */
  cards?: WalletCard[];
  /** Word stamped on the wallet. */
  label?: string;
  /** Hint under the wallet. Pass an empty string to hide it. */
  hint?: string;
  /** Called with the card id when one slides out, and with `null` when it is put back. */
  onSelect?: (id: string | null) => void;
  /** Takes each card out, flips it and puts it back, in turn, until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

const CW = 260;
const CH = 164;
const MONO = "ui-monospace, Menlo, monospace";

/**
 * Cards tucked into a leather wallet, each peeking out a little higher than
 * the one in front. Hover lifts a card; pick one and it slides out of the
 * pocket, the rest sink, and it turns over to show the back. Pick it again to
 * put it away.
 */
export function WalletStack({
  cards = DEFAULT_WALLET_CARDS,
  label = "Wallet",
  hint = "Pick a card.",
  onSelect,
  autoplay = false,
  className = "",
}: WalletStackProps) {
  const [out, setOut] = useState<string | null>(null);
  const [flip, setFlip] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms));
  };
  const clearLater = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const pick = (id: string) => {
    touched.current = true;
    clearLater();
    if (out === id) {
      setFlip(false);
      later(() => setOut(null), 350);
      onSelect?.(null);
      return;
    }
    setFlip(false);
    setOut(id);
    later(() => setFlip(true), 650);
    onSelect?.(id);
  };

  // Depend on the ids, not the array, so an inline `cards` literal doesn't restart the demo.
  const ids = cards.map((c) => c.id).join("\u0000");

  useEffect(() => {
    const order = ids ? ids.split("\u0000") : [];
    if (!autoplay || order.length === 0) return;
    let k = 0;
    let isOut = false;
    const local: number[] = [];
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      if (isOut) {
        setFlip(false);
        local.push(window.setTimeout(() => setOut(null), 350));
        k++;
      } else {
        setOut(order[k % order.length]);
        local.push(window.setTimeout(() => setFlip(true), 650));
      }
      isOut = !isOut;
    }, 2100);
    return () => {
      window.clearInterval(t);
      local.forEach((x) => window.clearTimeout(x));
    };
  }, [autoplay, ids]);

  return (
    <div
      className={`flex max-w-full flex-col items-center gap-3 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative h-[330px] w-[300px] max-w-full" style={{ perspective: 1100 }} role="group" aria-label={label}>
        {cards.map((c, i) => {
          const isOut = out === c.id;
          const peek = (cards.length - 1 - i) * 26;
          const baseY = 150 - peek;
          const y = isOut ? -10 : out ? baseY + 40 : baseY - (hover === c.id ? 16 : 0);
          return (
            <motion.button
              key={c.id}
              type="button"
              aria-label={`${c.name} card ending ${c.last}${isOut ? ", showing back" : ""}`}
              aria-pressed={isOut}
              onClick={() => pick(c.id)}
              onPointerEnter={() => setHover(c.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(c.id)}
              onBlur={() => setHover(null)}
              className="absolute left-1/2 top-0 rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-transparent"
              style={{ width: CW, height: CH, marginLeft: -CW / 2, zIndex: isOut ? 30 : i + 1, transformStyle: "preserve-3d" }}
              initial={false}
              animate={{ y, rotateY: isOut && flip ? 180 : 0, scale: isOut ? 1.06 : 1 }}
              transition={{
                y: { type: "spring", stiffness: 240, damping: 24 },
                rotateY: { type: "spring", stiffness: 140, damping: 18 },
                scale: { type: "spring", stiffness: 300, damping: 22 },
              }}
            >
              <span
                className="absolute inset-0 flex flex-col justify-between rounded-[16px] p-4 text-left shadow-[0_10px_24px_-12px_rgba(0,0,0,.45)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_24px_-12px_rgba(0,0,0,.8)]"
                style={{ background: c.bg, color: c.ink, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <span className="flex items-center justify-between text-[12px] font-semibold tracking-[0.04em]">
                  <span>{c.brand}</span>
                  <span className="opacity-80">{c.name}</span>
                </span>
                <span className="h-7 w-10 rounded-[6px]" style={{ background: "linear-gradient(135deg,#f5e7b8,#c9a95a)" }} />
                <span className="flex items-end justify-between">
                  <span className="text-[15px] tracking-[0.16em]" style={{ fontFamily: MONO }}>
                    •••• {c.last}
                  </span>
                  <span className="text-[11px] opacity-80">{c.expires ?? "08/28"}</span>
                </span>
              </span>
              <span
                className="absolute inset-0 overflow-hidden rounded-[16px] text-left"
                style={{
                  background: c.bg,
                  color: c.ink,
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span className="absolute left-0 right-0 top-5 h-9 bg-black/80" />
                <span
                  className="absolute left-4 right-4 top-[68px] flex h-8 items-center justify-end rounded-[4px] bg-white/90 px-3 text-[13px] italic text-[#1d1d1f]"
                  style={{ fontFamily: MONO }}
                >
                  CVV •••
                </span>
                <span className="absolute bottom-3 left-4 text-[11px] opacity-80">Tap to put it back</span>
              </span>
            </motion.button>
          );
        })}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-[150px] w-[290px] max-w-full -translate-x-1/2 overflow-hidden rounded-[22px] shadow-[inset_0_2px_0_rgba(255,255,255,.18),0_20px_40px_-18px_rgba(0,0,0,.55)] dark:shadow-[inset_0_2px_0_rgba(255,255,255,.18),0_0_0_1px_rgba(255,255,255,.06),0_20px_40px_-18px_rgba(0,0,0,.9)]"
          style={{ background: "linear-gradient(180deg,#8a5a3c,#6b432b)" }}
          aria-hidden="true"
        >
          <div className="absolute inset-[8px] rounded-[16px] border-[1.5px] border-dashed border-[#f2d7b6]/45" />
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.25) 1px, transparent 1px)", backgroundSize: "4px 4px" }}
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f2d7b6]/70">
            {label}
          </span>
        </div>
      </div>
      {hint && <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</span>}
    </div>
  );
}
