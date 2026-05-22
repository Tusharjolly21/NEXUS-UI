"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { NexusMark } from "@/components/brand";
import { cn } from "@/lib/utils";

type ContactFormField = {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
};

const baseFields: ContactFormField[] = [
  { label: "Name", placeholder: "Maya Srinivasan" },
  { label: "Work email", placeholder: "maya@northstar.dev", type: "email" },
  { label: "Company", placeholder: "Northstar Labs" },
];

export function ContactPageBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-h-full w-full space-y-10 overflow-y-auto bg-white p-4 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:p-6 lg:p-8",
        className,
      )}
    >
      <GlobalSignalContact />
      <CenteredContactForm />
      <GradientProofContact />
      <ImageStoryContact />
    </div>
  );
}

export default ContactPageBlock;

export function GlobalSignalContact({ className }: { className?: string }) {
  return (
    <AnimatedShell
      className={cn(
        "grid gap-8 overflow-hidden rounded-[24px] border border-zinc-200 bg-[radial-gradient(circle_at_18%_14%,rgba(56,189,248,0.10),transparent_30%),linear-gradient(180deg,#ffffff,#f8fafc)] p-4 shadow-2xl shadow-zinc-950/5 dark:border-white/10 dark:bg-[radial-gradient(circle_at_18%_14%,rgba(56,189,248,0.16),transparent_30%),linear-gradient(180deg,#09090b,#050507)] dark:shadow-black/30 sm:rounded-[28px] sm:p-6 lg:min-h-[760px] lg:grid-cols-[0.95fr_1.15fr] lg:p-10",
        className,
      )}
    >
      <div className="flex flex-col justify-between lg:min-h-[620px]">
        <div>
          <div className="grid size-12 place-items-center rounded-2xl border border-zinc-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/8 sm:size-14">
            <Mail className="size-5 text-sky-500 sm:size-6" />
          </div>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300 sm:mt-12 sm:text-sm">
            Global studio
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
            Let&apos;s shape the next interface.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:mt-6 sm:text-lg sm:leading-8">
            Send your product brief, launch notes, or messy idea. The Nexus-ui
            team will turn it into a clean direction for your next build.
          </p>
          <div className="mt-7 flex flex-col gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
            <span>hello@nexus-ui.com</span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">/</span>
            <span>+91 98765 43210</span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">/</span>
            <span>support in 24 hours</span>
          </div>
        </div>
        <IndiaPulseMap />
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-50/90 p-5 shadow-inner dark:border-white/10 dark:bg-white/[0.04] sm:p-8 lg:p-10">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-30 dark:[background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/70" />
        <ContactForm
          eyebrow="Project request"
          title="Tell us what you want to build"
          description="A few details are enough. We will reply with a practical next step, not a sales maze."
          buttonLabel="Send request"
          className="relative z-10"
          dense
        />
      </div>
    </AnimatedShell>
  );
}

