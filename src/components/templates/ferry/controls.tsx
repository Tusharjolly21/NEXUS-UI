"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatAmount, getCurrency } from "./data";
import type { IconName } from "./icons";
import { Badge, CurrencyDot, Frame, Icon, Panel, SectionHeading, buttonClass } from "./ui";

export const ROW_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 34,
} as const;

export const APPROVAL_LIMITS: number[] = [1e4, 5e4, 1e5];

export const PENDING_PAYMENT = {
  code: "EUR",
  amount: 48200,
  to: "Lumen GmbH",
  invoice: "INV-2214",
};

type ToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
};

export function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[rgb(var(--ferry-accent))]" : "bg-[rgb(var(--ferry-line)/.14)]"}`}
    >
      <motion.span
        className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.2)]"
        initial={false}
        animate={{
          x: on ? 18 : 0,
        }}
        whileTap={{
          width: 24,
        }}
        transition={ROW_SPRING}
      />
    </button>
  );
}

type AvatarProps = {
  initials: string;
  tint: string;
};

export function Avatar({ initials, tint }: AvatarProps) {
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium text-white"
      style={{
        background: tint,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

type AnimatedRowProps = {
  children?: ReactNode;
};

export function AnimatedRow({ children }: AnimatedRowProps) {
  return (
    <motion.li
      layout="position"
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      transition={ROW_SPRING}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.06)] py-3">
        {children}
      </div>
    </motion.li>
  );
}

type RuleRowProps = {
  icon: IconName;
  title: string;
  text: string;
  on: boolean;
  onChange: (on: boolean) => void;
  children?: ReactNode;
};

export function RuleRow({ icon, title, text, on, onChange, children }: RuleRowProps) {
  return (
    <li className="rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-solid transition-colors ${on ? "border-[rgb(var(--ferry-accent)/.3)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]" : "border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] text-[rgb(var(--ferry-faint))]"}`}
        >
          <Icon name={icon} size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium text-[rgb(var(--ferry-ink))]">{title}</div>
          <div className="mt-0.5 text-[13px] text-[rgb(var(--ferry-mute))]">{text}</div>
        </div>
        <Toggle on={on} onChange={onChange} label={title} />
      </div>
      {children}
    </li>
  );
}

