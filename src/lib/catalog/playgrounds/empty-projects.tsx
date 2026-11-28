"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { EmptyProjects } from "@/components/empty-projects";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EmptyProjects",
    importPath: "@/components/empty-projects",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Projects", "Workspaces", "Sites"], defaultValue: "Projects" },
      { kind: "select", prop: "emptyTitle", label: "Headline", options: ["No projects yet", "Nothing here yet", "Start your first project"], defaultValue: "No projects yet" },
      { kind: "select", prop: "emptyDescription", label: "Subline", options: ["Pick a starting point. You can change everything later.", "Choose a template to get going.", "It takes about a minute."], defaultValue: "Pick a starting point. You can change everything later." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyProjects key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        emptyTitle={v.emptyTitle as string}
        emptyDescription={v.emptyDescription as string}
      />
    ),
  };
