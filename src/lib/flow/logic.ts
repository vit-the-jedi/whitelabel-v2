/**
 * Pure flow logic. No React, no I/O — just functions over (step, draft, data).
 * Being pure means this is trivially unit-testable, which matters because
 * this is where branching + the scope/cursor mapping live.
 */

import type {
  AnswerValue,
  Cursors,
  FieldDef,
  FlowScope,
  Guard,
  MastodonData,
  StepDef,
  StepDraft,
} from "./types";
import { policyExpirationMonths, type PolicyExpiration } from "./options";

/** scope -> the MastodonData array it writes into. */
const ARRAY_KEY = {
  driver: "drivers",
  vehicle: "vehicles",
  incident: "incidents",
} as const;

type EntityScope = Exclude<FlowScope, "applicant">;
type EntityRow = Record<string, AnswerValue>;

function pad2(v: AnswerValue): string {
  return String(v).padStart(2, "0");
}

/* ------------------------------------------------------------------ */
/* Guards & branching                                                  */
/* ------------------------------------------------------------------ */

/**
 * Guards evaluate against a flat lookup (top-level scalar payload fields +
 * control flags), not the nested payload — branching in this funnel only keys
 * off applicant-level values and flags like `2nd_driver`. Build it with
 * guardLookup().
 */
function evalGuard(g: Guard, lookup: Record<string, AnswerValue>): boolean {
  const actual = lookup[g.field];
  switch (g.op) {
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    case "eq":
      return actual === g.value;
    case "neq":
      return actual !== g.value;
    case "in":
      return Array.isArray(g.value) && g.value.includes(actual as string);
    case "gt":
      return Number(actual) > Number(g.value);
    case "lt":
      return Number(actual) < Number(g.value);
    default:
      return false;
  }
}

/**
 * Flat view used to evaluate guards: every scalar top-level payload field plus
 * the control flags (drivers/vehicles/incidents/custom objects are excluded).
 */
export function guardLookup(
  data: MastodonData,
  flags: Record<string, AnswerValue> = {},
): Record<string, AnswerValue> {
  const scalars: Record<string, AnswerValue> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || typeof v !== "object") scalars[k] = v as AnswerValue;
  }
  return { ...scalars, ...flags };
}

/**
 * Given the current step and a guard lookup, return the next step id.
 * Transitions are tried in order; the first whose guards all pass wins.
 * Returns null if nothing matches (a config gap — surface it, don't swallow).
 */
export function resolveNext(
  step: StepDef,
  lookup: Record<string, AnswerValue>,
): string | null {
  for (const t of step.next) {
    if (!t.when || t.when.every((g) => evalGuard(g, lookup))) {
      return t.to;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Draft <-> payload mapping (scope + cursor)                          */
/* ------------------------------------------------------------------ */

/**
 * Collect the schema-bound values from a step's draft. `uiOnly` fields are
 * never written by name; the split dob_* parts are composed into a single
 * `date_of_birth` ("YYYY-MM-DD").
 */
function collectValues(step: StepDef, draft: StepDraft): EntityRow {
  const out: EntityRow = {};
  for (const f of step.fields) {
    if ("uiOnly" in f && f.uiOnly) continue;
    if (draft[f.name] !== undefined) out[f.name] = draft[f.name];
  }
  if (draft.dob_year && draft.dob_month && draft.dob_day) {
    out.date_of_birth = `${draft.dob_year}-${pad2(draft.dob_month)}-${pad2(
      draft.dob_day,
    )}`;
  }
  // uiOnly policy-expiration bucket -> integer months + currently_insured.
  if (draft.policy_expiration) {
    out.current_policy_expires_months = policyExpirationMonths(
      draft.policy_expiration as PolicyExpiration,
    );
    out.currently_insured = true;
  }
  return out;
}

/**
 * Apply a step's draft to the payload. Applicant steps write to the top level;
 * driver/vehicle/incident steps write to `data.<entity>s[cursor]`. Returns a
 * new MastodonData (pure).
 */
export function applyStepDraft(
  data: MastodonData,
  step: StepDef,
  draft: StepDraft,
  cursors: Cursors,
): MastodonData {
  console.log(step);
  const values = collectValues(step, draft);
  const scope = step.scope ?? "applicant";
  if (scope === "applicant") {
    // Cast: `values` is keyed by FlowFieldName at the config layer.
    return { ...data, ...values } as MastodonData;
  }
  const key = ARRAY_KEY[scope as EntityScope];
  const idx = cursors[scope as EntityScope];
  const list = [...((data[key] as EntityRow[] | undefined) ?? [])];
  list[idx] = { ...(list[idx] ?? {}), ...values };
  return { ...data, [key]: list } as MastodonData;
}

/**
 * Reverse of applyStepDraft: seed a step's local draft from committed data so
 * Back/edit pre-fills. Decomposes `date_of_birth` back into dob_* parts.
 */
export function seedDraft(
  data: MastodonData,
  step: StepDef | undefined,
  cursors: Cursors,
): StepDraft {
  if (!step) return {};
  const scope = step.scope ?? "applicant";
  const src: EntityRow =
    scope === "applicant"
      ? (data as EntityRow)
      : ((data[ARRAY_KEY[scope as EntityScope]] as EntityRow[] | undefined)?.[
          cursors[scope as EntityScope]
        ] ?? {});

  const draft: StepDraft = {};
  for (const f of step.fields) {
    const uiOnly = "uiOnly" in f && f.uiOnly;
    draft[f.name] = (uiOnly ? undefined : src[f.name]) ?? "";
  }
  if (
    step.fields.some((f) => f.name === "dob_year") &&
    typeof src.date_of_birth === "string"
  ) {
    const [y, m, d] = src.date_of_birth.split("-");
    draft.dob_year = y ?? "";
    draft.dob_month = m ?? "";
    draft.dob_day = d ?? "";
  }
  return draft;
}

/* ------------------------------------------------------------------ */
/* Validation — the submit gate                                        */
/* ------------------------------------------------------------------ */

export type ValidationResult = {
  ok: boolean;
  errors: Record<string, string>;
};

export type LoaderResult = {
  ok: boolean;
  data?: Record<string, any>[];
  errors: Record<string, string>;
};

function isEmpty(v: AnswerValue | undefined): boolean {
  return (
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0)
  );
}

function validateField(
  field: FieldDef,
  value: AnswerValue | undefined,
): string | null {
  if (field.required && isEmpty(value)) return `${field.label} is required.`;
  if (isEmpty(value)) return null; // optional + empty is fine

  switch (field.kind) {
    case "number":
      if (Number.isNaN(Number(value)))
        return `${field.label} must be a number.`;
      break;
    case "zip":
      if (!/^\d{5}$/.test(String(value)))
        return `${field.label} must be a 5-digit ZIP.`;
      break;
    case "select":
    case "radio":
      if (field.options && !field.options.some((o) => o.value === value)) {
        return `Select a valid ${field.label}.`;
      }
      break;
  }
  return null;
}

/**
 * Validate a step's flat draft. SUBMIT and navigation are the same gate:
 * an invalid step does not advance — it returns errors for the form to show.
 */
export function validateStep(
  step: StepDef,
  draft: StepDraft,
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const err = validateField(field, draft[field.name]);
    if (err) errors[field.name] = err;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/* ------------------------------------------------------------------ */
/* URL helper                                                          */
/* ------------------------------------------------------------------ */

/** The single place step ids become URLs. Keeps routing a thin view. */
export function stepPath(stepId: string): string {
  return `/quote/${stepId}`;
}
