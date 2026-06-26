/**
 * Single source for select/radio option sets.
 *
 * Each `const` array drives BOTH the runtime options shown in the form AND the
 * derived union type used to constrain the schema/draft value — so the choices
 * and the type can never drift. Add/rename a choice in one place and the union
 * updates automatically (`typeof ARR[number]["value"]`).
 *
 * Usage in a flow config step:
 *   import { CURRENT_COMPANY_OPTIONS, toFieldOptions } from "@/lib/flow/options";
 *   { name: "current_company", kind: "radio", required: true,
 *     options: toFieldOptions(CURRENT_COMPANY_OPTIONS) }
 */

/** "Who is your insurance company?" */
export const CURRENT_COMPANY_OPTIONS = [
  { value: "AAA", label: "AAA" },
  { value: "Allstate", label: "Allstate" },
  { value: "Farmers", label: "Farmers" },
  { value: "Geico", label: "Geico" },
  { value: "Liberty Mutual", label: "Liberty Mutual" },
  { value: "Nationwide", label: "Nationwide" },
  { value: "Progressive", label: "Progressive" },
  { value: "State Farm", label: "State Farm" },
  { value: "USAA", label: "USAA" },
  { value: "Mercury", label: "Mercury" },
  { value: "Travelers", label: "Travelers" },
  { value: "Other", label: "Other" },
] as const;

export type CurrentCompany = (typeof CURRENT_COMPANY_OPTIONS)[number]["value"];

/**
 * "When does your current policy expire?"
 *
 * The form collects a bucket; `months` is the representative value used to map
 * the selection onto the integer schema field `current_policy_expires_months`
 * at submit. "Currently Uninsured" is handled separately (sets
 * `currently_insured: false`), so it is not part of this option set.
 */
export const POLICY_EXPIRATION_OPTIONS = [
  { value: "1-3", label: "1-3 months", months: 3 },
  { value: "4-6", label: "4-6 months", months: 6 },
  { value: "7-12", label: "7-12 months", months: 12 },
  { value: "12+", label: "1+ years", months: 24 },
] as const;

export type PolicyExpiration =
  (typeof POLICY_EXPIRATION_OPTIONS)[number]["value"];

/** Map a bucket value back to its representative months (for the submit mapping). */
export function policyExpirationMonths(value: PolicyExpiration): number {
  return (
    POLICY_EXPIRATION_OPTIONS.find((o) => o.value === value)?.months ?? 0
  );
}

/** Narrow any option array down to the {value,label} shape FieldDef.options wants. */
export function toFieldOptions(
  opts: readonly { value: string; label: string }[],
): { value: string; label: string }[] {
  return opts.map((o) => ({ value: o.value, label: o.label }));
}
