"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

export interface InstantSearchFaqItem {
  q: string;
  a: string;
  cat: string;
}

export interface InstantSearchFaqProps {
  /** Accent colour. Defaults to Apple blue (#0071e3 light, #0a84ff dark). */
  accent?: string;
  faqs?: InstantSearchFaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Runs from the "Ask the team" link shown when nothing matches, with the trimmed search text. */
  onAskTeam?: (query: string) => void;
  /** Types a few searches by itself until the visitor touches the section. */
  autoplay?: boolean;
  className?: string;
}

const FAQS: InstantSearchFaqItem[] = [
  { cat: "Billing", q: "Can I switch plans later?", a: "Yes, any time. Upgrades apply straight away and we credit the unused part of your old plan." },
  { cat: "Billing", q: "Do you offer refunds?", a: "If it isn't working for you in the first 30 days, write to us and we'll refund the full amount." },
  { cat: "Billing", q: "Is there a discount for non-profits?", a: "Registered non-profits and schools get 50% off any plan. Send us your details from the billing page." },
  { cat: "Product", q: "Does it work offline?", a: "The desktop and mobile apps keep your recent work offline and sync when you reconnect." },
  { cat: "Product", q: "Can I import from another tool?", a: "One-click imports cover the most common tools, and there's a CSV importer for everything else." },
  { cat: "Security", q: "Where is my data stored?", a: "In the region you choose when you sign up: US, EU or Australia. It never leaves that region." },
  { cat: "Security", q: "Do you support SSO?", a: "SAML SSO and SCIM provisioning are included on the Scale plan." },
];

const DEMO_QUERIES = ["refund", "sso", "pizza", "offline"];

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-a)]";

