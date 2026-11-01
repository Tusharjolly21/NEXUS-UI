// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useEffect, useRef, useMemo, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CURRENCIES,
  arrivalPhrase,
  arrivalShort,
  feeFor,
  formatAmount,
  formatRate,
  getCurrency,
  rateBetween,
} from "./data";
import { Globe } from "./globe";
import { CurrencyDot, Icon, MENU_SPRING, RollingNumber, SwapText } from "./ui";

export function CurrencyPicker({ value: e, other: t, onPick: n, label: r }) {
  const [i, s] = useState(!1),
    o = useId(),
    l = useRef(null);
  useEffect(() => {
    if (!i) return;
    const u = (d) => {
      var f;
      return !((f = l.current) != null && f.contains(d.target)) && s(!1);
    };
    return (
      document.addEventListener("pointerdown", u),
      window.setTimeout(() => {
        var d, f;
        return (f = (d = l.current) == null ? void 0 : d.querySelector("[aria-selected=true]")) == null
          ? void 0
          : f.focus();
      }, 0),
      () => document.removeEventListener("pointerdown", u)
    );
  }, [i]);
  const c = CURRENCIES.filter((u) => u.code !== t.code);
  return (
    <div ref={l} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={i}
        aria-controls={o}
        aria-label={`${r}: ${e.name}`}
        onClick={() => s((u) => !u)}
        className="flex h-10 items-center gap-2 rounded-full bg-[rgb(var(--ferry-raised))] pl-1.5 pr-3 text-[15px] font-medium text-[rgb(var(--ferry-ink))] transition-colors hover:bg-[rgb(var(--ferry-ink)/.07)]"
      >
        <CurrencyDot c={e} size={28} />
        {e.code}
        <Icon name="chevron_down" size={10} className="text-[rgb(var(--ferry-faint))]" />
      </button>
      <AnimatePresence>
        {i && (
          <motion.ul
            id={o}
            role="listbox"
            aria-label={r}
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98,
              transition: {
                duration: 0.12,
              },
            }}
            transition={MENU_SPRING}
            style={{
              originY: 0,
              originX: 1,
            }}
            className="absolute right-0 top-[calc(100%+6px)] z-30 m-0 max-h-[280px] w-[240px] list-none overflow-y-auto rounded-[18px] bg-[rgb(var(--ferry-surface))] p-1.5 ferry-shadow-lift"
            onKeyDown={(u) => {
              var h, x;
              const d = [...(u.currentTarget.querySelectorAll("[role=option]") ?? [])],
                f = d.indexOf(document.activeElement);
              if (u.key === "ArrowDown") (h = d[Math.min(d.length - 1, f + 1)]) == null || h.focus();
              else if (u.key === "ArrowUp") (x = d[Math.max(0, f - 1)]) == null || x.focus();
              else if (u.key === "Escape") s(!1);
              else return;
              u.preventDefault();
            }}
          >
            {c.map((u) => (
              <li key={u.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={u.code === e.code}
                  onClick={() => {
                    (n(u), s(!1));
                  }}
                  className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-[rgb(var(--ferry-raised))] focus-visible:bg-[rgb(var(--ferry-raised))] ${u.code === e.code ? "bg-[rgb(var(--ferry-raised))]" : ""}`}
                >
                  <CurrencyDot c={u} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                      {u.code}
                    </span>
                    <span className="block truncate text-[12px] text-[rgb(var(--ferry-mute))]">
                      {u.name}
                      {", "}
                      {u.city}
                    </span>
                  </span>
                  {u.code === e.code && (
                    <Icon name="checkmark" size={13} className="text-[rgb(var(--ferry-accent))]" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Hero() {
  const e = useReducedMotion(),
    [t, n] = useState(getCurrency("USD")),
    [r, i] = useState(getCurrency("EUR")),
    [s, o] = useState("10,000"),
    [l, c] = useState(0),
    [u, d] = useState("idle"),
    [f, h] = useState(0),
    x = useRef(0),
    w = Number(s.replace(/[^0-9.]/g, "")) || 0,
    y = rateBetween(t, r),
    v = feeFor(w),
    p = Math.max(0, (w - v) * y),
    m = arrivalPhrase(r.minutes),
    g = useMemo(() => `${r.symbol.trim()}${formatAmount(p, r, 0)}`, [p, r]),
    A = () => {
      u === "sending" || w <= 0 || (d("sending"), c((k) => k + 1));
    },
    E = () => {
      (d("arrived"), window.clearTimeout(x.current), (x.current = window.setTimeout(() => d("idle"), 2600)));
    };
  useEffect(() => () => window.clearTimeout(x.current), []);
  const S = (k) => {
      (i(k), d("idle"));
    },
    M = (k) => {
      (n(k), d("idle"));
    };
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid grid-cols-1 max-w-[1160px] gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-4">
        <div className="relative z-10 flex flex-col justify-center lg:pb-24">
          <h1 className="m-0 text-[clamp(42px,5.6vw,72px)] font-medium leading-[1] tracking-[-0.035em] text-[rgb(var(--ferry-ink))]">
            <span className="block">
              <SwapText text={`${t.city} to`} />
            </span>
            <span className="block">
              <SwapText text={r.city} />
            </span>
            <span className="block text-[rgb(var(--ferry-mute))]">
              <SwapText text={`${arrivalShort(r.minutes)}.`} />
            </span>
          </h1>
          <p className="m-0 mt-6 max-w-[30em] text-[19px] leading-[1.5] text-[rgb(var(--ferry-mute))]">
            Ferry gives your company local accounts in 34 currencies, the real exchange rate, and payouts that
            land in minutes across 160 countries.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#open"
              className="flex h-11 items-center gap-2 rounded-[11px] bg-[rgb(var(--ferry-accent))] px-5 text-[15px] font-medium text-white no-underline shadow-[inset_0_1px_0_rgb(255_255_255/.18),0_1px_2px_rgb(0_0_0/.2)] transition-[filter] hover:brightness-110"
            >
              Open an account
              <Icon name="arrow_up_right" size={11} />
            </a>
            <a
              href="#pricing"
              className="flex h-11 items-center rounded-[11px] border border-solid border-[rgb(var(--ferry-line)/.12)] bg-[rgb(var(--ferry-surface))] px-5 text-[15px] font-medium text-[rgb(var(--ferry-ink))] no-underline transition-colors hover:border-[rgb(var(--ferry-line)/.24)]"
            >
              See pricing
            </a>
          </div>
          <p className="m-0 mt-8 flex items-center gap-2 text-[13px] text-[rgb(var(--ferry-faint))]">
            <Icon name="lock_shield_fill" size={15} />
            Licensed in the UK and EU. Client money is held at tier-one banks.
          </p>
        </div>
        <div className="relative min-h-[700px] sm:min-h-[620px] lg:min-h-[680px]">
          <div className="absolute -right-[18%] -top-[6%] bottom-[30%] left-[-6%] sm:-right-[12%] sm:bottom-[16%] lg:-right-[30%] lg:-top-[12%] lg:bottom-[20%] lg:left-[-6%]">
            <Globe from={t} to={r} launch={l} label={g} onArrive={E} frameX={0.06} frameY={0.3} />
          </div>
          <motion.div
            initial={
              e
                ? !1
                : {
                    opacity: 0,
                    y: 24,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 26,
              delay: 0.25,
            }}
            className="absolute bottom-0 left-0 z-20 w-full max-w-[380px] rounded-[24px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-5 ferry-shadow-lift sm:left-[2%]"
          >
            <label className="block text-[13px] text-[rgb(var(--ferry-mute))]" htmlFor="send-amount">
              You send
            </label>
            <div className="mt-1 flex items-center justify-between gap-3">
              <input
                id="send-amount"
                inputMode="decimal"
                value={s}
                onChange={(k) => {
                  const F = k.target.value.replace(/[^0-9.]/g, ""),
                    [R, q] = F.split("."),
                    De = Number(R || 0);
                  (o(
                    `${De ? De.toLocaleString("en-US") : R === "" ? "" : "0"}${q !== void 0 ? `.${q.slice(0, 2)}` : ""}`,
                  ),
                    d("idle"));
                }}
                className="ferry-tnum w-full min-w-0 border-0 bg-transparent p-0 text-[32px] font-medium tracking-[-0.03em] text-[rgb(var(--ferry-ink))] outline-hidden"
              />
              <CurrencyPicker value={t} other={r} onPick={M} label="Currency you send" />
            </div>
            <div className="relative my-3 flex items-center">
              <span className="h-px flex-1 bg-[rgb(var(--ferry-line)/.1)]" />
              <motion.button
                type="button"
                aria-label="Swap currencies"
                onClick={() => {
                  (h((k) => k + 180), n(r), i(t), d("idle"));
                }}
                animate={{
                  rotate: f,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="mx-3 grid h-9 w-9 place-items-center rounded-full bg-[rgb(var(--ferry-raised))] text-[rgb(var(--ferry-ink))] transition-colors hover:bg-[rgb(var(--ferry-ink)/.07)]"
              >
                <Icon name="arrow_up_arrow_down" size={15} />
              </motion.button>
              <span className="h-px flex-1 bg-[rgb(var(--ferry-line)/.1)]" />
            </div>
            <div className="text-[13px] text-[rgb(var(--ferry-mute))]">They receive</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-[32px] font-medium tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
                <RollingNumber text={formatAmount(p, r)} />
              </div>
              <CurrencyPicker value={r} other={t} onPick={S} label="Currency they receive" />
            </div>
            <dl className="m-0 mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-[rgb(var(--ferry-line)/.1)] pt-4 text-[13px]">
              <dt className="text-[rgb(var(--ferry-mute))]">Rate</dt>
              <dd className="ferry-tnum m-0 text-right text-[rgb(var(--ferry-ink))]">
                {"1 "}
                {t.code}
                {" = "}
                {formatRate(y)} {r.code}
              </dd>
              <dt className="text-[rgb(var(--ferry-mute))]">Our fee</dt>
              <dd className="ferry-tnum m-0 text-right text-[rgb(var(--ferry-ink))]">
                {t.symbol.trim()}
                {formatAmount(v, t)}
              </dd>
              <dt className="text-[rgb(var(--ferry-mute))]">Arrives</dt>
              <dd className="m-0 text-right text-[rgb(var(--ferry-ink))]">
                {m}
                {", over "}
                {r.rail}
              </dd>
            </dl>
            <button
              type="button"
              onClick={A}
              disabled={w <= 0}
              className={`relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-[12px] text-[16px] font-medium text-white transition-[background-color,filter] disabled:opacity-40 ${u === "arrived" ? "bg-[rgb(var(--ferry-gain))]" : "bg-[rgb(var(--ferry-accent))] hover:brightness-110"}`}
            >
              {u === "sending" && (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-white/20"
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width: "100%",
                  }}
                  transition={{
                    duration: e ? 0.5 : 1.8,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                />
              )}
              <AnimatePresence mode="popLayout" initial={!1}>
                <motion.span
                  key={u}
                  initial={{
                    y: 14,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: -14,
                    opacity: 0,
                  }}
                  transition={MENU_SPRING}
                  className="relative flex items-center gap-2"
                >
                  {u === "arrived" && <Icon name="checkmark" size={15} />}
                  {u === "idle"
                    ? `Send to ${r.city}`
                    : u === "sending"
                      ? `Sending to ${r.city}`
                      : `Arrived in ${r.city}`}
                </motion.span>
              </AnimatePresence>
            </button>
            <p className="m-0 mt-3 text-center text-[12px] text-[rgb(var(--ferry-faint))]">
              A preview with sample rates. Nothing is sent.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
