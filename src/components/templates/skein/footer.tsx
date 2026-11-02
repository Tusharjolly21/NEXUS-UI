"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icons";
import { Section, buttonClasses } from "./ui";

type FooterLink = {
  label: string;
  href: string;
  /** Shows the small arrow for links that leave the site. */
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: readonly FooterLink[];
};

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Trace", href: "#trace" },
      { label: "Ask", href: "#ask-feature" },
      { label: "Watch", href: "#watch" },
      { label: "Integrations", href: "#integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Customers", href: "#customers" },
      { label: "About", href: "#top" },
      { label: "Careers", href: "#top" },
      { label: "Blog", href: "#top" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#faq" },
      { label: "Changelog", href: "#top" },
      { label: "Help centre", href: "#faq" },
      { label: "Status", href: "#top" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X", href: "#top", external: true },
      { label: "LinkedIn", href: "#top", external: true },
      { label: "GitHub", href: "#top", external: true },
    ],
  },
];

type SubscribeStatus = "idle" | "error" | "done";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const subscribeNever = () => () => {};
const currentYear = () => new Date().getFullYear();
// The server has no trustworthy "now" for a cached page, so it prints no year and the browser fills it in on hydration.
const serverYear = () => null;

/** The page footer: link columns, a status pill, a demo-only newsletter form, a large wordmark and the legal line. */
export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const year = useSyncExternalStore(subscribeNever, currentYear, serverYear);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(EMAIL_PATTERN.test(email) ? "done" : "error");
  };

  return (
    <footer>
      <Section divider={false}>
        <div className="grid grid-cols-2 gap-10 pt-16 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="m-0 text-[14px] font-medium text-[rgb(var(--skein-ink))]">{column.title}</h3>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-[15px] text-[rgb(var(--skein-mute))] no-underline transition-colors hover:text-[rgb(var(--skein-ink))]"
                    >
                      {link.label}
                      {link.external && <Icon name="arrow_up_right" size={9} />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-solid border-[rgb(var(--skein-line)/.12)] px-3 py-1.5 text-[12px] text-[rgb(var(--skein-ink))]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--skein-live)/.7)] motion-reduce:animate-none" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[rgb(var(--skein-live))]" />
            </span>
            All systems operational
            <span className="h-3 w-px bg-[rgb(var(--skein-line)/.2)]" />
            <span className="font-mono text-[11px] text-[rgb(var(--skein-faint))]">99.99% UPTIME</span>
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor="news" className="text-[13px] text-[rgb(var(--skein-mute))]">
              Release notes, once a month.
            </label>
            <div className="relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {status === "done" ? (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="m-0 flex h-10 items-center gap-2 text-[13px] text-[rgb(var(--skein-ink))]"
                    role="status"
                  >
                    <Icon name="checkmark" size={12} className="text-[rgb(var(--skein-live))]" />
                    Subscribed as {email}
                  </motion.p>
                ) : (
                  <motion.form
                    key="f"
                    onSubmit={handleSubmit}
                    noValidate
                    exit={{ opacity: 0, y: -6 }}
                    className={`flex h-10 w-full items-center rounded-[10px] border border-solid bg-[rgb(var(--skein-panel)/.6)] p-1 transition-[border-color,box-shadow] duration-200 focus-within:shadow-[0_0_0_4px_rgb(var(--skein-ink)/.1)] sm:w-[340px] ${status === "error" ? "border-[rgb(var(--skein-crit)/.6)]" : "border-[rgb(var(--skein-line)/.12)] focus-within:border-[rgb(var(--skein-line)/.32)]"}`}
                  >
                    <input
                      id="news"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      aria-invalid={status === "error"}
                      aria-describedby={status === "error" ? "news-err" : undefined}
                      className="h-full min-w-0 flex-1 rounded-[7px] border-0 bg-transparent px-2.5 text-[13px] text-[rgb(var(--skein-ink))] outline-hidden placeholder:text-[rgb(var(--skein-faint))] focus-visible:outline-hidden"
                    />
                    <button type="submit" className={buttonClasses("primary", "sm")}>
                      Subscribe
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              {status === "error" && (
                <p id="news-err" role="alert" className="absolute left-0 top-full m-0 mt-1 text-[12px] text-[rgb(var(--skein-crit))]">
                  Enter an email like name@company.com.
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="relative mt-16 flex select-none items-center gap-[2vw] overflow-hidden pb-2 text-[rgb(var(--skein-ink)/.06)] dark:text-[rgb(var(--skein-ink)/.05)]"
        >
          <span className="shrink-0" style={{ width: "min(17vw, 190px)" }}>
            <Icon name="scribble" size={190} className="h-auto w-full" />
          </span>
          <span className="skein-display font-bold leading-[0.8] tracking-[-0.05em]" style={{ fontSize: "min(21vw, 250px)" }}>
            Skein
          </span>
        </div>
        <div className="flex flex-col gap-2 border-t border-solid border-[rgb(var(--skein-line)/.09)] py-6 text-[12px] text-[rgb(var(--skein-faint))] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">© {year} Skein. A template: company names, people and figures are sample content.</p>
          <p className="m-0">
            <a href="#top" className="text-[rgb(var(--skein-faint))] no-underline hover:text-[rgb(var(--skein-ink))]">
              Terms
            </a>{" "}
            /{" "}
            <a href="#top" className="text-[rgb(var(--skein-faint))] no-underline hover:text-[rgb(var(--skein-ink))]">
              Privacy
            </a>
          </p>
        </div>
      </Section>
    </footer>
  );
}
