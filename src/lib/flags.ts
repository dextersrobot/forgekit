/**
 * Feature flags for the MIT core build.
 *
 * Pro features (multi-tenancy, RAG, agents, metered-billing, analytics) ship
 * separately under a commercial license — see the private forgekit-pro repo.
 * Leave NEXT_PUBLIC_FEATURES empty for this OSS distribution.
 */
export const FEATURES = [] as const;

export type Feature = never;

export function isEnabled(_feature: string): boolean {
  return false;
}

export const flags = {
  multiTenancy: false,
  rag: false,
  agents: false,
  meteredBilling: false,
  analytics: false,
} as const;
