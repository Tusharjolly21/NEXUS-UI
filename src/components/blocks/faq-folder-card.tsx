"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail, Phone, Plus, RotateCcw, Search, Sparkles } from "lucide-react";
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
    question: "What services do you offer?",
    answer:
      "Use this card for product questions, onboarding answers, support content, or any reusable FAQ list. Replace the data array with your own entries.",
  },
  {
    question: "How often can I update the FAQs?",
    answer:
      "As often as you need. Pass a new items array from a config file, CMS, API response, or static page data.",
  },
  {
    question: "Can I add many questions?",
    answer:
      "Yes. The component maps over the array, keeps the same row animation, and opens one item at a time for a tidy FAQ experience.",
  },
  {
    question: "Does this include the code section?",
    answer:
      "Yes. The block detail page reads this component file, so the Preview and Code tabs stay aligned with the real implementation.",
  },
];

const SEARCHABLE_FAQS: FaqItem[] = [
  {
    question: "What is this FAQ section for?",
    answer:
      "Use it for pricing pages, onboarding flows, help centers, SaaS landing pages, or product support sections.",
    tag: "General",
  },
  {
    question: "Can I filter questions by category?",
    answer:
      "Yes. Add a tag value to each FAQ item and the tabs are generated automatically from your data.",
    tag: "General",
  },
  {
    question: "Can users search answers too?",
    answer:
      "The search field checks both question and answer text, so visitors can find relevant content quickly.",
    tag: "Support",
  },
  {
    question: "Can more than one answer stay open?",
    answer:
      "This version keeps one answer open at a time for a clean, focused layout. You can adjust the state logic if needed.",
    tag: "Support",
  },
  {
    question: "Does the animation match the card?",
    answer:
      "Rows use the same smooth timing, subtle border transition, expanding answer area, and rotating plus icon.",
    tag: "Motion",
  },
];

const CHAT_FAQS: FaqItem[] = [
  {
    question: "How does the guided FAQ work?",
    answer:
      "Each question behaves like an incoming chat prompt. Select one and the answer arrives as a focused reply, so visitors never feel buried in a long support page.",
  },
  {
    question: "Can I add my own support topics?",
    answer:
      "Yes. Add as many question and answer pairs as you need in the data array. The layout keeps the same staggered message rhythm automatically.",
  },
  {
    question: "Will answers feel instant?",
    answer:
      "The reply includes a short typing beat before the response slides in from the right, which makes the interaction feel conversational without slowing people down.",
  },
  {
    question: "Can this match my brand?",
    answer:
      "Swap the background, bubble colors, text styles, spacing, and accent outline to fit SaaS, ecommerce, finance, or help-center pages.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. The question stack and answer panel collapse cleanly so the chat remains easy to tap and read on smaller screens.",
  },
  {
    question: "Where should I use it?",
    answer:
      "Use it on landing pages, pricing pages, onboarding flows, or anywhere static FAQs need a warmer, more interactive touch.",
  },
];

const appearUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.44, 0, 0.56, 1] as [number, number, number, number] },
  },
};

const appearSide = {
  hidden: { opacity: 0, x: 150 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.4, duration: 1, ease: [0.12, 0.23, 0, 1] as [number, number, number, number] },
  },
};

