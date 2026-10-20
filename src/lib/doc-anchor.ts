/** Anchor id for a docs section title ("3. Add the cn() utility" -> "add-the-cn-utility"). */
export function docSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
