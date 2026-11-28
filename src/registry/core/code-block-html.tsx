"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CodeBlock } from "@/components/code-block/code-block";

const SAMPLE_CODE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
</body>
</html>`;

export function PreviewCodeBlockHtml() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_HTML}
          language="html"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}
