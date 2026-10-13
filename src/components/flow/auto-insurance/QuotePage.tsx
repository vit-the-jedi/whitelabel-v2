import { notFound } from "next/navigation";

import type { DefaultConfig } from "@/app/configs/defaultConfigs";
import { StepForm } from "./StepForm";
import { StepGuard } from "./StepGuard";

export default async function QuotePage({ config, slug }: { config: DefaultConfig; slug: string[] }) {
  const flow = config.flow;
  if (!flow) notFound();

  // slug[0] is the flow key ("quote"); slug[1] is the step id.
  const stepId = slug[1] ?? flow.startStep;
  const stepDef = flow.steps[stepId];
  if (!stepDef) notFound();

  return (
    <section>
      {/* <h1>{stepDef.title}</h1> */}
      {stepDef.description && <p>{stepDef.description}</p>}
      <StepGuard urlStepId={stepId} />

      {!stepDef.terminal && <StepForm stepId={stepId} fields={stepDef.fields} />}
    </section>
  );
}
