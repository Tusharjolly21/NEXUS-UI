"use client";
/**
 * Side B: landing page template for a music streaming app.
 * Built from Motion Kit components: Bending Rail, Mood Wheel, Voice Orb,
 * Tape Shelf, Throw Wheel, Lit Keyboard, Standing Calendar and Sticker Toss.
 */
import { useState } from "react";
import { MotionConfig, motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import BendRail from "@/components/templates/kit/components/BendRail";
import MoodWheel from "@/components/templates/kit/components/MoodWheel";
import VoiceOrb from "@/components/templates/kit/components/VoiceOrb";
import TapeShelf from "@/components/templates/kit/components/TapeShelf";
import ThrowWheel from "@/components/templates/kit/components/ThrowWheel";
import LitKeyboard from "@/components/templates/kit/components/LitKeyboard";
import StandingCalendar from "@/components/templates/kit/components/StandingCalendar";
import StickerToss from "@/components/templates/kit/components/StickerToss";
import { Counter, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const P = "#bf5af2"; // graphics
const PD = "#7a2fd6"; // purple text and buttons (6:1 on white)

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <motion.svg width="26" height="26" viewBox="0 0 32 32" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#1d1d1f" />
        <circle cx="16" cy="16" r="10" fill="none" stroke="#3a3a3c" strokeWidth="1" />
        <circle cx="16" cy="16" r="6" fill={P} />
        <path d="M16 10a6 6 0 0 1 6 6h-6z" fill="#ff9fd0" />
        <circle cx="16" cy="16" r="1.4" fill="#fff" />
      </motion.svg>
      Side B
    </span>
  );
}

function Vinyl({ playing }: { playing: boolean }) {
  return (
    <div className="relative h-[220px] w-[220px] flex-none">
      <motion.div className="absolute inset-0 rounded-full" animate={{ rotate: playing ? 360 : 0 }} transition={playing ? { duration: 3.2, repeat: Infinity, ease: "linear" } : { type: "spring", stiffness: 40, damping: 12 }} style={{ background: "repeating-radial-gradient(circle at 50% 50%, #1d1d1f 0 2px, #2a2a2c 2px 4px)", boxShadow: "0 30px 50px -25px rgba(0,0,0,.6)" }}>
        <span className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 30deg, transparent 0 20%, rgba(255,255,255,.14) 25%, transparent 32% 70%, rgba(255,255,255,.1) 75%, transparent 80%)" }} />
        <span className="absolute left-1/2 top-1/2 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "conic-gradient(from 0deg,#bf5af2,#ff9fd0,#ffd36e,#bf5af2)" }} />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fbfbfd]" />
      </motion.div>
    </div>
  );
}

function Bars({ playing, n = 5, color = P }: { playing: boolean; n?: number; color?: string }) {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <motion.span key={i} className="w-[3px] rounded-full" style={{ background: color }} animate={{ height: playing ? ["30%", "100%", "50%", "80%", "30%"] : "30%" }} transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </span>
  );
}

function Player() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className={`${card} flex w-[424px] flex-col items-center gap-6 p-7`}>
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#86868b]"><Bars playing={playing} n={3} />Now playing</span>
        <span className="text-[12px] tabular-nums text-[#86868b]">Side B · 2 of 9</span>
      </div>
      <Vinyl playing={playing} />
      <div className="flex w-full items-end justify-between gap-4">
        <span className="flex flex-col">
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">Paper Moons</span>
          <span className="text-[15px] text-[#6e6e73]">Hollow Bay</span>
        </span>
        <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} className="flex h-14 w-14 flex-none items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ background: PD }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <motion.path fill="currentColor" initial={false} animate={{ d: playing ? "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" : "M8 5l11 7-11 7z" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          </svg>
        </motion.button>
      </div>
      <div className="flex w-full justify-center border-t border-black/[.06] pt-5"><BendRail label="Volume" defaultValue={62} accent={PD} autoplay /></div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(40% 50% at 80% 40%, rgba(191,90,242,.18), transparent 70%), radial-gradient(35% 40% at 60% 80%, rgba(255,159,208,.18), transparent 70%)" }} />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div className="flex flex-col items-start gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="text-[14px] font-semibold" style={{ color: PD }}>
            100 million songs. One that fits right now.
          </motion.span>
          <h1 className="m-0 text-[clamp(52px,8.4vw,104px)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#1d1d1f] [text-wrap:balance]">
            <Words text="Music for whatever today is." accentWords={["today"]} accent={PD} />
          </h1>
          <Reveal delay={0.4} y={14}>
            <p className="m-0 max-w-[500px] text-[clamp(18px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Side B listens to the mood you’re in, not just the songs you’ve played. Spin a feeling, hum a tune, or make someone a mixtape.
            </p>
          </Reveal>
          <Reveal delay={0.55} y={14} className="flex flex-wrap gap-3">
            <Magnetic className="text-white" style={{ background: PD }} onClick={() => scrollToId("plans")}>Try 3 months free</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("moods")}>How it picks</Magnetic>
          </Reveal>
        </div>
        <motion.div className="flex justify-center" initial={{ opacity: 0, y: 50, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1.2, ease, delay: 0.25 }}>
          <Fit><Player /></Fit>
        </motion.div>
      </div>
    </section>
  );
}

