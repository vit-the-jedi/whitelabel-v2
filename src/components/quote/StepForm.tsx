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

import { useEffect, useState } from "react";

import { useFlowActions, useFlowState } from "./QuoteProvider";
import { useParamsActions, useParamsState } from "../utils/ParamsProvider";
import type { AnswerValue, FieldDef } from "@/lib/flow/types";

export function StepForm({ stepId }: { stepId: string }) {
  const isLoading = useFlowState()?.status === "loading";
  const state = useFlowState();
  const resolvedOptions = (field: FieldDef) => {
    return field.options;
  };

  const { submitStep, goBack, load } = useFlowActions();

  // Load field options on mount (for dynamic selects). In a real app you'd want to cache these per step so you don't reload on every keystroke.

  useEffect(() => {
    const loadData = async () => {
      await load(state.answers);
      updateParams({ lastStep: stepId });
    };
    loadData();
  }, []);

  const fields: FieldDef[] =
    state.config.steps[state.currentStepId]?.fields ?? [];

  console.log("state", state);
  // Log the entire state object to inspect its structure and contents

  const paramsState = useParamsState();
  const { updateParams } = useParamsActions();

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
    console.log("[form submit] value(s):", draft);
    const result = await submitStep(draft);
    if (!result.ok) setErrors(result.errors);
  };

  const resolving = state.status === "resolving";

  return (
    <div>
      {isLoading && <p>Loading options...</p>}
      {!isLoading &&
        fields.map((field) => (
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
                {resolvedOptions(field)?.map((o: Record<string, string>) => {
                  const opt =
                    typeof o === "string" ? { value: o, label: o } : o;
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
              resolvedOptions(field)?.map((o: Record<string, string>) => {
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
