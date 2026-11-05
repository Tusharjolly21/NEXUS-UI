"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icons";

/** An inline link that opens a small floating card on hover or keyboard focus. */
function HoverCard({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a
        href="#"
        onClick={(event) => event.preventDefault()}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="margin-ring rounded-[4px] font-medium no-underline outline-none"
        style={{ color: "var(--accent)" }}
      >
        {label}
        <Icon name="ph:arrow-square-out" size={13} className="ml-0.5 inline align-[-1px]" />
      </a>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, scale: 0.97, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
            className="margin-pill pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 block w-[260px] overflow-hidden rounded-[14px] p-1.5"
            style={{ x: "-50%", originY: 1 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function CardBody({ title, text }: { title: string; text: string }) {
  return (
    <span className="block rounded-[10px] p-3 text-[13px] leading-[1.5]" style={{ background: "var(--chip)", color: "var(--fg2)" }}>
      <b className="block text-[14px]" style={{ color: "var(--fg)" }}>
        {title}
      </b>
      {text}
    </span>
  );
}

/** The opening paragraph, with two inline links that preview what they point to. */
export function Intro() {
  return (
    <div className="border-t px-6 py-8 sm:px-8" style={{ borderColor: "var(--line)" }}>
      <p className="m-0 text-[17px] leading-[1.7] tracking-[-0.01em] sm:text-[18px]" style={{ color: "var(--fg2)" }}>
        <span className="font-medium" style={{ color: "var(--fg)" }}>
          I design interfaces and then build them myself.
        </span>{" "}
        Currently running{" "}
        <HoverCard label="Northlight">
          <CardBody
            title="Northlight"
            text="A two-person studio building first versions for early-stage teams. 14 launches since 2024."
          />
        </HoverCard>
        , a small studio, and writing{" "}
        <HoverCard label="Fieldnotes">
          <CardBody title="Fieldnotes" text="A monthly letter on interface craft. 3,100 readers, no tracking pixels." />
        </HoverCard>
        .{" "}
        Most of my work lives between a designer&apos;s file and a shipped product: the states nobody drew, the motion that
        tells you what just happened, and the details that make an app feel finished on the first click.
      </p>
    </div>
  );
}
