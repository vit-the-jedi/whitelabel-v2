"use client";

/**
 * StepForm — the only inherently-client piece of a step (it has inputs and
 * handlers). It owns volatile keystroke state LOCALLY and only lifts answers
 * into the machine on submit (commit-on-submit). At 1–5 fields the re-render
 * cost is nil; the reason to keep the local layer is the clean gate — nothing
 * half-entered ever lands in the committed store.
 *
 * The static heading/description for the step is rendered by the Server
 * Component page above this; this component is wrapped as a small client
 * island so the rest of the step stays zero-JS.
 */

import { useState } from "react";

import { useFlowActions, useFlowState } from "./QuoteProvider";
import type { AnswerValue, FieldDef } from "@/lib/flow/types";

export function StepForm({
  stepId,
  fields,
}: {
  stepId: string;
  fields: FieldDef[];
}) {
  const state = useFlowState();
  const { submitStep, goBack } = useFlowActions();

  // Seed local draft from already-committed answers (so back/edit pre-fills).
  const [draft, setDraft] = useState<Record<string, AnswerValue>>(() => {
    const seed: Record<string, AnswerValue> = {};
    for (const f of fields) seed[f.name] = state.answers[f.name] ?? "";
    return seed;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (name: string, value: AnswerValue) =>
    setDraft((d) => ({ ...d, [name]: value }));

  const onSubmit = async () => {
    setErrors({});
    const result = await submitStep(draft);
    console.log("submitStep result:", result);
    if (!result.ok) setErrors(result.errors);
  };

  const resolving = state.status === "resolving";

  return (
    <div>
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: 12 }}>
          <label
            htmlFor={field.name}
            style={{ display: "block", fontWeight: 600 }}
          >
            {field.label}
          </label>

          {field.kind === "select" ? (
            <select
              id={field.name}
              value={String(draft[field.name] ?? "")}
              onChange={(e) => setField(field.name, e.target.value)}
            >
              <option value="">Select…</option>
              {(
                field.options ??
                (field.optionsFrom
                  ? state.fieldOptions[field.optionsFrom]
                  : undefined)
              )?.map((o) => {
                const opt = typeof o === "string" ? { value: o, label: o } : o;
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              })}
            </select>
          ) : field.kind === "boolean" ? (
            <input
              id={field.name}
              type="checkbox"
              checked={Boolean(draft[field.name])}
              onChange={(e) => setField(field.name, e.target.checked)}
            />
          ) : field.kind === "radio" ? (
            (
              field.options ??
              (field.optionsFrom
                ? state.fieldOptions[field.optionsFrom]
                : undefined)
            )?.map((o) => {
              const opt = typeof o === "string" ? { value: o, label: o } : o;
              return (
                <label key={opt.value} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={draft[field.name] === opt.value}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                  {opt.label}
                </label>
              );
            })
          ) : (
            <input
              id={field.name}
              type={field.kind === "number" ? "number" : "text"}
              inputMode={field.kind === "zip" ? "numeric" : undefined}
              value={String(draft[field.name] ?? "")}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {errors[field.name] && (
            <p role="alert" style={{ color: "crimson", margin: "4px 0 0" }}>
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      {state.status === "error" && state.error && (
        <p role="alert" style={{ color: "crimson" }}>
          {state.error}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {state.visited.length > 0 && (
          <button type="button" onClick={goBack} disabled={resolving}>
            Back
          </button>
        )}
        <button type="button" onClick={onSubmit} disabled={resolving}>
          {resolving ? "Checking…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
