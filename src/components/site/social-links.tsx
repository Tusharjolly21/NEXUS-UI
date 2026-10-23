import { cn } from "@/lib/utils";

const X_URL = "https://x.com/nexusuilabs";
const INSTAGRAM_URL = "https://www.instagram.com/nexusuilabs/";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.19L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.16h1.7L7.4 4.75H5.58l11.09 14.41Z" />
    </svg>
  );
}

const LINKS = [
  { href: INSTAGRAM_URL, label: "Nexus UI on Instagram", handle: "@nexusuilabs", Icon: InstagramGlyph },
  { href: X_URL, label: "Nexus UI on X", handle: "@nexusuilabs", Icon: XGlyph },
] as const;

/** Instagram and X for the Nexus UI account. Icons follow the text colour, so they work in both themes. */
export function SocialLinks({ className, withHandle = false }: { className?: string; withHandle?: boolean }) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {LINKS.map(({ href, label, handle, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border bg-card/60 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              withHandle ? "px-3.5 py-2 text-[13.5px] font-medium" : "size-9 justify-center",
            )}
          >
            <Icon className="size-[17px]" />
            {withHandle ? handle : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
