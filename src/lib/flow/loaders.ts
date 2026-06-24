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
        "vehicle-year": years.map((y) => ({ value: y, label: y })),
      },
    };
  },
  vehicleMakes: async (answers, signal) => {
    console.log(answers);
    if (!answers["vehicle-year"]) {
      throw new Error("Year is required.");
    }
    const makes = await fetch(`/api/vehicle/makes/${answers["vehicle-year"]}`, {
      signal,
    }).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle makes lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    console.log(makes);
    return {
      options: {
        "vehicle-make": makes.map((make) => ({ value: make, label: make })),
      },
    };
  },
  vehicleModels: async (answers, signal) => {
    if (!answers["vehicle-year"]) {
      throw new Error("Year is required.");
    }
    if (!answers["vehicle-make"]) {
      throw new Error("Make is required.");
    }
    const models = await fetch(
      `/api/vehicle/models/${encodeURIComponent(String(answers["vehicle-year"]))}/${encodeURIComponent(String(answers["vehicle-make"]))}`,
      { signal },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Vehicle models lookup failed (${res.status})`);
      return res.json() as Promise<string[]>;
    });
    return {
      options: {
        "vehicle-model": models.map((model) => ({
          value: model,
          label: model,
        })),
      },
    };
  },
  getFeedFromMastodon: async (answers, signal) => {
    const t = {
      "vehicle-year": 2015,
      "vehicle-make": "Toyota",
      "vehicle-model": "Camry",
      zip: "90210",
      email: "test@example.com",
      phone: "555-555-5555",
    };
    const res = await fetch(`/api/mastodon/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
      signal,
    });
    if (!res.ok) throw new Error(`Feed failed (${res.status})`);
    const data = (await res.json()) as Record<string, any>;
    const { bids = [], ...extra } = data;
    return {
      merge: {
        data,
      },
    };
  },
};
