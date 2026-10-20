"use client";
/**
 * Wayfare: landing page template for a travel planning / booking app.
 * Built from Motion Kit components: Dot Globe, Elastic Stepper, Curved Reel,
 * Flight Tracker, Tear-off Ticket, Stamp Swirl, Weather Puck, Todo List,
 * Layout Switch, Expanding Card and Lanyard Badge.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import DotGlobe from "@/components/templates/kit/components/DotGlobe";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import CurvedReel from "@/components/templates/kit/components/CurvedReel";
import FlightTracker from "@/components/templates/kit/components/FlightTracker";
import TearTicket from "@/components/templates/kit/components/TearTicket";
import StampSwirl from "@/components/templates/kit/components/StampSwirl";
import WeatherPuck from "@/components/templates/kit/components/WeatherPuck";
import TodoList from "@/components/templates/kit/components/TodoList";
import LayoutSwitch from "@/components/templates/kit/components/LayoutSwitch";
import ExpandableCard from "@/components/templates/kit/components/ExpandableCard";
import LanyardBadge from "@/components/templates/kit/components/LanyardBadge";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, StickyStory, Words, card, ease, scrollToId, useMedia } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const O = "#ff9f0a"; // graphics
const OD = "#c2410c"; // orange text and buttons (5:1 on white)

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="18" r="9" fill={O} />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: "16px", originY: "18px" }}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={16 + Math.cos(a) * 12} y1={18 + Math.sin(a) * 12} x2={16 + Math.cos(a) * 14.5} y2={18 + Math.sin(a) * 14.5} stroke={O} strokeWidth="2" strokeLinecap="round" />;
          })}
        </motion.g>
        <rect x="0" y="22" width="32" height="10" fill="#fbfaf7" />
        <line x1="4" y1="22" x2="28" y2="22" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Wayfare
    </span>
  );
}

const PLACES = ["Lisbon", "Kyoto", "Oaxaca", "Reykjavík", "Cape Town"];

function TypedPlace() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const word = PLACES[i];
    if (n < word.length) {
      const t = setTimeout(() => setN(n + 1), 90);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setI((i + 1) % PLACES.length); setN(0); }, 1800);
    return () => clearTimeout(t);
  }, [i, n]);
  return (
    <span className="text-[17px] font-medium text-[#1d1d1f]">
      {PLACES[i].slice(0, n)}
      <motion.span className="ml-[1px] inline-block h-[18px] w-[2px] translate-y-[3px] rounded-full" style={{ background: OD }} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
    </span>
  );
}

function SearchBar() {
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease, delay: 0.55 }} className={`${card} flex w-full max-w-[560px] flex-col gap-2 p-3 sm:flex-row sm:items-center`}>
      <label className="flex flex-1 flex-col gap-0.5 rounded-[20px] px-4 py-2.5 hover:bg-[#f5f5f7]">
        <span className="text-[12px] font-semibold text-[#86868b]">Where to</span>
        <TypedPlace />
      </label>
      <span className="hidden h-10 w-px bg-black/[.08] sm:block" />
      <div className="flex flex-col gap-0.5 rounded-[20px] px-4 py-2.5 hover:bg-[#f5f5f7]">
        <span className="text-[12px] font-semibold text-[#86868b]">When</span>
        <span className="text-[17px] font-medium text-[#1d1d1f]">12–19 Mar</span>
      </div>
      <Magnetic className="text-white sm:!h-14 sm:!w-14 sm:!px-0" style={{ background: OD }} ariaLabel="Search trips">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" /></svg>
        <span className="sm:hidden">Search trips</span>
      </Magnetic>
    </motion.div>
  );
}

function Hero() {
  const wide = useMedia("(min-width: 1024px)");
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(45% 55% at 78% 45%, rgba(255,159,10,.20), transparent 70%), radial-gradient(35% 35% at 10% 10%, rgba(255,214,10,.14), transparent 70%)" }} />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="flex flex-col items-start gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="text-[14px] font-semibold" style={{ color: OD }}>
            Flights, stays and plans, together
          </motion.span>
          <h1 className="m-0 text-[clamp(48px,7.4vw,90px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
            <Words text="The whole trip, in one calm place." accentWords={["calm"]} accent={OD} />
          </h1>
          <Reveal delay={0.4} y={14}>
            <p className="m-0 max-w-[520px] text-[clamp(18px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Wayfare books the flights, keeps the tickets, checks the weather and tells you when to leave for the airport. You just go.
            </p>
          </Reveal>
          <SearchBar />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap items-center gap-6">
            <ElasticStepper label="Travellers" min={1} max={9} defaultValue={2} accent={OD} autoplay />
          </motion.div>
        </div>
        <motion.div className="relative flex items-center justify-center" initial={{ opacity: 0, scale: 0.85, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.4, ease, delay: 0.2 }}>
          <Fit>
            <DotGlobe
              autoplay
              accent={O}
              size={wide ? 500 : 380}
              cities={[
                { id: "lis", name: "Lisbon", lat: 38.72, lon: -9.14 },
                { id: "kyo", name: "Kyoto", lat: 35.01, lon: 135.77 },
                { id: "oax", name: "Oaxaca", lat: 17.07, lon: -96.73 },
                { id: "rey", name: "Reykjavík", lat: 64.15, lon: -21.94 },
                { id: "cpt", name: "Cape Town", lat: -33.92, lon: 18.42 },
                { id: "nyc", name: "New York", lat: 40.71, lon: -74.01 },
              ]}
            />
          </Fit>
        </motion.div>
      </div>
    </section>
  );
}

const POSTERS = [
  { bg: "#ffcc00", fg: "#1d1d1f", big: "Lisbon", small: "7 nights · from $640" },
  { bg: "#ff6482", fg: "#fff", big: "Kyoto", small: "10 nights · from $1,180", serif: true },
  { bg: "#0b8f6a", fg: "#eafff5", big: "Oaxaca", small: "6 nights · from $720" },
  { bg: "#0a84ff", fg: "#fff", big: "Bergen", small: "5 nights · from $890", serif: true },
  { bg: "#ff9f0a", fg: "#1d1d1f", big: "Tangier", small: "4 nights · from $410" },
  { bg: "#1d1d1f", fg: "#f5f5f7", big: "Hanoi", small: "9 nights · from $760", serif: true },
  { bg: "#f2efe6", fg: "#1d1d1f", big: "Tbilisi", small: "6 nights · from $530" },
  { bg: "#5e5ce6", fg: "#fff", big: "Hobart", small: "8 nights · from $1,320" },
  { bg: "#c8f560", fg: "#1d1d1f", big: "Lima", small: "7 nights · from $810", serif: true },
  { bg: "#ff3b30", fg: "#fff", big: "Seville", small: "4 nights · from $380" },
];

function Explore() {
  return (
    <section id="explore" className="py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Explore" title="Somewhere new, every season." sub="Hand-built trips with flights, stays and a loose plan. Drag the reel to look around, or fling it." accent={OD} />
      </div>
      <Reveal className="mt-10 px-2"><CurvedReel posters={POSTERS} autoplay /></Reveal>
      <div className="mx-auto mt-12 max-w-[1180px] px-5">
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {[
            { to: 140, f: (n: number) => `${Math.round(n)}`, l: "countries covered" },
            { to: 1.2, f: (n: number) => `${n.toFixed(1)}M`, l: "trips planned" },
            { to: 24, f: (n: number) => `${Math.round(n)}/7`, l: "real human help" },
            { to: 4.8, f: (n: number) => `${n.toFixed(1)}`, l: "average trip rating" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col gap-1 border-t border-black/[.08] pt-5">
              <Counter to={s.to} format={s.f} className="text-[clamp(36px,4.6vw,50px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
              <span className="text-[15px] text-[#6e6e73]">{s.l}</span>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Plan() {
  return (
    <section id="plan" className="bg-[#f5f1ea] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Plan" title="Everything before you leave." sub="Pack, check the sky, and keep the photos from last time somewhere you'll actually look at them." accent={OD} center />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Weather, hour by hour.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Drag the sun across the day to see when the light is best.</p>
              <div className="mt-6 flex flex-1 items-center justify-center"><Fit><WeatherPuck autoplay /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">A packing list that learns.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Starts from the forecast and what you forgot last time. Shared with everyone on the trip.</p>
              <div className="mt-6 flex flex-1 items-center justify-center"><TodoList accent={OD} autoplay initial={["Passport and boarding pass", "Rain jacket (Thursday looks wet)", "Plug adapter, type F", "Book the Sintra day trip"]} /></div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-2">
            <div className={`${card} flex flex-col p-7`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Your trips, laid out how you like.</h3>
                  <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Grid, row, feature or pile. Photos glide between them.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center"><LayoutSwitch autoplay /></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Live() {
  return (
    <section id="live" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="On the way" title="It keeps working after you leave." accent={OD} />
      <div className="mt-6">
        <StickyStory
          accent={OD}
          steps={[
            { kicker: "Flights", title: "Every leg, tracked live.", body: "Gate changes, delays and landing times as they happen, with a nudge when it's time to head to the airport.", visual: <FlightTracker from="NYC" to="LIS" /> },
            { kicker: "Tickets", title: "Tickets for the things you came for.", body: "Museums, trains and tours live in your wallet. Tear the stub at the door, keep the ticket as a memory.", visual: <TearTicket autoplay title="Gulbenkian Museum" venue="Lisbon · Main collection" date="Thu 14 Mar · 10:30" seat="Adult · 2 people" /> },
            { kicker: "Memories", title: "A stamp for every country.", body: "Land somewhere new and a stamp appears in your passport page. Hover one to see where and when you got it.", visual: <div className={`${card} p-8`}><StampSwirl autoplay stamps={[
              { name: "Portugal", date: "2026", value: "PT", art: "radial-gradient(60% 50% at 30% 30%, #fff1c1, rgba(255,241,193,0) 60%), radial-gradient(60% 60% at 75% 75%, #ff9f0a, rgba(255,159,10,0) 65%), linear-gradient(160deg,#ffd27a,#c2410c)" },
              { name: "Japan", date: "2025", value: "JP", art: "radial-gradient(45% 45% at 50% 40%, #ffe3ea, rgba(255,227,234,0) 60%), radial-gradient(60% 60% at 20% 80%, #ff6482, rgba(255,100,130,0) 65%), linear-gradient(170deg,#ffb3c7,#8e2448)" },
              { name: "Iceland", date: "2024", value: "IS", art: "radial-gradient(55% 45% at 35% 35%, #e3f6ff, rgba(227,246,255,0) 60%), radial-gradient(60% 60% at 80% 80%, #0a84ff, rgba(10,132,255,0) 65%), linear-gradient(160deg,#9fd8ff,#173a6b)" },
              { name: "Mexico", date: "2023", value: "MX", art: "radial-gradient(55% 45% at 35% 35%, #e9f5c8, rgba(233,245,200,0) 60%), radial-gradient(60% 60% at 80% 80%, #0b8f6a, rgba(11,143,106,0) 65%), linear-gradient(160deg,#a7e0a0,#1d4d34)" },
            ]} /></div> },
          ]}
        />
      </div>
    </section>
  );
}

function Guides() {
  return (
    <section className="bg-[#f5f1ea] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <SectionHead eyebrow="Guides" title="Written by people who live there." sub="Short, opinionated guides from locals. Open one to read it; it grows out of its card and folds back when you're done." accent={OD} />
        <Reveal className="flex justify-center">
          <ExpandableCard
            autoplay
            cards={[
              { id: "lis", eyebrow: "Lisbon · 6 min read", title: "A slow Sunday in Alfama", art: "radial-gradient(120% 90% at 20% 10%,#ffe2a8 0%,rgba(255,226,168,0) 60%),radial-gradient(90% 80% at 90% 90%,#ffb36b 0%,rgba(255,179,107,0) 60%),#fff3df", body: ["Start at the top of the hill and let the streets take you down. The bakeries open before the churches do.", "By noon, find a terrace facing the river and stay longer than you planned. That's the whole plan."] },
              { id: "kyo", eyebrow: "Kyoto · 8 min read", title: "Temples before the crowds", art: "radial-gradient(120% 90% at 20% 10%,#ffd1e0 0%,rgba(255,209,224,0) 60%),radial-gradient(90% 80% at 90% 90%,#c7d7ff 0%,rgba(199,215,255,0) 60%),#f4ecff", body: ["The gates open at six. Be there at quarter to, with a warm drink from the shop by the station.", "Walk the path once in silence, then again with the guide's notes. It reads differently the second time."] },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

const TIERS = [
  { id: "free", n: "Explorer", p: "Free", f: ["Unlimited trip plans", "Live flight tracking", "Shared packing lists"] },
  { id: "club", n: "Wayfare Club", p: "$8 / month", f: ["Lounge access on long trips", "Fee-free changes", "Priority human help", "Member prices on stays"] },
];

function Members() {
  const [tier, setTier] = useState("club");
  return (
    <section id="members" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Membership" title="Travel like you've done it before." accent={OD} />
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Membership">
            {TIERS.map((t) => {
              const on = tier === t.id;
              return (
                <motion.button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setTier(t.id)} layout className="relative overflow-hidden rounded-[24px] bg-white p-6 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2">
                  {on && <motion.span layoutId="way-tier" className="absolute inset-0 rounded-[24px]" style={{ boxShadow: `inset 0 0 0 2px ${OD}` }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative flex items-center justify-between gap-4">
                    <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{t.n}</span>
                    <span className="text-[16px] font-medium text-[#6e6e73]">{t.p}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.ul key="f" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative m-0 flex list-none flex-col gap-2 overflow-hidden p-0">
                        {t.f.map((f, i) => (
                          <motion.li key={f} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05 }} className={`flex items-center gap-2.5 text-[15px] text-[#1d1d1f] ${i === 0 ? "mt-4" : ""}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={OD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                            {f}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
          <Magnetic className="w-fit text-white" style={{ background: OD }}>{tier === "club" ? "Join the Club" : "Start planning free"}</Magnetic>
        </div>
        <Reveal className="flex justify-center">
          <div className="flex w-full max-w-[460px] justify-center">
            <Fit><LanyardBadge autoplay name="Sam Alvarez" role="Member since 2024" event="Wayfare Club" tag={tier === "club" ? "Club" : "Explorer"} strap={OD} /></Fit>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function WayfarePage() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#fbfaf7] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
      <Nav brand={<Logo />} accent={OD} cta="Plan a trip" onCta={() => scrollToId("explore")} links={[{ label: "Explore", id: "explore" }, { label: "Plan", id: "plan" }, { label: "On the way", id: "live" }, { label: "Membership", id: "members" }]} />
      <Hero />
      <Explore />
      <Plan />
      <Live />
      <Guides />
      <Members />
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead eyebrow="FAQ" title="Before you book." accent={OD} />
        <Reveal>
          <Faq
            accent={OD}
            items={[
              { q: "Can I change or cancel a trip?", a: "Most trips can be changed up to 48 hours before departure. Club members change flights and stays without a fee." },
              { q: "Does it work offline?", a: "Tickets, boarding passes, guides and your packing list are saved to your phone, so they work with no signal." },
              { q: "Can I plan with friends?", a: "Invite anyone to a trip. Everyone sees the same plan, list and tickets, and you can split costs as you go." },
              { q: "Is human help really around the clock?", a: "Yes. Message from the app at any hour and a person replies, usually within a few minutes." },
            ]}
          />
        </Reveal>
      </section>
      <div className="mx-auto max-w-[1180px] px-5 pb-20">
        <CtaBand title="Where to next?" sub="Plan your first trip free. Book when it feels right." cta="Plan a trip" secondary="Browse guides" accent={OD} glow="rgba(255,159,10,.3)" />
      </div>
      <Footer brand={<Logo />} note="Flights, stays and plans in one calm place. Wayfare is a Motion Kit template." columns={[{ title: "Travel", links: ["Destinations", "Guides", "Flights", "Stays"] }, { title: "Club", links: ["Membership", "Lounges", "Gift cards"] }, { title: "Help", links: ["Support", "Changes", "Safety", "Contact"] }]} />
    </div>
    </MotionConfig>
  );
}

export default WayfarePage;
