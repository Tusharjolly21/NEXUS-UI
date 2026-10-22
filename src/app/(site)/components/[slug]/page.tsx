import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getLibraryComponent,
  getPreviewExportName,
  libraryComponents,
} from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";
import { COMPONENT_SEO } from "@/lib/catalog/component-seo";
import { COMPONENT_FAQ } from "@/lib/catalog/component-faq";
import { getGuidesForComponent } from "@/lib/blog";
import { getComponentCategoryHref, getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { promptIdsFor } from "@/lib/build-prompts";
import { ComponentDetailPageClient } from "@/components/library/component-detail-page-client";
import { allGalleryItems, hasBuildPrompt } from "@/lib/catalog/gallery-items";
import { sessionCanAccessComponent, sessionHasPro } from "@/lib/component-access";

type Props = { params: Promise<{ slug: string }> };

type RegistryInstallInfo = {
  dependencies?: string[];
  files?: Array<{ target?: string; content?: string }>;
};

function toPascalCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function getRegistryImport(
  registryName: string,
  componentName: string,
  files: NonNullable<RegistryInstallInfo["files"]>,
) {
  const source = files.map((file) => file.content ?? "").join("\n");
  const candidates = [
    ...source.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g),
  ].map((match) => match[1]);
  const expectedName = toPascalCase(componentName);
  const exportName =
    candidates.find((candidate) => candidate === expectedName) ??
    candidates.find((candidate) => !/^[A-Z0-9_]+$/.test(candidate));

  if (!exportName) return undefined;

  const hasRootEntry = files.some(
    (file) =>
      file.target === `components/${registryName}.tsx` ||
      file.target === `components/${registryName}/index.ts`,
  );
  const exportFile = files.find((file) => file.content?.includes(`export function ${exportName}`));
  const importTarget = hasRootEntry
    ? registryName
    : exportFile?.target
        ?.replace(/^components\//, "")
        .replace(/\.(tsx|ts)$/, "") ?? registryName;

  return `import { ${exportName} } from "@/components/${importTarget}";`;
}

async function getRegistryInstallInfo(
  registryName: string,
  componentName: string,
  fallbackDependencies: string[],
) {
  try {
    const contents = await readFile(
      path.join(process.cwd(), ".generated", "registry", `${registryName}.json`),
      "utf8",
    );
    const registryItem = JSON.parse(contents) as RegistryInstallInfo;

    return {
      dependencies: registryItem.dependencies ?? fallbackDependencies,
      files: (registryItem.files ?? [])
        .map((file) => file.target)
        .filter((target): target is string => Boolean(target)),
      registryImport: getRegistryImport(registryName, componentName, registryItem.files ?? []),
    };
  } catch {
    return {
      dependencies: fallbackDependencies,
      files: [`components/${registryName}.tsx`],
      registryImport: undefined,
    };
  }
}

/** JSON for a <script> tag: escape "<" so text can never close the tag early. */
function jsonLdSafe(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function generateStaticParams() {
  return libraryComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) return {};
  const seo = COMPONENT_SEO[item.slug];
  return createMetadata({
    title: seo?.title ?? `${item.name} — Animated React Component`,
    description: seo?.description ?? item.description,
    openGraph: { title: `${item.name} · ${siteConfig.siteName}` },
    alternates: { canonical: `/components/${item.slug}` },
  });
}

export default async function ComponentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) notFound();
  // Registry CLI aliases (e.g. gooey-input) resolve here too — send them to the one canonical URL.
  if (item.slug !== slug) permanentRedirect(`/components/${item.slug}`);

  const isPremium = await sessionHasPro();
  // Pro code never reaches a browser without access: a locked page gets no source or usage code.
  const locked = !(await sessionCanAccessComponent(item.slug, item.premium));
  const registryName = item.registryCliName ?? item.slug;
  const installInfo = await getRegistryInstallInfo(registryName, item.name, item.dependencies);

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: item.name,
    description: item.description,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Next.js",
    url: `${siteConfig.url}/components/${slug}`,
    isAccessibleForFree: !item.premium,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Components",
        item: `${siteConfig.url}/components`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: getComponentCategoryLabel(item.categorySlug),
        item: `${siteConfig.url}${getComponentCategoryHref(item.categorySlug)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: item.name,
        item: `${siteConfig.url}/components/${item.slug}`,
      },
    ],
  };

  const faq = COMPONENT_FAQ[item.slug] ?? [];
  const faqJsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }
    : null;

  const galleryItems = allGalleryItems();
  const self = galleryItems.find((g) => g.slug === slug);
  const related = self ? galleryItems.filter((g) => g.group === self.group && g.slug !== slug).slice(0, 4) : [];

  const variantPrompts =
    item.previewSections && item.previewSections.length > 1
      ? await promptIdsFor(item.slug, item.previewSections.map((s, i) => s.title ?? `${item.name}, variant ${i + 1}`))
      : [];

  const serializedPreviewSections = item.previewSections?.map((s) => ({
    title: s.title,
    reactSource: locked ? "" : s.reactSource,
    previewExportName: getPreviewExportName(s.Preview),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(faqJsonLd) }} />
      ) : null}
      <ComponentDetailPageClient
        slug={slug}
        isPremium={isPremium}
        name={item.name}
        description={item.description}
        categorySlug={item.categorySlug}
        animationKinds={item.animationKinds}
        tags={item.tags}
        premium={item.premium}
        registryCliName={item.registryCliName}
        dependencies={installInfo.dependencies}
        installedFiles={installInfo.files}
        registryImport={installInfo.registryImport}
        reactSource={locked ? undefined : item.reactSource}
        locked={locked}
        hasPrompt={hasBuildPrompt(item.slug)}
        variantPrompts={variantPrompts}
        props={item.props}
        previewExportName={getPreviewExportName(item.Preview)}
        serializedPreviewSections={serializedPreviewSections}
        tint={self?.tint}
        related={related}
        faq={faq}
        guides={getGuidesForComponent(item.slug)}
      />
    </>
  );
}
