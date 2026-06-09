/**
 * Core types for the flow engine.
 *
 * The whole design rests on one idea: a brand's funnel is *data*, not a route
 * tree or a pile of components. A `FlowConfig` fully describes "which steps,
 * in what order, branching on what." Everything else (reducer, provider,
 * routes) just interprets this data, so adding/reordering a brand's steps is a
 * content change, not a code change.
 */

export type AnswerValue = string | number | boolean | string[] | null;

/** The accumulated, committed answers for a session. Single source of truth. */
export type AnswerMap = Record<string, AnswerValue>;

/* ------------------------------------------------------------------ */
/* Branching                                                           */
/* ------------------------------------------------------------------ */

/**
 * A single condition evaluated against the accumulated answers.
 * Branching lives here, in config, instead of in `if` ladders in components.
 */
export type Guard = {
  field: string;
  op: "eq" | "neq" | "in" | "gt" | "lt" | "exists";
  /** Compared against answers[field]. Omit for `exists`. */
  value?: AnswerValue;
};

/**
 * An outgoing edge from a step. Transitions are evaluated in array order;
 * the first whose guards ALL pass wins. A transition with no `when` is the
 * unconditional default — keep it last as the fallback.
 */
export type Transition = {
  to: string; // target step id
  when?: Guard[]; // ANDed together; omit = always matches
};

/* ------------------------------------------------------------------ */
/* Steps & fields                                                      */
/* ------------------------------------------------------------------ */

export type FieldKind =
  | "text"
  | "number"
  | "select"
  | "zip"
  | "boolean"
  | "radio";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Static options for `select` and `radio` fields. */
  options?: { value: string; label: string }[];
  /**
   * Key in `answers` whose value is a string[] of options populated by a
   * resolver. Used when options are dynamic (e.g. API-driven vehicle makes).
   * At render time the field reads answers[optionsFrom] as its option list.
   */
  optionsFrom?: string;
};

/**
 * An async side effect to run on submit *before* resolving `next`.
 * The resolver writes its result back into answers; `next` guards then branch
 * on that result. This is how "call the rater, then continue vs. decline"
 * stays declarative. Extend the union as you add integrations.
 */
export type ResolveKind =
  | "rater"
  | "companyInfo"
  | "vehicleMakes"
  | "vehicleModels"
  | "vehicleYears"
  | "getFeedFromMastodon";

export type StepDef = {
  id: string;
  /** Static heading/help shown above the form (server-rendered). */
  title: string;
  description?: string;
  /** Fields this step collects. Drives both the form and validation. */
  fields: FieldDef[];
  /** Optional async side effect run on submit before branching. */
  resolve?: ResolveKind;
  /** Outgoing edges. Evaluated in order; first matching guard set wins. */
  next: Transition[];
  /** Terminal steps (thank-you, decline) have no outgoing edges. */
  terminal?: boolean;
};

export type FlowConfig = {
  brand: string;
  /** Step id the funnel starts on. */
  startStep: string;
  steps: Record<string, StepDef>;
};

/* ------------------------------------------------------------------ */
/* Brand + persistence                                                 */
/* ------------------------------------------------------------------ */

/**
 * The persisted draft, keyed by quoteId. Fetched server-side on load and used
 * to seed the reducer's initial state — this is the resume-from-abandonment
 * and refresh-safety story, since live context state dies on hard reload.
 */
export type Draft = {
  quoteId: string;
  brand: string;
  answers: AnswerMap;
  /** Steps the user has actually traversed, in order. */
  visited: string[];
  currentStepId: string;
};
