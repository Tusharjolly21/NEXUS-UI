import { CanonicalPathname } from "@/components/layout/canonical-pathname";
import ComponentsItemLayout from "@/app/(site)/components/[slug]/layout";

// The same names column the regular component page has, standing for this component's real address.
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <CanonicalPathname path={`/components/${slug}`}>
      <ComponentsItemLayout>{children}</ComponentsItemLayout>
    </CanonicalPathname>
  );
}
