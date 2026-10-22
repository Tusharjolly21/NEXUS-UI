import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import { createMetadata } from "@/lib/seo";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { AdSenseScript, SiteAnalytics } from "@/components/providers/analytics";
import { ConsentBanner } from "@/components/providers/consent-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Code and install commands only.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b10" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="nexus-ui-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link
            rel="preconnect"
            href={new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin}
          />
        )}
      </head>
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/25 selection:text-foreground"
      >
        <AppProviders>{children}</AppProviders>
        {/* Google Analytics and AdSense wait for the cookie banner. Cloudflare, Vercel Analytics, Speed Insights (no cookies): skipped in browsers that opted out (?notrack=1). */}
        <SiteAnalytics />
        <AdSenseScript />
        <ConsentBanner />
      </body>
    </html>
  );
}
