/** Scope key for `components.json` registries and `npx shadcn@latest add` commands. */
export const SHADCN_REGISTRY_SCOPE = "@next-ui";

/**
 * Routes through /api/registry/[name] so premium components are gated
 * behind token + entitlement checks before the JSON is served.
 */
export function shadcnRegistryUrl(origin: string) {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/registry/{name}`;
}
