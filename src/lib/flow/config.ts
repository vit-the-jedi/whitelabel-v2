/**
 * Server-side data access for the funnel. Runs in Server Components only —
 * never ships to the client.
 */

import type { Draft, FlowConfig } from "./types";
import type { DefaultConfig } from "@/app/configs/defaultConfig";
import { configs } from "@/app/configs";

/* ------------------------------------------------------------------ */
/* Fetchers (server-only). Swap bodies for real I/O.                   */
/* ------------------------------------------------------------------ */

/** Returns the full site config (theme, site info, flow) for a brand key. */
export async function getSiteConfig(
  brand: string,
): Promise<DefaultConfig | null> {
  return configs[brand] ?? null;
}

/** Returns only the flow/funnel config for a brand key. */
export async function getFlowConfig(brand: string): Promise<FlowConfig | null> {
  return configs[brand]?.flow ?? null;
}

export async function getDraft(quoteId: string | null): Promise<Draft | null> {
  if (!quoteId) return null;
  // TODO: read from your draft store (Postgres / Redis / KV) by quoteId.
  return null;
}
