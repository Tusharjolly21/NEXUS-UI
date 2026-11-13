"use client";

import { COLORS, CONTAINER } from "./theme";
import { Button, Icon, Logo, LogoMark, Reveal } from "./ui";

export function Cta() {
  return (
    <section id="cta" className={`${CONTAINER} scroll-mt-24 pb-28 pt-8 text-center`}>
      <Reveal>
        <div
          className="relative mx-auto grid size-[60px] place-items-center rounded-[16px] text-white"
          style={{
            background: "linear-gradient(180deg,#2A2A2F,#18181B)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.14), 0 0 0 1px rgba(255,255,255,.08), 0 20px 50px -10px rgba(75,107,251,.55)",
          }}
        >
          <LogoMark size={30} />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className="mx-auto mt-8 max-w-[560px] text-[clamp(32px,4.8vw,52px)] font-[600] leading-[1.06] tracking-[-0.045em]"
          style={{
            color: COLORS.ink,
          }}
        >
          Know what assistants say about you by breakfast
        </h2>
      </Reveal>
      <Reveal delay={0.14}>
        <p
          className="mx-auto mt-4 max-w-[400px] text-[15px] leading-[1.6]"
          style={{
            color: COLORS.text,
          }}
        >
          Add your domain tonight. At 7:00 tomorrow you will see where each assistant names you, and what to fix where
          it does not.
        </p>
      </Reveal>
      <Reveal delay={0.2} className="mt-7 flex justify-center gap-2.5">
        <Button kind="primary" href="#pricing">
          Start free
        </Button>
        <Button kind="ghost" icon="ph:arrow-right" href="#how">
          Book a 15-minute demo
        </Button>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const columns: [title: string, links: string[]][] = [
    ["Product", ["Features", "How it works", "Pricing", "Changelog"]],
    ["Assistants", ["ChatGPT", "Claude", "Gemini", "Perplexity", "Google AI answers"]],
    ["Resources", ["Guides", "State of AI search", "Docs", "API"]],
    ["Company", ["About", "Customers", "Careers", "Contact"]],
  ];
  return (
    <footer
      className="border-t"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={`${CONTAINER} grid gap-10 py-14 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]`}>
        <div>
          <Logo />
          <p
            className="mt-3 max-w-[240px] text-[13.5px] leading-[1.55]"
            style={{
              color: COLORS.text,
            }}
          >
            Be the answer when buyers ask an assistant.
          </p>
          <p
            className="mt-4 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px]"
            style={{
              background: "rgba(255,255,255,.04)",
              color: "#D4D4D8",
              boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{
                background: COLORS.ok,
              }}
            />
            All assistants checked today at 7:00
          </p>
          <div className="mt-5 flex gap-1">
            {[
              ["ph:x-logo", "X"],
              ["ph:linkedin-logo", "LinkedIn"],
              ["ph:github-logo", "GitHub"],
              ["ph:youtube-logo", "YouTube"],
            ].map(([icon, label]) => (
              <a
                key={label}
                href="#top"
                aria-label={label}
                className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-white/[.06] hover:text-white"
                style={{
                  color: COLORS.text,
                }}
              >
                <Icon name={icon} size={15} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map(([title, links]) => (
            <div key={title}>
              <p
                className="text-[13px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {title}
              </p>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-[13px] transition-colors hover:text-white"
                      style={{
                        color: COLORS.text,
                      }}
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
        className={`${CONTAINER} flex flex-col gap-3 border-t py-6 text-[12px] sm:flex-row`}
        style={{
          borderColor: COLORS.line,
          color: COLORS.soft,
        }}
      >
        <span>© 2026 Surfaced, Inc. All rights reserved.</span>
        <span className="flex gap-5 sm:ml-auto">
          {["Privacy", "Terms", "Security"].map((label) => (
            <a key={label} href="#top" className="transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
