"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Instagram, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

const projectCards = [
  {
    name: "CREATIVE PULSE",
    category: "UI, UX DEVELOPMENT",
    label: "VISION CRAFT",
    size: "h-[62vh] max-h-[680px] w-[70vw] max-w-[470px]",
    from: [-84, 54, -10],
    mid: [-8, -2, 0],
    out: [-24, -54, -5],
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "DESIGN SURGE",
    category: "LOGO, USER INTERFACE",
    label: "LOGO, USER INTERFACE",
    size: "h-[38vh] max-h-[390px] w-[86vw] max-w-[720px]",
    from: [90, 46, 7],
    mid: [14, 8, -2],
    out: [-54, -28, 5],
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "VISION CRAFT",
    category: "LOGO, USER INTERFACE",
    label: "BRAND SYSTEM",
    size: "h-[46vh] max-h-[480px] w-[72vw] max-w-[650px]",
    from: [82, 2, 8],
    mid: [4, -2, 1],
    out: [-40, -20, -8],
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "BRAND BLOOM",
    category: "UI, UX DEVELOPMENT",
    label: "ART DIRECTION",
    size: "h-[42vh] max-h-[430px] w-[42vh] max-w-[430px]",
    from: [-78, -38, -8],
    mid: [-18, -18, 4],
    out: [48, -58, 8],
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "IMPACT EDGE",
    category: "FONT, USER INTERFACE",
    label: "DIGITAL CAMPAIGN",
    size: "h-[48vh] max-h-[520px] w-[68vw] max-w-[640px]",
    from: [78, 58, 4],
    mid: [8, 14, -3],
    out: [-34, -42, 7],
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "DARK SIGNAL",
    category: "BRAND SYSTEM",
    label: "WEB DESIGN",
    size: "h-[52vh] max-h-[560px] w-[46vw] max-w-[430px]",
    from: [-70, 42, 5],
    mid: [-22, 10, -4],
    out: [28, -46, 2],
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "NOISE FIELD",
    category: "ART DIRECTION",
    label: "ABSTRACT TEXTURE",
    size: "h-[30vh] max-h-[320px] w-[34vw] max-w-[360px]",
    from: [60, -46, -6],
    mid: [26, -24, 5],
    out: [-58, -10, -4],
    image:
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "MONO FRAME",
    category: "EDITORIAL",
    label: "FASHION SYSTEM",
    size: "h-[58vh] max-h-[610px] w-[44vw] max-w-[420px]",
    from: [-68, -4, 7],
    mid: [-6, -8, -1],
    out: [42, -60, 5],
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "CORE MARK",
    category: "LOGO SYSTEM",
    label: "MINIMAL SYMBOL",
    size: "h-[34vh] max-h-[360px] w-[34vh] max-w-[360px]",
    from: [74, -18, 8],
    mid: [22, -8, -5],
    out: [-44, -40, 6],
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "CIVIC CUT",
    category: "WEB DESIGN",
    label: "WIDE BRAND IMAGE",
    size: "h-[36vh] max-h-[390px] w-[88vw] max-w-[820px]",
    from: [-88, 24, -5],
    mid: [0, 18, 2],
    out: [54, -30, -7],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
];

const galleryTiles = [
  {
    className: "noir-gallery-tall",
    image:
      "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=900&q=85",
  },
  {
    className: "noir-gallery-logo",
    logo: true,
  },
  {
    className: "noir-gallery-portrait",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
  },
  {
    className: "noir-gallery-medium",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
  {
    className: "noir-gallery-lines",
    lines: true,
  },
  {
    className: "noir-gallery-wide",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=85",
  },
];

const team = [
  {
    name: "Ethan",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
  },
  {
    name: "Daniel",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85",
  },
  {
    name: "Sophia",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
  },
  {
    name: "Olivia",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=85",
  },
  {
    name: "Liam",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=85",
  },
  {
    name: "Alexander",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85",
  },
];

function useLenis() {
  React.useEffect(() => {
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let rafId = 0;

    import("@studio-freight/lenis")
      .then((mod) => {
        const LenisClass = (mod.default ?? (mod as { Lenis?: unknown }).Lenis) as new (options: {
          lerp: number;
          duration: number;
          smoothWheel: boolean;
        }) => { raf: (time: number) => void; destroy: () => void };
        lenis = new LenisClass({ lerp: 0.1, duration: 1.2, smoothWheel: true });

        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {});

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}

function CustomCursor() {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 140, damping: 28, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 140, damping: 28, mass: 0.35 });

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      rawX.set(event.clientX - 5);
      rawY.set(event.clientY - 5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden size-2.5 rounded-full bg-white mix-blend-difference md:block"
      style={{ x, y }}
    />
  );
}

function Socials({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <Instagram className="size-[22px]" strokeWidth={1.5} />
      <X className="size-[22px]" strokeWidth={1.5} />
      <Send className="size-[22px]" strokeWidth={1.5} />
      <MessageCircle className="size-[22px]" strokeWidth={1.5} />
    </div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PillButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-full bg-black px-8 py-4 text-[13px] font-medium uppercase tracking-[0.05em] text-white transition hover:scale-[1.02]"
    >
      {children}
    </button>
  );
}

function EclipseGlyph() {
  return (
    <span className="noir-glyph" aria-hidden>
      <span />
    </span>
  );
}

function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const planetScale = useTransform(scrollYProgress, [0, 1], [1, 1.42]);
  const planetY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.48, 0.72], [0.72, 0.38, 0]);
  const navOpacity = useTransform(scrollYProgress, [0, 0.22, 0.4], [1, 0.45, 0]);
  const wordScale = useTransform(scrollYProgress, [0, 0.22, 0.52, 0.78, 1], [1, 3.2, 7.6, 12.5, 16.5]);
  const wordX = useTransform(scrollYProgress, [0, 0.22, 0.52, 1], ["0vw", "18vw", "34vw", "44vw"]);
  const wordY = useTransform(scrollYProgress, [0, 0.22, 0.52, 1], ["0vh", "-8vh", "-19vh", "-27vh"]);

  return (
    <section ref={ref} className="relative h-[280vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <motion.nav
          className="absolute inset-x-0 top-0 z-30 grid grid-cols-2 gap-6 px-6 pt-8 text-white md:grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr_1fr] md:px-[60px] md:pt-10"
          style={{ opacity: navOpacity }}
        >
          <div className="text-[22px] font-medium uppercase leading-none">
            NOIR <sup className="text-[11px]">®</sup>
          </div>
          <div className="hidden text-[13px] font-medium uppercase leading-[1.35] tracking-[0.05em] text-white/80 md:block">
            <p>BUILDING LASTING</p>
            <p>DIGITAL CONNECTIONS</p>
          </div>
          <div className="hidden flex-col gap-1 text-base font-light uppercase md:flex">
            <span>HOME</span>
            <span>ABOUT</span>
            <span>WORK</span>
          </div>
          <div className="hidden flex-col gap-1 text-base font-light uppercase md:flex">
            <span>CONTACT</span>
            <span>PRICING</span>
            <span>NEWS</span>
          </div>
          <Socials className="justify-end text-white" />
        </motion.nav>

        <motion.div
          className="absolute left-[58%] top-[51%] z-0 w-[84vw] max-w-[1020px] -translate-x-1/2 -translate-y-1/2 md:w-[55vw]"
          style={{ scale: planetScale, y: planetY, opacity: planetOpacity }}
        >
          <motion.img
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=90"
            alt="Grayscale planet surface"
            className="w-full rounded-full object-cover opacity-80 mix-blend-screen blur-[0.2px]"
          />
        </motion.div>
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_55%,transparent_0,transparent_20%,#000_60%)] opacity-70" />

        <motion.div
          className="absolute inset-x-0 bottom-[-1vh] z-10 origin-center text-center text-white"
          style={{ scale: wordScale, x: wordX, y: wordY }}
        >
          <div className="noir-hero-word">
            <div>NOIR</div>
            <div>STUDIO</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StudioIntro() {
  return (
    <section className="bg-white px-6 py-[150px] text-black md:pb-[150px] md:pt-[200px]">
      <div className="mx-auto max-w-[760px]">
        {[
          <>
            <strong>We are a creative agency</strong> <span>focused on</span>{" "}
            <strong>building, launching, and revitalizing brands.</strong>
          </>,
          <>
            <span>This agency specializes in</span> <strong>building, launching, and revitalizing</strong>{" "}
            <span>brand identities.</span>
          </>,
          <>
            <span>With a creative approach,</span> <strong>our studio delivers impactful branding solutions</strong>{" "}
            <span>tailored to each client.</span>
          </>,
        ].map((copy, index) => (
          <Reveal key={index} delay={index * 0.15} className="mt-10 first:mt-0">
            <p className="noir-intro-copy">{copy}</p>
          </Reveal>
        ))}
        <Reveal delay={0.45} className="mt-[60px] text-center">
          <PillButton>MORE ABOUT OUR STUDIO</PillButton>
        </Reveal>
      </div>
    </section>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function ProjectCard({ index }: { index: number }) {
  const card = projectCards[index];
  const fallbackProgress = useMotionValue(0);
  const stackRef = React.useContext(StackProgressContext) ?? fallbackProgress;
  const start = 0.17 + index * 0.055;
  const settle = start + 0.14;
  const exit = Math.min(0.92, settle + 0.28);
  const opacity = useTransform(stackRef, (p) => {
    if (p < start) return 0;
    if (p > 0.9 && index < projectCards.length - 3) return Math.max(0.14, 1 - (p - 0.9) * 7);
    return Math.min(1, (p - start) / Math.max(settle - start, 0.001));
  });
  const transform = useTransform(stackRef, (p) => {
    const enter = clamp((p - start) / Math.max(settle - start, 0.001));
    const leave = clamp((p - settle) / Math.max(exit - settle, 0.001));
    const x = lerp(card.from[0], card.mid[0], enter) + (card.out[0] - card.mid[0]) * leave;
    const y = lerp(card.from[1], card.mid[1], enter) + (card.out[1] - card.mid[1]) * leave;
    const rotate = lerp(card.from[2], card.mid[2], enter) + (card.out[2] - card.mid[2]) * leave;
    const scale = 0.82 + enter * 0.25 - leave * 0.08 + (index % 3) * 0.01;
    return `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, 0) scale(${scale}) rotate(${rotate}deg)`;
  });
  const labelOpacity = useTransform(stackRef, [start, start + 0.05, exit], [0, 1, 0.35]);

  return (
    <motion.div
      className={cn(
        "absolute left-1/2 top-1/2 overflow-hidden bg-neutral-800 shadow-[0_30px_80px_rgba(0,0,0,0.36)] will-change-transform",
        card.size,
      )}
      style={{ transform, opacity, zIndex: 10 + index }}
    >
      <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/10" />
      <motion.div
        className="absolute bottom-4 left-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white"
        style={{ opacity: labelOpacity }}
      >
        {card.label}
      </motion.div>
    </motion.div>
  );
}

const StackProgressContext = React.createContext<MotionValue<number> | null>(null);

function SelectedWork() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const titleOpacity = useTransform(scrollYProgress, [0.02, 0.14, 0.23, 0.33], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0.02, 0.14], [40, 0]);
  const bg = useTransform(scrollYProgress, [0, 0.12, 0.78, 0.95], ["#ffffff", "#000000", "#000000", "#ffffff"]);
  const stickyBg = useTransform(scrollYProgress, [0, 0.12, 0.78, 0.95], ["#ffffff", "#000000", "#000000", "#ffffff"]);
  const ghostOpacity = useTransform(scrollYProgress, [0.62, 0.76, 0.95], [0, 0.18, 1]);
  const ghostX = useTransform(scrollYProgress, [0.62, 0.95], ["14vw", "-8vw"]);
  const labelColor = useTransform(scrollYProgress, [0.8, 0.95], ["#ffffff", "#000000"]);
  const activeIndex = useTransform(scrollYProgress, (p) =>
    Math.min(projectCards.length - 1, Math.max(0, Math.floor((p - 0.2) / 0.064))),
  );
  const [labelIndex, setLabelIndex] = React.useState(0);

  React.useEffect(() => {
    return activeIndex.on("change", (value) => setLabelIndex(Math.round(value)));
  }, [activeIndex]);

  return (
    <motion.section ref={ref} className="relative h-[620vh]" style={{ backgroundColor: bg }}>
      <motion.div className="sticky top-0 h-screen overflow-hidden text-white" style={{ backgroundColor: stickyBg }}>
        <motion.h2
          className="noir-section-title absolute left-1/2 top-1/2 z-20 w-full -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          SELECTED — WORK
        </motion.h2>
        <motion.div
          className="pointer-events-none absolute left-0 top-[42%] z-[1] whitespace-nowrap font-black uppercase leading-none tracking-[-0.07em] text-black"
          style={{ opacity: ghostOpacity, x: ghostX, fontSize: "clamp(5rem, 17vw, 18rem)" }}
        >
          Branding ◎ Web Design
        </motion.div>
        <StackProgressContext.Provider value={scrollYProgress}>
          <div className="absolute inset-0">
            {projectCards.map((_, index) => (
              <ProjectCard key={index} index={index} />
            ))}
          </div>
        </StackProgressContext.Provider>
        <div className="absolute inset-x-6 bottom-8 z-30 flex justify-between text-[13px] font-medium uppercase tracking-[0.1em] text-white md:inset-x-[60px]">
          <motion.span key={`name-${labelIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: labelColor }}>
            {projectCards[labelIndex]?.name}
          </motion.span>
          <motion.span key={`cat-${labelIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: labelColor }}>
            {projectCards[labelIndex]?.category}
          </motion.span>
        </div>
      </motion.div>
    </motion.section>
  );
}

function Marquee({
  children,
  reverse = false,
  speed = "60s",
  className,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  speed?: string;
  className?: string;
}) {
  return (
    <div className={cn("noir-marquee overflow-hidden", className)} style={{ "--speed": speed } as React.CSSProperties}>
      <div className={cn("noir-marquee-track", reverse && "noir-marquee-reverse")}>
        <div className="noir-marquee-unit">{children}</div>
        <div className="noir-marquee-unit" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

function BrandingMarquee() {
  return (
    <section className="bg-white py-20 text-black">
      <Marquee speed="60s" className="h-[50vh] min-h-[300px]">
        <div className="flex items-center gap-10 whitespace-nowrap text-[90px] font-black leading-none tracking-[-0.05em] sm:text-[160px] lg:text-[280px]">
          <span>Branding</span>
          <EclipseGlyph />
          <span>Web Design</span>
          <EclipseGlyph />
        </div>
      </Marquee>
    </section>
  );
}

function Gallery() {
  return (
    <section className="bg-white px-4 pb-[180px] text-black md:px-6">
      <div className="noir-gallery mx-auto max-w-[1500px]">
        {galleryTiles.map((tile, index) => (
          <Reveal key={index} delay={index * 0.08} className={tile.className}>
            <div className="h-full min-h-[220px] overflow-hidden bg-neutral-200">
              {tile.logo ? (
                <div className="flex h-full items-center justify-center bg-neutral-300">
                  <div className="size-32 rounded-full border-[18px] border-white" />
                </div>
              ) : tile.lines ? (
                <div className="h-full bg-[repeating-linear-gradient(90deg,#c8c8c8_0,#c8c8c8_3px,#eeeeee_3px,#eeeeee_14px)]" />
              ) : (
                <img src={tile.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="bg-white px-6 pb-[120px] text-black">
      <h2 className="noir-section-title text-center">THE — TEAM</h2>
      <Reveal className="mx-auto mt-16 max-w-[1320px] text-center">
        <p className="noir-team-line">
          {team.map((person, index) => (
            <React.Fragment key={person.name}>
              <span>{person.name}</span>
              <img src={person.image} alt={person.name} />
              {index < team.length - 1 ? <span>, </span> : null}
            </React.Fragment>
          ))}
        </p>
        <div className="mt-16">
          <PillButton>MORE ABOUT OUR STUDIO</PillButton>
        </div>
      </Reveal>
    </section>
  );
}

function LogoMarquee() {
  const logos = ["NOIR", "Albor", "Bilg", "DEEI", "CUBB", "di", "KIKU", "R", "MC"];
  return (
    <section className="bg-white py-10 text-black">
      <Marquee reverse speed="40s">
        <div className="flex h-20 items-center gap-[100px] whitespace-nowrap text-[40px] font-black tracking-[-0.04em] text-neutral-900">
          {[...logos, ...logos].map((logo, index) => (
            <span key={`${logo}-${index}`}>{logo}</span>
          ))}
        </div>
      </Marquee>
    </section>
  );
}

function LatestNews() {
  const rows = [
    { text: "Understanding Framer CMS", reverse: false, dark: false, speed: "30s" },
    { text: "SEO Strategies for 2024", reverse: true, dark: false, speed: "35s" },
    { text: "Content Marketing Strategies", reverse: false, dark: true, speed: "28s" },
    { text: "Social Media Marketing Tips", reverse: true, dark: true, speed: "33s" },
  ];

  return (
    <section className="bg-white px-4 py-[160px] text-black md:px-6">
      <h2 className="noir-section-title text-center">LATEST — NEWS</h2>
      <div className="mx-auto mt-16 max-w-[1500px] space-y-1">
        {rows.map((row) => (
          <Marquee
            key={row.text}
            reverse={row.reverse}
            speed={row.speed}
            className={cn("h-[54px]", row.dark && "rounded-full bg-black text-white")}
          >
            <div className="flex items-center gap-5 whitespace-nowrap px-6 text-[28px] font-medium">
              {Array.from({ length: 8 }).map((_, index) => (
                <React.Fragment key={index}>
                  <span>{row.text}</span>
                  <span>•</span>
                </React.Fragment>
              ))}
            </div>
          </Marquee>
        ))}
      </div>
    </section>
  );
}

function FooterOutro() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const thumbs = [...projectCards.slice(0, 7), ...projectCards.slice(0, 7)];

  return (
    <footer ref={ref} className="overflow-hidden bg-black px-0 pt-10 text-center text-white">
      <Marquee speed="34s" className="border-y border-white/10 py-4">
        <div className="flex items-center gap-4 px-4">
          {thumbs.map((card, index) => (
            <img
              key={`${card.name}-${index}`}
              src={card.image}
              alt=""
              className="h-24 w-36 object-cover opacity-85 md:h-32 md:w-52"
            />
          ))}
        </div>
      </Marquee>
      <div className="mx-auto flex min-h-[46vh] max-w-4xl flex-col items-center justify-center px-6">
        <Reveal>
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/55">CONTACT US</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 text-[clamp(4rem,12vw,11rem)] font-black uppercase leading-none tracking-[-0.08em]">
            LET&apos;S TALK
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-8 flex size-14 items-center justify-center rounded-full border border-white/25 text-xl transition hover:bg-white hover:text-black"
            aria-label="Back to top"
          >
            ↑
          </button>
        </Reveal>
        <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
          COPYRIGHT © NOIR — CREATIVE SYSTEMS
        </p>
      </div>
      <div className="h-[46vh] overflow-hidden">
        <motion.div className="origin-bottom text-white" style={{ scale, y }}>
          <div className="noir-outro-word">
            <div>NOIR</div>
            <div>STUDIO</div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function NoirStudioTemplatePage() {
  useLenis();

  return (
    <main className="noir-template min-h-screen bg-black">
      <CustomCursor />
      <Hero />
      <StudioIntro />
      <SelectedWork />
      <BrandingMarquee />
      <Gallery />
      <TeamSection />
      <LogoMarquee />
      <LatestNews />
      <FooterOutro />
      <style jsx global>{`
        .noir-template {
          cursor: none;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .noir-hero-word,
        .noir-outro-word {
          font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
          font-size: clamp(7.2rem, 26vw, 34rem);
          font-weight: 900;
          line-height: 0.72;
          letter-spacing: -0.055em;
          text-transform: uppercase;
          transform: translateZ(0) scaleX(0.52);
          will-change: transform;
        }
        .noir-outro-word {
          font-size: clamp(8rem, 29vw, 38rem);
        }
        .noir-section-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(3.6rem, 11vw, 11rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.075em;
        }
        .noir-intro-copy {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2.55rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.055em;
        }
        .noir-intro-copy span {
          color: #b0b0b0;
        }
        .noir-intro-copy strong {
          color: #000;
          font-weight: 900;
        }
        .noir-marquee-track {
          display: flex;
          width: max-content;
          min-width: 200%;
          animation: noir-marquee var(--speed, 40s) linear infinite;
          will-change: transform;
        }
        .noir-marquee-reverse {
          animation-name: noir-marquee-reverse;
        }
        .noir-marquee-unit {
          display: flex;
          align-items: center;
          min-width: max-content;
        }
        .noir-glyph {
          position: relative;
          display: inline-flex;
          width: 0.78em;
          height: 0.78em;
          flex: 0 0 auto;
          border-radius: 999px;
          background: #000;
        }
        .noir-glyph span {
          position: absolute;
          right: 11%;
          top: 0;
          width: 64%;
          height: 100%;
          border-radius: 999px;
          background: #fff;
        }
        .noir-gallery {
          display: grid;
          grid-template-columns: 1.08fr 0.9fr 1fr 0.86fr 1.35fr;
          grid-auto-rows: 160px;
          gap: 16px;
        }
        .noir-gallery-tall {
          grid-row: span 4;
        }
        .noir-gallery-logo {
          grid-row: span 2;
        }
        .noir-gallery-portrait {
          grid-row: span 3;
        }
        .noir-gallery-medium {
          grid-row: span 4;
        }
        .noir-gallery-lines {
          grid-row: span 2;
        }
        .noir-gallery-wide {
          grid-row: span 3;
        }
        .noir-team-line {
          font-size: clamp(3.5rem, 8.8vw, 7.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.075em;
        }
        .noir-team-line img {
          display: inline-block;
          width: clamp(5.6rem, 10vw, 8.75rem);
          height: clamp(4.2rem, 7.2vw, 6.25rem);
          margin: 0 0.08em;
          object-fit: cover;
          vertical-align: middle;
          filter: saturate(0.9);
        }
        @keyframes noir-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes noir-marquee-reverse {
          from {
            transform: translate3d(-50%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
        @media (max-width: 900px) {
          .noir-template {
            cursor: auto;
          }
          .noir-gallery {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 140px;
          }
          .noir-gallery-wide,
          .noir-gallery-tall,
          .noir-gallery-medium {
            grid-column: span 2;
          }
          .noir-section-title {
            letter-spacing: -0.055em;
          }
        }
      `}</style>
    </main>
  );
}

export default NoirStudioTemplatePage;
export { NoirStudioTemplatePage };
