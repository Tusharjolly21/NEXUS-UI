"use client";

import { AutoAdvancingTabs } from "@/components/blocks/motion-kit/auto-advancing-tabs";
import { DrawnTimeline } from "@/components/blocks/motion-kit/drawn-timeline";
import { IntegrationsOrbit } from "@/components/blocks/motion-kit/integrations-orbit";
import type { BlockPlaygrounds } from "./types";

const ACCENT_NOTE = "Any CSS colour. Left unset it is Apple blue, brightening in dark mode.";

const playgrounds: BlockPlaygrounds = {
  "mk-auto-advancing-tabs": {
    Component: AutoAdvancingTabs,
    props: [
      { name: "title", type: "string", description: "Heading above the tab list.", defaultValue: '"One workspace, four jobs done."' },
      {
        name: "accent",
        type: "string",
        description: `Progress bars, focus rings and the accents inside the visuals. ${ACCENT_NOTE}`,
        defaultValue: '"#0071e3"',
      },
      {
        name: "duration",
        type: "number",
        description: "Seconds each tab stays up before advancing.",
        defaultValue: "6",
        min: 2,
        max: 12,
        step: 1,
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Advances to the next tab on its own while on screen. Hover or keyboard focus pauses it.",
        defaultValue: "true",
      },
      {
        name: "tabs",
        type: "AutoAdvancingTab[]",
        description: "Tabs: title, body, a visual component V (gets { live }), a light tint and an optional dark tint for the panel.",
        defaultValue: "DEFAULT_AUTO_ADVANCING_TABS",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "AutoAdvancingTabs",
    importLine: 'import { AutoAdvancingTabs } from "@/components/blocks/motion-kit/auto-advancing-tabs";',
  },
  "mk-drawn-timeline": {
    Component: DrawnTimeline,
    props: [
      { name: "title", type: "string", description: "Heading above the timeline.", defaultValue: '"Live in an afternoon."' },
      { name: "eyebrow", type: "string", description: "Small accent line above the heading.", defaultValue: '"How it works"' },
      {
        name: "accent",
        type: "string",
        description: `Line gradient start, filled nodes, eyebrow and step meta. ${ACCENT_NOTE}`,
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Draws the line on a 9 s loop instead of following the page scroll.",
        defaultValue: "false",
      },
      {
        name: "steps",
        type: "DrawnTimelineStep[]",
        description: "Steps in order: title, body and a short meta line (e.g. how long it takes).",
        defaultValue: "DEFAULT_DRAWN_TIMELINE_STEPS",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "DrawnTimeline",
    importLine: 'import { DrawnTimeline } from "@/components/blocks/motion-kit/drawn-timeline";',
  },
  "mk-integrations-orbit": {
    Component: IntegrationsOrbit,
    props: [
      {
        name: "title",
        type: "string",
        description: "Heading on the left.",
        defaultValue: '"Plays well with the 120 apps you already pay for."',
      },
      { name: "eyebrow", type: "string", description: "Small accent line above the heading.", defaultValue: '"Integrations"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue:
          '"Two-way sync, not imports. Change something in one place and it\'s changed everywhere, usually within a second."',
      },
      { name: "linkLabel", type: "string", description: "Text of the link under the paragraph.", defaultValue: '"Browse all integrations"' },
      { name: "brand", type: "string", description: "A character or two shown in the centre mark.", defaultValue: '"L"' },
      {
        name: "accent",
        type: "string",
        description: `Centre mark gradient, its pulse, eyebrow and link. ${ACCENT_NOTE}`,
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Spins the rings. Hovering, focusing or tapping a tile stops them to show its name.",
        defaultValue: "true",
      },
      {
        name: "rings",
        type: "IntegrationsOrbitRing[]",
        description: "Rings on a 560-unit stage: radius, speed in degrees per second (negative reverses) and the app tiles on it.",
        defaultValue: "DEFAULT_INTEGRATIONS_ORBIT_RINGS",
      },
      { name: "onBrowse", type: "() => void", description: "Called when the link is pressed. The link never navigates on its own." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "IntegrationsOrbit",
    importLine: 'import { IntegrationsOrbit } from "@/components/blocks/motion-kit/integrations-orbit";',
  },
};

export default playgrounds;
