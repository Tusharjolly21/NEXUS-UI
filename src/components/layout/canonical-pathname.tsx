"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * The page's address, for pages served through a rewrite. A cached copy such as src/app/(static)/components-static is
 * reached through a rewrite (the visitor's address stays /components), but while it is built the server only knows the
 * internal route, so anything that reads usePathname() (the nav's active tab, the sidebar's open group) would render for
 * the wrong address and flash into place once the page loads. The cached routes wrap their layouts in this with the
 * address visitors really use; everywhere else it returns the real pathname.
 */
const Override = React.createContext<string | null>(null);

export function CanonicalPathname({ path, children }: { path: string; children: React.ReactNode }) {
  return <Override.Provider value={path}>{children}</Override.Provider>;
}

/** usePathname(), unless a cached route has said which address it stands for. */
export function useCanonicalPathname(): string {
  const real = usePathname();
  const override = React.useContext(Override);
  return override ?? real ?? "/";
}
