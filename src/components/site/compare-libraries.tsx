import Link from "next/link";
import { alternatives } from "@/lib/alternatives";

/**
 * One quiet line for people still choosing a library: Nexus UI next to each library we have a comparison page for.
 * The names come from `alternatives`, so a new comparison page shows up here without editing this file.
 */
export function CompareLibraries({ className }: { className?: string }) {
  return (
    <p className={className}>
      Comparing libraries? See Nexus UI next to{" "}
      {alternatives.map((a, i) => (
        <span key={a.slug}>
          {i > 0 ? (i === alternatives.length - 1 ? " and " : ", ") : ""}
          <Link href={`/alternatives/${a.slug}`} className="text-link hover:underline hover:underline-offset-4">
            {a.name}
          </Link>
        </span>
      ))}
      .
    </p>
  );
}
