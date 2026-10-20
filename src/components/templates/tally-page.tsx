"use client";
/**
 * Tally: landing page template for a personal finance / payments app.
 * Built from Motion Kit components: Tilt Card, Money Goo, Swipe Stack,
 * Receipt Unfold, Hold to Confirm, Streak Counter, Ruler Picker, OTP Input,
 * Password Strength and the Switch from Animated Tabs.
 */
import { useState } from "react";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useTransform } from "framer-motion";
import TiltCard from "@/components/templates/kit/components/TiltCard";
import MoneyGoo from "@/components/templates/kit/components/MoneyGoo";
import SwipeStack from "@/components/templates/kit/components/SwipeStack";
import ReceiptUnfold from "@/components/templates/kit/components/ReceiptUnfold";
import HoldToConfirm from "@/components/templates/kit/components/HoldToConfirm";
import StreakCounter from "@/components/templates/kit/components/StreakCounter";
import RulerPicker from "@/components/templates/kit/components/RulerPicker";
import OtpInput from "@/components/templates/kit/components/OtpInput";
import PasswordStrength from "@/components/templates/kit/components/PasswordStrength";
import { Switch } from "@/components/templates/kit/components/AnimatedTabs";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Phone, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId, useParallax } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const G = "#30d158"; // fills and graphics
const GD = "#1a7f42"; // green text on white (5:1)
const INK = "#1d1d1f";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <span className="relative flex h-6 w-9 items-center" aria-hidden="true">
        <motion.span className="absolute left-0 h-6 w-6 rounded-full" style={{ background: G }} animate={{ x: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span className="absolute left-3 h-6 w-6 rounded-full mix-blend-multiply" style={{ background: "#0a84ff" }} animate={{ x: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      </span>
      Tally
    </span>
  );
}

const TX = [
  { n: "Northbeam Coffee", c: "Coffee", a: -4.8, col: "#0a84ff" },
  { n: "Maya K.", c: "Dinner split", a: 32.5, col: "#30d158" },
  { n: "Metro card", c: "Transport", a: -20, col: "#ff9f0a" },
  { n: "Salary", c: "Acme Studio", a: 2840, col: "#bf5af2" },
  { n: "Grocer", c: "Food", a: -56.32, col: "#ff375f" },
];

function PhoneApp() {
  const bars = [38, 62, 44, 80, 56, 92, 48];
  return (
    <div className="flex h-full flex-col gap-5 px-5 pb-6 pt-14">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[#6e6e73]">Good morning, Sam</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[12px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,.06)]">SA</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-[#86868b]">Total balance</span>
        <Counter to={4218.6} from={3900} duration={2} format={(n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} className="text-[34px] font-semibold tracking-[-0.04em] text-[#1d1d1f]" />
        <span className="text-[12px] font-medium" style={{ color: GD }}>+ $318.60 this week</span>
      </div>
      <div className="flex h-[74px] items-end gap-2 rounded-2xl bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.04)]" aria-hidden="true">
        {bars.map((h, i) => (
          <motion.div key={i} className="flex-1 origin-bottom rounded-md" style={{ height: Math.round(h * 0.5), background: i === 5 ? G : "#d9d9de" }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.9 + i * 0.06 }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Send", "Request", "Top up"].map((t, i) => (
          <motion.button key={t} type="button" whileTap={{ scale: 0.92 }} className="flex h-11 items-center justify-center rounded-2xl text-[13px] font-semibold" style={{ background: i === 0 ? INK : "#fff", color: i === 0 ? "#fff" : INK, boxShadow: i === 0 ? undefined : "0 0 0 1px rgba(0,0,0,.06)" }}>{t}</motion.button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-[#86868b]">Today</span>
        {TX.map((t, i) => (
          <motion.div key={t.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.09, type: "spring", stiffness: 260, damping: 24 }} className="flex items-center gap-3 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: t.col }}>{t.n[0]}</span>
            <span className="flex flex-1 flex-col">
              <span className="text-[13px] font-medium text-[#1d1d1f]">{t.n}</span>
              <span className="text-[11px] text-[#86868b]">{t.c}</span>
            </span>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: t.a > 0 ? GD : INK }}>{t.a > 0 ? "+" : "−"}${Math.abs(t.a).toFixed(2)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const cardY = useSpring(useTransform(scrollY, [0, 600], [0, -120]), { stiffness: 100, damping: 20 });
  const phoneY = useSpring(useTransform(scrollY, [0, 600], [0, 40]), { stiffness: 100, damping: 20 });
  const cardR = useTransform(scrollY, [0, 600], [12, 4]);
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(50% 50% at 75% 40%, rgba(48,209,88,.18), transparent 70%), radial-gradient(40% 40% at 90% 80%, rgba(10,132,255,.12), transparent 70%)" }} />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="flex flex-col items-start gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
            <span className="flex gap-0.5" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <motion.svg key={i} width="12" height="12" viewBox="0 0 24 24" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 500, damping: 14 }}><path fill="#ff9f0a" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4L1.5 9.6 9 8.9z" /></motion.svg>)}</span>
            4.9 from 120,000 reviews
          </motion.span>
          <h1 className="m-0 text-[clamp(48px,7.6vw,92px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
            <Words text="Money that moves like you do." accentWords={["moves"]} accent={GD} />
          </h1>
          <Reveal delay={0.4} y={14}>
            <p className="m-0 max-w-[520px] text-[clamp(18px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Split a dinner with a flick, sort a week of spending in a minute, and save without thinking about it. Tally is the money app that feels like the rest of your phone.
            </p>
          </Reveal>
          <Reveal delay={0.55} y={14} className="flex flex-wrap gap-3">
            <Magnetic className="text-white" style={{ background: INK }} onClick={() => scrollToId("pricing")}>Get Tally free</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("send")}>See how it works</Magnetic>
          </Reveal>
          <Reveal delay={0.7} y={10}>
            <span className="text-[13px] text-[#86868b]">No monthly fee on the Free plan. Takes about three minutes to open.</span>
          </Reveal>
        </div>
        <div className="relative flex h-[680px] items-center justify-center">
          <motion.div className="relative z-10" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.2 }}>
            <motion.div style={{ y: phoneY }}><Phone><PhoneApp /></Phone></motion.div>
          </motion.div>
          <motion.div className="absolute -right-10 bottom-12 z-0 hidden sm:block" initial={{ opacity: 0, x: -60, rotate: 24 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 1.2, ease, delay: 0.5 }}>
            <motion.div style={{ y: cardY, rotate: cardR }} className="scale-[.78] drop-shadow-[0_40px_40px_rgba(0,0,0,.25)]">
              <TiltCard name="Sam Alvarez" title="Tally Black" number="•••• 4021" autoplay />
            </motion.div>
          </motion.div>
          <motion.div className="absolute left-0 top-24 z-20 hidden rounded-2xl bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-20px_rgba(0,0,0,.3)] sm:block" initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }} transition={{ opacity: { delay: 1.1 }, scale: { delay: 1.1, type: "spring", stiffness: 300, damping: 16 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.6 } }}>
            <span className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: G }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#1d1d1f]">Maya paid you</span>
                <span className="text-[12px] tabular-nums text-[#6e6e73]">$32.50 · Dinner</span>
              </span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Press() {
  return (
    <section className="border-y border-black/[.05] bg-white py-8" aria-label="Press">
      <Marquee speed={30}>
        {["The Ledger", "MONEYWEEK", "Daily Byte", "fintech/now", "The Saver", "PAYMENTS TODAY", "Hearth"].map((n, i) => (
          <span key={n} className={`mx-10 text-[22px] text-[#6e6e73] ${i % 2 ? "font-serif italic" : "font-semibold tracking-tight"}`}>{n}</span>
        ))}
      </Marquee>
    </section>
  );
}

function Send() {
  const { ref, y } = useParallax(40);
  return (
    <section id="send" className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-5 py-28 lg:grid-cols-2">
      <motion.div ref={ref} style={{ y }} className="order-2 lg:order-1">
        <Reveal>
          <div className={`${card} flex justify-center overflow-hidden px-4 py-10`}>
            <Fit><MoneyGoo autoplay accent={G} amount={32} from={{ name: "You", initials: "SA", balance: 4218 }} to={{ name: "Maya", initials: "MK", balance: 112 }} /></Fit>
          </div>
        </Reveal>
      </motion.div>
      <div className="order-1 flex flex-col gap-8 lg:order-2">
        <SectionHead eyebrow="Send" title="Pay a friend with a flick." sub="Drag the amount out of your avatar and drop it on theirs. It lands instantly, even if they bank somewhere else." accent={GD} />
        <Stagger className="grid grid-cols-3 gap-4">
          {[["0s", "to arrive"], ["$0", "in fees"], ["40+", "currencies"]].map(([a, b]) => (
            <div key={b} className="flex flex-col gap-1 border-t border-black/[.08] pt-4">
              <span className="text-[30px] font-semibold tracking-[-0.04em] text-[#1d1d1f]">{a}</span>
              <span className="text-[14px] text-[#6e6e73]">{b}</span>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Spend() {
  return (
    <section id="spend" className="bg-[#f5f5f7] py-28">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Spend" title="A week of spending, sorted in a minute." sub="Tally lines up anything unusual as a deck. Swipe right to approve, left to flag. Every receipt is one tap away." accent={GD} center />
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className={`${card} flex h-full flex-col p-8`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Review, don’t reconcile.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Drag a card either way. The next one rises to meet you.</p>
              <div className="flex flex-1 items-center justify-center py-10"><Fit><SwipeStack autoplay /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className={`${card} flex h-full flex-col p-8`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Receipts that unfold.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Every payment keeps its itemised receipt, ready for taxes or splitting.</p>
              <div className="flex min-h-[380px] flex-1 items-center justify-center py-6">
                <Fit>
                  <ReceiptUnfold autoplay total="$58.24" lines={[{ label: "Groceries · Grocer", amount: "$41.20" }, { label: "Household", amount: "$9.80" }, { label: "Bag", amount: "$0.20" }, { label: "Tax", amount: "$7.04" }]} />
                </Fit>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BigTransfer() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[36px] bg-white px-6 py-20 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(50% 60% at 50% 100%, rgba(48,209,88,.16), transparent 70%)" }} />
          <div className="relative flex flex-col items-center gap-8">
            <SectionHead eyebrow="Peace of mind" title="Big transfers need a real yes." sub="Anything over your limit asks you to hold, not tap. No more sending rent to the wrong person by accident." accent={GD} center />
            <HoldToConfirm autoplay label="Hold to send $2,400" holdingLabel="Keep holding…" doneLabel="Sent to Jordan" color={GD} holdMs={1600} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function GoalRing({ pct = 68 }: { pct?: number }) {
  return (
    <div className={`${card} flex w-[320px] flex-col items-center gap-4 p-7`}>
      <div className="relative h-[150px] w-[150px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f3" strokeWidth="12" />
          <motion.circle cx="60" cy="60" r="50" fill="none" stroke="url(#tally-ring)" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: pct / 100 }} viewport={{ once: true }} transition={{ duration: 1.8, ease }} />
          <defs><linearGradient id="tally-ring" x1="0" x2="1"><stop offset="0" stopColor="#30d158" /><stop offset="1" stopColor="#0a84ff" /></linearGradient></defs>
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <Counter to={pct} format={(n) => `${Math.round(n)}%`} className="text-[34px] font-semibold tracking-[-0.04em] text-[#1d1d1f]" />
          <span className="text-[12px] text-[#86868b]">of $3,000</span>
        </span>
      </div>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Japan, next spring</span>
      <span className="text-[13px] text-[#6e6e73]">On track for March at your current pace.</span>
    </div>
  );
}

function Save() {
  return (
    <section id="save" className="mx-auto max-w-[1180px] px-5 pb-28">
      <SectionHead eyebrow="Save" title="Saving that runs in the background." sub="Pick a weekly amount, give it a goal, and let streaks keep you honest." accent={GD} />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className={`${card} flex h-full flex-col items-center gap-6 p-7`}>
          <span className="self-start text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Weekly auto-save</span>
          <RulerPicker min={0} max={200} defaultValue={25} prefix="$" unit="/ week" presets={[10, 25, 50, 100]} accent={G} autoplay />
        </div>
        <div className="flex justify-center"><GoalRing /></div>
        <div className="flex justify-center"><StreakCounter start={11} autoplay /></div>
      </Stagger>
    </section>
  );
}

function Security() {
  const [frozen, setFrozen] = useState(false);
  const [intl, setIntl] = useState(true);
  const [alerts, setAlerts] = useState(true);
  return (
    <section id="security" className="bg-[#000] py-28 text-white">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Security" title="Locked down, never locked out." sub="Every sign-in is checked, every card can be frozen in a tap, and your password gets graded before you use it." accent="#30d158" dark />
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-6 rounded-[28px] bg-[#f5f5f7] p-8 text-[#1d1d1f]">
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Two-step sign in.</h3>
                <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">A one-time code on every new device. Paste it or type it.</p>
              </div>
              <div className="flex flex-1 items-center justify-center py-6"><Fit><OtpInput autoplay="482913" accent={GD} /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-5 rounded-[28px] bg-[#1c1c1e] p-8">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Card controls.</h3>
              {[
                { l: "Freeze card", d: frozen ? "Card is frozen" : "Card is active", v: frozen, s: setFrozen },
                { l: "Online payments abroad", d: intl ? "Allowed" : "Blocked", v: intl, s: setIntl },
                { l: "Instant alerts", d: alerts ? "On for every payment" : "Off", v: alerts, s: setAlerts },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="flex flex-col">
                    <span className="text-[16px] font-medium">{r.l}</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={r.d} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[13px] text-[#6e6e73]">{r.d}</motion.span>
                    </AnimatePresence>
                  </span>
                  <Switch checked={r.v} onChange={r.s} label={r.l} accent={G} />
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="lg:col-span-3">
            <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] bg-[#f5f5f7] p-8 text-[#1d1d1f] md:grid-cols-[1fr_1.2fr]">
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Passwords, graded live.</h3>
                <p className="m-0 mt-1.5 max-w-[360px] text-[15px] text-[#6e6e73]">We show you what makes it strong as you type, and refuse anything found in a known breach.</p>
              </div>
              <PasswordStrength accent={G} autoplay />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  { id: "free", n: "Free", m: 0, y: 0, d: "Everything you need day to day.", f: ["Free transfers to friends", "Virtual card", "Spending insights"] },
  { id: "plus", n: "Plus", m: 4.99, y: 3.99, d: "For people who travel and save.", f: ["Everything in Free", "Fee-free cash abroad", "Unlimited savings goals", "Metal card"], hot: true },
  { id: "family", n: "Family", m: 9.99, y: 7.99, d: "Up to five people, one bill.", f: ["Everything in Plus", "Kids' cards with limits", "Shared goals"] },
];

function Price({ v }: { v: number }) {
  const s = v === 0 ? "0" : v.toFixed(2);
  return (
    <span className="inline-flex items-baseline overflow-hidden text-[48px] font-semibold tracking-[-0.045em] text-[#1d1d1f]">
      $
      <AnimatePresence mode="popLayout" initial={false}>
        {s.split("").map((ch, i) => (
          <motion.span key={`${i}-${ch}`} className="inline-block tabular-nums" initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.03 }}>
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-28">
      <SectionHead eyebrow="Plans" title="Start free. Upgrade when it pays for itself." accent={GD} center />
      <Reveal className="mt-8 flex justify-center">
        <div className="relative flex rounded-full bg-[#f0f0f3] p-1" role="radiogroup" aria-label="Billing period">
          {[["Monthly", false], ["Yearly · save 20%", true]].map(([l, v]) => (
            <button key={String(l)} type="button" role="radio" aria-checked={yearly === v} onClick={() => setYearly(v as boolean)} className="relative h-10 rounded-full px-5 text-[14px] font-medium outline-none focus-visible:ring-2" style={{ color: yearly === v ? "#1d1d1f" : "#6e6e73" }}>
              {yearly === v && <motion.span layoutId="tally-period" className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.12)]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
              <span className="relative">{l as string}</span>
            </button>
          ))}
        </div>
      </Reveal>
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className="relative h-full rounded-[30px] p-[1.5px]" style={{ background: p.hot ? "linear-gradient(140deg,#30d158,#0a84ff)" : "rgba(0,0,0,.06)" }}>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex h-full flex-col gap-5 rounded-[28.5px] bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.n}</span>
                {p.hot && <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: INK }}>Most popular</span>}
              </div>
              <span className="text-[15px] text-[#6e6e73]">{p.d}</span>
              <span className="flex items-baseline gap-1"><Price v={yearly ? p.y : p.m} /><span className="text-[15px] text-[#86868b]">/ month</span></span>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {p.f.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-[#1d1d1f]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Magnetic className="w-full" style={{ background: p.hot ? INK : "#f0f0f3", color: p.hot ? "#fff" : INK }}>{p.m === 0 ? "Get started" : `Try ${p.n} free`}</Magnetic>
              </div>
            </motion.div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

export function TallyPage() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
      <Nav brand={<Logo />} accent={INK} cta="Get the app" onCta={() => scrollToId("pricing")} links={[{ label: "Send", id: "send" }, { label: "Spend", id: "spend" }, { label: "Save", id: "save" }, { label: "Security", id: "security" }, { label: "Plans", id: "pricing" }]} />
      <Hero />
      <Press />
      <Send />
      <Spend />
      <BigTransfer />
      <Save />
      <Security />
      <Pricing />
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead eyebrow="FAQ" title="Good questions." accent={GD} />
        <Reveal>
          <Faq
            accent={INK}
            items={[
              { q: "Is my money protected?", a: "Balances are held with partner banks and covered by deposit insurance up to the legal limit in your country. Your plan page shows exactly which bank holds yours." },
              { q: "How fast do transfers arrive?", a: "Between Tally accounts, instantly. To other banks, usually within seconds, and always the same day on working days." },
              { q: "Can I cancel Plus any time?", a: "Yes. Cancel from settings and you keep Plus until the end of the period you paid for." },
              { q: "Do you sell my data?", a: "No. We make money from plans and card fees, never from selling information about you." },
            ]}
          />
        </Reveal>
      </section>
      <div className="mx-auto max-w-[1180px] px-5 pb-20">
        <CtaBand title="Open an account before your coffee cools." sub="Three minutes, one photo of your ID, and you're in." cta="Get Tally free" secondary="Compare plans" accent={GD} glow="rgba(48,209,88,.3)" />
      </div>
      <Footer brand={<Logo />} note="A money app that feels like the rest of your phone. Tally is a template; it isn't a real bank." columns={[{ title: "Product", links: ["Send", "Cards", "Savings", "Plans"] }, { title: "Help", links: ["Support", "Security", "Status", "Fees"] }, { title: "Company", links: ["About", "Careers", "Press", "Legal"] }]} />
    </div>
    </MotionConfig>
  );
}

export default TallyPage;
