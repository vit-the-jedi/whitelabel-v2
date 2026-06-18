// code that runs before route is entered, to populate dynamic field options. Separate from resolvers since

import type { AnswerMap, LoaderKind } from "./types";

export type LoaderResult = {
  options?: Record<string, { value: string; label: string }[]>;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
};

export type Loader = (
  answers: AnswerMap,
  signal?: AbortSignal,
) => Promise<LoaderResult>;

export const loaders: Record<LoaderKind, Loader> = {
  vehicleYears: async (answers, signal) => {
    const currentYear = new Date().getFullYear();
    const minimumYear = 1987;
    const years = Array.from(
      { length: currentYear - minimumYear + 1 },
      (_, i) => String(minimumYear + i),
    ).reverse();
    return {
      options: {
        vehicleYear: years.map((y) => ({ value: y, label: y })),
      },
    };
  },
  vehicleMakes: async (answers, signal) => {
    console.log(answers);
    if (!answers.vehicleYear) {
      throw new Error("Year is required.");
    }
    const makes = await fetch(`/api/vehicle/makes/${answers.vehicleYear}`, {
      signal,
    }).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle makes lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    console.log(makes);
    return {
      options: {
        vehicleMake: makes.map((make) => ({ value: make, label: make })),
      },
    };
  },
  vehicleModels: async (answers, signal) => {
    if (!answers.vehicleYear) {
      throw new Error("Year is required.");
    }
    if (!answers.vehicleMake) {
      throw new Error("Make is required.");
    }
    const models = await fetch(
      `/api/vehicle/models/${encodeURIComponent(String(answers.vehicleYear))}/${encodeURIComponent(String(answers.vehicleMake))}`,
      { signal },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle models lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return {
      options: {
        vehicleModel: models.map((model) => ({ value: model, label: model })),
      },
    };
  },
  getFeedFromMastodon: async (answers, signal) => {
    const res = await fetch("/api/mastodon/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal,
    });
    if (!res.ok) throw new Error(`Data post failed (${res.status})`);
    const data = (await res.json()) as { feedItems: string[] };
    return { data: { feedItems: data.feedItems } };
  },
};
