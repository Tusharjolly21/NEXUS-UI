import { StaticRoute } from "@/components/layout/static-route";
import Inner from "@/app/(site)/videos/[slug]/layout";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string; slug?: string }> }) {
  const { region, slug } = await params;
  return (
    <StaticRoute path={`/videos/${slug}`} region={region === "in" ? "india" : "global"}>
      <Inner>{children}</Inner>
    </StaticRoute>
  );
}
