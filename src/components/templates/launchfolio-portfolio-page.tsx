"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useAnimation,
  type Variants,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ── theme ─────────────────────────────────────────────────────────────────────
type TC = {
  bg: string; fg: string; card: string; border: string;
  muted: string; sec: string; gridLine: string; isDark: boolean; toggle: () => void;
};
const LIGHT = { bg: "#f5f5f5", fg: "#1a1a1a", card: "#ffffff", border: "#e5e7eb", muted: "#9ca3af", sec: "#6b7280", gridLine: "rgba(0,0,0,0.055)" };
const DARK  = { bg: "#0d0d0d", fg: "#efefef", card: "#181818", border: "rgba(255,255,255,0.1)", muted: "#555", sec: "#888", gridLine: "rgba(255,255,255,0.04)" };
const ThemeCtx = React.createContext<TC>({ ...LIGHT, isDark: false, toggle: () => {} });
const useTheme = () => React.useContext(ThemeCtx);

// ── palette ───────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ROTATE_WORDS = ["build", "design", "craft", "create", "shape", "launch"];

// ── blur-reveal: wraps any heading and animates it in with blur on scroll ─────
function BlurReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(18px)", y: 20 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ── data ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Work", "Services", "Pricing", "Blog"];
const LOGOS = ["CoreOS", "Luminary", "45 Degrees°", "Codecraft", "Vertex", "Axiom", "Elevate", "Strata"];
const AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&q=80",
];

const PROJECTS = [
  { id: 0, name: "Kora",  category: "Consulting Site", bg: "#c8dfd5", accent: "#1a4a35", tagline: "Your growth partner for companies ready to scale.", badge: "47%" },
  { id: 1, name: "KYMA",  category: "AI Agency",       bg: "#0f0f0f", accent: "#c8f135", tagline: "Scale your operations 10× without hiring 100 people.", badge: null },
  { id: 2, name: "Mugen", category: "Design Studio",   bg: "#111",    accent: "#ffffff", tagline: "We've reimagined how great design happens.", badge: null },
  { id: 3, name: "Axiom", category: "Ecommerce Site",  bg: "#1c1c1c", accent: "#e8e8e8", tagline: "Built for real performance.", badge: null },
];

