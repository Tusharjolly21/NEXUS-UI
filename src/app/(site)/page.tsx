import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({ alternates: { canonical: "/" } }),
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

const FAQ_ITEMS = [
  {
    q: "Can I use Nexus-UI in client projects?",
    a: "Premium includes a commercial license for unlimited client work while your subscription or lifetime pass is active.",
  },
  {
    q: "Do components work with the Next.js App Router?",
    a: "Yes. Examples are built around App Router conventions, with client directives only around interactive motion boundaries.",
  },
  {
    q: "Can I customize the components?",
    a: "Yes. Nexus UI is copy-paste first, so you own the JSX, Tailwind classes, tokens, and animation timings.",
  },
  {
    q: "Are the previews real components?",
    a: "The featured previews are real React implementations or lightweight landing-page previews built from the same design language.",
  },
  {
    q: "Does it support dark and light mode?",
    a: "Yes. Core sections use semantic theme tokens so components can adapt to your existing Nexus UI theme.",
  },
  {
    q: "What do I get with templates?",
    a: "Templates combine backgrounds, cards, inputs, pricing, FAQ, and CTA blocks into complete landing page compositions.",
  },
  {
    q: "How do updates work?",
    a: "Premium includes future component drops and template revisions. A changelog ships with every release.",
  },
];

export default function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icon2`,
      width: 192,
      height: 192,
    },
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace("@", "")}`,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@nexus-ui.com",
    },
  };

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <LandingPage />
    </>
  );
}
