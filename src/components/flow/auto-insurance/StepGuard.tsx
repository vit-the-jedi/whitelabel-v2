"use client";

/**
 * StepGuard — a zero-render client wrapper so a Server Component page can
 * invoke the reconciliation hook. Renders nothing; its only job is to run
 * useStepGuard on mount/update and redirect if the URL is ahead of progress.
 */

import { useStepGuard } from "./QuoteProvider";

export function StepGuard({ urlStepId }: { urlStepId: string }) {
  useStepGuard(urlStepId);
  return null;
}
