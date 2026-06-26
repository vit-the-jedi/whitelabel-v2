import defaultConfig, { type DefaultConfig } from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

import { CURRENT_COMPANY_OPTIONS, toFieldOptions } from "@/lib/flow/options";

const freeInsuranceQuotesOverrides = {
  site: {
    name: "free-insurance-quotes.us",
    title: "Free Insurance Quotes",
    description: "Free Insurance Quotes site configuration",
    url: "https://www.free-insurance-quotes.us",
    logo: "free_insurance_quotes_logo.png",
    c2cnumber: "855-979-7491",
    nav: {
      text: "Find competitive car insurance rates in minutes",
    },
    complianceLinks: {
      privacyPolicy: "https://www.free-insurance-quotes.us/privacy-policy/",
      terms: "https://www.free-insurance-quotes.us/terms-and-conditions/",
      californiaPrivacy:
        "https://www.free-insurance-quotes.us/california-privacy-policy/",
    },
    redirectUrl: "https://insure.free-insurance-quotes.us",
    footerContent: [
      "Rates advertised are subject to availability and may not be available for all consumers. Rates vary based on factors such as driving history, location, vehicle type, coverage options, and other individual circumstances.",
      "The specified use of this site is to accurately connect you to a licensed insurance agent in your state who can match you and provide quotes from the auto insurance companies that best meet your needs. We are not a licensed agency or insurer and do not provide insurance or quotes for insurance. We do not represent any particular insurance carriers. We are a top online marketplace for those seeking auto insurance and as such connect you directly to licensed local agents who will provide quotes from various insurance companies licensed in your state. If you do not receive a quote from a specific insurer you were searching for we recommend that you contact that insurer or one of its agents directly to obtain a quote. We are not responsible for any actions taken by any licensed agents or insurers. Any trademarks and/or copyrighted material displayed are the property of their respective owners. Free Insurance Quotes® and its logos are trademarks or registered trademarks of Digital Media Solutions, LLC. All rights reserved.",
    ],
    form: "vehicleYear",
  },
  features: {
    GA: {
      id: "G-XXXXXXXXXX",
      enabled: true,
      scriptUrl: "https://www.googletagmanager.com/gtag/js?id=",
    },
    GTM: {
      id: "GTM-XXXXXXXX",
      enabled: true,
      scriptUrl: "https://www.googletagmanager.com/gtm.js?id=",
    },
    ringba: {
      enabled: true,
      id: "CA4eec4c49aaae4387a32b752a6c9010c5",
      scriptUrl: "//b-js.ringba.com/",
    },
  },
  theme: {
    layout: "car-insurance",
    primaryColor: "#00619e",
    secondaryColor: "#1f2937",
    fontFamily: "Nunito Sans, sans-serif",
    googleFont: "Nunito Sans",
    radioButtonColor: "#eef5fa",
  },
  flow: {
    brand: "free-insurance-quotes",
    startStep: "zip",
    steps: {
      feed: {
        id: "feed",
        title: "Mastodon Feed",
        fields: [
          {
            name: "feed",
            label: "Mastodon feed data",
            kind: "text",
            required: false,
            uiOnly: true,
          },
        ],
        load: "getFeedFromMastodon",
        next: [{ to: "vehicle-year" }],
      },
      "vehicle-year": {
        id: "vehicle-year",
        title: "Tell us your vehicle's model year",
        scope: "vehicle",
        fields: [
          {
            name: "year",
            label: "Vehicle Year",
            kind: "radio",
            required: true,
            options: [],
          },
        ],
        load: "vehicleYears",
        next: [{ to: "vehicle-make" }],
      },
      "vehicle-make": {
        id: "vehicle-make",
        title: "Tell us your vehicle's make",
        scope: "vehicle",
        fields: [
          {
            name: "make",
            label: "Vehicle Make",
            kind: "radio",
            required: true,
            options: [],
          },
        ],
        load: "vehicleMakes",
        next: [{ to: "vehicle-model" }],
      },
      "vehicle-model": {
        id: "vehicle-model",
        title: "Tell us your vehicle's model",
        scope: "vehicle",
        fields: [
          {
            name: "model",
            label: "Vehicle Model",
            kind: "radio",
            required: true,
            options: [],
          },
        ],
        load: "vehicleModels",
        next: [{ to: "policy-expiration" }],
      },
      "date-of-birth": {
        id: "date-of-birth",
        title: "What's your birthday?",
        scope: "applicant",
        // dob_* are uiOnly parts composed into `date_of_birth` on submit.
        fields: [
          {
            name: "dob_month",
            label: "Month",
            kind: "text",
            required: true,
            uiOnly: true,
          },
          {
            name: "dob_day",
            label: "Day",
            kind: "text",
            required: true,
            uiOnly: true,
          },
          {
            name: "dob_year",
            label: "Year",
            kind: "text",
            required: true,
            uiOnly: true,
          },
        ],
        next: [
          {
            to: "2nd_driver_gender",
            when: [
              {
                field: "2nd_driver",
                op: "eq",
                value: true,
              },
            ],
          },
          { to: "zip" },
        ],
        extraButtons: [
          {
            label: "Add Second Driver",
            action: "addSecondDriver",
          },
        ],
      },

      /* ---- 2nd driver branch -------------------------------------------- */
      /* Entered only when `2nd_driver` is true (set by the Add Second Driver
         button on date-of-birth). Each step rejoins the main flow at `zip`. */
      "2nd_driver_gender": {
        id: "2nd_driver_gender",
        title: "Second driver — gender",
        scope: "driver",
        fields: [
          {
            name: "gender",
            label: "Gender",
            kind: "radio",
            required: true,
            options: [
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
            ],
          },
        ],
        next: [{ to: "2nd_driver_name" }],
      },
      "2nd_driver_name": {
        id: "2nd_driver_name",
        title: "Second driver — name",
        scope: "driver",
        fields: [
          {
            name: "first_name",
            label: "First name",
            kind: "text",
            required: true,
          },
          {
            name: "last_name",
            label: "Last name",
            kind: "text",
            required: true,
          },
        ],
        next: [{ to: "2nd_driver_dob" }],
      },
      "2nd_driver_dob": {
        id: "2nd_driver_dob",
        title: "Second driver — date of birth",
        scope: "driver",
        // dob_* are uiOnly parts composed into the driver's `date_of_birth`.
        fields: [
          {
            name: "dob_month",
            label: "Month",
            kind: "text",
            required: true,
            uiOnly: true,
          },
          {
            name: "dob_day",
            label: "Day",
            kind: "text",
            required: true,
            uiOnly: true,
          },
          {
            name: "dob_year",
            label: "Year",
            kind: "text",
            required: true,
            uiOnly: true,
          },
        ],
        next: [{ to: "zip" }],
      },

      zip: {
        id: "zip",
        title: "Where do you live?",
        scope: "applicant",
        fields: [
          { name: "zipcode", label: "ZIP code", kind: "zip", required: true },
        ],
        next: [{ to: "vehicle-year" }],
      },
      "marital-status": {
        id: "marital-status",
        title: "What's your marital status?",
        scope: "applicant",
        fields: [
          {
            name: "marital_status",
            label: "Marital status",
            kind: "radio",
            required: true,
            options: [
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
            ],
          },
        ],
        next: [{ to: "zip" }],
      },
      "policy-expiration": {
        id: "policy-expiration",
        title: "When does your current policy expire?",
        scope: "applicant",
        fields: [
          {
            name: "current_policy_expires",
            label: "Current policy expires",
            kind: "radio",
            options: [
              {
                value: "2",
                label: "1-3 months",
              },
              {
                value: "5",
                label: "4-6 months",
              },
              {
                value: "9",
                label: "7-12 months",
              },
              {
                value: "12",
                label: "1+ years",
              },
              {
                value: "0",
                label: "Currently uninsured",
              },
            ],
            required: true,
          },
        ],
        next: [{ to: "current-company" }],
      },
      "currently-insured": {
        id: "currently-insured",
        title: "Are you currently insured?",
        scope: "applicant",
        fields: [
          {
            name: "currently_insured",
            label: "Currently insured?",
            kind: "boolean",
            required: true,
          },
        ],
        next: [{ to: "current-company" }],
      },
      "current-company": {
        id: "current-company",
        title: "Who's your current insurance company?",
        scope: "applicant",
        fields: [
          {
            name: "current_company",
            label: "Current insurance company",
            kind: "radio",
            required: true,
            options: toFieldOptions(CURRENT_COMPANY_OPTIONS),
          },
        ],
        next: [{ to: "gender" }],
      },
      gender: {
        id: "gender",
        title: "What's your gender?",
        scope: "applicant",
        fields: [
          {
            name: "gender",
            label: "Gender",
            kind: "radio",
            required: true,
            options: [
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
            ],
          },
        ],
        next: [{ to: "date-of-birth" }],
      },
      contact: {
        id: "contact",
        title: "How can we reach you?",
        fields: [
          { name: "email", label: "Email", kind: "text", required: true },
          { name: "phone", label: "Phone", kind: "text", required: true },
        ],
        next: [{ to: "thankyou" }],
        load: "getFeedFromMastodon",
      },
      thankyou: {
        id: "thankyou",
        title: "Thanks — your quote is on the way!",
        fields: [
          {
            name: "feed",
            label: "Mastodon feed data",
            kind: "text",
            required: false,
            uiOnly: true,
          },
        ],
        next: [],
        terminal: true,
      },
      decline: {
        id: "decline",
        title: "We can't offer coverage in your area yet",
        fields: [],
        next: [],
        terminal: true,
      },
    },
  },
} satisfies DeepPartial<DefaultConfig>;

const freeInsuranceQuotesConfig: DefaultConfig = mergeConfig(
  defaultConfig,
  freeInsuranceQuotesOverrides,
);

export const subdomainConfigs: Record<string, DeepPartial<DefaultConfig>> = {
  apply: {
    site: {
      title: "Free Insurance Quotes — Apply Now",
      form: "gender",
      redirectUrl: "https://apply.free-insurance-quotes.us",
    },
    theme: {
      layout: "car-insurance",
    },
  },
};

export default freeInsuranceQuotesConfig;
