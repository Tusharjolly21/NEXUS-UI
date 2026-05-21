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
      url: `${siteConfig.url}/icon.svg`,
      width: 512,
      height: 512,
    },
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace("@", "")}`,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${siteConfig.url}/contact`,
      email: "contact@nexus-ui.com",
    },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    image: `${siteConfig.url}/api/og?title=Nexus+UI&description=React+UI+Components+%26+Next.js+Templates`,
    priceRange: "Free–$$",
    openingHours: "Mo-Su 00:00-23:59",
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace("@", "")}`,
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "UI Component Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Free Tier",
            description: "Access to free React components, templates, and UI blocks",
          },
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pro Plan",
            description: "Unlimited access to all premium animated React components, Next.js templates, and UI blocks with commercial license",
          },
        },
      ],
    },
  };

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <LandingPage />
    </>
  );
}
