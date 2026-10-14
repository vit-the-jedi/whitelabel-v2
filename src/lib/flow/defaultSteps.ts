/**
 * Default flow steps derived from the field registry — one step per field, in
 * registry order. Lives in its own module (not config.ts) because
 * defaultConfigs.ts calls this at import time; config.ts imports the configs,
 * so keeping it there made a cycle that evaluated this before FIELD_REGISTRY
 * was initialized.
 */

import { FIELD_REGISTRY, field, type FieldRegistry, type RegisteredField } from "./fields";
import type { StepDef } from "./types";

export function generateDefaultFlowSteps(): Record<string, StepDef> {
  const names = Object.keys(FIELD_REGISTRY) as RegisteredField[];
  const steps: Record<string, StepDef> = {};

  //filter out fields marked as system only (enrichments)
  const uiFields = names.filter((name) => !(FIELD_REGISTRY as FieldRegistry)[name]?.system);

  //only register fields we want to render in the UI
  uiFields.forEach((name, index) => {
    const nextName = names[index + 1];
    steps[name] = {
      id: name,
      title: FIELD_REGISTRY[name].label,
      fields: [field(name)],
      next: nextName ? [{ to: nextName }] : [],
    };

    //override next trabnsition for the last step and force to feed
    if (index + 1 === names.length) steps[name].next = [{ to: "feed" }];
  });

  //add feed step
  steps.feed = {
    id: "feed",
    title: "feed",
    fields: [],
    terminal: true,
    next: [],
    load: "getFeedFromMastodon",
  };

  //last step needs {terminal: true} in the next:[] array
  //either that or we shove /feed page automatically at the end
  return steps;
}
