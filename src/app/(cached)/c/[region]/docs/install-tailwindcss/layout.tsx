import { StaticRoute } from "@/components/layout/static-route";
import Inner from "@/app/(site)/docs/layout";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string; slug?: string }> }) {
  const { region } = await params;
  return (
    <StaticRoute path={"/docs/install-tailwindcss"} region={region === "in" ? "india" : "global"}>
      <Inner>{children}</Inner>
    </StaticRoute>
  );
}
