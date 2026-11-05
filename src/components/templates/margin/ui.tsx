"use client";

import { useState, type MouseEventHandler, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Font stacks. The families are set once, as CSS variables, in `styles.ts`. */
export const DISPLAY_FONT = "var(--margin-display)";
export const TEXT_FONT = "var(--margin-text)";

/** The spring used for almost every small motion on the page. */
export const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/** A small dark label that appears under a control while it is hovered or focused. */
function Tooltip({ label, show }: { label: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          role="tooltip"
          initial={{ opacity: 0, y: -4, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -2, scale: 0.96 }}
          transition={SPRING}
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 whitespace-nowrap rounded-[8px] px-2 py-1 text-[12px] font-medium"
          style={{ x: "-50%", background: "var(--fg)", color: "var(--page)" }}
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

type IconButtonProps = {
  label: string;
  children: ReactNode;
  /** Renders a link when set, a button otherwise. */
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

/** Round 32px button with a tooltip: a link when it has an `href`, a button when it has an `onClick`. */
export function IconButton({ label, children, href, onClick }: IconButtonProps) {
  const [tipOpen, setTipOpen] = useState(false);
  const className = "margin-ring margin-pill relative grid h-8 w-8 place-items-center rounded-full outline-none";
  const content = (
    <>
      {children}
      <Tooltip label={label} show={tipOpen} />
    </>
  );
  const shared = {
    onHoverStart: () => setTipOpen(true),
    onHoverEnd: () => setTipOpen(false),
    onFocus: () => setTipOpen(true),
    onBlur: () => setTipOpen(false),
    whileTap: { scale: 0.9 },
    whileHover: { y: -1 },
    "aria-label": label,
    className,
  };

  if (href) {
    // Placeholder links ("#") stay in the page; real URLs open in a new tab.
    const external = href.startsWith("http");
    return (
      <motion.a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...shared}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} {...shared}>
      {content}
    </motion.button>
  );
}

/** A titled block of the page, separated from the one above by a hairline. */
export function Section({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="border-t px-6 py-10 sm:px-8" style={{ borderColor: "var(--line)" }}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="m-0 text-[20px] font-normal leading-7" style={{ fontFamily: DISPLAY_FONT, color: "var(--dim)" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
