/**
 * Pure flow logic. No React, no I/O — just functions over (step, answers).
 * Being pure means this is trivially unit-testable, which matters because
 * this is where branching correctness lives.
 */

import type { AnswerMap, AnswerValue, FieldDef, Guard, StepDef } from "./types";

/* ------------------------------------------------------------------ */
/* Guards & branching                                                  */
/* ------------------------------------------------------------------ */

function evalGuard(g: Guard, answers: AnswerMap): boolean {
  const actual = answers[g.field];
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
 * Given the current step and the (merged) answers, return the next step id.
 * Transitions are tried in order; the first whose guards all pass wins.
 * Returns null if nothing matches (a config gap — surface it, don't swallow).
 */
export function resolveNext(step: StepDef, answers: AnswerMap): string | null {
  for (const t of step.next) {
    if (!t.when || t.when.every((g) => evalGuard(g, answers))) {
      return t.to;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Validation — the submit gate                                        */
/* ------------------------------------------------------------------ */

export type ValidationResult = {
  ok: boolean;
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
      if (field.options && !field.options.some((o) => o.value === value)) {
        return `Select a valid ${field.label}.`;
      }
      break;
    case "radio":
      if (field.options && !field.options.some((o) => o.value === value)) {
        return `Select a valid ${field.label}.`;
      }
      break;
  }
  return null;
}

/**
 * Validate the answers for a step. SUBMIT and navigation are the same gate:
 * an invalid step does not advance — it returns errors for the form to show.
 *
 * For richer rules (cross-field, async uniqueness) swap this for zod schemas
 * attached per-step; the controller contract (ok + errors) stays identical.
 */
export function validateStep(
  step: StepDef,
  answers: AnswerMap,
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const err = validateField(field, answers[field.name]);
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
