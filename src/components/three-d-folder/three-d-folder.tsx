"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FolderProject = {
  id: string;
  title: string;
  image: string;
  href?: string;
};

export type ThreeDFolderProps = {
  title?: string;
  projects?: FolderProject[];
  folderBackColor?: string;
  folderFrontColor?: string;
  folderTabColor?: string;
  /** "sm" renders at ~60% scale for grid/multi-folder layouts. */
  size?: "sm" | "md";
  className?: string;
};

const DEFAULT_PROJECTS: FolderProject[] = [
  {
    id: "atlas",
    title: "Atlas",
    image:
      "https://plus.unsplash.com/premium_photo-1669842162407-abfc5f9e981e?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "https://example.com",
  },
  {
    id: "prism",
    title: "Prism",
    image:
      "https://images.unsplash.com/photo-1589634749362-a8ef3056cbe9?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "https://example.com",
  },
  {
    id: "signal",
    title: "Signal",
    image:
      "https://images.unsplash.com/photo-1764310722996-fe07553fd10c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "https://example.com",
  },
];

const cardPositions = {
  md: [
    { x: -60, rotate: -13, z: 22 },
    { x: 0, rotate: 0, z: 24 },
    { x: 60, rotate: 13, z: 22 },
  ],
  sm: [
    { x: -36, rotate: -13, z: 22 },
    { x: 0, rotate: 0, z: 24 },
    { x: 36, rotate: 13, z: 22 },
  ],
};

export function ThreeDFolder({
  title = "Design Archive",
  projects = DEFAULT_PROJECTS,
  folderBackColor = "#fb7185",
  folderFrontColor = "#fbbf24",
  folderTabColor = "#f97316",
  size = "md",
  className,
}: ThreeDFolderProps) {
  const sm = size === "sm";
  const [hovered, setHovered] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const visibleProjects = projects.slice(0, 3);
  const activeProject = activeIndex === null ? null : projects[activeIndex];
  const positions = cardPositions[size];

  const navigate = React.useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return Math.max(0, Math.min(projects.length - 1, current + direction));
      });
    },
    [projects.length],
  );

  React.useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "ArrowLeft") navigate(-1);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, navigate]);

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,.08)] transition duration-500 hover:border-rose-300 dark:border-white/10 dark:bg-zinc-950",
          sm ? "min-h-[210px] min-w-[180px] p-5" : "min-h-[340px] min-w-[280px] p-8",
          hovered && "shadow-[0_32px_90px_rgba(244,63,94,.16)]",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_68%,rgba(251,113,133,.14),transparent_64%)] opacity-0 transition duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        <div
          className="relative mb-4 grid place-items-center"
          style={{
            height: sm ? "106px" : "170px",
            width: sm ? "140px" : "220px",
            perspective: sm ? "800px" : "1000px",
          }}
        >
          {/* Back panel */}
          <motion.div
            className="absolute rounded-xl shadow-lg"
            animate={{ rotateX: hovered ? -15 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            style={{
              backgroundColor: folderBackColor,
              transformOrigin: "bottom center",
              zIndex: 10,
              height: sm ? "58px" : "96px",
              width: sm ? "76px" : "128px",
            }}
          />
          {/* Tab */}
          <motion.div
            className="absolute rounded-t-lg"
            animate={{ rotateX: hovered ? -25 : 0, y: hovered ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            style={{
              backgroundColor: folderTabColor,
              left: sm ? "38px" : "62px",
              top: sm ? "24px" : "38px",
              height: sm ? "10px" : "16px",
              width: sm ? "28px" : "48px",
              transformOrigin: "bottom center",
              zIndex: 10,
            }}
          />

          {visibleProjects.map((project, index) => {
            const position = positions[index] ?? positions[1]!;
            return (
              <motion.button
                key={project.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/70 bg-white text-left shadow-2xl"
                style={{
                  height: sm ? "70px" : "112px",
                  width: sm ? "48px" : "80px",
                  zIndex: position.z,
                }}
                initial={false}
                animate={{
                  x: hovered ? position.x - (sm ? 24 : 40) : sm ? -24 : -40,
                  y: hovered ? (sm ? -88 : -142) : sm ? -34 : -56,
                  rotate: hovered ? position.rotate : 0,
                  scale: hovered ? 1 : 0.55,
                  opacity: hovered ? 1 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 20,
                  delay: hovered ? index * 0.05 : 0,
                }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <span
                  className="absolute bottom-1.5 left-1.5 right-1.5 truncate font-semibold text-white"
                  style={{ fontSize: sm ? "8px" : "10px" }}
                >
                  {project.title}
                </span>
              </motion.button>
            );
          })}

          {/* Front panel */}
          <motion.div
            className="absolute rounded-xl shadow-xl"
            animate={{ rotateX: hovered ? 25 : 0, y: hovered ? 8 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            style={{
              backgroundColor: folderFrontColor,
              top: sm ? "calc(50% - 27px)" : "calc(50% - 44px)",
              transformOrigin: "bottom center",
              zIndex: 30,
              height: sm ? "58px" : "96px",
              width: sm ? "76px" : "128px",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,.38),transparent_50%)]"
            animate={{ rotateX: hovered ? 25 : 0, y: hovered ? 8 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            style={{
              top: sm ? "calc(50% - 27px)" : "calc(50% - 44px)",
              transformOrigin: "bottom center",
              zIndex: 31,
              height: sm ? "58px" : "96px",
              width: sm ? "76px" : "128px",
            }}
          />
        </div>

        <h3
          className={cn(
            "relative font-semibold tracking-tight text-zinc-950 transition duration-300 dark:text-white",
            sm ? "text-sm" : "text-lg",
          )}
        >
          {title}
        </h3>
        <p className={cn("relative mt-1 text-zinc-500 dark:text-zinc-400", sm ? "text-xs" : "text-sm")}>
          {projects.length} projects
        </p>
        <p
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-zinc-400 transition duration-300 dark:text-zinc-500"
          style={{
            fontSize: sm ? "10px" : "12px",
            opacity: hovered ? 0 : 1,
            transform: hovered ? "translate(-50%, 10px)" : "translate(-50%, 0)",
          }}
        >
          Hover to explore
        </p>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(null);
              }}
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              aria-label="Previous project"
              disabled={activeIndex === 0}
              onClick={(event) => {
                event.stopPropagation();
                navigate(-1);
              }}
              className="absolute left-5 grid size-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-20"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              aria-label="Next project"
              disabled={activeIndex === projects.length - 1}
              onClick={(event) => {
                event.stopPropagation();
                navigate(1);
              }}
              className="absolute right-5 grid size-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-20"
            >
              <ChevronRight className="size-6" />
            </button>

            <motion.div
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl"
              initial={{ scale: 0.86, y: 36, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="h-[58vh] max-h-[560px] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-4 border-t border-zinc-200 bg-white p-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                    {activeProject.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Use arrow keys to browse the folder.
                  </p>
                </div>
                {activeProject.href ? (
                  <a
                    href={activeProject.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    View
                    <ArrowUpRight className="size-4" />
                  </a>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default ThreeDFolder;
