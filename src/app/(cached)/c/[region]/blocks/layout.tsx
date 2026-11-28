import { StaticRoute } from "@/components/layout/static-route";
import Inner from "@/app/(site)/blocks/layout";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string }> }) {
  const { region } = await params;
  return (
    <StaticRoute path="/blocks" region={region === "in" ? "india" : "global"}>
      <Inner>{children}</Inner>
    </StaticRoute>
  );
}
