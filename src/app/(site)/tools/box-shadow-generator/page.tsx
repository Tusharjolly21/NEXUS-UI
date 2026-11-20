import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { BoxShadowGenerator } from "@/components/tools/box-shadow-generator";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "CSS Box Shadow Generator for Tailwind and CSS",
  description: "Free CSS box-shadow generator: stack up to four layers, preview on light or dark, and copy plain CSS or a Tailwind arbitrary shadow class.",
  alternates: { canonical: "/tools/box-shadow-generator" },
});

const FAQ = [
  {
    q: "How do I use a box shadow in Tailwind CSS?",
    a: "Copy the Tailwind line from the generator and put it in your class list, for example shadow-[0_20px_40px_-26px_rgb(0_0_0_/_35%)]. Tailwind turns the underscores into spaces. For a shadow you reuse, add it to your theme as a named shadow instead.",
  },
  {
    q: "What do the offset, blur and spread values do?",
    a: "The two offsets move the shadow right and down (negative values move it left and up). Blur softens its edge. Spread makes the shadow bigger or smaller than the element before blurring, and a negative spread is how soft, lifted shadows keep tight to the box.",
  },
  {
    q: "Why do good shadows use more than one layer?",
    a: "Real shadows have a sharp part close to the object and a wide soft part further away. One layer cannot do both, so most polished interfaces stack two: a thin, faint outline or contact shadow, and a large, low-opacity one.",
  },
  {
    q: "What does inset do?",
    a: "An inset shadow is drawn inside the element instead of outside, which makes it look pressed in. It is used for inputs, toggles and pressed buttons.",
  },
  {
    q: "Does box-shadow affect performance?",
    a: "A large blur on many elements can be costly to paint, and animating box-shadow forces repaints. If you animate a shadow, fade the opacity of a pseudo-element that holds the larger shadow instead.",
  },
];

export default function BoxShadowPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Box shadow generator", item: `${siteConfig.url}/tools/box-shadow-generator` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(40px,6.4vw,68px)] leading-[1.04] text-foreground">
            CSS box shadow <RainbowWord>generator</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Build a shadow with up to four layers, check it on a light or dark surface, then copy it as plain CSS or as a
            Tailwind class. Free, and nothing leaves your browser.
          </p>
        </div>
      </section>
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <BoxShadowGenerator />
        </div>
      </section>
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 className="pg-display text-[clamp(28px,3.6vw,38px)] leading-[1.08] text-foreground">Questions</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-[17px] font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1.5 text-[15.5px] leading-relaxed text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[15px] text-muted-foreground">
            Want shadows that move? Browse the{" "}
            <Link href="/components/category/cards" className="text-link underline underline-offset-4">
              card components
            </Link>{" "}
            or see how we build a{" "}
            <Link href="/blog/react-bento-grid-tailwind" className="text-link underline underline-offset-4">
              Tailwind bento grid
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
