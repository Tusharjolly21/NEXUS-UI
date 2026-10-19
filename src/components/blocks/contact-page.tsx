"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { ArrowUpRight, Building2, Mail, MapPin, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline brand marks: lucide-react 1.x no longer ships brand icons. */
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export type ContactFormValues = { name: string; email: string; company: string; message: string };

/**
 * Sends a contact form. Resolve to show the success state; throw (or resolve `{ error }`) to show
 * the message under the form. When no handler is given the forms simulate a successful send, so
 * the block works in any project before it is wired to a backend.
 */
export type ContactSubmitHandler = (values: ContactFormValues) => Promise<void | { error?: string }>;

type ContactVariantProps = { className?: string; onSubmit?: ContactSubmitHandler };

const simulateSend: ContactSubmitHandler = () => new Promise((resolve) => setTimeout(resolve, 900));

const UI_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";
const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const secondary = "text-[#6e6e73] dark:text-[#a1a1a6]";
const tertiary = "text-[#86868b] dark:text-[#98989d]";
const cardShadow =
  "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

/** Shared reveal variants: children rise in, unblurring, one after another. */
function useRevealItem(): Variants {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 30 } },
      };
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const item = useRevealItem();
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

function Monogram({ letter = "N", className }: { letter?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1d1d1f] text-[17px] font-semibold tracking-[-0.02em] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
        className,
      )}
    >
      {letter}
    </span>
  );
}

