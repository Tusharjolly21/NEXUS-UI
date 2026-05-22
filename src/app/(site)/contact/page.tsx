"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  LifeBuoy,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { NexusMark } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const contactChannels = [
  {
    title: "Product support",
    description: "Get help with installs, registry access, component setup, or billing.",
    href: "mailto:contact@nexus-ui.com?subject=Nexus%20UI%20support",
    label: "contact@nexus-ui.com",
    icon: LifeBuoy,
  },
  {
    title: "Custom builds",
    description: "Bring us a landing page, dashboard, or motion idea you want shaped into code.",
    href: "mailto:contact@nexus-ui.com?subject=Custom%20Nexus%20UI%20build",
    label: "Start a build brief",
    icon: Sparkles,
  },
  {
    title: "Partnerships",
    description: "For creator, education, agency, or marketplace conversations.",
    href: "mailto:contact@nexus-ui.com?subject=Nexus%20UI%20partnership",
    label: "Talk partnerships",
    icon: MessageSquare,
  },
] as const;

const supportDetails = [
  "Component install and registry setup",
  "Premium access and license questions",
  "Template customization guidance",
  "Bug reports with reproduction links",
] as const;

export default function ContactPage() {
  const [fields, setFields] = React.useState({ name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          company: fields.topic,
          message: fields.message,
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        setFields({ name: "", email: "", topic: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_34%),radial-gradient(circle_at_12%_44%,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] bg-[size:auto,auto,30px_30px] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_12%_44%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)]" />

      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
            <NexusMark size={16} />
            Nexus UI support desk
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Tell us what you are building.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Questions about components, premium access, templates, or a custom
            interface? Send the details and we will help you find the cleanest path.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/docs/installation"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-full border-border/70 bg-background/70 px-6 backdrop-blur",
              )}
            >
              Read installation docs
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-6 shadow-[0_24px_90px_-70px_rgba(15,23,42,0.65)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl border border-border/70 bg-background text-foreground dark:border-white/10 dark:bg-white/[0.06]">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Fastest route</p>
                  <Link
                    href="mailto:contact@nexus-ui.com"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Send us an email →
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {supportDetails.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/65 px-3 py-2.5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.035]"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-violet-500 dark:text-violet-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-border/70 bg-card/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                <Clock3 className="size-5 text-violet-500 dark:text-violet-300" />
                <p className="mt-4 text-sm font-semibold">Reply window</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Most messages get a thoughtful reply within one business day.
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-card/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                <Code2 className="size-5 text-sky-500 dark:text-sky-300" />
                <p className="mt-4 text-sm font-semibold">Helpful context</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Include your repo, component name, command output, or screenshot when relevant.
                </p>
              </div>
            </div>
          </aside>

          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-4 shadow-[0_34px_120px_-80px_rgba(124,58,237,0.75)] backdrop-blur dark:border-white/10 dark:bg-white/[0.045] sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-8 size-56 rounded-full bg-sky-500/10 blur-3xl" />

            {status === "success" ? (
              <div className="relative flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid size-14 place-items-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <Send className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Message sent</p>
                  <p className="mt-1 text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative grid gap-5">
                <div>
                  <p className="text-lg font-semibold tracking-tight">Send a message</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill in the details and we&apos;ll reply within 24 hours.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={fields.name}
                      onChange={handleChange}
                      autoComplete="name"
                      placeholder="Ariana Reed"
                      required
                      disabled={status === "loading"}
                      className="h-11 rounded-2xl bg-background/70 px-4 dark:bg-white/[0.04]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={fields.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@company.com"
                      required
                      disabled={status === "loading"}
                      className="h-11 rounded-2xl bg-background/70 px-4 dark:bg-white/[0.04]"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    value={fields.topic}
                    onChange={handleChange}
                    placeholder="Registry install help, custom section, billing..."
                    disabled={status === "loading"}
                    className="h-11 rounded-2xl bg-background/70 px-4 dark:bg-white/[0.04]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={fields.message}
                    onChange={handleChange}
                    placeholder="Tell us what you are trying to ship, where you are stuck, or what you want Nexus UI to help with."
                    required
                    disabled={status === "loading"}
                    className="min-h-40 resize-none rounded-2xl bg-background/70 px-4 py-3 dark:bg-white/[0.04]"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={cn(
                    buttonVariants(),
                    "h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-70 sm:w-fit sm:px-7",
                  )}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message <Send className="size-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {contactChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <Link
                key={channel.title}
                href={channel.href}
                className="group rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-violet-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-2xl border border-border/70 bg-background text-foreground transition-colors group-hover:text-violet-500 dark:border-white/10 dark:bg-white/[0.06] dark:group-hover:text-violet-300">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="mt-2 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                <p className="mt-5 text-sm font-semibold">{channel.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {channel.description}
                </p>
                <p className="mt-4 text-sm font-medium text-foreground">
                  {channel.label}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl border border-border/60 bg-muted/20 px-6 py-10 dark:bg-white/[0.025] sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What we help with
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Nexus UI is a premium animated component library for Next.js, built around Tailwind CSS and Framer
            Motion. Our support covers the full lifecycle of using the library — from first install through
            production deployment.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Registry and installation</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Nexus UI ships via a custom shadcn registry. We can help you configure the{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">components.json</code> file,
                resolve peer dependency conflicts, and get the first component rendering correctly in your Next.js
                App Router project.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Premium access and licensing</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Premium components and full-page templates are gated behind a one-time license. If your token is
                not working, you need a team seat, or you have questions about what is included in your plan,
                reach out and we will sort it out same day.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Template customization</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Nexus UI templates are complete Next.js pages with Framer Motion animations, responsive layouts,
                and Tailwind styling. We can advise on adapting color schemes, swapping copy, replacing sections,
                and wiring templates into an existing project structure.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Motion and animation questions</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                All animations in Nexus UI are authored with Framer Motion and respect the user&apos;s
                reduced-motion preference. If you want to adjust timing, easing, or trigger behavior — or if an
                animation is conflicting with your layout — we are happy to walk through the approach.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Bug reports</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Found a visual regression, a TypeScript error, or unexpected behavior in a specific component?
                Include the component slug, your Next.js and Tailwind versions, and a minimal reproduction if
                possible. We triage component bugs as high priority.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Custom builds and partnerships</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Need a bespoke landing page, dashboard, or motion-driven interface built to your brand? We take
                on a limited number of custom projects each quarter. For agency partnerships, educational
                licensing, or marketplace integrations, use the partnerships channel above.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
