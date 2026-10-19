"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrbitFooterLink = { label: string; href: string; badge?: string };
export type OrbitFooterColumn = { title: string; links: OrbitFooterLink[] };

export type OrbitFooterProps = {
  /** Wordmark shown top-left and as the large ghost word at the bottom. */
  brand?: string;
  tagline?: string;
  columns?: OrbitFooterColumn[];
  /** Status line next to the green dot. Pass `null` to hide it. */
  status?: string | null;
  statusHref?: string;
  /** Newsletter signup. Called with the email; return a promise to show a pending state. */
  onSubscribe?: (email: string) => Promise<void> | void;
  showNewsletter?: boolean;
  /** Draw the giant ghost wordmark under the links. */
  showWordmark?: boolean;
  className?: string;
};

const DEFAULT_COLUMNS: OrbitFooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Components", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Blocks", href: "#", badge: "New" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "#" },
      { label: "CLI", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#", badge: "3" },
      { label: "Contact", href: "#" },
    ],
  },
];

function XMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.36 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/**
 * A complete site footer: brand and a newsletter field on the left, link columns on the right,
 * a live status pill, and a giant ghost wordmark that rises into view.
 */
export function OrbitFooter({
  brand = "Orbit",
  tagline = "Interfaces that move, shipped as code you own.",
  columns = DEFAULT_COLUMNS,
  status = "All systems normal",
  statusHref = "#",
  onSubscribe,
  showNewsletter = true,
  showWordmark = true,
  className,
}: OrbitFooterProps) {
  const reduce = useReducedMotion();
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "pending" | "done">("idle");
  const year = new Date().getFullYear();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || state !== "idle") return;
    setState("pending");
    try {
      await onSubscribe?.(email);
      if (!onSubscribe) await new Promise((r) => setTimeout(r, 700));
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <footer
      className={cn(
        "relative isolate flex w-full flex-col overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white text-zinc-600",
        "dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.14),transparent)] dark:bg-[radial-gradient(closest-side,rgba(129,140,248,0.18),transparent)]"
      />

      <div className="grid gap-10 px-8 pb-6 pt-10 md:grid-cols-[1.15fr_2fr] md:px-10">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative grid size-8 place-items-center rounded-full bg-zinc-950 dark:bg-white">
              <span className="size-3 rounded-full border-2 border-white dark:border-zinc-950" />
              <motion.span
                aria-hidden
                className="absolute inset-0"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-indigo-400" />
              </motion.span>
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">{brand}</span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed">{tagline}</p>

          {showNewsletter ? (
            <form onSubmit={submit} className="mt-6">
              <label htmlFor="orbit-footer-email" className="text-[12.5px] font-medium text-zinc-950 dark:text-white">
                Monthly notes on motion and craft
              </label>
              <div className="mt-2 flex h-11 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 pl-4 transition-colors focus-within:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/30">
                <input
                  id="orbit-footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  disabled={state !== "idle"}
                  className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className={cn(
                    "grid h-9 shrink-0 place-items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    state === "done"
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
                  )}
                >
                  {state === "done" ? (
                    <span className="flex items-center gap-1"><Check className="size-3.5" /> Subscribed</span>
                  ) : state === "pending" ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12.5px] font-semibold text-zinc-950 dark:text-white">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-[14px] transition-colors hover:text-zinc-950 dark:hover:text-white"
                    >
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                      {l.badge ? (
                        <span className="rounded-full bg-indigo-500/10 px-1.5 py-px text-[10.5px] font-semibold text-indigo-600 dark:text-indigo-300">
                          {l.badge}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/80 py-4 text-[12.5px] md:mx-10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <span>© {year} {brand} Labs</span>
          <a href="#" className="hover:text-zinc-950 dark:hover:text-white">Privacy</a>
          <a href="#" className="hover:text-zinc-950 dark:hover:text-white">Terms</a>
        </div>
        <div className="flex items-center gap-2">
          {status ? (
            <a
              href={statusHref}
              className="mr-1 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-2.5 py-1 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20"
            >
              <span className="relative flex size-2">
                {!reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" /> : null}
                <span className="relative size-2 rounded-full bg-emerald-500" />
              </span>
              {status}
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
          {[
            { label: "X", Icon: XMark },
            { label: "GitHub", Icon: GithubMark },
          ].map(({ label, Icon }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid size-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-400 dark:hover:text-white"
            >
              <Icon className="size-3.5" />
            </a>
          ))}
        </div>
      </div>

      {showWordmark ? (
        <div aria-hidden className="relative -mb-[0.22em] select-none overflow-hidden px-6 leading-none">
          <motion.p
            initial={reduce ? false : { y: "40%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="bg-gradient-to-b from-zinc-300 to-zinc-100/40 bg-clip-text text-center text-[clamp(72px,17vw,190px)] font-semibold tracking-[-0.06em] text-transparent dark:from-white/14 dark:to-white/[0.02]"
          >
            {brand.toLowerCase()}
          </motion.p>
        </div>
      ) : null}
    </footer>
  );
}
