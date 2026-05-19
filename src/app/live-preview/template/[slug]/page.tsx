import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { SimplisticSaaSPage } from "@/components/templates/simplistic-saas-page";
import { LandingPage } from "@/components/marketing/landing-page";
import { NovaLandingPage } from "@/components/templates/nova-landing-page";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { ThemeReceiver } from "@/components/templates/theme-receiver";
import { TalentHubPage } from "@/components/templates/talent-hub-page";
import { SynapseAIPage } from "@/components/templates/synapse-ai-page";
import { OrionAIPage } from "@/components/templates/orion-ai-ops";
import { HelixAIPlatformPage } from "@/components/templates/helix-ai-platform";
import { StartupLandingPage } from "@/components/templates/startup-landing-page";
import { ClauraAgencyPage } from "@/components/templates/claura-agency-page";
import { OceanFlowPage } from "@/components/templates/ocean-flow-page";
import { PulseLandingPage } from "@/components/templates/pulse-landing-page";

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
  }

  return (
    <ThemeReceiver>
      <div className="min-h-screen bg-background">
        <TemplateSceneLoader slug={tmpl.slug} />
      </div>
    </ThemeReceiver>
  );
}
