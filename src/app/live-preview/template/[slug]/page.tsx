import { notFound } from "next/navigation";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { ThemeReceiver } from "@/components/templates/theme-receiver";

export const revalidate = 86400;

// Each template is its own dynamic chunk — only the matching slug's JS is sent to the browser.
const TemplateFallback = () => (
  <div className="min-h-screen animate-pulse bg-background" aria-hidden />
);

const SimplisticSaaSPage = nextDynamic(
  () => import("@/components/templates/simplistic-saas-page").then((m) => ({ default: m.SimplisticSaaSPage })),
  { loading: TemplateFallback },
);
const NexusAiLaunchTemplatePage = nextDynamic(
  () =>
    import("@/components/templates/nexus-ai-launch-template-page").then((m) => ({
      default: m.NexusAiLaunchTemplatePage,
    })),
  { loading: TemplateFallback },
);
const LandingPage = nextDynamic(
  () => import("@/components/marketing/landing-page").then((m) => ({ default: m.LandingPage })),
  { loading: TemplateFallback },
);
const NovaLandingPage = nextDynamic(
  () => import("@/components/templates/nova-landing-page").then((m) => ({ default: m.NovaLandingPage })),
  { loading: TemplateFallback },
);
const TalentHubPage = nextDynamic(
  () => import("@/components/templates/talent-hub-page").then((m) => ({ default: m.TalentHubPage })),
  { loading: TemplateFallback },
);
const SynapseAIPage = nextDynamic(
  () => import("@/components/templates/synapse-ai-page").then((m) => ({ default: m.SynapseAIPage })),
  { loading: TemplateFallback },
);
const OrionAIPage = nextDynamic(
  () => import("@/components/templates/orion-ai-ops").then((m) => ({ default: m.OrionAIPage })),
  { loading: TemplateFallback },
);
const HelixAIPlatformPage = nextDynamic(
  () => import("@/components/templates/helix-ai-platform").then((m) => ({ default: m.HelixAIPlatformPage })),
  { loading: TemplateFallback },
);
const StartupLandingPage = nextDynamic(
  () => import("@/components/templates/startup-landing-page").then((m) => ({ default: m.StartupLandingPage })),
  { loading: TemplateFallback },
);
const ClauraAgencyPage = nextDynamic(
  () => import("@/components/templates/claura-agency-page").then((m) => ({ default: m.ClauraAgencyPage })),
  { loading: TemplateFallback },
);
const OceanFlowPage = nextDynamic(
  () => import("@/components/templates/ocean-flow-page").then((m) => ({ default: m.OceanFlowPage })),
  { loading: TemplateFallback },
);
const PulseLandingPage = nextDynamic(
  () => import("@/components/templates/pulse-landing-page").then((m) => ({ default: m.PulseLandingPage })),
  { loading: TemplateFallback },
);
const AetherPortfolioPage = nextDynamic(
  () => import("@/components/templates/aether-portfolio-page").then((m) => ({ default: m.AetherPortfolioPage })),
  { loading: TemplateFallback },
);
const SaasLaunchAuroraPage = nextDynamic(
  () => import("@/components/templates/saas-launch-aurora-page"),
  { loading: TemplateFallback },
);
const AiStartupForgePage = nextDynamic(
  () => import("@/components/templates/ai-startup-forge-page"),
  { loading: TemplateFallback },
);
const OrbitAIPage = nextDynamic(
  () => import("@/components/templates/orbit-ai-page"),
  { loading: TemplateFallback },
);
const NoirStudioTemplatePage = nextDynamic(
  () => import("@/components/templates/moon-studio-page"),
  { loading: TemplateFallback },
);
const GsapMacbookLandingPage = nextDynamic(
  () => import("@/components/templates/gsap-macbook-landing-page"),
  { loading: TemplateFallback },
);

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return createMetadata({
    title: `${t.title} — Live preview`,
    description: `Isolated preview of ${t.title} on ${siteConfig.name}.`,
    robots: { index: false, follow: false },
  });
}

export default async function TemplateLivePreviewPage({ params }: Props) {
  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  if (tmpl.slug === "nexus-ai-launch") {
    return <ThemeReceiver><NexusAiLaunchTemplatePage /></ThemeReceiver>;
  } else if (tmpl.slug === "noir-studio") {
    return <ThemeReceiver><NoirStudioTemplatePage /></ThemeReceiver>;
  } else if (tmpl.slug === "simplistic-saas-template") {
    return <ThemeReceiver><SimplisticSaaSPage /></ThemeReceiver>;
  } else if (tmpl.slug === "saas-launch-aurora") {
    return <ThemeReceiver><LandingPage /></ThemeReceiver>;
  } else if (tmpl.slug === "nova-landing-page") {
    return <ThemeReceiver><NovaLandingPage /></ThemeReceiver>;
  } else if (tmpl.slug === "talent-hub-landing") {
    return <ThemeReceiver><TalentHubPage /></ThemeReceiver>;
  } else if (tmpl.slug === "synapse-ai-platform") {
    return <ThemeReceiver><SynapseAIPage /></ThemeReceiver>;
  } else if (tmpl.slug === "orion-ai-ops") {
    return <ThemeReceiver><OrionAIPage /></ThemeReceiver>;
  } else if (tmpl.slug === "helix-ai-platform") {
    return <ThemeReceiver><HelixAIPlatformPage /></ThemeReceiver>;
  } else if (tmpl.slug === "startup-landing-page") {
    return <ThemeReceiver><StartupLandingPage /></ThemeReceiver>;
  } else if (tmpl.slug === "claura-agency") {
    return <ThemeReceiver><ClauraAgencyPage /></ThemeReceiver>;
  } else if (tmpl.slug === "ocean-flow") {
    return <ThemeReceiver><OceanFlowPage /></ThemeReceiver>;
  } else if (tmpl.slug === "pulse-landing") {
    return <ThemeReceiver><PulseLandingPage /></ThemeReceiver>;
  } else if (tmpl.slug === "aether-portfolio") {
    return <ThemeReceiver><AetherPortfolioPage /></ThemeReceiver>;
  } else if (tmpl.slug === "saas-launch-aurora") {
    return <ThemeReceiver><SaasLaunchAuroraPage /></ThemeReceiver>;
  } else if (tmpl.slug === "ai-startup-forge") {
    return <ThemeReceiver><AiStartupForgePage /></ThemeReceiver>;
  } else if (tmpl.slug === "orbit-ai-page") {
    return <ThemeReceiver><OrbitAIPage /></ThemeReceiver>;
  } else if (tmpl.slug === "macbook-pro-showcase") {
    return <ThemeReceiver><GsapMacbookLandingPage /></ThemeReceiver>;
  }

  return (
    <ThemeReceiver>
      <div className="min-h-screen bg-background">
        <TemplateSceneLoader slug={tmpl.slug} />
      </div>
    </ThemeReceiver>
  );
}
