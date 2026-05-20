import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { ThemeReceiver } from "@/components/templates/theme-receiver";

// Each template is its own dynamic chunk — only the matching slug's JS is sent to the browser.
const TemplateFallback = () => (
  <div className="min-h-screen animate-pulse bg-background" aria-hidden />
);

const SimplisticSaaSPage = dynamic(
  () => import("@/components/templates/simplistic-saas-page").then((m) => ({ default: m.SimplisticSaaSPage })),
  { loading: TemplateFallback },
);
const LandingPage = dynamic(
  () => import("@/components/marketing/landing-page").then((m) => ({ default: m.LandingPage })),
  { loading: TemplateFallback },
);
const NovaLandingPage = dynamic(
  () => import("@/components/templates/nova-landing-page").then((m) => ({ default: m.NovaLandingPage })),
  { loading: TemplateFallback },
);
const TalentHubPage = dynamic(
  () => import("@/components/templates/talent-hub-page").then((m) => ({ default: m.TalentHubPage })),
  { loading: TemplateFallback },
);
const SynapseAIPage = dynamic(
  () => import("@/components/templates/synapse-ai-page").then((m) => ({ default: m.SynapseAIPage })),
  { loading: TemplateFallback },
);
const OrionAIPage = dynamic(
  () => import("@/components/templates/orion-ai-ops").then((m) => ({ default: m.OrionAIPage })),
  { loading: TemplateFallback },
);
const HelixAIPlatformPage = dynamic(
  () => import("@/components/templates/helix-ai-platform").then((m) => ({ default: m.HelixAIPlatformPage })),
  { loading: TemplateFallback },
);
const StartupLandingPage = dynamic(
  () => import("@/components/templates/startup-landing-page").then((m) => ({ default: m.StartupLandingPage })),
  { loading: TemplateFallback },
);
const ClauraAgencyPage = dynamic(
  () => import("@/components/templates/claura-agency-page").then((m) => ({ default: m.ClauraAgencyPage })),
  { loading: TemplateFallback },
);
const OceanFlowPage = dynamic(
  () => import("@/components/templates/ocean-flow-page").then((m) => ({ default: m.OceanFlowPage })),
  { loading: TemplateFallback },
);
const PulseLandingPage = dynamic(
  () => import("@/components/templates/pulse-landing-page").then((m) => ({ default: m.PulseLandingPage })),
  { loading: TemplateFallback },
);
const AetherPortfolioPage = dynamic(
  () => import("@/components/templates/aether-portfolio-page").then((m) => ({ default: m.AetherPortfolioPage })),
  { loading: TemplateFallback },
);
const SaasLaunchAuroraPage = dynamic(
  () => import("@/components/templates/saas-launch-aurora-page"),
  { loading: TemplateFallback },
);
const AiStartupForgePage = dynamic(
  () => import("@/components/templates/ai-startup-forge-page"),
  { loading: TemplateFallback },
);
const DevPortfolioVectorPage = dynamic(
  () => import("@/components/templates/dev-portfolio-vector-page"),
  { loading: TemplateFallback },
);
const AgencyStudioDeckPage = dynamic(
  () => import("@/components/templates/agency-studio-deck-page"),
  { loading: TemplateFallback },
);
const DashboardAuroraAnalyticsPage = dynamic(
  () => import("@/components/templates/dashboard-aurora-analytics-page"),
  { loading: TemplateFallback },
);
const ProductivityOrbitSuitePage = dynamic(
  () => import("@/components/templates/productivity-orbit-suite-page"),
  { loading: TemplateFallback },
);
const OrbitAIPage = dynamic(
  () => import("@/components/templates/orbit-ai-page"),
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

  if (tmpl.slug === "simplistic-saas-template") {
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
  } else if (tmpl.slug === "dev-portfolio-vector") {
    return <ThemeReceiver><DevPortfolioVectorPage /></ThemeReceiver>;
  } else if (tmpl.slug === "agency-studio-deck") {
    return <ThemeReceiver><AgencyStudioDeckPage /></ThemeReceiver>;
  } else if (tmpl.slug === "dashboard-aurora-analytics") {
    return <ThemeReceiver><DashboardAuroraAnalyticsPage /></ThemeReceiver>;
  } else if (tmpl.slug === "productivity-orbit-suite") {
    return <ThemeReceiver><ProductivityOrbitSuitePage /></ThemeReceiver>;
  } else if (tmpl.slug === "orbit-ai-page") {
    return <ThemeReceiver><OrbitAIPage /></ThemeReceiver>;
  }

  return (
    <ThemeReceiver>
      <div className="min-h-screen bg-background">
        <TemplateSceneLoader slug={tmpl.slug} />
      </div>
    </ThemeReceiver>
  );
}
