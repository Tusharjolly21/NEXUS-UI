"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { INSTALLATION_NAV } from "@/lib/installation-nav";
import { cn } from "@/lib/utils";

type Props = {
  pathname: string;
  onPick?: () => void;
};

export function InstallationSidebarLinks({ pathname, onPick }: Props) {
  return (
    <div className="space-y-0.5">
      {INSTALLATION_NAV.map((item) => {
        const rowClass = cn(
          "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition",
          !item.external && pathname === item.href
            ? "bg-foreground/5 text-foreground dark:bg-white/10"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
        );
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={rowClass}
            >
              <span>{item.label}</span>
              <ExternalLink className="size-3 shrink-0 opacity-50" aria-hidden />
            </a>
          );
        }
        return (
          <Link key={item.href} href={item.href} onClick={onPick} className={rowClass}>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
