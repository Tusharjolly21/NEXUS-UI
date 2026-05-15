"use client";

import * as React from "react";

export function ThemeReceiver({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "nexus-theme") {
        document.documentElement.classList.toggle("dark", e.data.dark === true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  return <>{children}</>;
}