export function ContactPageBlock({ className, onSubmit }: ContactVariantProps) {
  return (
    <div
      className={cn(
        "min-h-full w-full space-y-10 overflow-y-auto bg-white p-4 text-[#1d1d1f] sm:p-6 lg:p-8 dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <GlobalSignalContact onSubmit={onSubmit} />
      <CenteredContactForm onSubmit={onSubmit} />
      <GradientProofContact onSubmit={onSubmit} />
      <ImageStoryContact onSubmit={onSubmit} />
    </div>
  );
}

export default ContactPageBlock;

export function GlobalSignalContact({ className, onSubmit }: ContactVariantProps) {
  return (
    <AnimatedShell
      className={cn(
        "grid gap-8 overflow-hidden rounded-[28px] bg-[#f5f5f7] p-4 sm:p-6 lg:min-h-[760px] lg:grid-cols-[0.95fr_1.1fr] lg:p-10 dark:bg-[#1c1c1e]",
        ink,
        className,
      )}
    >
      <div className="flex min-w-0 flex-col justify-between px-1 pt-2 sm:px-2 lg:min-h-[620px]">
        <div>
          <Reveal>
            <span className="grid size-12 place-items-center rounded-[14px] bg-white text-[#0071e3] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:text-[#2997ff] dark:shadow-none">
              <Mail className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
          </Reveal>
          <Reveal>
            <p className={cn("mt-8 text-[17px] font-semibold sm:mt-10", tertiary)}>A studio across three time zones</p>
          </Reveal>
          <Reveal>
            <h2 className="mt-2 max-w-xl text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[52px] lg:text-[60px]">
              Let&apos;s shape the next interface.
            </h2>
          </Reveal>
          <Reveal>
            <p className={cn("mt-5 max-w-xl text-[17px] leading-[1.5] sm:text-[19px]", secondary)}>
              Send a product brief, launch notes or a rough idea. A designer and an engineer read every message and
              reply with a concrete next step.
            </p>
          </Reveal>
          <Reveal>
            <ul className="mt-7 flex flex-col gap-2.5 text-[15px] sm:flex-row sm:flex-wrap sm:gap-x-6">
              <li>
                <a href="mailto:hello@northfield.design" className={cn("rounded text-[#0066cc] hover:underline dark:text-[#2997ff]", focusRing)}>
                  hello@northfield.design
                </a>
              </li>
              <li>
                <a href="tel:+442079460321" className={cn("rounded text-[#0066cc] hover:underline dark:text-[#2997ff]", focusRing)}>
                  +44 20 7946 0321
                </a>
              </li>
              <li className={secondary}>Replies within a working day</li>
            </ul>
          </Reveal>
        </div>
        <Reveal>
          <IndiaPulseMap />
        </Reveal>
      </div>

      <Reveal className={cn("relative rounded-[24px] bg-white p-5 sm:p-8 lg:p-10 dark:bg-[#2c2c2e]/60", cardShadow)}>
        <ContactForm
          onSubmit={onSubmit}
          eyebrow="Project request"
          title="Tell us what you want to build"
          description="A few details are enough. We will reply with a practical next step, not a sales maze."
          buttonLabel="Send request"
          dense
        />
      </Reveal>
    </AnimatedShell>
  );
}

export function CenteredContactForm({ className, onSubmit }: ContactVariantProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatedShell
      className={cn(
        "relative grid min-h-[620px] place-items-center overflow-hidden rounded-[28px] bg-white p-4 py-10 shadow-[0_0_0_1px_rgba(0,0,0,.06)] sm:p-6 md:min-h-[760px] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
        ink,
        className,
      )}
    >
      <div className="relative z-10 grid w-full max-w-6xl gap-10 md:grid-cols-[0.75fr_minmax(0,1fr)] md:items-stretch">
        <div className="flex flex-col justify-center md:pl-6 lg:pl-12">
          <Reveal className="flex items-center gap-3">
            <Monogram />
            <p className="text-[15px] font-semibold">Northfield</p>
          </Reveal>
          <Reveal>
            <h2 className="mt-8 max-w-sm text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">
              Say hello. A real person reads it.
            </h2>
          </Reveal>
          <Reveal>
            <dl className="mt-10 grid max-w-sm gap-0 text-[15px]">
              {[
                ["New projects", "hello@northfield.design"],
                ["Existing clients", "Your Slack channel, or support@northfield.design"],
                ["Office hours", "Monday to Friday, 9:00 to 18:00 GMT"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-black/[0.08] py-4 dark:border-white/[0.1]">
                  <dt className={cn("text-[13px]", tertiary)}>{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="w-full max-w-lg self-center rounded-[28px] bg-[#f5f5f7] p-5 sm:p-8 dark:bg-[#1c1c1e]">
          <ContactForm
            onSubmit={onSubmit}
            eyebrow="Quick hello"
            title="What can we help with?"
            description="Questions, partnerships or a project you want to start. We route every note to the right person."
            buttonLabel="Start the conversation"
            roundedButton
            dense
          />
          <div className="mt-7 flex items-center justify-center gap-3 border-t border-black/[0.08] pt-6 dark:border-white/[0.1]">
            {[GithubIcon, LinkedinIcon, MessageCircle].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                aria-label={["GitHub", "LinkedIn", "Chat"][index]}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                transition={UI_SPRING}
                className={cn(
                  "grid size-10 place-items-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-colors hover:bg-[#dcdce1] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
                  focusRing,
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </motion.a>
            ))}
          </div>
        </Reveal>
      </div>
    </AnimatedShell>
  );
}

const PROOF_QUOTES = [
  {
    quote: "Northfield turned a vague redesign into a system we could launch. The new contact flow doubled qualified demo requests in a week.",
    name: "Ira Kapoor",
    role: "Growth lead, Orbitstack",
  },
  {
    quote: "They asked better questions about our customers than we did. The intake form now does half of our sales team's first call.",
    name: "Tomas Lindqvist",
    role: "Head of product, Fernway",
  },
  {
    quote: "Six weeks from first call to launch, and nothing about it felt rushed. Our support inbox got quieter the day it went live.",
    name: "Amara Osei",
    role: "Founder, Lumen Ledger",
  },
];

export function GradientProofContact({ className, onSubmit }: ContactVariantProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const quote = PROOF_QUOTES[index];

  React.useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % PROOF_QUOTES.length), 6500);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduce]);

  return (
    <AnimatedShell
      className={cn(
        "grid gap-8 overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.06)] sm:p-6 lg:min-h-[780px] lg:grid-cols-[0.95fr_1fr] lg:p-10 dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
        ink,
        className,
      )}
    >
      <Reveal className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#1d1d1f] p-6 text-[#f5f5f7] sm:min-h-[540px] sm:p-10 dark:bg-[#1c1c1e]">
        <p className="text-[17px] font-semibold text-white/60">What teams say after launch</p>

        <figure
          className="relative my-10 grid flex-1 items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24, filter: "blur(8px)" }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 220, damping: 30 }}
            >
              <blockquote className="text-pretty text-[24px] font-semibold leading-[1.25] tracking-[-0.025em] sm:text-[32px]">
                &ldquo;{quote.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white/10 text-[14px] font-semibold">
                  {quote.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{quote.name}</span>
                  <span className="block text-[13px] text-white/60">{quote.role}</span>
                </span>
              </figcaption>
            </motion.div>
          </AnimatePresence>
        </figure>

        <div className="flex items-center gap-2" role="group" aria-label="Choose a testimonial">
          {PROOF_QUOTES.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.name}
                type="button"
                aria-label={`Show testimonial from ${item.name}`}
                aria-pressed={active}
                onClick={() => setIndex(i)}
                className={cn("flex h-6 items-center rounded-full", focusRing)}
              >
                <motion.span
                  className={cn("block h-2 rounded-full", active ? "bg-white" : "bg-white/30 hover:bg-white/50")}
                  initial={false}
                  animate={{ width: active ? 28 : 8 }}
                  transition={reduce ? { duration: 0 } : UI_SPRING}
                />
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="flex items-center px-1 sm:px-4 lg:px-6">
        <ContactForm
          onSubmit={onSubmit}
          eyebrow="Customer success"
          title="Need help designing a better intake flow?"
          description="Share the workflow, audience, and deadline. We will suggest a component path that fits your product."
          buttonLabel="Book a design review"
          className="w-full"
          roundedButton
        />
      </Reveal>
    </AnimatedShell>
  );
}

export function ImageStoryContact({ className, onSubmit }: ContactVariantProps) {
  return (
    <AnimatedShell
      className={cn(
        "grid overflow-hidden rounded-[28px] bg-[#f5f5f7] lg:min-h-[780px] lg:grid-cols-2 dark:bg-[#1c1c1e]",
        ink,
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
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        <Reveal className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/80 p-5 shadow-[0_20px_40px_-24px_rgba(0,0,0,.4)] backdrop-blur-xl backdrop-saturate-150 sm:inset-x-8 sm:bottom-8 sm:p-7 lg:right-auto lg:w-[520px] dark:bg-[#1c1c1e]/80">
          <p className="text-[21px] font-semibold leading-[1.3] tracking-[-0.02em] sm:text-[26px]">
            &ldquo;Our launch page finally feels like the product: fast, composed, and unmistakably ours.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[#1d1d1f] text-[14px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
              SN
            </span>
            <div>
              <p className="text-[15px] font-semibold">Sana Noor</p>
              <p className={cn("text-[13px]", secondary)}>Founder, Meadow AI</p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="flex items-center p-4 sm:p-10 lg:p-14">
        <Reveal className={cn("w-full max-w-lg rounded-[28px] bg-white p-5 sm:p-7 lg:mx-auto dark:bg-black", cardShadow)}>
          <div className="mb-6 flex items-center gap-3">
            <Monogram />
            <div>
              <p className="text-[15px] font-semibold">Northfield</p>
              <p className={cn("text-[13px]", tertiary)}>Launch support</p>
            </div>
          </div>
          <ContactForm
            onSubmit={onSubmit}
            eyebrow="Talk to the team"
            title="Write to the people who build it."
            description="Tell us where your page feels stuck. We can help with layout, motion, conversion details, or full section composition."
            buttonLabel="Send message"
            dense
          />
        </Reveal>
      </div>
    </AnimatedShell>
  );
}

export function ContactPageBlockPreview() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-white text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <div data-tile-focus className="w-[1040px] shrink-0">
        <CenteredContactForm className="rounded-[28px]" />
      </div>
    </div>
  );
}

/** A check that draws itself in a soft green disc. */
function SentMark() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="grid size-14 place-items-center rounded-full bg-[#34c759]/15"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="#34c759"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  );
}

export function ContactForm({
  onSubmit = simulateSend,
  eyebrow,
  title,
  description,
  buttonLabel,
  roundedButton = false,
  dense = false,
  className,
}: {
  /** Called with the field values on submit. Defaults to a simulated send. */
  onSubmit?: ContactSubmitHandler;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  /** Stretch the submit button to the full width of the form. */
  roundedButton?: boolean;
  /** Tighter spacing for forms that sit inside a card. */
  dense?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const uid = React.useId();
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
      const result = await onSubmit(fields);
      if (result && result.error) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setStatus("success");
        setFields({ name: "", email: "", company: "", message: "" });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error && err.message ? err.message : "Couldn't send that. Please try again.");
      setStatus("error");
    }
  }

  const fieldKeys = [
    { key: "name" as const, label: "Name", placeholder: "Maya Srinivasan", type: "text", autoComplete: "name" },
    { key: "email" as const, label: "Work email", placeholder: "maya@northstar.dev", type: "email", autoComplete: "email" },
    { key: "company" as const, label: "Company", placeholder: "Northstar Labs", type: "text", autoComplete: "organization" },
  ];

  const fieldClass = cn(
    "mt-1.5 w-full rounded-[12px] bg-white px-3.5 text-[16px] text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)] outline-none transition-shadow placeholder:text-[#a1a1a6]",
    "focus:shadow-[inset_0_0_0_1px_#0071e3,0_0_0_3px_rgba(0,113,227,.25)] disabled:opacity-60",
    "dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] dark:placeholder:text-[#8e8e93] dark:focus:shadow-[inset_0_0_0_1px_#2997ff,0_0_0_3px_rgba(41,151,255,.3)]",
  );

  const swap = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" },
    transition: reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 320, damping: 32 },
  };

  return (
    <motion.div
      layout={!reduce}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className={cn("mx-auto max-w-2xl", ink, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "success" ? (
          <motion.div
            key="sent"
            {...swap}
            role="status"
            className="flex flex-col items-center gap-4 rounded-[20px] bg-[#f5f5f7] px-6 py-12 text-center dark:bg-[#2c2c2e]"
          >
            <SentMark />
            <div>
              <p className="text-[21px] font-semibold tracking-[-0.02em]">Message sent</p>
              <p className={cn("mt-1 text-[15px]", secondary)}>We&apos;ll get back to you within 24 hours.</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className={cn("rounded text-[15px] font-medium text-[#0066cc] hover:underline dark:text-[#2997ff]", focusRing)}
            >
              Send another message ›
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" {...swap} onSubmit={handleSubmit}>
            <p className={cn("text-[15px] font-semibold", tertiary)}>{eyebrow}</p>
            <h3
              className={cn(
                "mt-1.5 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em]",
                dense ? "lg:text-[32px]" : "sm:text-[40px]",
              )}
            >
              {title}
            </h3>
            <p className={cn("max-w-xl text-[15px] leading-[1.5]", secondary, dense ? "mt-3" : "mt-4 sm:text-[17px]")}>
              {description}
            </p>
            <div className={cn(dense ? "mt-6 space-y-3.5" : "mt-8 space-y-4")}>
              <div className={cn("grid gap-3.5", !dense && "sm:grid-cols-2 sm:gap-4")}>
                {fieldKeys.map((field) => (
                  <div key={field.key} className={cn(!dense && field.key === "company" && "sm:col-span-2")}>
                    <label htmlFor={`${uid}-${field.key}`} className="text-[13px] font-medium">
                      {field.label}
                      {field.key === "company" ? <span className={cn("font-normal", tertiary)}> (optional)</span> : null}
                    </label>
                    <input
                      id={`${uid}-${field.key}`}
                      name={field.key}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={fields[field.key]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.key !== "company"}
                      disabled={status === "loading"}
                      className={cn(fieldClass, dense ? "h-11" : "h-12")}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor={`${uid}-message`} className="text-[13px] font-medium">
                  Message
                </label>
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  placeholder="Share the goal, deadline, and what a great outcome looks like."
                  required
                  disabled={status === "loading"}
                  className={cn(fieldClass, "resize-none py-3", dense ? "min-h-24" : "min-h-32")}
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {status === "error" ? (
                <motion.p
                  key="error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden pt-3 text-[14px] font-medium text-[#ff3b30]"
                >
                  {errorMsg}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileTap={status !== "loading" && !reduce ? { scale: 0.97 } : undefined}
              transition={UI_SPRING}
              className={cn(
                "relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-[#0071e3] px-6 text-[17px] font-medium text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-80",
                focusRing,
                dense ? "mt-5" : "mt-7",
                roundedButton ? "sm:w-full" : "sm:w-auto sm:min-w-[200px]",
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {status === "loading" ? (
                  <motion.span
                    key="sending"
                    className="inline-flex items-center gap-2"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                    transition={UI_SPRING}
                  >
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M22 12a10 10 0 0 0-10-10" />
                    </svg>
                    Sending…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    className="inline-block"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                    transition={UI_SPRING}
                  >
                    {buttonLabel}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** "We are here" marker on a dotted world map: a blue pin with soft rings breathing out of it. */
function IndiaPulseMap({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const marker = compact ? { x: 548, y: 124, labelY: 42 } : { x: 552, y: 126, labelY: 34 };
  const labelWidth = compact ? 104 : 116;
  const stemTop = marker.labelY + 36;

  return (
    <div className={cn("relative w-full", compact ? "h-24" : "mt-10 h-72 sm:mt-12 sm:h-[26rem]")}>
      <WorldAtlasCanvas compact={compact} />
      <svg viewBox="0 0 760 280" className="absolute inset-0 h-full w-full" role="img" aria-label="World map marker pointing to India">
        <motion.line
          x1={marker.x}
          x2={marker.x}
          y1={stemTop}
          y2={marker.y}
          stroke="#0071e3"
          strokeWidth={compact ? 1 : 1.5}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 24, delay: 0.3 }}
        />
        <foreignObject x={marker.x - labelWidth / 2} y={marker.labelY} width={labelWidth} height="40">
          <div className="flex justify-center">
            <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_16px_-6px_rgba(0,0,0,.2)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
              We are here
            </span>
          </div>
        </foreignObject>

        {reduce
          ? null
          : [0, 1.1].map((delay) => (
              <motion.circle
                key={delay}
                cx={marker.x}
                cy={marker.y}
                r={compact ? 4 : 6}
                fill="#0071e3"
                initial={{ scale: 1, opacity: 0.28 }}
                animate={{ scale: compact ? 4 : 6, opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, delay, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `${marker.x}px ${marker.y}px` }}
              />
            ))}
        <circle cx={marker.x} cy={marker.y} r={compact ? 4 : 6} fill="#ffffff" />
        <circle cx={marker.x} cy={marker.y} r={compact ? 2.6 : 4} fill="#0071e3" />
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
      for (const polygon of polygons) {
        ctx.beginPath();
        polygon.forEach((ring) => {
          let previousPoint: { x: number; y: number } | null = null;

          ring.forEach(([lon, lat], index) => {
            const point = project(lon, lat);
            const shouldBreak = previousPoint && Math.abs(point.x - previousPoint.x) > mapWidth * 0.45;

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

    // redraw when the page switches between light and dark
    const themeObserver = new MutationObserver(() => {
      void draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      themeObserver.disconnect();
    };
  }, [compact]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 [--contact-map-fill:rgba(0,0,0,0.13)] dark:[--contact-map-fill:rgba(255,255,255,0.16)]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#f5f5f7] to-transparent dark:from-[#1c1c1e]" />
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
  const container: Variants = {
    hidden: { opacity: reduce ? 0 : 1 },
    show: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.05 } },
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
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
            className="rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
          >
            <Icon className="size-5 text-[#0071e3] dark:text-[#2997ff]" strokeWidth={1.75} aria-hidden />
            <p className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{item.value}</p>
            <p className="mt-1 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
