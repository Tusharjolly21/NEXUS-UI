"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ProjectIndex } from "@/components/project-index";
import type { Playground } from "../playground-types";

const PLAYGROUND_PHOTOS = [
  { src: "/images/motion-kit/photos/reine-lofoten.jpg", title: "Reine, Lofoten" },
  { src: "/images/motion-kit/photos/torres-del-paine.jpg", title: "Torres del Paine" },
  { src: "/images/motion-kit/photos/antelope-canyon.jpg", title: "Antelope Canyon" },
  { src: "/images/motion-kit/photos/ice-cave.jpg", title: "Ice cave" },
  { src: "/images/motion-kit/photos/dunes-at-dusk.jpg", title: "Dunes at dusk" },
  { src: "/images/motion-kit/photos/fjord.jpg", title: "Fjord" },
  { src: "/images/motion-kit/photos/waterfall.jpg", title: "Waterfall" },
];

export const playground: Playground = {
    lightOnly: true,
    componentName: "ProjectIndex",
    importPath: "@/components/project-index",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[1000px] justify-center">
        <ProjectIndex
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          enableSound={v.enableSound as boolean}
          photos={PLAYGROUND_PHOTOS}
        />
      </div>
    ),
  };
