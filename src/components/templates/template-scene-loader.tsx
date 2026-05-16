"use client";

import * as React from "react";

const SceneSaaSLaunchLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/saas-launch-aurora").then((m) => ({ default: m.SceneSaaSLaunch })),
);
const SceneAIStartupLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/ai-startup-forge").then((m) => ({ default: m.SceneAIStartup })),
);
const ScenePortfolioDevLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/dev-portfolio-vector").then((m) => ({ default: m.ScenePortfolioDev })),
);
const SceneAgencyStudioLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/agency-studio-deck").then((m) => ({ default: m.SceneAgencyStudio })),
);
const SceneDashboardAnalyticsLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/dashboard-aurora-analytics").then((m) => ({
    default: m.SceneDashboardAnalytics,
  })),
);
const SceneProductivitySuiteLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/productivity-orbit-suite").then((m) => ({
    default: m.SceneProductivitySuite,
  })),
);
const SceneSimplisticSaaSLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/simplistic-saas-scene").then((m) => ({
    default: m.SceneSimplisticSaaS,
  })),
);
const SceneOrbitAIPageLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/orbit-ai-page").then((m) => ({
    default: m.SceneOrbitAIPage,
  })),
);
const SceneNovaLandingPageLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/nova-landing-page").then((m) => ({
    default: m.SceneNovaLandingPage,
  })),
);
const SceneTalentHubLazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/talent-hub-scene").then((m) => ({
    default: m.SceneTalentHub,
  })),
);
const SceneSynapseAILazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/synapse-ai-scene").then((m) => ({
    default: m.SceneSynapseAI,
  })),
);
const SceneOrionAILazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/orion-ai-scene").then((m) => ({
    default: m.SceneOrionAI,
  })),
);
const SceneHelixAILazy = React.lazy(() =>
  import("@/registry/template-scenes/scenes/helix-ai-scene").then((m) => ({
    default: m.SceneHelixAI,
  })),
);

const LAZY_BY_SLUG: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "saas-launch-aurora": SceneSaaSLaunchLazy,
  "ai-startup-forge": SceneAIStartupLazy,
  "dev-portfolio-vector": ScenePortfolioDevLazy,
  "agency-studio-deck": SceneAgencyStudioLazy,
  "dashboard-aurora-analytics": SceneDashboardAnalyticsLazy,
  "productivity-orbit-suite": SceneProductivitySuiteLazy,
  "simplistic-saas-template": SceneSimplisticSaaSLazy,
  "orbit-ai-page": SceneOrbitAIPageLazy,
  "nova-landing-page": SceneNovaLandingPageLazy,
  "talent-hub-landing": SceneTalentHubLazy,
  "synapse-ai-platform": SceneSynapseAILazy,
  "orion-ai-ops": SceneOrionAILazy,
  "helix-ai-platform": SceneHelixAILazy,
};

export function TemplateSceneLoader({ slug }: { slug: string }) {
  const Lazy = LAZY_BY_SLUG[slug];
  if (!Lazy) {
    return <div className="p-6 text-sm text-zinc-500">Preview unavailable for this slug.</div>;
  }
  return (
    <React.Suspense
      fallback={
        <div
          className="h-full min-h-50 animate-pulse rounded-2xl bg-muted dark:bg-white/5"
          aria-hidden
        />
      }
    >
      <Lazy />
    </React.Suspense>
  );
}
