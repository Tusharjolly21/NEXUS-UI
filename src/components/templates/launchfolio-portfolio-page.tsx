"use client";
/**
 * Launchfolio: a product designer's portfolio told through case studies.
 * Built from Motion Kit components: Before / After (local copy), Folder Peek,
 * Stretch Nav, Upload Chips, Component Layers, Scrub Inputs, Settings Tabs and
 * Stagger Menu.
 * The hero is a real redesign: drag the divider across a checkout and the
 * results beside it move from the old numbers to the new ones.
 */
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import FolderPeek from "@/components/templates/kit/components/FolderPeek";
import StretchNav from "@/components/templates/kit/components/StretchNav";
import UploadChips from "@/components/templates/kit/components/UploadChips";
import ComponentLayers from "@/components/templates/kit/components/ComponentLayers";
import ScrubInput from "@/components/templates/kit/components/ScrubInput";
import AnimatedTabs from "@/components/templates/kit/components/AnimatedTabs";
import StaggerMenu, { type MenuItem } from "@/components/templates/kit/components/StaggerMenu";
import BeforeAfter from "@/components/templates/launchfolio-portfolio/BeforeAfter";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const O = "#ea580c"; // graphics
const OD = "#c2410c"; // orange text and buttons (5.2:1 on white)
const OT = "#fff4ec"; // orange wash
const INK = "#1d1d1f";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill={INK} />
        <motion.path d="M10 21 L16 10 L22 21" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease, delay: 0.2 }} />
        <circle cx="16" cy="24.5" r="1.8" fill="#fff" />
      </svg>
      Launchfolio
    </span>
  );
}

/* ------------------------------------------------------------------ hero: the checkout, before and after */

