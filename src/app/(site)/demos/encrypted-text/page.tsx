import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { EncryptedTextDemo } from "@/components/encrypted-text";

export const metadata: Metadata = createMetadata({
  title: "Encrypted Text",
  description:
    "Animated text that decodes gibberish characters to reveal the final string. Futuristic scramble effect for React headings, labels, and any text node.",
  alternates: { canonical: "/demos/encrypted-text" },
});

export default function EncryptedTextDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Encrypted Text</h1>
      <EncryptedTextDemo />
    </main>
  );
}
