import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { SignupFormDemo } from "@/components/signup-form";

export const metadata: Metadata = createMetadata({
  title: "Signup form demo",
  description: "Animated signup and auth form built with shadcn/ui inputs, Framer Motion micro-interactions, and accessible error handling. Drop into any Next.js project.",
  alternates: { canonical: "/components/signup-form" },
});

export default function SignupFormDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Signup Form</h1>
      <SignupFormDemo />
    </main>
  );
}
