const [majorStr] = process.versions.node.split(".");
const major = Number(majorStr);

/**
 * Next.js 16 in this project is stable on Node 20/22.
 * Newer majors (like 24) have caused dev server hangs on local requests.
 */
if (!Number.isFinite(major) || major < 20 || major > 22) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      "Use Node 22 (preferred) or Node 20 for this workspace.",
      "",
      "Fix:",
      "  source ~/.nvm/nvm.sh",
      "  nvm use 22 || nvm use 20",
      "  npm run dev",
    ].join("\n"),
  );
  process.exit(1);
}
