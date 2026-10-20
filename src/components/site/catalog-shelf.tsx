"use client";

import * as React from "react";
import Link from "next/link";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A number that counts up once when it scrolls into view. The server renders the real value, so
 * it reads correctly without JavaScript and for crawlers; the count only replays the arrival.
 */
function CountUp({ to }: { to: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!seen || reduce || !el || to < 2) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [seen, reduce, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {to}
    </span>
  );
}

type Shelf = { value: number; title: string; body: string; href: string; cta: string; tint: string };

function ShelfCard({ item }: { item: Shelf }) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-[28px] bg-card p-6 shadow-[0_0_0_0.5px_var(--border)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_0_0_0.5px_var(--border),0_24px_48px_-24px_rgba(0,0,0,0.3)]">
      <span aria-hidden className={cn("pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-70 blur-2xl", item.tint)} />
      <p className="pg-display relative text-[64px] leading-none text-foreground">
        <CountUp to={item.value} />
      </p>
      <h3 className="relative mt-5 text-[19px] font-semibold tracking-[-0.02em] text-foreground">{item.title}</h3>
      <p className="relative mt-1.5 flex-1 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
      <Link
        href={item.href}
        className="mt-5 inline-flex items-center gap-0.5 text-[15px] font-medium text-link after:absolute after:inset-0 after:rounded-[28px] after:content-[''] focus-visible:outline-none [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-2 [&:focus-visible]:after:outline-ring"
      >
        {item.cta}
        <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}

function CommandCard({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <li className="relative flex flex-col overflow-hidden rounded-[28px] bg-[#1d1d1f] p-6 text-white shadow-[0_24px_48px_-28px_rgba(0,0,0,0.5)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)]">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-[#0a84ff]/40 blur-2xl" />
      <p className="pg-display relative text-[64px] leading-none">1</p>
      <h3 className="relative mt-5 text-[19px] font-semibold tracking-[-0.02em]">Command to add one</h3>
      <p className="relative mt-1.5 flex-1 text-[15px] leading-relaxed text-white/60">
        The component, its utilities and its packages land in your project, ready to edit.
      </p>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            ?.writeText(command)
            .then(() => setCopied(true))
            .catch(() => {})
        }
        className="relative mt-5 flex w-full items-center gap-2 rounded-2xl bg-white/[0.08] px-3.5 py-3 text-left font-mono text-[12.5px] text-white/85 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
        aria-label={copied ? "Copied" : `Copy ${command}`}
      >
        <span className="text-white/40">$</span>
        <span className="min-w-0 flex-1 truncate">{command}</span>
        {copied ? <Check className="size-4 shrink-0 text-[#30d158]" aria-hidden /> : <Copy className="size-4 shrink-0 text-white/50" aria-hidden />}
      </button>
    </li>
  );
}

/**
 * What's in the box, as four doors instead of four numbers: each card counts up, says what you
 * get and opens that part of the site; the last one is the install command itself.
 */
export function CatalogShelf({
  components,
  freeComponents,
  templates,
  blocks,
  command,
}: {
  components: number;
  freeComponents: number;
  templates: number;
  blocks: number;
  command: string;
}) {
  const items: Shelf[] = [
    {
      value: components,
      title: "Components that move",
      body: `Springs, physics and gestures you'd spend a week tuning. ${freeComponents} of them are free.`,
      href: "/components",
      cta: "Play with them",
      tint: "bg-[#bf5af2]/25",
    },
    {
      value: templates,
      title: "Whole landing pages",
      body: "Complete sites built from these pieces. Open one live and see it on your screen.",
      href: "/templates",
      cta: "Open a template",
      tint: "bg-[#ff9f0a]/25",
    },
    {
      value: blocks,
      title: "Sections, ready to drop in",
      body: "Pricing, FAQ, contact, logo walls and more, already designed and wired up.",
      href: "/blocks",
      cta: "Browse blocks",
      tint: "bg-[#30d158]/25",
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <ShelfCard key={item.href} item={item} />
      ))}
      <CommandCard command={command} />
    </ul>
  );
}
