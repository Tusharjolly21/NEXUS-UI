"use client";

import * as React from "react";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const KEY = "nx-docs-pm";
const EVENT = "nx-docs-pm-change";

function read(): PackageManager {
  try {
    const v = window.localStorage.getItem(KEY);
    return (PACKAGE_MANAGERS as readonly string[]).includes(v ?? "") ? (v as PackageManager) : "npm";
  } catch {
    return "npm";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The reader's package manager, shared by every command block in the docs and remembered. */
export function usePackageManager(): [PackageManager, (pm: PackageManager) => void] {
  const pm = React.useSyncExternalStore(subscribe, read, () => "npm" as PackageManager);
  const set = React.useCallback((next: PackageManager) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: the choice still applies until the page reloads
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [pm, set];
}

const COMMAND_LINE = /^\s*(npx |npm (install|i|run|create) |cd )/;

/** True when every line is a shell command we know how to translate. */
export function isPackageCommand(code: string) {
  const lines = code.split("\n").filter((l) => l.trim());
  return lines.length > 0 && lines.every((l) => COMMAND_LINE.test(l)) && lines.some((l) => !/^\s*cd /.test(l));
}

/** Rewrite npm/npx commands for another package manager. */
export function toPackageManager(code: string, pm: PackageManager) {
  if (pm === "npm") return code;
  return code
    .split("\n")
    .map((line) => {
      const npx = line.match(/^(\s*)npx (.*)$/);
      if (npx) return `${npx[1]}${pm === "pnpm" ? "pnpm dlx" : pm === "yarn" ? "yarn dlx" : "bunx --bun"} ${npx[2]}`;
      const install = line.match(/^(\s*)npm (?:install|i)(.*)$/);
      if (install) return `${install[1]}${pm} add${install[2]}`;
      const run = line.match(/^(\s*)npm run (.*)$/);
      if (run) return `${run[1]}${pm === "bun" ? "bun run" : pm} ${run[2]}`;
      const create = line.match(/^(\s*)npm create (.*)$/);
      if (create) return `${create[1]}${pm} create ${create[2]}`;
      return line;
    })
    .join("\n");
}
