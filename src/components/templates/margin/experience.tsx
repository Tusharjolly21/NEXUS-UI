"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPERIENCE, type Experience } from "./data";
import { Icon, type IconName } from "./icons";
import { DISPLAY_FONT, SPRING } from "./ui";

/** Rounded square carrying the employer's mark, tinted with the mark's own colour. */
function LogoTile({ logo }: { logo: Experience["logo"] }) {
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]"
      style={{
        color: logo.color,
        background: `color-mix(in srgb, ${logo.color} 9%, var(--card))`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${logo.color} 18%, transparent)`,
      }}
    >
      <Icon name={logo.icon} size={22} />
    </span>
  );
}

function Fact({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon name={icon} size={13} style={{ color: "var(--faint)" }} />
      {children}
    </span>
  );
}

type RowProps = {
  job: Experience;
  panelId: string;
  open: boolean;
  last: boolean;
  onToggle: () => void;
};

function ExperienceRow({ job, panelId, open, last, onToggle }: RowProps) {
  return (
    <li className="relative list-none pb-2">
      {/* Thin line running down to the next entry. */}
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[21px] top-[56px] w-px"
          style={{ background: "linear-gradient(var(--line), var(--line) 70%, transparent)" }}
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="margin-ring group relative -mx-2 flex w-[calc(100%+16px)] items-start gap-4 rounded-[16px] p-2 text-left outline-none transition-colors hover:bg-[var(--chip)]"
      >
        <LogoTile logo={job.logo} />
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-semibold leading-6" style={{ color: "var(--fg)", fontFamily: DISPLAY_FONT }}>
              {job.company}
            </span>
            {job.current && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: "rgba(34,197,94,.12)", color: "#16a34a" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Current
              </span>
            )}
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--dim)" }}
            >
              {job.kind}
            </span>
          </span>
          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: "var(--dim)" }}>
            <Fact icon="ph:briefcase">{job.role}</Fact>
            <Fact icon="ph:map-pin">{job.location}</Fact>
            <Fact icon="ph:calendar-blank">
              <span className="tabular-nums">{job.period}</span>
              <span style={{ color: "var(--faint)" }}>· {job.duration}</span>
            </Fact>
          </span>
        </span>
        <span className="margin-pill mt-2 grid h-7 w-7 shrink-0 place-items-center rounded-full">
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SPRING} className="grid place-items-center">
            <Icon name="ph:caret-down" size={13} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: "spring", stiffness: 300, damping: 34 }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-[60px] pt-2">
              <p className="m-0 text-[14px] leading-[1.55]" style={{ color: "var(--fg2)" }}>
                {job.summary}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {job.highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.04 + index * 0.05 }}
                    className="margin-pill flex items-start gap-3 rounded-[12px] p-3 sm:block"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px]"
                      style={{ background: "var(--chip)", color: "var(--accent)" }}
                    >
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="block min-w-0">
                      <span className="block text-[13.5px] font-semibold leading-5 sm:mt-2" style={{ color: "var(--fg)" }}>
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-[1.45]" style={{ color: "var(--dim)" }}>
                        {item.text}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {job.stack.map((tool) => (
                  <span
                    key={tool.name}
                    className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5 text-[12px] font-medium"
                    style={{ boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--fg2)" }}
                  >
                    <Icon name={tool.icon} size={13} style={{ color: tool.color }} />
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Accordion of jobs. One is open at a time, the first by default; clicking the open one closes it. */
export function ExperienceList() {
  const [openCompany, setOpenCompany] = useState<string | null>(EXPERIENCE[0].company);
  return (
    <ul className="m-0 p-0">
      {EXPERIENCE.map((job, index) => (
        <ExperienceRow
          key={job.company}
          job={job}
          panelId={`margin-experience-${index}`}
          last={index === EXPERIENCE.length - 1}
          open={openCompany === job.company}
          onToggle={() => setOpenCompany(openCompany === job.company ? null : job.company)}
        />
      ))}
    </ul>
  );
}
