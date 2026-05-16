"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NexusProgressBar } from "@/components/brand/nexus-progress-bar";
import { NexusSplash } from "@/components/brand/nexus-splash";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <NexusSplash />
        <React.Suspense>
          <NexusProgressBar />
        </React.Suspense>
        {children}
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
