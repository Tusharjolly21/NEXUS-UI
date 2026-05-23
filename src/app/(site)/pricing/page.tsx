import { PricingSection } from "@/components/pricing/pricing-section";
import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    description: "Free and premium plans for Nexus UI. Unlock all animated components, Next.js templates, and UI blocks with a one-time license. No subscription.",
    alternates: { canonical: "/pricing" },
  }),
  title: { absolute: "Pricing — Nexus UI React Component Library" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this a one-time payment or subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both options exist. The Lifetime plan is a single one-time payment that gives you permanent access — no renewals, no surprise charges. A monthly subscription is also available if you prefer.",
      },
    },
    {
      "@type": "Question",
      name: "What do I get after purchasing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instant access to every template, component, and block in the library. You can download the full source code, use it in unlimited projects, and access all future additions included in your plan.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this in client projects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The All-Access license covers unlimited commercial and client projects while your plan is active. Build and ship as many products as you want.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer refunds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a 7-day evaluation period for lifetime purchases. If you're not satisfied within 7 days, contact support and we'll process a full refund — no questions asked.",
      },
    },
    {
      "@type": "Question",
      name: "How do I access the code after purchase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After checkout you'll receive account credentials. Log in to the dashboard, navigate to any template or component, and download the source directly. Everything is clean TypeScript with zero lock-in.",
      },
    },
    {
      "@type": "Question",
      name: "Will I get future updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All future template drops, new components, and blocks are included in your plan. A changelog ships with every release so you can stay on top of what's new.",
      },
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nexus UI",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: `${siteConfig.url}/pricing`,
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "0",
      priceCurrency: "USD",
      description: "Free forever. Access to all free components and templates. No card required.",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "99",
      priceCurrency: "USD",
      description: "Full source code for all components, templates, and blocks. Unlimited projects. One-time payment.",
    },
    {
      "@type": "Offer",
      name: "All-Access",
      price: "149",
      priceCurrency: "USD",
      description: "Everything in Pro, plus lifetime access and all future releases. One-time payment.",
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <PricingSection />
    </>
  );
}
