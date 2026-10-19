"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { Mail, Phone, Plus, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
  tag?: string;
};

export type FaqFolderCardProps = {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  className?: string;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "How long does a typical project take?",
    answer:
      "Most marketing sites ship in four to six weeks. Product work runs in two-week cycles, and you see a working build at the end of each one.",
  },
  {
    question: "Do you work alongside in-house teams?",
    answer:
      "Often. We work in your repository and your tools, pair with your designers and engineers, and leave documentation behind so the team can carry it on.",
  },
  {
    question: "What does it cost to get started?",
    answer:
      "Discovery is a fixed two-week engagement. After it you get a scoped plan with a price for each milestone, before any build work begins.",
  },
  {
    question: "Can you take over an existing codebase?",
    answer:
      "Yes. We start with a short audit of the code, performance and accessibility, then agree with you what to fix first.",
  },
];

const SEARCHABLE_FAQS: FaqItem[] = [
  {
    question: "How do I invite my team?",
    answer:
      "Open Settings, then Members, and paste their email addresses. Invites expire after seven days and you can resend them from the same screen.",
    tag: "Account",
  },
  {
    question: "Can I change plans in the middle of a cycle?",
    answer:
      "Yes. Upgrades apply straight away and we charge the prorated difference. Downgrades take effect at your next renewal.",
    tag: "Billing",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Annual plans can be refunded in full within 14 days of purchase. Write to billing@relay.app and we process it within two working days.",
    tag: "Billing",
  },
  {
    question: "How do I export my data?",
    answer:
      "Go to Settings, then Data, and choose CSV or JSON. Large workspaces are emailed to you as a download link.",
    tag: "Account",
  },
  {
    question: "Is two-factor sign-in available?",
    answer:
      "Every plan includes two-factor sign-in with an authenticator app. Admins can require it for the whole workspace.",
    tag: "Security",
  },
  {
    question: "Where is my data stored?",
    answer:
      "In the EU or the US, whichever you pick when you create the workspace. Data is encrypted at rest and in transit.",
    tag: "Security",
  },
];

const CHAT_FAQS: FaqItem[] = [
  {
    question: "When will my first box ship?",
    answer:
      "Orders placed before noon leave the roastery the same day. Most addresses get them in two to three days, and you'll get a tracking link by email.",
  },
  {
    question: "Can I pause my subscription?",
    answer:
      "Any time, from your account page. Pause for a week or a few months; we email you three days before the next roast so nothing arrives by surprise.",
  },
  {
    question: "Which grind should I choose?",
    answer:
      "Tell us how you brew and we grind for it: fine for espresso, medium for pour-over, coarse for a French press. Or take whole beans and grind at home.",
  },
  {
    question: "What if I don't like a coffee?",
    answer:
      "Tell us within 14 days and we send a different one free. Your notes also tune what we pick for your next box.",
  },
  {
    question: "Do you ship outside the country?",
    answer:
      "We ship to the EU, the UK and Canada. Duties are included in the price you see at checkout.",
  },
  {
    question: "Is the packaging recyclable?",
    answer:
      "The bags are compostable and the box is recycled cardboard. The one-way valve is the only part to take off first.",
  },
];

const UI_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };
const HEIGHT_SPRING: Transition = { type: "spring", stiffness: 260, damping: 32 };
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

function useReveal(stagger = 0.06) {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: 0.04 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 30 } },
      };
  return { container, item, reduce };
}

/** Height-auto reveal for an answer, on a spring, with a short blur-in of the text. */
function Collapse({ open, id, children }: { open: boolean; id: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={id}
          key="panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reduce ? { duration: 0.15 } : { height: HEIGHT_SPRING, opacity: { duration: 0.2 } }}
          className="overflow-hidden"
        >
          <motion.div
            initial={reduce ? false : { y: -6, filter: "blur(4px)" }}
            animate={{ y: 0, filter: "blur(0px)" }}
            exit={reduce ? undefined : { y: -6, filter: "blur(4px)" }}
            transition={UI_SPRING}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** The round plus that turns into a close mark. */
function ToggleMark({ open, filled = false }: { open: boolean; filled?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: open ? 45 : 0 }}
      transition={reduce ? { duration: 0 } : UI_SPRING}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-200",
        open && filled
          ? "bg-[#0071e3] text-white"
          : "bg-[#e8e8ed] text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]",
      )}
    >
      <Plus className="size-4" strokeWidth={2} />
    </motion.span>
  );
}

