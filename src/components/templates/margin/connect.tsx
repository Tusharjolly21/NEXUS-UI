"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LINKS, PROFILE } from "./data";
import { Icon } from "./icons";
import { SPRING } from "./ui";

const BUTTON_CLASS =
  "margin-ring margin-pill inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium no-underline outline-none";
const BUTTON_MOTION = { whileHover: { y: -1 }, whileTap: { scale: 0.96 } };
const COPIED_MS = 1600;

/** The "Mail" button copies the address to the clipboard and says so for a moment. */
function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      // Clipboard access can be blocked (for example inside an iframe); the confirmation still shows.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <motion.button
      type="button"
      onClick={copy}
      className={BUTTON_CLASS}
      {...BUTTON_MOTION}
      aria-live="polite"
      layout
      transition={SPRING}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "copied" : "mail"}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SPRING}
        >
          <Icon name={copied ? "ph:check" : "ph:envelope-simple"} size={15} style={copied ? { color: "#16a34a" } : undefined} />
          {copied ? "Email copied" : "Mail"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Link buttons (GitHub, LinkedIn, copy email, resume) and the footer line. */
export function Connect() {
  const [github, linkedin, resume] = LINKS;
  return (
    <>
      <p className="-mt-3 mb-5 text-[17px]" style={{ color: "var(--dim)" }}>
        Find me across code, work and the occasional essay.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {[github, linkedin].map((link) => (
          <motion.a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={BUTTON_CLASS} {...BUTTON_MOTION}>
            <Icon name={link.icon} size={15} />
            {link.label}
          </motion.a>
        ))}
        <CopyEmailButton />
        <motion.a href={resume.href} className={BUTTON_CLASS} {...BUTTON_MOTION}>
          <Icon name="ph:paperclip" size={15} />
          Resume
        </motion.a>
      </div>
      <div
        className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t pt-6 text-[14px]"
        style={{ borderColor: "var(--line)", color: "var(--faint)" }}
      >
        <span>{PROFILE.copyright}</span>
        <span>{PROFILE.madeIn}</span>
      </div>
    </>
  );
}
