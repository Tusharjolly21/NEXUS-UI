"use client";

import * as React from "react";

type Registry = typeof import("@/components/nx-icons/registry").NX_ICONS;

/**
 * The live icon shown beside a search result. The icon registry (all the animated icons) is loaded only
 * when an icon is highlighted, so opening the palette never pays for it. The icon replays every couple of
 * seconds, so a hover-triggered one is seen in motion without the pointer being on it.
 */
export function IconSearchPreview({ slug }: { slug: string }) {
  const [registry, setRegistry] = React.useState<Registry | null>(null);
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    void import("@/components/nx-icons/registry").then((m) => {
      if (alive) setRegistry(() => m.NX_ICONS);
    });
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const step = (next: boolean) => {
      setOn(next);
      timer = setTimeout(() => step(!next), next ? 1500 : 700);
    };
    timer = setTimeout(() => step(true), 250);
    return () => clearTimeout(timer);
  }, [slug]);

  const Icon = registry?.[slug];
  return (
    <div className="grid h-full place-items-center text-foreground">
      {Icon ? <Icon key={slug} size={72} play={on} /> : <span aria-hidden className="size-[72px]" />}
    </div>
  );
}