function Chrome({ children, tone = "#fff" }: { children: ReactNode; tone?: string }) {
  return (
    <div className="isolate flex h-full w-full flex-col" style={{ background: tone }}>
      {/* Tall bar with a centred address, so the Before / After chips can sit on its ends. */}
      <div className="flex h-[52px] flex-none items-center justify-center border-b border-black/[.06] bg-[#f5f5f7] px-3">
        <span className="hidden truncate rounded-full bg-white px-3 py-1 text-[10px] sm:inline text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.05)]">fernway.shop/checkout</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

const Field = ({ l, w = "100%", tiny = false }: { l: string; w?: string; tiny?: boolean }) => (
  <span className="flex flex-col gap-0.5" style={{ width: w }}>
    <span className={`${tiny ? "text-[8px]" : "text-[10px]"} font-medium text-[#6e6e73]`}>{l}</span>
    <span className={`${tiny ? "h-[14px]" : "h-[26px]"} rounded-[4px] border border-[#c7c7cc] bg-white`} />
  </span>
);

function CheckoutBefore() {
  return (
    <Chrome tone="#fafafa">
      <div className="flex h-full flex-col">
        <div className="bg-[#dc2626] px-3 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-white">Free shipping over $80! Use code SAVE10 · Ends tonight</div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-[12px] font-bold text-[#1d1d1f]">FERNWAY</span>
          <span className="flex gap-1 text-[8px] text-[#6e6e73]"><span className="rounded bg-[#1d1d1f] px-1.5 py-0.5 text-white">1 Details</span><span className="rounded bg-[#e5e5ea] px-1.5 py-0.5">2 Shipping</span><span className="rounded bg-[#e5e5ea] px-1.5 py-0.5">3 Payment</span></span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pb-3 sm:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <span className="flex gap-1.5"><Field tiny l="First name*" /><Field tiny l="Last name*" /></span>
            <span className="flex gap-1.5"><Field tiny l="Email*" /><Field tiny l="Confirm email*" /></span>
            <Field tiny l="Phone (for delivery updates)*" />
            <Field tiny l="Address line 1*" />
            <span className="flex gap-1.5"><Field tiny l="Address line 2" /><Field tiny l="City*" /></span>
            <span className="flex gap-1.5"><Field tiny l="Postcode*" /><Field tiny l="Country*" /></span>
            <Field tiny l="Create a password to save your details*" />
            <span className="flex items-center gap-1 text-[8px] text-[#6e6e73]"><span className="h-2 w-2 rounded-sm border border-[#86868b]" />Sign me up for deals (unticking may delay your order)</span>
          </div>
          <div className="hidden flex-col gap-1.5 rounded-[6px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.08)] sm:flex">
            <span className="text-[9px] font-bold text-[#1d1d1f]">Order summary (3)</span>
            {["Trail mug", "Wool socks", "Map case"].map((x) => <span key={x} className="flex justify-between text-[8px] text-[#6e6e73]"><span>{x}</span><span>$—</span></span>)}
            <span className="mt-1 text-[8px] font-bold text-[#1d1d1f]">You may also like</span>
            <span className="grid grid-cols-3 gap-1">{[0, 1, 2].map((i) => <span key={i} className="aspect-square rounded bg-[#fde68a]" />)}</span>
            <span className="flex gap-1"><span className="h-[14px] flex-1 rounded border border-[#c7c7cc]" /><span className="rounded bg-[#e5e5ea] px-1.5 text-[8px] leading-[14px]">Apply code</span></span>
            <span className="mt-auto self-end rounded bg-[#d2d2d7] px-2 py-1 text-[8px] text-[#6e6e73]">Continue to shipping ›</span>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function CheckoutAfter() {
  return (
    <Chrome>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Fernway</span>
          <span className="flex items-center gap-1 text-[10px] text-[#6e6e73]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>Secure checkout</span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-5 pb-4 sm:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-2.5">
            <span className="flex h-[30px] items-center justify-center rounded-[8px] bg-[#1d1d1f] text-[11px] font-semibold text-white">Express pay</span>
            <span className="flex items-center gap-2 text-[9px] text-[#86868b]"><span className="h-px flex-1 bg-[#e5e5ea]" />or pay by card<span className="h-px flex-1 bg-[#e5e5ea]" /></span>
            <Field l="Email" />
            <span className="relative flex flex-col gap-0.5">
              <Field l="Delivery address" />
              <span className="absolute left-2 right-2 top-[38px] z-10 rounded-[6px] bg-white px-2 py-1 text-[9px] text-[#1d1d1f] shadow-[0_6px_16px_-6px_rgba(0,0,0,.3),0_0_0_1px_rgba(0,0,0,.06)]">12 Larch Road, Bristol BS6 · <span style={{ color: OD }}>Use this</span></span>
            </span>
            <Field l="Card number" />
            <span className="flex gap-2"><Field l="Expiry" /><Field l="CVC" /></span>
          </div>
          <div className="hidden flex-col gap-2 rounded-[10px] bg-[#f5f5f7] p-3 sm:flex">
            <span className="text-[11px] font-semibold text-[#1d1d1f]">3 items</span>
            {[["Trail mug", "$24.00"], ["Wool socks", "$18.00"], ["Map case", "$22.20"]].map(([a, b]) => <span key={a} className="flex justify-between text-[10px] text-[#424245]"><span>{a}</span><span className="tabular-nums">{b}</span></span>)}
            <span className="flex justify-between border-t border-black/[.08] pt-1.5 text-[10px] text-[#424245]"><span>Delivery Thu, 8–10 am</span><span>Free</span></span>
            <span className="mt-auto flex h-[30px] items-center justify-center rounded-[8px] text-[11px] font-semibold text-white" style={{ background: OD }}>Pay $64.20</span>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

/** A number that eases between the old and new result as the divider moves. */
function Live({ pos, from, to, format }: { pos: MotionValue<number>; from: number; to: number; format: (n: number) => string }) {
  const text = useTransform(pos, (p) => format(from + (to - from) * (1 - p / 100)));
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function Metric({ pos, label, from, to, format, better }: { pos: MotionValue<number>; label: string; from: number; to: number; format: (n: number) => string; better: string }) {
  const fill = useTransform(pos, (p) => (from + (to - from) * (1 - p / 100)) / Math.max(from, to));
  return (
    <div className="flex flex-col gap-2 border-t border-black/[.08] py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] text-[#6e6e73]">{label}</span>
        <span className="text-[26px] font-semibold tracking-[-0.035em] text-[#1d1d1f]"><Live pos={pos} from={from} to={to} format={format} /></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f3]">
        <motion.div className="h-full origin-left rounded-full" style={{ scaleX: fill, background: O }} />
      </div>
      <span className="text-[12px] text-[#6e6e73]">{better}</span>
    </div>
  );
}

function Hero() {
  const pos = useMotionValue(50);
  const smooth = useSpring(pos, { stiffness: 380, damping: 34, mass: 0.6 });
  const sec = (n: number) => `${Math.floor(n / 60)}:${String(Math.round(n % 60)).padStart(2, "0")}`;
  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pt-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: `radial-gradient(45% 50% at 20% 30%, ${OT}, transparent 70%), radial-gradient(30% 30% at 90% 10%, rgba(234,88,12,.08), transparent 70%)` }} />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-5 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <motion.div className="order-2 lg:order-1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.2 }}>
          <div className="mb-3 flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[#1d1d1f]">Case 01 · Fernway checkout</span>
            <span className="text-[#6e6e73]">Shipped March 2026</span>
          </div>
          <BeforeAfter before={<CheckoutBefore />} after={<CheckoutAfter />} beforeLabel="Before · 3 steps" afterLabel="After · 1 page" value={pos} autoplay aspect="aspect-[4/5] sm:aspect-[16/10]" accent={OD} />
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["7 fields removed", "Guest checkout by default", "Address lookup", "One obvious button"].map((t) => (
              <span key={t} className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">{t}</span>
            ))}
          </div>
          <p className="m-0 mt-4 text-center text-[13px] text-[#6e6e73]">Numbers between the ends are blended as you drag; the ends are the measured before and after.</p>
        </motion.div>
        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="text-[14px] font-semibold" style={{ color: OD }}>
            Maya Okafor · Product designer
          </motion.span>
          <h1 className="m-0 text-[clamp(40px,4.4vw,62px)] font-semibold leading-[1] tracking-[-0.045em] text-[#1d1d1f] [text-wrap:balance]">
            <Words text="I redesign the screens where customers give up." accentWords={["give", "up."]} accent={OD} />
          </h1>
          <Reveal delay={0.3} y={14}>
            <p className="m-0 max-w-[480px] text-[clamp(17px,1.8vw,19px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Checkouts, onboarding, uploads. Each case study shows the screen, what I learned and the number that moved. Drag the divider to see this one change.
            </p>
          </Reveal>
          <Reveal delay={0.4} y={14}>
            <div className="flex flex-col">
              <Metric pos={smooth} label="Checkout completion" from={58} to={81} format={(n) => `${Math.round(n)}%`} better="Up 23 points in the first 30 days" />
              <Metric pos={smooth} label="Median time to pay" from={161} to={52} format={sec} better="From 2:41 to 0:52" />
              <Metric pos={smooth} label="Fields to fill" from={11} to={4} format={(n) => `${Math.round(n)}`} better="Address lookup does the rest" />
            </div>
          </Reveal>
          <Reveal delay={0.5} y={12} className="flex flex-wrap gap-3">
            <Magnetic className="text-white" style={{ background: OD }} onClick={() => scrollToId("work")}>Read the case studies</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("contact")}>Book a call</Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ proof */

function Proof() {
  const items = [
    { to: 14, f: (n: number) => `${Math.round(n)}`, l: "products shipped since 2017" },
    { to: 19, f: (n: number) => `+${Math.round(n)} pts`, l: "average lift on the flow I redesigned" },
    { to: 3, f: (n: number) => `${Math.round(n)}`, l: "design systems still in production" },
    { to: 6, f: (n: number) => `${Math.round(n)} wks`, l: "typical time from kickoff to shipped" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-10">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-1 border-t border-black/[.08] pt-5">
            <Counter to={it.to} format={it.f} className="text-[clamp(32px,4.2vw,46px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ case index */

const CASES = [
  { id: "fernway", n: "01", title: "Fernway", what: "Checkout redesign", meta: "41 files · 6 weeks", color: "#c2410c", result: "+23 pts completion" },
  { id: "ledgerly", n: "02", title: "Ledgerly", what: "Receipt uploads", meta: "28 files · 4 weeks", color: "#334155", result: "−74% cancelled uploads" },
  { id: "tidepool", n: "03", title: "Tidepool", what: "Design system", meta: "212 files · 5 months", color: "#0f766e", result: "41 one-offs → 1 pattern" },
];

function CaseIndex() {
  return (
    <section id="work" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Case studies" title="Three folders. One problem each." sub="Every case opens with the number that was wrong and ends with the number after launch. Peek inside a folder, then read the whole thing." accent={OD} />
        <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CASES.map((c) => (
            <div key={c.id} className={`${card} flex h-full flex-col items-center gap-2 px-6 pb-7 pt-2`}>
              <FolderPeek title={`${c.n} · ${c.title}`} meta={c.meta} color={c.color} autoplay />
              <div className="mt-2 flex w-full flex-col gap-1 border-t border-black/[.06] pt-4">
                <span className="text-[13px] text-[#6e6e73]">{c.what}</span>
                <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{c.result}</span>
              </div>
              <button type="button" onClick={() => scrollToId(c.id)} className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full text-[14px] font-semibold outline-none focus-visible:ring-2" style={{ color: OD, ["--tw-ring-color" as string]: OD }}>
                Read case {c.n} <span aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ case 01: chapters */

function Funnel() {
  const rows = [["Reached checkout", 100], ["Entered details", 71], ["Reached payment", 64], ["Paid", 58]] as const;
  return (
    <div className="flex w-full flex-col gap-3">
      {rows.map(([l, v], i) => (
        <div key={l} className="flex items-center gap-4">
          <span className="w-[130px] flex-none text-[14px] text-[#424245]">{l}</span>
          <span className="relative h-9 flex-1 overflow-hidden rounded-[10px] bg-[#f5f5f7]">
            <motion.span className="absolute inset-y-0 left-0 origin-left rounded-[10px]" style={{ width: `${v}%`, background: i === 3 ? OD : "#fdba74" }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.07 }} />
            <span className="absolute inset-y-0 right-3 flex items-center text-[13px] font-semibold tabular-nums text-[#1d1d1f]">{v}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const QUOTES = [
  { p: "P3", q: "Why does it need my password? I'm buying socks.", t: "Abandoned at step 1" },
  { p: "P7", q: "I typed my email twice and it still said they don't match.", t: "Retried 3 times" },
  { p: "P11", q: "I couldn't find the button. Is it the grey one?", t: "Took 40 s to find Continue" },
];

const REMOVED = ["Confirm email", "Create a password", "Address line 2", "City", "Postcode", "Country", "Phone"];

function Chapter({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f]">42% of people who reached checkout never paid.</h3>
          <p className="m-0 text-[16px] leading-[1.55] text-[#6e6e73]">Fernway sells outdoor kit to people who already know what they want. They weren&apos;t leaving because of price. They were leaving at the form.</p>
        </div>
        <Funnel />
      </div>
    );
  if (i === 1)
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f]">I watched 14 people check out, out loud.</h3>
          <p className="m-0 max-w-[620px] text-[16px] leading-[1.55] text-[#6e6e73]">Remote sessions, their own phones and laptops, a real order refunded afterwards. Three moments came up again and again.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {QUOTES.map((q, k) => (
            <motion.figure key={q.p} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: k * 0.06 }} className="m-0 flex flex-col gap-3 rounded-[20px] bg-[#f5f5f7] p-5">
              <span className="text-[12px] font-semibold" style={{ color: OD }}>{q.p}</span>
              <blockquote className="m-0 text-[16px] leading-[1.45] text-[#1d1d1f]">&ldquo;{q.q}&rdquo;</blockquote>
              <figcaption className="text-[13px] text-[#6e6e73]">{q.t}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    );
  if (i === 2)
    return (
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f]">Four fields, one page, one obvious button.</h3>
          <p className="m-0 text-[16px] leading-[1.55] text-[#6e6e73]">Address lookup fills five fields from one. Guest checkout became the default; an account is offered after payment, with the details already saved.</p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Fields removed">
          {REMOVED.map((f, k) => (
            <motion.li key={f} className="relative flex items-center justify-between rounded-[14px] bg-[#f5f5f7] px-4 py-2.5 text-[15px] text-[#424245]" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.05, type: "spring", stiffness: 300, damping: 26 }}>
              <span className="relative">
                {f}
                <motion.span className="absolute left-0 right-0 top-1/2 h-[1.5px] origin-left" style={{ background: OD }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + k * 0.08, type: "spring", stiffness: 200, damping: 24 }} />
              </span>
              <span className="text-[12px] font-medium text-[#6e6e73]">{k < 4 ? "auto-filled" : k < 6 ? "after payment" : "optional"}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <h3 className="m-0 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f]">Thirty days after launch.</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { v: 81, f: (n: number) => `${Math.round(n)}%`, l: "checkout completion, up from 58%" },
          { v: 52, f: (n: number) => `0:${String(Math.round(n)).padStart(2, "0")}`, l: "median time to pay, from 2:41" },
          { v: 38, f: (n: number) => `−${Math.round(n)}%`, l: "support tickets about orders" },
        ].map((m) => (
          <div key={m.l} className="flex flex-col gap-1 rounded-[20px] bg-[#f5f5f7] p-5">
            <Counter to={m.v} format={m.f} duration={1.1} className="text-[40px] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[14px] text-[#6e6e73]">{m.l}</span>
          </div>
        ))}
      </div>
      <p className="m-0 max-w-[640px] text-[15px] leading-[1.55] text-[#6e6e73]">Measured as an A/B test on 50% of traffic for two weeks, then rolled out. Revenue per visitor rose 11%, which mattered more to Fernway than the completion rate.</p>
    </div>
  );
}

function CaseFernway() {
  const [ch, setCh] = useState(0);
  return (
    <section id="fernway" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow="Case 01 · Fernway" title="A checkout people actually finish." accent={OD} />
        <Reveal y={12}><span className="text-[15px] text-[#6e6e73]">Role: lead designer, with two engineers and a PM.</span></Reveal>
      </div>
      <Reveal y={20} className="mt-10">
        <div className={`${card} flex flex-col gap-8 p-6 sm:p-9`}>
          <div className="flex justify-center sm:justify-start">
            <Fit><StretchNav items={["Problem", "Research", "Design", "Outcome"]} onChange={setCh} /></Fit>
          </div>
          <div className="relative min-h-[300px]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={ch} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <Chapter i={ch} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ case 02: uploads */

function CaseLedgerly() {
  return (
    <section id="ledgerly" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Case 02 · Ledgerly" title="Receipts in, dread out." sub="Ledgerly does the books for freelancers. A third of receipt uploads were cancelled halfway, because one slow file froze the whole batch with no sign of life." accent={OD} />
          <Stagger className="flex flex-col gap-4">
            {[
              ["What I changed", "Every file became its own chip with its own progress. Drop more while the first ones are still going; remove one without cancelling the rest."],
              ["What I left out", "A 'processing' spinner. If the progress is real, a spinner only hides it."],
              ["What moved", "Cancelled uploads fell 74%, and receipts per user per month went from 6 to 15."],
            ].map(([a, b]) => (
              <div key={a} className="flex flex-col gap-1 border-t border-black/[.08] pt-4">
                <span className="text-[14px] font-semibold text-[#1d1d1f]">{a}</span>
                <span className="text-[15px] leading-[1.55] text-[#6e6e73]">{b}</span>
              </div>
            ))}
          </Stagger>
        </div>
        <Reveal y={20}>
          <div className={`${card} flex flex-col gap-6 p-7`}>
            <div className="flex items-center justify-between">
              <span className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#6e6e73]">Ledgerly · Expenses</span>
                <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">October receipts</span>
              </span>
              <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: OT, color: OD }}>The shipped component</span>
            </div>
            <div className="flex justify-center"><UploadChips accent={OD} autoplay /></div>
            <span className="text-[13px] text-[#6e6e73]">Drop real files here to try it. Nothing leaves your browser.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ case 03: design system */

function CaseTidepool() {
  return (
    <section id="tidepool" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Case 03 · Tidepool" title="Four apps, one system, five months." sub="Tidepool runs clinic bookings across four apps that had drifted apart: three button styles, 41 one-off settings screens. I built the system they share now, with the engineers who use it." accent={OD} />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal y={20}>
          <div className={`${card} flex h-full flex-col p-7`}>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Documented by layer.</h3>
            <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Every component ships with its anatomy: surface, spacing, layout, content. Engineers stopped asking where padding comes from.</p>
            <div className="mt-6 flex flex-1 items-center justify-center"><Fit><ComponentLayers accent={O} autoplay /></Fit></div>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <div className={`${card} flex h-full flex-col p-7`}>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Tokens you can feel.</h3>
            <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">The token playground from the docs. Drag a label sideways to change radius, rotation or scale, the same way you would in a design tool.</p>
            <div className="mt-6 flex flex-1 items-center justify-center"><Fit><ScrubInput accent={O} autoplay /></Fit></div>
          </div>
        </Reveal>
        <Reveal y={20} className="lg:col-span-2">
          <div className={`${card} grid grid-cols-1 items-center gap-8 p-7 md:grid-cols-[1fr_1.2fr]`}>
            <div className="flex flex-col gap-3">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">41 settings screens became one pattern.</h3>
              <p className="m-0 max-w-[400px] text-[15px] leading-[1.55] text-[#6e6e73]">Tabs that slide from the side you came from, rows with a hint under every label, switches that give a little when pressed. Try it.</p>
              <div className="mt-2 flex gap-6">
                {[["−63%", "settings code"], ["4 → 1", "apps on one kit"]].map(([a, b]) => (
                  <span key={b} className="flex flex-col"><span className="text-[26px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{a}</span><span className="text-[13px] text-[#6e6e73]">{b}</span></span>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><AnimatedTabs accent={O} autoplay /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ process timeline */

const STEPS = [
  { w: "Week 1", t: "Listen", d: "Support tickets, session recordings and five calls with real customers. I write down the number we're trying to move." },
  { w: "Week 2", t: "Prototype the riskiest screen", d: "A clickable prototype of the screen most likely to be wrong, tested with six people by Friday." },
  { w: "Weeks 3–6", t: "Ship with your engineers", d: "Designs land as components in your codebase. I review pull requests, not just mockups." },
  { w: "Week 7", t: "Measure, then write it up", d: "An A/B test where traffic allows, and a case study your team can reuse for the next flow." },
];

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <section id="process" className="bg-[#1d1d1f] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Process" title="Seven weeks, one number." sub="The same shape for every engagement, so you always know what Friday brings." accent="#fdba74" dark />
        <div ref={ref} className="relative mt-14">
          <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-[2px] rounded-full bg-white/10 lg:hidden">
            <motion.div className="h-full w-full origin-top rounded-full" style={{ scaleY: fill, background: O }} />
          </div>
          <div className="absolute left-0 top-[11px] hidden h-[2px] w-full rounded-full bg-white/10 lg:block">
            <motion.div className="h-full w-full origin-left rounded-full" style={{ scaleX: fill, background: O }} />
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <StepNode key={s.t} s={s} i={i} p={fill} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepNode({ s, i, p }: { s: (typeof STEPS)[number]; i: number; p: MotionValue<number> }) {
  const at = i / STEPS.length + 0.05;
  const bg = useTransform(p, [at - 0.05, at], ["#3a3a3c", O]);
  const scale = useTransform(p, [at - 0.05, at, at + 0.08], [1, 1.25, 1]);
  return (
    <div className="relative flex flex-col gap-3 pl-10 lg:pl-0 lg:pt-10">
      <motion.span className="absolute left-0 top-0 h-6 w-6 rounded-full border-4 border-[#1d1d1f]" style={{ background: bg, scale }} aria-hidden="true" />
      <span className="text-[13px] font-semibold text-[#fdba74]">{s.w}</span>
      <span className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#f5f5f7]">{s.t}</span>
      <span className="text-[15px] leading-[1.55] text-[#a1a1a6]">{s.d}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ words */

const WORDS = [
  { q: "Maya came with a number on day one and left with a better one. The case study is now how we onboard designers.", n: "Rhea Castellanos", r: "Head of product, Fernway" },
  { q: "She reviewed our pull requests like a senior engineer, which nobody asked her to do, and which saved us a month.", n: "Daniel Osei", r: "Staff engineer, Ledgerly" },
  { q: "Four teams agreed on one button. I didn't think I'd see it.", n: "Hana Mori", r: "Design lead, Tidepool" },
];

function Words3() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="From the teams" title="What they said after launch." accent={OD} center />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {WORDS.map((w) => (
          <figure key={w.n} className={`${card} m-0 flex h-full flex-col gap-6 p-7`}>
            <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.015em] text-[#1d1d1f]">&ldquo;{w.q}&rdquo;</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: OD }}>{w.n.split(" ").map((x) => x[0]).join("")}</span>
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">{w.n}</span>
                <span className="text-[13px] text-[#6e6e73]">{w.r}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ contact */

const ico = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const KINDS: MenuItem[] = [
  { id: "flow", label: "Redesign a flow", icon: ico("M4 12h11M11 6l6 6-6 6"), done: "Redesign a flow" },
  { id: "new", label: "New product, 0 to 1", icon: ico("M12 4v16M4 12h16"), done: "New product" },
  { id: "system", label: "Design system", icon: ico("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"), done: "Design system" },
  { id: "audit", label: "Audit and advice", icon: ico("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4"), done: "Audit and advice" },
];

function Contact() {
  const [kind, setKind] = useState<string | null>(null);
  const [when, setWhen] = useState("Next quarter");
  const [sent, setSent] = useState(false);
  const chosen = KINDS.find((k) => k.id === kind);
  return (
    <section id="contact" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <SectionHead eyebrow="Contact" title="Tell me which screen is costing you." sub="Two engagements a quarter. I reply within two working days with a yes, a no, or a better person to ask." accent={OD} />
        <Reveal y={20}>
          <div className={`${card} flex flex-col gap-6 p-7`}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="flex flex-col items-center gap-3 py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: OD }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} /></svg>
                  </span>
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Thanks. I&apos;ll reply by Thursday.</span>
                  <span className="text-[14px] text-[#6e6e73]">{chosen?.label ?? "A project"}, starting {when.toLowerCase()}. This form is a demo, so nothing was sent.</span>
                  <button type="button" onClick={() => setSent(false)} className="mt-2 h-10 rounded-full bg-black/5 px-5 text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2">Start over</button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">What kind of project?</span>
                      <div className="-mb-[200px]"><StaggerMenu label={chosen ? chosen.label : "Choose a type"} items={KINDS} onSelect={setKind} /></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">When would you start?</span>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Start date">
                        {["This month", "Next quarter", "Just exploring"].map((w) => (
                          <button key={w} type="button" role="radio" aria-checked={when === w} onClick={() => setWhen(w)} className="relative h-10 rounded-full px-4 text-[14px] font-medium outline-none focus-visible:ring-2" style={{ color: when === w ? "#fff" : INK, background: when === w ? "transparent" : "#f0f0f3" }}>
                            {when === w && <motion.span layoutId="lf-when" className="absolute inset-0 rounded-full" style={{ background: OD }} transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
                            <span className="relative">{w}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">The screen, in a sentence</span>
                    <textarea rows={3} placeholder="Half our trials never connect their calendar, and we think it's the permissions step." className="resize-none rounded-[16px] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: OD }} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">Work email</span>
                    <input type="email" placeholder="you@company.com" className="h-12 rounded-[16px] bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: OD }} />
                  </label>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} className="h-12 rounded-full text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ background: OD, ["--tw-ring-color" as string]: OD }}>
                    Send the brief
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export function LaunchfolioPortfolioPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={OD} cta="Book a call" onCta={() => scrollToId("contact")} links={[{ label: "Case studies", id: "work" }, { label: "Fernway", id: "fernway" }, { label: "Process", id: "process" }, { label: "Contact", id: "contact" }]} />
        <Hero />
        <Proof />
        <CaseIndex />
        <CaseFernway />
        <CaseLedgerly />
        <CaseTidepool />
        <Process />
        <Words3 />
        <Contact />
        <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Questions teams ask first." accent={OD} />
          <Reveal y={16}>
            <Faq
              accent={OD}
              items={[
                { q: "Can I see work that isn't on this page?", a: "Yes. On a call I'll walk through two more case studies under NDA, including one that didn't work and what I'd do differently." },
                { q: "Do you work inside our tools?", a: "Your design files, your repo, your tracker. I bring nothing you have to keep paying for after I leave." },
                { q: "How do you price?", a: "A fixed price per engagement, agreed after the first call. Most redesigns of a single flow land between $18k and $32k." },
                { q: "What if the number doesn't move?", a: "It has happened once. We found out in week two from the prototype, changed course, and the case study says so." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Bring me the screen people give up on." sub="Thirty minutes, no deck. You leave with one thing to try this week either way." cta="Book a call" secondary="Email Maya" accent={OD} glow="rgba(234,88,12,.3)" />
        </div>
        <Footer brand={<Logo />} note="Product design case studies by Maya Okafor. Launchfolio is a Motion Kit template; the people, companies and numbers are invented." columns={[{ title: "Cases", links: ["Fernway", "Ledgerly", "Tidepool"] }, { title: "Working together", links: ["Process", "Pricing", "Contact"] }, { title: "Elsewhere", links: ["CV", "Writing", "Talks"] }]} />
      </div>
    </MotionConfig>
  );
}

export default LaunchfolioPortfolioPage;
