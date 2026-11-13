"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { COLORS, DAWN, FONT_MONO } from "./theme";
import { Avatar, Icon, LogoMark, useCycle } from "./ui";

const INCIDENTS = [
  {
    id: "INC-2041",
    t: "Checkout latency over SLO",
    svc: "checkout-api",
    sev: 2,
    st: "Resolved",
    who: "Nightwatch",
    dur: "41s",
  },
  {
    id: "INC-2040",
    t: "Queue depth rising on billing-worker",
    svc: "billing",
    sev: 3,
    st: "Watching",
    who: "Ines Duarte",
    dur: "12m",
  },
  {
    id: "INC-2039",
    t: "Certificate expires in 6 days",
    svc: "edge",
    sev: 4,
    st: "Ticket filed",
    who: "Nightwatch",
    dur: "—",
  },
  {
    id: "INC-2038",
    t: "Elevated 5xx on search",
    svc: "search",
    sev: 2,
    st: "Resolved",
    who: "Theo Ruiz",
    dur: "7m",
  },
  {
    id: "INC-2037",
    t: "Disk 91% on db-replica-3",
    svc: "postgres",
    sev: 3,
    st: "Resolved",
    who: "Nightwatch",
    dur: "2m",
  },
];

const TIMELINE = [
  {
    tm: "03:12:04",
    t: "47 alerts grouped into one incident",
    icon: "ph:bell-ringing",
  },
  {
    tm: "03:12:09",
    t: "Linked to deploy #8812 by Kemi Ade",
    icon: "ph:git-commit",
  },
  {
    tm: "03:12:21",
    t: "Ran runbook “Roll back checkout”",
    icon: "ph:terminal-window",
  },
  {
    tm: "03:12:45",
    t: "p95 back to 310 ms. Resolved.",
    icon: "ph:check-circle-fill",
  },
  {
    tm: "08:30:00",
    t: "Postmortem draft shared in #checkout",
    icon: "ph:file-text",
  },
];