const SERVICES = [
  { name: "Framer Development",   icon: <path d="M6 2h9l3 3v3H6V2zm0 6h12l-6 7-6-7zm3 7h6v7H9v-7z" fill="white" /> },
  { name: "Brand Design",         icon: <path d="M12 2l3.5 7h7l-5.5 4 2 7L12 16l-7 4 2-7L2 9h7z" fill="white" /> },
  { name: "Web Apps",             icon: <><rect x="2" y="4" width="20" height="15" rx="2" stroke="white" strokeWidth="1.8" fill="none"/><path d="M2 8h20" stroke="white" strokeWidth="1.8"/><circle cx="5.5" cy="6" r="1" fill="white"/><circle cx="8.5" cy="6" r="1" fill="white"/></> },
  { name: "Landing Pages",        icon: <><rect x="4" y="2" width="16" height="20" rx="2" stroke="white" strokeWidth="1.8" fill="none"/><path d="M8 8h8M8 12h8M8 16h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></> },
  { name: "Motion Graphics",      icon: <><path d="M3 21l7-7m0 0l4-8 3 3-8 4zm7-7l3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/><path d="M17 3l1 1-1 1" stroke="white" strokeWidth="1.5" fill="none"/></> },
  { name: "3D Design",            icon: <><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" fill="none"/><path d="M3 12h18M12 3c-2.5 3-4 5.8-4 9s1.5 6 4 9M12 3c2.5 3 4 5.8 4 9s-1.5 6-4 9" stroke="white" strokeWidth="1.5" fill="none"/></> },
  { name: "UX / UI Consultation", icon: <><rect x="2" y="3" width="20" height="18" rx="2" stroke="white" strokeWidth="1.8" fill="none"/><path d="M2 9h20M12 9v12" stroke="white" strokeWidth="1.8"/></> },
];

const WORK_HISTORY = [
  { period: "2012 – 2024", role: "Full-Stack Designer", company: "KYMA" },
  { period: "2021 – 2023", role: "Senior UI Designer",  company: "Studio Noir" },
  { period: "2019 – 2021", role: "Product Designer",    company: "TechVentures" },
];

const PRICING_FEATURES = [
  "No contracts or commitments", "Pause or cancel anytime",
  "Multiple Brands",             "Unlimited requests",
  "Avg 48 hour turnaround",      "Framer development",
];

const TESTIMONIALS = [
  { quote: "The new UI design cut our customer support tickets in half. It's been a game-changer for us.", name: "Martina Martinez", role: "Customer Manager at SupportEase", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&q=80" },
  { quote: "Working with Maya felt like having a seasoned design partner who truly understood our vision for Zazzle and brought it to life in ways we hadn't even imagined.", name: "Thomas Weber", role: "Co-founder of KYMA", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&q=80" },
  { quote: "Our website conversion rate improved significantly thanks to Maya's expertise.", name: "Ben Harper", role: "CTO of Nexus", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&q=80" },
  { quote: "Maya's design approach brought clarity to our complex data visualizations. Our users are thrilled!", name: "Michael Wong", role: "Product Lead at DataViz", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&q=80" },
  { quote: "The rebranding exceeded our expectations. It's given us a competitive edge in our industry.", name: "Sarah Chen", role: "CEO at GrowthCo", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&q=80" },
  { quote: "The redesign transformed our brand image. We've seen a 30% increase in engagement since launch.", name: "Emma Scott", role: "Marketing Director", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&q=80" },
];

const FAQS = [
  { q: "How long does a typical project take to complete?",            a: "Project timelines vary based on complexity. A simple project might take 2–3 weeks, while more comprehensive designs can take 1–2 months. I will provide a specific estimate after our initial consultation." },
  { q: "Can you work with my existing brand and designs?",             a: "Absolutely. I specialise in extending and evolving existing design systems while maintaining full brand consistency across all touchpoints." },
  { q: "What makes your design process unique?",                       a: "I combine strategic thinking with hands-on execution, ensuring every design decision is rooted in user research and measurable business goals." },
  { q: "Do you offer ongoing support after the project is completed?", a: "Yes, I offer flexible support packages to ensure your product continues to evolve and improve post-launch." },
  { q: "How do you handle confidentiality and intellectual property rights?", a: "All projects are covered by a mutual NDA. Upon full payment, all intellectual property rights are transferred entirely to you." },
];

const BLOG_POSTS = [
  {
    title: "How designers and developers can actually collaborate.",
    date: "Mar 6, 2025", readTime: "8 min read", tag: "Collaboration", featured: true,
    excerpt: "Discover proven strategies to bridge the designer-developer gap. Learn how top teams eliminate handoff friction and ship better products faster through true collaboration.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=700&fit=crop&q=80",
    body: `The relationship between designers and developers is one of the most critical — and often most contentious — in the modern product organisation. Handoff friction, undefined expectations, and misaligned tooling cost teams weeks of rework every quarter.\n\nThe best teams I've worked with share one thing in common: they co-design the process before they design the product. Developers are invited into early wireframe reviews, designers attend sprint planning, and everyone uses a shared source of truth.\n\nDesign tokens have changed everything. When spacing, colour, and typography are codified as named values, the gap between Figma and code shrinks to near zero. Teams that invest in a robust token system see 40–60% reductions in design-related bugs.\n\nFeedback loops matter too. Daily async video walkthroughs (2-minute Loom recordings) beat long design-review ceremonies. They respect calendar space, create a searchable record, and let developers ask questions on their own time.\n\nUltimately, great collaboration is a culture problem, not a tools problem. Build empathy, share context early, and design with constraints in mind — and the handoff will take care of itself.`,
  },
  {
    title: "The future of design tools in an AI-first world.",
    date: "Feb 12, 2025", readTime: "5 min read", tag: "AI & Design", featured: false,
    excerpt: "AI is reshaping design workflows. Here's what it means for how we create, iterate, and ship.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop&q=80",
    body: `AI design tools are no longer a novelty — they're becoming the baseline. From auto-layouts that understand intent to generative image fill and copy assistance, the design tool of 2026 looks nothing like the ones we trained on five years ago.\n\nThe shift is most visible in iteration speed. A design that used to take three days of exploration can now go through 30 variations in an afternoon. The designer's role is evolving from maker to curator and decision-maker.\n\nBut there's a real risk here. Speed without judgement produces faster mediocrity. The designers who will thrive are those who use AI as an accelerant for their taste, not a replacement for it.\n\nI've been experimenting with AI-assisted design systems where components are generated to spec, documented automatically, and tested for accessibility in real time. The results are promising — but only when a human with strong design instincts is driving.`,
  },
  {
    title: "Typography principles every designer should master.",
    date: "Jan 28, 2025", readTime: "6 min read", tag: "Typography", featured: false,
    excerpt: "The fundamentals that separate good from great. A deep-dive into type hierarchy, spacing, and the invisible rules that make text feel right.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop&q=80",
    body: `Typography is the invisible structure that makes or breaks a design. You can have perfect colour, stunning imagery, and a smart layout — but if the type is wrong, nothing else feels right.\n\nThe fundamentals start with hierarchy. Users don't read, they scan. Your typographic scale must communicate importance instantly: what's the headline, what's supporting copy, what can be skipped. Three levels of hierarchy are usually enough.\n\nLine length (measure) is criminally underrated. 60–75 characters per line is the sweet spot for comfortable reading. Too short and the eye jumps constantly; too long and it loses its place.\n\nLeading (line height) follows a simple rule: 1.4–1.6× the font size for body copy. Headlines can be tighter — 1.1–1.2× — to feel intentional rather than floated.\n\nFinally, the space between letters. Tracking slightly wider on small uppercase labels (+0.08em to +0.15em) increases legibility. Tight tracking on large display type feels deliberate and premium.`,
  },
];

const TECH_STACK = [
  { label: "Figma",   symbol: "✦" }, { label: "Framer",  symbol: "◈" },
  { label: "Webflow", symbol: "⬡" }, { label: "Remix",   symbol: "R" },
  { label: "Blender", symbol: "⬟" }, { label: "Notion",  symbol: "▣" },
  { label: "ChatGPT", symbol: "✤" }, { label: "Claude",  symbol: "✳" },
];

const SOCIAL_ICONS = [
  <svg key="x"  viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.932l4.256 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  <svg key="ig" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  <svg key="dr" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 0C5.374 0 0 5.374 0 12c0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.626-5.373-12-12-12zm7.974 5.49a10.4 10.4 0 012.12 6.37c-.31-.063-3.437-.699-6.586-.303-.07-.17-.138-.344-.21-.516-.2-.48-.414-.96-.64-1.426 3.46-1.41 5.04-3.44 5.316-3.125zM12 2.007a9.99 9.99 0 016.548 2.437c-.232.27-1.655 2.172-5.005 3.42C11.967 5.17 10.393 3.17 10.15 2.85a10.066 10.066 0 011.85-.843zM8.06 3.55c.234.306 1.764 2.313 3.375 5.033C7.07 9.73 3.525 9.704 3.143 9.7A10.027 10.027 0 018.06 3.55zM2.007 12.02v-.264c.37.008 4.527.06 8.944-1.24.25.49.49.988.712 1.49-.114.033-.228.067-.34.105-4.558 1.47-6.98 5.494-7.17 5.83a9.959 9.959 0 01-2.146-5.92zm10 9.98a9.962 9.962 0 01-6.25-2.2c.15-.294 1.85-3.774 6.843-5.54l.06-.02a35.553 35.553 0 011.782 6.327A9.98 9.98 0 0112 21.999zm4.257-1.373a37.44 37.44 0 00-1.658-5.96c2.973-.474 5.578.306 5.885.4a10.02 10.02 0 01-4.227 5.56z"/></svg>,
  <svg key="li" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  <svg key="be" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.7zM15.971 13c-.092-1.869 1.828-2.805 3.021-1.43H15.97zM3.084 7.453c4.555 0 5.542 3.249 5.542 5.38 0 4.059-2.851 5.167-5.875 5.167H0V7.453h3.084zm-.093 8.33c1.679 0 3.334-.498 3.334-2.95 0-2.449-1.655-2.948-3.334-2.948H2.25v5.898h.741z"/></svg>,
];

// ── dot cursor ────────────────────────────────────────────────────────────────
function DotCursor() {
  const { isDark } = useTheme();
  const x = useMotionValue(-40);
  const y = useMotionValue(-40);
  const sx = useSpring(x, { stiffness: 280, damping: 28 });
  const sy = useSpring(y, { stiffness: 280, damping: 28 });
  React.useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return (
    <motion.div
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      className={`pointer-events-none fixed top-0 left-0 z-[9999] h-2.5 w-2.5 rounded-full hidden md:block ${isDark ? "bg-white mix-blend-screen" : "bg-[#1a1a1a] mix-blend-multiply"}`}
    />
  );
}

// ── marquee ───────────────────────────────────────────────────────────────────
function Marquee({ items }: { items: string[] }) {
  const { fg } = useTheme();
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)" }}>
      <motion.div
        className="flex gap-14 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((logo, i) => (
          <span key={i} className="text-sm font-semibold tracking-widest opacity-35 uppercase select-none" style={{ color: fg }}>
            {logo}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, inStack = false }: { project: typeof PROJECTS[0]; inStack?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: project.bg }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: project.accent, opacity: 0.55 }}>{project.name}</span>
          {!inStack && (
            <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }} transition={{ duration: 0.18 }} className="text-xs font-semibold" style={{ color: project.accent }}>
              ↗ View Project
            </motion.span>
          )}
        </div>
        <p className="font-bold leading-snug" style={{ color: project.accent, fontSize: inStack ? "1.15rem" : "1rem", maxWidth: inStack ? 240 : 190 }}>
          {project.tagline}
        </p>
        <div className="flex items-center justify-between">
          {project.badge && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 rounded-full" style={{ background: project.accent, opacity: 0.25 }} />
              <span className="text-xs font-semibold" style={{ color: project.accent, opacity: 0.5 }}>{project.badge}</span>
            </div>
          )}
          <span className="text-[10px] ml-auto" style={{ color: project.accent, opacity: 0.25 }}>⟩ StudioMC</span>
        </div>
      </div>
      {!inStack && <motion.div animate={{ opacity: hovered ? 0.07 : 0 }} className="absolute inset-0 bg-white" />}
    </div>
  );
}

// ── nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const { fg, card, border, isDark, toggle } = useTheme();
  const [compact, setCompact] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    let lastY = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      if (y <= 10) setCompact(false);
      else if (y > lastY) setCompact(true);
      else if (y < lastY) setCompact(false);
      lastY = y;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navBg = isDark ? "rgba(13,13,13,0.92)" : "rgba(255,255,255,0.90)";
  const navBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const linkHover = isDark ? "hover:text-white hover:bg-white/10" : "hover:text-gray-900 hover:bg-gray-100";
  const linkColor = isDark ? "#888" : "#6b7280";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 px-4">
        <nav
          className="flex items-center backdrop-blur-md shadow-sm"
          style={{
            borderRadius: 9999,
            border: `1px solid ${navBorder}`,
            backgroundColor: navBg,
            paddingTop:    compact ? 6 : 8,
            paddingBottom: compact ? 6 : 8,
            paddingLeft:   compact ? 10 : 16,
            paddingRight:  compact ? 10 : 8,
            gap:           compact ? 8 : 4,
            transition: "padding 0.35s cubic-bezier(0.22,1,0.36,1), gap 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={AVATARS[0]} alt="Maya Chen" className="h-7 w-7 rounded-full object-cover shrink-0" />
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: fg }}>Maya Chen</span>
          </div>

          {/* Nav links — desktop, hidden on mobile */}
          <div
            className="hidden md:flex items-center gap-1 overflow-hidden"
            style={{
              maxWidth:      compact ? 0 : 520,
              opacity:       compact ? 0 : 1,
              borderLeft:    `1px solid ${compact ? "transparent" : navBorder}`,
              paddingLeft:   compact ? 0 : 12,
              marginLeft:    compact ? 0 : 4,
              pointerEvents: compact ? "none" : "auto",
              transition: "max-width 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease, padding 0.35s cubic-bezier(0.22,1,0.36,1), margin 0.35s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <button key={link} className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${linkHover}`} style={{ color: linkColor }}>
                {link}
              </button>
            ))}
            <button className={`ml-1 px-4 py-1.5 text-sm font-semibold rounded-full border whitespace-nowrap transition-colors ${linkHover}`} style={{ color: fg, borderColor: navBorder }}>
              Contact
            </button>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className={`flex items-center justify-center rounded-full transition-colors shrink-0 ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            style={{ width: 28, height: 28, color: fg }}
          >
            {isDark
              ? <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4.22 15.78a1 1 0 001.41-1.41l-.7-.71a1 1 0 00-1.42 1.42l.71.7zM3 10a1 1 0 100 2H2a1 1 0 100-2h1zm1.22-5.78a1 1 0 011.41 1.41l-.7.71A1 1 0 014.51 5l.71-.78zM17 10a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              : <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
            }
          </button>

          {/* Meatball — always visible, opens mobile menu */}
          <div
            onClick={() => setMobileOpen(v => !v)}
            className={`flex items-center justify-center rounded-full cursor-pointer overflow-hidden transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            style={{ width: compact ? 28 : 28, height: compact ? 28 : 28, color: fg, transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)" }}
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <circle cx="4" cy="10" r="1.6" /><circle cx="10" cy="10" r="1.6" /><circle cx="16" cy="10" r="1.6" />
            </svg>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed top-16 left-4 right-4 z-40 rounded-2xl p-3 shadow-2xl"
            style={{ backgroundColor: card, border: `1px solid ${border}` }}
          >
            {[...NAV_LINKS, "Contact"].map(link => (
              <button
                key={link}
                onClick={() => setMobileOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              >
                {link}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── hero + projects ───────────────────────────────────────────────────────────
function HeroAndProjectsSection() {
  const { fg, muted, isDark } = useTheme();
  const pinRef         = React.useRef<HTMLDivElement>(null);
  const groupRef       = React.useRef<HTMLDivElement>(null);
  const heroContentRef = React.useRef<HTMLDivElement>(null);
  const sectionHeadRef = React.useRef<HTMLDivElement>(null);
  const viewAllBtnRef  = React.useRef<HTMLButtonElement>(null);
  const cardRefs       = React.useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs      = React.useRef<(HTMLDivElement | null)[]>([]);
  const progressRef    = React.useRef(0);

  React.useEffect(() => {
    const pin   = pinRef.current;
    const group = groupRef.current;
    if (!pin || !group) return;
    const cards  = cardRefs.current.filter(Boolean)  as HTMLDivElement[];
    const labels = labelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 4 || labels.length < 4) return;

    const W = pin.offsetWidth;
    const H = pin.offsetHeight;
    const PAD_X   = Math.max(40, W * 0.07);
    const GAP     = 14;
    const LABEL_H = 52;
    const HEADING_H = 108;
    const gridW   = W - PAD_X * 2;
    const gCardW  = (gridW - GAP) / 2;
    const gCardH  = (H - HEADING_H - LABEL_H * 2 - GAP - 24) / 2;

    const finalPos = [
      { x: PAD_X,               y: HEADING_H },
      { x: PAD_X + gCardW + GAP, y: HEADING_H },
      { x: PAD_X,               y: HEADING_H + gCardH + LABEL_H + GAP },
      { x: PAD_X + gCardW + GAP, y: HEADING_H + gCardH + LABEL_H + GAP },
    ];

    const hCardW = Math.min(gCardW * 1.35, W * 0.40);
    const hCardH = Math.min(gCardH * 1.35, H * 0.60);
    const hStackX = W * 0.70 - hCardW / 2;
    const hStackY = (H - hCardH) / 2 - 20;
    const cStackX = W / 2 - gCardW / 2;
    const cStackY = H / 2 - gCardH / 2;
    const stackRots = [-0.5, 3.5, -5, 7];
    const stackDY   = [0, 8, 18, 28];
    const stackZ    = [4, 3, 2, 1];

    cards.forEach((card, i) => {
      gsap.set(card, { position: "absolute", top: 0, left: 0, width: hCardW, height: hCardH, x: hStackX, y: hStackY + stackDY[i], rotation: stackRots[i], zIndex: stackZ[i], borderRadius: 16, overflow: "hidden" });
    });
    labels.forEach((label, i) => {
      gsap.set(label, { position: "absolute", top: 0, left: 0, width: gCardW, x: finalPos[i].x, y: finalPos[i].y + gCardH + 8, opacity: 0, zIndex: 10 });
    });
    gsap.set(sectionHeadRef.current, { opacity: 0, y: -20 });
    gsap.set(viewAllBtnRef.current,  { opacity: 0 });
    gsap.set(group, { opacity: 1 });

    const setRX = gsap.quickSetter(group, "rotateX", "deg") as (v: number) => void;
    const setRY = gsap.quickSetter(group, "rotateY", "deg") as (v: number) => void;
    gsap.set(group, { transformPerspective: 1000 });

    let tRX = 0, tRY = 0, cRX = 0, cRY = 0, raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => { const f = Math.max(0, 1 - progressRef.current * 4); cRX = lerp(cRX, tRX * f, 0.095); cRY = lerp(cRY, tRY * f, 0.095); setRX(cRX); setRY(cRY); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);

    const onMove  = (e: MouseEvent) => { const r = pin.getBoundingClientRect(); tRX = ((e.clientY - r.top)  / r.height - 0.5) * -16; tRY = ((e.clientX - r.left) / r.width  - 0.5) * 22; };
    const onLeave = () => { tRX = 0; tRY = 0; };
    pin.addEventListener("mousemove", onMove);
    pin.addEventListener("mouseleave", onLeave);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin, start: "top top", end: "+=3000", scrub: 1.2, pin: true, pinSpacing: true, onUpdate: (s) => { progressRef.current = s.progress; } },
      });
      tl.to(heroContentRef.current, { opacity: 0, x: -50, duration: 0.25, ease: "power2.in" }, 0);
      cards.forEach((card, i) => { tl.to(card, { x: cStackX, y: cStackY + stackDY[i], width: gCardW, height: gCardH, duration: 0.35, ease: "power2.inOut" }, 0.05); });
      tl.to(sectionHeadRef.current, { opacity: 1, y: 0,  duration: 0.2, ease: "power2.out" }, 0.33);
      tl.to(viewAllBtnRef.current,  { opacity: 1,        duration: 0.15 }, 0.4);
      cards.forEach((card, i)  => { tl.to(card,  { x: finalPos[i].x, y: finalPos[i].y, rotation: 0, zIndex: 1, ease: "power2.inOut", duration: 0.55 }, 0.42 + i * 0.10); });
      labels.forEach((label, i) => { tl.to(label, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.78 + i * 0.05); });
    });

    return () => { cancelAnimationFrame(raf); pin.removeEventListener("mousemove", onMove); pin.removeEventListener("mouseleave", onLeave); ctx.revert(); };
  }, []);

  const badgeBg     = isDark ? "#1a1a1a" : "#ffffff";
  const badgeBorder = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";
  const badgeText   = isDark ? "#aaa" : "#4b5563";

  return (
    <div ref={pinRef} style={{ height: "100vh", position: "relative", overflow: "hidden", background: "transparent" }}>
      {/* Hero text */}
      <div ref={heroContentRef} style={{ position: "absolute", top: 0, left: 0, width: "52%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 6% 0 7%", zIndex: 5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit shadow-sm mb-6" style={{ borderColor: badgeBorder, backgroundColor: badgeBg }}>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium" style={{ color: badgeText }}>Available for new projects</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
          <span style={{ color: muted }}>Design that</span><br />
          <span style={{ color: fg }}>delivers results.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: isDark ? "#888" : "#6b7280" }}>
          <strong className="font-semibold" style={{ color: isDark ? "#ccc" : "#1f2937" }}>Strategic design that drives growth, not just looks good.</strong>
          {" "}I create everything your brand needs to attract customers and turn them into sales.
        </p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6 inline-flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full text-white text-sm font-semibold shadow-md w-fit" style={{ backgroundColor: fg }}>
          <img src={AVATARS[0]} alt="" className="h-8 w-8 rounded-full object-cover" />
          Book a call with me
        </motion.button>
        <div className="flex items-center gap-4 mt-6">
          <div className="flex -space-x-2">
            {AVATARS.map((src, i) => <img key={i} src={src} alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover" />)}
          </div>
          <div>
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
            <p className="text-[11px] mt-0.5" style={{ color: muted }}>99+ Happy clients</p>
          </div>
        </div>
      </div>

      {/* Grid heading */}
      <div ref={sectionHeadRef} style={{ position: "absolute", top: 28, left: "7%", right: "7%", zIndex: 20, opacity: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 4 }}>Selected work</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: fg, margin: 0 }}>Latest Projects</h2>
        </div>
        <button ref={viewAllBtnRef} style={{ fontSize: 14, fontWeight: 600, color: fg, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          View all my projects ↗
        </button>
      </div>

      {/* Cards */}
      <div ref={groupRef} style={{ position: "absolute", inset: 0, opacity: 0 }}>
        {PROJECTS.map((project, i) => (
          <React.Fragment key={project.id}>
            <div ref={(el) => { cardRefs.current[i] = el; }}>
              <ProjectCard project={project} inStack={false} />
            </div>
            <div ref={(el) => { labelRefs.current[i] = el; }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 4, paddingRight: 4 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: fg, margin: 0 }}>{project.name}</p>
                <p style={{ fontSize: 12, color: muted, margin: 0 }}>{project.category}</p>
              </div>
              <button style={{ fontSize: 12, fontWeight: 600, color: fg, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                View Project ↗
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── testimonial (large quote) ─────────────────────────────────────────────────
function TestimonialSection() {
  const { fg, muted, isDark } = useTheme();
  const ref      = React.useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: ref.current, start: "top 78%", once: true, onEnter: () => controls.start("visible") });
    }, ref);
    return () => ctx.revert();
  }, [controls]);
  const variants: Variants = {
    hidden:  { opacity: 0, y: 24, filter: "blur(16px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
  };
  return (
    <section ref={ref} className="py-20 sm:py-28 border-t" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
      <motion.div initial="hidden" animate={controls} variants={variants} className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14 text-center">
        <blockquote className="text-xl sm:text-2xl md:text-3xl xl:text-[2.1rem] font-bold leading-snug" style={{ color: fg }}>
          &ldquo;Working with Maya felt like having a seasoned design partner who truly understood our vision for KYMA and brought it to life in ways we hadn&apos;t even imagined.&rdquo;
        </blockquote>
        <div className="mt-10 flex flex-col items-center gap-3">
          <img src={AVATARS[1]} alt="Thomas Weber" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold" style={{ color: fg }}>Thomas Weber</p>
            <p className="text-xs" style={{ color: muted }}>Co-founder of KYMA</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── services ──────────────────────────────────────────────────────────────────
function ServicesSection() {
  const { fg, card, border, muted, isDark } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: ref.current, start: "top 75%", once: true };
      gsap.from(".svc-left",       { opacity: 0, x: -32, duration: 0.75, ease: "power2.out", scrollTrigger: trig });
      gsap.from(".svc-item",       { opacity: 0, y: 20,  stagger: 0.07, duration: 0.55, ease: "power2.out", scrollTrigger: trig });
      gsap.from(".svc-stack-icon", { opacity: 0, scale: 0.8, stagger: 0.05, duration: 0.4, ease: "back.out(1.4)", scrollTrigger: { trigger: ref.current, start: "top 68%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14 flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="svc-left flex-1 max-w-lg">
          <BlurReveal>
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              <span style={{ color: muted }}>Services that</span><br />
              <span style={{ color: fg }}>supercharge your</span><br />
              <span style={{ color: fg }}>business.</span>
            </h2>
          </BlurReveal>
          <div className="mt-10 sm:mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: muted }}>My tech stack</p>
            <div className="flex flex-wrap gap-2.5">
              {TECH_STACK.map((t) => (
                <div key={t.label} title={t.label} className="svc-stack-icon w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-base font-semibold shadow-sm select-none" style={{ color: fg, backgroundColor: card, borderColor: border }}>
                  {t.symbol}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {SERVICES.map((svc) => (
            <div key={svc.name} className="svc-item flex items-center gap-5 py-4 sm:py-5 border-b first:border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
              <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: fg }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5">{svc.icon}</svg>
              </div>
              <span className="text-lg sm:text-xl font-medium" style={{ color: fg }}>{svc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── work card + history ───────────────────────────────────────────────────────
function WorkCard({ job, onClick, isToggle = false, expanded = false }: { job: typeof WORK_HISTORY[0]; onClick?: () => void; isToggle?: boolean; expanded?: boolean }) {
  const { fg, card, border } = useTheme();
  return (
    <div
      onClick={onClick}
      className={["rounded-xl p-4 border shadow-sm transition-all duration-200", isToggle ? "cursor-pointer select-none" : ""].join(" ")}
      style={{ backgroundColor: card, borderColor: border }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold" style={{ color: fg }}>{job.company}</p>
          <p className="text-sm mt-0.5" style={{ color: "#9ca3af" }}>{job.role}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: "#9ca3af" }}>{job.period}</span>
          {isToggle && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full text-white transition-transform duration-300" style={{ backgroundColor: fg, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6l5 5 5-5" /></svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkHistory() {
  const { fg } = useTheme();
  const [showAll, setShowAll] = React.useState(false);
  const toggle = () => setShowAll((v) => !v);
  return (
    <div>
      <p className="text-sm font-semibold mb-4" style={{ color: fg }}>My work history</p>
      <WorkCard job={WORK_HISTORY[0]} onClick={toggle} isToggle expanded={showAll} />
      <motion.div initial={false} animate={{ height: showAll ? "auto" : 0, opacity: showAll ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ overflow: "hidden" }}>
        <div className="flex flex-col gap-3 pt-3">
          {WORK_HISTORY.slice(1).map((job) => <WorkCard key={job.company} job={job} />)}
        </div>
      </motion.div>
      <button onClick={toggle} className="mt-4 flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: fg }}>
        {showAll ? "Show less" : "Show all"}
        <span className="flex items-center justify-center w-5 h-5 rounded-full text-white transition-transform duration-300" style={{ backgroundColor: fg, transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }}>
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6l5 5 5-5" /></svg>
        </span>
      </button>
    </div>
  );
}

// ── about ─────────────────────────────────────────────────────────────────────
function AboutSection() {
  const { fg, muted, isDark } = useTheme();
  const ref      = React.useRef<HTMLDivElement>(null);
  const imgRef   = React.useRef<HTMLDivElement>(null);
  const leftRef  = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: ref.current, start: "top 75%", once: true };
      gsap.from(imgRef.current,   { scale: 1.06, duration: 1.0, ease: "power2.out", scrollTrigger: trig });
      gsap.from(leftRef.current,  { opacity: 0, x: -30, duration: 0.75, ease: "power2.out", scrollTrigger: trig });
      gsap.from(rightRef.current, { opacity: 0, x:  30, duration: 0.75, ease: "power2.out", scrollTrigger: trig });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14">
        <BlurReveal className="mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
            <span style={{ color: muted }}>Designing experiences</span><br />
            <span style={{ color: fg }}>that solve real problems.</span>
          </h2>
        </BlurReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-stretch">
          <div ref={leftRef} className="flex flex-col gap-6">
            <div ref={imgRef} className="relative rounded-2xl overflow-hidden flex-1 min-h-[280px] sm:min-h-[320px]">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=760&h=950&fit=crop&q=80" alt="Maya Chen" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full" style={{ backgroundColor: "#111" }}>
                <span className="text-[11px] font-semibold text-white whitespace-nowrap">✕ 2,847</span>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-1.5 text-white/60">{SOCIAL_ICONS}</div>
              </div>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: fg }}>Maya Chen</p>
              <p className="text-sm" style={{ color: muted }}>Full-stack Designer</p>
            </div>
            <WorkHistory />
          </div>
          <div ref={rightRef} className="flex flex-col gap-7 pt-2">
            <p className="text-[15px] leading-[1.8]" style={{ color: isDark ? "#888" : "#6b7280" }}>
              <strong className="font-semibold" style={{ color: fg }}>I love turning ideas into something real through design.</strong>
              {" "}What started as a hobby turned into a career when I discovered how design can make things both look great and work better.
            </p>
            <p className="text-[15px] leading-[1.8]" style={{ color: isDark ? "#888" : "#6b7280" }}>
              <strong className="font-semibold" style={{ color: fg }}>I focus on creating user interfaces that serve a real purpose</strong>
              {" "}– making sure they&apos;re not just pretty, but actually solve problems.
            </p>
            <p className="text-[15px] leading-[1.8]" style={{ color: isDark ? "#888" : "#6b7280" }}>
              I&apos;m a bit of a perfectionist when it comes to the small stuff, but I think that&apos;s what makes good design great. This attention to detail helps me build strong relationships with clients.
            </p>
            <div className="mt-auto pt-8">
              <svg viewBox="0 0 240 80" width="200" height="64" aria-hidden="true">
                <path d="M12 62 C30 18,56 10,76 38 C90 56,80 66,64 54 C48 42,56 24,78 30 C100 36,108 58,126 48 C142 38,136 18,154 26 C172 34,166 56,184 46 C200 36,204 16,228 22" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M40 70 C48 74,60 76,68 70" fill="none" stroke={fg} strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M80 72 C84 68,90 66,96 70" fill="none" stroke={fg} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── pricing ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const { fg, card, border, muted, isDark } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = { trigger: ref.current, start: "top 78%", once: true };
      gsap.from(".price-head", { opacity: 0, y: 28, duration: 0.7, ease: "power2.out", scrollTrigger: trig });
      gsap.from(".price-step", { opacity: 0, y: 18, stagger: 0.1, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 72%", once: true } });
      gsap.from(".price-card", { opacity: 0, y: 36, stagger: 0.14, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 68%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14">
        <div className="price-head flex flex-col lg:flex-row lg:items-end gap-8 mb-12">
          <div className="flex-1">
            <BlurReveal>
              <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
                <span style={{ color: muted }}>Simple pricing.</span><br />
                <span style={{ color: fg }}>Standout designs.</span>
              </h2>
            </BlurReveal>
          </div>
          <div className="lg:max-w-[280px]">
            <p className="text-base font-semibold" style={{ color: fg }}>Clear costs, no hidden fees.</p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: isDark ? "#888" : "#6b7280" }}>Select from monthly subscriptions or individual project rates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 mb-10 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
          {[
            { icon: "↺", label: "Subscribe", desc: "Subscribe via stripe & start requesting through my trello board." },
            { icon: "◾", label: "Request",   desc: "Request whatever service I offer, from branding to web design." },
            { icon: "↓", label: "Receive",   desc: "Receive your design within 48 hours on average." },
          ].map((s) => (
            <div key={s.label} className="price-step">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: fg }}>
                <span style={{ color: muted }}>{s.icon}</span> {s.label}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#888" : "#6b7280" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="price-card lg:w-[42%] rounded-2xl p-8 flex flex-col justify-between min-h-[400px] sm:min-h-[480px]" style={{ backgroundColor: fg }}>
            <div>
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium text-white/70 bg-white/10 mb-8">Pause or cancel anytime</span>
              <div className="relative w-24 h-28 mb-8">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="absolute inset-0 rounded-xl bg-white/20" style={{ transform: `rotate(${[8, 3, 0][i]}deg) translateY(${[-8, -4, 0][i]}px)`, opacity: 1 - i * 0.25 }} />
                ))}
              </div>
              <p className="text-xl font-bold text-white leading-snug">Subscription design services<br />for brands who move fast.</p>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/60">Slots available</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Hire me today</h3>
              <p className="text-sm text-white/50 leading-relaxed">Skip the agency markup and work directly with an experienced designer.</p>
            </div>
          </div>

          <div className="price-card flex-1 rounded-2xl p-8 border flex flex-col" style={{ backgroundColor: card, borderColor: border }}>
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: fg }}>Unlimited Design</h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: isDark ? "#888" : "#9ca3af" }}>
                One flat monthly rate for unlimited design requests.{" "}
                <strong className="font-semibold" style={{ color: fg }}>Ideal for ongoing design requirements.</strong>
              </p>
              <div className="border-t pt-6 mb-6 flex items-baseline gap-1.5" style={{ borderColor: border }}>
                <span className="text-4xl sm:text-5xl font-bold" style={{ color: fg }}>$8,000</span>
                <span className="text-sm" style={{ color: muted }}>/ month</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-8">
                {PRICING_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: fg }}>
                    <span className="text-xs" style={{ color: muted }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: fg }}>⬡ Get Started</button>
              <span className="text-sm italic font-medium" style={{ color: muted }}>stripe</span>
            </div>
          </div>
        </div>

        <div className="price-card mt-4 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ backgroundColor: fg }}>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Single Project</h3>
            <p className="text-sm text-white/50 leading-relaxed">Comprehensive design services for any project scope. Ideal for one-time design needs or individual tasks.</p>
          </div>
          <div className="flex flex-col gap-2">
            {["Fixed timeline", "Milestone updates"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-white/30 text-xs">✓</span> {f}
              </div>
            ))}
          </div>
          <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">⬡ Get quote</button>
        </div>
      </div>
    </section>
  );
}

// ── trusted by ────────────────────────────────────────────────────────────────
function TrustedBySection() {
  const { fg, muted, isDark } = useTheme();
  return (
    <div className="border-t flex items-center gap-4 sm:gap-6 overflow-hidden py-5" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
      <span className="shrink-0 pl-6 sm:pl-8 md:pl-14 text-sm font-semibold whitespace-nowrap" style={{ color: muted }}>
        Trusted by <strong style={{ color: fg }}>many</strong>
      </span>
      <div className="flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)" }}>
        <motion.div className="flex gap-14 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, ease: "linear", repeat: Infinity }}>
          {[...LOGOS, ...LOGOS].map((logo, i) => <span key={i} className="text-sm font-semibold tracking-widest opacity-40 uppercase select-none" style={{ color: fg }}>{logo}</span>)}
        </motion.div>
      </div>
    </div>
  );
}

// ── testimonials grid ─────────────────────────────────────────────────────────
function TestimonialsGridSection() {
  const { fg, muted, isDark } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".tg-head", { opacity: 0, y: 28, duration: 0.7,  ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
      gsap.from(".tg-card", { opacity: 0, y: 24, stagger: 0.09, duration: 0.55, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  const gridBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  return (
    <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: gridBorder }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14">
        <div className="tg-head flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 sm:mb-16">
          <BlurReveal>
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              <span style={{ color: muted }}>Hear from what my</span><br />
              <span style={{ color: fg }}>clients have to say.</span>
            </h2>
          </BlurReveal>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => <img key={i} src={src} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />)}
            </div>
            <div>
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}</div>
              <p className="text-xs mt-0.5" style={{ color: muted }}>99+ Happy clients</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-t border-l" style={{ borderColor: gridBorder }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="tg-card border-r border-b p-6 sm:p-7 flex flex-col justify-between gap-6 sm:gap-8" style={{ borderColor: gridBorder }}>
              <div>
                <span className="text-4xl font-serif leading-none block mb-3" style={{ color: isDark ? "#333" : "#e5e7eb" }}>"</span>
                <p className="text-sm leading-relaxed" style={{ color: fg }}>{t.quote}</p>
              </div>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: fg }}>{t.name}</p>
                  <p className="text-xs" style={{ color: muted }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── faq ───────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { fg, card, border, muted, isDark } = useTheme();
  const [openIdx, setOpenIdx] = React.useState<number>(0);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".faq-left",  { opacity: 0, x: -28, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
      gsap.from(".faq-right", { opacity: 0, x:  28, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  const divBorder = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  return (
    <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: divBorder }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14 flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="faq-left flex-1">
          <BlurReveal className="mb-10 sm:mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              <span style={{ color: fg }}>Your questions</span><br />
              <span style={{ color: muted }}>answered.</span>
            </h2>
          </BlurReveal>
          <div>
            {FAQS.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={i} className="border-t last:border-b" style={{ borderColor: divBorder }}>
                  <button onClick={() => setOpenIdx(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
                    <div className="flex items-center gap-4">
                      {i > 0 && <span className="text-xs font-medium w-5 shrink-0" style={{ color: muted }}>0{i + 1}</span>}
                      <span className="text-sm font-semibold" style={{ color: fg }}>{faq.q}</span>
                    </div>
                    <span className="shrink-0 text-xl leading-none" style={{ color: muted }}>{isOpen ? "−" : "+"}</span>
                  </button>
                  <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ overflow: "hidden" }}>
                    <p className="text-sm leading-relaxed pb-5 pr-8" style={{ color: isDark ? "#888" : "#6b7280" }}>{faq.a}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="faq-right lg:w-80 xl:w-96 shrink-0">
          <div className="rounded-2xl p-8 border h-full" style={{ backgroundColor: card, borderColor: border }}>
            <img src={AVATARS[0]} alt="" className="h-14 w-14 rounded-full object-cover mb-6" />
            <p className="text-sm mb-1" style={{ color: muted }}>Still not sure?</p>
            <h3 className="text-2xl font-bold leading-snug mb-4" style={{ color: fg }}>Book a free discovery call.</h3>
            <p className="text-sm leading-relaxed mb-7" style={{ color: isDark ? "#888" : "#6b7280" }}>
              Learn more about how I work and how I can help you and your business take the next step.
            </p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: fg }}>📅 Schedule Now</button>
              <span className="text-sm italic font-medium" style={{ color: muted }}>Cal.com</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── blog: hover pill ──────────────────────────────────────────────────────────
function ViewArticlePill() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82, y: 8 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
    >
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-2xl"
        style={{ backgroundColor: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}
      >
        View Article
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </div>
    </motion.div>
  );
}

// ── blog: article overlay ─────────────────────────────────────────────────────
function ArticleOverlay({ post, onClose }: { post: typeof BLOG_POSTS[0]; onClose: () => void }) {
  const { fg, bg, card: _card, border, muted, isDark } = useTheme();
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[200]"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.46, ease: EASE }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh", backgroundColor: bg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 border-b" style={{ backgroundColor: bg, borderColor: border }}>
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: fg }}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Back to Blog
          </button>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6", color: fg }}>{post.tag}</span>
            <span className="text-xs" style={{ color: muted }}>{post.readTime}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <div style={{ height: "clamp(180px, 38vw, 360px)", overflow: "hidden" }}>
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
            <div className="flex items-center gap-4 mb-6">
              <img src={AVATARS[0]} alt="Maya Chen" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: fg }}>Maya Chen</p>
                <p className="text-xs" style={{ color: muted }}>{post.date} · {post.readTime}</p>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.15] tracking-tight mb-8" style={{ color: fg }}>{post.title}</h1>
            <div className="space-y-5">
              {post.body.split("\\n\\n").map((para, i) => (
                <p key={i} className="text-base leading-[1.85]" style={{ color: isDark ? "#aaa" : "#374151" }}>{para}</p>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: border }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: fg }}>Written by Maya Chen</p>
                <p className="text-xs mt-1" style={{ color: muted }}>Full-Stack Designer · Studio Maya</p>
              </div>
              <button className="px-5 py-2.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: fg }}>Follow ↗</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── blog section ──────────────────────────────────────────────────────────────
