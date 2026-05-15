import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { EncryptedTextDemo } from "@/components/encrypted-text";

export const metadata: Metadata = createMetadata({
  title: "Encrypted Text",
  description:
    "Animated text component that reveals the final string through a futuristic gibberish decoding effect.",
});

export default function EncryptedTextDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <EncryptedTextDemo />
    </main>
  );
}
