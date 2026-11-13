"use client";

import { useEffect, useState } from "react";
import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { Landscape } from "./landscape";
import { CONTAINER, DARK, formatNumber } from "./theme";
import { Button, Logo, Reveal, Rover, useLiveInView } from "./ui";

export function Cta() {
  const [ref, live] = useLiveInView();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sunX = useTransform(pointerX, (v) => v * -14);
  const sunY = useTransform(pointerY, (v) => v * -8);
  const scan = useMotionValue(0.2);
  useAnimationFrame((time) => {
    if (live) {
      scan.set((time / 14e3) % 1);
    }
  });
  const scanLeft = useTransform(scan, (v) => `calc(${v * 100}% - 17px)`);
  const scanWidth = useTransform(scan, (v) => `${v * 100}%`);
  return (
    <section id="cta" className={`${CONTAINER} pb-24`}>
      <Reveal>
        <div
          ref={ref}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
            pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
          }}
          onPointerLeave={() => {
            animate(pointerX, 0, {
              duration: 0.8,
            });
            animate(pointerY, 0, {
              duration: 0.8,
            });
          }}
          className="relative isolate overflow-hidden rounded-[22px] p-6 sm:p-9"
          style={{
            minHeight: 380,
            boxShadow: `0 0 0 1px ${DARK.line2}, 0 50px 100px -40px rgba(0,0,0,.9)`,
          }}
        >
          <motion.div
            className="absolute -inset-6 -z-10"
            style={{
              x: sunX,
              y: sunY,
            }}
          >
            <Landscape scene="dusk" id="op-cta" sun={[1180, 560]} />
          </motion.div>
          <div
            aria-hidden={true}
            className="absolute inset-0 -z-10"
            style={{
              background: "linear-gradient(180deg, rgba(9,9,11,.15), rgba(9,9,11,0) 40%, rgba(9,9,11,.55))",
            }}
          />
          <Logo />
          <div className="mt-28 flex flex-wrap items-end justify-between gap-6 sm:mt-32">
            <h2
              className="max-w-[460px] text-[clamp(34px,5vw,54px)] font-[400] leading-[1.04] tracking-[-0.04em]"
              style={{
                color: DARK.ink,
              }}
            >
              Ready to serve your first model?
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <Button kind="light" icon="ph:arrow-right" href="#top">
                Deploy a model
              </Button>
              <Button href="#code">Read the docs</Button>
            </div>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-[3px]"
            style={{
              background: "rgba(255,255,255,.12)",
            }}
          >
            <motion.div
              className="h-full"
              style={{
                width: scanWidth,
                background: DARK.amber,
              }}
            />
          </div>
          <motion.div
            className="absolute bottom-[3px]"
            style={{
              left: scanLeft,
            }}
          >
            <Rover size={34} color="#0B070D" />
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const [ref, live] = useLiveInView("0px");
  const [tokens, setTokens] = useState(18402975051);
  useEffect(() => {
    if (!live) {
      return;
    }
    const timer = window.setInterval(() => setTokens((prev) => prev + 9e3 + Math.round(Math.random() * 6e3)), 120);
    return () => window.clearInterval(timer);
  }, [live]);
  const columns: [title: string, links: string[]][] = [
    ["Product", ["Models", "Endpoints", "Pricing", "Tracing"]],
    ["Developers", ["Docs", "API reference", "Changelog", "Status"]],
    ["Company", ["About", "Careers", "Security", "Contact"]],
  ];
  return (
    <footer ref={ref} className={`${CONTAINER} pb-10`}>
      <div className="grid gap-10 pb-12 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo />
          <p
            className="mt-3 max-w-[240px] text-[13.5px] leading-[1.55]"
            style={{
              color: DARK.text,
            }}
          >
            Fast inference for open models, served close to every user.
          </p>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <p
              className="text-[13.5px] font-[500]"
              style={{
                color: DARK.ink,
              }}
            >
              {title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#top"
                    className="inline-flex items-center gap-2 text-[13.5px] transition-colors hover:text-white"
                    style={{
                      color: DARK.text,
                    }}
                  >
                    {link}
                    {link === "Tracing" && (
                      <span
                        className="rounded px-1.5 text-[10.5px]"
                        style={{
                          background: "rgba(63,224,197,.14)",
                          color: DARK.teal,
                        }}
                      >
                        New
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-[12.5px]"
        style={{
          borderColor: DARK.line,
          color: DARK.soft,
        }}
      >
        <div className="flex gap-4">
          {["X", "GitHub", "Forum"].map((label) => (
            <a key={label} href="#top" className="transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <span>
            <span
              className="tabular-nums"
              style={{
                color: DARK.ink,
              }}
            >
              {formatNumber(tokens)}
            </span>
            {" tokens served this week"}
          </span>
          <span>© 2026 Outpost Labs</span>
        </div>
      </div>
    </footer>
  );
}
