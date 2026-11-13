"use client";

import { motion } from "framer-motion";
import { BOUNCY, COLOR, FONT_DISPLAY, INK } from "./theme";
import { Icon, Logo, type IconName } from "./ui";
/** A pill with wavy long sides, as an SVG path of the given size: the footer links are drawn on it. */
export function wavyPath(width: number, height: number) {
  const radius = height / 2;
  const waves = 3;
  const step = (width - height) / waves;
  let d = `M${radius} 0`;
  for (let wave = 0; wave < waves; wave++) {
    d += ` Q${radius + step * (wave + 0.5)} ${wave % 2 ? 14 : -10} ${radius + step * (wave + 1)} 0`;
  }
  d += ` A${radius} ${radius} 0 0 1 ${width - radius} ${height}`;
  for (let wave = waves - 1; wave >= 0; wave--) {
    d += ` Q${radius + step * (wave + 0.5)} ${height + (wave % 2 ? -14 : 10)} ${radius + step * wave} ${height}`;
  }
  return `${d} A${radius} ${radius} 0 0 1 ${radius} 0 Z`;
}
/** The footer: email, socials, and the sections as big wavy pills that wobble on hover. */
export function Footer() {
  const links: [label: string, section: string, color: string][] = [
    ["Home", "home", COLOR.sky],
    ["About", "about", COLOR.yellow],
    ["Work", "work", COLOR.green],
    ["Contact", "contact", COLOR.orange],
    ["Services", "services", COLOR.lilac],
    ["Process", "process", COLOR.pink],
  ];
  const socials: [label: string, icon: IconName][] = [
    ["Instagram", "ph:instagram-logo"],
    ["TikTok", "ph:tiktok-logo"],
    ["LinkedIn", "ph:linkedin-logo"],
    ["YouTube", "ph:youtube-logo"],
  ];
  const badgePath = wavyPath(460, 210);
  return (
    <footer
      className="overflow-hidden rounded-t-[32px] px-4 pb-10 pt-20 sm:rounded-t-[40px]"
      style={{
        background: INK,
      }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col items-center text-center">
        <span className="grid h-28 w-28 place-items-center rounded-full bg-white">
          <Logo size={30} />
        </span>
        <a
          href="mailto:hello@hoopla.studio"
          className="hp-ring mt-6 rounded text-[18px] no-underline outline-none"
          style={{
            color: "rgba(255,255,255,.6)",
          }}
        >
          hello@hoopla.studio
        </a>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {socials.map(([label, icon]) => (
            <motion.a
              href="#"
              onClick={(event) => event.preventDefault()}
              whileHover={{
                y: -3,
                rotate: -3,
              }}
              transition={BOUNCY}
              className="hp-ring flex items-center gap-2 rounded-full px-4 py-2.5 text-[16px] font-semibold text-white no-underline outline-none"
              style={{
                boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.5)",
              }}
              key={label}
            >
              {label}
              <Icon name={icon} size={18} />
            </motion.a>
          ))}
        </div>
        <nav
          aria-label="Footer"
          className="mt-14 grid w-full max-w-[1100px] grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3"
        >
          {links.map(([label, section, color], index) => (
            <motion.button
              type="button"
              data-cursor="Visit"
              onClick={() =>
                document.getElementById(section)?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="hp-ring relative rounded-[40px] outline-none"
              initial={{
                y: 60,
                opacity: 0,
              }}
              whileInView={{
                y: 0,
                opacity: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                ...BOUNCY,
                delay: index * 0.06,
              }}
              whileHover={{
                y: -10,
                rotate: index % 2 ? 3 : -3,
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.95,
              }}
              key={section}
            >
              <svg
                viewBox="-16 -16 492 242"
                className="block h-auto w-full"
                aria-hidden={true}
              >
                <path d={badgePath} fill={color} />
              </svg>
              <span
                className="absolute inset-0 grid place-items-center uppercase"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: INK,
                  fontSize: "clamp(34px, 6vw, 92px)",
                  opacity: 0.88,
                }}
              >
                {label}
              </span>
            </motion.button>
          ))}
        </nav>
        <p
          className="m-0 mt-14 text-[14px]"
          style={{
            color: "rgba(255,255,255,.45)",
          }}
        >
          Hoopla is a fictional studio made for this template. Portraits by
          Notionists (CC0).
        </p>
      </div>
    </footer>
  );
}
