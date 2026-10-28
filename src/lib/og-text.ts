/**
 * Text for the share-card image (/api/og). The three values come straight from the URL, so anyone
 * can send them. Keep only what a real page title or description needs: letters, numbers, spaces
 * and common punctuation, up to a fixed length. Anything else (angle brackets, quotes, braces,
 * backslashes, control characters, emoji) is dropped, so markup-like input never reaches the image
 * renderer. A defence in depth next to keeping Next.js up to date.
 */
const DISALLOWED = /[^\p{L}\p{N} .,:;!?'’&()/+#%·|\-–—]/gu;

export function ogText(value: string | null | undefined, max: number): string {
  if (!value) return "";
  return value
    .normalize("NFKC")
    .replace(DISALLOWED, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}
