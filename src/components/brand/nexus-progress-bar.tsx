"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

// Local Converge loader — same primitive as NexusSplash but smaller,
// used for route-transition state (no separate import avoids circular deps).
function NavConverge({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes nxnav-p1 { 0%,100%{opacity:1} 33%{opacity:.12} 66%{opacity:.12} }
        @keyframes nxnav-p2 { 0%,100%{opacity:.12} 33%{opacity:1} 66%{opacity:.12} }
        @keyframes nxnav-p3 { 0%,100%{opacity:.12} 33%{opacity:.12} 66%{opacity:1} }
        @keyframes nxnav-l1 { 0%,100%{stroke-dashoffset:23} 33%{stroke-dashoffset:0} 66%{stroke-dashoffset:23} }
        @keyframes nxnav-l2 { 0%{stroke-dashoffset:30} 33%,100%{stroke-dashoffset:30} 66%{stroke-dashoffset:0} }
        @keyframes nxnav-l3 { 0%{stroke-dashoffset:30} 66%{stroke-dashoffset:0} 100%{stroke-dashoffset:30} }
        @keyframes nxnav-core { 0%,100%{r:5} 50%{r:6.5} }
        @media(prefers-reduced-motion:reduce){.nxnav-a{animation:none!important}}
      `}</style>
      <circle cx="32" cy="6"  r="3" fill="currentColor" className="nxnav-a"
        style={{ animation: "nxnav-p1 1.8s ease-in-out infinite" }} />
      <circle cx="6"  cy="50" r="3" fill="currentColor" className="nxnav-a"
        style={{ animation: "nxnav-p2 1.8s ease-in-out infinite" }} />
      <circle cx="58" cy="50" r="3" fill="currentColor" className="nxnav-a"
        style={{ animation: "nxnav-p3 1.8s ease-in-out infinite" }} />
      <path d="M32 9 L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="23" className="nxnav-a"
        style={{ animation: "nxnav-l1 1.8s ease-in-out infinite" }} />
      <path d="M9 49 L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="30" className="nxnav-a"
        style={{ animation: "nxnav-l2 1.8s ease-in-out infinite" }} />
      <path d="M55 49 L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="30" className="nxnav-a"
        style={{ animation: "nxnav-l3 1.8s ease-in-out infinite" }} />
      <circle cx="32" cy="32" r="5" fill="oklch(0.86 0.13 215)" className="nxnav-a"
        style={{ animation: "nxnav-core 1.8s ease-in-out infinite" }} />
      <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function NexusProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const start = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(showTimerRef.current);
    clearTimeout(maxTimerRef.current);
    // 120ms delay — instant navigations never flash the loader
    showTimerRef.current = setTimeout(() => setVisible(true), 120);
    maxTimerRef.current = setTimeout(() => setVisible(false), 6000);
  }, []);

  const stop = useCallback(() => {
    clearTimeout(showTimerRef.current);
    clearTimeout(maxTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 200);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => stop(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      start();
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [start, pathname]);

  useEffect(() => {
    window.addEventListener("pageshow", stop);
    return () => window.removeEventListener("pageshow", stop);
  }, [stop]);

  if (!visible) return null;

  return (
    <div
      aria-label="Navigating"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        // subtle dark veil so the loader reads clearly on any page
        background: "rgba(8,8,10,0.35)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div style={{ color: "#ECE7DF" }}>
        <NavConverge size={80} />
      </div>
    </div>
  );
}