export function CenteredContactForm({ className }: { className?: string }) {
  return (
    <AnimatedShell
      className={cn(
        "relative grid min-h-[620px] place-items-center overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-4 py-10 dark:border-white/10 dark:bg-zinc-950 sm:rounded-[28px] sm:p-6 md:min-h-[760px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_34%),radial-gradient(circle_at_78%_76%,rgba(14,165,233,0.12),transparent_28%)]" />
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[12%] right-[14%] hidden size-32 rounded-full bg-sky-400/10 blur-sm sm:block"
      />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 md:grid-cols-[0.72fr_minmax(0,1fr)] md:items-stretch">
        <div className="flex items-start justify-start md:min-h-[620px] md:pl-10 md:pt-10 lg:pl-16 lg:pt-14">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/82 p-2.5 pr-4 shadow-2xl shadow-zinc-950/10 backdrop-blur dark:border-white/10 dark:bg-white/8">
            <div className="grid size-11 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <NexusMark size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-zinc-950 dark:text-white">Nexus-ui</p>
              <p className="text-xs leading-tight text-zinc-500 dark:text-zinc-400">contact desk</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg self-center rounded-[24px] border border-zinc-200 bg-white/92 p-5 shadow-2xl shadow-zinc-950/8 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/30 sm:rounded-[28px] sm:p-8">
          <ContactForm
            eyebrow="Quick hello"
            title="Send a clean, focused note."
            description="Questions, partnerships, custom components, launch help. Put it here and we will route it to the right person."
            buttonLabel="Start the conversation"
            roundedButton
            dense
          />
          <div className="mt-7 flex items-center justify-center gap-4 border-t border-zinc-200 pt-6 text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {[Github, Linkedin, MessageCircle].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                aria-label="Nexus-ui social link"
                whileHover={{ y: -3, scale: 1.04 }}
                className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-zinc-50 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:hover:text-white"
              >
                <Icon className="size-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </AnimatedShell>
  );
}

export function GradientProofContact({ className }: { className?: string }) {
  return (
    <AnimatedShell
      className={cn(
        "grid gap-8 overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950 sm:rounded-[28px] sm:p-6 lg:min-h-[780px] lg:grid-cols-[0.95fr_1fr] lg:p-10",
        className,
      )}
    >
      <div className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_18%_12%,#ff4da6,transparent_34%),radial-gradient(circle_at_70%_64%,#facc15,transparent_38%),linear-gradient(135deg,#7c3aed,#fb7185_48%,#f59e0b)] p-5 text-white shadow-2xl shadow-pink-500/20 sm:min-h-[520px] sm:rounded-[28px] sm:p-8">
        <motion.div
          animate={{ x: ["-12%", "10%", "-12%"], y: ["-8%", "6%", "-8%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.26),transparent_22%)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
        <div className="relative flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-lg rounded-[22px] border border-white/24 bg-white/16 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:rounded-[24px] sm:p-10"
          >
            <p className="text-5xl font-serif leading-none text-white/75 sm:text-6xl">&ldquo;</p>
            <p className="mt-4 text-xl font-semibold leading-8 tracking-tight sm:text-2xl sm:leading-10">
              Nexus-ui helped us turn a vague redesign into a launchable system.
              The contact flow alone doubled qualified demo notes in a week.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-full border border-white/30 bg-white/20 text-sm font-bold">
                IK
              </div>
              <div>
                <p className="font-semibold">Ira Kapoor</p>
                <p className="text-sm text-white/72">Growth Lead, OrbitStack</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          <span className="h-2 w-8 rounded-full bg-white" />
          <span className="size-2 rounded-full bg-white/45" />
          <span className="size-2 rounded-full bg-white/45" />
        </div>
      </div>

      <div className="flex items-center">
        <ContactForm
          eyebrow="Customer success"
          title="Need help designing a better intake flow?"
          description="Share the workflow, audience, and deadline. We will suggest a component path that fits your product."
          buttonLabel="Book a design review"
          className="w-full"
          roundedButton
        />
      </div>
    </AnimatedShell>
  );
}

export function ImageStoryContact({ className }: { className?: string }) {
  return (
    <AnimatedShell
      className={cn(
        "grid overflow-hidden rounded-[24px] border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950 sm:rounded-[28px] lg:min-h-[780px] lg:grid-cols-2",
        className,
      )}
    >
      <div
        className="relative min-h-[420px] bg-cover bg-center sm:min-h-[500px] lg:min-h-full"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:5px_5px] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-transparent to-zinc-950/35" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-[22px] border border-white/55 bg-white/88 p-5 shadow-2xl shadow-zinc-950/20 backdrop-blur sm:left-8 sm:right-8 sm:p-8 lg:left-12 lg:right-auto lg:w-[560px]"
        >
          <p className="text-xl font-semibold leading-8 tracking-tight text-zinc-950 sm:text-3xl sm:leading-10">
            &ldquo;Our launch page finally feels like the product: fast, composed,
            and unmistakably ours.&rdquo;
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full bg-zinc-950 text-sm font-bold text-white">
              SN
            </div>
            <div>
              <p className="font-semibold text-zinc-950">Sana Noor</p>
              <p className="text-sm text-zinc-500">Founder, Meadow AI</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center p-5 sm:p-10 lg:p-14">
        <div className="w-full max-w-lg rounded-[24px] border border-zinc-200 bg-white/92 p-5 shadow-2xl shadow-zinc-950/8 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/30 sm:rounded-[28px] sm:p-6 lg:mx-auto">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-950 shadow-lg shadow-zinc-950/10 dark:border-white/10 dark:bg-white dark:text-zinc-950">
              <NexusMark size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">Nexus-ui</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">contact studio</p>
            </div>
          </div>
          <ContactForm
            eyebrow="Launch support"
            title="Write to the people building the pieces."
            description="Tell us where your page feels stuck. We can help with layout, motion, conversion details, or full section composition."
            buttonLabel="Send message"
            dense
          />
        </div>
      </div>
    </AnimatedShell>
  );
}

export function ContactPageBlockPreview() {
  return (
    <div className="relative h-[320px] overflow-hidden rounded-3xl bg-white text-zinc-950 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(168,85,247,0.18),transparent_28%)]" />
      <div className="absolute left-5 top-5 w-[46%] rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-950/10 dark:border-white/10 dark:bg-white/8">
        <div className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-400/10">
          <Mail className="size-4" />
        </div>
        <p className="mt-8 text-xl font-semibold tracking-tight dark:text-white">
          Let&apos;s shape the next interface.
        </p>
        <div className="mt-4 h-20 overflow-hidden">
          <IndiaPulseMap compact />
        </div>
      </div>
      <div className="absolute right-5 top-7 w-[44%] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl shadow-zinc-950/10 dark:border-white/10 dark:bg-white/8">
        <div className="h-3 w-20 rounded-full bg-zinc-900 dark:bg-white" />
        <div className="mt-5 space-y-2">
          <div className="h-8 rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950/60" />
          <div className="h-8 rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950/60" />
          <div className="h-16 rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950/60" />
        </div>
        <div className="mt-3 h-8 rounded-full bg-zinc-950 dark:bg-white" />
      </div>
      <div className="absolute bottom-5 left-[38%] h-28 w-[34%] rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-400 to-amber-300 p-3 shadow-2xl shadow-pink-500/20">
        <div className="rounded-xl border border-white/25 bg-white/20 p-3 text-white backdrop-blur">
          <p className="text-2xl leading-none">&ldquo;</p>
          <div className="mt-2 h-2 w-24 rounded-full bg-white/80" />
          <div className="mt-2 h-2 w-16 rounded-full bg-white/55" />
        </div>
      </div>
    </div>
  );
}

function ContactForm({
  eyebrow,
  title,
  description,
  buttonLabel,
  roundedButton = false,
  dense = false,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  roundedButton?: boolean;
  dense?: boolean;
  className?: string;
}) {
  const [fields, setFields] = React.useState({ name: "", email: "", company: "", message: "" });
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
        body: JSON.stringify(fields),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setFields({ name: "", email: "", company: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={cn("mx-auto max-w-2xl", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center dark:border-emerald-500/20 dark:bg-emerald-500/8"
        >
          <div className="grid size-12 place-items-center rounded-full border border-emerald-200 bg-white shadow dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <Send className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-white">Message sent</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">We&apos;ll get back to you within 24 hours.</p>
          </div>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-xs font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Send another message
          </button>
        </motion.div>
      </div>
    );
  }

  const fieldKeys = [
    { key: "name" as const, label: "Name", placeholder: "Maya Srinivasan", type: "text" },
    { key: "email" as const, label: "Work email", placeholder: "maya@northstar.dev", type: "email" },
    { key: "company" as const, label: "Company", placeholder: "Northstar Labs", type: "text" },
  ];

  return (
    <form onSubmit={handleSubmit} className={cn("mx-auto max-w-2xl", className)}>
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
        {eyebrow}
      </p>
      <h3
        className={cn(
          "mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white",
          dense ? "sm:text-2xl lg:text-3xl" : "sm:text-4xl",
        )}
      >
        {title}
      </h3>
      <p className={cn("max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400", dense ? "mt-3" : "mt-4 sm:text-base sm:leading-7")}>
        {description}
      </p>
      <div className={cn(dense ? "mt-5 space-y-3.5" : "mt-7 space-y-4 sm:mt-8 sm:space-y-5")}>
        {fieldKeys.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </span>
            <input
              name={field.key}
              type={field.type}
              value={fields[field.key]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.key !== "company"}
              disabled={status === "loading"}
              className={cn(
                "mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950/70 dark:text-white dark:placeholder:text-zinc-600 sm:px-4 sm:text-base",
                dense ? "h-10" : "h-11 sm:h-12",
              )}
            />
          </label>
        ))}
        <label className="block">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Message
          </span>
          <textarea
            name="message"
            value={fields.message}
            onChange={handleChange}
            placeholder="Share the goal, deadline, and what a great outcome looks like."
            required
            disabled={status === "loading"}
            className={cn(
              "mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950/70 dark:text-white dark:placeholder:text-zinc-600 sm:px-4 sm:text-base",
              dense ? "min-h-20" : "min-h-28 sm:min-h-32",
            )}
          />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
      )}

      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileHover={status !== "loading" ? { y: -2 } : undefined}
        whileTap={status !== "loading" ? { scale: 0.98 } : undefined}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:w-auto",
          dense ? "mt-4" : "mt-7",
          roundedButton ? "sm:w-full rounded-full" : "rounded-xl",
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
            {buttonLabel}
            <Send className="size-4" />
          </>
        )}
      </motion.button>
    </form>
  );
}

