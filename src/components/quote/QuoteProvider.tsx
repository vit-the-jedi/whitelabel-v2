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
import type { AnswerMap, LoaderKind } from "@/lib/flow/types";

/* ------------------------------------------------------------------ */
/* Contexts                                                            */
/* ------------------------------------------------------------------ */

const FlowStateContext = createContext<FlowState | null>(null);

type FlowActions = {
  /** Validate + commit a step's answers, run any resolver, branch, navigate.
   *  Returns validation errors if the step is invalid (no transition). */
  submitStep: (answers: AnswerMap) => Promise<ValidationResult>;
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

  const load = useCallback<FlowActions["load"]>(
    async (stepAnswers) => {
      const step = state.config.steps[state.currentStepId];
      const merged = { ...state.answers, ...stepAnswers };
      if (step.load) {
        console.log(
          "[QuoteProvider] step load:",
          state.currentStepId,
          step.load,
        );
        dispatch({ type: "BEGIN_LOAD" });
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
    async (stepAnswers) => {
      const step = state.config.steps[state.currentStepId];
      const merged = { ...state.answers, ...stepAnswers };

      // 1. The gate: validation and navigation are the same decision.
      const result = validateStep(step, merged);
      if (!result.ok) return result;

      // 2. Commit answers (commit-on-submit).
      dispatch({ type: "MERGE_ANSWERS", answers: stepAnswers });

      // 3. Async resolve, if the step has one (rater, company info, ...).
      let finalAnswers = merged;
      console.log(
        "[QuoteProvider] step resolve:",
        state.currentStepId,
        step.resolve,
      );
      if (step.resolve) {
        dispatch({ type: "BEGIN_RESOLVE" });
        try {
          const { merge, options } = await resolvers[step.resolve](merged);
          if (options) {
            dispatch({ type: "SET_FIELD_OPTIONS", options });
          }
          if (merge) {
            dispatch({ type: "MERGE_ANSWERS", answers: merge });
            finalAnswers = { ...merged, ...merge };
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Something went wrong.";
          dispatch({ type: "RESOLVE_ERROR", error: message });
          // Sentry.captureException(err) — this branch is your error hook.
          return { ok: true, errors: {} }; // submit was valid; the resolve failed
        }
      }

      // 4. Branch on the (possibly enriched) answers — declarative, from config.
      const nextStepId = resolveNext(step, finalAnswers);
      if (!nextStepId) {
        dispatch({
          type: "RESOLVE_ERROR",
          error: "No matching transition for this step.",
        });
        return { ok: true, errors: {} };
      }

      // 5. Advance state, then mirror it into the URL (soft nav; layout persists).
      dispatch({ type: "ADVANCE", toStepId: nextStepId });
      persist({
        ...state,
        answers: finalAnswers,
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
