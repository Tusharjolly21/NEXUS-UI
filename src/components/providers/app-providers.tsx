"use client";

import * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NexusProgressBar } from "@/components/brand/nexus-progress-bar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      if (
        reason instanceof TypeError &&
        reason.message.toLowerCase() === "failed to fetch"
      ) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return (
    <NuqsAdapter>
    <ThemeProvider>
      <TooltipProvider>
        <React.Suspense>
          <NexusProgressBar />
        </React.Suspense>
        {children}
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
    </NuqsAdapter>
  );
}
