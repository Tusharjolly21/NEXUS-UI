"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The search box every gallery page shares: a pill with a magnifier, a clear button once there is text, and a
 * hidden label for screen readers. It only holds the text; the page decides what matches.
 */
export function GallerySearch({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Read by screen readers, e.g. "Search blocks". */
  label: string;
  placeholder: string;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="pg-glass h-11 w-full rounded-full bg-card pl-10 pr-10 text-[14.5px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** Splits what someone typed into lower-case words; an item matches when every word is somewhere in its text. */
export function searchWords(query: string) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesWords(text: string, words: string[]) {
  const hay = text.toLowerCase();
  return words.every((w) => hay.includes(w));
}
