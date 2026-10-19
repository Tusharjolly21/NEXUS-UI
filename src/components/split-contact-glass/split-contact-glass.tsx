"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Mail, MapPin, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type SplitContactValues = { name: string; email: string; topic: string; message: string };

export type SplitContactProps = {
  heading?: string;
  intro?: string;
  email?: string;
  location?: string;
  /** IANA time zone used for the live local-time line. */
  timeZone?: string;
  replyTime?: string;
  topics?: string[];
  /** Called with the values; return a promise to show the sending state. */
  onSubmit?: (values: SplitContactValues) => Promise<void> | void;
  maxLength?: number;
  className?: string;
};

function useLocalTime(timeZone: string) {
  const [now, setNow] = React.useState<string | null>(null);
  React.useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [timeZone]);
  return now;
}

/**
 * A contact section in two panes: a lit glass panel with how to reach the team (and their local
 * time), and a form with topic chips, a counted message field and a send button that confirms.
 */
export function SplitContact({
  heading = "Let’s build something good",
  intro = "Tell us what you’re making. A designer and an engineer read every message.",
  email = "hello@studio.dev",
  location = "Lisbon, Portugal",
  timeZone = "Europe/Lisbon",
  replyTime = "Replies within a day",
  topics = ["Custom work", "Partnership", "Support", "Press"],
  onSubmit,
  maxLength = 500,
  className,
}: SplitContactProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const time = useLocalTime(timeZone);
  const [values, setValues] = React.useState<SplitContactValues>({ name: "", email: "", topic: topics[0] ?? "", message: "" });
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle");
  const set = (k: keyof SplitContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value.slice(0, k === "message" ? maxLength : 200) }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("sending");
    try {
      if (onSubmit) await onSubmit(values);
      else await new Promise((r) => setTimeout(r, 1000));
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  const field =
    "w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[14px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-950 focus:shadow-[0_0_0_4px_rgba(23,23,28,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/40";

  return (
    <section
      className={cn(
        "grid w-full gap-2 overflow-hidden rounded-[28px] border border-zinc-200/80 bg-zinc-100 p-2 md:grid-cols-[0.9fr_1.1fr]",
        "dark:border-white/10 dark:bg-zinc-900",
        className,
      )}
    >
      <div className="relative isolate flex flex-col overflow-hidden rounded-[22px] bg-[#0c0c12] p-7 text-white">
        <div aria-hidden className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -right-16 -top-20 size-72 rounded-full bg-[conic-gradient(from_90deg,#22d3ee,#6366f1,#ec4899,#22d3ee)] opacity-50 blur-3xl"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(255,255,255,0.06),transparent)]" />
        </div>
        <h2 className="text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">{heading}</h2>
        <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-white/60">{intro}</p>

        <ul className="mt-8 space-y-2">
          {[
            { Icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
            { Icon: MapPin, label: "Studio", value: location },
            { Icon: Clock, label: "Local time", value: time ? `${time} · ${replyTime}` : replyTime },
          ].map(({ Icon, label, value, href }) => (
            <li key={label}>
              <a
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md transition-colors hover:bg-white/[0.07]"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-white/10">
                  <Icon className="size-4 text-white/80" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11.5px] text-white/45">{label}</span>
                  <span className="block truncate text-[13.5px] font-medium tabular-nums">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-3 pt-8">
          <div className="flex -space-x-2">
            {[
              ["#f59e0b", "#ef4444", "LM"],
              ["#6366f1", "#06b6d4", "JK"],
              ["#10b981", "#84cc16", "SA"],
            ].map(([a, b, t]) => (
              <span key={t} className="grid size-8 place-items-center rounded-full text-[11px] font-semibold ring-2 ring-[#0c0c12]" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
                {t}
              </span>
            ))}
          </div>
          <p className="text-[12.5px] text-white/60">The people who&apos;ll read your note</p>
        </div>
      </div>

      <div className="relative rounded-[22px] bg-white p-7 dark:bg-zinc-950">
        <AnimatePresence mode="wait" initial={false}>
          {state === "sent" ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center py-12 text-center" role="status">
              <span className="grid size-14 place-items-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Check className="size-7" strokeWidth={3} />
              </span>
              <p className="mt-5 text-[19px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">Message sent</p>
              <p className="mt-1.5 max-w-xs text-[14px] text-zinc-500 dark:text-zinc-400">Thanks{values.name ? `, ${values.name.split(" ")[0]}` : ""}. We&apos;ll write back to {values.email || "you"} soon.</p>
              <button type="button" onClick={() => setState("idle")} className="mt-6 text-[13px] font-medium text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline dark:hover:text-white">
                Send another
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -6 }} className="space-y-4">
              <fieldset>
                <legend className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">What&apos;s it about?</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topics.map((t) => {
                    const on = values.topic === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValues((v) => ({ ...v, topic: t }))}
                        className={cn(
                          "relative h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                          on ? "text-white dark:text-zinc-950" : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
                        )}
                      >
                        {on ? (
                          <motion.span
                            layoutId={`${id}-topic`}
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                            className="absolute inset-0 rounded-full bg-zinc-950 dark:bg-white"
                          />
                        ) : (
                          <span className="absolute inset-0 rounded-full border border-zinc-200 dark:border-white/10" />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor={`${id}-name`} className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                  <input id={`${id}-name`} required value={values.name} onChange={set("name")} placeholder="Ada Lovelace" autoComplete="name" className={cn(field, "h-11")} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`${id}-email`} className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                  <input id={`${id}-email`} type="email" required value={values.email} onChange={set("email")} placeholder="ada@studio.com" autoComplete="email" className={cn(field, "h-11")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${id}-msg`} className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Message</label>
                  <span className={cn("text-[11.5px] tabular-nums", values.message.length > maxLength * 0.9 ? "text-amber-600" : "text-zinc-400")}>
                    {values.message.length}/{maxLength}
                  </span>
                </div>
                <textarea id={`${id}-msg`} required rows={4} value={values.message} onChange={set("message")} placeholder="A launch page for our new product, ideally live by March…" className={cn(field, "resize-none py-3 leading-relaxed")} />
              </div>

              <button
                type="submit"
                disabled={state === "sending"}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-[14px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-80 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {state === "sending" ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    Send message
                    <Send className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
