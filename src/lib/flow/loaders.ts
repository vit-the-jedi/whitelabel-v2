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
        year: years.map((y) => ({ value: y, label: y })),
      },
    };
  },
  vehicleMakes: async (answers, signal) => {
    // The active vehicle is the last one being filled (cursor advances per add).
    const vehicle = answers.data.vehicles?.at(-1);
    if (!vehicle?.year) {
      throw new Error("Year is required.");
    }
    console.log("[loaders] vehicleMakes", vehicle);

    const makes = await fetch(`/api/vehicle/makes/${vehicle.year}`, {
      signal,
    }).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle makes lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return {
      options: {
        make: makes.map((make) => ({ value: make, label: make })),
      },
    };
  },
  vehicleModels: async (answers, signal) => {
    const vehicle = answers.data.vehicles?.at(-1);
    if (!vehicle?.year) {
      throw new Error("Year is required.");
    }
    if (!vehicle?.make) {
      throw new Error("Make is required.");
    }
    const models = await fetch(
      `/api/vehicle/models/${encodeURIComponent(String(vehicle.year))}/${encodeURIComponent(String(vehicle.make))}`,
      { signal },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle models lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return {
      options: {
        model: models.map((model) => ({
          value: model,
          label: model,
        })),
      },
    };
  },
  getFeedFromMastodon: async (answers, signal) => {
    const res = await fetch(`/api/mastodon/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal,
    });
    if (!res.ok) throw new Error(`Feed failed (${res.status})`);
    const data = (await res.json()) as Record<string, unknown>;
    return { data };
  },
};
