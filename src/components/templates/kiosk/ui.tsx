"use client";

import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cover } from "./cover";
import { getCategory, type Story } from "./data";
import { AVATAR_SVGS, ICONS } from "./icons";
import { routeHref, useSite, type Route } from "./router";
import { COLOR, EASE } from "./theme";
export type IconName = keyof typeof ICONS;

/** Phosphor icons (MIT), inlined from Iconify so the template needs no icon package. */
export function Icon({
  name,
  size = 16,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden={true}
      dangerouslySetInnerHTML={{
        __html: ICONS[name] ?? "",
      }}
    />
  );
}
/** The writers' faces: Notionists by Zoish (CC0), drawn as SVG and turned into image URLs once. */
export const AVATAR_URLS = Object.fromEntries(
  Object.entries(AVATAR_SVGS).map(([name, svg]) => [name, `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`]),
) as Record<string, string>;
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    // a tiny inline SVG data URL: next/image adds nothing here
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={AVATAR_URLS[name]}
      alt=""
      aria-hidden={true}
      width={size}
      height={size}
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1px ${COLOR.line}`,
      }}
    />
  );
}
type LinkProps = {
  to: Route;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  label?: string;
  /** the word the custom cursor shows over this link */
  cursor?: string;
};

/** A real link (it has an href, so it opens in a new tab too) that changes page without reloading. */
export function Link({ to, children, className = "", style, onClick, label, cursor }: LinkProps) {
  const { go } = useSite();
  return (
    <a
      href={routeHref(to)}
      aria-label={label}
      data-cursor={cursor}
      onClick={(event) => {
        event.preventDefault();
        if (onClick != null) {
          onClick();
        }
        go(to);
      }}
      className={`ks-ring no-underline outline-none ${className}`}
      style={{
        color: "inherit",
        ...style,
      }}
    >
      {children}
    </a>
  );
}
type ArrowButtonProps = {
  children: ReactNode;
  /** a page to go to; without it this is a button */
  to?: Route;
  dark?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
};

/** A pill button whose arrow slides out and a new one slides in on hover. */
export function ArrowButton({ children, to, dark = false, onClick, className = "", type }: ArrowButtonProps) {
  const classes = `ks-ring group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium outline-none transition-[background,box-shadow,transform] active:scale-[.97] ${className}`;
  const look = dark
    ? {
        background: COLOR.ink,
        color: "#fff",
      }
    : {
        background: "#fff",
        color: COLOR.ink,
        boxShadow: `inset 0 0 0 1px ${COLOR.line}`,
      };
  const content = (
    <Fragment>
      {children}
      <span
        className="relative inline-block overflow-hidden"
        style={{
          width: 13,
          height: 13,
        }}
      >
        <span className="absolute inset-0 transition-transform duration-300 group-hover:translate-x-[140%]">
          <Icon name="ph:arrow-right" size={13} />
        </span>
        <span className="absolute inset-0 -translate-x-[140%] transition-transform duration-300 group-hover:translate-x-0">
          <Icon name="ph:arrow-right" size={13} />
        </span>
      </span>
    </Fragment>
  );
  if (to) {
    return (
      <Link to={to} className={classes} style={look} onClick={onClick}>
        {content}
      </Link>
    );
  } else {
    return (
      <button type={type ?? "button"} onClick={onClick} className={classes} style={look}>
        {content}
      </button>
    );
  }
}
export function Pill({ children, onImage = false }: { children: ReactNode; onImage?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium"
      style={
        onImage
          ? {
              background: "rgba(255,255,255,.92)",
              color: COLOR.ink,
              backdropFilter: "blur(8px)",
            }
          : {
              background: COLOR.panel,
              color: COLOR.ink,
            }
      }
    >
      {children}
    </span>
  );
}
export function StoryMeta({ story, light = false }: { story: Story; light?: boolean }) {
  return (
    <span
      className="flex items-center gap-2 text-[12.5px]"
      style={{
        color: light ? "rgba(255,255,255,.8)" : COLOR.soft,
      }}
    >
      {story.date}
      <i
        className="h-[3px] w-[3px] rounded-full"
        style={{
          background: "currentColor",
        }}
      />
      {story.min} min read
    </span>
  );
}
type RevealHeadingProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3";
  delay?: number;
};

/** A heading whose words rise in out of a blur, one after another, the first time it scrolls into view. */
export function RevealHeading({ text, className = "", style, as = "h2", delay = 0 }: RevealHeadingProps) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag
      className={`m-0 font-semibold ${className}`}
      style={{
        letterSpacing: "-0.045em",
        lineHeight: 1,
        color: COLOR.ink,
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((word, index) => (
        <motion.span
          className="inline-block whitespace-pre"
          initial={{
            opacity: 0,
            y: 18,
            filter: "blur(10px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.6,
          }}
          transition={{
            duration: 0.8,
            ease: EASE,
            delay: delay + index * 0.06,
          }}
          key={index}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
/** Fades and lifts its children in, once, as they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: y,
        filter: "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.9,
        ease: EASE,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
/** The bookmark: saves a story to the reading list in the drawer. */
export function SaveButton({ slug, onImage = false, size = 34 }: { slug: string; onImage?: boolean; size?: number }) {
  const { saved, toggleSave } = useSite();
  const isSaved = saved.includes(slug);
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.82,
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSave(slug);
      }}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save article"}
      className="ks-ring grid place-items-center rounded-full outline-none"
      style={{
        width: size,
        height: size,
        background: onImage ? "rgba(255,255,255,.92)" : "#fff",
        color: COLOR.ink,
        boxShadow: onImage ? "0 4px 14px -6px rgba(0,0,0,.4)" : `inset 0 0 0 1px ${COLOR.line}`,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          initial={{
            scale: 0.3,
            rotate: -30,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            rotate: 0,
            opacity: 1,
          }}
          exit={{
            scale: 0.3,
            opacity: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 18,
          }}
          key={String(isSaved)}
        >
          <Icon name={isSaved ? "ph:bookmark-simple-fill" : "ph:bookmark-simple"} size={15} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
type StoryCardProps = {
  story: Story;
  wide?: boolean;
  tall?: boolean;
  index?: number;
};

/** A story in a grid: cover, date, title (highlighted on hover) and a save button that appears on hover. */
export function StoryCard({ story, wide = false, tall = false, index = 0 }: StoryCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={(index % 3) * 0.07} className="h-full">
      <article
        className="group flex h-full flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link
          to={{
            page: "article",
            slug: story.slug,
          }}
          className="relative block overflow-hidden rounded-[20px]"
          label={story.title}
          cursor="Read"
        >
          <Cover
            cover={story.cover}
            hot={hovered}
            className={wide ? "aspect-[16/9]" : tall ? "aspect-[4/5]" : "aspect-[4/3.6]"}
          />
          <span className="absolute left-3 top-3 flex gap-1.5">
            <Pill onImage={true}>{getCategory(story.cat).name}</Pill>
          </span>
          {story.sponsored && (
            <span
              className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-white"
              style={{
                background: "rgba(0,0,0,.35)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon name="ph:sparkle" size={11} />
              Sponsored
            </span>
          )}
          <motion.span
            className="absolute right-3 top-3"
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : -6,
            }}
          >
            <SaveButton slug={story.slug} onImage={true} />
          </motion.span>
        </Link>
        <div className="mt-4">
          <StoryMeta story={story} />
        </div>
        <Link
          to={{
            page: "article",
            slug: story.slug,
          }}
          className="mt-2 block"
        >
          <h3
            className="m-0 font-semibold"
            style={{
              fontSize: wide ? "clamp(21px,2vw,26px)" : 19,
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
              color: COLOR.ink,
            }}
          >
            <span
              style={{
                backgroundImage: `linear-gradient(${COLOR.hi}, ${COLOR.hi})`,
                backgroundSize: hovered ? "100% 38%" : "0% 38%",
                backgroundPosition: "0 88%",
                backgroundRepeat: "no-repeat",
                transition: "background-size .5s cubic-bezier(.16,1,.3,1)",
              }}
            >
              {story.title}
            </span>
          </h3>
        </Link>
        {wide && (
          <p
            className="m-0 mt-2 max-w-[560px] text-[15px] leading-[1.5]"
            style={{
              color: COLOR.soft,
            }}
          >
            {story.dek}
          </p>
        )}
        <div className="mt-4">
          <ArrowButton
            to={{
              page: "article",
              slug: story.slug,
            }}
          >
            Read more
          </ArrowButton>
        </div>
      </article>
    </Reveal>
  );
}
/** A story in the list layout. */
export function StoryRow({ story }: { story: Story }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link
        to={{
          page: "article",
          slug: story.slug,
        }}
        className="group flex items-center gap-4 rounded-[20px] p-2 pr-14 transition-colors hover:bg-[#F6F6F7]"
      >
        <Cover cover={story.cover} hot={hovered} className="h-24 w-32 shrink-0 rounded-[14px] sm:h-28 sm:w-44" />
        <span className="min-w-0 flex-1">
          <span
            className="flex items-center gap-2 text-[12.5px]"
            style={{
              color: COLOR.soft,
            }}
          >
            <span
              className="font-medium"
              style={{
                color: COLOR.ink,
              }}
            >
              {getCategory(story.cat).name}
            </span>
            · {story.date} · {story.min} min
          </span>
          <span
            className="mt-1 block text-[18px] font-semibold leading-snug sm:text-[21px]"
            style={{
              letterSpacing: "-0.03em",
              color: COLOR.ink,
            }}
          >
            {story.title}
          </span>
          <span
            className="mt-1 line-clamp-1 hidden text-[14px] sm:block"
            style={{
              color: COLOR.soft,
            }}
          >
            {story.dek}
          </span>
        </span>
      </Link>
      <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <SaveButton slug={story.slug} />
      </span>
    </div>
  );
}
export function SectionHead({ title, to, sub }: { title: string; to?: Route; sub?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <RevealHeading
          text={title}
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
          }}
        />
        {sub && (
          <p
            className="m-0 mt-3 text-[15px]"
            style={{
              color: COLOR.soft,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {to && <ArrowButton to={to}>View all</ArrowButton>}
    </div>
  );
}
export function StoryGrid({ stories }: { stories: Story[] }) {
  return (
    <div className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-4">
      {stories.slice(0, 6).map((story, index) => {
        const r = index === 0 || index === 5;
        return (
          <div className={r ? "md:col-span-2" : ""} key={story.slug}>
            <StoryCard story={story} wide={r} index={index} />
          </div>
        );
      })}
    </div>
  );
}
