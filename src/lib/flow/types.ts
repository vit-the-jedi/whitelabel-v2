/**
 * Core types for the flow engine.
 *
 * The whole design rests on one idea: a brand's funnel is *data*, not a route
 * tree or a pile of components. A `FlowConfig` fully describes "which steps,
 * in what order, branching on what." Everything else (reducer, provider,
 * routes) just interprets this data, so adding/reordering a brand's steps is a
 * content change, not a code change.
 */

import type { CurrentCompany } from "./options";

export type AnswerValue = string | number | boolean | string[] | null;

/**
 * The accumulated, committed answers for a session. Single source of truth.
 * `data` is typed as the Mastodon payload so config + state + POST body all
 * share one shape — submitting is `{ source_token, data: answers.data }` with
 * no structural transform. (See MastodonData below.)
 */
export type AnswerMap = {
  data: MastodonData;
};

/* ------------------------------------------------------------------ */
/* Branching                                                           */
/* ------------------------------------------------------------------ */

/**
 * A single condition evaluated against the accumulated answers.
 * Branching lives here, in config, instead of in `if` ladders in components.
 */
export type Guard = {
  field: string;
  op: "eq" | "neq" | "in" | "gt" | "lt" | "exists";
  /** Compared against answers[field]. Omit for `exists`. */
  value?: AnswerValue;
};

/**
 * An outgoing edge from a step. Transitions are evaluated in array order;
 * the first whose guards ALL pass wins. A transition with no `when` is the
 * unconditional default — keep it last as the fallback.
 */
export type Transition = {
  to: string; // target step id
  when?: Guard[]; // ANDed together; omit = always matches
};

/* ------------------------------------------------------------------ */
/* Steps & fields                                                      */
/* ------------------------------------------------------------------ */

export type FieldKind =
  | "text"
  | "number"
  | "select"
  | "zip"
  | "boolean"
  | "radio";

type FieldDefBase = {
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Static options for `select` and `radio` fields. */
  options?: { value: string; label: string }[];
};

/**
 * A form input. Either it posts 1:1 to the schema (name must be a FlowFieldName)
 * or it's `uiOnly` — a control/display field or a piece composed into a real
 * field later (e.g. dob month/day/year -> date_of_birth) — and its name is free.
 */
export type FieldDef =
  | (FieldDefBase & { name: FlowFieldName; uiOnly?: false })
  | (FieldDefBase & { uiOnly: true; name: string });

/**
 * Buttons are *data*, like the rest of the flow config, so they must stay
 * serializable to cross the server→client boundary. Instead of a function,
 * a button names an `action` — a key into the client-side handler registry
 * (see EXTRA_BUTTON_ACTIONS in StepForm). Optionally pass a serializable
 * `payload` the handler can read.
 */
export type ExtraButtonAction = "addSecondDriver" | "markUninsured";

export type ExtraButton = {
  label: string;
  action: ExtraButtonAction;
  payload?: Record<string, AnswerValue>;
};

/**
 * An async side effect to run on submit *before* resolving `next`.
 * The resolver writes its result back into answers; `next` guards then branch
 * on that result. This is how "call the rater, then continue vs. decline"
 * stays declarative. Extend the union as you add integrations.
 */
export type ResolveKind = "feed" | "companyInfo";
export type LoaderKind =
  | "vehicleYears"
  | "vehicleMakes"
  | "vehicleModels"
  | "getFeedFromMastodon";
/**
 * Which payload entity a step writes into. Applicant fields land at
 * `data[name]`; driver/vehicle/incident fields land at
 * `data.<entity>s[cursor][name]` (cursor = the active element index).
 */
export type FlowScope = "applicant" | "driver" | "vehicle" | "incident";

/** Flat per-step values keyed by field name, as collected by the form. */
export type StepDraft = Record<string, AnswerValue>;

/** Active element index per repeatable entity (which one a scoped step writes to). */
export type Cursors = { driver: number; vehicle: number; incident: number };

export type StepDef = {
  id: string;
  /** Static heading/help shown above the form (server-rendered). */
  title: string;
  description?: string;
  /** Which payload entity this step's fields write into. Defaults to "applicant". */
  scope?: FlowScope;
  /** Fields this step collects. Drives both the form and validation. */
  fields: FieldDef[];
  /** Optional async side effect run on submit before branching. */
  resolve?: ResolveKind;
  /** Optional async loader to populate dynamic field options. */
  load?: LoaderKind;
  /** Outgoing edges. Evaluated in order; first matching guard set wins. */
  next: Transition[];
  /** Terminal steps (thank-you, decline) have no outgoing edges. */
  terminal?: boolean;
  /** extra buttons */
  extraButtons?: ExtraButton[];
};

export type FlowConfig = {
  brand: string;
  /** Step id the funnel starts on. */
  startStep: string;
  steps: Record<string, StepDef>;
};

/* ------------------------------------------------------------------ */
/* Brand + persistence                                                 */
/* ------------------------------------------------------------------ */

