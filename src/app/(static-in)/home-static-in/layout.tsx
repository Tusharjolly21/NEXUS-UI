import { StaticRoute } from "@/components/layout/static-route";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StaticRoute path="/" region="india">{children}</StaticRoute>;
}
