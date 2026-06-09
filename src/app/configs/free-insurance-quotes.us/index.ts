import defaultConfig, { type DefaultConfig } from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

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
      zip: {
        id: "zip",
        title: "Where do you live?",
        fields: [
          { name: "zip", label: "ZIP code", kind: "zip", required: true },
        ],
        resolve: "vehicleYears",
        next: [{ to: "vehicle-year" }],
      },
      "vehicle-year": {
        id: "vehicle-year",
        title: "Tell us your vehicle's model year",
        fields: [
          {
            name: "year",
            label: "Year",
            kind: "radio",
            required: true,
            optionsFrom: "vehicleYears",
          },
        ],
        resolve: "vehicleMakes",
        next: [{ to: "vehicle-make" }],
      },
      "vehicle-make": {
        id: "vehicle-make",
        title: "Tell us your vehicle's make",
        fields: [
          {
            name: "make",
            label: "Make",
            kind: "radio",
            required: true,
            optionsFrom: "vehicleMakes",
          },
        ],
        resolve: "vehicleModels",
        next: [{ to: "vehicle-model" }],
      },
      "vehicle-model": {
        id: "vehicle-model",
        title: "Tell us your vehicle's model",
        fields: [
          {
            name: "model",
            label: "Model",
            kind: "radio",
            required: true,
            optionsFrom: "vehicleModels",
          },
        ],
        next: [{ to: "contact" }],
      },
      contact: {
        id: "contact",
        title: "How can we reach you?",
        fields: [
          { name: "email", label: "Email", kind: "text", required: true },
          { name: "phone", label: "Phone", kind: "text", required: true },
        ],
        next: [{ to: "thankyou" }],
        resolve: "getFeedFromMastodon",
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
            optionsFrom: "getFeedFromMastodon",
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
