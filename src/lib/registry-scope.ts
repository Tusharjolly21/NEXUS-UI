/** Scope key for `components.json` registries and `npx shadcn@latest add` commands. */
export const SHADCN_REGISTRY_SCOPE = "@nexus-labs";

/** Production registry URL — always points to the live site regardless of env. */
export const REGISTRY_PRODUCTION_URL = "https://www.nexus-ui.com/api/registry/{name}";

export function shadcnRegistryUrl() {
  return REGISTRY_PRODUCTION_URL;
}
