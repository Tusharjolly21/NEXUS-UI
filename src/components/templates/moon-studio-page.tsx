"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { Instagram, Send, MessageCircle, Phone, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES & DATA ───────────────────────────────────────────────────────────

interface CardData {
  title: string;
  category: string;
  image: string;
  desc: string;
}

const CARDS_DATA: CardData[] = [
  {
    title: "CREATIVE PULSE",
    category: "UI, UX DEVELOPMENT",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85",
    desc: "Person in white VR headset on vivid red background, cyan/blue duotone on figure, looking upward.",
  },
  {
    title: "DESIGN SURGE",
    category: "LOGO, USER INTERFACE",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=85",
    desc: "Outdoor billboard against bright blue cloudy sky, displaying NOVA brand visual, metal scaffolding.",
  },
  {
    title: "VISION CRAFT",
    category: "LOGO, USER INTERFACE",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
    desc: "Architectural product render on beige/tan background, sculptural paper-cone objects, soft studio lighting.",
  },
  {
    title: "BRAND BLOOM",
    category: "UI, UX DEVELOPMENT",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
    desc: "Warm-grey card with centered white embossed circular maze/coil logo (concentric rounded paths).",
  },
  {
    title: "IMPACT EDGE",
    category: "FONT, USER INTERFACE",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85",
    desc: "Dark studio render of black monitor displaying vivid red screen with white 'U' letterform, red panels behind.",
  },
];

const GALLERY_COLUMNS = [
  // Column 1: Tall Red VR Poster
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85",
    ratio: "tall",
    title: "NOVA VR Red Poster",
  },
  // Column 2: Two stacked (logo and portrait)
  {
    id: 2,
    stacked: [
      {
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
        ratio: "square-logo",
        title: "Embossed Logo Tile",
      },
      {
        image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
        ratio: "bw-portrait",
        title: "B&W Portrait of Woman",
      },
    ],
  },
  // Column 3: Medium Portrait
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    ratio: "medium",
    title: "Person in Teal holding Tan Sphere",
  },
  // Column 4: Barcode pattern tile
  {
    id: 4,
    ratio: "barcode",
    title: "Barcode Textured Square",
  },
  // Column 5: Wide Billboard
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=85",
    ratio: "wide",
    title: "Outdoor Cloud Billboard",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Ethan",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
    desc: "bearded, glasses, dark hair",
  },
  {
    name: "Daniel",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85",
    desc: "older, silver hair, clean-shaven",
  },
  {
    name: "Sophia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
    desc: "curly blonde hair, smiling",
  },
  {
    name: "Olivia",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=85",
    desc: "dark hair pulled back, neutral",
  },
  {
    name: "Liam",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=85",
    desc: "older bearded, longer grey hair",
  },
  {
    name: "Alexander",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85",
    desc: "short dark beard, dark skin",
  },
];

const CLIENT_LOGOS = [
  "NOVA",
  "Albor",
  "Bilg",
  "DEEI",
  "CUBB",
  "di",
  "KIKU",
  "R",
  "MC",
];

// ─── SMOOTH SCROLL HOOK ─────────────────────────────────────────────────────

