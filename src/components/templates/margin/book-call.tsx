"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "./avatar";
import { TEXT_FONT, SPRING } from "./ui";

/** Closing line and a call button. On hover a "You" avatar slides in next to the avatar, like a meeting invite. */
export function BookCall() {
  const [active, setActive] = useState(false);
  return (
    <div
      className="flex flex-col items-center gap-4 border-t px-6 py-12 text-center sm:px-8"
      style={{ borderColor: "var(--line)" }}
    >
      <p className="m-0 text-[18px] italic sm:text-[20px]" style={{ fontFamily: TEXT_FONT, color: "var(--dim)" }}>
        If you&apos;ve read this far, we&apos;d probably work well together.
      </p>
      <motion.a
        href="#"
        onClick={(event) => event.preventDefault()}
        onHoverStart={() => setActive(true)}
        onHoverEnd={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        whileTap={{ scale: 0.97 }}
        className="margin-ring margin-pill flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-[15px] font-medium no-underline outline-none"
        layout
        transition={SPRING}
      >
        <span className="flex items-center">
          <span className="rounded-full p-[2px]" style={{ background: "var(--card)" }}>
            <Avatar size={28} />
          </span>
          <AnimatePresence initial={false}>
            {active && (
              <motion.span
                key="you"
                className="-ml-2 flex items-center"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={SPRING}
              >
                <span
                  className="relative z-10 grid h-[32px] w-[32px] place-items-center rounded-full text-[10px] font-semibold"
                  style={{ background: "var(--chip2)", color: "var(--fg2)", boxShadow: "0 0 0 2px var(--card)" }}
                >
                  You
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <motion.span layout="position">Book a 20-minute call</motion.span>
      </motion.a>
    </div>
  );
}
