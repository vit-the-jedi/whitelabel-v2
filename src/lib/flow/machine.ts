/**
 * The state machine — the "brain."
 *
 * This is a pure reducer. It never does async work and never navigates; it
 * only transforms state in response to actions. Async orchestration (calling
 * a rater, then deciding the branch) lives in the controller hook, because
 * effects belong in hooks, not reducers. Keeping the reducer pure keeps the
 * branching logic testable in isolation.
 */

import type { AnswerMap, Draft, FlowConfig } from "./types";

export type Status = "idle" | "resolving" | "loading" | "error";

export type FlowState = {
  config: FlowConfig;
  quoteId: string;
  currentStepId: string;
  visited: string[];
  answers: AnswerMap;
  /** Data populated by loaders — separate from user answers. */
  fieldData: Record<string, any>[];
  status: Status;
  loading: boolean;
  error: string | null;
};

export type Params = {
  [key: string]: string;
};

export type ParamsAction = {
  type: "UPDATE_PARAM" | "DELETE_PARAM" | "WIPE_PARAMS";
  params?: Record<string, string>;
  paramKeys?: string[];
};

export type Action =
  | { type: "HYDRATE"; payload: Partial<FlowState> }
  | { type: "MERGE_ANSWERS"; answers: AnswerMap }
  | {
      type: "SET_FIELD_OPTIONS";
      options: Record<string, { value: string; label: string }[]>;
    }
  | { type: "SET_FIELD_DATA"; fieldData: Record<string, any>[] }
  | { type: "ADVANCE"; toStepId: string }
  | { type: "BEGIN_RESOLVE" }
  | { type: "BEGIN_LOAD" }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "RESOLVE_ERROR"; error: string }
  | { type: "GO_BACK" }
  | { type: "JUMP_TO_STEP"; stepId: string }
  | { type: "BEGIN_LOADING" }
  | { type: "END_LOADING" };

export function buildInitialState(args: {
  config: FlowConfig;
  quoteId: string;
  draft?: Draft | null;
}): FlowState {
  const { config, quoteId, draft } = args;
  if (draft && draft.brand === config.brand) {
    return {
      config,
      quoteId,
      currentStepId: draft.currentStepId || config.startStep,
      visited: draft.visited?.length ? draft.visited : [],
      answers: draft.answers ?? {},
      fieldData: draft.fieldData ?? [],
      status: "idle",
      loading: false,
      error: null,
    };
  }
  return {
    config,
    quoteId,
    currentStepId: config.startStep,
    visited: [],
    answers: {},

    fieldData: [],
    status: "idle",
    error: null,
    loading: false,
  };
}

export function paramReducer(params: Params, action: ParamsAction): Params {
  switch (action.type) {
    case "UPDATE_PARAM":
      return { ...params, ...action.params };
    case "DELETE_PARAM":
      const newParams = { ...params };
      for (const key of action.paramKeys || []) {
        delete newParams[key];
      }
      return newParams;
    case "WIPE_PARAMS":
      return {};
    default:
      return params;
  }
}

export function flowReducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };

    case "MERGE_ANSWERS":
      return { ...state, answers: { ...state.answers, ...action.answers } };

    case "SET_FIELD_OPTIONS":
      return {
        ...state,
        config: {
          ...state.config,
          steps: {
            ...state.config.steps,
            [state.currentStepId]: {
              ...state.config.steps[state.currentStepId],
              fields: state.config.steps[state.currentStepId].fields.map(
                (field) =>
                  action.options[field.name]
                    ? { ...field, options: action.options[field.name] }
                    : field,
              ),
            },
          },
        },
      };

    case "SET_FIELD_DATA":
      return {
        ...state,
        fieldData: [...state.fieldData, ...action.fieldData],
      };

    case "ADVANCE": {
      if (action.toStepId === state.currentStepId) return state;
      return {
        ...state,
        visited: [...state.visited, state.currentStepId],
        currentStepId: action.toStepId,
        status: "idle",
        error: null,
      };
    }

    case "BEGIN_RESOLVE":
      return { ...state, status: "resolving", error: null };

    case "RESOLVE_ERROR":
      return { ...state, status: "error", error: action.error };

    case "BEGIN_LOAD":
      return { ...state, status: "loading", error: null };

    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.error };

    case "GO_BACK": {
      if (state.visited.length === 0) return state;
      const visited = state.visited.slice();
      const prev = visited.pop()!;
      return {
        ...state,
        visited,
        currentStepId: prev,
        status: "idle",
        error: null,
      };
    }
    case "BEGIN_LOADING": {
      return { ...state, loading: true };
    }
    case "END_LOADING": {
      return { ...state, loading: false };
    }
    case "JUMP_TO_STEP": {
      const reachable =
        action.stepId === state.currentStepId ||
        state.visited.includes(action.stepId);
      if (!reachable) return state;
      const idx = state.visited.indexOf(action.stepId);
      const visited = idx >= 0 ? state.visited.slice(0, idx) : state.visited;
      return {
        ...state,
        currentStepId: action.stepId,
        visited,
        status: "idle",
        error: null,
      };
    }

    default:
      return state;
  }
}

/** True if a step id is somewhere the user is allowed to be right now. */
export function isReachable(state: FlowState, stepId: string): boolean {
  return stepId === state.currentStepId || state.visited.includes(stepId);
}
