/* this component serves as a non-render context provider for the flow params (device type, source tokens, jornaya ids, etc.). */
import { Params } from "@/lib/flow/machine";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/** Tracking params to capture on first touch and persist for the session. */
const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
] as const;

const params = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

const ParamsContext = createContext<Params>({});
const incomingTracking: Record<string, string> = {};

for (const param of TRACKING_PARAMS) {
  const val = params.get(param);
  if (val) incomingTracking[param] = val;
}

export function useParams(initialParams: Params = {}, updateParams?: Params) {
  return useContext(ParamsContext);
}

export function ParamsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
