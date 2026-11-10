/**
 * template-sources.ts
 *
 * The one map from a template's catalog slug to the page file that renders it. The source download
 * (`/api/download/template`, via `src/lib/template-zip.ts`) reads it, and the live preview at
 * `/live-preview/template/[slug]` must render the same file and export, so what people preview is
 * exactly what they download. `scripts/verify-template-zips.ts` checks the live-preview page against
 * this map.
 *
 * Pure data: no file system access, safe to import anywhere. It only names files; reading them is
 * gated in the download route.
 */

/** Folder that holds every template page file, relative to the project root. */
export const TEMPLATE_SOURCE_DIR = "src/components/templates";

export type TemplateSource = {
  /** File name inside `TEMPLATE_SOURCE_DIR`. */
  file: string;
  /** The export the live preview renders: a named export, or "default". */
  exportName: string;
};

export const TEMPLATE_SOURCES = {
  "noir-studio": { file: "moon-studio-page.tsx", exportName: "default" },
  "nexus-ai-launch": { file: "nexus-ai-launch-template-page.tsx", exportName: "NexusAiLaunchTemplatePage" },
  "talent-hub-landing": { file: "talent-hub-page.tsx", exportName: "TalentHubPage" },
  "startup-landing-page": { file: "startup-landing-page.tsx", exportName: "StartupLandingPage" },
  "nova-landing-page": { file: "nova-landing-page.tsx", exportName: "NovaLandingPage" },
  "simplistic-saas-template": { file: "simplistic-saas-page.tsx", exportName: "SimplisticSaaSPage" },
  "orbit-ai-page": { file: "orbit-ai-page.tsx", exportName: "default" },
  "synapse-ai-platform": { file: "synapse-ai-page.tsx", exportName: "SynapseAIPage" },
  "helix-ai-platform": { file: "helix-ai-platform.tsx", exportName: "HelixAIPlatformPage" },
  "orion-ai-ops": { file: "orion-ai-ops.tsx", exportName: "OrionAIPage" },
  "pulse-landing": { file: "pulse-landing-page.tsx", exportName: "PulseLandingPage" },
  "aether-portfolio": { file: "aether-portfolio-page.tsx", exportName: "AetherPortfolioPage" },
  "claura-agency": { file: "claura-agency-page.tsx", exportName: "ClauraAgencyPage" },
  "ocean-flow": { file: "ocean-flow-page.tsx", exportName: "OceanFlowPage" },
  "saas-launch-aurora": { file: "saas-launch-aurora-page.tsx", exportName: "default" },
  "ai-startup-forge": { file: "ai-startup-forge-page.tsx", exportName: "default" },
  "macbook-pro-showcase": { file: "gsap-macbook-landing-page.tsx", exportName: "default" },
  "launchfolio-portfolio": { file: "launchfolio-portfolio-page.tsx", exportName: "LaunchfolioPortfolioPage" },
  relay: { file: "relay-page.tsx", exportName: "RelayPage" },
  tally: { file: "tally-page.tsx", exportName: "TallyPage" },
  wayfare: { file: "wayfare-page.tsx", exportName: "WayfarePage" },
  "side-b": { file: "side-b-page.tsx", exportName: "SideBPage" },
  kiln: { file: "kiln-page.tsx", exportName: "KilnPage" },
  cairn: { file: "cairn-page.tsx", exportName: "CairnPage" },
  strata: { file: "strata-page.tsx", exportName: "StrataPage" },
  afterglow: { file: "afterglow-page.tsx", exportName: "AfterglowPage" },
  ferry: { file: "ferry-page.tsx", exportName: "FerryPage" },
  skein: { file: "skein-page.tsx", exportName: "SkeinPage" },
  nimbus: { file: "nimbus-page.tsx", exportName: "NimbusPage" },
  margin: { file: "margin-page.tsx", exportName: "MarginPage" },
  "last-light": { file: "last-light-page.tsx", exportName: "LastLightPage" },
  kiosk: { file: "kiosk-page.tsx", exportName: "KioskPage" },
  wharf: { file: "wharf-page.tsx", exportName: "WharfPage" },
  plotline: { file: "plotline-page.tsx", exportName: "PlotlinePage" },
  hoopla: { file: "hoopla-page.tsx", exportName: "HooplaPage" },
} as const satisfies Record<string, TemplateSource>;

export type TemplateSourceSlug = keyof typeof TEMPLATE_SOURCES;

export const TEMPLATE_SOURCE_SLUGS = Object.keys(TEMPLATE_SOURCES) as TemplateSourceSlug[];

/** The page file for a slug, or null. Own keys only, so "__proto__" and friends never match. */
export function getTemplateSource(slug: string): TemplateSource | null {
  if (!Object.prototype.hasOwnProperty.call(TEMPLATE_SOURCES, slug)) return null;
  return TEMPLATE_SOURCES[slug as TemplateSourceSlug];
}

/**
 * Project-relative path of a template's build prompt (outside public/, read only by gated routes),
 * or null for anything that isn't a plain kebab-case slug.
 */
export function templatePromptPath(slug: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return `content/build-prompts/templates/${slug}.md`;
}

/** Project-relative path of a template's page file, e.g. "src/components/templates/relay-page.tsx". */
export function templateEntryPath(source: TemplateSource) {
  return `${TEMPLATE_SOURCE_DIR}/${source.file}`;
}
