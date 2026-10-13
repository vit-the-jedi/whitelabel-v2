/**
 * Field registry — runtime metadata for form-collectible payload fields.
 *
 * The Mastodon types in ./types are erased at build time, so they can't drive a
 * form. This registry is the runtime counterpart: one entry per field name with
 * its default input kind, label and options. Step configs pull from it with
 * `field("zipcode", { required: true })` instead of repeating kind/label, and
 * the form/validation can iterate it.
 *
 * The compiler keeps it honest against the payload types:
 *   - keys must be real FlowFieldNames (no typos, no fields the schema lacks)
 *   - `kind` must suit the field's value type (a boolean field can't be "zip")
 * Fields aren't required to be registered — only collectible ones belong here.
 */

import { CURRENT_COMPANY_OPTIONS, toFieldOptions } from "./options";
import type {
  FieldDef,
  FieldKind,
  FlowFieldName,
  FlowScope,
  LoaderKind,
  MastodonData,
  MastodonDriver,
  MastodonIncident,
  MastodonVehicle,
  StepDef,
} from "./types";

/* ------------------------------------------------------------------ */
/* Type-level checks                                                   */
/* ------------------------------------------------------------------ */

/** Entity shapes overlap on shared names (first_name, ...) with identical types. */
type AnyEntity = MastodonData & MastodonDriver & MastodonVehicle & MastodonIncident;
type ValueOf<K extends FlowFieldName> = NonNullable<AnyEntity[K]>;

/** Which input kinds make sense for a value type. select/radio fit any scalar. */
type KindsFor<V> = V extends boolean
  ? "boolean" | "radio" | "select"
  : V extends number
    ? "number" | "radio" | "select"
    : "text" | "zip" | "radio" | "select";

type FieldMeta<V> = {
  label: string;
  kind: KindsFor<V> & FieldKind;
  options?: { value: string; label: string }[];
  /**
   * Loader this field always needs (e.g. make options depend on the year). Looked
   * up by field NAME at runtime via `requiredLoader`, so a step config can't drop
   * it by overriding or hand-writing the field — it is not part of FieldDef.
   */
  loader?: LoaderKind;
  /**
   * Entity this field belongs to, for fields that only make sense on a repeatable
   * entity (vehicle/incident). Resolved by name via `resolveScope`, so a step that
   * omits `scope` still writes to `vehicles[cursor]` rather than the top level.
   * Omit for applicant/driver fields — those scope per step (names are shared).
   */
  scope?: Exclude<FlowScope, "applicant" | "driver">;
};

