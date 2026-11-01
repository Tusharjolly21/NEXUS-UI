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
import type { Currency } from "./data";
import { Globe } from "./globe";
import { CurrencyDot, Icon, MENU_SPRING, RollingNumber, SwapText } from "./ui";

type CurrencyPickerProps = {
  value: Currency;
  other: Currency;
  onPick: (currency: Currency) => void;
  label: string;
};

export function CurrencyPicker({ value, other, onPick, label }: CurrencyPickerProps) {
  const [open, setOpen] = useState(false),
    listId = useId(),
    containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.setTimeout(() => {
      containerRef.current?.querySelector<HTMLElement>("[aria-selected=true]")?.focus();
    }, 0);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  const options = CURRENCIES.filter((currency) => currency.code !== other.code);
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${value.name}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 items-center gap-2 rounded-full bg-[rgb(var(--ferry-raised))] pl-1.5 pr-3 text-[15px] font-medium text-[rgb(var(--ferry-ink))] transition-colors hover:bg-[rgb(var(--ferry-ink)/.07)]"
      >
        <CurrencyDot c={value} size={28} />
        {value.code}
        <Icon name="chevron_down" size={10} className="text-[rgb(var(--ferry-faint))]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={label}
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
            onKeyDown={(event) => {
              const items = [...(event.currentTarget.querySelectorAll<HTMLElement>("[role=option]") ?? [])],
                activeIndex = items.indexOf(document.activeElement as HTMLElement);
              if (event.key === "ArrowDown") items[Math.min(items.length - 1, activeIndex + 1)]?.focus();
              else if (event.key === "ArrowUp") items[Math.max(0, activeIndex - 1)]?.focus();
              else if (event.key === "Escape") setOpen(false);
              else return;
              event.preventDefault();
            }}
          >
            {options.map((currency) => (
              <li key={currency.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={currency.code === value.code}
                  onClick={() => {
                    onPick(currency);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-[rgb(var(--ferry-raised))] focus-visible:bg-[rgb(var(--ferry-raised))] ${currency.code === value.code ? "bg-[rgb(var(--ferry-raised))]" : ""}`}
                >
                  <CurrencyDot c={currency} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                      {currency.code}
                    </span>
                    <span className="block truncate text-[12px] text-[rgb(var(--ferry-mute))]">
                      {currency.name}
                      {", "}
                      {currency.city}
                    </span>
                  </span>
                  {currency.code === value.code && (
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

type SendStatus = "idle" | "sending" | "arrived";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [sendCurrency, setSendCurrency] = useState(getCurrency("USD"));
  const [receiveCurrency, setReceiveCurrency] = useState(getCurrency("EUR"));
  const [amountText, setAmountText] = useState("10,000");
  const [launch, setLaunch] = useState(0);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [rotation, setRotation] = useState(0);
  const resetTimerRef = useRef(0);
  const amount = Number(amountText.replace(/[^0-9.]/g, "")) || 0;
  const rate = rateBetween(sendCurrency, receiveCurrency);
  const fee = feeFor(amount);
  const received = Math.max(0, (amount - fee) * rate);
  const arrival = arrivalPhrase(receiveCurrency.minutes);
  const globeLabel = useMemo(
    () => `${receiveCurrency.symbol.trim()}${formatAmount(received, receiveCurrency, 0)}`,
    [received, receiveCurrency],
  );
  const handleSend = () => {
    if (status === "sending" || amount <= 0) return;
    setStatus("sending");
    setLaunch((count) => count + 1);
  };
  const handleArrive = () => {
    setStatus("arrived");
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setStatus("idle"), 2600);
  };
  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);
  const pickReceive = (currency: Currency) => {
    setReceiveCurrency(currency);
    setStatus("idle");
  };
  const pickSend = (currency: Currency) => {
    setSendCurrency(currency);
    setStatus("idle");
  };
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid grid-cols-1 max-w-[1160px] gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-4">
        <div className="relative z-10 flex flex-col justify-center lg:pb-24">
          <h1 className="m-0 text-[clamp(42px,5.6vw,72px)] font-medium leading-[1] tracking-[-0.035em] text-[rgb(var(--ferry-ink))]">
            <span className="block">
              <SwapText text={`${sendCurrency.city} to`} />
            </span>
            <span className="block">
              <SwapText text={receiveCurrency.city} />
            </span>
            <span className="block text-[rgb(var(--ferry-mute))]">
              <SwapText text={`${arrivalShort(receiveCurrency.minutes)}.`} />
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
            <Globe
              from={sendCurrency}
              to={receiveCurrency}
              launch={launch}
              label={globeLabel}
              onArrive={handleArrive}
              frameX={0.06}
              frameY={0.3}
            />
          </div>
          <motion.div
            initial={
              reduceMotion
                ? false
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
                value={amountText}
                onChange={(event) => {
                  const cleaned = event.target.value.replace(/[^0-9.]/g, ""),
                    [whole, fraction] = cleaned.split("."),
                    wholeNumber = Number(whole || 0);
                  setAmountText(
                    `${wholeNumber ? wholeNumber.toLocaleString("en-US") : whole === "" ? "" : "0"}${fraction !== undefined ? `.${fraction.slice(0, 2)}` : ""}`,
                  );
                  setStatus("idle");
                }}
                className="ferry-tnum w-full min-w-0 border-0 bg-transparent p-0 text-[32px] font-medium tracking-[-0.03em] text-[rgb(var(--ferry-ink))] outline-hidden"
              />
              <CurrencyPicker value={sendCurrency} other={receiveCurrency} onPick={pickSend} label="Currency you send" />
            </div>
            <div className="relative my-3 flex items-center">
              <span className="h-px flex-1 bg-[rgb(var(--ferry-line)/.1)]" />
              <motion.button
                type="button"
                aria-label="Swap currencies"
                onClick={() => {
                  setRotation((degrees) => degrees + 180);
                  setSendCurrency(receiveCurrency);
                  setReceiveCurrency(sendCurrency);
                  setStatus("idle");
                }}
                animate={{
                  rotate: rotation,
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
                <RollingNumber text={formatAmount(received, receiveCurrency)} />
              </div>
              <CurrencyPicker value={receiveCurrency} other={sendCurrency} onPick={pickReceive} label="Currency they receive" />
            </div>
            <dl className="m-0 mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-[rgb(var(--ferry-line)/.1)] pt-4 text-[13px]">
              <dt className="text-[rgb(var(--ferry-mute))]">Rate</dt>
              <dd className="ferry-tnum m-0 text-right text-[rgb(var(--ferry-ink))]">
                {"1 "}
                {sendCurrency.code}
                {" = "}
                {formatRate(rate)} {receiveCurrency.code}
              </dd>
              <dt className="text-[rgb(var(--ferry-mute))]">Our fee</dt>
              <dd className="ferry-tnum m-0 text-right text-[rgb(var(--ferry-ink))]">
                {sendCurrency.symbol.trim()}
                {formatAmount(fee, sendCurrency)}
              </dd>
              <dt className="text-[rgb(var(--ferry-mute))]">Arrives</dt>
              <dd className="m-0 text-right text-[rgb(var(--ferry-ink))]">
                {arrival}
                {", over "}
                {receiveCurrency.rail}
              </dd>
            </dl>
            <button
              type="button"
              onClick={handleSend}
              disabled={amount <= 0}
              className={`relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-[12px] text-[16px] font-medium text-white transition-[background-color,filter] disabled:opacity-40 ${status === "arrived" ? "bg-[rgb(var(--ferry-gain))]" : "bg-[rgb(var(--ferry-accent))] hover:brightness-110"}`}
            >
              {status === "sending" && (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-white/20"
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width: "100%",
                  }}
                  transition={{
                    duration: reduceMotion ? 0.5 : 1.8,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                />
              )}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
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
                  {status === "arrived" && <Icon name="checkmark" size={15} />}
                  {status === "idle"
                    ? `Send to ${receiveCurrency.city}`
                    : status === "sending"
                      ? `Sending to ${receiveCurrency.city}`
                      : `Arrived in ${receiveCurrency.city}`}
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
