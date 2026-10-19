import type { MDXComponents } from "mdx/types";

/** Article typography: 17px body at a reading measure, display-face headings, dark code blocks. */
export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="pg-display mt-14 text-[36px] leading-[1.05] text-foreground" {...props} />,
  h2: (props) => <h2 className="pg-display mt-14 scroll-mt-28 text-[30px] leading-[1.08] text-foreground" {...props} />,
  h3: (props) => <h3 className="mt-10 scroll-mt-28 text-[21px] font-semibold tracking-[-0.4px] text-foreground" {...props} />,
  p: (props) => <p className="mt-5 text-[17px] leading-[1.75] text-body" {...props} />,
  ul: (props) => <ul className="mt-5 list-disc space-y-2.5 pl-6 text-[17px] leading-[1.7] text-body marker:text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mt-5 list-decimal space-y-2.5 pl-6 text-[17px] leading-[1.7] text-body marker:text-muted-foreground" {...props} />,
  li: (props) => <li className="pl-1" {...props} />,
  a: (props) => (
    <a className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  code: (props) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.86em] text-foreground [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-inherit" {...props} />
  ),
  pre: (props) => (
    <pre className="mt-6 overflow-x-auto rounded-[20px] bg-[#17171c] p-5 font-mono text-[13.5px] leading-relaxed text-[#e6e6ea]" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 rounded-[20px] bg-tint-violet px-6 py-5 text-[17px] leading-[1.7] text-foreground [&>p]:mt-0" {...props} />
  ),
  hr: () => <hr className="my-12 border-border" />,
};
