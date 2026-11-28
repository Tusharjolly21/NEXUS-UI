"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { LivePropsPlayground } from "@/components/library/props-playground";
import { loadPlayground } from "@/lib/catalog/playgrounds";

type Props = { slug: string; name: string; description: string; locked: boolean };

/**
 * The "Play with it" section of a component page. A playground imports the component it plays with, so each one is its own
 * module and a page loads only the one it shows (the old single file held about 370 of them, about 2.8 MB of script on every
 * component page). It is still rendered on the server, so the section is in the page's HTML as before.
 */
const sections = new Map<string, React.ComponentType<Props>>();

function sectionFor(slug: string): React.ComponentType<Props> {
  let found = sections.get(slug);
  if (!found) {
    found = dynamic<Props>(
      async () => {
        const playground = await loadPlayground(slug);
        const Section = ({ name, description, locked }: Props) =>
          playground ? (
            <section aria-labelledby="playground-heading" className="mt-20">
              <h2 id="playground-heading" className="pg-display scroll-mt-28 text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
                Play with it
              </h2>
              <p className="mb-6 mt-3 max-w-[560px] text-[17px] text-muted-foreground">
                {playground.blurb ?? "Move the controls and watch it change. Copy code gives you a snippet with only the props you changed."}
              </p>
              <LivePropsPlayground playground={playground} name={name} description={description} locked={locked} />
            </section>
          ) : null;
        return { default: Section };
      },
      // while it loads (a client-side visit), hold the section's place so the page below does not jump
      { loading: () => <section aria-hidden className="mt-20 min-h-[560px]" /> },
    );
    sections.set(slug, found);
  }
  return found;
}

export function LivePlaygroundSection(props: Props) {
  // cached per slug, so it is the same component on every render (as in DynamicPreview)
  // eslint-disable-next-line react-hooks/static-components
  const Section = sectionFor(props.slug);
  // eslint-disable-next-line react-hooks/static-components
  return <Section {...props} />;
}
