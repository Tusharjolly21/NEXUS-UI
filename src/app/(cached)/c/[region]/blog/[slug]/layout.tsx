import { StaticRoute } from "@/components/layout/static-route";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string; slug?: string }> }) {
  const { region, slug } = await params;
  return (
    <StaticRoute path={`/blog/${slug}`} region={region === "in" ? "india" : "global"}>
      {children}
    </StaticRoute>
  );
}
