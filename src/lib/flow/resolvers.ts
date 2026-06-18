/**
 * Async resolvers — the side effects a step runs on submit *before* branching.
 *
 * Contract: a resolver takes the merged answers and returns data to merge back
 * in. It does NOT decide the next step. The merged result is then fed to
 * resolveNext(), so branching stays declarative in the flow config.
 */

import type { AnswerMap, ResolveKind } from "./types";

export type ResolverResult = {
  merge?: AnswerMap;
  /** Field option lists to store separately from user answers. */
  options?: Record<string, { value: string; label: string }[]>;
};

export type Resolver = (
  answers: AnswerMap,
  signal?: AbortSignal,
) => Promise<ResolverResult>;

export const resolvers: Record<ResolveKind, Resolver> = {
  /** Calls the rater for carrier availability/pricing. STUB. */
  rater: async (answers, signal) => {
    const res = await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal,
    });
    if (!res.ok) throw new Error(`Rater failed (${res.status})`);
    const data = (await res.json()) as {
      available: boolean;
      premium?: number;
    };
    return {
      merge: {
        carrierAvailable: data.available,
        premium: data.premium ?? null,
      },
    };
  },
  /** Enriches with company info. STUB. */
  companyInfo: async (answers, signal) => {
    const res = await fetch("/api/company-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal,
    });
    if (!res.ok) throw new Error(`Company info lookup failed (${res.status})`);
    const data = (await res.json()) as { companyName?: string };
    return { merge: { companyName: data.companyName ?? null } };
  },
};
