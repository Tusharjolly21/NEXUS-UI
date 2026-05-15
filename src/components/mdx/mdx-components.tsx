import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="mt-10 text-3xl font-semibold text-foreground" {...props} />,
  h2: (props) => <h2 className="mt-10 text-2xl font-semibold text-foreground" {...props} />,
  h3: (props) => <h3 className="mt-8 text-xl font-semibold text-foreground" {...props} />,
  p: (props) => <p className="mt-4 text-sm leading-relaxed text-muted-foreground" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground" {...props} />,
  li: (props) => <li {...props} />,
  a: (props) => (
    <a className="text-primary underline-offset-4 hover:underline" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] text-primary" {...props} />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-2xl border border-border bg-muted dark:bg-black/60 p-4 text-xs text-muted-foreground"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground"
      {...props}
    />
  ),
};
