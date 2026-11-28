import { StaticRoute } from "@/components/layout/static-route";
import ComponentsLayout from "@/app/(site)/components/layout";

// The title and description the regular /components layout sets (a page title is built from every layout above it).
export { metadata } from "@/app/(site)/components/layout";

// The shell for a signed-out visitor, plus the regular /components layout (its schema.org list), so the HTML matches it.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StaticRoute path="/components" region="india">
      <ComponentsLayout>{children}</ComponentsLayout>
    </StaticRoute>
  );
}
