import type { ReactNode } from "react";

/** Page chrome shared by the sign-in screens: dotted grid, bloom, centred heading + card. */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="pg-dotgrid relative isolate -mt-[64px] flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-[120px]">
      <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-[440px]">
        <div className="flex flex-col items-center text-center">
          <h1 className="pg-display text-[clamp(44px,8vw,60px)] text-foreground">{title}</h1>
          <p className="mt-3 max-w-[360px] text-[17px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <section className="pg-float mt-8 rounded-tile bg-card p-6 text-center sm:p-7">{children}</section>
      </div>
    </div>
  );
}
