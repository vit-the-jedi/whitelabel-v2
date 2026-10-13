import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { Vertical } from "@/app/configs/verticals";

export type FlowPageComponent = ComponentType<any>;
export type FlowPagesByKey = Record<string, FlowPageComponent>;

export const FlowMap: Partial<Record<Vertical, FlowPagesByKey>> = {
  jobs: {
    job: dynamic<any>(() => import("@/components/flow/jobs/JobSubmit").then((m) => m.default)),
  },
  "auto-insurance": {
    quote: dynamic<any>(() => import("@/components/flow/auto-insurance/QuotePage").then((m) => m.default)),
  },
};

export const getFlowPagesForVertical = (vertical: Vertical): FlowPagesByKey | null => {
  return FlowMap[vertical] ?? null;
};

export const resolveFlowPage = (vertical: Vertical, slug: string[]): FlowPageComponent | null => {
  const pagesForVertical = getFlowPagesForVertical(vertical);
  if (!pagesForVertical) return null;

  const pageKey = slug[0];
  if (!pageKey) return null;

  return pagesForVertical[pageKey] ?? null;
};
