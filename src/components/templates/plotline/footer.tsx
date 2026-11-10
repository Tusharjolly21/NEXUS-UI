"use client";

import { motion } from "framer-motion";
import { COLOR, CONTAINER, EASE, FONT_DISPLAY } from "./theme";
import { Logo } from "./ui";
export function Footer() {
  const columns: [heading: string, links: string[]][] = [
    ["Product", ["Features", "Pricing", "Changelog"]],
    ["Company", ["Customers", "Contact", "Book a demo"]],
    ["Follow", ["X", "LinkedIn", "GitHub"]],
  ];
  return (
    <footer
      style={{
        borderTop: `1px solid ${COLOR.line}`,
      }}
    >
      <div
        className={CONTAINER}
        style={{
          borderLeft: `1px solid ${COLOR.line}`,
          borderRight: `1px solid ${COLOR.line}`,
        }}
      >
        <div className="grid gap-12 px-5 pb-6 pt-16 sm:px-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Logo />
            <p
              className="m-0 mt-5 max-w-[320px] text-[15px] leading-[1.55]"
              style={{
                color: COLOR.soft,
              }}
            >
              The planning tool for teams that ship. Requests, roadmaps and
              releases in one calm workspace.
            </p>
            <span
              className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px]"
              style={{
                boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
                color: COLOR.ink,
              }}
            >
              <i
                className="pl-anim h-2 w-2 rounded-full"
                style={{
                  background: COLOR.green,
                  animation: "pl-pulse 1.8s ease-out infinite",
                }}
              />
              All systems normal
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6">
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
                <ul className="m-0 mt-4 grid list-none gap-3 p-0">
                  {links.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(event) => event.preventDefault()}
                        className="pl-ring rounded text-[15px] no-underline outline-none transition-colors hover:text-[#0E1116]"
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
          aria-hidden={true}
          className="select-none overflow-hidden px-3 text-center font-medium sm:px-10"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(80px, 19vw, 270px)",
            letterSpacing: "-0.06em",
            lineHeight: 0.92,
          }}
        >
          {"Plotline".split("").map((item, index) => (
            <motion.span
              className="inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #E6E9EE 10%, #F7F8FA 90%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              initial={{
                y: "40%",
                opacity: 0,
              }}
              whileInView={{
                y: 0,
                opacity: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.9,
                ease: EASE,
                delay: index * 0.04,
              }}
              key={index}
            >
              {item}
            </motion.span>
          ))}
        </div>
        <div
          className="flex flex-wrap justify-between gap-3 px-5 py-5 text-[13px] sm:px-16"
          style={{
            borderTop: `1px solid ${COLOR.line}`,
            color: COLOR.soft,
          }}
        >
          <span>
            © 2026 Plotline, a fictional company made for this template.
          </span>
          <span>Made for teams that ship</span>
        </div>
      </div>
    </footer>
  );
}
