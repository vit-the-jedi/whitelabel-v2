/**
 * Canonical Mastodon request body lives in src/lib/flow/types.ts as
 * `MastodonPayload` (with `MastodonData` and the driver/vehicle/incident/custom
 * element types). This module re-exports it under the historical `MastodonPost`
 * name so existing imports keep working while there is a single source of truth.
 */
export type { MastodonPayload as MastodonPost } from "@/lib/flow/types";