export function Controls() {
  const reduceMotion = useReducedMotion(),
    [secondApprover, setSecondApprover] = useState(true),
    [limit, setLimit] = useState(APPROVAL_LIMITS[0]),
    [holdNewRecipients, setHoldNewRecipients] = useState(false),
    [invoiceRequired, setInvoiceRequired] = useState(true),
    [danApproved, setDanApproved] = useState(false),
    [released, setReleased] = useState(false),
    currency = getCurrency(PENDING_PAYMENT.code),
    usdAmount = PENDING_PAYMENT.amount / currency.perUsd,
    needsSecondApproval = secondApprover && usdAmount > limit;
  // changing any rule sends the payment back to the start
  const changeRule =
    <T,>(current: T, set: (next: T) => void) =>
    (next: T) => {
      if (next === current) return;
      set(next);
      setDanApproved(false);
      setReleased(false);
    };
  const buttonLabel = needsSecondApproval && !danApproved ? "Approve as Daniel" : "Release payment",
    // s = scheduled, r = released, w = waiting for approval, a = ready
    badgeState = released ? (holdNewRecipients ? "s" : "r") : needsSecondApproval && !danApproved ? "w" : "a";
  return (
    <section id="controls" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        label="Approvals"
        title="Rules your finance team sets once."
        sub="Decide who approves what. Ferry holds every payment to those rules, so nobody has to remember them and nothing leaves early."
      />
      <Frame className="mx-auto mt-12 max-w-[1160px]">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <Panel edge={true} className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="m-0 text-[20px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                Payment rules
              </h3>
              <Badge tone="accent">
                {[secondApprover, holdNewRecipients, invoiceRequired].filter(Boolean).length}
                {" on"}
              </Badge>
            </div>
            <ul className="m-0 mt-5 grid list-none gap-2 p-0">
              <RuleRow
                icon="person_2_fill"
                title="Second approver"
                text="For payments above a limit you choose"
                on={secondApprover}
                onChange={changeRule(secondApprover, setSecondApprover)}
              >
                <AnimatePresence initial={false}>
                  {secondApprover && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={ROW_SPRING}
                      className="overflow-hidden"
                    >
                      <div
                        role="radiogroup"
                        aria-label="Approval limit"
                        className="mt-4 flex gap-1 rounded-[10px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] p-1"
                      >
                        {APPROVAL_LIMITS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={option === limit}
                            onClick={() => changeRule(limit, setLimit)(option)}
                            className={`relative h-8 flex-1 rounded-[7px] text-[13px] font-medium transition-colors ${option === limit ? "text-[rgb(var(--ferry-ink))]" : "text-[rgb(var(--ferry-mute))] hover:text-[rgb(var(--ferry-ink))]"}`}
                          >
                            {option === limit && (
                              <motion.span
                                layoutId="limit-pill"
                                className="absolute inset-0 rounded-[7px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] shadow-[0_1px_3px_rgba(0,0,0,.1)]"
                                transition={ROW_SPRING}
                              />
                            )}
                            <span className="ferry-tnum relative">Above ${option / 1e3}k</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </RuleRow>
              <RuleRow
                icon="hand_raised_fill"
                title="Hold new recipients"
                text="A first payment to anyone waits 24 hours"
                on={holdNewRecipients}
                onChange={changeRule(holdNewRecipients, setHoldNewRecipients)}
              />
              <RuleRow
                icon="doc_on_doc"
                title="Invoice required"
                text="No payment leaves without one attached"
                on={invoiceRequired}
                onChange={changeRule(invoiceRequired, setInvoiceRequired)}
              />
            </ul>
          </Panel>
          <Panel glow={true} edge={true} className="flex flex-col p-4 sm:p-6">
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-faint))]">
                Payment PAY-0412
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={badgeState}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                >
                  {badgeState === "s" ? (
                    <Badge tone="amber">Scheduled</Badge>
                  ) : badgeState === "r" ? (
                    <Badge tone="gain" dot={true}>
                      Released
                    </Badge>
                  ) : badgeState === "w" ? (
                    <Badge tone="amber">Waiting for approval</Badge>
                  ) : (
                    <Badge tone="accent">Ready to release</Badge>
                  )}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="relative mt-5 flex items-center gap-3 rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
              <CurrencyDot c={currency} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-medium text-[rgb(var(--ferry-ink))]">
                  {PENDING_PAYMENT.to}
                </div>
                <div className="text-[12px] text-[rgb(var(--ferry-mute))]">
                  First payment to this recipient
                </div>
              </div>
              <div className="text-right">
                <div className="ferry-tnum text-[22px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                  {currency.symbol}
                  {formatAmount(PENDING_PAYMENT.amount, currency)}
                </div>
                <div className="ferry-tnum text-[12px] text-[rgb(var(--ferry-faint))]">
                  about ${formatAmount(usdAmount, getCurrency("USD"), 0)}
                </div>
              </div>
            </div>
            <ul className="relative m-0 mt-3 list-none p-0 text-[14px]">
              <AnimatePresence initial={false}>
                {invoiceRequired && (
                  <AnimatedRow key={"inv"}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] text-[rgb(var(--ferry-mute))]">
                      <Icon name="doc_on_doc" size={12} />
                    </span>
                    <span className="flex-1 text-[rgb(var(--ferry-ink))]">
                      {"Invoice "}
                      {PENDING_PAYMENT.invoice}
                      {" attached"}
                    </span>
                    <Icon name="checkmark" size={12} className="text-[rgb(var(--ferry-gain))]" />
                  </AnimatedRow>
                )}
                <AnimatedRow key={"maya"}>
                  <Avatar initials="MC" tint="#2767ff" />
                  <span className="flex-1 text-[rgb(var(--ferry-ink))]">
                    {"Maya Chen "}
                    <span className="text-[rgb(var(--ferry-mute))]">created and approved</span>
                  </span>
                  <Icon name="checkmark" size={12} className="text-[rgb(var(--ferry-gain))]" />
                </AnimatedRow>
                {needsSecondApproval && (
                  <AnimatedRow key={"dan"}>
                    <Avatar initials="DO" tint="#3f3f46" />
                    <span className="flex-1 text-[rgb(var(--ferry-ink))]">
                      {"Daniel Ortiz "}
                      <span className="text-[rgb(var(--ferry-mute))]">
                        {danApproved ? "approved" : "needs to approve"}
                      </span>
                    </span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {danApproved ? (
                        <motion.span
                          key={"y"}
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 20,
                          }}
                          className="flex text-[rgb(var(--ferry-gain))]"
                        >
                          <Icon name="checkmark" size={12} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key={"n"}
                          exit={{
                            scale: 0,
                          }}
                          className="flex text-[rgb(var(--ferry-amber))]"
                        >
                          <Icon name="clock_fill" size={13} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </AnimatedRow>
                )}
                {holdNewRecipients && (
                  <AnimatedRow key={"hold"}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] text-[rgb(var(--ferry-mute))]">
                      <Icon name="hand_raised_fill" size={12} />
                    </span>
                    <span className="flex-1 text-[rgb(var(--ferry-ink))]">
                      {"Held 24 hours "}
                      <span className="text-[rgb(var(--ferry-mute))]">for a new recipient</span>
                    </span>
                  </AnimatedRow>
                )}
              </AnimatePresence>
            </ul>
            <div className="relative mt-auto pt-5">
              <div className="relative h-11">
                <AnimatePresence mode="popLayout" initial={false}>
                  {released ? (
                    <motion.div
                      key={"done"}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="absolute inset-0 flex items-center justify-between gap-3"
                      role="status"
                    >
                      <span className="flex min-w-0 items-center gap-2.5 text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                        <motion.span
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  scale: 1.8,
                                  rotate: -25,
                                  opacity: 0,
                                }
                          }
                          animate={{
                            scale: 1,
                            rotate: 0,
                            opacity: 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 14,
                          }}
                          className={`flex shrink-0 ${holdNewRecipients ? "text-[rgb(var(--ferry-amber))]" : "text-[rgb(var(--ferry-gain))]"}`}
                        >
                          <Icon name={holdNewRecipients ? "clock_fill" : "checkmark_seal_fill"} size={26} />
                        </motion.span>
                        {holdNewRecipients ? "Scheduled for tomorrow, 9:41 AM" : "Released. It lands in about 3 minutes."}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDanApproved(false);
                          setReleased(false);
                        }}
                        className={`${buttonClass("ghost")} shrink-0`}
                      >
                        Start over
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key={buttonLabel}
                      type="button"
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                      }}
                      transition={ROW_SPRING}
                      onClick={() => (needsSecondApproval && !danApproved ? setDanApproved(true) : setReleased(true))}
                      className={`${buttonClass("primary")} absolute inset-0 h-11 w-full text-[15px]`}
                    >
                      {buttonLabel}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <p className="m-0 mt-3 text-[12px] text-[rgb(var(--ferry-faint))]">
                {needsSecondApproval
                  ? `Above $${limit / 1e3}k, so it needs two people.`
                  : secondApprover
                    ? `Under $${limit / 1e3}k, so one approval is enough.`
                    : "One approval is enough with the rule off."}
              </p>
            </div>
          </Panel>
        </div>
      </Frame>
    </section>
  );
}
