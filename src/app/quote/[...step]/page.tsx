/**
 * Per-step page — a SERVER component.
 *
 * Brand comes from the `x-site-config` header (set by middleware), not the URL.
 * The catch-all `[...step]` maps the path segment to a step id.
 */

import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { StepForm } from "@/components/quote/StepForm";
import { StepGuard } from "@/components/quote/StepGuard";
import { getFlowConfig } from "@/lib/flow/config";
import { defaultBrand } from "@/lib/utils";
import { getConfigKeyForHost, getConfigForHost } from "@/app/configs";

export const metadata = {
  title: "Get a Quote",
  description: "Answer a few questions to get your free insurance quote.",
};

export default async function StepPage({
  params,
}: {
  params: Promise<{ step?: string[] }>;
}) {
  const headersList = await headers();
  const domainHeader =
    headersList.get("x-site-domain") ?? headersList.get("x-site-host");
  const brand =
    getConfigKeyForHost(domainHeader ?? defaultBrand) ?? defaultBrand;

  if (!brand) notFound();

  const { step } = await params;

  const config = await getFlowConfig(brand);

  // console.log({ domainHeader, brand, step, config });
  if (!config) notFound();

  const stepId = step?.[0] ?? config.startStep;
  const stepDef = config.steps[stepId];

  if (!stepDef) notFound();

  return (
    <section>
      <h1>{stepDef.title}</h1>
      {stepDef.description && <p>{stepDef.description}</p>}
      <StepGuard urlStepId={stepId} />

      {!stepDef.terminal && (
        <StepForm stepId={stepId} fields={stepDef.fields} />
      )}
    </section>
  );
}