type FieldRegistry = { [K in FlowFieldName]?: FieldMeta<ValueOf<K>> };

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const FIELD_REGISTRY = {
  // applicant identity & contact
  first_name: { label: "First name", kind: "text" },
  last_name: { label: "Last name", kind: "text" },
  email: { label: "Email", kind: "text" },
  phone: { label: "Phone", kind: "text" },
  date_of_birth: { label: "Date of birth", kind: "text" },
  address: { label: "Street address", kind: "text" },
  address2: { label: "Apt / Unit", kind: "text" },
  zipcode: { label: "ZIP code", kind: "zip" },

  // current coverage
  currently_insured: { label: "Are you currently insured?", kind: "boolean" },
  current_company: {
    label: "Who is your insurance company?",
    kind: "radio",
    options: toFieldOptions(CURRENT_COMPANY_OPTIONS),
  },
  coverage_type: {
    label: "Coverage type",
    kind: "radio",
    options: [
      { value: "State Minimum", label: "State Minimum" },
      { value: "Standard Protection", label: "Standard Protection" },
      { value: "Superior Protection", label: "Superior Protection" },
      { value: "Basic", label: "Basic" },
    ],
  },
  credit_rating: {
    label: "Credit rating",
    kind: "select",
    options: [
      { value: "Excellent", label: "Excellent" },
      { value: "Good", label: "Good" },
      { value: "Average", label: "Average" },
      { value: "Below average", label: "Below average" },
      { value: "Poor", label: "Poor" },
    ],
  },

  // household
  home_ownership: { label: "Do you own your home?", kind: "boolean" },
  military_affiliation: { label: "Military affiliation?", kind: "boolean" },
  bundle_insurance: { label: "Bundle with home insurance?", kind: "boolean" },

  // driver
  gender: {
    label: "Gender",
    kind: "radio",
    options: [
      { value: "M", label: "Male" },
      { value: "F", label: "Female" },
      { value: "X", label: "Non-binary" },
    ],
  },
  marital_status: {
    label: "Marital status",
    kind: "select",
    options: [
      { value: "Single", label: "Single" },
      { value: "Married", label: "Married" },
      { value: "Divorced", label: "Divorced" },
      { value: "Separated", label: "Separated" },
      { value: "Widowed", label: "Widowed" },
      { value: "Domestic Partner", label: "Domestic Partner" },
    ],
  },
  good_student: { label: "Good student?", kind: "boolean" },
  sr_22: { label: "Do you need an SR-22?", kind: "boolean" },

  // vehicle
  year: { label: "Year", kind: "select", loader: "vehicleYears", scope: "vehicle" },
  make: { label: "Make", kind: "select", loader: "vehicleMakes", scope: "vehicle" },
  model: { label: "Model", kind: "select", loader: "vehicleModels", scope: "vehicle" },
  vin: { label: "VIN", kind: "text", scope: "vehicle" },
  ownership: {
    label: "Ownership",
    kind: "radio",
    scope: "vehicle",
    options: [
      { value: "own", label: "Own" },
      { value: "finance", label: "Finance" },
      { value: "lease", label: "Lease" },
      { value: "other", label: "Other" },
    ],
  },
  annual_mileage: { label: "Annual mileage", kind: "number", scope: "vehicle" },
  alarm: { label: "Anti-theft alarm?", kind: "boolean", scope: "vehicle" },

  // incident
  incident_date: { label: "Incident date", kind: "text", scope: "incident" },
} satisfies FieldRegistry;

export type RegisteredField = keyof typeof FIELD_REGISTRY;

/** Every registered field name — a real runtime list (e.g. for validation/iteration). */
export const REGISTERED_FIELDS = Object.keys(FIELD_REGISTRY) as RegisteredField[];

/**
 * Build a step FieldDef from the registry, overriding per step as needed:
 *   field("zipcode", { required: true })
 *   field("email", { label: "Where should we send your quote?", required: true })
 * `loader` and `scope` are deliberately not copied onto the def (see requiredLoader / resolveScope).
 */
export function field(name: RegisteredField, overrides: Partial<Omit<FieldDef, "name" | "uiOnly">> = {}): FieldDef {
  const { loader: _loader, scope: _scope, ...meta } = FIELD_REGISTRY[name] as FieldMeta<unknown>;
  return { name, ...meta, ...overrides } as FieldDef;
}

/**
 * The loader a step is obliged to run, derived from its fields' registry entries.
 * Takes precedence over `step.load`, so it can't be removed or swapped in config.
 * A step needing two different loaders is a config bug (one loader per step).
 */
export function requiredLoader(step: Pick<StepDef, "fields">): LoaderKind | undefined {
  const kinds = new Set<LoaderKind>();
  for (const f of step.fields) {
    const loader = (FIELD_REGISTRY as FieldRegistry)[f.name as FlowFieldName]?.loader;
    if (loader) kinds.add(loader);
  }
  if (kinds.size > 1 && process.env.NODE_ENV !== "production") {
    console.warn("[fields] step needs multiple loaders; using the first:", [...kinds]);
  }
  return kinds.values().next().value;
}

/**
 * The entity a step writes into. A field bound to an entity in the registry
 * (year -> vehicle) decides it; otherwise the step's own `scope`, else applicant.
 */
export function resolveScope(step: Pick<StepDef, "fields" | "scope">): FlowScope {
  for (const f of step.fields) {
    const scope = (FIELD_REGISTRY as FieldRegistry)[f.name as FlowFieldName]?.scope;
    if (scope) return scope;
  }
  return step.scope ?? "applicant";
}