/**
 * The persisted draft, keyed by quoteId. Fetched server-side on load and used
 * to seed the reducer's initial state — this is the resume-from-abandonment
 * and refresh-safety story, since live context state dies on hard reload.
 */
export type Draft = {
  quoteId: string;
  brand: string;
  answers: AnswerMap;
  /** Steps the user has actually traversed, in order. */
  visited: string[];
  /** Data populated by loaders — separate from user answers. */
  fieldData: Record<string, any>[];
  currentStepId: string;
};

/* ------------------------------------------------------------------ */
/* Mastodon API payload                                                */
/* ------------------------------------------------------------------ */

/*
 * REQUIRED vs OPTIONAL: per the publisher schema, the ONLY required fields are
 * the top-level `source_token` and `data`. Every field inside `data` (and inside
 * each driver/vehicle/incident) is optional, so all are marked `?` here.
 *
 * TYPES: a real SUCCESSFUL post confirmed the data-level numerics travel as
 * numbers (bi_per_person: 100000, current_customer: 0, current_policy_expires:
 * 150), so they are typed `number` here. CAVEAT: inside vehicles[], that same
 * post sent `year` and `commute_mileage` as STRINGS while siblings were numbers
 * — the API is lenient, so those two are `number | string`.
 *
 * ENUM CASING IS NOT ENFORCED: the successful post used lowercase / non-doc
 * casing (license_status: "active", primary_use: "commute work") that would NOT
 * satisfy the doc's capitalized unions. Those two fields are therefore widened to
 * `string` with the documented choices kept in comments. Normalize casing in one
 * place if you want the canonical values.
 *
 * DATE FORMATS: date_of_birth / incident_date are "YYYY-MM-DD" (the post sent
 * "1990-03-8" — NOT zero-padded, so don't rely on padding). form_begin/form_submit
 * are "YYYY-MM-DD HH:MM:SS" (space-separated, not ISO "T"/"Z").
 *
 * Mirror this shape in state (see AnswerMap.data) so the POST body is essentially
 * `{ source_token, data }` with no structural transform.
 */

export type CreditRating = "Excellent" | "Good" | "Average" | "Below average" | "Poor";

export type MastodonDriver = {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // "YYYY-MM-DD"
  gender?: "M" | "F" | "X";
  marital_status?:
    | "Single"
    | "Married"
    | "Divorced"
    | "Separated"
    | "Widowed"
    | "Domestic Partner"
    | "Unknown";
  relationship?:
    | "self"
    | "spouse"
    | "parent"
    | "sibling"
    | "child"
    | "grandparent"
    | "grandchild"
    | "domestic partner"
    | "other";
  education?:
    | "None"
    | "High School"
    | "GED"
    | "Incomplete"
    | "Some College"
    | "Vocational"
    | "Associate"
    | "Bachelor"
    | "Master"
    | "PhD"
    | "Law"
    | "Unknown"
    | "Other Nonprofessional Degree"
    | "Other Professional Degree";
  occupation?: string; // long enum; see schema for full choice list
  credit_rating?: CreditRating;
  good_student?: boolean;
  bankruptcy?: boolean;
  sr_22?: boolean;
  license_state?: string;
  // Doc choices (capitalized): Active | Expired | International | Learner | None
  // | Other | Permit | Probation | Restricted | Revoked | Suspended | Temporary.
  // Widened to string: a successful post used "active" (lowercase).
  license_status?: string;
  suspended_reason?:
    | "Failure to pay ticket"
    | "DUI"
    | "Received too many tickets"
    | "No insurance"
    | "Other";
  first_licensed?: number; // age first licensed
  years_employed?: number;
  primary_vehicle?: number; // index into vehicles[]
};

export type MastodonVehicle = {
  year?: number | string; // doc: integer; successful post sent "2005"
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  ownership?: "finance" | "lease" | "own" | "other";
  // Doc choices (capitalized): Business | Commute School | Commute Varies |
  // Commute Work | Farm | Government | Pleasure | Other.
  // Widened to string: a successful post used "commute work" (lowercase).
  primary_use?: string;
  collision?: 0 | 50 | 100 | 250 | 500 | 1000; // deductible
  comprehensive?: 0 | 50 | 100 | 250 | 500; // deductible
  annual_mileage?: number;
  commute_mileage?: number | string; // one-way daily; post sent "4"
  commute_days?: number;
  current_mileage?: number;
  alarm?: boolean;
  auto_warranty?: boolean;
};

export type MastodonIncident = {
  type?: "ticket" | "dui" | "accident" | "claim" | "suspension";
  driver?: number; // index into drivers[]
  incident_date?: string; // "YYYY-MM-DD"
  description?: string;
  what_damaged?: "not applicable" | "property" | "people" | "both";
  amount_paid?: number;
  liability_medical_paid?: number;
  claim_at_fault?: boolean;
  accident_at_fault?: boolean;
  dui_state?: string;
};

