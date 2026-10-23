import { REGISTRY_PRODUCTION_URL, SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";

/**
 * The one place that says how a project connects to the Nexus UI registry, so the docs, the setup
 * panels on component and block pages and the API key page can never disagree.
 *
 * `{name}` in the URL is NOT something to fill in: the shadcn CLI replaces it with the item you ask
 * for (`@nexus-labs/glow-button` becomes `.../api/registry/glow-button`). `${NEXUS_API_KEY}` is also
 * left as written: the CLI reads it from `.env.local` (or the shell), so the key never has to sit in
 * `components.json`, which is usually committed to git.
 */
export const API_KEY_ENV_VAR = "NEXUS_API_KEY";

/** What the dashboard shows for a key that has not been generated yet. */
export const API_KEY_PLACEHOLDER = "nxs_your_key_here";

/** The `registries` key to add to components.json to install free components. */
export const REGISTRIES_FREE = `"registries": {
  "${SHADCN_REGISTRY_SCOPE}": "${REGISTRY_PRODUCTION_URL}"
}`;

/** The `registries` key to add to components.json to install Pro components (and free ones too). */
export const REGISTRIES_PRO = `"registries": {
  "${SHADCN_REGISTRY_SCOPE}": {
    "url": "${REGISTRY_PRODUCTION_URL}",
    "headers": {
      "Authorization": "Bearer \${${API_KEY_ENV_VAR}}"
    }
  }
}`;

/** The line that goes in .env.local, with the real key when the dashboard has one to show. */
export function envLocalLine(key: string = API_KEY_PLACEHOLDER) {
  return `${API_KEY_ENV_VAR}=${key}`;
}

/** The command that installs one item by its name. */
export function installCommand(name: string) {
  return `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${name}`;
}

/** `shadcn registry add`: writes the free `registries` entry into components.json for you. */
export function registryAddCommand() {
  return `npx shadcn@latest registry add "${SHADCN_REGISTRY_SCOPE}=${REGISTRY_PRODUCTION_URL}"`;
}