function BlogSection() {
  const { fg, card, border, muted, isDark } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = React.useState<typeof BLOG_POSTS[0] | null>(null);
  const [featHovered, setFeatHovered]     = React.useState(false);
  const [smallHovered, setSmallHovered]   = React.useState<number | null>(null);

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".blog-head",     { opacity: 0, y: 24, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
      gsap.from(".blog-featured", { opacity: 0, y: 32, duration: 0.75, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 72%", once: true } });
      gsap.from(".blog-small",    { opacity: 0, y: 22, stagger: 0.12,  duration: 0.55, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 65%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  const [featured, ...smalls] = BLOG_POSTS;

  return (
    <>
      <AnimatePresence>
        {activeArticle && <ArticleOverlay post={activeArticle} onClose={() => setActiveArticle(null)} />}
      </AnimatePresence>

      <section ref={ref} className="border-t py-16 sm:py-24" style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14">

          {/* Header */}
          <div className="blog-head flex items-start justify-between mb-10 sm:mb-12">
            <BlurReveal>
              <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
                <span style={{ color: muted }}>From my blog,</span><br />
                <span style={{ color: fg }}>design insights.</span>
              </h2>
            </BlurReveal>
            <button className="shrink-0 flex items-center gap-1.5 text-sm font-semibold mt-2 hover:opacity-70 transition-opacity" style={{ color: fg }}>
              View All ↗
            </button>
          </div>

          {/* ── Featured card — large, top ── */}
          <div
            className="blog-featured relative rounded-2xl overflow-hidden border cursor-pointer mb-4 group"
            style={{ backgroundColor: card, borderColor: border }}
            onMouseEnter={() => setFeatHovered(true)}
            onMouseLeave={() => setFeatHovered(false)}
            onClick={() => setActiveArticle(featured)}
          >
            {/* Image with zoom + overlay */}
            <div className="relative overflow-hidden" style={{ height: "clamp(220px, 38vw, 440px)" }}>
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: featHovered ? "scale(1.04)" : "scale(1)" }}
              />
              {/* Dark gradient at bottom */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />
              {/* Featured badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "rgba(10,10,10,0.7)", backdropFilter: "blur(8px)" }}>
                  Featured · {featured.tag}
                </span>
              </div>
              {/* Hover pill */}
              <AnimatePresence>{featHovered && <ViewArticlePill />}</AnimatePresence>
              {/* Mobile: title shown on image */}
              <div className="absolute bottom-4 left-5 right-5 sm:hidden">
                <p className="text-xs text-white/60 mb-1">{featured.date} · {featured.readTime}</p>
                <p className="text-base font-bold text-white leading-snug">{featured.title}</p>
              </div>
            </div>

            {/* Content row below image — desktop */}
            <div className="hidden sm:flex items-start sm:items-center justify-between gap-6 px-6 py-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: muted }}>
                  <span>{featured.date}</span><span>·</span><span>{featured.readTime}</span><span>·</span>
                  <span className="font-semibold">By Maya Chen</span>
                </div>
                <h3 className="text-xl font-bold leading-snug" style={{ color: fg }}>{featured.title}</h3>
                <p className="text-sm mt-1 leading-relaxed line-clamp-2" style={{ color: isDark ? "#888" : "#6b7280" }}>{featured.excerpt}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all" style={{ backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6", color: fg }}>
                Read Article
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </div>
            </div>
          </div>

          {/* ── Two smaller cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {smalls.map((post, idx) => (
              <div
                key={post.title}
                className="blog-small relative rounded-2xl overflow-hidden border cursor-pointer"
                style={{ backgroundColor: card, borderColor: border }}
                onMouseEnter={() => setSmallHovered(idx)}
                onMouseLeave={() => setSmallHovered(null)}
                onClick={() => setActiveArticle(post)}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 220 }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    style={{ transform: smallHovered === idx ? "scale(1.06)" : "scale(1)" }}
                  />
                  <AnimatePresence>{smallHovered === idx && <ViewArticlePill />}</AnimatePresence>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "rgba(10,10,10,0.7)", backdropFilter: "blur(6px)" }}>
                      {post.tag}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: muted }}>
                    <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
                  </div>
                  <h4 className="text-base font-bold leading-snug" style={{ color: fg }}>{post.title}</h4>
                  <p className="text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: isDark ? "#888" : "#6b7280" }}>{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

// ── footer text rotator ───────────────────────────────────────────────────────
function TextRotator() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATE_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: "3ch" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ROTATE_WORDS[index]}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{ color: "#c8f135" }}
        >
          {ROTATE_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── footer ────────────────────────────────────────────────────────────────────
function SiteFooter() {
  const ref = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-cta",  { opacity: 0, y: 40, duration: 0.85, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 82%", once: true } });
      gsap.from(".footer-meta", { opacity: 0, y: 24, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <footer ref={ref} className="relative overflow-hidden pt-16 sm:pt-20 pb-0" style={{ backgroundColor: "#0f0f0f" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-14">
        <div className="footer-cta mb-12 sm:mb-16">
          <BlurReveal>
            <h2 className="text-4xl sm:text-5xl md:text-7xl xl:text-[6rem] font-bold leading-[1.05] tracking-tight text-white">
              Lets <TextRotator /><br />
              <span style={{ color: "#4a4a4a" }}>incredible work together.</span>
            </h2>
          </BlurReveal>
        </div>
        <div className="footer-meta grid grid-cols-1 sm:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">Email</p>
            <p className="text-sm font-medium text-white">maya@studiomaya.design</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">Call Me</p>
            <button className="text-sm font-semibold text-white hover:opacity-60 transition-opacity">Book Now</button>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-3">Social</p>
            <div className="flex flex-wrap gap-2">
              {[["✕", "2,847"], ["◎", ""], ["◉", ""], ["⬡", ""], ["in", ""]].map(([icon, label], i) => (
                <button key={i} className="h-8 px-3 rounded-full border border-white/20 text-white text-xs flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                  {icon}{label && <span className="text-white/60">{label}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-meta grid grid-cols-2 sm:grid-cols-3 gap-8 py-8 border-b border-white/10">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-4">Menu</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {["Work", "Services", "Pricing", "Blog"].map((l) => (
                <button key={l} className="text-sm text-white/50 hover:text-white transition-colors text-left">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-4">Legal</p>
            <div className="flex flex-col gap-2">
              {["Terms of service", "Privacy Policy"].map((l) => (
                <button key={l} className="text-sm font-semibold text-white/50 hover:text-white transition-colors text-left">{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end col-span-2 sm:col-span-1">
            <p className="text-xs text-white/20">© 2026 Maya Chen</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden" style={{ lineHeight: 0.82, marginTop: 8 }}>
        <span className="font-black text-white select-none block text-center" style={{ fontSize: "clamp(80px, 18vw, 260px)", opacity: 0.06, letterSpacing: "-0.04em" }}>
          MAYA
        </span>
      </div>
    </footer>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────
export function LaunchfolioPortfolioPage() {
  const [isDark, setIsDark] = React.useState(false);
  const toggle = React.useCallback(() => setIsDark((v) => !v), []);
  const t = isDark ? DARK : LIGHT;
  const theme: TC = { ...t, isDark, toggle };

  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const id = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(id); document.documentElement.style.scrollBehavior = ""; };
  }, []);

  return (
    <ThemeCtx.Provider value={theme}>
      <div
        className="lf-root relative"
        style={{
          backgroundColor: t.bg,
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent calc(100%/12 - 1px), ${t.gridLine} calc(100%/12 - 1px), ${t.gridLine} calc(100%/12))`,
          minHeight: "100vh",
          transition: "background-color 0.3s ease",
        }}
      >
        <DotCursor />
        <Nav />
        <HeroAndProjectsSection />
        <TestimonialSection />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="pt-8 pb-6 border-t"
          style={{ background: "transparent", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}
        >
          <Marquee items={LOGOS} />
        </motion.div>
        <ServicesSection />
        <AboutSection />
        <PricingSection />
        <TrustedBySection />
        <TestimonialsGridSection />
        <FAQSection />
        <BlogSection />
        <SiteFooter />
      </div>
    </ThemeCtx.Provider>
  );
}

export default LaunchfolioPortfolioPage;
