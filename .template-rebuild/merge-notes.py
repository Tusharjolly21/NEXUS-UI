"""Rewrite catalog entries in src/lib/catalog/templates.ts from the rebuild notes.

Usage: python3 .template-rebuild/merge-notes.py <notes-dir> [slug ...]
For each slug with a notes JSON, the whole object literal for that slug is regenerated:
copy fields come from the notes; difficulty, premium, trendingScore and createdAt are kept;
previewImages always point at /templates/<slug>/hero.webp and section-1..4.webp.
"""
import json, os, re, sys

CATALOG = "src/lib/catalog/templates.ts"
CATEGORIES = {"SaaS", "AI Startup", "Portfolio", "Dashboard", "Agency", "Productivity", "Developer Portfolio",
              "Startup Landing Pages", "AI Tools", "Creator Websites", "E-Commerce", "Fintech", "Travel", "Music"}
REQUIRED_STACK = ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"]


def find_object(src: str, slug: str):
    m = re.search(r'\n(\s*)\{\s*\n\s*slug:\s*"' + re.escape(slug) + r'"', src)
    if not m:
        raise SystemExit(f"slug not found in catalog: {slug}")
    start = m.start() + 1
    depth, i, in_str, q = 0, src.index("{", start), False, ""
    while i < len(src):
        c = src[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == q:
                in_str = False
        elif c in "\"'`":
            in_str, q = True, c
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if src[end:end + 1] == ",":
                    end += 1
                return start, end, m.group(1)
        i += 1
    raise SystemExit(f"unbalanced object for {slug}")


def keep(obj: str, key: str, default: str):
    m = re.search(rf"\n\s*{key}:\s*([^,\n]+),", obj)
    return m.group(1).strip() if m else default


def render(slug: str, n: dict, obj: str, ind: str) -> str:
    stack = list(dict.fromkeys(REQUIRED_STACK + [s for s in n.get("techStack", []) if s]))
    cat = n["category"]
    if cat not in CATEGORIES:
        raise SystemExit(f"{slug}: bad category {cat!r}")
    labels = n["pageLabels"]
    if len(labels) != 4:
        raise SystemExit(f"{slug}: need 4 pageLabels, got {len(labels)}")
    j = lambda v: json.dumps(v, ensure_ascii=False)
    i2 = ind + "  "
    lines = [
        f"{ind}{{",
        f"{i2}slug: {j(slug)},",
        f"{i2}title: {j(n['title'])},",
        f"{i2}description:\n{i2}  {j(n['description'])},",
        f"{i2}category: {j(cat)},",
        f"{i2}tags: {j(n.get('tags', []))},",
        f"{i2}difficulty: {keep(obj, 'difficulty', j('Advanced'))},",
        f"{i2}premium: {keep(obj, 'premium', 'true')},",
        f"{i2}trendingScore: {keep(obj, 'trendingScore', '200')},",
        f"{i2}createdAt: {keep(obj, 'createdAt', j('2026-10-20'))},",
        f"{i2}techStack: {j(stack)},",
        f"{i2}pages: {j(n.get('pages') or ['/'])},",
        f"{i2}sections: {j(n['sections'])},",
        f"{i2}pageLabels: {j(labels)},",
        f"{i2}previewImages: {{",
        f"{i2}  hero: {j(f'/templates/{slug}/hero.webp')},",
        f"{i2}  sections: {j([f'/templates/{slug}/section-{k}.webp' for k in range(1, 5)])},",
        f"{i2}}},",
        f"{i2}features: {j(n['features'])},",
        f"{ind}}},",
    ]
    return "\n".join(lines)


def main():
    notes_dir = sys.argv[1]
    slugs = sys.argv[2:] or sorted(f[:-5] for f in os.listdir(notes_dir) if f.endswith(".json"))
    src = open(CATALOG).read()
    for slug in slugs:
        n = json.load(open(os.path.join(notes_dir, f"{slug}.json")))
        assert n.get("slug", slug) == slug, slug
        for img in ["hero"] + [f"section-{k}" for k in range(1, 5)]:
            if not os.path.exists(f"public/templates/{slug}/{img}.webp"):
                raise SystemExit(f"{slug}: missing public/templates/{slug}/{img}.webp")
        start, end, ind = find_object(src, slug)
        src = src[:start] + render(slug, n, src[start:end], ind) + src[end:]
        print("merged", slug)
    open(CATALOG, "w").write(src)


if __name__ == "__main__":
    main()