function useLenis() {
  React.useEffect(() => {
    let lenis: any = null;
    let rafId = 0;

    import("@studio-freight/lenis")
      .then((mod) => {
        const LenisClass = (mod.default ?? (mod as any).Lenis) as any;
        lenis = new LenisClass({
          lerp: 0.08,
          duration: 1.3,
          smoothWheel: true,
          syncTouch: true,
        });

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

// ─── REVEAL TRANSITION COMPONENT ────────────────────────────────────────────

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
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Custom cursor component deleted as requested. Standard pointer restored.

// ─── SECTION 1: HERO ────────────────────────────────────────────────────────

function HeroSection({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeDropdown, setActiveDropdown] = React.useState<"studio" | "services" | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Planet scales linearly from 1.0 to 1.5 following the critical specification
  const planetScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 0.9, 1.0], [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]);
  
  // Text scales to much higher decoupled points (peak 80x) to make the stroke of "S" zoom right through the screen
  const textScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 0.9, 1.0], [1, 4, 12, 24, 48, 80]);
  
  // Mathematically perfect straight line displacement scaled for the 80x zoom, keeping the stroke of "S" locked in the center
  const textX = useTransform(textScale, (s) => `${-(s - 1) * 3.04}vw`);
  const textY = useTransform(textScale, (s) => `${-(s - 1) * 1.58}vh`);

  // Custom opacity mappings to smooth out the transition into Section 2
  const navOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.5, 0.95], [0.95, 0.6, 0]);

  // Black surroundings overlay opacity (fades to 0 to keep the vignette transparent as screen goes white)
  const surroundingsOpacity = useTransform(scrollYProgress, [0.70, 0.82], [1, 0]);

  // Dynamically transition the parent track's background to white to eliminate any black gaps when unpinning
  const trackBgColor = useTransform(scrollYProgress, [0.78, 0.88], ["#000000", "#ffffff"]);

  return (
    <motion.section ref={containerRef} style={{ backgroundColor: trackBgColor }} className="relative h-[300vh]">
      <motion.div style={{ backgroundColor: trackBgColor }} className="sticky top-0 h-screen w-full overflow-hidden select-none">
        
        {/* Navigation Bar (Glassmorphic and interactive mega dropdowns) */}
        <motion.nav
          className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 text-white md:grid md:grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr_1fr] md:px-[60px]"
          style={{ opacity: navOpacity }}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {/* Column 1: Logo */}
          <div className="font-sans text-[22px] font-black uppercase leading-none tracking-tight">
            NOVA <sup className="text-[11px]">®</sup>
          </div>
          
          {/* Column 2: Tagline */}
          <div className="hidden font-sans text-[13px] font-bold uppercase leading-[1.3] tracking-[0.05em] text-white md:block">
            <p>BUILDING LASTING</p>
            <p>DIGITAL CONNECTIONS</p>
          </div>
          
          {/* Dropdown 1: STUDIO (Mega Menu!) */}
          <div
            className="hidden flex-col gap-1 font-sans text-[14px] font-bold uppercase text-white md:flex relative"
            onMouseEnter={() => setActiveDropdown("studio")}
          >
            <span className="cursor-pointer hover:text-white/70 transition flex items-center gap-1.5">
              STUDIO <ChevronDown className="size-3.5 opacity-60" />
            </span>
            
            <AnimatePresence>
              {activeDropdown === "studio" && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 top-[130%] w-[520px] bg-black border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl z-50 text-left normal-case grid grid-cols-2 gap-8"
                >
                  <div className="flex flex-col gap-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                      OUR VISION & INSIGHTS
                    </span>
                    <a href="#about" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        OUR MISSION
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Building lasting digital connections since 2017.
                      </span>
                    </a>
                    <a href="#news" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        LATEST INSIGHTS
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        SEO, CMS, and marketing tips for 2026.
                      </span>
                    </a>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                      THE AGENCY & CAREERS
                    </span>
                    <a href="#team" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        THE TEAM
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Meet our world-class symmetrical agency team.
                      </span>
                    </a>
                    <a href="#contact" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition flex items-center gap-1.5">
                        CAREERS <span className="text-[8px] font-sans font-semibold tracking-wider bg-white text-black px-1.5 py-0.5 rounded-sm">HIRING</span>
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Join us to build state-of-the-art experiences.
                      </span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Dropdown 2: SERVICES (Mega Menu!) */}
          <div
            className="hidden flex-col gap-1 font-sans text-[14px] font-bold uppercase text-white md:flex relative"
            onMouseEnter={() => setActiveDropdown("services")}
          >
            <span className="cursor-pointer hover:text-white/70 transition flex items-center gap-1.5">
              SERVICES <ChevronDown className="size-3.5 opacity-60" />
            </span>
            
            <AnimatePresence>
              {activeDropdown === "services" && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 -translate-x-1/2 top-[130%] w-[520px] bg-black border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl z-50 text-left normal-case grid grid-cols-2 gap-8"
                >
                  <div className="flex flex-col gap-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                      DESIGN & IDENTITY
                    </span>
                    <a href="#about" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        STRATEGIC BRANDING
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Custom corporate colors, logos & design systems.
                      </span>
                    </a>
                    <a href="#work" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        WEB DESIGN & DEV
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Premium parallax, marquees and scroll zoom.
                      </span>
                    </a>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                      GROWTH & PLAN
                    </span>
                    <a href="#news" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        SEO & ADVOCACY
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Sustained organic traffic and performance growth.
                      </span>
                    </a>
                    <a href="#contact" className="group flex flex-col">
                      <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                        CUSTOM PACKAGES
                      </span>
                      <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Tailored plans built for your business scale.
                      </span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Column 5: Social icons on Desktop */}
          <div className="hidden md:flex items-start justify-end gap-4 text-white pt-1">
            <Instagram className="size-[22px] cursor-pointer hover:scale-110 transition" strokeWidth={1.5} />
            <Send className="size-[22px] cursor-pointer hover:scale-110 transition" strokeWidth={1.5} />
            <MessageCircle className="size-[22px] cursor-pointer hover:scale-110 transition" strokeWidth={1.5} />
            <Phone className="size-[22px] cursor-pointer hover:scale-110 transition" strokeWidth={1.5} />
          </div>

          {/* Hamburger button on Mobile */}
          <button
            onClick={onOpenMobileMenu}
            className="flex md:hidden p-2 border border-white/10 rounded-full bg-white/5 backdrop-blur hover:bg-white/10 transition mt-[-6px]"
          >
            <Menu className="size-5 text-white" />
          </button>
        </motion.nav>

        {/* Layer 1 — Planet background (Perfect circular grayscale rising behind the text, sized larger and positioned lower) */}
        <motion.div
          className="absolute left-1/2 top-[60%] z-0 w-[88vw] -translate-x-1/2 -translate-y-1/2 md:w-[52vw] aspect-square flex items-center justify-center"
          style={{ scale: planetScale, opacity: planetOpacity }}
        >
          {/* Using a high-res cratered lunar image */}
          <img
            src="https://images.unsplash.com/photo-1654263391025-4c4809a37f5c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="High-res planet view"
            className="w-full h-full rounded-full object-cover filter grayscale"
          />
          {/* Halo bleed overlay */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,1)_86%)] pointer-events-none" />
        </motion.div>

        {/* Pure black surroundings overlay (fades out as zoom intensifies to guarantee zero black borders) */}
        <motion.div
          className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_60%,transparent_40%,#000000_68%)] pointer-events-none"
          style={{ opacity: surroundingsOpacity }}
        />

        {/* Layer 2 — Giant display type (Single horizontal line, vertically and horizontally stretched, spanning edge-to-edge) */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 text-white flex justify-center items-end h-[70vh] pb-1"
          style={{
            scale: textScale,
            x: textX,
            y: textY,
            transformOrigin: "center center",
          }}
        >
          <div className="moon-hero-font leading-[0.72] font-black uppercase select-none w-full whitespace-nowrap text-center">
            NOVA<span className="inline-block w-[1.5vw]" />STUDIO
          </div>
        </motion.div>

      </motion.div>
    </motion.section>
  );
}