export function AppWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.25"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.4, 1]);
  // the incident timeline starts playing the first time the window is well in view, then keeps going
  const started = useInView(ref, {
    margin: "-20% 0px",
    once: true,
  });
  const tick = useCycle(TIMELINE.length + 3, 900, started && !reduce);
  const shown = reduce ? TIMELINE.length : Math.min(TIMELINE.length, tick);
  return (
    <section
      id="product"
      className="relative scroll-mt-24 px-3 pb-24 pt-6 sm:px-6 sm:pb-32"
      style={{
        perspective: 1600,
      }}
    >
      <motion.div
        ref={ref}
        style={{
          rotateX: y,
          scale,
          opacity,
          transformOrigin: "50% 0%",
        }}
        className="mx-auto max-w-[1200px] overflow-hidden rounded-[20px] shadow-[0_0_0_1px_rgba(150,170,255,.14),0_60px_120px_-40px_rgba(0,0,0,.9),0_-30px_120px_-60px_rgba(255,120,90,.5)]"
      >
        <div
          className="flex h-10 items-center gap-2 px-4"
          style={{
            background: "#0A1022",
          }}
        >
          <span className="flex gap-1.5">
            {[0, 1, 2].map((f) => (
              <span key={f} className="size-[10px] rounded-full bg-white/10" />
            ))}
          </span>
          <span
            className="mx-auto rounded-md px-3 py-0.5 text-[11.5px]"
            style={{
              color: COLORS.soft,
              background: "rgba(255,255,255,.04)",
            }}
          >
            app.nightwatch.dev / incidents
          </span>
        </div>
        <div
          className="grid min-h-[520px] grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)_320px]"
          style={{
            background: COLORS.deep,
          }}
        >
          <aside
            className="hidden border-r p-3 md:block"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <div className="mb-4 flex items-center gap-2 px-2 pt-1">
              <LogoMark size={18} />
              <span
                className="text-[13px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Acme
              </span>
            </div>
            {(
              [
                ["ph:siren", "Incidents", 3],
                ["ph:calendar-blank", "On-call"],
                ["ph:list-checks", "Runbooks"],
                ["ph:pulse", "Status page"],
                ["ph:file-text", "Postmortems", 1],
                ["ph:plugs-connected", "Integrations"],
              ] as [string, string, number?][]
            ).map(([icon, label, badge], i) => (
              <div
                key={label}
                className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] ${i === 0 ? "bg-white/[.06]" : ""}`}
                style={{
                  color: i === 0 ? COLORS.ink : COLORS.text,
                }}
              >
                <Icon name={icon} size={14} />
                {label}
                {badge ? (
                  <span
                    className="ml-auto rounded-full px-1.5 text-[10.5px]"
                    style={{
                      background: i === 0 ? `${DAWN[0]}33` : "rgba(255,255,255,.06)",
                      color: i === 0 ? DAWN[2] : COLORS.text,
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </div>
            ))}
            <p
              className="mb-2 mt-6 px-2 text-[11px]"
              style={{
                color: COLORS.faint,
              }}
            >
              On call now
            </p>
            {[
              ["Ines Duarte", "Primary · until 09:00"],
              ["Theo Ruiz", "Secondary"],
            ].map(([name, role]) => (
              <div key={name} className="flex items-center gap-2 px-2 py-1.5">
                <Avatar name={name} size={22} />
                <span className="min-w-0">
                  <span
                    className="block truncate text-[12px]"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="block text-[10.5px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {role}
                  </span>
                </span>
              </div>
            ))}
          </aside>
          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p
                className="text-[15px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Incidents
              </p>
              <span
                className="flex items-center gap-1.5 text-[11.5px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                <span className="relative grid size-2 place-items-center">
                  <span
                    className="nw-ping absolute size-2 rounded-full"
                    style={{
                      background: COLORS.ok,
                    }}
                  />
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: COLORS.ok,
                    }}
                  />
                </span>
                Live
              </span>
            </div>
            <div className="mt-3 flex gap-1.5 text-[11.5px]">
              {["All", "Mine", "Auto-resolved"].map((f, i) => (
                <span
                  key={f}
                  className="rounded-md px-2 py-1"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,.08)" : "transparent",
                    color: i === 0 ? COLORS.ink : COLORS.soft,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
            <ul
              className="mt-3 divide-y"
              style={{
                borderColor: COLORS.line,
              }}
            >
              {INCIDENTS.map((incident, i) => (
                <li
                  key={incident.id}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${i === 0 ? "bg-white/[.035]" : ""}`}
                  style={{
                    borderColor: COLORS.line,
                  }}
                >
                  <span
                    className="w-[22px] shrink-0 rounded px-1 text-center text-[10px] font-[650]"
                    style={{
                      background:
                        incident.sev === 2
                          ? `${COLORS.bad}26`
                          : incident.sev === 3
                            ? `${DAWN[2]}22`
                            : "rgba(255,255,255,.06)",
                      color: incident.sev === 2 ? COLORS.bad : incident.sev === 3 ? DAWN[2] : COLORS.text,
                    }}
                  >
                    S{incident.sev}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[13px]"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {incident.t}
                    </span>
                    <span
                      className="block text-[11px]"
                      style={{
                        color: COLORS.soft,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      {incident.id}
                      {" · "}
                      {incident.svc}
                    </span>
                  </span>
                  <span
                    className="hidden items-center gap-1.5 text-[11.5px] sm:flex"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    {incident.who === "Nightwatch" ? <LogoMark size={16} /> : <Avatar name={incident.who} size={18} />}
                    {incident.who}
                  </span>
                  <span
                    className="w-[86px] text-right text-[11.5px]"
                    style={{
                      color: incident.st === "Resolved" ? COLORS.ok : COLORS.text,
                    }}
                  >
                    {incident.st}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="hidden border-l p-5 lg:block"
            style={{
              borderColor: COLORS.line,
            }}
          >
            <p
              className="text-[11px]"
              style={{
                color: COLORS.soft,
                fontFamily: FONT_MONO,
              }}
            >
              INC-2041
            </p>
            <p
              className="mt-1 text-[15px] font-[600] leading-[1.3]"
              style={{
                color: COLORS.ink,
              }}
            >
              Checkout latency over SLO
            </p>
            <div
              className="mt-2 flex items-center gap-2 text-[11.5px]"
              style={{
                color: COLORS.ok,
              }}
            >
              <Icon name="ph:check-circle-fill" size={13} />
              Resolved automatically in 41s
            </div>
            <ol className="relative mt-5 space-y-4 pl-6">
              <span
                aria-hidden={true}
                className="absolute bottom-1 left-[9px] top-1 w-px"
                style={{
                  background: COLORS.line2,
                }}
              />
              {TIMELINE.map((f, i) => (
                <motion.li
                  key={f.tm}
                  initial={false}
                  animate={{
                    opacity: i < shown ? 1 : 0.18,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="relative"
                >
                  <span
                    className="absolute -left-6 top-0 grid size-[19px] place-items-center rounded-full"
                    style={{
                      background: COLORS.deep,
                      boxShadow: `inset 0 0 0 1px ${i < shown ? (i === 3 ? COLORS.ok : DAWN[1]) : COLORS.line2}`,
                      color: i < shown ? (i === 3 ? COLORS.ok : DAWN[1]) : COLORS.faint,
                    }}
                  >
                    <Icon name={f.icon} size={10} />
                  </span>
                  <p
                    className="text-[10.5px]"
                    style={{
                      color: COLORS.soft,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {f.tm}
                  </p>
                  <p
                    className="text-[12.5px] leading-[1.4]"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {f.t}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
