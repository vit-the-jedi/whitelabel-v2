import defaultConfig, { type DefaultConfig } from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

const protectComOverrides = {
  site: {
    name: "protect.com",
    title: "Protect.com",
    description: "Protect.com site configuration",
    url: "https://protect.com",
    logo: "protect_logo.png",
    nav: {
      text: "Find competitive car insurance rates in minutes",
    },
    complianceLinks: {
      privacyPolicy: "https://www.protect.com/privacy-policy/",
      terms: "https://www.protect.com/terms-and-conditions/",
      californiaPrivacy: "https://www.protect.com/california-privacy-policy/",
    },
    redirectUrl: "https://insure.protect.com",
    footerContent: [
      "Rates advertised are subject to availability and may not be available for all consumers. Rates vary based on factors such as driving history, location, vehicle type, coverage options, and other individual circumstances.",
      "The specified use of this site is to accurately connect you to a licensed insurance agent in your state who can match you and provide quotes from the auto insurance companies that best meet your needs. We are not a licensed agency or insurer and do not provide insurance or quotes for insurance. We do not represent any particular insurance carriers. We are a top online marketplace for those seeking auto insurance and as such connect you directly to licensed local agents who will provide quotes from various insurance companies licensed in your state. If you do not receive a quote from a specific insurer you were searching for we recommend that you contact that insurer or one of its agents directly to obtain a quote. We are not responsible for any actions taken by any licensed agents or insurers. Any trademarks and/or copyrighted material displayed are the property of their respective owners. Protect.com® and its logos are trademarks or registered trademarks of Digital Media Solutions, LLC. All rights reserved.",
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
    primaryColor: "#0052cc",
    secondaryColor: "#1f2937",
    fontFamily: "Nunito Sans, sans-serif",
    googleFont: "Nunito Sans",
    radioButtonColor: "#eef5fa",
  },
} satisfies DeepPartial<DefaultConfig>;

const protectComConfig: DefaultConfig = mergeConfig(
  defaultConfig,
  protectComOverrides,
);

export const subdomainConfigs: Record<string, DeepPartial<DefaultConfig>> = {
  auto: {
    site: {
      title: "Protect.com — Auto Insurance",
      form: "vehicleYear",
    },
    theme: {
      layout: "car-insurance",
    },
  },
  home: {
    site: {
      title: "Protect.com — Home Insurance",
      form: "gender",
    },
    theme: {
      layout: "default",
    },
  },
};

export default protectComConfig;
