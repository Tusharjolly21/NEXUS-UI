/**
 * The opening sentences of `text`, up to about `max` words. Some component descriptions run past 200
 * words; the category and type indexes only need a short pointer to the full page, and one very long
 * paragraph is what Semrush flags as "Paragraphs are too long". Keeps whole sentences where it can.
 */
export function excerpt(text: string, max = 55): string {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.split(" ");
  if (words.length <= max) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().split(" ").length > max) break;
    out += sentence;
  }
  if (out.trim()) return out.trim();
  return `${words.slice(0, max).join(" ")}…`;
}
