"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PROJECTS, type Project } from "./data";
import { Icon } from "./icons";
import { SPRING } from "./ui";

const VISIBLE_TAGS = 3;

/**
 * A project card. The screenshot sits in a tinted frame; on hover (or keyboard focus) the page scrolls up inside
 * the frame, the frame takes on a gradient in the project's colour, the card lifts and the arrow turns.
 */
function ProjectCard({ project }: { project: Project }) {
  const [active, setActive] = useState(false);
  const reducedMotion = useReducedMotion();
  const shownTags = project.tags.slice(0, VISIBLE_TAGS);
  const hiddenTags = project.tags.slice(VISIBLE_TAGS);

  return (
    <motion.article
      className="margin-pill rounded-[18px] p-1.5"
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      whileHover={{ y: -2 }}
      transition={SPRING}
    >
      <div
        className="relative aspect-[16/11] overflow-hidden rounded-[13px] px-[5%] pt-[6%]"
        style={{ background: "var(--chip)" }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(80% 70% at 10% 0%, #fff8, transparent 60%), radial-gradient(90% 90% at 100% 100%, color-mix(in srgb, ${project.ink} 30%, ${project.tint}), transparent 75%), ${project.tint}`,
          }}
        />
        <div
          className="relative h-full overflow-hidden rounded-t-[10px]"
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 36px -18px rgba(0,0,0,.45)" }}
        >
          <motion.img
            src={project.screenshot}
            alt={`${project.name} website`}
            draggable={false}
            className="block w-full select-none"
            initial={false}
            animate={{ y: active && !reducedMotion ? "-44%" : "0%", scale: active ? 1.01 : 1 }}
            transition={active ? { duration: 2.6, ease: [0.45, 0, 0.2, 1] } : { type: "spring", stiffness: 140, damping: 24 }}
          />
        </div>
      </div>

      <div className="px-2.5 pb-2.5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 text-[15px] font-semibold leading-6" style={{ color: "var(--fg)" }}>
            {project.name}
          </h3>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            aria-label={`Open ${project.name}`}
            className="margin-ring margin-pill grid h-7 w-7 shrink-0 place-items-center rounded-full outline-none"
          >
            <motion.span animate={{ rotate: active ? 45 : 0 }} transition={SPRING} className="grid place-items-center">
              <Icon name="ph:arrow-up-right" size={13} />
            </motion.span>
          </a>
        </div>
        <p className="m-0 mt-1 line-clamp-2 text-[14px] leading-5" style={{ color: "var(--dim)" }}>
          {project.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {shownTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-1 text-[11px] font-semibold leading-none"
              style={{ background: "var(--chip)", color: "var(--fg2)", boxShadow: "inset 0 0 0 1px var(--line)" }}
            >
              {tag}
            </span>
          ))}
          {hiddenTags.length > 0 && (
            <span
              className="rounded-full px-2 py-1 text-[11px] font-semibold leading-none"
              style={{ color: "var(--faint)", boxShadow: "inset 0 0 0 1px var(--line)" }}
              title={hiddenTags.join(", ")}
            >
              +{hiddenTags.length}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECTS.map((project) => (
        <ProjectCard key={project.name} project={project} />
      ))}
    </div>
  );
}
