"use client";

/* this component serves as a non-render context provider for the flow params (device type, source tokens, jornaya ids, etc.). */

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import { paramReducer, Params } from "@/lib/flow/machine";

/** Tracking params to capture on first touch and persist for the session. */

type ParamsAction = {
  updateParams: (params: Record<string, string>) => void;
  deleteParams: (paramKeys: string[]) => void;
  wipeParams: () => void;
};

const params = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

const ParamsActionsContext = createContext<ParamsAction | null>(null);

const ParamsContext = createContext<Params>({});

export function useParamsState(
  initialParams: Params = {},
  updateParams?: Params,
) {
  return useContext(ParamsContext);
}

export function ParamsProvider({
  children,
  initialParams,
}: {
  children: React.ReactNode;
  initialParams: Params;
}) {
  const [paramsState, dispatch] = useReducer(paramReducer, initialParams);
  const router = useRouter();

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const updateParams = useCallback(
    (newParams: Record<string, string>) => {
      dispatch({ type: "UPDATE_PARAM", params: newParams });
      const next = new URLSearchParams(window.location.search);
      Object.entries(newParams).forEach(([k, v]) => next.set(k, v));
      console.log("Updating params:", newParams, "Next URLSearchParams:", next); // DEBUG
      // router.replace(`${window.location.pathname}?${next.toString()}`, {
      //   scroll: false,
      // });
    },
    [paramsState, router],
  );
  const deleteParams = useCallback(
    (paramKeys: string[]) => {
      dispatch({ type: "DELETE_PARAM", paramKeys });
    },
    [paramsState, router, pathname],
  );
  const wipeParams = useCallback(() => {
    dispatch({ type: "WIPE_PARAMS" });
  }, [paramsState, router, pathname]);

  const actions = useMemo<ParamsAction>(
    () => ({ updateParams, deleteParams, wipeParams }),
    [updateParams, deleteParams, wipeParams],
  );
  return (
    <ParamsContext.Provider value={paramsState}>
      <ParamsActionsContext.Provider value={actions}>
        {children}
      </ParamsActionsContext.Provider>
    </ParamsContext.Provider>
  );
}

export function useParamsActions(): ParamsAction {
  const ctx = useContext(ParamsActionsContext);
  if (!ctx)
    throw new Error("useParamsActions must be used within a ParamsProvider");
  return ctx;
}
