import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { createMetadata } from "@/lib/seo";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/**
 * No `next/font/google` here — it can block `next dev` / compile when font metadata
 * fetches stall (offline VPN, IPv6, corporate proxy). Fonts come from `globals.css` stacks.
 */
export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          id="nexus-ui-theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/25 selection:text-foreground"
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
