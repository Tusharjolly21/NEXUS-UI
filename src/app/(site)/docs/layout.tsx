import { DocsNav } from "@/components/docs/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pg-dotgrid relative -mt-[64px] min-h-[100dvh] px-4 pb-24 pt-[120px]">
      <div aria-hidden className="pg-bloom pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <DocsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