export function FaqFolderCard({
  items = DEFAULT_FAQS,
  eyebrow = "FAQ",
  title = "Questions, answered",
  description = "The things clients ask before we start. If yours isn't here, call or write and a designer will reply the same day.",
  phone = "+44 20 7946 0321",
  email = "studio@northfield.design",
  className,
}: FaqFolderCardProps) {
  const [open, setOpen] = React.useState(0);
  const uid = React.useId();
  const { container, item } = useReveal();

  return (
    <section className={cn("w-full bg-white p-3 text-[#1d1d1f] sm:p-6 dark:bg-black dark:text-[#f5f5f7]", className)}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid w-full max-w-[1360px] gap-10 rounded-[32px] bg-[#f5f5f7] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:p-14 dark:bg-[#1c1c1e]"
      >
        <div className="flex min-w-0 flex-col justify-center">
          <motion.p variants={item} className="text-[17px] font-semibold text-[#86868b] dark:text-[#98989d]">
            {eyebrow}
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-2 max-w-xl text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px]"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-[17px] leading-[1.5] text-[#6e6e73] sm:text-[19px] dark:text-[#a1a1a6]"
          >
            {description}
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <ContactPill icon={<Phone className="size-4" strokeWidth={1.75} />} href={`tel:${phone.replace(/\s/g, "")}`}>
              {phone}
            </ContactPill>
            <ContactPill icon={<Mail className="size-4" strokeWidth={1.75} />} href={`mailto:${email}`}>
              {email}
            </ContactPill>
          </motion.div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {items.map((faq, index) => (
            <motion.div key={`${faq.question}-${index}`} variants={item}>
              <FaqRow
                item={faq}
                index={index}
                panelId={`${uid}-faq-${index}`}
                open={open === index}
                onToggle={() => setOpen((current) => (current === index ? -1 : index))}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function ContactPill({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex h-11 max-w-full items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] transition-colors hover:bg-[#fafafa]",
        "dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-none dark:hover:bg-[#3a3a3c]",
        focusRing,
      )}
    >
      <span className="text-[#0071e3] dark:text-[#2997ff]">{icon}</span>
      <span className="truncate">{children}</span>
    </motion.a>
  );
}

function FaqRow({
  item,
  index,
  panelId,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  panelId: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-white transition-shadow duration-300 dark:bg-[#2c2c2e]",
        open
          ? "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
          : "shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-none",
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn("flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left sm:px-6", focusRing)}
        >
          <span className="w-6 shrink-0 text-[13px] font-medium text-[#86868b] tabular-nums dark:text-[#98989d]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 text-[17px] font-semibold leading-[1.35] tracking-[-0.015em]">{item.question}</span>
          <ToggleMark open={open} filled />
        </button>
      </h3>
      <Collapse open={open} id={panelId}>
        <p className="pb-6 pl-[60px] pr-6 text-[15px] leading-[1.6] text-[#6e6e73] sm:pl-[64px] sm:text-[16px] dark:text-[#a1a1a6]">
          {item.answer}
        </p>
      </Collapse>
    </div>
  );
}

export function SearchableFaqSection({
  items = SEARCHABLE_FAQS,
  className,
}: {
  items?: FaqItem[];
  className?: string;
}) {
  const uid = React.useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState<string | null>(items[0]?.question ?? null);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All");
  const { container, item } = useReveal(0.05);
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(items.map((faq) => faq.tag).filter((t): t is string => Boolean(t))))],
    [items],
  );

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((faq) => {
      const tabMatch = activeTab === "All" || faq.tag === activeTab;
      const searchMatch =
        !query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
      return tabMatch && searchMatch;
    });
  }, [activeTab, items, search]);

  return (
    <section className={cn("w-full bg-[#f5f5f7] p-3 py-10 text-[#1d1d1f] sm:p-6 sm:py-14 dark:bg-black dark:text-[#f5f5f7]", className)}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto w-full max-w-[860px] rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] sm:p-9 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
      >
        <motion.h3 variants={item} className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
          Help centre
        </motion.h3>
        <motion.p variants={item} className="mt-2 max-w-2xl text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
          Answers about your account, billing and security. Search, or pick a topic.
        </motion.p>

        <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={`${uid}-search`} className="sr-only">
              Search the help centre
            </label>
            <Search
              aria-hidden
              strokeWidth={1.75}
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#86868b] dark:text-[#98989d]"
            />
            <input
              id={`${uid}-search`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the help centre"
              className={cn(
                "h-11 w-full rounded-[12px] bg-[#f5f5f7] pl-10 pr-3 text-[15px] text-[#1d1d1f] outline-none transition-shadow placeholder:text-[#a1a1a6]",
                "focus:shadow-[0_0_0_3px_rgba(0,113,227,.35)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]",
              )}
            />
          </div>

          <div
            role="radiogroup"
            aria-label="Topic"
            className="flex w-full rounded-[10px] bg-[#e8e8ed] p-[3px] sm:w-auto dark:bg-[#3a3a3c]"
          >
            {categories.map((category) => {
              const selected = activeTab === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setActiveTab(category)}
                  className={cn(
                    "relative h-[38px] min-w-0 flex-1 rounded-[8px] px-3 text-[13px] font-medium transition-colors sm:flex-none",
                    selected ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
                    focusRing,
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${uid}-topic`}
                      aria-hidden
                      className="absolute inset-0 rounded-[8px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
                      transition={reduce ? { duration: 0 } : UI_SPRING}
                    />
                  ) : null}
                  <span className="relative z-10 block truncate">{category}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={item} className="mt-6">
          <p className="sr-only" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "question" : "questions"} shown
          </p>
          <motion.ul layout={!reduce} className="flex flex-col gap-2" transition={HEIGHT_SPRING}>
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((faq) => (
                <motion.li
                  key={`${faq.question}-${faq.tag ?? "faq"}`}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={HEIGHT_SPRING}
                >
                  <SearchableFaqRow
                    item={faq}
                    showTag={activeTab === "All"}
                    panelId={`${uid}-q${items.indexOf(faq)}`}
                    open={open === faq.question}
                    onToggle={() => setOpen((current) => (current === faq.question ? null : faq.question))}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[16px] bg-[#f5f5f7] py-10 text-center text-[15px] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]"
              >
                No questions match &ldquo;{search.trim() || activeTab}&rdquo;.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.08] pt-6 dark:border-white/[0.1]"
        >
          <div>
            <p className="text-[15px] font-semibold">Still have questions?</p>
            <p className="mt-0.5 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Our support team replies within four working hours.</p>
          </div>
          <a
            href="mailto:hello@example.com"
            className={cn("rounded-full text-[15px] font-medium text-[#0066cc] hover:underline dark:text-[#2997ff]", focusRing)}
          >
            Message support ›
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function SearchableFaqRow({
  item,
  open,
  showTag,
  panelId,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  showTag: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] transition-colors duration-300",
        open ? "bg-[#f5f5f7] dark:bg-[#2c2c2e]" : "bg-transparent hover:bg-[#f5f5f7]/70 dark:hover:bg-[#2c2c2e]/60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn("flex w-full items-center justify-between gap-4 rounded-[16px] px-4 py-3.5 text-left", focusRing)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold leading-[1.4] tracking-[-0.01em]">{item.question}</span>
          {showTag && item.tag ? (
            <span className="mt-0.5 block text-[12px] text-[#86868b] dark:text-[#98989d]">{item.tag}</span>
          ) : null}
        </span>
        <ToggleMark open={open} filled />
      </button>
      <Collapse open={open} id={panelId}>
        <p className="px-4 pb-4 pr-14 text-[15px] leading-[1.6] text-[#6e6e73] dark:text-[#a1a1a6]">{item.answer}</p>
      </Collapse>
    </div>
  );
}

export function ChatFaqSection({
  items = CHAT_FAQS,
  className,
}: {
  items?: FaqItem[];
  className?: string;
}) {
  const uid = React.useId();
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const activeItem = items[active] ?? items[0] ?? CHAT_FAQS[0];
  const { container, item } = useReveal(0.05);
  // the "typing" bubble shows for this long before the answer lands
  const typing = reduce ? 0 : 0.9;

  return (
    <section className={cn("w-full bg-white p-3 text-[#1d1d1f] sm:p-6 dark:bg-black dark:text-[#f5f5f7]", className)}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid min-h-[640px] w-full max-w-[1360px] gap-8 rounded-[32px] bg-[#f5f5f7] p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-12 dark:bg-[#1c1c1e]"
      >
        <div className="flex min-w-0 flex-col justify-center">
          <motion.h2
            variants={item}
            className="max-w-md text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px]"
          >
            Ask before your first box.
          </motion.h2>
          <motion.p variants={item} className="mt-4 max-w-md text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
            Tap a question and the roastery answers. Real replies, usually within minutes.
          </motion.p>

          <div role="radiogroup" aria-label="Questions" className="mt-8 flex flex-col items-start gap-2">
            {items.map((faq, index) => {
              const selected = index === active;
              return (
                <motion.button
                  key={`${faq.question}-${index}`}
                  variants={item}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  onClick={() => setActive(index)}
                  className={cn(
                    "relative max-w-full rounded-full px-4 py-2.5 text-left text-[15px] font-medium leading-[1.3] transition-colors",
                    selected
                      ? "text-white"
                      : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05)] hover:bg-[#fafafa] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-none dark:hover:bg-[#3a3a3c]",
                    focusRing,
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${uid}-chip`}
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-[#0071e3]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">{faq.question}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          variants={item}
          className="relative flex min-h-[460px] min-w-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        >
          <header className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
            <span className="grid size-9 place-items-center rounded-full bg-[#1d1d1f] text-[14px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
              H
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[15px] font-semibold">Hearth Roasters</p>
              <p className="text-[12px] text-[#86868b] dark:text-[#98989d]">Usually replies in minutes</p>
            </div>
            <motion.button
              type="button"
              onClick={() => setActive(0)}
              aria-label="Reset chat FAQ"
              whileTap={reduce ? undefined : { scale: 0.92 }}
              className={cn(
                "grid size-9 place-items-center rounded-full bg-[#f5f5f7] text-[#6e6e73] transition-colors hover:text-[#1d1d1f] dark:bg-[#1c1c1e] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
                focusRing,
              )}
            >
              <RotateCcw className="size-4" strokeWidth={1.75} />
            </motion.button>
          </header>

          <div className="flex flex-1 flex-col justify-end gap-3 px-4 pb-6 pt-5 sm:px-6" aria-live="polite">
            <p className="text-center text-[12px] font-medium text-[#86868b] dark:text-[#98989d]">Today 10:07</p>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`q-${active}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ transformOrigin: "100% 100%" }}
                className="ml-auto max-w-[80%] rounded-[20px] rounded-br-[6px] bg-[#0071e3] px-4 py-2.5 text-[16px] leading-[1.4] text-white"
              >
                {activeItem.question}
              </motion.div>
            </AnimatePresence>

            <div className="grid">
              <AnimatePresence initial={false}>
                {typing > 0 ? (
                  <motion.div
                    key={`typing-${active}`}
                    aria-hidden
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.9] }}
                    transition={{ duration: typing + 0.15, times: [0, 0.2, 0.85, 1], delay: 0.15 }}
                    style={{ transformOrigin: "0% 100%" }}
                    className="[grid-area:1/1] flex h-9 w-fit items-center gap-1 self-start rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 dark:bg-[#262628]"
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="size-2 rounded-full bg-[#8e8e93]"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                      />
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`a-${active}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={
                    reduce
                      ? { duration: 0.2 }
                      : { type: "spring", stiffness: 340, damping: 30, delay: typing + 0.15 }
                  }
                  style={{ transformOrigin: "0% 100%" }}
                  className="[grid-area:1/1] max-w-[85%] self-start rounded-[20px] rounded-bl-[6px] bg-[#e9e9eb] px-4 py-3 text-[16px] leading-[1.45] text-[#1d1d1f] dark:bg-[#262628] dark:text-[#f5f5f7]"
                >
                  {activeItem.answer}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default FaqFolderCard;
