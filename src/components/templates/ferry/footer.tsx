// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandIcon, Icon, buttonClass } from "./ui";

export const FOOTER_COLUMNS = [
  [
    "Product",
    [
      ["Treasury", "#accounts"],
      ["Payouts", "#payouts"],
      ["Approvals", "#controls"],
      ["Pricing", "#pricing"],
    ],
  ],
  [
    "Company",
    [
      ["About", "#top"],
      ["Careers", "#top"],
      ["Press", "#top"],
      ["Contact", "#open"],
    ],
  ],
  [
    "Developers",
    [
      ["API reference", "#developers"],
      ["Webhooks", "#developers"],
      ["Sandbox", "#developers"],
      ["Status", "#top"],
    ],
  ],
  [
    "Legal",
    [
      ["Privacy", "#top"],
      ["Terms", "#top"],
      ["Cookies", "#top"],
      ["Safeguarding", "#faq"],
    ],
  ],
  [
    "Security",
    [
      ["Trust centre", "#top"],
      ["Compliance", "#top"],
      ["Data residency", "#top"],
      ["Report a vulnerability", "#top"],
    ],
  ],
];

export const SOCIAL_LINKS = [
  ["x", "X"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["youtube", "YouTube"],
];

export function Footer() {
  const [e, t] = useState(""),
    [n, r] = useState("idle"),
    i = (s) => {
      (s.preventDefault(), r(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? "sent" : "error"));
    };
  return (
    <footer className="px-3 pb-6 sm:px-6">
      <div className="mx-auto max-w-[1160px] rounded-[28px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-frame))] p-2">
        <div className="relative overflow-hidden rounded-[22px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.82)] px-5 py-8 sm:px-8 sm:py-10">
          <span aria-hidden="true" className="ferry-glow !right-[-120px] !top-[-160px]" />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div>
              <a
                href="#top"
                className="flex items-center gap-2.5 text-[28px] font-medium tracking-[-0.03em] text-[rgb(var(--ferry-ink))] no-underline"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
                  <Icon name="globe" size={20} />
                </span>
                Ferry
              </a>
              <p className="m-0 mt-4 max-w-[26em] text-[15px] leading-[1.6] text-[rgb(var(--ferry-mute))]">
                Ferry gives finance teams one place for multi-currency accounts, exchange at the real rate,
                and payouts that land in minutes.
              </p>
              <ul className="m-0 mt-6 flex list-none gap-2 p-0">
                {SOCIAL_LINKS.map(([s, o]) => (
                  <li key={s}>
                    <a
                      href="#top"
                      aria-label={`Ferry on ${o}`}
                      className="grid h-9 w-9 place-items-center rounded-[9px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-mute))] transition-colors hover:border-[rgb(var(--ferry-line)/.2)] hover:text-[rgb(var(--ferry-ink))]"
                    >
                      <BrandIcon name={s} size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <section
              id="open"
              className="relative scroll-mt-28 rounded-[18px] border border-solid border-[rgb(var(--ferry-accent)/.2)] bg-[rgb(var(--ferry-surface))] p-5 shadow-[0_0_0_4px_rgb(var(--ferry-accent)/.04),0_24px_48px_-30px_rgb(var(--ferry-accent)/.45)]"
            >
              <p className="m-0 text-[10px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-accent-ink))]">
                Open an account
              </p>
              <h2 className="m-0 mt-2 text-[18px] font-medium tracking-[-0.01em] text-[rgb(var(--ferry-ink))]">
                Get started in about ten minutes.
              </h2>
              <p className="m-0 mt-1.5 text-[13px] leading-[1.5] text-[rgb(var(--ferry-mute))]">
                {
                  "Use your work email. We'll send a link to finish signing up, and most companies are approved the same day."
                }
              </p>
              <div className="relative mt-4 min-h-[72px]">
                <AnimatePresence mode="popLayout" initial={!1}>
                  {n !== "sent" ? (
                    <motion.form
                      key={"form"}
                      onSubmit={i}
                      noValidate={!0}
                      exit={{
                        opacity: 0,
                        y: -8,
                        filter: "blur(4px)",
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <label htmlFor="cta-email" className="sr-only">
                          Work email
                        </label>
                        <input
                          id="cta-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          value={e}
                          onChange={(s) => {
                            (t(s.target.value), n === "error" && r("idle"));
                          }}
                          aria-invalid={n === "error"}
                          aria-describedby="cta-hint"
                          className={`h-10 w-full min-w-0 rounded-[10px] border border-solid bg-[rgb(var(--ferry-raised))] px-3 text-[14px] text-[rgb(var(--ferry-ink))] outline-hidden transition-colors placeholder:text-[rgb(var(--ferry-faint))] focus:border-[rgb(var(--ferry-accent)/.6)] sm:flex-1 ${n === "error" ? "border-[rgb(var(--ferry-loss)/.6)]" : "border-[rgb(var(--ferry-line)/.1)]"}`}
                        />
                        <button type="submit" className={`${buttonClass("primary")} shrink-0`}>
                          Open account
                          <Icon name="arrow_up_right" size={11} />
                        </button>
                      </div>
                      <motion.p
                        key={n}
                        id="cta-hint"
                        initial={{
                          opacity: 0,
                          x: n === "error" ? -6 : 0,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 600,
                          damping: 18,
                        }}
                        className={`m-0 mt-2.5 text-[12px] ${n === "error" ? "text-[rgb(var(--ferry-loss))]" : "text-[rgb(var(--ferry-faint))]"}`}
                        role={n === "error" ? "alert" : void 0}
                      >
                        {n === "error"
                          ? "Enter a work email, like maya@northwind.com."
                          : "No card needed. Starter is free."}
                      </motion.p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key={"sent"}
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className="flex items-start gap-3 rounded-[12px] border border-solid border-[rgb(var(--ferry-gain)/.25)] bg-[rgb(var(--ferry-gain)/.08)] p-3"
                      role="status"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgb(var(--ferry-gain))] text-white">
                        <Icon name="envelope" size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                          Check your inbox
                        </span>
                        <span className="mt-0.5 block break-words text-[13px] text-[rgb(var(--ferry-mute))]">
                          {"We sent a sign-up link to "}
                          {e}.{" "}
                          <button
                            type="button"
                            onClick={() => r("idle")}
                            className="text-[rgb(var(--ferry-accent-ink))] underline underline-offset-2"
                          >
                            Use a different email
                          </button>
                        </span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p
                id="signin"
                className="m-0 mt-3 border-t border-solid border-[rgb(var(--ferry-line)/.07)] pt-3 text-[12px] text-[rgb(var(--ferry-faint))]"
              >
                Already with Ferry?{" "}
                <a href="#top" className="text-[rgb(var(--ferry-ink))] no-underline hover:underline">
                  Sign in
                </a>
              </p>
            </section>
          </div>
          <div className="relative mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-solid border-[rgb(var(--ferry-line)/.08)] pt-10 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER_COLUMNS.map(([s, o]) => (
              <nav key={s} aria-label={s}>
                <h3 className="m-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--ferry-ink))]">
                  {s}
                </h3>
                <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                  {o.map(([l, c]) => (
                    <li key={l}>
                      <a
                        href={c}
                        className="text-[14px] text-[rgb(var(--ferry-mute))] no-underline transition-colors hover:text-[rgb(var(--ferry-ink))]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 text-[12px] text-[rgb(var(--ferry-faint))] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            {"© "}
            {new Date().getFullYear()}
            {" Ferry. A template: the company, people, rates and accounts shown are sample content."}
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
            {["Privacy", "Terms", "Security", "Cookie settings"].map((s) => (
              <li key={s}>
                <a
                  href="#top"
                  className="text-[rgb(var(--ferry-faint))] no-underline hover:text-[rgb(var(--ferry-ink))]"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