function IndiaPulseMap({ compact = false }: { compact?: boolean }) {
  const marker = compact ? { x: 548, y: 124, labelY: 42 } : { x: 552, y: 126, labelY: 34 };
  const labelWidth = compact ? 104 : 116;
  const beamTop = marker.labelY + 34;
  const impactY = marker.y;

  return (
    <div className={cn("relative w-full", compact ? "h-24" : "mt-10 h-72 sm:mt-12 sm:h-[30rem]")}>
      <WorldAtlasCanvas compact={compact} />
      <svg
        viewBox="0 0 760 280"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="World map marker pointing to India"
      >
        <defs>
          <linearGradient id="contact-line-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.18" />
            <stop offset="16%" stopColor="#bfdbfe" stopOpacity="0.95" />
            <stop offset="62%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="contact-beam-core" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#eff6ff" stopOpacity="0" />
            <stop offset="12%" stopColor="#bfdbfe" stopOpacity="0.72" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.64" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id="contact-label-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
            <stop offset="58%" stopColor="#60a5fa" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="contact-pulse-gradient">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.42" />
            <stop offset="56%" stopColor="#60a5fa" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
          <filter id="contact-blue-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.1 0 0 0 0 0.46 0 0 0 0 1 0 0 0 0.75 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx={marker.x}
          cy={impactY + 1}
          rx={compact ? 26 : 54}
          ry={compact ? 7 : 14}
          fill="#0ea5e9"
          opacity={compact ? 0.1 : 0.16}
        />
        <ellipse
          cx={marker.x}
          cy={impactY + 1}
          rx={compact ? 17 : 34}
          ry={compact ? 5 : 10}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1.2"
          opacity="0.28"
        />
        <ellipse
          cx={marker.x}
          cy={beamTop}
          rx={compact ? 42 : 76}
          ry={compact ? 5 : 8}
          fill="url(#contact-label-glow)"
        />
        <path
          d={`M ${marker.x} ${beamTop} L ${marker.x} ${impactY}`}
          stroke="url(#contact-beam-core)"
          strokeWidth={compact ? 10 : 22}
          strokeLinecap="round"
          opacity={compact ? 0.58 : 0.72}
          filter="url(#contact-blue-glow)"
        />
        <path
          d={`M ${marker.x} ${beamTop} L ${marker.x} ${impactY}`}
          stroke="url(#contact-line-gradient)"
          strokeWidth={compact ? 1.8 : 3}
          strokeLinecap="round"
          opacity="1"
          filter="url(#contact-blue-glow)"
        />
        <path
          d={`M ${marker.x - (compact ? 2.5 : 4)} ${beamTop + 8} L ${marker.x - (compact ? 1.2 : 2)} ${impactY - 3}`}
          stroke="#bfdbfe"
          strokeWidth={compact ? 0.7 : 1.1}
          strokeLinecap="round"
          opacity="0.72"
        />
        <foreignObject x={marker.x - labelWidth / 2} y={marker.labelY} width={labelWidth} height="40">
          <div className="relative flex overflow-hidden rounded-xl bg-zinc-200/90 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-[0_10px_30px_rgba(59,130,246,0.14)] backdrop-blur dark:bg-white/14 dark:text-zinc-200">
            <span className="relative z-10 mx-auto">We are here</span>
            <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-sky-300/85 to-transparent blur-[0.5px]" />
            <span className="pointer-events-none absolute inset-x-6 bottom-0 h-3 bg-sky-400/15 blur-md" />
          </div>
        </foreignObject>

        {[0, 0.85].map((delay, index) => (
          <motion.circle
            key={index}
            cx={marker.x}
            cy={impactY}
            r={compact ? 2.6 : 4}
            fill="none"
            stroke="url(#contact-pulse-gradient)"
            strokeWidth={compact ? 5 : 10}
            initial={{ scaleX: 0.18, scaleY: 0.08, opacity: 0.9 }}
            animate={{ scaleX: compact ? 9 : 18, scaleY: compact ? 2.8 : 4.8, opacity: 0 }}
            transition={{ duration: 2.15, repeat: Infinity, delay, ease: "easeOut" }}
            style={{ transformOrigin: `${marker.x}px ${impactY}px` }}
          />
        ))}
        <circle cx={marker.x} cy={impactY} r={compact ? 6 : 11} fill="#60a5fa" opacity="0.13" />
        <circle cx={marker.x} cy={impactY} r={compact ? 2 : 3.5} fill="#3b82f6" filter="url(#contact-blue-glow)" />
      </svg>
    </div>
  );
}

