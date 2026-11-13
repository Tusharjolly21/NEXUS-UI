"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SpectrumField } from "./spectrum";
import { COLORS, CONTAINER, clamp } from "./theme";
import { Button, Icon, LogoMark, TypedText, useOpenDownload } from "./ui";

const CTA_REST = [0.68, 0.62];

export function DownloadCta() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-20% 0px",
  });
  const openDownload = useOpenDownload();
  return (
    <section className="px-3 sm:px-5">
      <div
        ref={ref}
        className="relative mx-auto min-h-[560px] max-w-[1520px] overflow-hidden rounded-[28px] bg-[#07080B] sm:rounded-[40px]"
      >
        <SpectrumField
          dark={true}
          on={inView}
          rest={CTA_REST}
          reach={0.5}
          track="parent"
          className="absolute inset-0"
        />
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background: "linear-gradient(90deg, rgba(7,8,11,.92) 0%, rgba(7,8,11,.55) 38%, transparent 65%)",
          }}
        />
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,8,11,.2) 0%, rgba(7,8,11,.85) 30%, rgba(7,8,11,.85) 75%, rgba(7,8,11,.3) 100%)",
          }}
        />
        <div className={`${CONTAINER} relative flex min-h-[560px] flex-col justify-center py-20`}>
          <TypedText
            dark={true}
            as="h2"
            text={`Download
Updraft`}
            keepCaret={true}
            className="text-[clamp(44px,6vw,84px)] font-[470] leading-[0.98] tracking-[-0.045em] text-white"
          />
          <p className="mt-5 max-w-[420px] text-[15.5px] leading-[1.6] text-white/60">
            Version 1.4.2, released November 10, 2026. Free while in preview, with every surface included.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button kind="white" size="lg" icon="ph:download-simple" onClick={openDownload}>
              Apple silicon
            </Button>
            <Button kind="ghost" size="lg" onClick={openDownload}>
              Intel Mac
            </Button>
          </div>
          <button
            onClick={openDownload}
            className="ud-ring-w group mt-6 inline-flex w-fit items-center gap-1.5 text-[13.5px] text-white/60 transition-colors hover:text-white"
          >
            Windows and Linux builds
            <Icon name="ph:arrow-right" size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function FooterLetter({ ch, i: index, mx }: { ch: string; i: number; mx: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [centerX, setCenterX] = useState(0);
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (el) {
        setCenterX(el.offsetLeft + el.offsetWidth / 2);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    const parent = ref.current?.parentElement;
    if (parent) {
      observer.observe(parent);
    }
    return () => observer.disconnect();
  }, []);
  const weight = useTransform(mx, (x) => {
    const dist = Math.abs(x - centerX);
    return -(Math.max(0, 1 - dist / 260) ** 2) * 0.26;
  });
  const springWeight = useSpring(weight, {
    stiffness: 180,
    damping: 14,
    mass: 0.6,
  });
  const tilt = useSpring(
    useTransform(mx, (x) =>
      x < -999 ? 0 : clamp((centerX - x) / 260, -1, 1) * -4 * Math.max(0, 1 - Math.abs(x - centerX) / 260),
    ),
    {
      stiffness: 160,
      damping: 14,
    },
  );
  const weightEm = useMotionTemplate`${springWeight}em`;
  return (
    <motion.span
      ref={ref}
      style={{
        y: weightEm,
        rotate: tilt,
      }}
      className="inline-block"
    >
      <span
        className="inline-block"
        style={{
          animation: `ud-drift ${3.4 + (index % 3) * 0.7}s ease-in-out ${-index * 0.45}s infinite`,
        }}
      >
        {ch}
      </span>
    </motion.span>
  );
}

export function Footer() {
  const pointerX = useMotionValue(-9999);
  const columns = [
    ["Product", ["Desk", "Shell", "Lens", "Kit", "Integrations", "Download"]],
    ["Resources", ["Docs", "Changelog", "Journal", "Community", "Status"]],
    ["Company", ["About", "Careers", "Press", "Security", "Contact"]],
  ] as [string, string[]][];
  return (
    <footer className="pt-16">
      <div className={`${CONTAINER} grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
        <div>
          <p className="text-[26px] font-[470] tracking-[-0.03em]">Hand off the work.</p>
          <p
            className="mt-2 max-w-[300px] text-[14px] leading-[1.55]"
            style={{
              color: COLORS.soft,
            }}
          >
            Updraft Labs builds tools that let engineers spend the day on the parts that need them.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map(([title, links]) => (
            <div key={title}>
              <p
                className="text-[13px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {title}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="ud-ring bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-[14px] transition-[background-size] duration-300 hover:bg-[length:100%_1px]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`${CONTAINER} relative mt-14 select-none overflow-hidden pb-[3.5vw] pt-[6vw]`}
        aria-hidden={true}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(event.clientX - rect.left - parseFloat(getComputedStyle(event.currentTarget).paddingLeft));
        }}
        onPointerLeave={() => pointerX.set(-9999)}
      >
        <p
          className="relative whitespace-nowrap text-center text-[clamp(84px,21.5vw,318px)] font-[520] leading-[0.9] tracking-[-0.06em]"
          style={{
            color: COLORS.ink,
          }}
        >
          {Array.from("updraft").map((letter, i) => (
            <FooterLetter key={i} ch={letter} i={i} mx={pointerX} />
          ))}
        </p>
      </div>
      <div
        className="border-t"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <div
          className={`${CONTAINER} flex flex-col gap-4 py-6 text-[13px] sm:flex-row sm:items-center`}
          style={{
            color: COLORS.soft,
          }}
        >
          <span className="flex items-center gap-2">
            <LogoMark size={18} />
            <span
              style={{
                color: COLORS.ink,
              }}
            >
              © 2026 Updraft Labs
            </span>
          </span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
            {["Privacy", "Terms", "Cookies"].map((n) => (
              <a key={n} href="#top" className="ud-ring transition-colors hover:text-[#121317]">
                {n}
              </a>
            ))}
            <a href="#newsletter" className="ud-ring flex items-center gap-1.5 transition-colors hover:text-[#121317]">
              <span className="size-1.5 rounded-full bg-[#1E9E57]" />
              All systems normal
            </a>
          </nav>
          <div className="flex gap-1 sm:ml-auto">
            {[
              ["ph:github-logo", "GitHub"],
              ["ph:x-logo", "X"],
              ["ph:youtube-logo", "YouTube"],
              ["ph:discord-logo", "Discord"],
            ].map(([icon, label]) => (
              <a
                key={label}
                href="#top"
                aria-label={label}
                className="ud-ring grid size-9 place-items-center rounded-full transition-colors hover:bg-[#F2F3F5] hover:text-[#121317]"
              >
                <Icon name={icon} size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
