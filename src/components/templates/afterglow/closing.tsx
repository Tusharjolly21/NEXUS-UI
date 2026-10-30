import { BRAND, CTA, FOOTER } from "./data";
import { Logo, Button } from "./ui";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden pb-32 pt-40 sm:pb-40 sm:pt-48">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[90px] h-[1600px] w-[2400px] -translate-x-1/2 rounded-[50%] shadow-[0_-1px_0_rgba(255,197,138,.85),0_-30px_120px_-20px_rgba(255,122,47,.55)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[900px] max-w-[110vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,122,47,.28),transparent)] blur-2xl"
      />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center px-5 text-center sm:px-8">
        <span className="mb-8">
          <Logo size={44} />
        </span>
        <h2 className="max-w-[16ch] text-[clamp(38px,6.4vw,76px)] font-semibold leading-[1] tracking-[-0.05em] text-[#f3efe9]">
          {CTA.title}
        </h2>
        <p className="mt-5 max-w-[46ch] text-[18px] leading-[1.55] text-[#a39c94]">{CTA.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="#signup" size="lg">
            {CTA.primary}
          </Button>
          <Button href="#demo" variant="ghost" size="lg">
            {CTA.secondary}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[.07]">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col items-start gap-4">
          <a
            href="#top"
            className="flex items-center gap-2.5 rounded-md text-[16px] font-semibold tracking-[-0.02em] text-[#f3efe9] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
          >
            <Logo />
            {BRAND.name}
          </a>
          <p className="max-w-[32ch] text-[14.5px] leading-[1.55] text-[#a39c94]">{FOOTER.blurb}</p>
          <a
            href="#status"
            className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-[#d9d3cb] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] outline-none hover:bg-white/[.04] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#5ee6a3] opacity-60 motion-reduce:hidden" />
              <span className="relative h-2 w-2 rounded-full bg-[#5ee6a3]" />
            </span>
            All systems normal
          </a>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER.columns.map((e) => (
            <div key={e.title} className="flex flex-col gap-3">
              <h3 className="text-[14px] font-medium text-[#f3efe9]">{e.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {e.links.map((t) => (
                  <li key={t}>
                    <a
                      href={`#${t.toLowerCase().replace(/\s+/g, "-")}`}
                      className="rounded text-[14px] text-[#a39c94] outline-none hover:text-[#f3efe9] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-white/[.05] px-5 py-6 text-[13px] text-[#6a645e] sm:px-8">
        <span>{FOOTER.copyright}</span>
        <a
          href="#top"
          className="rounded outline-none hover:text-[#f3efe9] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
        >
          Back to top
        </a>
      </div>
    </footer>
  );
}
