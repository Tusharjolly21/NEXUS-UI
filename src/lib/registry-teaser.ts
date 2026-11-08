import { readFile } from "node:fs/promises";
import path from "node:path";

type RegistryFile = { target?: string; content?: string };

const MAX_CHARS = 460;

/**
 * The plain-English note at the top of a component's source (the doc comment above its export), for the
 * "How it works" card on a locked Pro page. It is prose only: the comment text, never a line of code,
 * and it is cut at a sentence end. Returns undefined when the component has no such note.
 */
export async function getProTeaser(registryName: string): Promise<string | undefined> {
  let files: RegistryFile[];
  try {
    const raw = await readFile(path.join(process.cwd(), ".generated", "registry", `${registryName}.json`), "utf8");
    files = ((JSON.parse(raw) as { files?: RegistryFile[] }).files ?? []).filter((f) => f.content && f.target?.startsWith("components/"));
  } catch {
    return undefined;
  }
  for (const file of files) {
    const m = file.content!.match(/\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*(?:export\s+default|export\s+(?:function|const))/);
    if (!m) continue;
    const text = m[1]
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line && !line.startsWith("@") && !/[{};]|=>|import |<\/?[A-Za-z]/.test(line))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length < 60) continue;
    if (text.length <= MAX_CHARS) return text;
    const cut = text.slice(0, MAX_CHARS);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    return end > 120 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}...`;
  }
  return undefined;
}