type GeoRing = Array<readonly [number, number]>;
type GeoPolygon = GeoRing[];

let atlasCache: GeoPolygon[] | null = null;
let atlasPromise: Promise<GeoPolygon[]> | null = null;

async function loadAtlasPolygons() {
  if (atlasCache) return atlasCache;
  if (atlasPromise) return atlasPromise;

  atlasPromise = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
    .then((response) => response.json())
    .then(async (topo) => {
      const topojson = (await import("topojson-client")) as {
        feature: (topology: unknown, object: unknown) => {
          features?: Array<{
            geometry?: {
              type?: string;
              coordinates?: number[][][] | number[][][][];
            };
          }>;
        };
      };
      const land = topojson.feature(topo, topo.objects.land);
      const polygons: GeoPolygon[] = [];

      for (const item of land.features ?? []) {
        const geometry = item.geometry;
        if (!geometry?.coordinates) continue;

        if (geometry.type === "Polygon") {
          polygons.push(geometry.coordinates as unknown as GeoPolygon);
        }

        if (geometry.type === "MultiPolygon") {
          polygons.push(...(geometry.coordinates as unknown as GeoPolygon[]));
        }
      }

      atlasCache = polygons;
      return polygons;
    })
    .catch(() => []);

  return atlasPromise;
}

