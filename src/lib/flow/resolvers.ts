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
  options?: Record<string, string[]>;
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
  vehicleYears: async (answers, signal) => {
    const currentYear = new Date().getFullYear();
    const minimumYear = 1987;
    return {
      options: {
        vehicleYears: Array.from(
          { length: currentYear - minimumYear + 1 },
          (_, i) => String(minimumYear + i),
        ).reverse(),
      },
    };
  },
  vehicleMakes: async (answers, signal) => {
    if (!answers.year) {
      throw new Error("Year is required.");
    }
    const makes = await fetch(`/api/vehicle/makes/${answers.year}`, {
      signal,
    }).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle makes lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return { options: { vehicleMakes: makes } };
  },
  vehicleModels: async (answers, signal) => {
    if (!answers.year) {
      throw new Error("Year is required.");
    }
    if (!answers.make) {
      throw new Error("Make is required.");
    }
    const models = await fetch(
      `/api/vehicle/models/${encodeURIComponent(String(answers.year))}/${encodeURIComponent(String(answers.make))}`,
      { signal },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle models lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return { options: { vehicleModels: models } };
  },
  getFeedFromMastodon: async (answers, signal) => {
    const res = await fetch("/api/mastodon/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal,
    });
    if (!res.ok) throw new Error(`Data post failed (${res.status})`);
    return {};
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
