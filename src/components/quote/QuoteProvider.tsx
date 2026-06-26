"use client";

/**
 * QuoteProvider — the context layer.
 *
 * This is a client component (Context + hooks only run on the client). It is
 * mounted in the quote *layout*, not in a page. App Router layouts do NOT
 * unmount across soft (Link/router.push) navigation, so this provider — and
 * the reducer state inside it — survives step-to-step navigation while each
 * step's static content still server-renders fresh. That's how option 2 gets
 * real routes (back button, deep links, per-step SSR) without losing in-memory
 * state. Only a hard reload or external entry clears it, which is exactly when
 * the server-fetched draft re-seeds initial state.
 *
 * Two contexts on purpose:
 *   - FlowStateContext   → changes per transition; components that read state
 *                          re-render when it changes.
 *   - FlowActionsContext → stable across renders; a deep child can fire
 *                          goBack()/submit() WITHOUT subscribing to state, so
 *                          it never re-renders just because state changed.
 * The split is free and worth keeping even at small scale.
 */

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  applyStepDraft,
  guardLookup,
  resolveNext,
  stepPath,
  validateStep,
  type ValidationResult,
} from "@/lib/flow/logic";
import {
  buildInitialState,
  flowReducer,
  isReachable,
  type FlowState,
} from "@/lib/flow/machine";
import { resolvers } from "@/lib/flow/resolvers";
import { LoaderResult, loaders } from "@/lib/flow/loaders";
import type {
  AnswerMap,
  AnswerValue,
  FlowScope,
  MastodonData,
  StepDraft,
} from "@/lib/flow/types";

/* ------------------------------------------------------------------ */
/* Contexts                                                            */
/* ------------------------------------------------------------------ */

const FlowStateContext = createContext<FlowState | null>(null);

/** Options a step submit can carry (e.g. the "Add Driver" button). */
export type SubmitOptions = {
  /** Control flags folded into branching (not posted) — e.g. { 2nd_driver: true }. */
  flags?: Record<string, AnswerValue>;
  /** Open a new repeatable entity and point its cursor at the new slot. */
  addEntity?: FlowScope;
  /** Schema fields a button sets directly (e.g. Currently Uninsured -> currently_insured:false). */
  setData?: Partial<MastodonData>;
  /** Alternative-submit buttons (e.g. Currently Uninsured) skip field validation. */
  skipValidation?: boolean;
};

type FlowActions = {
  /** Validate + commit a step's draft, run any resolver, branch, navigate.
   *  Returns validation errors if the step is invalid (no transition). */
  submitStep: (
    draft: StepDraft,
    opts?: SubmitOptions,
  ) => Promise<ValidationResult>;
  goBack: () => void;
  /** Edit-from-review: jump to an already-completed step. */
  jumpTo: (stepId: string) => void;
  load: (answers: AnswerMap) => Promise<LoaderResult>;
};

