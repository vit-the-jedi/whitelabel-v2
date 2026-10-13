/**
 * Server-side data access for the funnel. Runs in Server Components only —
 * never ships to the client.
 */

import type { Draft, FlowConfig, StepDef } from "./types";
import type { DefaultConfig } from "@/app/configs/defaultConfigs";
import { configs } from "@/app/configs";

// lib/flow/config.ts
import { cache } from "react";

export function generateDefaultFlowSteps(): Record<string, StepDef> {
  return {
    zip: {
      id: "zip",
      title: "Where do you live?",
      fields: [
        {
          name: "zipcode",
          label: "ZIP code",
          kind: "zip",
          required: true,
        },
      ],
      next: [{ to: "thankyou" }],
    },
    thankyou: {
      id: "thankyou",
      title: "Thanks — we are getting your quote ready.",
      fields: [],
      next: [],
      terminal: true,
    },
  };
}
/* ------------------------------------------------------------------ */
/* Fetchers (server-only). Swap bodies for real I/O.                   */
/* ------------------------------------------------------------------ */

/** Returns the full site config (theme, site info, flow) for a brand key. */
export const getSiteConfig = cache(async (brand: string): Promise<DefaultConfig | null> => {
  return configs[brand] ?? null;
});

/** Returns only the flow/funnel config for a brand key. */
export async function getFlowConfig(brand: string): Promise<FlowConfig | null> {
  return configs[brand]?.flow ?? null;
}

export async function getDraft(quoteId: string | null): Promise<Draft | null> {
  if (!quoteId) return null;
  // TODO: read from your draft store (Postgres / Redis / KV) by quoteId.
  return null;
}
