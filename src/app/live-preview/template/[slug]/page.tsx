import { notFound } from "next/navigation";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getTemplate } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { ThemeReceiver } from "@/components/templates/theme-receiver";
import { LockedTemplatePreview } from "@/components/templates/locked-template-preview";
import { templateName } from "@/components/templates/template-card";
import { sessionCanAccessTemplate } from "@/lib/template-access";
import { getPricing } from "@/lib/region";

// Rendered per request: whether the visitor gets the running template or the locked preview
// depends on their session. A Pro template's page code is only sent to people who can open it.
export const dynamic = "force-dynamic";

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
const LaunchfolioPortfolioPage = nextDynamic(
  () => import("@/components/templates/launchfolio-portfolio-page").then((m) => ({ default: m.LaunchfolioPortfolioPage })),
  { loading: TemplateFallback },
);

const RelayPage = nextDynamic(
  () => import("@/components/templates/relay-page").then((m) => ({ default: m.RelayPage })),
  { loading: TemplateFallback },
);
const TallyPage = nextDynamic(
  () => import("@/components/templates/tally-page").then((m) => ({ default: m.TallyPage })),
  { loading: TemplateFallback },
);
const WayfarePage = nextDynamic(
  () => import("@/components/templates/wayfare-page").then((m) => ({ default: m.WayfarePage })),
  { loading: TemplateFallback },
);
const SideBPage = nextDynamic(
  () => import("@/components/templates/side-b-page").then((m) => ({ default: m.SideBPage })),
  { loading: TemplateFallback },
);

const KilnPage = nextDynamic(
  () => import("@/components/templates/kiln-page").then((m) => ({ default: m.KilnPage })),
  { loading: TemplateFallback },
);
const CairnPage = nextDynamic(
  () => import("@/components/templates/cairn-page").then((m) => ({ default: m.CairnPage })),
  { loading: TemplateFallback },
);
const StrataPage = nextDynamic(
  () => import("@/components/templates/strata-page").then((m) => ({ default: m.StrataPage })),
  { loading: TemplateFallback },
);

const AfterglowPage = nextDynamic(
  () => import("@/components/templates/afterglow-page").then((m) => ({ default: m.AfterglowPage })),
  { loading: TemplateFallback },
);

const FerryPage = nextDynamic(
  () => import("@/components/templates/ferry-page").then((m) => ({ default: m.FerryPage })),
  { loading: TemplateFallback },
);

const SkeinPage = nextDynamic(
  () => import("@/components/templates/skein-page").then((m) => ({ default: m.SkeinPage })),
  { loading: TemplateFallback },
);

const NimbusPage = nextDynamic(
  () => import("@/components/templates/nimbus-page").then((m) => ({ default: m.NimbusPage })),
  { loading: TemplateFallback },
);

const MarginPage = nextDynamic(
  () => import("@/components/templates/margin-page").then((m) => ({ default: m.MarginPage })),
  { loading: TemplateFallback },
);

const LastLightPage = nextDynamic(
  () => import("@/components/templates/last-light-page").then((m) => ({ default: m.LastLightPage })),
  { loading: TemplateFallback },
);

const KioskPage = nextDynamic(
  () => import("@/components/templates/kiosk-page").then((m) => ({ default: m.KioskPage })),
  { loading: TemplateFallback },
);

const WharfPage = nextDynamic(
  () => import("@/components/templates/wharf-page").then((m) => ({ default: m.WharfPage })),
  { loading: TemplateFallback },
);

type Props = { params: Promise<{ slug: string }> };

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

  // Fails closed: without a session, or if the access check errors, a Pro template stays locked.
  if (tmpl.premium && !(await sessionCanAccessTemplate(tmpl.slug))) {
    return <LockedTemplatePreview tmpl={tmpl} name={templateName(tmpl)} pricing={await getPricing()} />;
  }

  if (tmpl.slug === "relay") {
    return <ThemeReceiver><RelayPage /></ThemeReceiver>;
  } else if (tmpl.slug === "tally") {
    return <ThemeReceiver><TallyPage /></ThemeReceiver>;
  } else if (tmpl.slug === "wayfare") {
    return <ThemeReceiver><WayfarePage /></ThemeReceiver>;
  } else if (tmpl.slug === "side-b") {
    return <ThemeReceiver><SideBPage /></ThemeReceiver>;
  } else if (tmpl.slug === "kiln") {
    return <ThemeReceiver><KilnPage /></ThemeReceiver>;
  } else if (tmpl.slug === "cairn") {
    return <ThemeReceiver><CairnPage /></ThemeReceiver>;
  } else if (tmpl.slug === "strata") {
    return <ThemeReceiver><StrataPage /></ThemeReceiver>;
  } else if (tmpl.slug === "afterglow") {
    return <ThemeReceiver><AfterglowPage /></ThemeReceiver>;
  } else if (tmpl.slug === "ferry") {
    return <ThemeReceiver><FerryPage /></ThemeReceiver>;
  } else if (tmpl.slug === "skein") {
    return <ThemeReceiver><SkeinPage /></ThemeReceiver>;
  } else if (tmpl.slug === "nimbus") {
    return <ThemeReceiver><NimbusPage /></ThemeReceiver>;
  } else if (tmpl.slug === "margin") {
    return <ThemeReceiver><MarginPage /></ThemeReceiver>;
  } else if (tmpl.slug === "last-light") {
    return <ThemeReceiver><LastLightPage /></ThemeReceiver>;
  } else if (tmpl.slug === "kiosk") {
    return <ThemeReceiver><KioskPage /></ThemeReceiver>;
  } else if (tmpl.slug === "wharf") {
    return <ThemeReceiver><WharfPage /></ThemeReceiver>;
  } else if (tmpl.slug === "nexus-ai-launch") {
    return <ThemeReceiver><NexusAiLaunchTemplatePage /></ThemeReceiver>;
  } else if (tmpl.slug === "noir-studio") {
    return <ThemeReceiver><NoirStudioTemplatePage /></ThemeReceiver>;
  } else if (tmpl.slug === "simplistic-saas-template") {
    return <ThemeReceiver><SimplisticSaaSPage /></ThemeReceiver>;
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
  } else if (tmpl.slug === "launchfolio-portfolio") {
    return <ThemeReceiver><LaunchfolioPortfolioPage /></ThemeReceiver>;
  }

  return (
    <ThemeReceiver>
      <div className="min-h-screen bg-background">
        <TemplateSceneLoader slug={tmpl.slug} />
      </div>
    </ThemeReceiver>
  );
}