const FlowActionsContext = createContext<FlowActions | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function QuoteProvider({
  initialState,
  children,
}: {
  initialState: FlowState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(flowReducer, initialState);
  const router = useRouter();

  // In-session resume (survives reload, clears on tab close). Lead aggregation
  // doesn't need a server draft store; sessionStorage is enough to not lose
  // progress on refresh. Keyed by brand so different brands don't collide.
  const storageKey = `flow:${initialState.config.brand}`;

  // Hydrate once on mount (client-only). Runs AFTER hydration, so no SSR
  // mismatch — server + first client render both use the server initialState.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<FlowState>;
      // HYDRATE restores currentStepId/visited/answers into the reducer.
      dispatch({ type: "HYDRATE", payload: saved });
      // Align the URL to the resumed step. Use router.replace directly — NOT
      // jumpTo: jumpTo is captured from the first render and closes over the
      // initial (empty) state, so its isReachable() guard would reject the
      // saved step. router.replace doesn't depend on reducer state.
      if (saved.currentStepId) {
        router.replace(stepPath(saved.currentStepId));
      }
    } catch {
      /* corrupt/blocked storage — ignore and start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the resumable slice on change (never the server-provided config).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { answers, currentStepId, visited, cursors, flags } = state;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ answers, currentStepId, visited, cursors, flags }),
      );
    } catch {
      /* storage full/blocked — non-fatal */
    }
  }, [
    storageKey,
    state.answers,
    state.currentStepId,
    state.visited,
    state.cursors,
    state.flags,
  ]);

  const load = useCallback<FlowActions["load"]>(
    async (stepAnswers) => {
      const step = state.config.steps[state.currentStepId];
      const merged = { ...state.answers, ...stepAnswers };
      if (step.load) {
        dispatch({ type: "BEGIN_LOADING" });
        try {
          const { options, data } = await loaders[step.load](merged);
          if (options) {
            dispatch({ type: "SET_FIELD_OPTIONS", options });
          }

          if (data) {
            dispatch({
              type: "SET_FIELD_DATA",
              fieldData: Object.entries(data).map(([key, value]) => ({
                [key]: value,
              })),
            });
          }
          dispatch({ type: "END_LOADING" });
          return {};
        } catch (err) {
          console.log("Loader error", err);
          const message =
            err instanceof Error ? err.message : "Something went wrong.";
          dispatch({ type: "LOAD_ERROR", error: message });
          // Sentry.captureException(err) — this branch is your error hook.
          return { errors: {} }; // submit was valid; the load failed
        }
      }
      return {}; // stub; implement when you have a real loader
    },
    [state, router],
  );

  // Fire-and-forget draft persistence. Replace with a debounced PATCH to your
  // draft store keyed by quoteId — this is the refresh/resume safety net.
  // TODO: implement /api/quote/[quoteId] route to enable persistence.
  const persist = useCallback((_next: FlowState) => {
    // no-op until the draft store API route is implemented
  }, []);

  const submitStep = useCallback<FlowActions["submitStep"]>(
    async (draft, opts) => {
      const step = state.config.steps[state.currentStepId];

      // 1. The gate: validation and navigation are the same decision.
      //    Alternative-submit buttons (e.g. Currently Uninsured) skip it.
      if (!opts?.skipValidation) {
        const result = validateStep(step, draft);
        if (!result.ok) return result;
      }

      // 2. Optionally open a new repeatable entity (Add Driver/Vehicle) and
      //    point its cursor at the new slot — computed locally so we don't
      //    depend on async-stale reducer state.
      let data: MastodonData = state.answers.data;
      let cursors = state.cursors;
      if (opts?.addEntity) {
        const scope = opts.addEntity as Exclude<FlowScope, "applicant">;
        const key = `${scope}s` as "drivers" | "vehicles" | "incidents";
        const list = [...((data[key] as Record<string, unknown>[]) ?? []), {}];
        data = { ...data, [key]: list } as MastodonData;
        cursors = { ...cursors, [scope]: list.length - 1 };
      }

      // 3. Commit the draft into the right slice (applicant vs entity[cursor]),
      //    then apply any schema fields a button set directly.
      let nextData = applyStepDraft(data, step, draft, cursors);
      if (opts?.setData) nextData = { ...nextData, ...opts.setData };
      const flags = { ...state.flags, ...(opts?.flags ?? {}) };

      // 4. Async resolve, if the step has one (rater, company info, ...).
      if (step.resolve) {
        dispatch({ type: "BEGIN_RESOLVE" });
        try {
          const { mergeData, fieldData, options } = await resolvers[
            step.resolve
          ]({ data: nextData });
          if (options) dispatch({ type: "SET_FIELD_OPTIONS", options });
          if (fieldData) dispatch({ type: "SET_FIELD_DATA", fieldData });
          if (mergeData) nextData = { ...nextData, ...mergeData };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Something went wrong.";
          dispatch({ type: "RESOLVE_ERROR", error: message });
          // Sentry.captureException(err) — this branch is your error hook.
          return { ok: true, errors: {} }; // submit was valid; the resolve failed
        }
      }

      // 5. Commit-on-submit: payload + cursors + flags in one atomic action.
      dispatch({ type: "COMMIT_STEP", data: nextData, cursors, flags });

      // 6. Branch on a flat guard lookup (scalar payload fields + flags).
      const nextStepId = resolveNext(step, guardLookup(nextData, flags));
      if (!nextStepId) {
        dispatch({
          type: "RESOLVE_ERROR",
          error: "No matching transition for this step.",
        });
        return { ok: true, errors: {} };
      }

      // 7. Advance state, then mirror it into the URL (soft nav; layout persists).
      dispatch({ type: "ADVANCE", toStepId: nextStepId });
      persist({
        ...state,
        answers: { data: nextData },
        cursors,
        flags,
        visited: [...state.visited, state.currentStepId],
        currentStepId: nextStepId,
      });
      router.push(stepPath(nextStepId));
      return { ok: true, errors: {} };
    },
    [state, router, persist],
  );

  const goBack = useCallback(() => {
    if (state.visited.length === 0) return;
    const prev = state.visited[state.visited.length - 1];
    dispatch({ type: "GO_BACK" });
    router.push(stepPath(prev));
  }, [state, router]);

  const jumpTo = useCallback(
    (stepId: string) => {
      if (!isReachable(state, stepId)) return;
      dispatch({ type: "JUMP_TO_STEP", stepId });
      router.push(stepPath(stepId));
    },
    [state, router],
  );

  // Actions object is referentially stable per state — fine, consumers of
  // actions don't care about identity churn the way state subscribers do.
  const actions = useMemo<FlowActions>(
    () => ({ submitStep, goBack, jumpTo, load }),
    [submitStep, goBack, jumpTo, load],
  );

  console.log("[QuoteProvider] render", state);
  return (
    <FlowStateContext.Provider value={state}>
      <FlowActionsContext.Provider value={actions}>
        {children}
      </FlowActionsContext.Provider>
    </FlowStateContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Consumer hooks                                                      */
/* ------------------------------------------------------------------ */

export function useFlowState(): FlowState {
  const ctx = useContext(FlowStateContext);
  if (!ctx)
    throw new Error("useFlowState must be used within <QuoteProvider>.");
  return ctx;
}

export function useFlowActions(): FlowActions {
  const ctx = useContext(FlowActionsContext);
  if (!ctx)
    throw new Error("useFlowActions must be used within <QuoteProvider>.");
  return ctx;
}

/**
 * Client guard. A deep link or refresh lands on a URL whose step the user may
 * not have reached. The page reads the step id from the URL and passes it
 * here; if it's ahead of progress, bounce to the furthest valid step.
 * (Server-side backstop: validate the URL step against the persisted draft in
 * the page before render — see ARCHITECTURE.md.)
 */
export function useStepGuard(urlStepId: string): void {
  const state = useFlowState();
  const router = useRouter();
  useEffect(() => {
    if (!isReachable(state, urlStepId)) {
      router.replace(stepPath(state.currentStepId));
    }
  }, [state, urlStepId, router]);
}
