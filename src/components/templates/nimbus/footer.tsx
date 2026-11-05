"use client";

import { Icon, type IconName } from "./icons";
import { INK, MUTED, SURFACE } from "./theme";

const COLUMNS: [string, string[]][] = [
  ["Nimbus", ["Features", "Radar", "Widgets", "Pricing"]],
  ["Support", ["Help centre", "Data sources", "Contact"]],
  ["Company", ["About", "Press", "Careers"]],
  ["Legal", ["Privacy", "Terms", "Accessibility"]],
];

const SOCIAL: { label: string; icon: IconName }[] = [
  { label: "X", icon: "x-logo" },
  { label: "Instagram", icon: "instagram-logo" },
  { label: "YouTube", icon: "youtube-logo" },
];

/** The page footer. Every link points at "#": wire them up to your own pages. */
export function Footer() {
  return (
    <footer className="px-5 pb-12 pt-10 text-[12px]" style={{ background: SURFACE, color: MUTED }}>
      <div className="mx-auto max-w-[1024px]">
        <p className="m-0 border-b pb-4 leading-[1.6]" style={{ borderColor: "#d2d2d7" }}>
          Forecasts combine national weather services, radar networks and the Nimbus short-range model. Accuracy varies by location. Air quality data may be
          delayed by up to an hour.
        </p>
        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-4">
          {COLUMNS.map(([heading, links]) => (
            <div key={heading}>
              <div className="font-semibold" style={{ color: INK }}>
                {heading}
              </div>
              <ul className="m-0 mt-2.5 grid gap-2 p-0">
                {links.map((link) => (
                  <li key={link} className="list-none">
                    <a href="#" onClick={(event) => event.preventDefault()} className="nb-ring rounded no-underline outline-none hover:underline" style={{ color: MUTED }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "#d2d2d7" }}>
          <span>Copyright © 2026 Nimbus Weather Ltd. All rights reserved. A template: Nimbus, the company name and the figures are sample content.</span>
          <span className="flex gap-3">
            {SOCIAL.map(({ label, icon }) => (
              <a key={label} href="#" onClick={(event) => event.preventDefault()} aria-label={label} className="nb-ring rounded outline-none hover:opacity-70" style={{ color: MUTED }}>
                <Icon name={icon} size={16} />
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