/** Two rows of oversized words that run in opposite directions and skew with scroll speed. */
function GenreBand() {
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const skew = useSpring(useTransform(vel, [-2000, 0, 2000], [8, 0, -8]), { stiffness: 200, damping: 30 });
  const x1 = useTransform(scrollY, (v) => -(v * 0.4) % 1400);
  const x2 = useTransform(scrollY, (v) => ((v * 0.4) % 1400) - 1400);
  const words = ["Soul", "Ambient", "Jazz", "House", "Folk", "Hip-hop", "Classical", "Disco", "Lo-fi", "Afrobeats"];
  const row = (outline: boolean) => (
    <span className="flex flex-none items-center">
      {[...words, ...words].map((w, i) => (
        <span key={i} className="mx-5 text-[clamp(56px,9vw,120px)] font-semibold leading-none tracking-[-0.05em]" style={outline ? { WebkitTextStroke: "1.5px #1d1d1f", color: "transparent" } : { color: i % 3 === 0 ? PD : "#1d1d1f" }}>
          {w}
        </span>
      ))}
    </span>
  );
  return (
    <section className="flex flex-col gap-4 overflow-hidden py-14" aria-hidden="true">
      <motion.div className="flex w-max" style={{ x: x1, skewX: skew }}>{row(false)}</motion.div>
      <motion.div className="flex w-max" style={{ x: x2, skewX: skew }}>{row(true)}</motion.div>
    </section>
  );
}

