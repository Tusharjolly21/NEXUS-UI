import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { SignupFormDemo } from "@/components/signup-form";

export const metadata: Metadata = createMetadata({
  title: "Signup form demo",
  description: "Customizable signup/auth form with shadcn inputs and motion polish.",
});

export default function SignupFormDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <SignupFormDemo />
    </main>
  );
}