export function FaqFolderCard({
  items = DEFAULT_FAQS,
  eyebrow = "FAQ",
  title = "Questions & Answers",
  description = "Have more questions? Do not hesitate to reach out. Add, remove, or reorder FAQ entries from one data array.",
  phone = "+41 123 456 123",
  email = "hello@example.com",
  className,
}: FaqFolderCardProps) {
  const [open, setOpen] = React.useState(0);

  return (
    <section className={cn("w-full bg-white p-3 text-slate-950 sm:p-6", className)}>
      <div className="mx-auto w-full max-w-[1360px] overflow-hidden rounded-[36px] border border-slate-200 bg-linear-to-b from-slate-100 to-slate-50 p-5 sm:p-9 lg:p-14">
        <div className="pointer-events-none absolute" />
        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden select-none text-[190px] font-semibold leading-none tracking-normal text-transparent opacity-65 sm:block lg:text-[300px]">
            <span className="bg-linear-to-t from-transparent to-slate-300 bg-clip-text">
              {eyebrow}
            </span>
          </div>

          <div className="relative z-10 grid gap-9 lg:grid-cols-2 lg:gap-12">
            <div className="flex min-w-0 flex-col justify-center overflow-hidden">
              <motion.div
                variants={appearUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0 }}
              >
                <h2 className="max-w-xl bg-linear-to-t from-slate-950 to-slate-500 bg-clip-text text-[42px] font-semibold leading-[50px] tracking-[-0.03em] text-transparent">
                  {title}
                </h2>
              </motion.div>

              <motion.p
                variants={appearUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0 }}
                className="mt-4 max-w-xl text-lg leading-8 text-slate-600"
              >
                {description}
              </motion.p>

              <motion.div
                variants={appearUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0 }}
                className="mt-12 flex flex-col gap-4"
              >
                <ContactPill icon={<Phone className="size-4" />} href={`tel:${phone.replace(/\s/g, "")}`}>
                  {phone}
                </ContactPill>
                <ContactPill icon={<Mail className="size-4" />} href={`mailto:${email}`}>
                  {email}
                </ContactPill>
              </motion.div>
            </div>

            <motion.div
              variants={appearSide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="flex min-w-0 flex-col gap-6"
            >
              {items.map((item, index) => (
                <FaqRow
                  key={`${item.question}-${index}`}
                  item={item}
                  index={index}
                  open={open === index}
                  onToggle={() => setOpen((current) => (current === index ? -1 : index))}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
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
    <a
      href={href}
      className="inline-flex h-12 w-fit items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 text-base font-medium text-slate-700 shadow-[0_1px_1px_rgba(0,0,0,.04),0_4px_10px_rgba(0,0,0,.03)] transition hover:bg-slate-50"
    >
      <span className="text-slate-500">{icon}</span>
      {children}
    </a>
  );
}

function FaqRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ backgroundColor: "rgb(247, 247, 248)" }}
      className="w-full overflow-hidden rounded-[22px] border border-slate-200 bg-white px-8 py-6 text-left shadow-[0_0.7px_0.7px_-1.25px_rgba(0,0,0,.04),0_2.7px_2.7px_-2.5px_rgba(0,0,0,.03),0_12px_12px_-3.75px_rgba(0,0,0,.01)]"
      transition={{ duration: 0.3, ease: [0.44, 0, 0.56, 1] }}
    >
      <div className="flex select-none items-center gap-3">
        <div className="flex min-w-7 items-center px-2 text-2xl leading-9 text-slate-500">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <p className="w-full text-base font-medium leading-6 text-slate-800">
            {item.question}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.44, 0, 0.56, 1] }}
          className="grid size-6 shrink-0 place-items-center text-slate-500"
        >
          <ChevronDown className="size-6" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.44, 0, 0.56, 1] }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-base leading-7 text-slate-600">
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