function Moods() {
  return (
    <section id="moods" className="bg-[#f6f2fb] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Moods" title="Start from a feeling, not a genre." sub="Turn the wheel to how you feel and Side B builds the queue around it. Or hold the orb and just say what you want." accent={PD} />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Spin how you feel.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Drag or scroll the wheel. The colour of the orb becomes the colour of your queue.</p>
              <div className="mt-6 flex flex-1 items-center justify-center"><Fit><MoodWheel autoplay /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Or just say it.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">“Something for a rainy train ride.” Hold to talk. Hum it if you can’t remember the name.</p>
              <div className="mt-4 flex min-h-[320px] flex-1 items-center justify-center"><Fit><VoiceOrb accent={PD} autoplay /></Fit></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Mixtapes() {
  return (
    <section id="mixtapes" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <SectionHead eyebrow="Mixtapes" title="Make someone a mixtape." sub="Pick up to twelve songs, write on the label, and send the case. They open it on their shelf and the reels start turning." accent={PD} />
          <Stagger className="flex flex-col gap-3">
            {["Hand-written labels and colours", "Plays in the order you chose, no shuffle", "Shows when they've listened to it"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="h-2 w-2 rounded-full" style={{ background: P }} />
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal>
          <div className={`${card} flex justify-center px-4 py-12`}>
            <Fit>
              <TapeShelf
                autoplay
                tapes={[
                  { title: "For the drive", artist: "from Jules", color: "#ff6b4a", ink: "#fff" },
                  { title: "Paper Moons", artist: "Hollow Bay", color: "#ffd60a", ink: "#1d1d1f" },
                  { title: "Sunday reset", artist: "from Ana", color: "#30d158", ink: "#0b2814" },
                  { title: "Night shift", artist: "Tarn", color: "#0a84ff", ink: "#fff" },
                  { title: "Birthday, 30", artist: "from Sam", color: "#bf5af2", ink: "#fff" },
                  { title: "Salt & Iron", artist: "Wren Atlas", color: "#e5e5ea", ink: "#1d1d1f" },
                ]}
              />
            </Fit>
          </div>
        </Reveal>
      </div>
      <div className="mt-24 flex flex-col gap-8">
        <SectionHead eyebrow="New this week" title="Fresh records, thrown your way." accent={PD} center />
        <Reveal>
          <ThrowWheel
            autoplay
            cards={[
              { title: "Low Orbit", sub: "Kesh · Album", art: "linear-gradient(160deg,#c49bff,#7a2fd6 60%,#1d1d1f)" },
              { title: "Glass Garden", sub: "Mira Vale · EP", art: "linear-gradient(160deg,#b7f7c5,#30d158 55%,#0b8f6a)" },
              { title: "Heatwave", sub: "Sola · Single", art: "linear-gradient(160deg,#ffe58a,#ff9f0a 50%,#d1495b)" },
              { title: "Still Water", sub: "Fen · Album", art: "linear-gradient(160deg,#c6f1ff,#64d2ff 50%,#0a84ff)" },
              { title: "Pink Noise", sub: "Odette · Album", art: "linear-gradient(160deg,#ffd6e7,#ff9fd0 60%,#bf5af2)" },
              { title: "North", sub: "Bergs · Live", art: "linear-gradient(160deg,#f2f2f7,#c7d7ff 55%,#7d8cff)" },
              { title: "Tarmac", sub: "Juno · Single", art: "linear-gradient(160deg,#e5e5ea,#8e8e93 55%,#1d1d1f)" },
              { title: "Marigold", sub: "Ines · EP", art: "linear-gradient(160deg,#ffe2b8,#ffb36b 50%,#ff6482)" },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section id="studio" className="bg-[#000] py-24 text-white">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="For artists" title="Side B Studio." sub="Sketch a loop on your keyboard, see who's listening and when, and get paid on the day a song plays." accent="#d9a3ff" dark />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-[28px] bg-[#1c1c1e] p-7">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Sketch a loop.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#a1a1a6]">Type to play. Record a run and Studio replays it with your timing.</p>
              <div className="mt-6 flex flex-1 items-center justify-center rounded-[22px] bg-[#f5f5f7] py-8"><Fit><LitKeyboard glow={P} autoplay /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-[28px] bg-[#1c1c1e] p-7">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Payouts, the same day.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#a1a1a6]">No quarterly statements. Every play pays out at the end of the day it happened.</p>
              <div className="mt-8 grid flex-1 grid-cols-2 gap-6 content-center">
                {[
                  { to: 0.0071, f: (n: number) => `$${n.toFixed(4)}`, l: "per stream, paid daily" },
                  { to: 48, f: (n: number) => `${Math.round(n)}h`, l: "from upload to live" },
                  { to: 92, f: (n: number) => `${Math.round(n)}%`, l: "of revenue to artists" },
                  { to: 180, f: (n: number) => `${Math.round(n)}`, l: "countries reached" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col gap-1 border-t border-white/10 pt-4">
                    <Counter to={s.to} format={s.f} className="text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.04em] text-white" />
                    <span className="text-[14px] text-[#a1a1a6]">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-2">
            <div className="flex flex-col rounded-[28px] bg-[#f5f5f7] p-7 text-[#1d1d1f]">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">Your year of listeners, standing up.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Every day is a column as tall as the people who played you. Drag to turn it.</p>
              <div className="mt-6 flex justify-center"><Fit><StandingCalendar autoplay noun="thousand listeners" /></Fit></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  { n: "Free", p: "$0", d: "With ads, on shuffle.", f: ["Mood wheel", "Mixtapes up to 6 songs", "Standard audio"] },
  { n: "Premium", p: "$10.99", d: "Everything, on demand.", f: ["No ads, any order", "Lossless audio", "Offline downloads", "Voice search"], hot: true },
  { n: "Duo", p: "$14.99", d: "Two accounts, one home.", f: ["Two Premium accounts", "A shared mix for both", "One bill"] },
];

function Plans() {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <section id="plans" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Plans" title="Three months of Premium, on us." sub="Cancel any time before it ends and you won't pay a thing." accent={PD} center />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <motion.div
            key={p.n}
            onPointerEnter={() => setHover(p.n)}
            onPointerLeave={() => setHover(null)}
            whileHover={{ y: -8, rotate: p.hot ? 0 : p.n === "Free" ? -1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[30px] p-7"
            style={{ background: p.hot ? "#1d1d1f" : "#fff", color: p.hot ? "#fff" : "#1d1d1f", boxShadow: p.hot ? "0 40px 80px -40px rgba(122,47,214,.6)" : "0 0 0 1px rgba(0,0,0,.06)" }}
          >
            {p.hot && <motion.span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl" style={{ background: P }} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />}
            <div className="relative flex items-center justify-between">
              <span className="text-[20px] font-semibold tracking-[-0.02em]">{p.n}</span>
              <Bars playing={hover === p.n || !!p.hot} color={p.hot ? "#d9a3ff" : PD} />
            </div>
            <span className="relative text-[15px]" style={{ color: p.hot ? "#a1a1a6" : "#6e6e73" }}>{p.d}</span>
            <span className="relative flex items-baseline gap-1"><span className="text-[44px] font-semibold tracking-[-0.045em]">{p.p}</span><span className="text-[15px]" style={{ color: p.hot ? "#a1a1a6" : "#86868b" }}>/ month</span></span>
            <ul className="relative m-0 flex list-none flex-col gap-3 p-0">
              {p.f.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.hot ? "#d9a3ff" : PD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="relative mt-auto pt-2">
              <Magnetic className="w-full" style={{ background: p.hot ? "#fff" : "#f0f0f3", color: p.hot ? "#1d1d1f" : "#1d1d1f" }}>{p.n === "Free" ? "Listen free" : `Get ${p.n}`}</Magnetic>
            </div>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

export function SideBPage() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
      <Nav brand={<Logo />} accent={PD} cta="Try free" onCta={() => scrollToId("plans")} links={[{ label: "Moods", id: "moods" }, { label: "Mixtapes", id: "mixtapes" }, { label: "Studio", id: "studio" }, { label: "Plans", id: "plans" }]} />
      <Hero />
      <GenreBand />
      <Moods />
      <Mixtapes />
      <Studio />
      <Plans />
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead eyebrow="FAQ" title="Before you press play." accent={PD} />
        <Reveal>
          <Faq
            accent={PD}
            items={[
              { q: "How does the mood wheel pick songs?", a: "It blends the feeling you pick with what you've liked before and what people with similar taste play in that mood. Skip a song and it learns." },
              { q: "Can I bring my playlists from another app?", a: "Yes. Import from settings and your playlists, likes and follows come across in a couple of minutes." },
              { q: "What does lossless mean here?", a: "Songs stream at CD quality or better, with nothing thrown away to save space. You'll hear it most on good headphones." },
              { q: "Do artists really get paid daily?", a: "Yes. Plays are counted at the end of each day and paid into the artist's Studio balance that night." },
            ]}
          />
        </Reveal>
      </section>
      <section className="mx-auto max-w-[1180px] px-5 pb-20">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[36px] bg-[#1d1d1f] p-8 sm:p-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col items-start gap-6">
            <h2 className="m-0 text-[clamp(36px,5.6vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#f5f5f7] [text-wrap:balance]"><Words text="Flip it over. Play the B side." /></h2>
            <Reveal delay={0.2}><p className="m-0 max-w-[440px] text-[19px] leading-[1.45] text-[#a1a1a6]">Three months of Premium free. Peel the sticker off on your way out.</p></Reveal>
            <Reveal delay={0.3}><Magnetic className="bg-white text-[#1d1d1f]" onClick={() => scrollToId("plans")}>Start listening</Magnetic></Reveal>
          </div>
          <Reveal className="flex justify-center"><Fit><StickerToss autoplay text="SIDE B · PLAY IT LOUD · " color="#1d1d1f" accent="#d9a3ff" /></Fit></Reveal>
        </div>
      </section>
      <Footer brand={<Logo />} note="Music for whatever today is. Side B is a Motion Kit template, not a real service." columns={[{ title: "Listen", links: ["Moods", "Mixtapes", "Lossless", "Plans"] }, { title: "Artists", links: ["Studio", "Payouts", "Upload"] }, { title: "Company", links: ["About", "Jobs", "Press", "Support"] }]} />
    </div>
    </MotionConfig>
  );
}

export default SideBPage;
