"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { COLOR, CONTAINER, EASE } from "./theme";
import { Icon, Logo } from "./ui";
export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const columns: [heading: string, links: string[]][] = [
    ["Product", ["Settle API", "Route API", "Sponsor API", "Ledger", "Pricing"]],
    ["Developers", ["Docs", "Quickstart", "SDKs", "Status", "Changelog"]],
    ["Company", ["Brand", "Customers", "Careers", "Blog", "Contact"]],
    ["Legal", ["Privacy", "Terms", "Security", "Audit reports"]],
  ];
  return (
    <footer className="relative">
      <div
        aria-hidden={true}
        className="absolute left-0 top-0 h-px w-[60%]"
        style={{
          background: `linear-gradient(90deg, transparent, ${COLOR.blue}, transparent)`,
          boxShadow: `0 0 24px 4px ${COLOR.pale}`,
        }}
      />
      <div className={`${CONTAINER} pt-16`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Logo />
            <p
              className="m-0 mt-4 text-[14px]"
              style={{
                color: COLOR.soft,
              }}
            >
              Monthly notes on onchain payments
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email.includes("@")) {
                  setSubscribed(true);
                }
              }}
              className="mt-3 flex max-w-[340px] gap-2"
            >
              <label htmlFor="wf-news" className="sr-only">
                Email
              </label>
              <input
                id="wf-news"
                type="email"
                required={true}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="wf-ring min-w-0 flex-1 rounded-[12px] border-0 bg-white px-3.5 py-2.5 text-[14px] outline-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                  color: COLOR.ink,
                }}
              />
              <button
                type="submit"
                className="wf-ring rounded-[12px] px-4 text-[14px] font-medium outline-none"
                style={{
                  background: subscribed ? COLOR.greenWash : "#ECEDF0",
                  color: subscribed ? "#11592E" : COLOR.ink,
                }}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map(([heading, links]) => (
              <div key={heading}>
                <h3
                  className="m-0 text-[14px] font-medium"
                  style={{
                    color: COLOR.ink,
                  }}
                >
                  {heading}
                </h3>
                <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                  {links.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(event) => event.preventDefault()}
                        className="wf-ring rounded text-[14px] no-underline outline-none transition-colors hover:text-[#111214]"
                        style={{
                          color: COLOR.soft,
                        }}
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          className="mt-14 flex flex-wrap items-center justify-between gap-4 py-6 text-[13px]"
          style={{
            borderTop: `1px solid ${COLOR.line}`,
            color: COLOR.soft,
          }}
        >
          <span>© 2026 Wharf Labs, a fictional company made for this template.</span>
          <span className="flex gap-1">
            {(
              [
                ["ph:x-logo", "X"],
                ["ph:github-logo", "GitHub"],
                ["ph:discord-logo", "Discord"],
                ["ph:linkedin-logo", "LinkedIn"],
              ] as const
            ).map(([icon, label]) => (
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                aria-label={label}
                className="wf-ring grid h-8 w-8 place-items-center rounded-full outline-none transition-colors hover:bg-black/5"
                style={{
                  color: COLOR.ink,
                }}
                key={label}
              >
                <Icon name={icon} size={16} />
              </a>
            ))}
          </span>
        </div>
        <div
          aria-hidden={true}
          className="select-none overflow-hidden font-medium"
          style={{
            fontSize: "clamp(110px, 24vw, 340px)",
            letterSpacing: "-0.07em",
            lineHeight: 0.78,
            height: "0.62em",
            color: "#DCDEE2",
          }}
        >
          {"Wharf".split("").map((item, index) => (
            <motion.span
              className="inline-block"
              initial={{
                y: "50%",
              }}
              whileInView={{
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1,
                ease: EASE,
                delay: index * 0.05,
              }}
              key={index}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </footer>
  );
}