// ─── SECTION 2: INTRO ───────────────────────────────────────────────────────

function IntroParagraph({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Dynamic blur, scale, and slide scroll effect to continue the zoom feeling
  const opacity = useTransform(scrollYProgress, [0.0, 0.32, 0.68, 1.0], [0, 1, 1, 0]);
  const blurVal = useTransform(scrollYProgress, [0.0, 0.32, 0.68, 1.0], [15, 0, 0, 15]);
  const scale = useTransform(scrollYProgress, [0.0, 0.32, 0.68, 1.0], [0.93, 1, 1, 0.93]);
  const y = useTransform(scrollYProgress, [0.0, 0.32, 0.68, 1.0], [50, 0, 0, -50]);
  const filter = useTransform(blurVal, (b) => `blur(${b}px)`);

  return (
    <motion.p
      ref={ref}
      style={{ opacity, filter, y, scale }}
      className="moon-serif-font text-[44px] md:text-[52px] leading-[1.15] tracking-[-0.035em] text-neutral-400 mt-12 first:mt-0 origin-center"
    >
      {children}
    </motion.p>
  );
}

function IntroSection() {
  return (
    <section id="about" className="bg-white px-6 pt-32 pb-[150px] text-black relative z-10">
      <div className="mx-auto max-w-[720px] text-left">
        <IntroParagraph>
          <strong>NOVA®</strong> founded in <strong>2017,</strong> this agency focuses on <strong>building, launching, and revitalizing brands.</strong>
        </IntroParagraph>
        <IntroParagraph>
          <strong>This agency</strong> specializes in <strong>building, launching, and revitalizing brand identities.</strong>
        </IntroParagraph>
        <IntroParagraph>
          <strong>With a creative approach,</strong> our studio delivers impactful <strong>branding</strong> solutions tailored to <strong>each client.</strong>
        </IntroParagraph>

        <Reveal delay={0.2} className="mt-[80px]">
          <button
            type="button"
            className="rounded-full bg-black px-8 py-4 font-sans text-[13px] font-semibold uppercase tracking-[0.05em] text-white transition-transform duration-300 hover:scale-[1.03]"
          >
            MORE ABOUT OUR STUDIO
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// ─── SECTION 3: SELECTED WORK (ALTERNATING ZIGZAG & PARALLAX SCROLL) ───────

const PEEKING_ROWS_DATA = [
  {
    title: "CREATIVE PULSE",
    category: "UI, UX DEVELOPMENT",
    mainImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85",
    leftImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85",
    rightImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "DESIGN SURGE",
    category: "LOGO, USER INTERFACE",
    mainImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=85",
    leftImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    rightImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "VISION CRAFT",
    category: "LOGO, USER INTERFACE",
    mainImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
    leftImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85",
    rightImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "IMPACT EDGE",
    category: "FONT, USER INTERFACE",
    mainImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85",
    leftImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85",
    rightImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
];

function PeekingCardRow({
  row,
  index,
}: {
  row: typeof PEEKING_ROWS_DATA[0];
  index: number;
}) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  
  // Local scroll tracking for parallax entry/exit and scale/opacity reveals
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  // Dynamic parallax transforms (floats upwards, scales slightly up, and fades in/out)
  const y = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [120, 0, 0, -120]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0.88, 1, 1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const isLeft = index % 2 === 0;

  return (
    <div
      ref={rowRef}
      className="min-h-screen md:h-screen w-full flex items-center px-6 md:px-[12%] py-16 md:py-0 relative select-none overflow-hidden"
    >
      <motion.div
        style={{ y, scale, opacity }}
        className={cn(
          "w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24",
          isLeft ? "md:flex-row" : "md:flex-row-reverse"
        )}
      >
        
        {/* Card Group Container */}
        <div className="relative w-[78vw] max-w-[360px] md:max-w-[400px] aspect-[3/4] cursor-pointer">
          <motion.div
            className="relative w-full h-full"
            whileHover="hovered"
            initial="initial"
          >
            
            {/* Left Peeking Card (slides left & tilts on hover) */}
            <motion.div
              className="absolute inset-0 bg-neutral-900 border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none overflow-hidden origin-bottom-left"
              variants={{
                initial: { x: "0%", rotate: 0, scale: 0.95, opacity: 0.8 },
                hovered: { x: "-58%", rotate: -10, scale: 0.95, opacity: 1 },
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 10 }}
            >
              <img src={row.leftImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Right Peeking Card (slides right & tilts on hover) */}
            <motion.div
              className="absolute inset-0 bg-neutral-900 border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none overflow-hidden origin-bottom-right"
              variants={{
                initial: { x: "0%", rotate: 0, scale: 0.95, opacity: 0.8 },
                hovered: { x: "58%", rotate: 10, scale: 0.95, opacity: 1 },
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 10 }}
            >
              <img src={row.rightImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Center Main Card */}
            <motion.div
              className="absolute inset-0 bg-neutral-900 border border-neutral-800 shadow-[0_30px_70px_rgba(0,0,0,0.6)] select-none overflow-hidden"
              variants={{
                initial: { scale: 1 },
                hovered: { scale: 1.03 },
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 20 }}
            >
              <div className="relative w-full h-full overflow-hidden">
                <img src={row.mainImage} alt={row.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Text Metadata Block (Zigzag balanced!) */}
        <div className="flex flex-col text-left max-w-sm md:max-w-md w-full select-none">
          <Reveal>
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-500">
              0{index + 1} / 04 — SELECTED WORK
            </span>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h3 className="moon-serif-font text-[44px] md:text-[56px] font-black uppercase text-white leading-none mt-4 hover:text-neutral-400 transition cursor-pointer">
              {row.title}
            </h3>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="font-sans text-[13px] uppercase tracking-[0.15em] font-bold text-neutral-400 mt-4 leading-relaxed">
              {row.category}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 h-[1px] w-24 bg-neutral-800" />
          </Reveal>
        </div>

      </motion.div>
    </div>
  );
}

function SelectedWorkSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Transitions the global background from white to black as Section 3 enters the screen
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  const bgColor = useTransform(scrollYProgress, [0, 0.95], ["#ffffff", "#000000"]);

  return (
    <motion.section
      id="work"
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className="relative text-white select-none transition-colors duration-300"
    >
      
      {/* SELECTED — WORK Section Header */}
      <div className="w-full flex items-center justify-center pt-28 pb-12 px-6">
        <Reveal>
          <h2 className="moon-serif-font text-[64px] sm:text-[100px] md:text-[140px] leading-none font-bold text-white text-center tracking-tight">
            SELECTED — WORK
          </h2>
        </Reveal>
      </div>

      {/* 4 alternating parallax rows, one card in each row */}
      <div className="flex flex-col">
        {PEEKING_ROWS_DATA.map((row, index) => (
          <PeekingCardRow key={row.title} row={row} index={index} />
        ))}
      </div>

    </motion.section>
  );
}

// ─── SECTION 4: HORIZONTAL ECLIPSING MARQUEE ────────────────────────────────

function MarqueeSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Background fades black to white over 30vh (roughly start of entry)
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.25],
    ["#000000", "#ffffff"]
  );

  // Velocity scroll based acceleration
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const velocitySpring = useSpring(scrollVelocity, { stiffness: 120, damping: 25 });
  const scaleSpeed = useTransform(velocitySpring, [-1500, 0, 1500], [2.2, 1.0, 2.2]);

  return (
    <motion.section
      ref={containerRef}
      className="py-[100px] overflow-hidden select-none"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full flex items-center justify-center h-[50vh] min-h-[260px] bg-white border-y border-neutral-100">
        
        {/* Infinite Moving Loop Banner (Pauses on Hover) */}
        <div className="w-full overflow-hidden flex whitespace-nowrap marquee-container">
          <motion.div
            className="flex items-center gap-12 text-[140px] md:text-[220px] font-black uppercase text-black font-sans leading-none tracking-[-0.04em]"
            style={{ scaleY: scaleSpeed }}
          >
            {/* Infinite scrolling track */}
            <div className="marquee-rl-track" style={{ "--speed": "48s" } as React.CSSProperties}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <span>BRANDING</span>
                  {/* Eclipse Glyph: custom circular cutout */}
                  <span className="relative inline-block mx-12 size-20 md:size-28 bg-black rounded-full overflow-hidden self-center">
                    <span className="absolute right-0 top-0 size-full bg-white rounded-full translate-x-[36%] -translate-y-[15%]" />
                  </span>
                  <span>WEB DESIGN</span>
                  <span className="relative inline-block mx-12 size-20 md:size-28 bg-black rounded-full overflow-hidden self-center">
                    <span className="absolute right-0 top-0 size-full bg-white rounded-full translate-x-[36%] -translate-y-[15%]" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
}