function filterFaqs(faqs: InstantSearchFaqItem[], cat: string, raw: string) {
  const q = raw.trim().toLowerCase();
  return faqs.filter((f) => (cat === "All" || f.cat === cat) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q)));
}

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[4px] bg-[#ffd60a]/60 px-0.5 text-inherit dark:bg-[#ffd60a]/35">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Searchable FAQ. Type and the list filters as you go, with matches highlighted and the remaining
 * questions sliding together. Category chips narrow it further. With no results, a small chat
 * bubble offers to ask the team.
 */
export function InstantSearchFaq({
  accent,
  faqs = FAQS,
  eyebrow = "FAQ",
  title = "Ask us anything. We probably wrote it down.",
  description = "Still stuck? Our team replies in a few minutes, most hours of the day.",
  onAskTeam,
  autoplay = false,
  className,
}: InstantSearchFaqProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  useTypedText(q);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);
  const [touched, setTouched] = useState(false);
  const cats = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.cat)))], [faqs]);
  const term = q.trim();
  const list = useMemo(() => filterFaqs(faqs, cat, q), [faqs, cat, q]);

  // Autoplay: type a query, open the top hit, erase it, move on to the next.
  const demo = autoplay && !touched && !reduce;
  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => { t = setTimeout(r, ms); });
    (async () => {
      await wait(900);
      for (let n = 0; !cancelled; n = (n + 1) % DEMO_QUERIES.length) {
        const word = DEMO_QUERIES[n];
        for (let i = 1; i <= word.length && !cancelled; i++) {
          setQ(word.slice(0, i));
          await wait(110);
        }
        if (cancelled) return;
        const hit = filterFaqs(faqs, "All", word)[0];
        if (hit) setOpen(hit.q);
        await wait(2400);
        for (let i = word.length - 1; i >= 0 && !cancelled; i--) {
          setQ(word.slice(0, i));
          await wait(45);
        }
        await wait(700);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [demo, faqs]);

  const stopDemo = () => {
    if (touched) return;
    setTouched(true);
    if (autoplay) setQ("");
  };

  return (
    <section
      className={`w-full bg-white px-4 py-[clamp(48px,8vw,80px)] [--mk-a:#0071e3] sm:px-5 dark:bg-black dark:[--mk-a:#0a84ff] ${className ?? ""}`}
      style={accent ? ({ "--mk-a": accent } as CSSProperties) : undefined}
      onPointerDown={stopDemo}
      onKeyDown={stopDemo}
    >
      <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col gap-4">
          <span className="text-[14px] font-semibold text-[var(--mk-a)]">{eyebrow}</span>
          <h2 className={`m-0 text-[clamp(30px,5vw,50px)] font-semibold leading-[1.04] tracking-[-0.04em] ${ink}`}>{title}</h2>
          <p className={`m-0 text-[clamp(16px,1.6vw,17px)] leading-[1.5] ${muted}`}>{description}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <label className="relative flex items-center">
            <span className="sr-only">Search questions</span>
            <svg className="pointer-events-none absolute left-4 text-[#86868b] dark:text-[#8e8e93]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
            </svg>
            <input
              type="search"
              value={q}
              maxLength={80}
              onChange={(e) => setQ(e.target.value)}
              onFocus={stopDemo}
              placeholder="Search questions"
              className={`h-12 w-full appearance-none rounded-2xl bg-[#f5f5f7] pl-11 pr-28 text-[16px] outline-none placeholder:text-[#a1a1a6] focus:ring-2 focus:ring-[var(--mk-a)] dark:bg-[#1c1c1e] dark:placeholder:text-[#8e8e93] [&::-webkit-search-cancel-button]:hidden ${ink}`}
            />
            <AnimatePresence>
              {term && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  aria-live="polite"
                  className={`absolute right-3 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium tabular-nums shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${muted}`}
                >
                  {list.length} {list.length === 1 ? "result" : "results"}
                </motion.span>
              )}
            </AnimatePresence>
          </label>
          <LayoutGroup id={`faq-${uid}`}>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={cat === c}
                  onClick={() => setCat(c)}
                  className={`relative h-10 rounded-full px-4 text-[13px] font-medium ${focusRing} ${
                    cat === c ? "text-white dark:text-[#1d1d1f]" : "text-[#424245] dark:text-[#d1d1d6]"
                  }`}
                >
                  {cat === c ? (
                    <motion.span layoutId="faq-cat" className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
                  ) : (
                    <span className="absolute inset-0 rounded-full bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
                  )}
                  <span className="relative">{c}</span>
                </button>
              ))}
            </div>
            <motion.div layout className="flex flex-col">
              <AnimatePresence initial={false} mode="popLayout">
                {list.map((f) => {
                  const on = open === f.q;
                  return (
                    <motion.div
                      key={f.q}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                      transition={{ filter: { duration: 0.35 }, type: "spring", stiffness: 380, damping: 32 }}
                      className="border-b border-black/[.07] dark:border-white/10"
                    >
                      <button
                        type="button"
                        aria-expanded={on}
                        onClick={() => setOpen(on ? null : f.q)}
                        className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-lg py-4 text-left sm:py-5 ${focusRing}`}
                      >
                        <span className={`text-[clamp(16px,1.7vw,17px)] font-semibold tracking-[-0.015em] ${ink}`}>
                          <Mark text={f.q} q={term} />
                        </span>
                        <motion.svg
                          animate={{ rotate: on ? 180 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 24 }}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          className={`flex-none ${muted}`}
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </motion.svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.div
                            key="a"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="overflow-hidden"
                          >
                            <p className={`m-0 pb-5 text-[15px] leading-[1.6] ${muted}`}>
                              <Mark text={f.a} q={term} />
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <AnimatePresence>
                {list.length === 0 && (
                  <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-start gap-3 py-8">
                    <span className={`break-words text-[15px] ${muted}`}>
                      Nothing about &ldquo;{term}&rdquo; yet.
                    </span>
                    <div className="flex items-center gap-2 rounded-[18px] rounded-bl-md bg-[#f0f0f3] px-4 py-3 dark:bg-[#2c2c2e]" aria-hidden="true">
                      {[0, 1, 2].map((k) => (
                        <motion.span
                          key={k}
                          className="h-2 w-2 rounded-full bg-[#86868b] dark:bg-[#8e8e93]"
                          animate={reduce ? { opacity: 0.7 } : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, delay: k * 0.15 }}
                        />
                      ))}
                    </div>
                    <motion.a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onAskTeam?.(term);
                      }}
                      whileHover={{ x: 3 }}
                      className={`inline-flex min-h-10 items-center rounded-lg text-[15px] font-medium text-[var(--mk-a)] ${focusRing}`}
                    >
                      Ask the team →
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </section>
  );
}