export function SearchableFaqSection({
  items = SEARCHABLE_FAQS,
  className,
}: {
  items?: FaqItem[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All");
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.tag).filter((t): t is string => Boolean(t))))],
    [items],
  );

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const tabMatch = activeTab === "All" || item.tag === activeTab;
      const searchMatch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return tabMatch && searchMatch;
    });
  }, [activeTab, items, search]);

  return (
    <section className={cn("w-full bg-white p-3 text-slate-950 sm:p-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.44, 0, 0.56, 1] }}
        className="mx-auto w-full max-w-[900px] rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,.08)] sm:p-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          FAQ
        </div>

        <div className="mt-4">
          <h3 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Frequently Asked Questions
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Everything visitors need to know. Search, filter by category, and expand each answer with a smooth accordion motion.
          </p>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = activeTab === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveTab(category);
                  setOpen(0);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                  selected
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {filtered.length ? (
            filtered.map((item, index) => (
              <SearchableFaqRow
                key={`${item.question}-${item.tag ?? "faq"}`}
                item={item}
                index={index}
                open={open === index}
                onToggle={() => setOpen((current) => (current === index ? -1 : index))}
              />
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
              No questions match your search.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-950">Still have questions?</p>
            <p className="mt-0.5 text-xs text-slate-500">Use this footer for a contact or support CTA.</p>
          </div>
          <a
            href="mailto:hello@example.com"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
          >
            Contact Support →
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function SearchableFaqRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white transition",
        open ? "border-emerald-500/40" : "border-slate-200",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 flex-1 items-start gap-3">
          <span className="min-w-7 pt-0.5 text-xs font-medium text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-medium leading-6 text-slate-950">
            {item.question}
          </span>
        </span>
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border transition",
            open
              ? "rotate-45 border-emerald-500 bg-emerald-500 text-white"
              : "rotate-0 border-slate-200 bg-transparent text-slate-950",
          )}
        >
          <span className="relative block size-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rounded-full bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rounded-full bg-current" />
          </span>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: open ? 400 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <p className="pb-4 pl-14 pr-4 text-sm leading-7 text-slate-600">
          {item.answer}
        </p>
      </div>
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
  const [active, setActive] = React.useState(0);
  const activeItem = items[active] ?? items[0] ?? CHAT_FAQS[0];

  return (
    <section className={cn("w-full bg-black p-3 text-white sm:p-6", className)}>
      <div className="relative mx-auto min-h-[640px] w-full max-w-[1360px] overflow-hidden rounded-[28px] border border-indigo-200/10 bg-[#080716] shadow-[0_24px_90px_rgba(0,0,0,.5)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(107,96,214,.2),transparent_35%),linear-gradient(180deg,#17142a_0%,#0a081c_46%,#050313_100%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle,rgba(255,255,255,.32)_1px,transparent_1px)] [background-size:6px_6px]" />
        <div className="absolute inset-x-0 top-16 h-px bg-white/8" />
        <div className="absolute inset-x-0 top-[36%] h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,.035),transparent)]" />
        <div className="absolute inset-x-0 bottom-[18%] h-24 bg-[linear-gradient(180deg,transparent,rgba(90,78,180,.05),transparent)]" />

        <button
          type="button"
          onClick={() => setActive(0)}
          aria-label="Reset chat FAQ"
          className="absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-xl bg-white/8 text-white/70 transition hover:bg-white/12 hover:text-white"
        >
          <RotateCcw className="size-5" />
        </button>

        <div className="relative z-10 grid min-h-[640px] gap-8 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div className="pointer-events-none absolute left-1/2 top-[138px] hidden -translate-x-1/2 text-sm font-medium text-white/42 lg:block">
            Sunday, 10:07 AM
          </div>

          <div className="relative flex flex-col justify-center pt-16 lg:pt-0">
            <div className="space-y-4 lg:pl-12">
              {items.map((item, index) => {
                const selected = index === active;
                return (
                  <motion.button
                    key={`${item.question}-${index}`}
                    type="button"
                    initial={{ opacity: 0, x: -42, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ x: 5 }}
                    transition={{
                      duration: 0.46,
                      delay: index * 0.075,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => setActive(index)}
                    className={cn(
                      "group relative flex w-fit max-w-[640px] items-center gap-5 rounded-[22px] border px-5 py-3.5 text-left text-base font-semibold leading-none tracking-[-0.02em] shadow-2xl shadow-black/30 transition sm:text-lg",
                      selected
                        ? "border-sky-400 bg-[#333337] text-white shadow-[0_0_0_4px_rgba(56,189,248,.14),0_18px_40px_rgba(0,0,0,.35)]"
                        : "border-transparent bg-[#2b2b2d] text-white/88 hover:bg-[#343436]",
                      index === 0 && "ml-0",
                      index === 1 && "ml-0 sm:ml-4",
                      index === 2 && "ml-0 sm:ml-3",
                      index === 3 && "ml-0 max-w-[440px]",
                      index === 4 && "ml-0 sm:ml-2",
                      index === 5 && "ml-0",
                    )}
                  >
                    {(index === 0 || index === 3 || index === 5) ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -top-2 text-sky-300 drop-shadow-[0_0_10px_rgba(125,211,252,.6)]",
                          index === 0 && "right-2",
                          index === 3 && "-left-2",
                          index === 5 && "right-5",
                        )}
                      >
                        <Sparkles className="size-4 fill-current" />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">{item.question}</span>
                    <motion.span
                      animate={{ rotate: selected ? 45 : 0 }}
                      transition={{ duration: 0.28, ease: [0.44, 0, 0.56, 1] }}
                      className="grid size-6 shrink-0 place-items-center text-white/62"
                    >
                      <Plus className="size-5" />
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-center justify-end pb-4 pt-4 lg:min-h-0 lg:pr-12">
            <div className="w-full max-w-[560px] space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`typing-${active}`}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: [0, 1, 1, 0], y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="ml-auto flex w-fit items-center gap-1 rounded-full bg-white px-4 py-3 shadow-xl shadow-black/20"
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="size-2 rounded-full bg-zinc-400"
                      animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: dot * 0.12,
                      }}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`answer-${active}`}
                  initial={{ opacity: 0, x: 110, y: 18, scale: 0.94, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 58, y: -8, scale: 0.98, filter: "blur(8px)" }}
                  transition={{ delay: 0.38, duration: 0.58, ease: [0.12, 0.23, 0, 1] }}
                  className="ml-auto max-w-[88%] rounded-[28px] rounded-br-md bg-white px-6 py-5 text-base leading-7 text-zinc-700 shadow-2xl shadow-black/30"
                >
                  {activeItem.answer}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqFolderCard;