// ─── SECTION 5: ASYMMETRIC IMAGE GALLERY ────────────────────────────────────

function GallerySection() {
  return (
    <section className="bg-white px-4 md:px-6 py-[120px] text-black">
      <div className="mx-auto max-w-[1500px]">
        
        {/* 5-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr_1fr_0.8fr_1.3fr] gap-4 auto-rows-[160px] md:auto-rows-[180px]">
          
          {/* Column 1: Tall Red VR Poster */}
          <Reveal className="row-span-4 bg-neutral-100 overflow-hidden relative group">
            <img
              src={GALLERY_COLUMNS[0].image}
              alt={GALLERY_COLUMNS[0].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            {/* Top Text Wordmark Overlay */}
            <div className="absolute top-6 left-6 font-sans text-2xl font-black text-white tracking-widest leading-none drop-shadow">
              NOVA
            </div>
          </Reveal>

          {/* Column 2: Two stacked blocks (Logo and B&W portrait) */}
          <div className="row-span-4 flex flex-col gap-4">
            {/* Top: Square Logo Tile */}
            <Reveal className="flex-1 bg-neutral-200 overflow-hidden relative group">
              <img
                src={GALLERY_COLUMNS[1].stacked?.[0].image}
                alt={GALLERY_COLUMNS[1].stacked?.[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </Reveal>
            {/* Bottom: B&W Portrait of Woman */}
            <Reveal className="flex-1 bg-neutral-100 overflow-hidden relative group">
              <img
                src={GALLERY_COLUMNS[1].stacked?.[1].image}
                alt={GALLERY_COLUMNS[1].stacked?.[1].title}
                className="w-full h-full object-cover filter grayscale transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </Reveal>
          </div>

          {/* Column 3: Person in Teal holding Sphere */}
          <Reveal className="row-span-4 bg-neutral-100 overflow-hidden group">
            <img
              src={GALLERY_COLUMNS[2].image}
              alt={GALLERY_COLUMNS[2].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </Reveal>

          {/* Column 4: Barcode pattern square */}
          <Reveal className="row-span-4 flex flex-col items-center justify-center p-6 bg-neutral-50 overflow-hidden border border-neutral-100">
            {/* CSS repeating line pattern - mimicking a barcode */}
            <div className="w-full h-full opacity-65 flex items-center justify-center">
              <div 
                className="w-[85%] h-[80%] bg-[repeating-linear-gradient(90deg,#000_0px,#000_4px,transparent_4px,transparent_16px,#000_16px,#000_18px,transparent_18px,transparent_28px)]"
                aria-hidden="true"
              />
            </div>
          </Reveal>

          {/* Column 5: Wide Cloud Billboard */}
          <Reveal className="row-span-4 bg-neutral-100 overflow-hidden group">
            <img
              src={GALLERY_COLUMNS[4].image}
              alt={GALLERY_COLUMNS[4].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </Reveal>

        </div>

      </div>
    </section>
  );
}

// ─── SECTION 6: "THE — TEAM" ────────────────────────────────────────────────

function TeamSection() {
  return (
    <section id="team" className="bg-white px-6 py-[140px] pb-[160px] text-black border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px]">
        
        {/* Section Headline */}
        <Reveal className="text-center mb-20">
          <h2 className="moon-serif-font text-[100px] md:text-[140px] leading-none font-bold uppercase select-none tracking-tight">
            THE — TEAM
          </h2>
        </Reveal>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {TEAM_MEMBERS.map((member, i) => (
            <Reveal key={member.name} delay={(i % 2) * 0.1}>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-8 group cursor-pointer">
                
                {/* Name on the Left */}
                <div className="flex flex-col">
                  <span className="moon-serif-font text-[36px] md:text-[48px] font-black uppercase text-black group-hover:text-neutral-500 transition-colors duration-300">
                    {member.name}
                  </span>
                  <span className="font-sans text-[12px] uppercase tracking-[0.15em] text-neutral-400 mt-1 font-medium">
                    {member.desc}
                  </span>
                </div>

                {/* Photo beside right of name (Vertical aspect ratio to frame headshots evenly without cutting off heads) */}
                <div className="w-[95px] md:w-[115px] h-[120px] md:h-[150px] overflow-hidden bg-neutral-300 border border-neutral-200 flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center filter grayscale group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-500"
                  />
                </div>

              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="text-center mt-20">
          <button
            type="button"
            className="rounded-full bg-black px-8 py-4 font-sans text-[13px] font-semibold uppercase tracking-[0.05em] text-white transition-transform duration-300 hover:scale-[1.03]"
          >
            MORE ABOUT OUR STUDIO
          </button>
        </Reveal>

      </div>
    </section>
  );
}

// ─── SECTION 7: CLIENT LOGO MARQUEE (LEFT-TO-RIGHT) ──────────────────────────

function LogoMarqueeSection() {
  return (
    <section className="bg-white py-12 overflow-hidden select-none border-y border-neutral-100 marquee-container">
      <div className="w-full flex whitespace-nowrap">
        
        {/* scrolling left to right track */}
        <div className="marquee-lr-track" style={{ "--speed": "32s" } as React.CSSProperties}>
          {Array.from({ length: 4 }).map((_, loopIdx) => (
            <div key={loopIdx} className="flex h-20 items-center gap-[120px] px-[60px]">
              {CLIENT_LOGOS.map((logo, idx) => {
                // Render custom styling for each brand to make it look premium
                const brandStyles = [
                  "font-sans font-black tracking-tighter text-3xl", // NOVA
                  "font-serif italic font-bold text-3xl",          // Albor
                  "font-sans font-extrabold tracking-widest text-xl", // Bilg
                  "font-serif font-light tracking-wide text-2xl",  // DEEI
                  "font-mono font-bold text-2xl flex items-center gap-1", // CUBB
                  "font-sans font-normal lowercase tracking-widest text-2xl", // di
                  "font-sans font-black text-2xl tracking-[0.2em]", // KIKU
                  "font-serif italic text-4xl",                     // R
                  "font-sans font-bold uppercase text-2xl",         // MC
                ];

                return (
                  <span
                    key={`${logo}-${idx}`}
                    className={cn("text-neutral-800 transition-colors duration-200 hover:text-black cursor-pointer", brandStyles[idx])}
                  >
                    {logo === "CUBB" ? (
                      <>
                        <span>CUBB</span>
                        <span className="inline-block size-3 rounded-full bg-black self-center" />
                      </>
                    ) : (
                      logo
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── SECTION 8: LATEST NEWS STACK ───────────────────────────────────────────

function LatestNewsSection() {
  const newsRows = [
    { text: "Understanding Framer CMS", reverse: false, dark: false, speed: "35s" },
    { text: "SEO Strategies for 2024", reverse: true, dark: false, speed: "38s" },
    { text: "Content Marketing Strategies", reverse: false, dark: true, speed: "29s" },
    { text: "Social Media Marketing Tips", reverse: true, dark: true, speed: "34s" },
  ];

  return (
    <section id="news" className="bg-white px-4 md:px-6 py-[160px] text-black">
      <div className="mx-auto max-w-[1300px]">
        
        {/* Headline */}
        <Reveal className="text-center mb-16">
          <h2 className="moon-serif-font text-[100px] md:text-[140px] leading-none font-bold uppercase select-none tracking-tight">
            LATEST — NEWS
          </h2>
        </Reveal>

        {/* 4 Alternating Marquees */}
        <div className="space-y-4">
          {newsRows.map((row, idx) => {
            const trackClass = row.reverse ? "marquee-lr-track" : "marquee-rl-track";
            
            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <div
                  className={cn(
                    "w-full overflow-hidden py-4 border-y border-neutral-100 flex items-center select-none marquee-container",
                    row.dark && "bg-neutral-950 text-white rounded-full border-none px-6 py-5 shadow-lg"
                  )}
                  style={{ "--speed": row.speed } as React.CSSProperties}
                >
                  <div className={trackClass}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-6 whitespace-nowrap text-[22px] md:text-[28px] font-sans font-medium px-4">
                        <span>{row.text}</span>
                        <span className="text-neutral-300">•</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ─── SECTION 9: FOOTER & OUTRO WORDMARK ──────────────────────────────────────

function FooterOutroSection() {
  const outroRef = React.useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: outroRef,
    offset: ["start end", "end end"],
  });

  // Scaling goes from 1.0x to 1.18x which provides growth without causing overflow
  const outroScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.18]);
  const outroY = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <footer id="contact" ref={outroRef} className="relative bg-white pt-24 pb-0 text-black select-none">
      
      {/* 9A: Compact Footer Layout */}
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        
        {/* Nav Row */}
        <div className="font-sans text-[13px] font-semibold uppercase tracking-[0.15em] flex flex-wrap justify-center gap-x-8 gap-y-3 text-neutral-400">
          <span className="cursor-pointer hover:text-black transition">HOME</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-black transition">ABOUT</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-black transition">WORK</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-black transition">NEWS</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-black transition">PRICING</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-black transition">CONTACT</span>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mt-10 text-neutral-400">
          <Instagram className="size-[20px] cursor-pointer hover:text-black transition-colors" strokeWidth={1.5} />
          <Send className="size-[20px] cursor-pointer hover:text-black transition-colors" strokeWidth={1.5} />
          <MessageCircle className="size-[20px] cursor-pointer hover:text-black transition-colors" strokeWidth={1.5} />
          <Phone className="size-[20px] cursor-pointer hover:text-black transition-colors" strokeWidth={1.5} />
        </div>

        {/* Back to Top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-10 font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-neutral-500 hover:text-black transition-colors"
        >
          BACK TO TOP ↑
        </button>

        {/* Copyright */}
        <p className="mt-12 text-[11px] font-sans font-medium uppercase tracking-[0.12em] text-neutral-300">
          COPYRIGHT © NOVA — POWERED BY FRAMER
        </p>

      </div>

      {/* 9B: Giant Outro Wordmark (Sized to fit viewport fully and look perfectly even, with dynamic responsive padding to prevent clipping during scroll scale and translate transformations) */}
      <div 
        className="w-full mt-16 relative overflow-hidden flex flex-col justify-end"
        style={{ 
          paddingTop: "max(140px, 18vw)", 
          paddingBottom: "max(80px, 10vw)" 
        }}
      >
        <motion.div
          className="origin-bottom text-black select-none pointer-events-none pb-4"
          style={{ scale: outroScale, y: outroY }}
        >
          <div className="moon-outro-font leading-[0.82] tracking-[-0.015em] font-black uppercase text-center">
            <div>NOVA</div>
            <div>STUDIO</div>
          </div>
        </motion.div>
      </div>

    </footer>
  );
}

// ─── HELPER NAVBAR & DRAWER COMPONENTS ──────────────────────────────────────

function FloatingNavbar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const [activeDropdown, setActiveDropdown] = React.useState<"studio" | "services" | null>(null);
  const [isFloating, setIsFloating] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsFloating(true);
      } else {
        setIsFloating(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isFloating && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none px-6"
        >
          <div
            className="pointer-events-auto w-full max-w-[780px] bg-neutral-950/80 border border-white/10 backdrop-blur-xl rounded-full px-6 py-2.5 flex items-center justify-between text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {/* Logo */}
            <a href="#" className="font-sans text-[16px] font-black uppercase tracking-tight flex items-center">
              NOVA <sup className="text-[8px] ml-0.5">®</sup>
            </a>

            {/* Middle Links on Desktop */}
            <div className="hidden md:flex items-center gap-6 font-sans text-[12px] font-bold uppercase tracking-wider relative">
              
              {/* STUDIO Dropdown Trigger */}
              <div
                className="relative py-1"
                onMouseEnter={() => setActiveDropdown("studio")}
              >
                <span className="cursor-pointer hover:text-white/70 transition flex items-center gap-1">
                  STUDIO <ChevronDown className="size-3 opacity-60" />
                </span>
                
                <AnimatePresence>
                  {activeDropdown === "studio" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-[140%] w-[480px] bg-black border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl z-50 text-left normal-case grid grid-cols-2 gap-6"
                    >
                      <div className="flex flex-col gap-4">
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                          OUR VISION & INSIGHTS
                        </span>
                        <a href="#about" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            OUR MISSION
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Building lasting digital connections since 2017.
                          </span>
                        </a>
                        <a href="#news" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            LATEST INSIGHTS
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            SEO, CMS, and marketing tips for 2026.
                          </span>
                        </a>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                          THE AGENCY & CAREERS
                        </span>
                        <a href="#team" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            THE TEAM
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Meet our world-class symmetrical agency team.
                          </span>
                        </a>
                        <a href="#contact" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition flex items-center gap-1.5">
                            CAREERS <span className="text-[8px] font-sans font-semibold bg-white text-black px-1.5 py-0.5 rounded-sm">HIRING</span>
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Join us to build state-of-the-art experiences.
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SERVICES Dropdown Trigger */}
              <div
                className="relative py-1"
                onMouseEnter={() => setActiveDropdown("services")}
              >
                <span className="cursor-pointer hover:text-white/70 transition flex items-center gap-1">
                  SERVICES <ChevronDown className="size-3 opacity-60" />
                </span>
                
                <AnimatePresence>
                  {activeDropdown === "services" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-[140%] w-[480px] bg-black border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl z-50 text-left normal-case grid grid-cols-2 gap-6"
                    >
                      <div className="flex flex-col gap-4">
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                          DESIGN & IDENTITY
                        </span>
                        <a href="#about" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            STRATEGIC BRANDING
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Custom corporate colors, logos & design systems.
                          </span>
                        </a>
                        <a href="#work" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            WEB DESIGN & DEV
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Premium parallax, marquees and scroll zoom.
                          </span>
                        </a>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold border-b border-neutral-900 pb-2">
                          GROWTH & PLAN
                        </span>
                        <a href="#news" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            SEO & ADVOCACY
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Sustained organic traffic and performance growth.
                          </span>
                        </a>
                        <a href="#contact" className="group flex flex-col">
                          <span className="font-sans text-[13px] font-bold text-white group-hover:text-neutral-300 transition">
                            CUSTOM PACKAGES
                          </span>
                          <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-normal">
                            Tailored plans built for your business scale.
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct sections anchors links */}
              <a href="#work" className="cursor-pointer hover:text-white/70 transition">
                WORK
              </a>
              
              <a href="#team" className="cursor-pointer hover:text-white/70 transition">
                TEAM
              </a>
              
              <a href="#news" className="cursor-pointer hover:text-white/70 transition">
                NEWS
              </a>
            </div>

            {/* Right Action Button or Hamburger Menu */}
            <div className="flex items-center gap-3">
              <a
                href="#contact"
                className="hidden sm:inline-block rounded-full bg-white px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-colors"
              >
                CONTACT
              </a>
              
              <button
                onClick={onOpenMobileMenu}
                className="p-1.5 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <Menu className="size-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenuOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeAccordion, setActiveAccordion] = React.useState<"studio" | "services" | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-8 text-white select-none"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-[22px] font-black uppercase tracking-tight">
              NOVA <sup className="text-[11px]">®</sup>
            </span>
            <button
              onClick={onClose}
              className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition"
            >
              <X className="size-6 text-white" />
            </button>
          </div>

          {/* Links Grid */}
          <div className="flex flex-col gap-6 my-auto text-[32px] font-sans font-black uppercase tracking-tight text-left">
            
            {/* STUDIO Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "studio" ? null : "studio")}
                className="flex items-center justify-between text-left w-full hover:text-neutral-400 transition"
              >
                <span>STUDIO</span>
                <span className="text-[20px]">{activeAccordion === "studio" ? "−" : "+"}</span>
              </button>
              
              <AnimatePresence>
                {activeAccordion === "studio" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pl-4 flex flex-col gap-3 mt-3 normal-case text-neutral-400 text-[15px] font-medium"
                  >
                    <a href="#about" onClick={onClose} className="hover:text-white transition">
                      Our Mission — Building connections since 2017.
                    </a>
                    <a href="#team" onClick={onClose} className="hover:text-white transition">
                      The Team — Meet our world-class symmetrical agency team.
                    </a>
                    <a href="#news" onClick={onClose} className="hover:text-white transition">
                      Latest Insights — SEO, CMS, and marketing tips for 2026.
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SERVICES Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "services" ? null : "services")}
                className="flex items-center justify-between text-left w-full hover:text-neutral-400 transition"
              >
                <span>SERVICES</span>
                <span className="text-[20px]">{activeAccordion === "services" ? "−" : "+"}</span>
              </button>
              
              <AnimatePresence>
                {activeAccordion === "services" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pl-4 flex flex-col gap-3 mt-3 normal-case text-neutral-400 text-[15px] font-medium"
                  >
                    <a href="#about" onClick={onClose} className="hover:text-white transition">
                      Strategic Branding — Custom colors, logos & design systems.
                    </a>
                    <a href="#work" onClick={onClose} className="hover:text-white transition">
                      Web Design & Dev — Premium parallax, marquees and scroll zoom.
                    </a>
                    <a href="#contact" onClick={onClose} className="hover:text-white transition">
                      Start a Project — Tailored packages.
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Flat links */}
            <a href="#work" onClick={onClose} className="hover:text-neutral-400 transition">
              WORK
            </a>
            <a href="#team" onClick={onClose} className="hover:text-neutral-400 transition">
              TEAM
            </a>
            <a href="#news" onClick={onClose} className="hover:text-neutral-400 transition">
              NEWS
            </a>
            <a href="#contact" onClick={onClose} className="hover:text-neutral-400 transition">
              CONTACT
            </a>

          </div>

          {/* Social Row */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex gap-6 text-neutral-400">
              <Instagram className="size-6 hover:text-white transition" />
              <Send className="size-6 hover:text-white transition" />
              <MessageCircle className="size-6 hover:text-white transition" />
              <Phone className="size-6 hover:text-white transition" />
            </div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-neutral-500">
              © 2026 NOVA STUDIO
            </span>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN LANDING PAGE CONTAINER ────────────────────────────────────────────

export default function MoonStudioPage() {
  useLenis();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <main className="moon-landing-page min-h-screen bg-white overflow-hidden relative selection:bg-neutral-950 selection:text-black">
      <FloatingNavbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Global CSS Injector (dangerouslySetInnerHTML is fully SSR safe) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=League+Gothic&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        
        .moon-landing-page {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }

        .moon-hero-font {
          font-family: 'League Gothic', 'Impact', sans-serif;
          font-size: 16.5vw;
          line-height: 0.72;
          letter-spacing: -0.015em;
          transform: scaleX(1.48) scaleY(2.65) translateZ(0);
          transform-origin: bottom center;
          will-change: transform;
          display: inline-block;
        }

        .moon-outro-font {
          font-family: 'League Gothic', 'Impact', sans-serif;
          font-size: clamp(6.5rem, 22vw, 24rem);
          line-height: 0.82;
          letter-spacing: -0.01em;
          transform: scaleY(1.15) translateZ(0);
          will-change: transform;
        }

        .moon-serif-font {
          font-family: 'Playfair Display', Georgia, serif;
        }

        /* Lenis Smooth Scroll Overrides */
        html.lenis, html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }

        /* CSS Infinite Marquees */
        @keyframes marquee-rl {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-lr {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .marquee-rl-track {
          display: flex;
          width: max-content;
          animation: marquee-rl var(--speed, 40s) linear infinite;
          will-change: transform;
        }

        .marquee-lr-track {
          display: flex;
          width: max-content;
          animation: marquee-lr var(--speed, 40s) linear infinite;
          will-change: transform;
        }

        /* Hover Pause Mechanics */
        .marquee-container:hover .marquee-rl-track,
        .marquee-container:hover .marquee-lr-track {
          animation-play-state: paused;
        }
      `}} />

      {/* Sections 1 to 9 */}
      <HeroSection onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <IntroSection />
      <SelectedWorkSection />
      <MarqueeSection />
      <GallerySection />
      <TeamSection />
      <LogoMarqueeSection />
      <LatestNewsSection />
      <FooterOutroSection />

    </main>
  );
}