export type MastodonData = {
  // applicant identity & contact
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_suffix?: string; // last 4 digits
  date_of_birth?: string; // "YYYY-MM-DD"
  address?: string;
  address2?: string;
  zipcode?: string;
  zipcode_fallback?: string;

  // repeatable entities (arrays => support 2+ each; cap is a UI concern, not the wire)
  drivers?: MastodonDriver[];
  vehicles?: MastodonVehicle[];
  incidents?: MastodonIncident[];

  // current coverage
  currently_insured?: boolean;
  // Union derived from CURRENT_COMPANY_OPTIONS so form choices + value type stay in sync.
  current_company?: CurrentCompany;
  current_employer?: string;
  current_customer?: number; // months insured
  continuous_coverage?: number; // months continuously insured
  current_policy_started?: number; // days since started
  current_policy_expires?: number; // days until expires
  current_policy_started_months?: number;
  current_policy_expires_months?: number;
  coverage_type?:
    | "State Minimum"
    | "Standard Protection"
    | "Superior Protection"
    | "Basic";
  credit_rating?: CreditRating;

  // desired coverage (dollar amounts)
  bi_per_person?: number;
  bi_per_incident?: number;
  property_damage?: number;
  bundle_insurance?: boolean;

  // household / misc qualifiers
  home_ownership?: boolean;
  home_garage?: boolean;
  home_length?: number; // months at residence
  military_affiliation?: boolean;

  // consent / compliance (TCPA, lead certification)
  tcpa_url?: string;
  tcpa_disclosure?: string;
  tcpa_sms_consent?: boolean;
  tcpa_call_consent?: boolean;
  tcpa_one_to_one_consent?: boolean;
  trusted_form_certificate_id?: string;
  universal_lead_id?: string; // Jornaya lead id

  // attribution / tracking
  coreg?: boolean;
  external_id?: string;
  source_url?: string;
  ip_address?: string;
  user_agent?: string;
  form_begin?: string; // ISO timestamp
  form_submit?: string; // ISO timestamp
  sub_1?: string;
  sub_2?: string;
  sub_3?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  /**
   * Passthrough bag of click/attribution + session identifiers. Open-ended:
   * the index signature tolerates the many keys that vary by integration
   * (sub1..sub8, fbc/fbp, gbraid/wbraid, impressure_*, etc.). Known keys are
   * listed for autocomplete.
   */
  custom?: MastodonCustom;
};

export type MastodonCustom = {
  pub?: string;
  cid?: string;
  gclid?: string;
  msclkid?: string;
  fbc?: string;
  fbp?: string;
  fbclid?: string;
  clickid?: string;
  rtclid?: string;
  campaignid?: string;
  ueid?: string;
  variant?: string;
  survey_name?: string;
  referrer?: string;
  device_type?: string;
  hostname?: string;
  impressure_session_id?: string;
  parent_user_session_id?: string;
  impressure_user_id?: string;
  impressure_updated_date?: string;
  mastodon_auction_id?: string;
  mastodon_click_id?: string;
  publisher_click_id?: string;
  affiliate_auction_id?: string;
  adgroupid?: string;
  accountid?: string;
  targetid?: string;
  gbraid?: string;
  wbraid?: string;
  segment?: string;
  network?: string;
  tcpa_auction?: string;
  /** Tolerate integration-specific keys (sub1..sub8, ga_*, etc.). */
  [key: string]: string | number | boolean | null | undefined;
};

/**
 * The full request body. Only `source_token` and `data` are required.
 * `exclusive` toggles exclusive vs shared bids (omit/null = both).
 * `sync_integration` ("true"/"false" as a STRING, per a successful post) and
 * `limit` (max bids) appear on real sync posts.
 */
export type MastodonPayload = {
  source_token: string;
  data: MastodonData;
  exclusive?: boolean | null;
  sync_integration?: string;
  limit?: number;
};

/* ------------------------------------------------------------------ */
/* Derived field names (single source of truth for step field.name)    */
/* ------------------------------------------------------------------ */

/**
 * Keys of T whose value is a scalar (string/number/boolean). Drops the
 * array/object members (drivers, vehicles, incidents, custom) that aren't
 * directly collectible form inputs. `-?` strips the optional modifier and
 * NonNullable peels `undefined` so `number | string` still counts as scalar.
 */
type ScalarKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends object ? never : K;
}[keyof T];

export type ApplicantField = ScalarKeys<MastodonData>;
export type DriverField = ScalarKeys<MastodonDriver>;
export type VehicleField = ScalarKeys<MastodonVehicle>;
export type IncidentField = ScalarKeys<MastodonIncident>;

/**
 * Every valid step field name, derived from the Mastodon payload so the config
 * can't reference a key that doesn't exist on the schema. (Names shared across
 * entities, e.g. `first_name`, collapse into the union — scope which entity a
 * step writes to via StepDef, not the name.)
 */
export type FlowFieldName =
  | ApplicantField
  | DriverField
  | VehicleField
  | IncidentField;
