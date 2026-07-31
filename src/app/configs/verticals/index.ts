/**
 * A brand's `vertical` selects which business-logic module + lander template
 * it uses (see LanderComponentMap.ts). Adding a new vertical means adding a
 * new value here plus its own config shape (see jobs.ts) — no changes to the
 * layout, middleware, or other verticals' code.
 */
export type Vertical = "auto-insurance" | "jobs" | "home-insurance" | "emerging" | "home-services";

export type { JobsConfig, JobCategory, JobCompany } from "./jobs";
