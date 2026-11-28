import { StaticRoute } from "@/components/layout/static-route";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string; slug?: string }> }) {
  const { region } = await params;
  return (
    <StaticRoute path={"/icons"} region={region === "in" ? "india" : "global"}>
      {children}
    </StaticRoute>
  );
}
