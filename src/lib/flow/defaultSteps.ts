/**
 * Default flow steps derived from the field registry — one step per field, in
 * registry order. Lives in its own module (not config.ts) because
 * defaultConfigs.ts calls this at import time; config.ts imports the configs,
 * so keeping it there made a cycle that evaluated this before FIELD_REGISTRY
 * was initialized.
 */

import { FIELD_REGISTRY, field, type RegisteredField } from "./fields";
import type { StepDef } from "./types";

export function generateDefaultFlowSteps(): Record<string, StepDef> {
  const names = Object.keys(FIELD_REGISTRY) as RegisteredField[];
  const steps: Record<string, StepDef> = {};

  names.forEach((name, index) => {
    const nextName = names[index + 1];
    steps[name] = {
      id: name,
      title: FIELD_REGISTRY[name].label,
      fields: [field(name)],
      next: nextName ? [{ to: nextName }] : [],
    };
  });

  //last step needs {terminal: true} in the next:[] array
  //either that or we shove /feed page automatically at the end
  return steps;
}