function WorldAtlasCanvas({ compact }: { compact: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function draw() {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;

      const polygons = await loadAtlasPolygons();
      if (cancelled) return;

      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getComputedStyle(wrapper).getPropertyValue("--contact-map-fill").trim();
      ctx.strokeStyle = getComputedStyle(wrapper).getPropertyValue("--contact-map-edge").trim();

      const mapWidth = width * (compact ? 1.1 : 1.04);
      const mapHeight = height * (compact ? 0.84 : 0.76);
      const offsetX = (width - mapWidth) / 2;
      const offsetY = height * (compact ? 0.13 : 0.16);

      function project(lon: number, lat: number) {
        return {
          x: offsetX + ((lon + 180) / 360) * mapWidth,
          y: offsetY + ((90 - lat) / 180) * mapHeight,
        };
      }

      ctx.save();
      ctx.globalAlpha = compact ? 0.72 : 0.96;
      for (const polygon of polygons) {
        ctx.beginPath();
        polygon.forEach((ring) => {
          let previousPoint: { x: number; y: number } | null = null;

          ring.forEach(([lon, lat], index) => {
            const point = project(lon, lat);
            const shouldBreak =
              previousPoint && Math.abs(point.x - previousPoint.x) > mapWidth * 0.45;

            if (index === 0 || shouldBreak) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);

            previousPoint = point;
          });
          ctx.closePath();
        });
        ctx.fill("evenodd");
      }
      ctx.restore();
    }

    draw();
    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => {
        void draw();
      });
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
    };
  }, [compact]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 [--contact-map-edge:transparent] [--contact-map-fill:rgba(82,82,91,0.34)] dark:[--contact-map-edge:transparent] dark:[--contact-map-fill:rgba(255,255,255,0.18)]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-950 dark:via-zinc-950/35" />
    </div>
  );
}

function AnimatedShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion() === true;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function ContactMiniMetric() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { icon: Building2, value: "4", label: "ready contact layouts" },
        { icon: MapPin, value: "India", label: "animated office marker" },
        { icon: ArrowUpRight, value: "100%", label: "responsive containers" },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <Icon className="size-4 text-sky-500" />
            <p className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
